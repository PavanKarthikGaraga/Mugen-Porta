"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiEdit3, FiCheckCircle, FiClock, FiPlus, FiChevronDown, FiChevronUp, FiMessageSquare,
  FiZap, FiMoon, FiAlertCircle, FiTrendingUp, FiStar, FiFeather, FiTrash2, FiX,
} from "react-icons/fi";
import { toast } from "sonner";
import { REFLECTION_PROMPTS } from "@/app/Data/activities-mock";

const BRAND = "rgb(151,0,3)";
const API = "/api/student/journal";

// `key` is what gets stored in the database — a stable slug, not a glyph.
const MOOD_OPTIONS = [
  { key: "energised",  label: "Energised",  icon: FiZap,         color: "#DC2626" },
  { key: "reflective", label: "Reflective", icon: FiMoon,        color: "#2563EB" },
  { key: "challenged", label: "Challenged", icon: FiAlertCircle, color: "#D97706" },
  { key: "growing",    label: "Growing",    icon: FiTrendingUp,  color: "#059669" },
  { key: "excited",    label: "Excited",    icon: FiStar,        color: "#7C3AED" },
  { key: "calm",       label: "Calm",       icon: FiFeather,     color: "#0891B2" },
];
const MOOD_BY_KEY: Record<string, typeof MOOD_OPTIONS[number]> =
  Object.fromEntries(MOOD_OPTIONS.map((m) => [m.key, m]));

const EMPTY_FORM = {
  activityCode: "", mood: "growing", promptIdx: 0, content: "", tags: "",
};

export default function ReflectionJournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [activities, setActivities] = useState<{ code: string; name: string }[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null); // null + isOpen = new entry
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadEntries = useCallback(async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setEntries(data.entries || []);
      setLoadError(false);
    } catch (e) {
      console.error(e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  // Real enrolled activities for the picker, rather than the full catalogue.
  useEffect(() => {
    fetch("/api/student/activities")
      .then((r) => r.json())
      .then((d) => {
        if (!d?.success) return;
        const all = [...(d.data?.completed || []), ...(d.data?.ongoing || [])];
        setActivities(all.map((a: any) => ({ code: a.code, name: a.name || a.title })));
      })
      .catch(() => { /* picker just falls back to "General Reflection" */ });
  }, []);

  const openNew = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingId(null);
    setIsOpen(true);
    setExpanded(null);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const openEdit = (entry: any) => {
    const promptIdx = Math.max(0, REFLECTION_PROMPTS.indexOf(entry.prompt));
    setFormData({
      activityCode: entry.activityCode || "",
      mood: entry.mood || "growing",
      promptIdx,
      content: entry.content || "",
      tags: (entry.tags || []).join(", "),
    });
    setEditingId(entry.id);
    setIsOpen(true);
    setExpanded(null);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSave = async () => {
    if (!formData.content.trim()) return;
    setSaving(true);
    try {
      const activity = activities.find((a) => a.code === formData.activityCode);
      const payload = {
        activityCode: formData.activityCode || null,
        activityName: activity?.name || null,
        mood: formData.mood,
        prompt: REFLECTION_PROMPTS[formData.promptIdx],
        content: formData.content,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      const res = await fetch(API, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        toast.error(data.error || "Could not save your reflection");
        return;
      }

      if (editingId) {
        setEntries((prev) => prev.map((e) => (e.id === editingId ? data.entry : e)));
        toast.success("Reflection updated");
      } else {
        setEntries((prev) => [data.entry, ...prev]);
        toast.success("Reflection saved");
      }
      setIsOpen(false);
      setEditingId(null);
    } catch (e) {
      toast.error("Network error while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry: any) => {
    setDeletingId(entry.id);
    try {
      const res = await fetch(`${API}?id=${entry.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        toast.error(data.error || "Could not delete this reflection");
        return;
      }
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      setConfirmDelete(null);
      toast.success("Reflection deleted");
    } catch (e) {
      toast.error("Network error while deleting. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reflection Journal</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Document your learnings, insights, and growth after each activity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
              <p className="text-xs text-gray-400">Reflections</p>
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-white shadow-sm transition-all hover:shadow-md"
              style={{ backgroundColor: BRAND }}
            >
              <FiPlus size={15} />
              New Reflection
            </button>
          </div>
        </div>
      </div>

      {/* ── Editor ── */}
      {isOpen && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: BRAND }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100" style={{ backgroundColor: "rgba(151,0,3,0.04)" }}>
            <div className="flex items-center gap-2">
              <FiEdit3 size={15} style={{ color: BRAND }} />
              <p className="text-sm font-semibold" style={{ color: BRAND }}>
                {editingId ? "Edit Reflection" : "New Reflection Entry"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FiClock size={11} /> ~{readTime} min read
              </span>
              <span className="text-xs text-gray-400">{wordCount} words</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Activity picker */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Activity</label>
                <select
                  value={formData.activityCode}
                  onChange={(e) => setFormData((f) => ({ ...f, activityCode: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 text-gray-700 bg-gray-50"
                >
                  <option value="">General Reflection</option>
                  {activities.map((a) => (
                    <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
                  ))}
                </select>
                {activities.length === 0 && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Enroll in an activity to link reflections to it.
                  </p>
                )}
              </div>

              {/* Mood picker */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">How are you feeling?</label>
                <div className="flex gap-2 flex-wrap">
                  {MOOD_OPTIONS.map((m) => {
                    const isSelected = formData.mood === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => setFormData((f) => ({ ...f, mood: m.key }))}
                        title={m.label}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border-2 transition-all text-xs font-medium ${
                          isSelected ? "shadow-sm" : "border-gray-100 hover:border-gray-300 text-gray-500"
                        }`}
                        style={isSelected ? { borderColor: m.color, color: m.color, backgroundColor: `${m.color}0D` } : {}}
                      >
                        <m.icon size={14} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Prompt picker */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Reflection Prompt</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REFLECTION_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setFormData((f) => ({ ...f, promptIdx: i }))}
                    className={`text-left text-xs p-3 rounded-xl border transition-all leading-relaxed ${
                      formData.promptIdx === i
                        ? "text-white font-medium"
                        : "border-gray-100 text-gray-600 bg-gray-50 hover:border-gray-300"
                    }`}
                    style={formData.promptIdx === i ? { backgroundColor: BRAND, borderColor: BRAND } : {}}
                  >
                    &ldquo;{p}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50">
              <p className="text-xs font-semibold text-amber-800 mb-0.5">Your prompt:</p>
              <p className="text-sm text-amber-900 font-medium">&ldquo;{REFLECTION_PROMPTS[formData.promptIdx]}&rdquo;</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Your Reflection</label>
              <textarea
                ref={textareaRef}
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData((f) => ({ ...f, content: e.target.value }))}
                placeholder="Start writing… Be honest, specific, and thoughtful. Great reflections connect experience to future action."
                className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 resize-none leading-relaxed font-normal"
                style={{ "--tw-ring-color": BRAND, lineHeight: "1.8" } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData((f) => ({ ...f, tags: e.target.value }))}
                placeholder="e.g. leadership, teamwork, problem-solving"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 bg-gray-50"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => { setIsOpen(false); setEditingId(null); }}
                disabled={saving}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.content.trim() || saving}
                className="flex items-center gap-1.5 text-xs font-semibold px-5 py-2 rounded-lg text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                style={{ backgroundColor: BRAND }}
              >
                <FiCheckCircle size={12} />
                {saving ? "Saving…" : editingId ? "Update Reflection" : "Submit Reflection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Past Entries ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Past Reflections</p>
          <span className="text-xs text-gray-400">{entries.length} entries</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2" style={{ borderColor: BRAND }} />
          </div>
        ) : loadError ? (
          <div className="text-center py-12 text-gray-400">
            <FiAlertCircle size={30} className="mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">Couldn&apos;t load your reflections</p>
            <button onClick={loadEntries} className="text-xs font-semibold mt-2 hover:underline" style={{ color: BRAND }}>
              Try again
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FiEdit3 size={32} className="mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No reflections yet</p>
            <p className="text-xs text-gray-400 mt-1">Click &quot;New Reflection&quot; to start your journey.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gray-100 hidden sm:block" />

            <div className="divide-y divide-gray-50">
              {entries.map((entry) => {
                const isExpanded = expanded === entry.id;
                const moodMeta = MOOD_BY_KEY[entry.mood];
                const MoodIcon = moodMeta?.icon || FiFeather;
                const moodColor = moodMeta?.color || BRAND;
                return (
                  <div key={entry.id} className="sm:pl-4">
                    <div className="flex items-start gap-4 p-5">
                      <div
                        className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center flex-shrink-0 z-10 bg-white border-2"
                        style={{ borderColor: moodColor, color: moodColor }}
                        title={moodMeta?.label}
                      >
                        <MoodIcon size={14} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => setExpanded(isExpanded ? null : entry.id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="sm:hidden" style={{ color: moodColor }}><MoodIcon size={14} /></span>
                                <p className="text-sm font-semibold text-gray-900">{entry.activityName}</p>
                                {entry.activityCode && (
                                  <span className="text-[10px] font-mono text-gray-400">{entry.activityCode}</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{entry.date}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-400">{entry.wordCount} words</span>
                              {entry.facultyFeedback && (
                                <span className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                  <FiMessageSquare size={9} /> Feedback
                                </span>
                              )}
                              {isExpanded ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
                            </div>
                          </div>

                          {entry.prompt && (
                            <p className="text-xs text-amber-700 mt-1.5 italic">&ldquo;{entry.prompt}&rdquo;</p>
                          )}

                          <p className={`text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap ${isExpanded ? "" : "line-clamp-2"}`}>
                            {entry.content}
                          </p>
                        </button>

                        {isExpanded && (
                          <div className="mt-4 space-y-3">
                            {entry.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {entry.tags.map((t: string) => (
                                  <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {entry.facultyFeedback && (
                              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50">
                                <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                                  <FiMessageSquare size={11} /> Faculty Feedback
                                </p>
                                <p className="text-sm text-blue-900 leading-relaxed">{entry.facultyFeedback}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => openEdit(entry)}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <FiEdit3 size={11} /> Edit
                              </button>
                              <button
                                onClick={() => setConfirmDelete(entry)}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <FiTrash2 size={11} /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Delete confirmation ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-gray-900">Delete this reflection?</h3>
              <button onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              &ldquo;{confirmDelete.activityName}&rdquo; from {confirmDelete.date} will be permanently removed. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deletingId === confirmDelete.id}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deletingId === confirmDelete.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
