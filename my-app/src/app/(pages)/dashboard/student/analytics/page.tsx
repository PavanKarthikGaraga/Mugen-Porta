"use client";

import { useEffect, useState } from "react";
import { FiBarChart2, FiPieChart, FiTrendingUp, FiStar, FiAward, FiActivity, FiTarget, FiZap } from "react-icons/fi";
import LineChart from "@/app/components/dashboard/LineChart";

const BRAND = "rgb(151,0,3)";

function LeaderboardSection() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/admin/samam-stats")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const top = (data?.topSdcStudents ?? []).filter((s: any) => Number(s.total_credits) > 0);
        setLeaders(top.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (leaders.length === 0) return null;

  return (
    <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
          <FiStar size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Department Leaderboard (Top 5)</h2>
      </div>
      <div className="space-y-3">
        {leaders.map((s: any, i: number) => (
          <div key={s.username} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/30 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300">
            <div className="flex items-center gap-4">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' : i === 1 ? 'bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300' : i === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300' : 'bg-gray-100 text-gray-500 dark:bg-zinc-800/80 dark:text-zinc-500'}`}>
                #{i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand transition-colors">{s.name}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{s.username}</p>
              </div>
            </div>
            <span className="text-sm font-black tracking-tight" style={{ color: BRAND }}>
              {Number(s.total_credits).toLocaleString()} <span className="text-xs text-gray-400 font-medium">pts</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({ sdc: null, badges: null, competencies: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) throw new Error("Not authenticated");
        const authData = await authRes.json();
        const username = authData.user.username;

        const [sdcRes, badgesRes, compRes] = await Promise.all([
          fetch(`/api/dashboard/student/samam/sdc/${username}`),
          fetch(`/api/dashboard/student/samam/badges/${username}`),
          fetch(`/api/dashboard/student/samam/competencies/${username}`)
        ]);

        const [sdc, badges, competencies] = await Promise.all([
          sdcRes.ok ? sdcRes.json() : null,
          badgesRes.ok ? badgesRes.json() : null,
          compRes.ok ? compRes.json() : null
        ]);

        setData({ sdc, badges, competencies });
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-[rgb(151,0,3)]" />
      </div>
    );
  }

  const { sdc, badges, competencies } = data;

  const totalPoints = sdc?.total || 0;
  const activeDomains = (sdc?.byDomain || []).filter((d: any) => d.credits > 0).length;
  const badgesEarned = badges?.earned?.length || 0;
  const semesterPoints = sdc?.semesterCurrent || 0;

  const STATS = [
    { label: "Total Points", value: totalPoints, icon: <FiZap />, color: "#D97706", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { label: "Semester Points", value: semesterPoints, icon: <FiTrendingUp />, color: "#2563EB", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Badges Earned", value: badgesEarned, icon: <FiAward />, color: "#7C3AED", bg: "bg-purple-50 dark:bg-purple-500/10" },
    { label: "Active Domains", value: `${activeDomains}/5`, icon: <FiActivity />, color: "#059669", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  ];

  // Build conic gradient for pie chart
  const domainsData = sdc?.byDomain || [];
  let conicString = "";
  if (domainsData.length > 0 && totalPoints > 0) {
    let currentPct = 0;
    const segments = domainsData.map((d: any) => {
      const start = currentPct;
      const end = currentPct + (d.pct || 0);
      currentPct = end;
      return `${d.color} ${start}% ${end}%`;
    });
    conicString = segments.join(", ");
  } else {
    conicString = "#f3f4f6 0% 100%"; // empty state
  }

  // Monthly trend for line chart
  const monthlyTrend = sdc?.monthlyTrend?.length ? sdc.monthlyTrend : [{ month: 'Jan', credits: 0 }, { month: 'Feb', credits: 0 }];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header section with gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-zinc-800 p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-red-600/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Analytics & Insights</h1>
            <p className="text-gray-400 max-w-xl">
              Track your holistic development, monitor competency growth, and see your real-time impact across all modules.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-100">Live Data Sync</span>
          </div>
        </div>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((stat, i) => (
          <div key={i} className="group relative bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${stat.bg}`} style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart Section (Takes up 2 cols on lg) */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
                <FiBarChart2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Points Trend (12 Months)</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Your SAMAM points accumulation over time.</p>
              </div>
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            {monthlyTrend.length > 0 ? (
              <LineChart
                data={monthlyTrend}
                series={[{ key: "credits", color: BRAND, label: "Points" }]}
                height={280}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No trend data available</div>
            )}
          </div>
        </div>

        {/* Pie Chart / Distribution Section */}
        <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FiPieChart size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Distribution</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Points by domain</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
            <div className="relative group">
              <div 
                className="w-48 h-48 rounded-full shadow-inner transition-transform duration-500 group-hover:scale-105"
                style={{ background: `conic-gradient(${conicString})` }} 
              />
              <div className="absolute inset-0 m-auto w-32 h-32 bg-white dark:bg-zinc-900 rounded-full shadow-lg flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{totalPoints}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Pts</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {domainsData.map((d: any) => (
              <div key={d.domain} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-medium text-gray-600 dark:text-zinc-300 truncate" title={d.domain}>
                  {d.domain}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competencies Section */}
      <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FiTarget size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Competency Profiling</h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Your current skill levels across core categories.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {competencies && competencies.length > 0 ? (
            competencies.map((cat: any) => (
              <div key={cat.id} className="p-5 rounded-2xl bg-gray-50/50 dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{cat.title}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{cat.competencies?.length || 0} skills</p>
                  </div>
                </div>
                <div className="space-y-4 mt-4">
                  {cat.competencies?.map((comp: any) => (
                    <div key={comp.id}>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">{comp.name}</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{comp.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-brand h-2 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${comp.score}%`, backgroundColor: comp.color || BRAND }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
             <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
               <FiActivity size={32} className="mb-3 opacity-20" />
               <p className="text-sm font-medium">No competency data mapped yet.</p>
             </div>
          )}
        </div>
      </div>

      <LeaderboardSection />
    </div>
  );
}
