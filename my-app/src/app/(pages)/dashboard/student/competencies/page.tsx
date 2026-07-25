"use client";
import { useState, useEffect } from "react";
import {
  FiTrendingUp, FiTrendingDown, FiLink, FiTarget, FiArrowRight,
  FiCpu, FiBriefcase, FiAward, FiSearch, FiZap, FiHeart, FiTag,
  FiBarChart2, FiCompass,
} from "react-icons/fi";
import DashboardCard   from "@/app/components/dashboard/DashboardCard";
import CompetencyRadar from "@/app/components/dashboard/CompetencyRadar";

const BRAND = "rgb(151,0,3)";

const LEVEL_CONFIG: Record<string, any> = {
  Explorer:     { color: "#6B7280", bg: "bg-gray-100"    },
  Foundation:   { color: "#059669", bg: "bg-emerald-50"  },
  Practitioner: { color: "#2563EB", bg: "bg-blue-50"     },
  Leader:       { color: "#D97706", bg: "bg-amber-50"    },
  Mentor:       { color: "#7C3AED", bg: "bg-purple-50"   },
  Innovator:    { color: "#DC2626", bg: "bg-red-50"      },
};

// Professional icon per competency category — replaces the emoji that used
// to come straight from the API.
const CATEGORY_ICON: Record<string, any> = {
  technical:    FiCpu,
  professional: FiBriefcase,
  leadership:   FiAward,
  research:     FiSearch,
  innovation:   FiZap,
  personal:     FiHeart,
};

const EVIDENCE_TYPE: Record<string, any> = {
  activity: { label: "Activity", bg: "bg-red-50",   text: "text-red-700"   },
  badge:    { label: "Badge",    bg: "bg-amber-50",  text: "text-amber-700" },
};

function CategoryIcon({ id, size = 14 }: { id: string; size?: number }) {
  const Icon = CATEGORY_ICON[id] || FiTag;
  return <Icon size={size} />;
}

export default function CompetenciesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("technical");
  const [activeView, setActiveView] = useState("overview"); // overview | insights

  useEffect(() => {
    const fetchCompetencies = async () => {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) throw new Error("Not auth");
        const authData = await authRes.json();

        const username = authData.user.username;
        const res = await fetch(`/api/dashboard/student/samam/competencies/${username}`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          if (data.length > 0) setActiveCategory(data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetencies();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return <div className="p-8 text-center text-gray-500">No competencies found for this user.</div>;
  }

  const cat = categories.find((c) => c.id === activeCategory) || categories[0];
  const radarData = cat.competencies.map((c: any) => ({ name: c.name, score: c.score }));

  // Overall score per category for the summary row — all real, computed
  // straight from the student's own scores.
  const overallScores = categories.map((c) => ({
    ...c,
    avg: c.competencies.length > 0 ? Math.round(c.competencies.reduce((s: number, x: any) => s + x.score, 0) / c.competencies.length) : 0,
  }));

  // Flatten every scored competency across all categories for insight math.
  const allScored = categories.flatMap((c: any) =>
    c.competencies.filter((x: any) => x.score > 0).map((x: any) => ({ ...x, categoryTitle: c.title, categoryId: c.id }))
  );
  const strongest = [...allScored].sort((a, b) => b.score - a.score)[0] || null;
  const weakest = [...allScored].sort((a, b) => a.score - b.score)[0] || null;
  const trendingUp = allScored.filter((c) => c.trend > 0).length;
  const trendingDown = allScored.filter((c) => c.trend < 0).length;
  const totalEvidence = allScored.reduce((s: number, c: any) => s + (c.evidence?.length || 0), 0);

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
                Track your growth across {categories.length} competency domains, backed by real evidence from your activities and badges.
              </p>
            </div>
            {/* Overall summary pills */}
            <div className="flex flex-wrap gap-2">
              {overallScores.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-gray-50 border-gray-100">
                  <span className="text-gray-500"><CategoryIcon id={c.id} /></span>
                  <span className="text-xs font-bold text-gray-700">{c.avg}%</span>
                  <span className="text-[10px] text-gray-500">{c.title.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── View toggle ── */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
        {[
          { key: "overview", label: "Competencies", icon: FiCompass },
          { key: "insights",  label: "Insights",      icon: FiBarChart2 },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setActiveView(v.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeView === v.key ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
            style={activeView === v.key ? { backgroundColor: BRAND } : {}}
          >
            <v.icon size={13} />
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
                {categories.map((c) => {
                  const avg = c.competencies.length > 0 ? Math.round(c.competencies.reduce((s: number, x: any) => s + x.score, 0) / c.competencies.length) : 0;
                  const isActive = activeCategory === c.id;
                  const cColor = c.competencies[0]?.color || BRAND;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategory(c.id)}
                      className={`flex items-center gap-2 px-5 py-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                        isActive ? "border-current" : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                      style={isActive ? { color: cColor, borderColor: cColor } : {}}
                    >
                      <CategoryIcon id={c.id} />
                      {c.title}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "text-white" : "text-gray-500 bg-gray-100"}`}
                        style={isActive ? { backgroundColor: cColor } : {}}
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
                  {radarData.length > 0 ? (
                    <CompetencyRadar data={radarData} accentColor={cat.competencies[0]?.color || BRAND} />
                  ) : (
                    <p className="text-xs text-gray-400 mt-10">No scores</p>
                  )}
                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full">
                    {cat.competencies.map((c: any) => (
                      <div key={c.id} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color || BRAND }} />
                        {c.name.length > 18 ? c.name.slice(0, 17) + "…" : c.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3 lg:col-span-2">
                  <p className="text-xs font-semibold text-gray-700">Individual Scores</p>
                  {cat.competencies.map((comp: any) => {
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
                            {comp.trend < 0 && (
                              <span className="flex items-center gap-0.5 text-[9px] text-red-500">
                                <FiTrendingDown size={9} />{comp.trend}%
                              </span>
                            )}
                            <span className="text-xs font-bold text-gray-700">{comp.score}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${comp.score}%`, backgroundColor: comp.color || BRAND }}
                          />
                        </div>
                        {/* Real evidence pills — sourced from completed activities and earned badges */}
                        {comp.evidence && comp.evidence.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {comp.evidence.map((ev: any, i: number) => {
                              const eType = EVIDENCE_TYPE[ev.type] || EVIDENCE_TYPE.activity;
                              return (
                                <span key={i} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${eType.bg} ${eType.text}`}>
                                  <FiLink size={8} className="inline mr-0.5" />{ev.title.length > 25 ? ev.title.slice(0, 24) + "…" : ev.title}
                                </span>
                              );
                            })}
                          </div>
                        ) : comp.score > 0 ? (
                          <p className="text-[9px] text-gray-400 mt-1">No linked evidence yet — this score was set directly by an administrator.</p>
                        ) : null}
                      </div>
                    );
                  })}
                  {cat.competencies.length === 0 && (
                      <p className="text-sm text-gray-500 italic mt-4">No competencies defined for this category.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended next steps — grounded in this student's real weakest competency in this category */}
          <DashboardCard title="Recommended Next Steps" subtitle={`For your ${cat.title} competencies`}>
            {cat.competencies.length > 0 ? (() => {
              const scored = cat.competencies.filter((c: any) => c.score > 0);
              const catWeakest = scored.length > 0 ? [...scored].sort((a: any, b: any) => a.score - b.score)[0] : null;
              const items = [
                {
                  icon: FiCompass,
                  label: "Explore activities",
                  text: `Browse the Activity Catalogue and enroll in more ${cat.title} activities to keep building this category.`,
                  href: "/dashboard/student/activity-catalogue",
                  cta: "Open Catalogue",
                },
                catWeakest
                  ? {
                      icon: FiTarget,
                      label: "Focus area",
                      text: `"${catWeakest.name}" is currently your lowest score in this category at ${catWeakest.score}%. Look for activities that name it explicitly as a competency.`,
                      href: "/dashboard/student/activity-catalogue",
                      cta: "Find activities",
                    }
                  : {
                      icon: FiTarget,
                      label: "Get started",
                      text: `None of your ${cat.title} competencies have a score yet. Complete an activity in this category to start building evidence.`,
                      href: "/dashboard/student/activity-catalogue",
                      cta: "Find activities",
                    },
                {
                  icon: FiAward,
                  label: "Next milestone",
                  text: `Reach ${cat.title} Practitioner level by earning more SAMAM Points from activities in this domain.`,
                  href: "/dashboard/student/badges",
                  cta: "View badges",
                },
              ];
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {items.map((r: any) => (
                    <div key={r.label} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 flex flex-col">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-gray-500"><r.icon size={16} /></span>
                        <p className="text-xs font-semibold text-gray-700">{r.label}</p>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed flex-1">{r.text}</p>
                      <a href={r.href} className="flex items-center gap-1 text-[11px] font-semibold mt-2" style={{ color: BRAND }}>
                        {r.cta} <FiArrowRight size={11} />
                      </a>
                    </div>
                  ))}
                </div>
              );
            })() : (
                <p className="text-xs text-gray-500">Not enough data to provide recommendations.</p>
            )}
          </DashboardCard>
        </>
      )}

      {/* ── INSIGHTS VIEW ── */}
      {activeView === "insights" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { label: "Strongest",       value: strongest ? `${strongest.name} (${strongest.score}%)` : "No scores yet", icon: FiAward },
              { label: "Needs attention", value: weakest ? `${weakest.name} (${weakest.score}%)` : "No scores yet",       icon: FiTarget },
              { label: "Trending up",     value: `${trendingUp} competenc${trendingUp === 1 ? "y" : "ies"}`,               icon: FiTrendingUp },
              { label: "Evidence linked", value: `${totalEvidence} activit${totalEvidence === 1 ? "y" : "ies"}/badges`,    icon: FiLink },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                  <s.icon size={13} />
                  <p className="text-[10px] uppercase tracking-wide font-semibold">{s.label}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 leading-snug">{s.value}</p>
              </div>
            ))}
          </div>

          <DashboardCard title="Category Comparison" subtitle="Average score across each competency domain">
            <div className="space-y-3">
              {overallScores.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                      <CategoryIcon id={c.id} />
                      {c.title}
                    </div>
                    <span className="text-xs font-bold text-gray-700">{c.avg}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${c.avg}%`, backgroundColor: c.competencies[0]?.color || BRAND }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Momentum" subtitle="Which competencies are moving, based on your most recent score updates">
            {allScored.length === 0 ? (
              <p className="text-xs text-gray-500">No scored competencies yet — complete activities to start tracking momentum.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allScored
                  .filter((c) => c.trend !== 0)
                  .sort((a, b) => Math.abs(b.trend) - Math.abs(a.trend))
                  .slice(0, 8)
                  .map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{c.name}</p>
                        <p className="text-[10px] text-gray-500">{c.categoryTitle}</p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-bold flex-shrink-0 ${c.trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {c.trend > 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                        {c.trend > 0 ? "+" : ""}{c.trend}%
                      </span>
                    </div>
                  ))}
                {allScored.filter((c) => c.trend !== 0).length === 0 && (
                  <p className="text-xs text-gray-500 col-span-2">Scores are steady — no recent movement recorded yet.</p>
                )}
              </div>
            )}
          </DashboardCard>
        </>
      )}
    </div>
  );
}
