"use client";
import { FiStar, FiTrendingUp, FiCalendar, FiCheckCircle } from "react-icons/fi";
import RingProgress  from "@/app/components/dashboard/RingProgress";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import LineChart     from "@/app/components/dashboard/LineChart";
import { SDC_DATA }  from "@/app/Data/development-mock";

const BRAND = "rgb(151,0,3)";

const DOMAIN_ABBR = { TEC:"Technical", IIE:"Innovation", ESO:"Social", LCH:"Cultural", HWB:"Wellness" };

function BarChart({ data }) {
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
            <span className="font-bold text-gray-900">{d.credits} SDC</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.credits / maxVal) * 100}%`, backgroundColor: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SDCPage() {
  const { total, target, semesterTarget, semesterCurrent, yearlyData, byDomain, history, monthlyTrend } = SDC_DATA;
  const overallPct = Math.round((total / target) * 100);
  const semPct     = Math.round((semesterCurrent / semesterTarget) * 100);

  const trendSeries = [{ key: "credits", color: BRAND, label: "Credits Earned" }];

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <h1 className="text-xl font-bold text-gray-900">Student Development Credits</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Your comprehensive SDC record — by domain, semester, and over time.
          </p>
        </div>
      </div>

      {/* ── Top row: Rings + Semester ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Overall ring */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Credits</p>
          <RingProgress
            value={overallPct}
            size={140}
            strokeWidth={12}
            color={BRAND}
            label={`${total} / ${target} SDC`}
            sublabel="Overall progress"
          />
          <div className="w-full space-y-1.5">
            {[
              { label: "Explorer threshold",     needed: 50,  pct: Math.min(100, Math.round((total/50)*100))  },
              { label: "Foundation threshold",   needed: 120, pct: Math.min(100, Math.round((total/120)*100)) },
              { label: "Practitioner threshold", needed: 220, pct: Math.min(100, Math.round((total/220)*100)) },
              { label: "Leader threshold",       needed: 350, pct: Math.min(100, Math.round((total/350)*100)) },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2 text-[10px]">
                <FiCheckCircle
                  size={10}
                  className={total >= t.needed ? "text-emerald-500" : "text-gray-300"}
                />
                <span className="text-gray-500 flex-1">{t.label}</span>
                <span className="font-semibold text-gray-700">{t.needed}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Semester ring */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">This Semester</p>
          <RingProgress
            value={semPct}
            size={140}
            strokeWidth={12}
            color="#2563EB"
            label={`${semesterCurrent} / ${semesterTarget} SDC`}
            sublabel="Semester 5 progress"
          />
          <div className="w-full p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-800 mb-1">On track?</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              You need <span className="font-bold">{semesterTarget - semesterCurrent} more SDC</span> this semester.
              At your current pace, you&apos;ll earn them in ~3 weeks.
            </p>
          </div>
        </div>

        {/* Yearly breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">Academic Year Breakdown</p>
          <div className="space-y-4">
            {yearlyData.map((y) => (
              <div key={y.year}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-800">{y.year}</span>
                  <span className="text-xs font-bold" style={{ color: BRAND }}>{y.total} SDC</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
                  {y.sem1 && <span className="bg-gray-50 rounded px-2 py-0.5">Sem 1: {y.sem1}</span>}
                  {y.sem2 !== null ? <span className="bg-gray-50 rounded px-2 py-0.5">Sem 2: {y.sem2}</span>
                    : <span className="bg-gray-50 rounded px-2 py-0.5 text-gray-300">Sem 2: ongoing</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Credits by Domain + Monthly Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardCard title="Credits by Domain" subtitle="Distribution across all 5 domains">
          {/* Donut-style stat */}
          <div className="flex items-center gap-6 mb-4">
            <svg width={80} height={80} viewBox="0 0 80 80" className="-rotate-90">
              {byDomain.reduce((acc, d, i) => {
                const total2 = byDomain.reduce((s, x) => s + x.credits, 0);
                const circ = 2 * Math.PI * 32;
                const filled = (d.credits / total2) * circ;
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
              }, { offset: 0, els: [] }).els}
            </svg>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-400">Total SDC</p>
            </div>
          </div>
          <BarChart data={byDomain} />
        </DashboardCard>

        <DashboardCard title="Monthly Credit Trend" subtitle="SDC credits earned per month">
          <div className="overflow-x-auto">
            <LineChart data={monthlyTrend} series={trendSeries} height={180} />
          </div>
        </DashboardCard>
      </div>

      {/* ── Credit History Table ── */}
      <DashboardCard title="Credit History" subtitle={`${history.length} transactions`}>
        <div className="overflow-x-auto">
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
              {history.map((row, i) => (
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
        </div>
      </DashboardCard>
    </div>
  );
}
