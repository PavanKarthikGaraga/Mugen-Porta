"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiUsers, FiTrendingUp, FiRefreshCw, FiChevronRight,
  FiCpu, FiPenTool, FiGlobe, FiZap, FiHeart,
  FiFilter, FiFileText, FiCheckCircle,
} from "react-icons/fi";
import { handleApiError } from "@/lib/apiErrorHandler";
import StatCard from "@/app/components/dashboard/StatCard";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import ProgressCard from "@/app/components/dashboard/ProgressCard";

const BRAND = "rgb(151,0,3)";

const yearOrder  = ["1st", "2nd", "3rd", "4th"];
const yearColors = ["#B45309", "#059669", "#2563EB", "#DC2626"];
const yearLabels: Record<string, string> = {
  "1st": "1st Year", "2nd": "2nd Year", "3rd": "3rd Year", "4th": "4th Year",
};

const domainMeta = [
  { key: "TEC", label: "Technical (TEC)",                       color: "#2563EB", icon: <FiCpu     size={13} /> },
  { key: "LCH", label: "Liberal & Creative Arts (LCH)",         color: "#7C3AED", icon: <FiPenTool size={13} /> },
  { key: "ESO", label: "Extension & Outreach (ESO)",            color: "#D97706", icon: <FiGlobe   size={13} /> },
  { key: "IIE", label: "Innovation & Entrepreneurship (IIE)",   color: "#059669", icon: <FiZap     size={13} /> },
  { key: "HWB", label: "Health & Well-being (HWB)",             color: "#E11D48", icon: <FiHeart   size={13} /> },
];

function Skeleton() {
  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-pulse">
      <div className="h-24 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-56 bg-gray-100 rounded-xl" />
        <div className="h-56 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

interface Club { id: string; name: string }

export default function FacultyOverviewPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    recentRegistrations: 0,
    yearWiseCount: {} as Record<string, number>,
    domainWiseCount: {} as Record<string, number>,
  });
  const [loading, setLoading]   = useState(true);
  const [clubs, setClubs]       = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState("");

  // Fetch clubs and initial stats in parallel on mount — no auth pre-fetch needed
  useEffect(() => {
    Promise.all([fetchClubs(), fetchStats("")]);
  }, []);

  useEffect(() => {
    fetchStats(selectedClub);
  }, [selectedClub]);

  const fetchClubs = async () => {
    try {
      const res = await fetch("/api/dashboard/faculty/clubs");
      if (res.ok) setClubs(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async (clubId: string) => {
    try {
      setLoading(true);
      const url = clubId
        ? `/api/dashboard/faculty/stats?clubId=${clubId}`
        : "/api/dashboard/faculty/stats";
      const res = await fetch(url);
      if (await handleApiError(res)) return;
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectedClubName = clubs.find((c) => c.id === selectedClub)?.name;
  const maxYear   = Math.max(...yearOrder.map((y) => stats.yearWiseCount[y] ?? 0), 1);
  const maxDomain = Math.max(...domainMeta.map((d) => stats.domainWiseCount[d.key] ?? 0), 1);

  const noClubs = !loading && clubs.length === 0;

  if (loading && !stats.totalStudents) return <Skeleton />;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1" style={{ backgroundColor: BRAND }} />
        <div className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Faculty Overview</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedClubName
                ? `Viewing: ${selectedClubName}`
                : clubs.length > 1
                  ? `All ${clubs.length} clubs combined`
                  : clubs.length === 1
                    ? clubs[0]?.name ?? "Your club"
                    : "No clubs assigned"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Club filter pill */}
            {clubs.length > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
                <FiFilter size={12} className="text-gray-400 flex-shrink-0" />
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="text-xs font-medium text-gray-700 bg-transparent outline-none cursor-pointer"
                >
                  <option value="">All Clubs</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => fetchStats(selectedClub)}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* No clubs */}
      {noClubs && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <FiUsers size={40} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No Clubs Assigned</h3>
          <p className="text-xs text-gray-400">Contact an administrator to get clubs assigned to your account.</p>
        </div>
      )}

      {!noClubs && (
        <>
          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<FiUsers size={16} />}
              label="Total Members"
              value={loading ? "—" : stats.totalStudents.toLocaleString()}
              accent={BRAND}
            />
            <StatCard
              icon={<FiTrendingUp size={16} />}
              label="Recent (30 days)"
              value={loading ? "—" : stats.recentRegistrations.toLocaleString()}
              trend={stats.recentRegistrations > 0 ? "new registrations" : undefined}
              trendUp={stats.recentRegistrations > 0}
              accent="#059669"
            />
          </div>

          {/* Year & Domain distributions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            <DashboardCard
              title="Year Distribution"
              subtitle="Members by academic year"
              action={
                <Link
                  href="/dashboard/faculty/students"
                  className="text-xs font-medium hover:underline flex items-center gap-0.5"
                  style={{ color: BRAND }}
                >
                  View members <FiChevronRight size={12} />
                </Link>
              }
            >
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1,2,3,4].map((i) => <div key={i} className="h-6 bg-gray-100 rounded" />)}
                </div>
              ) : Object.keys(stats.yearWiseCount).length > 0 ? (
                <div className="space-y-3">
                  {yearOrder.map((y, i) => (
                    <ProgressCard
                      key={y}
                      label={yearLabels[y]}
                      value={stats.yearWiseCount[y] ?? 0}
                      max={maxYear}
                      showPercentage={false}
                      suffix=" students"
                      color={yearColors[i]}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic text-center py-4">No year data yet</p>
              )}
            </DashboardCard>

            <DashboardCard
              title="Domain Distribution"
              subtitle="Members across SAMAM domains"
            >
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1,2,3,4,5].map((i) => <div key={i} className="h-6 bg-gray-100 rounded" />)}
                </div>
              ) : Object.keys(stats.domainWiseCount).length > 0 ? (
                <div className="space-y-3">
                  {domainMeta.map((d) => {
                    const count = stats.domainWiseCount[d.key] ?? 0;
                    return (
                      <div key={d.key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                            <span style={{ color: d.color }}>{d.icon}</span>
                            {d.key}
                          </span>
                          <span className="text-xs font-bold text-gray-900">{count.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.round((count / maxDomain) * 100)}%`, backgroundColor: d.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic text-center py-4">No domain data yet</p>
              )}
            </DashboardCard>
          </div>

          {/* Domain mini-cards */}
          <DashboardCard title="Domain Summary" subtitle="Quick count across all 5 domains">
            <div className="grid grid-cols-5 gap-2">
              {domainMeta.map((d) => {
                const count = stats.domainWiseCount[d.key] ?? 0;
                return (
                  <div
                    key={d.key}
                    className="rounded-lg p-3 text-center border"
                    style={{ backgroundColor: `${d.color}10`, borderColor: `${d.color}30` }}
                  >
                    <div className="text-sm mb-0.5" style={{ color: d.color }}>{d.icon}</div>
                    <div className="text-xs font-semibold" style={{ color: d.color }}>{d.key}</div>
                    <div className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                      {loading ? "—" : count.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardCard>

          {/* Clubs grid (only when viewing all) */}
          {!selectedClub && clubs.length > 1 && (
            <DashboardCard
              title="Your Clubs"
              subtitle={`${clubs.length} clubs assigned to you`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {clubs.map((club) => (
                  <button
                    key={club.id}
                    onClick={() => setSelectedClub(club.id)}
                    className="bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl p-3 border border-gray-200 text-left flex items-center gap-3"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: BRAND }}
                    >
                      {club.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">{club.name}</div>
                      <div className="text-[10px] text-gray-400">Click to filter</div>
                    </div>
                  </button>
                ))}
              </div>
            </DashboardCard>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Members",            icon: <FiUsers       size={18} />, href: "/dashboard/faculty/students",           color: "#2563EB" },
              { label: "Attendance Records",  icon: <FiCheckCircle size={18} />, href: "/dashboard/faculty/attendance-records", color: "#059669" },
              { label: "Passport Approvals",  icon: <FiFileText    size={18} />, href: "/dashboard/faculty/passport-approvals", color: BRAND    },
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
        </>
      )}

    </div>
  );
}
