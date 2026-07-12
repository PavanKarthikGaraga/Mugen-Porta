"use client";
import { useState, useEffect, useCallback } from "react";
import {
  FiUsers, FiAward, FiStar, FiBarChart2, FiSearch, FiPlus,
  FiEdit2, FiTrash2, FiX, FiCheck, FiChevronRight, FiRefreshCw,
  FiFilter, FiZap, FiCpu, FiPenTool, FiGlobe, FiHeart,
  FiCalendar, FiClock, FiUser, FiActivity, FiChevronLeft,
  FiTrendingUp, FiGrid, FiList, FiAlertCircle, FiCheckCircle,
} from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";
const DOMAIN_COLORS: Record<string, string> = {
  TEC: "#2563EB", LCH: "#7C3AED", ESO: "#D97706", IIE: "#059669", HWB: "#E11D48",
};
const DOMAIN_ICONS: Record<string, any> = {
  TEC: <FiCpu size={12} />, LCH: <FiPenTool size={12} />, ESO: <FiGlobe size={12} />,
  IIE: <FiZap size={12} />, HWB: <FiHeart size={12} />,
};
const LEVEL_COLORS: Record<string, string> = {
  Explorer: "#CD7F32", Foundation: "#6B7280", Practitioner: "#2563EB", Leader: "#D97706",
};
const RARITY_COLORS: Record<string, string> = {
  Common: "#9CA3AF", Rare: "#2563EB", Epic: "#7C3AED", Legendary: "#D97706",
};
const TABS = [
  { key: "analytics", label: "Analytics", icon: <FiBarChart2 size={14} /> },
  { key: "students",  label: "Students",  icon: <FiUsers size={14} />     },
  { key: "activities",label: "Activities",icon: <FiActivity size={14} />  },
];

/* ─── Tiny mini-bar ─────────────────────────────────── */
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full mt-1">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

/* ─── Stat KPI card ─────────────────────────────────── */
function KPI({ icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: color }} />
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ─── Modal wrapper ─────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: any }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ─── Input helper ──────────────────────────────────── */
function Field({ label, children }: { label: string; children: any }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}
const inputCls = "w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300";
const textareaCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none";

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function SamamAdminPage() {
  const [tab, setTab] = useState("analytics");

  /* ── Analytics ── */
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  /* ── Students ── */
  const [students, setStudents] = useState<any[]>([]);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterYear, setFilterYear]   = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ── Activities ── */
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [activityForm, setActivityForm] = useState({
    title: "", description: "", domain: "TEC", activity_type: "event", points: "", max_participants: "", is_active: true,
  });
  const [actSearchStr, setActSearchStr] = useState("");

  /* ── Awards ── */
  const [badgeCatalog, setBadgeCatalog] = useState<any[]>([]);
  const [pointsForm, setPointsForm] = useState({ username: "", points: "", domain: "TEC", reason: "", category: "admin_award" });
  const [badgeForm, setBadgeForm] = useState({ username: "", badge_id: "", reason: "" });
  const [awardHistory, setAwardHistory] = useState<any[]>([]);
  const [awardLoading, setAwardLoading] = useState(false);

  /* ── Fetch analytics ── */
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/dashboard/admin/samam-stats");
      if (res.ok) setAnalytics(await res.json());
    } finally { setAnalyticsLoading(false); }
  }, []);

  /* ── Fetch students ── */
  const fetchStudents = useCallback(async (page = 1) => {
    setStudentsLoading(true);
    try {
      const q = new URLSearchParams({ page: String(page), limit: "20" });
      if (search)      q.set("search", search);
      if (filterLevel) q.set("level",  filterLevel);
      if (filterYear)  q.set("year",   filterYear);
      const res = await fetch(`/api/dashboard/admin/samam/students?${q}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setStudentsTotal(data.total || 0);
        setStudentsPage(page);
      }
    } finally { setStudentsLoading(false); }
  }, [search, filterLevel, filterYear]);

  /* ── Fetch student detail ── */
  const fetchStudentDetail = useCallback(async (username: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/dashboard/admin/samam/students/${username}`);
      if (res.ok) setStudentDetail(await res.json());
    } finally { setDetailLoading(false); }
  }, []);

  /* ── Fetch activities ── */
  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch("/api/dashboard/admin/samam/activities");
      if (res.ok) setActivities((await res.json()).activities || []);
    } finally { setActivitiesLoading(false); }
  }, []);

  /* ── Fetch badge catalog ── */
  const fetchBadgeCatalog = useCallback(async () => {
    const res = await fetch("/api/dashboard/admin/samam/award-badge");
    if (res.ok) setBadgeCatalog((await res.json()).badges || []);
  }, []);

  /* ── Initial loads ── */
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
  useEffect(() => { if (tab === "students") fetchStudents(1); }, [tab, fetchStudents]);
  useEffect(() => { if (tab === "activities") fetchActivities(); }, [tab, fetchActivities]);
  useEffect(() => { if (tab === "awards") fetchBadgeCatalog(); }, [tab, fetchBadgeCatalog]);

  /* ── Open student detail ── */
  const openStudent = async (s: any) => {
    setSelectedStudent(s);
    setStudentDetail(null);
    await fetchStudentDetail(s.username);
  };

  /* ── Create / update activity ── */
  const saveActivity = async () => {
    const url = editingActivity
      ? `/api/dashboard/admin/samam/activities/${editingActivity.id}`
      : "/api/dashboard/admin/samam/activities";
    const method = editingActivity ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...activityForm, points: Number(activityForm.points), max_participants: activityForm.max_participants ? Number(activityForm.max_participants) : null }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message || "Saved");
      setShowActivityModal(false);
      setEditingActivity(null);
      fetchActivities();
    } else toast.error(data.message || "Failed");
  };

  const deleteActivity = async (id: number) => {
    if (!confirm("Delete this activity?")) return;
    const res = await fetch(`/api/dashboard/admin/samam/activities/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) { toast.success(data.message); fetchActivities(); }
    else toast.error(data.message || "Failed");
  };

  /* ── Award points ── */
  const awardPoints = async () => {
    setAwardLoading(true);
    const res = await fetch("/api/dashboard/admin/samam/award-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...pointsForm, points: Number(pointsForm.points) }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      setPointsForm({ username: "", points: "", domain: "TEC", reason: "", category: "admin_award" });
      setAwardHistory(prev => [{ type: "points", ...pointsForm, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } else toast.error(data.message || "Failed");
    setAwardLoading(false);
  };

  /* ── Award badge ── */
  const awardBadge = async () => {
    setAwardLoading(true);
    const res = await fetch("/api/dashboard/admin/samam/award-badge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(badgeForm),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      setBadgeForm({ username: "", badge_id: "", reason: "" });
      setAwardHistory(prev => [{ type: "badge", ...badgeForm, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } else toast.error(data.message || "Failed");
    setAwardLoading(false);
  };

  const filteredActivities = activities.filter(a =>
    !actSearchStr || a.title?.toLowerCase().includes(actSearchStr.toLowerCase())
  );

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${BRAND}, #7C3AED, #2563EB, #D97706)` }} />
        <div className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiAward style={{ color: BRAND }} /> SAMAM Admin Dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Full management & analytics for the SAMAM program</p>
          </div>
          <button onClick={fetchAnalytics} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white" style={{ backgroundColor: BRAND }}>
            <FiRefreshCw size={13} className={analyticsLoading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Tab bar */}
        <div className="border-t border-gray-100 px-5 flex gap-0.5 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key ? "border-current" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              style={tab === t.key ? { color: BRAND, borderColor: BRAND } : {}}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ TAB: ANALYTICS ═══════════════════════════════════════════ */}
      {tab === "analytics" && (
        <div className="space-y-5">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPI icon={<FiUsers size={16} />}    label="Students Earning Points" value={analyticsLoading ? "—" : analytics?.sdcStats?.studentsWithCredits ?? 0}   color="#2563EB" />
            <KPI icon={<FiStar size={16} />}     label="Total SAMAM Points"      value={analyticsLoading ? "—" : analytics?.sdcStats?.totalCredits ?? 0}            color="#D97706" />
            <KPI icon={<FiAward size={16} />}    label="Badges Issued"           value={analyticsLoading ? "—" : analytics?.badgeStats?.totalIssued ?? 0}           color="#7C3AED" />
            <KPI icon={<FiBarChart2 size={16} />}label="Unique Badges Awarded"   value={analyticsLoading ? "—" : analytics?.badgeStats?.uniqueBadges ?? 0}          color="#059669" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Level Breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Student Level Breakdown</h3>
              {analyticsLoading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}</div>
              ) : (analytics?.levelBreakdown ?? []).length > 0 ? (
                <div className="space-y-3">
                  {analytics.levelBreakdown.map((l: any) => {
                    const max = Math.max(...analytics.levelBreakdown.map((x: any) => Number(x.count)), 1);
                    return (
                      <div key={l.level}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold" style={{ color: LEVEL_COLORS[l.level] || "#6B7280" }}>{l.level}</span>
                          <span className="font-bold text-gray-900">{Number(l.count).toLocaleString()} students</span>
                        </div>
                        <MiniBar value={Number(l.count)} max={max} color={LEVEL_COLORS[l.level] || "#6B7280"} />
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-xs text-gray-400 italic text-center py-6">No level data yet</p>}
            </div>

            {/* Domain Points */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">SAMAM Points by Domain</h3>
              {analyticsLoading ? (
                <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}</div>
              ) : (analytics?.domainSdcBreakdown ?? []).length > 0 ? (
                <div className="space-y-3">
                  {analytics.domainSdcBreakdown.map((r: any) => {
                    const max = Math.max(...analytics.domainSdcBreakdown.map((x: any) => Number(x.total_credits)), 1);
                    return (
                      <div key={r.domain}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <span style={{ color: DOMAIN_COLORS[r.domain] }}>{DOMAIN_ICONS[r.domain]}</span> {r.domain}
                          </span>
                          <span className="font-bold text-gray-900">{Number(r.total_credits).toLocaleString()} pts
                            <span className="text-gray-400 font-normal ml-1">({r.transaction_count} activities)</span>
                          </span>
                        </div>
                        <MiniBar value={Number(r.total_credits)} max={max} color={DOMAIN_COLORS[r.domain] || BRAND} />
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-xs text-gray-400 italic text-center py-6">No points data yet</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Leaderboard */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">SAMAM Points Leaderboard</h3>
              {analyticsLoading ? (
                <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
              ) : (analytics?.topSdcStudents ?? []).length > 0 ? (
                <div className="space-y-1.5">
                  {analytics.topSdcStudents.map((s: any, i: number) => (
                    <div key={s.username} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => { setTab("students"); openStudent(s); }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: ["#D97706","#9CA3AF","#CD7F32","#6B7280","#6B7280"][i] || BRAND }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{s.name}</p>
                        <p className="text-[10px] text-gray-400">{s.username} · {s.branch}</p>
                      </div>
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: BRAND }}>
                        {Number(s.total_credits).toLocaleString()} <span className="text-xs font-normal text-gray-400">pts</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-gray-400 italic text-center py-6">No activity yet</p>}
            </div>

            {/* Recent badges */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Badges Issued</h3>
              {analyticsLoading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
              ) : (analytics?.recentBadges ?? []).length > 0 ? (
                <div className="space-y-2">
                  {analytics.recentBadges.map((b: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${RARITY_COLORS[b.rarity] || "#9CA3AF"}18`, color: RARITY_COLORS[b.rarity] || "#9CA3AF" }}>
                        <FiAward size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{b.badge_name}</p>
                        <p className="text-[10px] text-gray-400">{b.name} · {b.username}</p>
                      </div>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${RARITY_COLORS[b.rarity]}18`, color: RARITY_COLORS[b.rarity] }}>
                        {b.rarity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-gray-400 italic text-center py-6">No badges issued recently</p>}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: STUDENTS ════════════════════════════════════════════ */}
      {tab === "students" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-48">
              <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchStudents(1)}
                placeholder="Search by name or username…"
                className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              className="h-9 px-3 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none">
              <option value="">All Levels</option>
              {["Explorer","Foundation","Practitioner","Leader"].map(l => <option key={l}>{l}</option>)}
            </select>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              className="h-9 px-3 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none">
              <option value="">All Years</option>
              {["1st","2nd","3rd","4th"].map(y => <option key={y}>{y}</option>)}
            </select>
            <button onClick={() => fetchStudents(1)}
              className="h-9 px-4 text-xs font-semibold rounded-lg text-white" style={{ backgroundColor: BRAND }}>
              Search
            </button>
            {(search || filterLevel || filterYear) && (
              <button onClick={() => { setSearch(""); setFilterLevel(""); setFilterYear(""); }}
                className="h-9 px-3 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                Clear
              </button>
            )}
          </div>

          <div className="flex gap-4">
            {/* Student table */}
            <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1 ${selectedStudent ? "hidden lg:block" : ""}`}>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500">{studentsTotal.toLocaleString()} students found</p>
              </div>
              <div className="overflow-x-auto">
                {studentsLoading ? (
                  <div className="p-4 space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
                ) : students.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-12">No students found</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {["Student","Branch","Year","Level","Points","Badges","Last Activity"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                        ))}
                        <th className="px-4 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {students.map(s => (
                        <tr key={s.username}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedStudent?.username === s.username ? "bg-red-50" : ""}`}
                          onClick={() => openStudent(s)}>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{s.name}</div>
                            <div className="text-gray-400">{s.username}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.branch}</td>
                          <td className="px-4 py-3 text-gray-600">{s.year}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ backgroundColor: `${LEVEL_COLORS[s.level] || "#6B7280"}18`, color: LEVEL_COLORS[s.level] || "#6B7280" }}>
                              {s.level}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900">{Number(s.total_points).toLocaleString()}</td>
                          <td className="px-4 py-3 font-semibold text-gray-600">{s.badge_count}</td>
                          <td className="px-4 py-3 text-gray-400">
                            {s.last_activity ? new Date(s.last_activity).toLocaleDateString() : "Never"}
                          </td>
                          <td className="px-4 py-3">
                            <FiChevronRight size={14} className="text-gray-400" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {/* Pagination */}
              {studentsTotal > 20 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <button disabled={studentsPage === 1} onClick={() => fetchStudents(studentsPage - 1)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-600 disabled:opacity-40">
                    <FiChevronLeft size={13} /> Prev
                  </button>
                  <span className="text-xs text-gray-500">Page {studentsPage} of {Math.ceil(studentsTotal / 20)}</span>
                  <button disabled={studentsPage * 20 >= studentsTotal} onClick={() => fetchStudents(studentsPage + 1)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-600 disabled:opacity-40">
                    Next <FiChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Student detail panel */}
            {selectedStudent && (
              <div className="w-full lg:w-[480px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-shrink-0">
                {/* Panel header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <button onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
                    className="lg:hidden text-gray-400 hover:text-gray-700"><FiChevronLeft size={16} /></button>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white flex-shrink-0" style={{ backgroundColor: BRAND }}>
                    {selectedStudent.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{selectedStudent.name}</p>
                    <p className="text-xs text-gray-400">{selectedStudent.username} · {selectedStudent.branch}</p>
                  </div>
                  <button onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
                    className="text-gray-400 hover:text-gray-600"><FiX size={16} /></button>
                </div>

                {detailLoading ? (
                  <div className="p-4 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
                ) : studentDetail ? (
                  <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                    {/* Summary chips */}
                    <div className="px-4 pt-4 grid grid-cols-3 gap-2">
                      {[
                        { label: "Level", value: studentDetail.profile?.level || "Explorer", color: LEVEL_COLORS[studentDetail.profile?.level] || "#6B7280" },
                        { label: "Total Points", value: studentDetail.profile?.totalPoints?.toLocaleString() || 0, color: BRAND },
                        { label: "Badges", value: studentDetail.profile?.badgeCount || 0, color: "#7C3AED" },
                      ].map(chip => (
                        <div key={chip.label} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: `${chip.color}10` }}>
                          <p className="text-base font-bold" style={{ color: chip.color }}>{chip.value}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{chip.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Domain breakdown */}
                    {studentDetail.domainBreakdown && Object.keys(studentDetail.domainBreakdown).length > 0 && (
                      <div className="px-4 pt-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Points by Domain</p>
                        <div className="space-y-1.5">
                          {Object.entries(studentDetail.domainBreakdown).map(([d, pts]: any) => (
                            <div key={d} className="flex items-center gap-2 text-xs">
                              <span className="font-medium w-8 text-center px-1 py-0.5 rounded text-white text-[10px]"
                                style={{ backgroundColor: DOMAIN_COLORS[d] || "#6B7280" }}>{d}</span>
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.min(100,(pts/studentDetail.profile.totalPoints)*100)}%`, backgroundColor: DOMAIN_COLORS[d] || BRAND }} />
                              </div>
                              <span className="font-semibold text-gray-700 w-10 text-right">{pts} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SDC History */}
                    <div className="px-4 pt-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Recent Point History</p>
                      {studentDetail.sdcHistory?.length > 0 ? (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {studentDetail.sdcHistory.slice(0, 20).map((t: any) => (
                            <div key={t.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 text-xs">
                              <span className="px-1.5 py-0.5 rounded text-white text-[10px] font-bold flex-shrink-0"
                                style={{ backgroundColor: DOMAIN_COLORS[t.domain] || "#6B7280" }}>{t.domain}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{t.activity_title || t.description}</p>
                                <p className="text-gray-400 text-[10px]">{t.granted_at ? new Date(t.granted_at).toLocaleDateString() : ""}</p>
                              </div>
                              <span className="font-bold text-gray-900 flex-shrink-0">+{t.points}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-gray-400 italic">No point history yet</p>}
                    </div>

                    {/* Badges */}
                    <div className="px-4 pt-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Earned Badges ({studentDetail.badges?.length || 0})</p>
                      {studentDetail.badges?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {studentDetail.badges.map((b: any) => (
                            <div key={b.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs"
                              style={{ backgroundColor: `${RARITY_COLORS[b.rarity] || "#9CA3AF"}10`, borderColor: `${RARITY_COLORS[b.rarity] || "#9CA3AF"}30` }}>
                              <span>{b.icon || "🏅"}</span>
                              <span className="font-medium text-gray-700">{b.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-gray-400 italic">No badges yet</p>}
                    </div>

                    {/* Competencies */}
                    {studentDetail.competencies?.length > 0 && (
                      <div className="px-4 pt-4 pb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Competency Scores</p>
                        <div className="space-y-1.5">
                          {studentDetail.competencies.slice(0, 8).map((c: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className="text-gray-600 flex-1 truncate">{c.name}</span>
                              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.min(100,(c.score||0)*10)}%`, backgroundColor: "#2563EB" }} />
                              </div>
                              <span className="font-semibold text-gray-800 w-4 text-right">{c.score || 0}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick award buttons */}
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex gap-2 mt-2">
                      <button
                        onClick={() => { setTab("awards"); setPointsForm(p => ({ ...p, username: selectedStudent.username })); }}
                        className="flex-1 text-xs font-semibold py-2.5 rounded-xl text-white flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: "#D97706" }}>
                        <FiStar size={12} /> Award Points
                      </button>
                      <button
                        onClick={() => { setTab("awards"); setBadgeForm(p => ({ ...p, username: selectedStudent.username })); }}
                        className="flex-1 text-xs font-semibold py-2.5 rounded-xl text-white flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: "#7C3AED" }}>
                        <FiAward size={12} /> Award Badge
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB: ACTIVITIES ══════════════════════════════════════════ */}
      {tab === "activities" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={actSearchStr} onChange={e => setActSearchStr(e.target.value)}
                placeholder="Search activities…"
                className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none" />
            </div>
            <button onClick={fetchActivities}
              className="h-9 px-3 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
              <FiRefreshCw size={13} /> Refresh
            </button>
            <button
              onClick={() => { setEditingActivity(null); setActivityForm({ title:"",description:"",domain:"TEC",activity_type:"event",points:"",max_participants:"",is_active:true }); setShowActivityModal(true); }}
              className="h-9 px-4 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5" style={{ backgroundColor: BRAND }}>
              <FiPlus size={13} /> New Activity
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {activitiesLoading ? (
                <div className="p-4 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-12">
                  <FiActivity size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No activities yet. Create one!</p>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Title","Domain","Type","Points","Max Participants","Participants","Status","Actions"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredActivities.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{a.title}</p>
                          {a.description && <p className="text-gray-400 truncate max-w-xs">{a.description}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full font-semibold text-white text-[10px]"
                            style={{ backgroundColor: DOMAIN_COLORS[a.domain] || "#6B7280" }}>
                            {a.domain}
                          </span>
                        </td>
                        <td className="px-4 py-3 capitalize text-gray-600">{a.activity_type}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{a.points}</td>
                        <td className="px-4 py-3 text-gray-600">{a.max_participants || "∞"}</td>
                        <td className="px-4 py-3 font-semibold text-gray-700">{a.participant_count || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-[10px] font-semibold ${a.is_active ? "text-emerald-700" : "text-gray-400"}`}>
                            {a.is_active ? <FiCheckCircle size={10} /> : <FiAlertCircle size={10} />}
                            {a.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingActivity(a);
                                setActivityForm({ title: a.title, description: a.description || "", domain: a.domain, activity_type: a.activity_type, points: String(a.points), max_participants: String(a.max_participants || ""), is_active: !!a.is_active });
                                setShowActivityModal(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50">
                              <FiEdit2 size={13} />
                            </button>
                            <button onClick={() => deleteActivity(a.id)}
                              className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50">
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Activity Create/Edit Modal */}
      {showActivityModal && (
        <Modal title={editingActivity ? "Edit Activity" : "Create New Activity"} onClose={() => setShowActivityModal(false)}>
          <div className="space-y-3">
            <Field label="Title *">
              <input value={activityForm.title} onChange={e => setActivityForm(p => ({ ...p, title: e.target.value }))}
                className={inputCls} placeholder="e.g. National Hackathon Participation" />
            </Field>
            <Field label="Description">
              <textarea value={activityForm.description} onChange={e => setActivityForm(p => ({ ...p, description: e.target.value }))}
                className={textareaCls} rows={3} placeholder="Brief description of the activity…" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Domain *">
                <select value={activityForm.domain} onChange={e => setActivityForm(p => ({ ...p, domain: e.target.value }))} className={inputCls}>
                  {["TEC","LCH","ESO","IIE","HWB"].map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Type *">
                <select value={activityForm.activity_type} onChange={e => setActivityForm(p => ({ ...p, activity_type: e.target.value }))} className={inputCls}>
                  {["event","workshop","project","competition","volunteer","seminar","course","other"].map(t => (
                    <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SAMAM Points *">
                <input type="number" min="1" max="500" value={activityForm.points}
                  onChange={e => setActivityForm(p => ({ ...p, points: e.target.value }))}
                  className={inputCls} placeholder="e.g. 15" />
              </Field>
              <Field label="Max Participants">
                <input type="number" min="1" value={activityForm.max_participants}
                  onChange={e => setActivityForm(p => ({ ...p, max_participants: e.target.value }))}
                  className={inputCls} placeholder="Leave blank = unlimited" />
              </Field>
            </div>
            {editingActivity && (
              <Field label="Status">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={activityForm.is_active}
                    onChange={e => setActivityForm(p => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded" />
                  <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible to students)</label>
                </div>
              </Field>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowActivityModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveActivity}
                disabled={!activityForm.title || !activityForm.points}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ backgroundColor: BRAND }}>
                {editingActivity ? "Save Changes" : "Create Activity"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
