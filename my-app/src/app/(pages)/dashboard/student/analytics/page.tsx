"use client";

import { useEffect, useState } from "react";
import { FiBarChart2, FiPieChart, FiTrendingUp, FiClock, FiStar, FiAward } from "react-icons/fi";
import LineChart from "@/app/components/dashboard/LineChart";
import { mockSDC } from "@/app/Data/samam-mock";
import { COMPETENCY_GROWTH } from "@/app/Data/development-mock";

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

  if (loading) return null; // don't flash empty state
  if (leaders.length === 0) return null; // hide entirely when no one has pts

  return (
    <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
      <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Department Leaderboard (Top 5)</h2>
      <div className="space-y-2">
        {leaders.map((s: any, i: number) => (
          <div key={s.username} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-400 dark:text-zinc-500">#{i + 1}</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.name}</p>
                <p className="text-xs text-gray-500">{s.username}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">{Number(s.total_credits).toLocaleString()} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATS = [
  { label: "Learning Hours", value: "142h", icon: <FiClock />, color: "#2563EB" },
  { label: "Total Credits", value: mockSDC.total, icon: <FiStar />, color: "#D97706" },
  { label: "Badges Earned", value: "12", icon: <FiAward />, color: "#7C3AED" },
  { label: "Overall Growth", value: "+18%", icon: <FiTrendingUp />, color: "#059669" },
];

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Analytics & Insights</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">Track your holistic development across all modules.</p>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white" style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competency Growth */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <FiTrendingUp className="text-blue-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Competency Growth (12 Months)</h2>
          </div>
          <LineChart
            data={COMPETENCY_GROWTH}
            series={[
              { key: "technical", color: "#2563EB", label: "Tech" },
              { key: "professional", color: "#7C3AED", label: "Prof" },
              { key: "leadership", color: "#D97706", label: "Lead" },
            ]}
            height={250}
          />
        </div>

        {/* Activity Distribution */}
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <FiPieChart className="text-emerald-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Activity Distribution</h2>
          </div>
          <div className="flex items-center justify-center h-[250px]">
            {/* CSS-only simple pie chart visual representation */}
            <div className="w-48 h-48 rounded-full" style={{
              background: `conic-gradient(#2563EB 0% 35%, #7C3AED 35% 60%, #059669 60% 80%, #D97706 80% 100%)`
            }} />
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {[
              { label: "Technical", color: "#2563EB" },
              { label: "Professional", color: "#7C3AED" },
              { label: "Research", color: "#059669" },
              { label: "Leadership", color: "#D97706" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Leaderboard snippet */}
      <LeaderboardSection />
    </div>
  );
}
