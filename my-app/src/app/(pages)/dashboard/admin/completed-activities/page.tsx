"use client";
import { useState, useEffect, useCallback } from "react";
import { FiCheckCircle, FiXCircle, FiUsers, FiCalendar, FiMapPin, FiFilter, FiRefreshCw, FiDownload, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { toast } from "sonner";
import { generateActivityReportPdf } from "@/lib/activityReportPdf";
import { SDG_MAP } from "@/app/Data/activities-mock";
import { usePersistedState } from "@/lib/hooks/usePersistedState";

const DOMAIN_COLORS: Record<string, string> = {
  TEC: "#0284c7", LCH: "#7c3aed", ESO: "#ea580c", IIE: "#059669", HWB: "#e11d48",
};
const DOMAIN_LABELS: Record<string, string> = {
  TEC: "Technical", LCH: "Liberal Arts & Cultural", ESO: "Extension & Society",
  IIE: "Innovation & Entrepreneurship", HWB: "Health & Wellbeing",
};
const DOMAIN_ORDER = ["TEC", "ESO", "LCH", "IIE", "HWB"];

function formatDate(val: any) {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return String(val).slice(0, 10); }
}

function AttendancePill({ present, total }: { present: number; total: number }) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const color = pct >= 75 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626";
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color }}>
      <span>{present}/{total}</span>
      <span className="text-gray-400 font-normal">({pct}%)</span>
    </span>
  );
}

const NO_CLUB = "__none__";
type SortOrder = "newest" | "oldest";

function sortActivities(acts: any[], order: SortOrder) {
  // Activities without a date always go last, whichever way we sort.
  return [...acts].sort((a, b) => {
    const ta = a.activity_date ? new Date(a.activity_date).getTime() : NaN;
    const tb = b.activity_date ? new Date(b.activity_date).getTime() : NaN;
    if (isNaN(ta) && isNaN(tb)) return String(a.code).localeCompare(String(b.code));
    if (isNaN(ta)) return 1;
    if (isNaN(tb)) return -1;
    if (ta === tb) return String(a.code).localeCompare(String(b.code));
    return order === "newest" ? tb - ta : ta - tb;
  });
}

function activityClubs(a: any): { id: string; name: string }[] {
  return a.clubs && a.clubs.length > 0 ? a.clubs : [{ id: NO_CLUB, name: "No club assigned" }];
}

function ActivityTable({
  acts, color, downloadingCode, onDownload,
}: { acts: any[]; color: string; downloadingCode: string | null; onDownload: (code: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-5 py-2.5 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Activity</th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Code</th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Category</th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-[11px] uppercase tracking-wide">
              <span className="flex items-center gap-1"><FiCalendar size={11} /> Date</span>
            </th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-[11px] uppercase tracking-wide">
              <span className="flex items-center gap-1"><FiMapPin size={11} /> Venue</span>
            </th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-[11px] uppercase tracking-wide">
              <span className="flex items-center gap-1"><FiUsers size={11} /> Present / Enrolled</span>
            </th>
            <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Report</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {acts.map((a: any) => (
            <tr key={a.code} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3">
                <span className="font-medium text-gray-900">{a.title}</span>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-[12px] px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${color}15`, color }}>
                  {a.code}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{a.category || "—"}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(a.activity_date)}</td>
              <td className="px-4 py-3 text-gray-500 text-[12px] max-w-[160px] truncate" title={a.venue}>
                {a.venue || "—"}
              </td>
              <td className="px-4 py-3">
                <AttendancePill present={a.students_present} total={a.total_enrolled} />
              </td>
              <td className="px-4 py-3">
                {a.report_status ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <FiCheckCircle size={11} /> Generated
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                    <FiXCircle size={11} /> Not generated
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {a.report_status && (
                  <button
                    onClick={() => onDownload(a.code)}
                    disabled={downloadingCode === a.code}
                    className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg text-white disabled:opacity-50 whitespace-nowrap"
                    style={{ backgroundColor: color }}
                  >
                    {downloadingCode === a.code ? <FiRefreshCw size={11} className="animate-spin" /> : <FiDownload size={11} />}
                    View / Download
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CompletedActivitiesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Filters live in sessionStorage so they survive opening a report / navigating away and back.
  const [selectedDomain, setSelectedDomain] = usePersistedState<string>("admin_completed_domain", "ALL");
  const [selectedClub, setSelectedClub] = usePersistedState<string>("admin_completed_club", "ALL");
  const [sortOrder, setSortOrder] = usePersistedState<SortOrder>("admin_completed_sort", "newest");
  const [groupByClub, setGroupByClub] = usePersistedState<boolean>("admin_completed_group_by_club", true);
  const [expandedClubs, setExpandedClubs] = usePersistedState<string[]>("admin_completed_expanded_clubs", []);
  const [search, setSearch] = usePersistedState("admin_completed_search", "");
  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/dashboard/admin/completed-activities?t=${Date.now()}`);
      if (r.ok) setData(await r.json());
    } finally { setLoading(false); }
  }, []);

  // Reuses the detail endpoint already built for the SAMAM Control
  // "Completed" tab -- it returns the full activity_reports row (gallery,
  // attendance sheets, all the text fields) plus the club name, everything
  // generateActivityReportPdf needs to re-render the same PDF client-side.
  const downloadReport = async (code: string) => {
    setDownloadingCode(code);
    try {
      const res = await fetch(`/api/dashboard/admin/samam/completed-activities?activity=${encodeURIComponent(code)}&t=${Date.now()}`);
      const data = await res.json();
      if (!res.ok || !data.report) {
        toast.error(data.message || "Report data not found");
        return;
      }
      const r = data.report;
      const activity = data.activity;
      await generateActivityReportPdf({
        clubName: activity?.club_name || "",
        activityTitle: activity?.title || "",
        activityDate: formatDate(activity?.activity_date),
        facultyName: r.faculty_name || "",
        posterUrl: r.poster_url || "",
        permissionLetterUrl: r.permission_letter_url || "",
        eventParticulars: {
          activityName: activity?.title || "",
          organizingClub: activity?.club_name || "",
          academicYear: r.academic_year || "",
          facultyIncharge: [r.faculty_name, r.faculty_id].filter(Boolean).join(" - "),
          studentLead: [r.student_lead_name, r.student_lead_id].filter(Boolean).join(" - "),
          timeSlot: r.time_slot || "",
          venue: r.venue || "",
          studentsParticipated: r.students_participated ? String(r.students_participated) : "",
          sdgsMapped: (typeof activity?.sdgs === 'string' ? JSON.parse(activity.sdgs || '[]') : (activity?.sdgs || [])).map((num: number) => `SDG ${num}: ${SDG_MAP[num]}`).join(", "),
        },
        overview: r.overview || "",
        objectives: r.objectives || "",
        proceedings: r.proceedings || "",
        keyHighlights: r.key_highlights || "",
        learningOutcomes: r.learning_outcomes || "",
        conclusion: r.conclusion || "",
        gallery: r.gallery || [],
        attendanceSheets: r.attendance_sheets || [],
      });
      toast.success("Report downloaded");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate report PDF");
    } finally {
      setDownloadingCode(null);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const allDomains: string[] = data
    ? DOMAIN_ORDER.filter(d => data.byDomain[d])
        .concat(Object.keys(data.byDomain).filter(d => !DOMAIN_ORDER.includes(d)))
    : [];

  const visibleDomains = selectedDomain === "ALL" 
    ? allDomains 
    : selectedDomain === "ALL_SAC"
    ? allDomains.filter(d => ["TEC", "LCH", "ESO", "IIE", "HWB"].includes(d))
    : allDomains.filter(d => d === selectedDomain);

  // Club options for the dropdown: clubs that have completed activities in the
  // domains currently in view, with how many activities each has.
  const clubOptions: { id: string; name: string; count: number }[] = (() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const d of visibleDomains) {
      for (const a of data?.byDomain?.[d] ?? []) {
        for (const c of activityClubs(a)) {
          const cur = map.get(c.id);
          if (cur) cur.count++;
          else map.set(c.id, { id: c.id, name: c.name, count: 1 });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.id === NO_CLUB) return 1;
      if (b.id === NO_CLUB) return -1;
      return a.name.localeCompare(b.name);
    });
  })();

  // If the chosen club has no activities in the current domain selection, treat it as "All".
  const effectiveClub = selectedClub !== "ALL" && !clubOptions.some(c => c.id === selectedClub) ? "ALL" : selectedClub;

  const filterActivities = (acts: any[]) => {
    const q = search.trim().toLowerCase();
    return acts.filter(a => {
      if (effectiveClub !== "ALL" && !activityClubs(a).some(c => c.id === effectiveClub)) return false;
      if (!q) return true;
      return (
        a.title?.toLowerCase().includes(q) ||
        a.code?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        activityClubs(a).some(c => c.name?.toLowerCase().includes(q))
      );
    });
  };

  // Group a domain's (already filtered) activities by club. Activities mapped to
  // several clubs appear under each of them.
  const groupByClubs = (acts: any[]) => {
    const groups = new Map<string, { id: string; name: string; acts: any[] }>();
    for (const a of acts) {
      for (const c of activityClubs(a)) {
        if (effectiveClub !== "ALL" && c.id !== effectiveClub) continue;
        if (!groups.has(c.id)) groups.set(c.id, { id: c.id, name: c.name, acts: [] });
        groups.get(c.id)!.acts.push(a);
      }
    }
    return Array.from(groups.values())
      .map(g => ({ ...g, acts: sortActivities(g.acts, sortOrder) }))
      .sort((a, b) => {
        if (a.id === NO_CLUB) return 1;
        if (b.id === NO_CLUB) return -1;
        return a.name.localeCompare(b.name);
      });
  };

  // While searching or filtering to one club, show everything open so matches are visible.
  const forceOpen = search.trim() !== "" || effectiveClub !== "ALL";
  const clubKey = (domain: string, clubId: string) => `${domain}::${clubId}`;
  const isClubOpen = (domain: string, clubId: string) => forceOpen || expandedClubs.includes(clubKey(domain, clubId));
  const toggleClub = (domain: string, clubId: string) => {
    const k = clubKey(domain, clubId);
    setExpandedClubs(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  };
  const expandAllClubs = () => {
    const keys: string[] = [];
    for (const d of visibleDomains) {
      for (const g of groupByClubs(filterActivities(data?.byDomain?.[d] ?? []))) keys.push(clubKey(d, g.id));
    }
    setExpandedClubs(keys);
  };
  const collapseAllClubs = () => setExpandedClubs([]);

  const summary = data?.domainSummary ?? [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-gray-900 flex items-center gap-2">
            <FiCheckCircle className="text-emerald-600" size={20} />
            Completed Activities
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Activities where attendance has been locked by a lead
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 text-[13px] border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Domain summary KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {DOMAIN_ORDER.filter(d => data?.byDomain[d]).map(domain => {
            const s = summary.find((x: any) => x.domain === domain);
            const color = DOMAIN_COLORS[domain] ?? "#6b7280";
            const isSelected = selectedDomain === domain;
            return (
              <button
                key={domain}
                onClick={() => setSelectedDomain(isSelected ? "ALL" : domain)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected ? "shadow-md" : "border-gray-200 hover:border-gray-300"
                }`}
                style={isSelected ? { borderColor: color, backgroundColor: `${color}10` } : {}}
              >
                <div className="text-[11px] font-semibold tracking-wider uppercase mb-1" style={{ color }}>
                  {domain}
                </div>
                <div className="text-2xl font-bold text-gray-900">{s?.count ?? 0}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {s?.students_present ?? 0} students attended
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search activity or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <FiFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedDomain("ALL")}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-full border transition-colors ${
              selectedDomain === "ALL"
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            All Domains
          </button>
          <button
            onClick={() => setSelectedDomain("ALL_SAC")}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-full border transition-colors ${
              selectedDomain === "ALL_SAC"
                ? "bg-gray-900 text-white border-gray-900"
                : "text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            ALL SAC
          </button>
          {allDomains.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDomain(selectedDomain === d ? "ALL" : d)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-full border transition-colors ${
                selectedDomain === d ? "text-white" : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              style={selectedDomain === d ? { backgroundColor: DOMAIN_COLORS[d] ?? "#374151", borderColor: DOMAIN_COLORS[d] ?? "#374151" } : {}}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Club / sort / grouping controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-[12px] text-gray-500">
          Club
          <select
            value={effectiveClub}
            onChange={e => setSelectedClub(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 max-w-[260px]"
          >
            <option value="ALL">All clubs ({clubOptions.length})</option>
            {clubOptions.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.count})</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-[12px] text-gray-500">
          Sort by date
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as SortOrder)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="newest">Newest to oldest</option>
            <option value="oldest">Oldest to newest</option>
          </select>
        </label>

        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-[12px] font-medium">
          <button
            onClick={() => setGroupByClub(true)}
            className={`px-3 py-2 transition-colors ${groupByClub ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Group by club
          </button>
          <button
            onClick={() => setGroupByClub(false)}
            className={`px-3 py-2 border-l border-gray-200 transition-colors ${!groupByClub ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Flat list
          </button>
        </div>

        {groupByClub && (
          <div className="flex items-center gap-3 text-[12px]">
            <button onClick={expandAllClubs} className="text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline">Expand all</button>
            <button onClick={collapseAllClubs} className="text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline">Collapse all</button>
          </div>
        )}

        {(effectiveClub !== "ALL" || search || selectedDomain !== "ALL" || sortOrder !== "newest") && (
          <button
            onClick={() => { setSelectedClub("ALL"); setSearch(""); setSelectedDomain("ALL"); setSortOrder("newest"); }}
            className="text-[12px] text-red-700 hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Domain sections */}
      {loading ? (
        <div className="space-y-6">
          {[1,2].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="h-12 bg-gray-50 border-b border-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                {[1,2,3].map(j => <div key={j} className="h-10 bg-gray-100 rounded animate-pulse" />)}
              </div>
            </div>
          ))}
        </div>
      ) : !data || data.total === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiCheckCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-[15px] font-medium text-gray-500">No completed activities yet</p>
          <p className="text-[13px] mt-1">Activities will appear here after a lead locks attendance.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleDomains.map(domain => {
            const acts = sortActivities(filterActivities(data.byDomain[domain] ?? []), sortOrder);
            if (!acts.length) return null;
            const color = DOMAIN_COLORS[domain] ?? "#6b7280";
            const totalPresent = acts.reduce((s: number, a: any) => s + a.students_present, 0);
            const totalEnrolled = acts.reduce((s: number, a: any) => s + a.total_enrolled, 0);

            return (
              <div key={domain} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Domain header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100"
                  style={{ backgroundColor: `${color}08` }}>
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[14px] font-semibold text-gray-900">
                      {domain}
                      <span className="text-[12px] font-normal text-gray-500 ml-2">
                        — {DOMAIN_LABELS[domain] ?? domain}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-gray-500">
                    <span className="font-medium" style={{ color }}>{acts.length} activities</span>
                    <span>{totalPresent}/{totalEnrolled} students attended</span>
                  </div>
                </div>

                {groupByClub ? (
                  <div className="divide-y divide-gray-100">
                    {groupByClubs(acts).map(g => {
                      const open = isClubOpen(domain, g.id);
                      const gPresent = g.acts.reduce((n: number, a: any) => n + a.students_present, 0);
                      const gEnrolled = g.acts.reduce((n: number, a: any) => n + a.total_enrolled, 0);
                      return (
                        <div key={g.id}>
                          <button
                            onClick={() => toggleClub(domain, g.id)}
                            aria-expanded={open}
                            className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              {open ? <FiChevronDown size={15} className="text-gray-500 shrink-0" /> : <FiChevronRight size={15} className="text-gray-500 shrink-0" />}
                              <span className={`text-[13px] font-semibold truncate ${g.id === NO_CLUB ? "text-gray-500 italic" : "text-gray-900"}`}>{g.name}</span>
                            </span>
                            <span className="flex items-center gap-4 text-[12px] text-gray-500 shrink-0">
                              <span className="font-medium" style={{ color }}>{g.acts.length} {g.acts.length === 1 ? "activity" : "activities"}</span>
                              <span className="hidden sm:inline">{gPresent}/{gEnrolled} attended</span>
                            </span>
                          </button>
                          {open && (
                            <div className="border-t border-gray-100">
                              <ActivityTable acts={g.acts} color={color} downloadingCode={downloadingCode} onDownload={downloadReport} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <ActivityTable acts={acts} color={color} downloadingCode={downloadingCode} onDownload={downloadReport} />
                )}
              </div>
            );
          })}

          {visibleDomains.every(d => !filterActivities(data.byDomain[d] ?? []).length) && (
            <div className="text-center py-10 text-gray-400 text-[13px]">
              No activities match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
