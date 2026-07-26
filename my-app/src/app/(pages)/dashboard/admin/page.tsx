"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiUsers, FiFolder, FiCalendar, FiFilter, FiChevronRight,
  FiRefreshCw, FiTrendingUp, FiBookOpen, FiGrid, FiCheckCircle,
  FiXCircle, FiClock, FiHome, FiCpu, FiPenTool, FiGlobe, FiZap, FiHeart, FiUser,
  FiAward, FiStar, FiBarChart2
} from "react-icons/fi";
import { handleApiError } from "@/lib/apiErrorHandler";
import { branchNames } from "@/app/Data/branches";
import StatCard from "@/app/components/dashboard/StatCard";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import ProgressCard from "@/app/components/dashboard/ProgressCard";

const BRAND = "rgb(151,0,3)";

// ── Domain metadata ────────────────────────────────────────────────────────────
const domainMeta = [
  { key: "tec", label: "Technical (TEC)",                      color: "#2563EB", icon: <FiCpu /> },
  { key: "lch", label: "Liberal & Creative Arts (LCH)",        color: "#7C3AED", icon: <FiPenTool /> },
  { key: "eso", label: "Extension & Outreach (ESO)",           color: "#D97706", icon: <FiGlobe /> },
  { key: "iie", label: "Innovation & Entrepreneurship (IIE)",  color: "#059669", icon: <FiZap /> },
  { key: "hwb", label: "Health & Well-being (HWB)",            color: "#E11D48", icon: <FiHeart /> },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubmissionStats {
  approved: number; rejected: number; pending: number;
  not_submitted: number; total: number;
}
interface BreakdownRow { [key: string]: string | number }
interface TrendDay { date: string; count: number }

interface StatsData {
  totalStudents: number;
  totalClubs: number;
  totalRegistrations: number;
  recentRegistrations: number;
  submissionStats: SubmissionStats;
  yearBreakdown:      BreakdownRow[];
  genderBreakdown:    BreakdownRow[];
  residenceBreakdown: BreakdownRow[];
  topBranches:        BreakdownRow[];
  recentTrend:        TrendDay[];
}

interface DomainStats { total: number; tec: number; lch: number; eso: number; iie: number; hwb: number }
interface ClubStat   { clubId: string; clubName: string; memberCount: number }

// ── Mini sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ trend }: { trend: TrendDay[] }) {
  if (!trend || trend.length === 0) return <p className="text-xs text-gray-400 italic">No data</p>;
  const max = Math.max(...trend.map((d) => Number(d.count)), 1);
  const W = 240, H = 48, pad = 4;
  const pts = trend.map((d, i) => {
    const x = pad + (i / Math.max(trend.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - (Number(d.count) / max) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const areaBottom = `${W - pad},${H - pad} ${pad},${H - pad}`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12">
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity="0.25" />
            <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`${pts.join(" ")} ${areaBottom}`} fill="url(#sg)" />
        <polyline points={pts.join(" ")} fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {trend.map((d, i) => {
          const [cx, cy] = pts[i].split(",").map(Number);
          return <circle key={i} cx={cx} cy={cy} r="3" fill={BRAND} />;
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {trend.map((d, i) => (
          <span key={i} className="text-[9px] text-gray-400">{new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [domainStats, setDomainStats] = useState<DomainStats>({ total: 0, tec: 0, lch: 0, eso: 0, iie: 0, hwb: 0 });
  const [clubStats, setClubStats] = useState<ClubStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllClubs, setShowAllClubs] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ domain: "all", year: "all", branch: "all", dateRange: "all" });

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (filters.domain    !== "all") q.append("domain",    filters.domain);
      if (filters.year      !== "all") q.append("year",      filters.year);
      if (filters.branch    !== "all") q.append("branch",    filters.branch);
      if (filters.dateRange !== "all") q.append("dateRange", filters.dateRange);

      const [statsRes, studentsRes] = await Promise.all([
        fetch(`/api/dashboard/admin/stats?${q}`),
        fetch(`/api/dashboard/admin/students?limit=1&${q}`),
      ]);

      if (await handleApiError(statsRes))    return;
      if (await handleApiError(studentsRes)) return;

      if (statsRes.ok)    setStats(await statsRes.json());
      if (studentsRes.ok) {
        const d = await studentsRes.json();
        if (d.success && d.data) {
          setDomainStats(d.data.stats);
          setClubStats(d.data.clubStats || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchStats(); }, [fetchStats]);


  const activeFiltersCount = Object.values(filters).filter((v) => v !== "all").length;
  const totalDomain = domainMeta.reduce((acc, d) => acc + Number(domainStats[d.key as keyof DomainStats] || 0), 0) || 1;

  // ── Derived submission stats ─────────────────────────────────────────────────
  const sub = stats?.submissionStats;
  const subTotal = Math.max(sub?.total ?? 0, 1);
  const subRows = [
    { label: "Approved",      value: sub?.approved      ?? 0, color: "#059669", icon: <FiCheckCircle size={12} /> },
    { label: "Pending",       value: sub?.pending        ?? 0, color: "#D97706", icon: <FiClock       size={12} /> },
    { label: "Rejected",      value: sub?.rejected       ?? 0, color: BRAND,     icon: <FiXCircle     size={12} /> },
    { label: "Not Submitted", value: sub?.not_submitted  ?? 0, color: "#9CA3AF", icon: <FiBookOpen    size={12} /> },
  ];

  // ── Year breakdown ────────────────────────────────────────────────────────────
  const yearOrder = ["1st", "2nd", "3rd", "4th"];
  // 1st=dark yellow, 2nd=green, 3rd=blue, 4th=red
  const yearColors = ["#B45309", "#059669", "#2563EB", "#DC2626"];
  const yearMap: Record<string, number> = {};
  (stats?.yearBreakdown ?? []).forEach((r) => { yearMap[String(r.year)] = Number(r.count); });
  const maxYear = Math.max(...yearOrder.map((y) => yearMap[y] ?? 0), 1);

  // ── Gender breakdown ──────────────────────────────────────────────────────────
  const genderMap: Record<string, number> = {};
  (stats?.genderBreakdown ?? []).forEach((r) => { genderMap[String(r.gender)] = Number(r.count); });
  const totalGender = Math.max(Object.values(genderMap).reduce((a, b) => a + b, 0), 1);
  const genderRows = [
    { label: "Male",   color: "#2563EB", icon: <FiUser size={12} className="inline mr-1" /> },
    { label: "Female", color: "#E11D48", icon: <FiUser size={12} className="inline mr-1" /> },
    { label: "Other",  color: "#7C3AED", icon: <FiUsers size={12} className="inline mr-1" /> },
  ];

  // ── Residence breakdown ───────────────────────────────────────────────────────
  const resMap: Record<string, number> = {};
  (stats?.residenceBreakdown ?? []).forEach((r) => { resMap[String(r.residenceType)] = Number(r.count); });
  const totalRes = Math.max(Object.values(resMap).reduce((a, b) => a + b, 0), 1);
  const hostelPct  = Math.round(((resMap["Hostel"]     ?? 0) / totalRes) * 100);
  const dayPct     = Math.round(((resMap["Day Scholar"] ?? 0) / totalRes) * 100);

  // ── Top branches ──────────────────────────────────────────────────────────────
  const maxBranch = Math.max(...(stats?.topBranches ?? []).map((b) => Number(b.count)), 1);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ═══ Header ════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1" style={{ backgroundColor: BRAND }} />
        <div className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Overview</h1>
            <p className="text-xs text-gray-500 mt-0.5">KL University SAC · Administrative Control Panel</p>
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${BRAND}15`, color: BRAND }}>
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active
              </span>
            )}
            <button
              onClick={() => setFiltersOpen((p) => !p)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700"
            >
              <FiFilter size={13} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: BRAND }}>
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Collapsible filters */}
        {filtersOpen && (
          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Domain */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Domain</label>
                <select
                  value={filters.domain}
                  onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                  className="w-full h-8 px-2 text-xs rounded-md border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="all">All Domains</option>
                  <option value="TEC">Technical (TEC)</option>
                  <option value="LCH">Liberal Arts, Creative Arts and Hobby (LCH)</option>
                  <option value="ESO">Extension &amp; Society Outreach (ESO)</option>
                  <option value="IIE">Innovation, Incubation &amp; Entrepreneurship (IIE)</option>
                  <option value="HWB">Health &amp; Well-being (HWB)</option>
                </select>
              </div>
              {/* Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full h-8 px-2 text-xs rounded-md border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="all">All Years</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              </div>
              {/* Branch */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Branch</label>
                <select
                  value={filters.branch}
                  onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                  className="w-full h-8 px-2 text-xs rounded-md border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="all">All Branches</option>
                  {branchNames.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
              {/* Date range */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full h-8 px-2 text-xs rounded-md border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                  <option value="all">All time</option>
                </select>
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setFilters({ domain: "all", year: "all", branch: "all", dateRange: "all" })}
                  className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>



      {/* ═══ Stat tiles ════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          icon={<FiCalendar size={16} />}
          label="Total Registrations"
          value={loading ? "—" : (stats?.totalRegistrations ?? 0).toLocaleString()}
          trend={undefined} trendUp={false}
          accent={BRAND}
        />
        <StatCard
          icon={<FiBookOpen size={16} />}
          label="Total Submissions"
          value={loading ? "—" : (stats?.submissionStats?.total ?? 0).toLocaleString()}
          trend={undefined} trendUp={false}
          accent="#2563EB"
        />
        <StatCard
          icon={<FiGrid size={16} />}
          label="Active Clubs"
          value={loading ? "—" : (stats?.totalClubs ?? 0).toLocaleString()}
          trend={undefined} trendUp={false}
          accent="#7C3AED"
        />
        <StatCard
          icon={<FiTrendingUp size={16} />}
          label="Recent (7 days)"
          value={loading ? "—" : (stats?.recentRegistrations ?? 0).toLocaleString()}
          trend="new registrations"
          trendUp={(stats?.recentRegistrations ?? 0) > 0}
          accent="#059669"
        />
        <StatCard
          icon={<FiClock size={16} />}
          label="Pending Reviews"
          value={loading ? "—" : (stats?.submissionStats?.pending ?? 0).toLocaleString()}
          trend={sub && sub.total > 0 ? `of ${sub.total} total` : undefined}
          trendUp={false}
          accent="#D97706"
        />
      </div>

      {/* ═══ Middle row: Submissions + Year distribution ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Submission status */}
        <DashboardCard
          title="Submission Status"
          subtitle="Internal activity submissions breakdown"
          action={
            <Link href="/dashboard/admin/reports" className="text-xs font-medium hover:underline flex items-center gap-0.5" style={{ color: BRAND }}>
              View all <FiChevronRight size={12} />
            </Link>
          }
        >
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-6 bg-gray-100 rounded" />)}
            </div>
          ) : sub && sub.total > 0 ? (
            <div className="space-y-3">
              {subRows.map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                      <span style={{ color: r.color }}>{r.icon}</span>
                      {r.label}
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {r.value.toLocaleString()} <span className="text-gray-400 font-normal">({Math.round((r.value / subTotal) * 100)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((r.value / subTotal) * 100)}%`, backgroundColor: r.color }}
                    />
                  </div>
                </div>
              ))}
              {/* Total pill */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Total submissions</span>
                <span className="text-sm font-bold text-gray-900">{sub.total.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic py-4 text-center">No submission data available</p>
          )}
        </DashboardCard>

        {/* Year distribution */}
        <DashboardCard
          title="Year Distribution"
          subtitle="Students by academic year"
          action={
            <Link href="/dashboard/admin/students" className="text-xs font-medium hover:underline flex items-center gap-0.5" style={{ color: BRAND }}>
              View students <FiChevronRight size={12} />
            </Link>
          }
        >
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-6 bg-gray-100 rounded" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {yearOrder.map((y, i) => {
                const count = yearMap[y] ?? 0;
                const pct   = Math.round((count / maxYear) * 100);
                return (
                  <div key={y}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{y} Year</span>
                      <span className="text-xs font-bold text-gray-900">{count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: yearColors[i] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* ═══ Third row: Trend + Gender + Residence ═════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* 7-day registration trend */}
        <DashboardCard
          title="Registration Trend"
          subtitle="New sign-ups in the last 7 days"
        >
          {loading ? (
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
          ) : (
            <Sparkline trend={stats?.recentTrend ?? []} />
          )}
        </DashboardCard>

        {/* Gender breakdown */}
        <DashboardCard title="Gender Breakdown" subtitle="Registered student demographics">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-5 bg-gray-100 rounded" />)}
            </div>
          ) : totalGender > 1 ? (
            <div className="space-y-3">
              {genderRows.map((g) => {
                const count = genderMap[g.label] ?? 0;
                const pct   = Math.round((count / totalGender) * 100);
                return (
                  <div key={g.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 flex items-center">{g.icon} {g.label}</span>
                      <span className="text-xs font-bold text-gray-900">{count.toLocaleString()} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic text-center py-4">No data</p>
          )}
        </DashboardCard>

        {/* Hostel vs Day Scholar */}
        <DashboardCard title="Residence Type" subtitle="Hostel vs Day Scholar split">
          {loading ? (
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
          ) : totalRes > 1 ? (
            <div className="space-y-4">
              {/* Split bar */}
              <div className="h-5 rounded-full overflow-hidden flex">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${hostelPct}%`, backgroundColor: "#DC2626" }}
                  title={`Hostel: ${hostelPct}%`}
                />
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${dayPct}%`, backgroundColor: "#2563EB" }}
                  title={`Day Scholar: ${dayPct}%`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center rounded-lg p-3" style={{ backgroundColor: "#DC262610" }}>
                  <FiHome size={16} className="mx-auto mb-1" style={{ color: "#DC2626" }} />
                  <div className="text-lg font-bold text-gray-900">{(resMap["Hostel"] ?? 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Hostel ({hostelPct}%)</div>
                </div>
                <div className="text-center rounded-lg p-3" style={{ backgroundColor: "#2563EB10" }}>
                  <FiUsers size={16} className="mx-auto mb-1" style={{ color: "#2563EB" }} />
                  <div className="text-lg font-bold text-gray-900">{(resMap["Day Scholar"] ?? 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Day Scholar ({dayPct}%)</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic text-center py-4">No data</p>
          )}
        </DashboardCard>
      </div>

      {/* ═══ Domain distribution ═══════════════════════════════════════════════ */}
      <DashboardCard
        title="Domain Distribution"
        subtitle="Registrations across all 5 SAMAM domains"
        action={
          <Link href="/dashboard/admin/students" className="text-xs font-medium hover:underline flex items-center gap-0.5" style={{ color: BRAND }}>
            View students <FiChevronRight size={12} />
          </Link>
        }
      >
        {/* Progress bar rows */}
        <div className="space-y-3">
          {domainMeta.map((d) => {
            const count = Number(domainStats[d.key as keyof DomainStats] || 0);
            const pct   = Math.round((count / totalDomain) * 100);
            return (
              <div key={d.key} className="flex items-center gap-3">
                <div className="w-32 flex items-center gap-2 flex-shrink-0">
                  <span className="text-base leading-none">{d.icon}</span>
                  <span className="text-xs font-semibold text-gray-600">{d.key.toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                  </div>
                </div>
                <div className="w-20 flex items-center justify-end gap-1.5 flex-shrink-0">
                  <span className="text-xs font-bold text-gray-900">{loading ? "—" : count.toLocaleString()}</span>
                  <span className="text-xs text-gray-400">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Domain mini-cards */}
        <div className="grid grid-cols-5 gap-2 mt-5">
          {domainMeta.map((d) => (
            <div key={d.key} className="rounded-lg p-3 text-center border" style={{ backgroundColor: `${d.color}10`, borderColor: `${d.color}30` }}>
              <div className="text-sm mb-0.5">{d.icon}</div>
              <div className="text-xs font-semibold" style={{ color: d.color }}>{d.key.toUpperCase()}</div>
              <div className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                {loading ? "—" : Number(domainStats[d.key as keyof DomainStats] || 0).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* ═══ Top branches + Club membership ════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top 5 branches */}
        <DashboardCard
          title="Top Branches"
          subtitle="Top 5 branches by student count"
          action={
            <Link href="/dashboard/admin/students" className="text-xs font-medium hover:underline flex items-center gap-0.5" style={{ color: BRAND }}>
              All students <FiChevronRight size={12} />
            </Link>
          }
        >
          {loading ? (
            <div className="space-y-3 animate-pulse">{[1,2,3,4,5].map((i) => <div key={i} className="h-6 bg-gray-100 rounded" />)}</div>
          ) : (stats?.topBranches ?? []).length > 0 ? (
            <div className="space-y-2.5">
              {(stats?.topBranches ?? []).map((b, i) => (
                <ProgressCard
                  key={String(b.branch)}
                  label={`${i + 1}. ${b.branch}`}
                  value={Number(b.count)}
                  max={maxBranch}
                  showPercentage={false}
                  suffix=" students"
                  color={["#2563EB","#7C3AED","#059669","#D97706",BRAND][i % 5]}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic text-center py-4">No data</p>
          )}
        </DashboardCard>

        {/* Club membership */}
        <DashboardCard
          title="Club Membership"
          subtitle={clubStats.length > 0 ? `${clubStats.length} clubs with registered members` : "Loading clubs…"}
          action={
            <Link href="/dashboard/admin/clubs" className="text-xs font-medium hover:underline flex items-center gap-0.5" style={{ color: BRAND }}>
              Manage clubs <FiChevronRight size={12} />
            </Link>
          }
        >
          {loading ? (
            <div className="grid grid-cols-3 gap-2 animate-pulse">
              {[1,2,3,4,5,6].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
            </div>
          ) : clubStats.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(showAllClubs ? clubStats : clubStats.slice(0, 6)).map((club) => (
                  <div key={club.clubId || club.clubName} className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl p-2.5 border border-gray-200 text-center">
                    <div className="w-7 h-7 rounded-lg mx-auto mb-1.5 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: BRAND }}>
                      {(club.clubName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="text-[10px] font-medium text-gray-600 truncate leading-tight">{club.clubName || "No Club"}</div>
                    <div className="text-base font-bold text-gray-900 mt-0.5">{club.memberCount || 0}</div>
                  </div>
                ))}
              </div>
              {clubStats.length > 6 && (
                <button
                  onClick={() => setShowAllClubs((p) => !p)}
                  className="mt-3 w-full text-xs font-semibold py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
                >
                  {showAllClubs ? "Show less" : `Show all ${clubStats.length} clubs`}
                </button>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-400 italic text-center py-4">No club data</p>
          )}
        </DashboardCard>
      </div>

      {/* ═══ Quick actions ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Manage Students",  icon: <FiUsers      size={18} />, href: "/dashboard/admin/students", color: "#2563EB" },
          { label: "Manage Clubs",     icon: <FiFolder     size={18} />, href: "/dashboard/admin/clubs",    color: "#7C3AED" },
          { label: "Controls",         icon: <FiTrendingUp size={18} />, href: "/dashboard/admin/controls", color: BRAND    },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col items-center gap-2 text-center group"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${item.color}15`, color: item.color }}
            >
              {item.icon}
            </div>
            <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">{item.label}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
