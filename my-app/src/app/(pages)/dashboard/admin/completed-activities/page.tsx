"use client";
import { useState, useEffect, useCallback } from "react";
import { FiCheckCircle, FiUsers, FiCalendar, FiMapPin, FiFilter, FiRefreshCw } from "react-icons/fi";

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

export default function CompletedActivitiesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard/admin/completed-activities");
      if (r.ok) setData(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const allDomains: string[] = data
    ? DOMAIN_ORDER.filter(d => data.byDomain[d])
        .concat(Object.keys(data.byDomain).filter(d => !DOMAIN_ORDER.includes(d)))
    : [];

  const visibleDomains = selectedDomain === "ALL" ? allDomains : allDomains.filter(d => d === selectedDomain);

  const filterActivities = (acts: any[]) => {
    if (!search) return acts;
    const q = search.toLowerCase();
    return acts.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      a.code?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q)
    );
  };

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
            const acts = filterActivities(data.byDomain[domain] ?? []);
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

                {/* Table */}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
