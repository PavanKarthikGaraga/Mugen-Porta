"use client";
import { useState, useEffect } from "react";
import { FiStar, FiTrendingUp, FiCalendar, FiCheckCircle } from "react-icons/fi";
import RingProgress  from "@/app/components/dashboard/RingProgress";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import LineChart     from "@/app/components/dashboard/LineChart";

const BRAND = "rgb(151,0,3)";

function BarChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-500 italic mt-4">No domain data yet.</p>;
  }
  const maxVal = Math.max(...data.map((d) => d.credits));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.domain}>
          <div className="flex items-center justify-between mb-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-gray-700 font-medium">{d.domain}</span>
            </div>
            <span className="font-bold text-gray-900">{d.credits} pts</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: maxVal > 0 ? `${(d.credits / maxVal) * 100}%` : '0%', backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SDCPage() {
  const [sdcData, setSdcData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSDC = async () => {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) throw new Error("Not auth");
        const authData = await authRes.json();
        
        const username = authData.user.username;
        const sdcRes = await fetch(`/api/dashboard/student/samam/sdc/${username}`);
        if (sdcRes.ok) {
          setSdcData(await sdcRes.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSDC();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
      </div>
    );
  }

  if (!sdcData) {
    return (
      <div className="p-8 text-center text-gray-500">Failed to load SDC data.</div>
    );
  }

  const { total, target, semesterTarget, semesterCurrent, yearlyData, byDomain, history, monthlyTrend } = sdcData;
  const overallPct = target > 0 ? Math.round((total / target) * 100) : 0;
  const semPct     = semesterTarget > 0 ? Math.round((semesterCurrent / semesterTarget) * 100) : 0;

  const trendSeries = [{ key: "credits", color: BRAND, label: "Credits Earned" }];

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <h1 className="text-xl font-bold text-gray-900">SAMAM Points</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Your comprehensive SAMAM Points record — by domain, semester, and over time.
          </p>
        </div>
      </div>

      {/* ── Top row: Rings + Semester ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Overall Points */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(151,0,3,0.1)', color: BRAND }}>
            <FiStar size={24} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Points</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-black tracking-tighter" style={{ color: BRAND }}>{total}</span>
            <span className="text-lg font-medium text-gray-400">pts</span>
          </div>
          <p className="text-xs text-gray-400">Overall earned</p>
        </div>

        {/* Semester Points */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 mb-2">
            <FiTrendingUp size={24} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">This Semester</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-black tracking-tighter text-blue-600">{semesterCurrent}</span>
            <span className="text-lg font-medium text-blue-300">pts</span>
          </div>
          <p className="text-xs text-gray-400">Current active semester</p>
        </div>

        {/* Yearly breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">Academic Year Breakdown</p>
          <div className="space-y-4">
            {yearlyData && yearlyData.length > 0 ? yearlyData.map((y: any) => (
              <div key={y.year}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-800">{y.year}</span>
                  <span className="text-xs font-bold" style={{ color: BRAND }}>{y.total} SDC</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
                  {y.sem1 !== undefined && <span className="bg-gray-50 rounded px-2 py-0.5">Sem 1: {y.sem1}</span>}
                  {y.sem2 !== null && y.sem2 !== undefined ? <span className="bg-gray-50 rounded px-2 py-0.5">Sem 2: {y.sem2}</span>
                    : <span className="bg-gray-50 rounded px-2 py-0.5 text-gray-300">Sem 2: ongoing</span>}
                </div>
              </div>
            )) : (
              <p className="text-xs text-gray-500 italic">No yearly breakdown available.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Credits by Domain + Monthly Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardCard title="Points by Domain" subtitle="Distribution across all 5 domains">
          {/* Donut-style stat */}
          <div className="flex items-center gap-6 mb-4">
            <svg width={80} height={80} viewBox="0 0 80 80" className="-rotate-90">
              {byDomain && byDomain.length > 0 ? byDomain.reduce((acc: any, d: any, i: number) => {
                const total2 = byDomain.reduce((s: number, x: any) => s + x.credits, 0);
                const circ = 2 * Math.PI * 32;
                const filled = total2 > 0 ? (d.credits / total2) * circ : 0;
                const el = (
                  <circle
                    key={d.domain}
                    cx={40} cy={40} r={32}
                    fill="none"
                    stroke={d.color}
                    strokeWidth={8}
                    strokeDasharray={`${filled} ${circ - filled}`}
                    strokeDashoffset={-acc.offset}
                  />
                );
                acc.offset += filled;
                acc.els.push(el);
                return acc;
              }, { offset: 0, els: [] }).els : (
                <circle cx={40} cy={40} r={32} fill="none" stroke="#f3f4f6" strokeWidth={8} />
              )}
            </svg>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-400">Total Points</p>
            </div>
          </div>
          <BarChart data={byDomain || []} />
        </DashboardCard>

        <DashboardCard title="Monthly Points Trend" subtitle="SAMAM Points earned per month">
          <div className="overflow-x-auto">
            {monthlyTrend && monthlyTrend.length > 0 ? (
                <LineChart data={monthlyTrend} series={trendSeries} height={180} />
            ) : (
                <p className="text-xs text-gray-500 italic mt-8 text-center">No trend data available.</p>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* ── Credit History Table ── */}
      <DashboardCard title="Credit History" subtitle={`${history ? history.length : 0} transactions`}>
        <div className="overflow-x-auto">
          {history && history.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Date","Activity","Domain","Type","Credits"].map((h) => (
                    <th key={h} className="py-2 px-3 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">{row.date}</td>
                    <td className="py-2.5 px-3 text-gray-800 font-medium">{row.activity}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{row.domain}</span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">{row.type}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold flex items-center gap-0.5" style={{ color: BRAND }}>
                        <FiStar size={10} />+{row.credits}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <p className="text-sm text-gray-500 italic p-4">No credit history available.</p>
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
