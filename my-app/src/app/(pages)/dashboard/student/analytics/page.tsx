"use client";

import { FiBarChart2, FiPieChart, FiTrendingUp, FiClock, FiStar, FiAward } from "react-icons/fi";
import LineChart from "@/app/components/dashboard/LineChart";
import { mockSDC } from "@/app/Data/samam-mock";
import { COMPETENCY_GROWTH } from "@/app/Data/development-mock";

const BRAND = "rgb(151,0,3)";

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
      <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
         <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Department Leaderboard (Top 5)</h2>
         <div className="space-y-2">
            {["Priya Sharma", "Rahul Verma", "Arjun Sharma (You)", "Sneha Reddy", "Karthik Nair"].map((name, i) => (
              <div key={name} className={`flex items-center justify-between p-3 rounded-xl border ${i === 2 ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : 'border-gray-50 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 dark:text-zinc-500">#{i + 1}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</span>
                </div>
                <span className="text-xs font-bold text-gray-600 dark:text-zinc-400">{2500 - (i * 120)} pts</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
