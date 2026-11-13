"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { FiFileText, FiRefreshCw, FiEye, FiChevronDown, FiChevronRight, FiXCircle } from "react-icons/fi";
import { generateIqacActivityReportPdf } from "@/lib/activityReportPdf";
import { usePersistedState } from "@/lib/hooks/usePersistedState";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type IqacRow = {
  activity_code: string;
  title: string;
  activity_date: string | null; // YYYY-MM-DD
  report_status: string | null;
  report_pdf_url: string | null;
};

/** Academic year runs June -> May (same rule the IQAC report editor uses). */
function academicYearOf(year: number, monthIdx: number) {
  const start = monthIdx >= 5 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

function formatDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`;
}

// "26/October/2026" style used on the generated report cover.
function formatReportDate(ymd?: string | null) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${MONTH_NAMES[m - 1]}/${y}`;
}

const hasReport = (r: IqacRow) => r.report_status === "generated" || !!r.report_pdf_url;

function ReportCell({ r, busy, onView }: { r: IqacRow; busy: boolean; onView: (r: IqacRow) => void }) {
  return hasReport(r) ? (
    <button
      onClick={() => onView(r)}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 transition-colors whitespace-nowrap"
    >
      {busy ? <FiRefreshCw size={12} className="animate-spin" /> : <FiEye size={12} />}
      View Report
    </button>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 whitespace-nowrap">
      <FiXCircle size={11} /> Not generated
    </span>
  );
}

function ActivityTable({ acts, busyCode, onView }: { acts: IqacRow[]; busyCode: string | null; onView: (r: IqacRow) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-5 py-2.5 font-medium text-gray-500 text-[11px] uppercase tracking-wide w-16">S.No</th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Title</th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-[11px] uppercase tracking-wide whitespace-nowrap">Date</th>
            <th className="text-right px-5 py-2.5 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Report</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {acts.map((r, i) => (
            <tr key={r.activity_code} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 text-gray-500">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{r.title}</div>
                <div className="text-[11px] text-gray-400 font-mono">{r.activity_code}</div>
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.activity_date ? formatDate(r.activity_date) : "—"}</td>
              <td className="px-5 py-3 text-right"><ReportCell r={r} busy={busyCode === r.activity_code} onView={onView} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminIqacPage() {
  const [rows, setRows] = useState<IqacRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  // Academic years the admin has collapsed (everything is open by default).
  const [collapsedYears, setCollapsedYears] = usePersistedState<string[]>("admin_iqac_collapsed_years", []);
  // Months the admin has collapsed, stored as "<academic year>::<YYYY-MM>" (also open by default).
  const [collapsedMonths, setCollapsedMonths] = usePersistedState<string[]>("admin_iqac_collapsed_months", []);
  const [selectedYear, setSelectedYear] = usePersistedState<string>("admin_iqac_year", "ALL");
  const [selectedMonth, setSelectedMonth] = usePersistedState<string>("admin_iqac_month", "ALL");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/admin/iqac?t=${Date.now()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRows(data.activities || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load IQAC activities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Academic year (newest first) -> month (chronological from June) -> activities (by date).
  const years = useMemo(() => {
    const byYear = new Map<string, Map<string, IqacRow[]>>(); // ay -> "YYYY-MM" -> rows
    const undated: IqacRow[] = [];
    for (const r of rows) {
      if (!r.activity_date) { undated.push(r); continue; }
      const [y, m] = r.activity_date.split("-").map(Number);
      const ay = academicYearOf(y, m - 1);
      const key = `${y}-${String(m).padStart(2, "0")}`;
      if (!byYear.has(ay)) byYear.set(ay, new Map());
      const months = byYear.get(ay)!;
      if (!months.has(key)) months.set(key, []);
      months.get(key)!.push(r);
    }
    const list = Array.from(byYear.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([ay, months]) => {
        const monthList = Array.from(months.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([key, acts]) => {
            const [y, m] = key.split("-").map(Number);
            return {
              key,
              label: `${MONTH_NAMES[m - 1]} ${y}`,
              acts: [...acts].sort((a, b) =>
                (a.activity_date || "").localeCompare(b.activity_date || "") || a.activity_code.localeCompare(b.activity_code)),
            };
          });
        return { ay, months: monthList, total: monthList.reduce((n, m) => n + m.acts.length, 0) };
      });
    return { list, undated };
  }, [rows]);

  const toggleYear = (ay: string) =>
    setCollapsedYears(prev => prev.includes(ay) ? prev.filter(x => x !== ay) : [...prev, ay]);

  const monthKey = (ay: string, key: string) => `${ay}::${key}`;
  const toggleMonth = (ay: string, key: string) => {
    const k = monthKey(ay, key);
    setCollapsedMonths(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  };

  // Filters. A stored selection that no longer exists (e.g. data changed) falls back to "All".
  const effectiveYear = selectedYear !== "ALL" && !years.list.some(y => y.ay === selectedYear) ? "ALL" : selectedYear;
  const yearsInScope = effectiveYear === "ALL" ? years.list : years.list.filter(y => y.ay === effectiveYear);
  const monthOptions = yearsInScope.flatMap(y => y.months.map(m => ({ key: m.key, label: m.label, count: m.acts.length })));
  const effectiveMonth = selectedMonth !== "ALL" && !monthOptions.some(m => m.key === selectedMonth) ? "ALL" : selectedMonth;
  const filtering = effectiveYear !== "ALL" || effectiveMonth !== "ALL";

  const visibleYears = yearsInScope
    .map(y => ({
      ...y,
      months: effectiveMonth === "ALL" ? y.months : y.months.filter(m => m.key === effectiveMonth),
    }))
    .filter(y => y.months.length > 0)
    .map(y => ({ ...y, total: y.months.reduce((n, m) => n + m.acts.length, 0) }));

  const expandAll = () => { setCollapsedYears([]); setCollapsedMonths([]); };
  const collapseAll = () => {
    setCollapsedYears([]); // keep years open so the month headers stay visible
    const all: string[] = [];
    for (const y of years.list) for (const m of y.months) all.push(monthKey(y.ay, m.key));
    setCollapsedMonths(all);
  };

  const viewReport = async (r: IqacRow) => {
    // Normal path: the PDF was generated and stored by the IQAC user.
    if (r.report_pdf_url) {
      window.open(r.report_pdf_url, "_blank", "noopener,noreferrer");
      return;
    }
    // Fallback: a report marked generated before PDFs were stored. Rebuild it from the saved data.
    setBusyCode(r.activity_code);
    try {
      const res = await fetch(`/api/dashboard/admin/iqac?code=${encodeURIComponent(r.activity_code)}&t=${Date.now()}`);
      const data = await res.json();
      if (!res.ok || !data.report) throw new Error(data.error || "Report data not found");
      const a = data.activity;
      const rep = data.report;
      await generateIqacActivityReportPdf({
        activityTitle: a?.title || "",
        activityDate: formatReportDate(a?.activity_date),
        organizingEntity: rep.organizing_entity || "SAC (Student Activity Center)",
        directorName: rep.director_name || "",
        directorTitle: rep.director_title || "",
        facultyName: rep.faculty_name || "",
        facultyTitle: rep.faculty_title || "Faculty Mentor",
        posterUrl: rep.poster_url || "",
        permissionLetterUrl: rep.permission_letter_url || "",
        eventParticulars: {
          activityName: a?.title || "",
          organizingClub: rep.organizing_entity || "SAC (Student Activity Center)",
          academicYear: rep.academic_year || "",
          facultyIncharge: [rep.faculty_name, rep.faculty_id].filter(Boolean).join(" - "),
          studentLead: rep.student_lead_name || "-",
          timeSlot: rep.time_slot || "",
          venue: rep.venue || a?.venue || "",
          studentsParticipated: rep.students_participated ? String(rep.students_participated) : "",
        },
        overview: rep.overview || "",
        objectives: rep.objectives || "",
        proceedings: rep.proceedings || "",
        keyHighlights: rep.key_highlights || "",
        learningOutcomes: rep.learning_outcomes || "",
        conclusion: rep.conclusion || "",
        gallery: rep.gallery || [],
        attendanceSheets: rep.attendance_sheets || [],
      });
      toast.success("Report downloaded");
    } catch (e: any) {
      toast.error(e?.message || "Failed to open report");
    } finally {
      setBusyCode(null);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-gray-900 flex items-center gap-2">
            <FiFileText className="text-red-700" size={20} />
            IQAC
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Activities and reports from the IQAC dashboard, by academic year and month
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-[13px] border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {!loading && rows.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-[12px] text-gray-500">
            Academic year
            <select
              value={effectiveYear}
              onChange={e => { setSelectedYear(e.target.value); setSelectedMonth("ALL"); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="ALL">All academic years</option>
              {years.list.map(y => <option key={y.ay} value={y.ay}>{y.ay} ({y.total})</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-[12px] text-gray-500">
            Month
            <select
              value={effectiveMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="ALL">All months</option>
              {monthOptions.map(m => <option key={m.key} value={m.key}>{m.label} ({m.count})</option>)}
            </select>
          </label>
          <div className="flex items-center gap-3 text-[12px]">
            <button onClick={expandAll} className="text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline">Expand all</button>
            <button onClick={collapseAll} className="text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline">Collapse all months</button>
          </div>
          {filtering && (
            <button
              onClick={() => { setSelectedYear("ALL"); setSelectedMonth("ALL"); }}
              className="text-[12px] text-red-700 hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiFileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-[15px] font-medium text-gray-500">No IQAC activities yet</p>
          <p className="text-[13px] mt-1">Activities added from the IQAC dashboard will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleYears.map(({ ay, months, total }) => {
            const open = !collapsedYears.includes(ay);
            return (
              <div key={ay} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleYear(ay)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left bg-red-50/60 hover:bg-red-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {open ? <FiChevronDown size={16} className="text-red-700" /> : <FiChevronRight size={16} className="text-red-700" />}
                    <span className="text-[15px] font-semibold text-gray-900">Academic Year {ay}</span>
                  </span>
                  <span className="text-[12px] font-medium text-red-700">{total} {total === 1 ? "activity" : "activities"}</span>
                </button>
                {open && (
                  <div className="divide-y divide-gray-100">
                    {months.map(m => {
                      // A month picked in the filter is always shown open.
                      const monthOpen = effectiveMonth !== "ALL" || !collapsedMonths.includes(monthKey(ay, m.key));
                      return (
                        <div key={m.key}>
                          <button
                            onClick={() => toggleMonth(ay, m.key)}
                            aria-expanded={monthOpen}
                            className="w-full flex items-center justify-between px-5 py-2.5 bg-gray-50 border-y border-gray-100 text-left hover:bg-gray-100 transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              {monthOpen ? <FiChevronDown size={14} className="text-gray-500" /> : <FiChevronRight size={14} className="text-gray-500" />}
                              <span className="text-[13px] font-semibold text-gray-800">{m.label}</span>
                            </span>
                            <span className="text-[11px] text-gray-500">{m.acts.length} {m.acts.length === 1 ? "activity" : "activities"}</span>
                          </button>
                          {monthOpen && <ActivityTable acts={m.acts} busyCode={busyCode} onView={viewReport} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {!filtering && years.undated.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-[13px] font-semibold text-gray-700">No date set</div>
              <ActivityTable acts={years.undated} busyCode={busyCode} onView={viewReport} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
