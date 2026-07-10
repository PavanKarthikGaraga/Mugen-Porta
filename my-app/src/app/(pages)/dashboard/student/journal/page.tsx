"use client";
import { useState, useEffect, useRef } from "react";
import { FiEdit3, FiCheckCircle, FiClock, FiSave, FiPlus, FiChevronDown, FiChevronUp, FiMessageSquare } from "react-icons/fi";
import { JOURNAL_ENTRIES, REFLECTION_PROMPTS, ACTIVITIES } from "@/app/Data/activities-mock";

const BRAND = "rgb(151,0,3)";

const MOOD_OPTIONS = [
  { emoji: "🔥", label: "Energised" },
  { emoji: "💙", label: "Reflective" },
  { emoji: "😤", label: "Challenged" },
  { emoji: "🌱", label: "Growing" },
  { emoji: "🎉", label: "Excited" },
  { emoji: "😌", label: "Calm" },
];

const completedActivities = ACTIVITIES.filter((a) => a.userStatus === "completed" || a.userStatus === "pending_review");

export default function ReflectionJournalPage() {
  const [entries,      setEntries]      = useState(JOURNAL_ENTRIES);
  const [activeEntry,  setActiveEntry]  = useState(null); // editing entry id
  const [isNewEntry,   setIsNewEntry]   = useState(false);
  const [expanded,     setExpanded]     = useState(null); // viewing entry id
  const [autoSaveMsg,  setAutoSaveMsg]  = useState("");

  // New / edit form state
  const [formData, setFormData] = useState({
    activityCode: "",
    mood: "🌱",
    promptIdx: 0,
    content: "",
    tags: "",
  });

  const textareaRef = useRef(null);
  const autoSaveTimer = useRef(null);

  // ── Auto-save effect ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!formData.content) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setAutoSaveMsg("Auto-saved");
      setTimeout(() => setAutoSaveMsg(""), 2000);
    }, 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [formData.content]);

  const openNew = () => {
    setFormData({ activityCode: "", mood: "🌱", promptIdx: 0, content: "", tags: "" });
    setActiveEntry(null);
    setIsNewEntry(true);
    setExpanded(null);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSave = () => {
    const activity = completedActivities.find((a) => a.code === formData.activityCode);
    const newEntry = {
      id: Date.now(),
      activityCode: formData.activityCode,
      activityName: activity?.name || "General Reflection",
      date: new Date().toISOString().split("T")[0],
      mood: formData.mood,
      prompt: REFLECTION_PROMPTS[formData.promptIdx],
      content: formData.content,
      facultyFeedback: null,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      wordCount: formData.content.split(/\s+/).filter(Boolean).length,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setIsNewEntry(false);
  };

  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
  const readTime  = Math.max(1, Math.ceil(wordCount / 200));

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

      {/* ── Journal Writing Interface ── */}
      {isNewEntry && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: BRAND }}>
          {/* Editor header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100" style={{ backgroundColor: "rgba(151,0,3,0.04)" }}>
            <div className="flex items-center gap-2">
              <FiEdit3 size={15} style={{ color: BRAND }} />
              <p className="text-sm font-semibold" style={{ color: BRAND }}>New Reflection Entry</p>
            </div>
            <div className="flex items-center gap-3">
              {autoSaveMsg && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <FiCheckCircle size={11} /> {autoSaveMsg}
                </span>
              )}
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FiClock size={11} /> ~{readTime} min read
              </span>
              <span className="text-xs text-gray-400">{wordCount} words</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Row 1: Activity + Mood */}
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
                  {completedActivities.map((a) => (
                    <option key={a.id} value={a.code}>{a.code} — {a.name}</option>
                  ))}
                </select>
              </div>

              {/* Mood picker */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">How are you feeling?</label>
                <div className="flex gap-2 flex-wrap">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.emoji}
                      onClick={() => setFormData((f) => ({ ...f, mood: m.emoji }))}
                      title={m.label}
                      className={`text-xl p-2 rounded-xl border-2 transition-all ${
                        formData.mood === m.emoji ? "scale-110 shadow-sm" : "border-gray-100 hover:border-gray-300 opacity-60"
                      }`}
                      style={formData.mood === m.emoji ? { borderColor: BRAND } : {}}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reflection Prompt picker */}
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

            {/* Selected prompt display */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50">
              <p className="text-xs font-semibold text-amber-800 mb-0.5">Your prompt:</p>
              <p className="text-sm text-amber-900 font-medium">&ldquo;{REFLECTION_PROMPTS[formData.promptIdx]}&rdquo;</p>
            </div>

            {/* Main textarea */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Your Reflection</label>
              <textarea
                ref={textareaRef}
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData((f) => ({ ...f, content: e.target.value }))}
                placeholder="Start writing… Be honest, specific, and thoughtful. Great reflections connect experience to future action."
                className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 resize-none leading-relaxed font-normal"
                style={{ "--tw-ring-color": BRAND, lineHeight: "1.8" }}
              />
            </div>

            {/* Tags */}
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

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setIsNewEntry(false)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiSave size={12} /> Save Draft
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.content.trim()}
                  className="flex items-center gap-1.5 text-xs font-semibold px-5 py-2 rounded-lg text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  style={{ backgroundColor: BRAND }}
                >
                  <FiCheckCircle size={12} /> Submit Reflection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Past Entries Timeline ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Past Reflections</p>
          <span className="text-xs text-gray-400">{entries.length} entries</span>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">✍️</p>
            <p className="text-sm font-medium text-gray-600">No reflections yet</p>
            <p className="text-xs text-gray-400 mt-1">Click &quot;New Reflection&quot; to start your journey.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gray-100 hidden sm:block" />

            <div className="divide-y divide-gray-50">
              {entries.map((entry) => {
                const isExpanded = expanded === entry.id;
                return (
                  <div key={entry.id} className="sm:pl-4">
                    <div className="flex items-start gap-4 p-5">
                      {/* Timeline orb */}
                      <div
                        className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-base flex-shrink-0 z-10 bg-white border-2"
                        style={{ borderColor: BRAND }}
                      >
                        {entry.mood}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Entry header */}
                        <button
                          onClick={() => setExpanded(isExpanded ? null : entry.id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="sm:hidden text-base">{entry.mood}</span>
                                <p className="text-sm font-semibold text-gray-900">{entry.activityName}</p>
                                <span className="text-[10px] font-mono text-gray-400">{entry.activityCode}</span>
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

                          {/* Prompt preview */}
                          <p className="text-xs text-amber-700 mt-1.5 italic">&ldquo;{entry.prompt}&rdquo;</p>

                          {/* Content preview */}
                          <p className={`text-sm text-gray-700 mt-2 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                            {entry.content}
                          </p>
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="mt-4 space-y-3">
                            {/* Tags */}
                            {entry.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {entry.tags.map((t) => (
                                  <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Faculty feedback */}
                            {entry.facultyFeedback && (
                              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50">
                                <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                                  <FiMessageSquare size={11} /> Faculty Feedback
                                </p>
                                <p className="text-sm text-blue-900 leading-relaxed">{entry.facultyFeedback}</p>
                              </div>
                            )}
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
    </div>
  );
}
