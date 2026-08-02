"use client";
import { useState, useEffect, useMemo } from "react";
import {
  FiCheckSquare, FiSquare, FiAward, FiStar, FiFileText,
  FiLoader, FiCheckCircle, FiXCircle, FiClock,
} from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const DOMAIN_NAMES: Record<string, string> = {
  TEC: "Technology & Emerging Technologies",
  LCH: "Liberal Arts, Culture and Heritage",
  ESO: "Extension & Social Outreach",
  IIE: "Innovation & Entrepreneurship",
  HWB: "Health & Well-being",
};

interface StudentRow {
  username: string;
  name: string;
  enrollmentStatus: string | null;
  attendance: number;
  eligible: boolean;
  certificate: { verificationId: string; issuedOn: string; issuedByName: string } | null;
}

function Spinner() {
  return <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-red-700 animate-spin" />;
}

export default function ActivityAwardsManager() {
  const [catalogue, setCatalogue] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState("");
  const [activityCode, setActivityCode] = useState("");

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [activityInfo, setActivityInfo] = useState<{ code: string; title: string; domain: string; credits: number } | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [tab, setTab] = useState<"certificate" | "points" | "badge">("certificate");
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [badgeReason, setBadgeReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/activities").then(r => r.json()).then(d => { if (d.success) setCatalogue(d.data || []); }).catch(() => {});
    fetch("/api/dashboard/admin/samam/award-badge").then(r => r.json()).then(d => { if (d.badges) setBadges(d.badges); }).catch(() => {});
  }, []);

  const domains = useMemo(() => Array.from(new Set(catalogue.map((a: any) => a.domain).filter(Boolean))).sort() as string[], [catalogue]);
  const categories = useMemo(() => Array.from(new Set(
    catalogue.filter((a: any) => !domain || a.domain === domain).map((a: any) => a.category).filter(Boolean)
  )).sort() as string[], [catalogue, domain]);
  const activities = useMemo(() => catalogue.filter((a: any) =>
    (!domain || a.domain === domain) && (!category || a.category === category)
  ), [catalogue, domain, category]);

  useEffect(() => {
    if (!activityCode) { setStudents([]); setActivityInfo(null); setSelected(new Set()); return; }
    setLoadingStudents(true);
    fetch(`/api/dashboard/lead/samam/activities/${encodeURIComponent(activityCode)}/certificates`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStudents(d.students ?? []);
          setActivityInfo(d.activity ?? null);
          setSelected(new Set((d.students ?? []).filter((s: StudentRow) => s.eligible).map((s: StudentRow) => s.username)));
          setPointsAmount(d.activity?.credits ? String(d.activity.credits) : "");
        } else {
          toast.error(d.message || "Not authorized for this activity");
          setStudents([]); setActivityInfo(null);
        }
      })
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoadingStudents(false));
  }, [activityCode]);

  const toggle = (u: string) => setSelected(p => { const n = new Set(p); n.has(u) ? n.delete(u) : n.add(u); return n; });
  const toggleAll = () => setSelected(selected.size === students.length ? new Set() : new Set(students.map(s => s.username)));
  const eligibleCount = students.filter(s => s.eligible).length;

  const handleIssueCertificates = async () => {
    if (selected.size === 0) return toast.error("Select at least one student");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/dashboard/lead/samam/activities/${encodeURIComponent(activityCode)}/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: Array.from(selected) }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(d.message);
        if (activityInfo) {
          fetch(`/api/dashboard/lead/samam/activities/${encodeURIComponent(activityCode)}/certificates`)
            .then(r => r.json()).then(d2 => { if (d2.success) setStudents(d2.students ?? []); });
        }
      } else {
        toast.error(d.message || "Failed to issue certificates");
      }
    } catch { toast.error("Network error"); } finally { setSubmitting(false); }
  };

  const handleAwardPoints = async () => {
    if (selected.size === 0) return toast.error("Select at least one student");
    const credits = Number(pointsAmount);
    if (!Number.isFinite(credits) || credits <= 0) return toast.error("Enter a valid points amount");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/dashboard/lead/samam/activities/${encodeURIComponent(activityCode)}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: Array.from(selected), credits, reason: pointsReason || undefined }),
      });
      const d = await res.json();
      if (d.success) toast.success(d.message);
      else toast.error(d.message || "Failed to award points");
    } catch { toast.error("Network error"); } finally { setSubmitting(false); }
  };

  const handleAwardBadge = async () => {
    if (selected.size === 0) return toast.error("Select at least one student");
    if (!selectedBadge) return toast.error("Select a badge");
    setSubmitting(true);
    let ok = 0, failed = 0;
    // Leaving the reason blank falls back to a generic badge-name-based
    // line server-side. Since this flow is always scoped to one activity,
    // default it to that activity's title instead, so "Recognition For" on
    // the credential reads "Participating in <Activity Title>" rather than
    // just the badge's own name.
    const reason = badgeReason.trim() || (activityInfo ? `Participating in "${activityInfo.title}"` : undefined);
    try {
      for (const username of selected) {
        const res = await fetch("/api/dashboard/admin/samam/award-badge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, badge_id: selectedBadge, reason }),
        });
        if (res.ok) ok++; else failed++;
      }
      if (ok > 0) toast.success(`Badge awarded to ${ok} student${ok === 1 ? "" : "s"}${failed ? ` (${failed} failed)` : ""}`);
      else toast.error("Failed to award badge");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
            <FiAward size={18} style={{ color: BRAND }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Activity Awards</h1>
            <p className="text-sm text-gray-500 mt-0.5">Select an activity, review its students, then issue certificates, points, or a badge in bulk.</p>
          </div>
        </div>
      </div>

      {/* Activity picker */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Select Activity</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={domain}
            onChange={(e) => { setDomain(e.target.value); setCategory(""); setActivityCode(""); }}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors text-sm"
          >
            <option value="">All domains</option>
            {domains.map(d => <option key={d} value={d}>{d} — {DOMAIN_NAMES[d] || d}</option>)}
          </select>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setActivityCode(""); }}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors text-sm"
          >
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={activityCode}
            onChange={(e) => setActivityCode(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors text-sm"
          >
            <option value="">-- Choose an activity ({activities.length}) --</option>
            {activities.map((a: any) => <option key={a.code} value={a.code}>{a.code} — {a.title}</option>)}
          </select>
        </div>
      </div>

      {activityCode && (
        loadingStudents ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 flex items-center justify-center"><Spinner /></div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center text-sm text-gray-400">
            No students enrolled in this activity.
          </div>
        ) : (
          <>
            {/* Summary + student list */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-6 flex-wrap bg-gray-50">
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Activity</p>
                  <p className="font-bold text-gray-900 text-sm">{activityInfo?.title}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Enrolled</p>
                  <p className="font-bold text-gray-900 text-sm">{students.length}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Present / Completed</p>
                  <p className="font-bold text-emerald-600 text-sm">{eligibleCount}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Selected</p>
                  <p className="font-bold text-sm" style={{ color: BRAND }}>{selected.size}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <button onClick={toggleAll} className="flex-shrink-0">
                  {selected.size === students.length
                    ? <FiCheckSquare size={16} style={{ color: BRAND }} />
                    : selected.size > 0 ? <FiCheckSquare size={16} className="text-gray-300" /> : <FiSquare size={16} className="text-gray-300" />}
                </button>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex-1">Student</span>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24 sm:w-32 text-right">Status</span>
                <span className="hidden sm:block text-[11px] font-bold text-gray-500 uppercase tracking-wider w-28 text-right">Certificate</span>
              </div>

              <div className="divide-y divide-gray-50 max-h-[45vh] overflow-y-auto">
                {students.map(s => {
                  const isSelected = selected.has(s.username);
                  return (
                    <label key={s.username} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? "bg-red-50/40" : "hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggle(s.username)} className="w-4 h-4 rounded border-gray-300 accent-red-700 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                        <p className="text-[11px] text-gray-400">{s.username}</p>
                      </div>
                      <span className={`w-24 sm:w-32 flex-shrink-0 text-right text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center justify-end gap-1 ${
                        s.eligible ? "text-emerald-700" : s.attendance === 0 ? "text-red-600" : "text-amber-600"
                      }`}>
                        {s.eligible ? <FiCheckCircle size={11} className="flex-shrink-0" /> : s.attendance === 0 ? <FiXCircle size={11} className="flex-shrink-0" /> : <FiClock size={11} className="flex-shrink-0" />}
                        <span className="truncate">{s.eligible ? "Completed" : s.enrollmentStatus || "Pending"}</span>
                      </span>
                      {/* Certificate state is secondary — dropped on phones so the
                          student name keeps usable width. */}
                      <span className="hidden sm:block w-28 flex-shrink-0 text-right">
                        {s.certificate ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Issued</span>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Award actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {/* Labels shorten on phones so all three tabs stay on one row
                    without wrapping or truncating mid-word. */}
                <button
                  className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors ${tab === "certificate" ? "text-gray-900 border-b-2 border-red-600 bg-gray-50/50" : "text-gray-400 hover:bg-gray-50"}`}
                  onClick={() => setTab("certificate")}
                >
                  <FiFileText className="flex-shrink-0" />
                  <span className="sm:hidden">Certificate</span>
                  <span className="hidden sm:inline">Issue Certificate</span>
                </button>
                <button
                  className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors ${tab === "points" ? "text-gray-900 border-b-2 border-red-600 bg-gray-50/50" : "text-gray-400 hover:bg-gray-50"}`}
                  onClick={() => setTab("points")}
                >
                  <FiStar className="flex-shrink-0" />
                  <span className="sm:hidden">Points</span>
                  <span className="hidden sm:inline">Award Points</span>
                </button>
                <button
                  className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-colors ${tab === "badge" ? "text-gray-900 border-b-2 border-red-600 bg-gray-50/50" : "text-gray-400 hover:bg-gray-50"}`}
                  onClick={() => setTab("badge")}
                >
                  <FiAward className="flex-shrink-0" />
                  <span className="sm:hidden">Badge</span>
                  <span className="hidden sm:inline">Award Badge</span>
                </button>
              </div>

              <div className="p-6">
                {tab === "certificate" && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500">
                      Certificates are issued to the {selected.size} selected student{selected.size === 1 ? "" : "s"}. Re-issuing a student who
                      already has one for this activity is a no-op — they keep their original credential.
                    </p>
                    <button
                      onClick={handleIssueCertificates}
                      disabled={submitting || selected.size === 0}
                      className="w-full py-3 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                      style={{ backgroundColor: BRAND }}
                    >
                      {submitting ? <FiLoader className="animate-spin" /> : <><FiFileText /> Issue to {selected.size} student{selected.size === 1 ? "" : "s"}</>}
                    </button>
                  </div>
                )}

                {tab === "points" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Points Amount</label>
                        <input
                          type="number"
                          value={pointsAmount}
                          onChange={(e) => setPointsAmount(e.target.value)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors font-bold text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Reason (optional)</label>
                        <input
                          type="text"
                          placeholder={`Completed "${activityInfo?.title ?? ""}"`}
                          value={pointsReason}
                          onChange={(e) => setPointsReason(e.target.value)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAwardPoints}
                      disabled={submitting || selected.size === 0 || !pointsAmount}
                      className="w-full py-3 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                      style={{ backgroundColor: BRAND }}
                    >
                      {submitting ? <FiLoader className="animate-spin" /> : <><FiStar /> Award to {selected.size} student{selected.size === 1 ? "" : "s"}</>}
                    </button>
                  </div>
                )}

                {tab === "badge" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Select Badge</label>
                      <select
                        value={selectedBadge}
                        onChange={(e) => setSelectedBadge(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors"
                      >
                        <option value="">-- Choose a Badge --</option>
                        {badges.map(b => <option key={b.id} value={b.id}>{b.name} ({b.domain} - {b.rarity})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Reason (optional)</label>
                      <input
                        type="text"
                        value={badgeReason}
                        onChange={(e) => setBadgeReason(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-600 focus:bg-white transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleAwardBadge}
                      disabled={submitting || selected.size === 0 || !selectedBadge}
                      className="w-full py-3 text-white font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                      style={{ backgroundColor: BRAND }}
                    >
                      {submitting ? <FiLoader className="animate-spin" /> : <><FiAward /> Award to {selected.size} student{selected.size === 1 ? "" : "s"}</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
