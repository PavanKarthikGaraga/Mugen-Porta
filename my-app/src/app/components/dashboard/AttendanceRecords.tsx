"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiDownload, FiExternalLink, FiRefreshCw, FiCheckCircle,
  FiXCircle, FiClock, FiSearch, FiFilter, FiActivity, FiChevronDown, FiChevronRight,
} from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:  { label: "Pending",  color: "#D97706", bg: "#FFFBEB", icon: <FiClock       size={12} /> },
  verified: { label: "Verified", color: "#059669", bg: "#F0FDF4", icon: <FiCheckCircle size={12} /> },
  rejected: { label: "Rejected", color: "#DC2626", bg: "#FEF2F2", icon: <FiXCircle     size={12} /> },
  unsubmitted: { label: "Unsubmitted", color: "#4B5563", bg: "#F3F4F6", icon: <FiClock size={12} /> },
};

const DOMAIN_LABELS: Record<string, string> = {
  TEC: "Technology & Emerging Technologies",
  LCH: "Liberal Arts, Creative Arts & Humanities",
  ESO: "Extension and Social Outreach",
  IIE: "Innovation, Incubation & Entrepreneurship",
  HWB: "Health and Well-being",
};

const DOMAIN_COLORS: Record<string, string> = {
  TEC: "#2563EB",
  LCH: "#8B5CF6",
  ESO: "#059669",
  IIE: "#D97706",
  HWB: "#EC4899",
};

interface AttendanceSession {
  id: number;
  activity_code: string;
  activity_title: string;
  club_id: string;
  club_name: string;
  lead_username: string;
  submitted_at: string;
  status: string;
  scanned_copy_url: string | null;
  verified_by: string | null;
  verified_at: string | null;
  faculty_notes: string | null;
  present_count: number;
  absent_count: number;
  total_count: number;
  domain: string;
  category: string;
}

async function exportXlsx(rec: AttendanceSession) {
  const isUnsubmitted = rec.status === "unsubmitted";
  const fetchUrl = isUnsubmitted 
    ? `/api/dashboard/lead/samam/activities/${encodeURIComponent(rec.activity_code)}/students` 
    : `/api/attendance-records/${encodeURIComponent(rec.activity_code)}/students`;
    
  const res = await fetch(fetchUrl);
  if (!res.ok) { toast.error("Failed to fetch student data for export"); return; }
  const d = await res.json();
  const students: any[] = d.students ?? [];
  if (students.length === 0) { toast.error("No student data found"); return; }

  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Attendance");
  ws.columns = [{ width: 20 }, { width: 32 }, { width: 16 }];

  ws.mergeCells("A1:C1");
  const tc = ws.getCell("A1");
  tc.value = `${rec.activity_title} (${rec.activity_code})`;
  tc.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  tc.alignment = { horizontal: "center", vertical: "middle" };
  tc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF970003" } };
  ws.getRow(1).height = 30;

  ws.mergeCells("A2:C2");
  const ic = ws.getCell("A2");
  ic.value = `Club: ${rec.club_name}  |  Status: ${rec.status.toUpperCase()}  |  Submitted: ${new Date(rec.submitted_at).toLocaleDateString("en-IN")}`;
  ic.font = { size: 10, color: { argb: "FF6B7280" } };
  ic.alignment = { horizontal: "center" };
  ws.getRow(2).height = 16;

  const hr = ws.addRow(["Student ID", "Student Name", "Status (P/A)"]);
  hr.eachCell(c => {
    c.font = { bold: true }; c.alignment = { horizontal: "center" };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
    c.border = { top: { style: "thin", color: { argb: "FFD1D5DB" } }, bottom: { style: "thin", color: { argb: "FFD1D5DB" } }, left: { style: "thin", color: { argb: "FFD1D5DB" } }, right: { style: "thin", color: { argb: "FFD1D5DB" } } };
  });
  hr.height = 20;

  students.forEach((s: any) => {
    const isUnmarked = s.attendance_percentage === undefined || s.attendance_percentage === null;
    const absent = s.attendance_percentage === 0;
    const statusText = isUnmarked ? "" : (absent ? "A" : "P");
    const row = ws.addRow([s.username || s.student_id, s.name, statusText]);
    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).alignment = { horizontal: "left" };
    const sc = row.getCell(3);
    sc.alignment = { horizontal: "center" };
    if (!isUnmarked) {
      sc.font = { bold: true, color: { argb: "FFFFFFFF" } };
      sc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: absent ? "FFDC2626" : "FF16A34A" } };
    }
    row.eachCell(c => { c.border = { top: { style: "thin", color: { argb: "FFE5E7EB" } }, bottom: { style: "thin", color: { argb: "FFE5E7EB" } }, left: { style: "thin", color: { argb: "FFE5E7EB" } }, right: { style: "thin", color: { argb: "FFE5E7EB" } } }; });
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${rec.activity_code}_Attendance.xlsx`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast.success("Attendance sheet downloaded");
}

function Skeleton() {
  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-pulse">
      <div className="h-20 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="h-16 bg-gray-100 rounded-xl" />
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
      </div>
    </div>
  );
}

// ─── single record card ───────────────────────────────────────────────────────
function RecordCard({
  rec, role, exportingId, reviewingCode, showNotesFor, rejectNotes,
  onExport, onReview, onToggleNotes, onNoteChange,
}: {
  rec: AttendanceSession;
  role: string;
  exportingId: number | null;
  reviewingCode: string | null;
  showNotesFor: string | null;
  rejectNotes: Record<string, string>;
  onExport: (r: AttendanceSession) => void;
  onReview: (code: string, status: "verified" | "rejected") => void;
  onToggleNotes: (code: string) => void;
  onNoteChange: (code: string, val: string) => void;
}) {
  const meta = STATUS_META[rec.status];
  const presentPct = rec.total_count > 0 ? Math.round((rec.present_count / rec.total_count) * 100) : 0;
  const isExporting = exportingId === rec.id;
  const barColor = presentPct >= 75 ? "#059669" : presentPct >= 50 ? "#D97706" : "#DC2626";
  const isReviewing = reviewingCode === rec.activity_code;
  const canReview = (role === "admin" || role === "faculty" || role === "council") && rec.status === "pending";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-0.5" style={{ backgroundColor: meta?.color ?? "#9CA3AF" }} />
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900">{rec.activity_title}</span>
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{rec.activity_code}</span>
              {meta && (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: meta.bg, color: meta.color }}
                >
                  {meta.icon} {meta.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-500">
              <span className="font-medium">{rec.club_name}</span>
              {rec.submitted_at && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>Submitted {new Date(rec.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </>
              )}
              {rec.verified_at && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>Verified {new Date(rec.verified_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </>
              )}
            </div>

            {rec.total_count > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-400">
                    {rec.present_count} present · {rec.absent_count} absent · {rec.total_count} total
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: barColor }}>{presentPct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${presentPct}%`, backgroundColor: barColor }} />
                </div>
              </div>
            )}

            {rec.faculty_notes && (
              <p className="mt-2 text-xs text-gray-500 italic">&quot;{rec.faculty_notes}&quot;</p>
            )}

            {/* Reject notes input */}
            {showNotesFor === rec.activity_code && (
              <div className="mt-3 flex flex-wrap gap-2 items-start">
                <input
                  type="text"
                  placeholder="Rejection reason (optional)"
                  value={rejectNotes[rec.activity_code] ?? ""}
                  onChange={e => onNoteChange(rec.activity_code, e.target.value)}
                  className="flex-1 min-w-[150px] text-xs px-3 py-2 border border-red-200 rounded-lg outline-none focus:border-red-400 bg-red-50 placeholder:text-gray-400"
                />
                <button
                  onClick={() => onReview(rec.activity_code, "rejected")}
                  disabled={isReviewing}
                  className="px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 whitespace-nowrap"
                >
                  {isReviewing ? "Rejecting…" : "Confirm Reject"}
                </button>
                <button
                  onClick={() => onToggleNotes(rec.activity_code)}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {rec.status === "unsubmitted" && role === "lead" && (
              <Link
                href={`/dashboard/lead/samam/activities/${rec.activity_code}/attendance`}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90 whitespace-nowrap justify-center"
                style={{ backgroundColor: BRAND }}
              >
                Mark Attendance <FiExternalLink size={12} />
              </Link>
            )}

            {canReview && (
              <>
                <button
                  onClick={() => onReview(rec.activity_code, "verified")}
                  disabled={isReviewing}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white rounded-lg disabled:opacity-50 whitespace-nowrap"
                  style={{ backgroundColor: "#059669" }}
                >
                  <FiCheckCircle size={12} />
                  {isReviewing ? "Approving…" : "Approve"}
                </button>
                <button
                  onClick={() => onToggleNotes(rec.activity_code)}
                  disabled={isReviewing}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 disabled:opacity-50 whitespace-nowrap"
                >
                  <FiXCircle size={12} /> Reject
                </button>
              </>
            )}

            {rec.status !== "unsubmitted" && ["council", "lead", "faculty"].includes(role) && (
              <Link
                href={`/dashboard/${role}/attendance/${rec.id}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                <FiExternalLink size={12} /> View Details
              </Link>
            )}

            <button
              onClick={() => onExport(rec)}
              disabled={isExporting || rec.status === "unsubmitted"}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
            >
              <FiDownload size={12} />
              {isExporting ? "Downloading…" : "Download XLSX"}
            </button>
            {rec.scanned_copy_url ? (
              <a
                href={rec.scanned_copy_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 whitespace-nowrap"
              >
                <FiExternalLink size={12} /> View Scanned PDF
              </a>
            ) : (
              <span className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg whitespace-nowrap cursor-default">
                No Scan Uploaded
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── grouped admin view ───────────────────────────────────────────────────────
function GroupedView({
  records, ...cardProps
}: {
  records: AttendanceSession[];
} & Omit<Parameters<typeof RecordCard>[0], "rec">) {
  // club_name → records
  const grouped = records.reduce<Record<string, AttendanceSession[]>>((acc, r) => {
    const club = r.club_name || r.club_id || "Unknown Club";
    if (!acc[club]) acc[club] = [];
    acc[club].push(r);
    return acc;
  }, {});

  const clubs = Object.keys(grouped).sort((a, b) => {
    // Sort by domain first, then club name
    const domainA = grouped[a][0]?.domain || "OTHER";
    const domainB = grouped[b][0]?.domain || "OTHER";
    if (domainA !== domainB) return domainA.localeCompare(domainB);
    return a.localeCompare(b);
  });
  const [openClubs, setOpenClubs] = useState<Record<string, boolean>>({});
  const toggleClub = (key: string) => setOpenClubs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-4">
      {clubs.map(club => {
        const clubRecs = grouped[club];
        const domain = clubRecs[0]?.domain || "OTHER";
        const domainColor = DOMAIN_COLORS[domain] ?? "#6B7280";
        const isClubOpen = openClubs[club] ?? true;
        const clubPending = clubRecs.filter(r => r.status === "pending").length;
        const clubVerified = clubRecs.filter(r => r.status === "verified").length;

        return (
          <div key={club} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white">
            {/* Club Header */}
            <button
              onClick={() => toggleClub(club)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left border-l-4"
              style={{ borderLeftColor: domainColor }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-800">{club}</span>
                <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: domainColor }}>
                  {domain}
                </span>
                <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {clubRecs.length} session{clubRecs.length !== 1 ? "s" : ""}
                </span>
                {clubPending > 0 && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    {clubPending} pending
                  </span>
                )}
                {clubVerified > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {clubVerified} verified
                  </span>
                )}
              </div>
              {isClubOpen
                ? <FiChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                : <FiChevronRight size={14} className="text-gray-400 flex-shrink-0" />}
            </button>

            {/* Records */}
            {isClubOpen && (
              <div className="p-3 bg-gray-50 border-t border-gray-50 space-y-3">
                {clubRecs.map(rec => (
                  <RecordCard key={rec.id} rec={rec} {...cardProps} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function AttendanceRecords({ role }: { role: "admin" | "faculty" | "lead" | "council" }) {
  const [records,      setRecords     ] = useState<AttendanceSession[]>([]);
  const [loading,      setLoading     ] = useState(true);
  const [search,       setSearch      ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [exportingId,  setExportingId ] = useState<number | null>(null);
  const [reviewingCode,setReviewingCode] = useState<string | null>(null);
  const [rejectNotes,  setRejectNotes ] = useState<Record<string, string>>({});
  const [showNotesFor, setShowNotesFor] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      if (role === "lead") {
        const [attRes, actRes] = await Promise.all([
          fetch("/api/attendance-records"),
          fetch("/api/dashboard/lead/samam/activities")
        ]);
        
        let recs: any[] = [];
        let acts: any[] = [];
        
        if (attRes.ok) recs = (await attRes.json()).records ?? [];
        if (actRes.ok) acts = (await actRes.json()).activities ?? [];

        const submittedCodes = new Set(recs.map(r => r.activity_code));
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const unsubmittedActs = acts.filter(a => {
          if (submittedCodes.has(a.code)) return false;
          if (!a.activity_date) return false;
          // If admin already locked attendance, don't show as "Unsubmitted"
          // (the attendance_submissions row will appear via the API once its
          //  club_id is correctly set to the real club)
          if (a.is_attendance_locked) return false;
          const actDate = new Date(a.activity_date);
          actDate.setHours(0, 0, 0, 0);
          return actDate < today;
        }).map(a => ({
          id: -Math.random(), // fake id for unsubmitted
          activity_code: a.code,
          activity_title: a.title,
          club_id: a.club_id || "",
          club_name: a.domain + " - " + (a.category || "General"),
          lead_username: "",
          submitted_at: "",
          status: "unsubmitted",
          scanned_copy_url: null,
          verified_by: null,
          verified_at: null,
          faculty_notes: null,
          present_count: 0,
          absent_count: 0,
          total_count: 0,
          domain: a.domain || "",
          category: a.category || "",
        }));

        setRecords([...unsubmittedActs, ...recs]);
      } else {
        const res = await fetch("/api/attendance-records");
        if (res.ok) {
          const d = await res.json();
          setRecords(d.records ?? []);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRecords(); }, []);

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.activity_title.toLowerCase().includes(q)
      || r.activity_code.toLowerCase().includes(q)
      || r.club_name.toLowerCase().includes(q)
      || (r.domain && r.domain.toLowerCase().includes(q));
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchDomain = domainFilter === "all" || r.domain === domainFilter;
    return matchSearch && matchStatus && matchDomain;
  });

  const counts: Record<string, number> = {
    all:      records.length,
    pending:  records.filter(r => r.status === "pending").length,
    verified: records.filter(r => r.status === "verified").length,
    rejected: records.filter(r => r.status === "rejected").length,
    unsubmitted: records.filter(r => r.status === "unsubmitted").length,
  };

  const handleExport = async (rec: AttendanceSession) => {
    setExportingId(rec.id);
    try { await exportXlsx(rec); } finally { setExportingId(null); }
  };

  const handleReview = async (code: string, status: "verified" | "rejected") => {
    setReviewingCode(code);
    try {
      const notes = rejectNotes[code] ?? "";
      const res = await fetch(`/api/attendance-records/${encodeURIComponent(code)}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: notes || undefined }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error ?? "Failed to update"); return; }
      toast.success(status === "verified" ? "Attendance approved" : "Attendance rejected");
      setShowNotesFor(null);
      setRejectNotes(prev => { const n = { ...prev }; delete n[code]; return n; });
      setRecords(prev => prev.map(r =>
        r.activity_code === code ? { ...r, status } : r
      ));
    } catch {
      toast.error("Network error");
    } finally {
      setReviewingCode(null);
    }
  };

  const handleToggleNotes = (code: string) =>
    setShowNotesFor(prev => (prev === code ? null : code));

  const handleNoteChange = (code: string, val: string) =>
    setRejectNotes(prev => ({ ...prev, [code]: val }));

  if (loading && records.length === 0) return <Skeleton />;

  const roleLabel = ({ admin: "Admin", faculty: "Faculty", lead: "Club Lead", council: "Council" } as Record<string, string>)[role];

  const cardProps = {
    role, exportingId, reviewingCode, showNotesFor, rejectNotes,
    onExport: handleExport,
    onReview: handleReview,
    onToggleNotes: handleToggleNotes,
    onNoteChange: handleNoteChange,
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1" style={{ backgroundColor: BRAND }} />
        <div className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Attendance Records</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {roleLabel} view · {role === "admin" ? "Grouped by domain and club" : "Download attendance sheets and scanned copies by session"}
            </p>
          </div>
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-60"
            style={{ backgroundColor: BRAND }}
          >
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sessions", value: counts.all,      color: "#6B7280" },
          { label: "Pending",        value: counts.pending,  color: "#D97706" },
          { label: "Verified",       value: counts.verified, color: "#059669" },
          { label: "Rejected",       value: counts.rejected, color: "#DC2626" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
        {/* Top Row: Search */}
        <div className="flex items-center gap-2 w-full max-w-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <FiSearch size={13} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by activity, club, domain…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-xs flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <FiFilter size={12} className="text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-400 mr-1 uppercase">Status</span>
            {(["all", "pending", "verified", "rejected", ...(role === "lead" ? ["unsubmitted"] : [])] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-colors ${
                  statusFilter === f ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={statusFilter === f ? { backgroundColor: f === "all" ? BRAND : STATUS_META[f]?.color } : {}}
              >
                {f === "all" ? "All" : STATUS_META[f].label} ({counts[f]})
              </button>
            ))}
          </div>

          {/* Domain Filter (Only Admin) */}
          {role === "admin" && (
            <div className="flex items-center gap-1.5 flex-wrap pl-4 border-l border-gray-200">
              <FiActivity size={12} className="text-gray-400" />
              <span className="text-[11px] font-semibold text-gray-400 mr-1 uppercase">Domain</span>
              {["all", "TEC", "LCH", "ESO", "IIE", "HWB"].map(d => {
                const label = d === "all" ? "All" : d;
                return (
                  <button
                    key={d}
                    onClick={() => setDomainFilter(d)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-colors ${
                      domainFilter === d ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Records */}
      {records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <FiActivity size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No attendance records yet</p>
          <p className="text-xs text-gray-400 mt-1">Records appear after leads submit attendance for verification</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-sm text-gray-400">No records match your search</p>
        </div>
      ) : role === "admin" ? (
        <GroupedView records={filtered} {...cardProps} />
      ) : (
        <div className="space-y-3">
          {filtered.map(rec => (
            <RecordCard key={rec.id} rec={rec} {...cardProps} />
          ))}
        </div>
      )}
    </div>
  );
}
