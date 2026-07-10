"use client";
import { useState } from "react";
import { FiZap, FiTrendingUp, FiLink, FiCheckCircle, FiInfo } from "react-icons/fi";
import DashboardCard   from "@/app/components/dashboard/DashboardCard";
import ProgressCard    from "@/app/components/dashboard/ProgressCard";
import CompetencyRadar from "@/app/components/dashboard/CompetencyRadar";
import LineChart       from "@/app/components/dashboard/LineChart";
import ActivityHeatmap from "@/app/components/dashboard/ActivityHeatmap";
import {
  COMPETENCY_CATEGORIES, COMPETENCY_GROWTH, HEATMAP_DATA, COMPETENCY_EVIDENCE,
} from "@/app/Data/development-mock";

const BRAND = "rgb(151,0,3)";

const LEVEL_CONFIG = {
  Explorer:     { color: "#6B7280", bg: "bg-gray-100"    },
  Foundation:   { color: "#059669", bg: "bg-emerald-50"  },
  Practitioner: { color: "#2563EB", bg: "bg-blue-50"     },
  Leader:       { color: "#D97706", bg: "bg-amber-50"    },
  Mentor:       { color: "#7C3AED", bg: "bg-purple-50"   },
  Innovator:    { color: "#DC2626", bg: "bg-red-50"      },
};

const ALL_SERIES = COMPETENCY_CATEGORIES.map((c) => ({
  key: c.id, color: c.color, label: c.name,
}));

const EVIDENCE_TYPE = {
  certificate:  { label: "Certificate",  bg: "bg-blue-50",   text: "text-blue-700"   },
  github:       { label: "GitHub",       bg: "bg-gray-100",  text: "text-gray-700"   },
  achievement:  { label: "Achievement",  bg: "bg-amber-50",  text: "text-amber-700"  },
  project:      { label: "Project",      bg: "bg-purple-50", text: "text-purple-700" },
  course:       { label: "Course",       bg: "bg-cyan-50",   text: "text-cyan-700"   },
  publication:  { label: "Publication",  bg: "bg-green-50",  text: "text-green-700"  },
  activity:     { label: "Activity",     bg: "bg-red-50",    text: "text-red-700"    },
};

export default function CompetenciesPage() {
  const [activeCategory, setActiveCategory] = useState("technical");
  const [activeView,     setActiveView]     = useState("overview"); // overview | timeline | heatmap

  const cat = COMPETENCY_CATEGORIES.find((c) => c.id === activeCategory);
  const radarData = cat.competencies.map((c) => ({ name: c.name, score: c.score }));

  // Overall score per category for the summary row
  const overallScores = COMPETENCY_CATEGORIES.map((c) => ({
    ...c,
    avg: Math.round(c.competencies.reduce((s, x) => s + x.score, 0) / c.competencies.length),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Competency Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Track your growth across 6 competency domains with evidence and recommendations.
              </p>
            </div>
            {/* Overall summary pills */}
            <div className="flex flex-wrap gap-2">
              {overallScores.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{ backgroundColor: c.bg, borderColor: c.border }}>
                  <span className="text-sm">{c.icon}</span>
                  <span className="text-xs font-bold" style={{ color: c.color }}>{c.avg}%</span>
                  <span className="text-[10px] text-gray-500">{c.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── View toggle ── */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
        {[
          { key: "overview",  label: "Competencies" },
          { key: "timeline",  label: "Growth Chart"  },
          { key: "heatmap",   label: "Activity Heatmap" },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setActiveView(v.key)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeView === v.key ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
            style={activeView === v.key ? { backgroundColor: BRAND } : {}}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW VIEW ── */}
      {activeView === "overview" && (
        <>
          {/* Category tabs */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 overflow-x-auto">
              <div className="flex min-w-max">
                {COMPETENCY_CATEGORIES.map((c) => {
                  const avg = Math.round(c.competencies.reduce((s, x) => s + x.score, 0) / c.competencies.length);
                  const isActive = activeCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategory(c.id)}
                      className={`flex items-center gap-2 px-5 py-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                        isActive ? "border-current" : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                      style={isActive ? { color: c.color, borderColor: c.color } : {}}
                    >
                      <span>{c.icon}</span>
                      {c.name}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "text-white" : "text-gray-500 bg-gray-100"}`}
                        style={isActive ? { backgroundColor: c.color } : {}}
                      >
                        {avg}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-5">
              <p className="text-xs text-gray-500 mb-5">{cat.description}</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radar chart */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs font-semibold text-gray-700 self-start">Radar Profile</p>
                  <CompetencyRadar data={radarData} accentColor={cat.color} />
                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full">
                    {cat.competencies.map((c) => (
                      <div key={c.id} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        {c.name.length > 18 ? c.name.slice(0, 17) + "…" : c.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3 lg:col-span-2">
                  <p className="text-xs font-semibold text-gray-700">Individual Scores</p>
                  {cat.competencies.map((comp) => {
                    const lc = LEVEL_CONFIG[comp.level] || LEVEL_CONFIG.Explorer;
                    return (
                      <div key={comp.id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-800">{comp.name}</span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${lc.bg}`} style={{ color: lc.color }}>
                              {comp.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {comp.trend > 0 && (
                              <span className="flex items-center gap-0.5 text-[9px] text-emerald-600">
                                <FiTrendingUp size={9} />+{comp.trend}%
                              </span>
                            )}
                            <span className="text-xs font-bold text-gray-700">{comp.score}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${comp.score}%`, backgroundColor: cat.color }}
                          />
                        </div>
                        {/* Evidence pills */}
                        {COMPETENCY_EVIDENCE[comp.id] && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {COMPETENCY_EVIDENCE[comp.id].map((ev, i) => {
                              const eType = EVIDENCE_TYPE[ev.type] || EVIDENCE_TYPE.activity;
                              return (
                                <span key={i} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${eType.bg} ${eType.text}`}>
                                  <FiLink size={8} className="inline mr-0.5" />{ev.title.length > 25 ? ev.title.slice(0, 24) + "…" : ev.title}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <DashboardCard title="🤖 AI Recommendations" subtitle={`For your ${cat.name} competencies`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: "📚", label: "Activity to try",    text: `Enroll in ${cat.id === "technical" ? "System Design Sprint" : cat.id === "leadership" ? "Youth Leadership Congress" : "Advanced Research Methods"} to jump your weakest competency.` },
                { icon: "⚡", label: "Quick win",          text: `Your ${cat.competencies.sort((a,b)=>a.score-b.score)[0].name} score is lowest. One workshop can add +15% in 2 weeks.` },
                { icon: "🎯", label: "Next milestone",     text: `Reach ${cat.name} Practitioner level by earning 10 more SDC credits in this domain.` },
              ].map((r) => (
                <div key={r.label} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{r.icon}</span>
                    <p className="text-xs font-semibold text-gray-700">{r.label}</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </>
      )}

      {/* ── TIMELINE VIEW ── */}
      {activeView === "timeline" && (
        <DashboardCard title="Competency Growth Timeline" subtitle="12-month progress across all 6 domains">
          {/* Series legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {COMPETENCY_CATEGORIES.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-xs text-gray-600">{c.name}</span>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <LineChart data={COMPETENCY_GROWTH} series={ALL_SERIES} height={220} />
          </div>
        </DashboardCard>
      )}

      {/* ── HEATMAP VIEW ── */}
      {activeView === "heatmap" && (
        <DashboardCard title="Activity Contribution Heatmap" subtitle="52 weeks of learning activity across all domains">
          <div className="overflow-x-auto">
            <ActivityHeatmap data={HEATMAP_DATA} color={BRAND} />
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Active Weeks",    value: "38 / 52" },
              { label: "Longest Streak",  value: "12 weeks" },
              { label: "Peak Month",      value: "November" },
              { label: "Avg / Week",      value: "2.4 activities" },
            ].map((s) => (
              <div key={s.label} className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
