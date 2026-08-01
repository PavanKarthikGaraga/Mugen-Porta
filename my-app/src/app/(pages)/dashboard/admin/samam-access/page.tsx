"use client";
import { useState, useEffect, useMemo } from "react";
import { FiUnlock, FiUsers, FiChevronRight, FiAlertCircle, FiCheckSquare, FiSquare, FiTool } from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const DOMAIN_META: Record<string, { label: string; color: string; bg: string }> = {
  TEC: { label: "Technical",           color: "#2563eb", bg: "#eff6ff" },
  LCH: { label: "Cultural & Heritage", color: "#7c3aed", bg: "#f5f3ff" },
  ESO: { label: "Social Outreach",     color: "#16a34a", bg: "#f0fdf4" },
  IIE: { label: "Innovation",          color: "#d97706", bg: "#fffbeb" },
  HWB: { label: "Health & Wellbeing",  color: "#ea580c", bg: "#fff7ed" },
};

interface Club { id: string; name: string; domain: string; }
interface Student { username: string; name: string; branch: string; year: string; samam_access: number; }

export default function SamamAccessPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);

  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load all clubs on mount
  useEffect(() => {
    fetch("/api/dashboard/admin/samam-access")
      .then(r => r.json())
      .then(d => {
        if (d.success) setClubs(d.clubs);
        else toast.error("Failed to load clubs");
      })
      .catch(() => toast.error("Failed to load clubs"))
      .finally(() => setLoadingClubs(false));
  }, []);

  const domains = useMemo(() => {
    const ORDER = ["TEC", "LCH", "ESO", "IIE", "HWB"];
    const found = [...new Set(clubs.map(c => c.domain))];
    return ORDER.filter(d => found.includes(d));
  }, [clubs]);

  const clubsInDomain = useMemo(
    () => clubs.filter(c => c.domain === selectedDomain),
    [clubs, selectedDomain]
  );

  const selectDomain = (domain: string) => {
    setSelectedDomain(domain);
    setSelectedClub(null);
    setStudents([]);
    setSelected(new Set());
  };

  const selectClub = async (club: Club) => {
    setSelectedClub(club);
    setStudents([]);
    setSelected(new Set());
    setLoadingStudents(true);
    try {
      const r = await fetch(`/api/dashboard/admin/samam-access?clubId=${club.id}`);
      const d = await r.json();
      if (d.success) {
        setStudents(d.students);
        // Select all by default
        setSelected(new Set((d.students as Student[]).map(s => s.username)));
      } else {
        toast.error("Failed to load students");
      }
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleStudent = (username: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(username) ? next.delete(username) : next.add(username);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === students.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(students.map(s => s.username)));
    }
  };

  const handleUnlock = async () => {
    if (selected.size === 0) { toast.error("No students selected"); return; }
    setSaving(true);
    setShowConfirm(false);
    try {
      const res = await fetch("/api/dashboard/admin/samam-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: Array.from(selected), access: 1 }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`SAMAM unlocked for ${d.updated} student${d.updated !== 1 ? "s" : ""} ✓`);
        // Refresh student list to reflect new access status
        await selectClub(selectedClub!);
      } else {
        toast.error(d.error || "Failed to unlock SAMAM");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const alreadyUnlocked = students.filter(s => s.samam_access === 1).length;
  const pendingCount = selected.size - students.filter(s => s.samam_access === 1 && selected.has(s.username)).length;

  if (loadingClubs) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-red-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
            <FiUnlock size={18} style={{ color: BRAND }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SAMAM Access</h1>
            <p className="text-sm text-gray-500 mt-0.5">Select a domain → club → students, then unlock SAMAM dashboard access.</p>
          </div>
        </div>
      </div>

      {/* Step 1: Domain */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Step 1 — Select Domain</p>
        <div className="flex flex-wrap gap-3">
          {domains.map(domain => {
            const meta = DOMAIN_META[domain];
            const active = selectedDomain === domain;
            const count = clubs.filter(c => c.domain === domain).length;
            return (
              <button
                key={domain}
                onClick={() => selectDomain(domain)}
                className="flex flex-col items-start px-4 py-3 rounded-xl border text-sm font-semibold transition-all"
                style={active
                  ? { backgroundColor: meta.color, borderColor: meta.color, color: "#fff" }
                  : { borderColor: "#e5e7eb", color: "#374151", backgroundColor: "#fff" }
                }
              >
                <span className="font-bold">{domain}</span>
                <span className="text-[11px] font-normal mt-0.5" style={{ color: active ? "rgba(255,255,255,0.75)" : "#9ca3af" }}>
                  {meta.label} · {count} clubs
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDomain && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Step 2: Club */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Step 2 — Select Club</p>
              <p className="text-xs text-gray-500 mt-0.5">{clubsInDomain.length} clubs in {selectedDomain}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {clubsInDomain.map(club => {
                const meta = DOMAIN_META[club.domain] || DOMAIN_META.TEC;
                const isActive = selectedClub?.id === club.id;
                return (
                  <button
                    key={club.id}
                    onClick={() => selectClub(club)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                      isActive ? "text-white" : "text-gray-700 hover:bg-gray-50"
                    }`}
                    style={isActive ? { backgroundColor: meta.color } : {}}
                  >
                    <div>
                      <p className="text-sm font-semibold leading-snug">{club.name}</p>
                      <p className={`text-[11px] mt-0.5 ${isActive ? "text-white/70" : "text-gray-400"}`}>{club.id}</p>
                    </div>
                    {isActive && <FiChevronRight size={14} className="text-white/70 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Students */}
          <div className="lg:col-span-3 space-y-4">
            {!selectedClub ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
                <FiUsers size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">← Select a club to view its students</p>
              </div>
            ) : loadingStudents ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-red-700 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
                <FiUsers size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium text-sm">No students in {selectedClub.name}</p>
                <p className="text-gray-400 text-xs mt-1">Students register and select this club during sign-up.</p>
              </div>
            ) : (
              <>
                {/* Club summary bar */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-6 flex-wrap">
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Club</p>
                    <p className="font-bold text-gray-900 text-sm">{selectedClub.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Total Students</p>
                    <p className="font-bold text-gray-900 text-sm">{students.length}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Already Unlocked</p>
                    <p className="font-bold text-emerald-600 text-sm">{alreadyUnlocked}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Selected</p>
                    <p className="font-bold text-sm" style={{ color: BRAND }}>{selected.size}</p>
                  </div>
                  <div className="flex-1" />
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={selected.size === 0 || saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    style={{ backgroundColor: BRAND }}
                  >
                    <FiUnlock size={13} />
                    {saving ? "Unlocking…" : `Unlock SAMAM (${selected.size})`}
                  </button>
                </div>

                {/* Student table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Table header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <button onClick={toggleAll} className="flex-shrink-0">
                      {selected.size === students.length
                        ? <FiCheckSquare size={16} style={{ color: BRAND }} />
                        : selected.size > 0
                        ? <FiCheckSquare size={16} className="text-gray-300" />
                        : <FiSquare size={16} className="text-gray-300" />
                      }
                    </button>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex-1">Student</span>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24 hidden sm:block">Year</span>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24 text-right">Status</span>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-gray-50 max-h-[55vh] overflow-y-auto">
                    {students.map(s => {
                      const isSelected = selected.has(s.username);
                      const unlocked = s.samam_access === 1;
                      return (
                        <label
                          key={s.username}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                            isSelected ? "bg-red-50/40" : "hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudent(s.username)}
                            className="w-4 h-4 rounded border-gray-300 accent-red-700 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                            <p className="text-[11px] text-gray-400">{s.username} · {s.branch}</p>
                          </div>
                          <span className="text-xs text-gray-500 w-24 hidden sm:block">{s.year} Year</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full w-24 text-right inline-block ${
                            unlocked
                              ? "text-emerald-700 bg-emerald-50"
                              : "text-gray-500 bg-gray-100"
                          }`}>
                            {unlocked ? "Unlocked" : "Locked"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Under Development sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {["Revoke Access", "Access Audit Log"].map(title => (
          <div key={title} className="bg-white rounded-xl border border-dashed border-gray-200 p-8 flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-1">
              <FiTool size={18} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">{title}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wide">
              Under Development
            </span>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
                <FiAlertCircle size={18} style={{ color: BRAND }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Confirm SAMAM Unlock</h3>
                <p className="text-xs text-gray-500">{selectedClub?.name}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Students selected</span>
                <span className="font-bold text-gray-900">{selected.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">New unlocks</span>
                <span className="font-bold text-emerald-600">{pendingCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Already unlocked</span>
                <span className="font-bold text-gray-400">{selected.size - pendingCount}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Selected students will gain access to their SAMAM dashboard immediately after unlocking.
              Students not selected will remain locked.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                Yes, Unlock SAMAM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
