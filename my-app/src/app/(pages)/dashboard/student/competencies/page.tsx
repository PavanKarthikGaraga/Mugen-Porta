"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiTrendingUp, FiTrendingDown, FiLink, FiTarget, FiArrowRight,
  FiCpu, FiBriefcase, FiAward, FiSearch, FiZap, FiHeart, FiTag,
  FiBarChart2, FiCompass, FiAlertCircle, FiInfo, FiChevronDown, FiChevronUp,
  FiCheckCircle, FiPlusCircle, FiGlobe,
} from "react-icons/fi";
import CompetencyRadar from "@/app/components/dashboard/CompetencyRadar";

const BRAND = "rgb(151,0,3)";

const LEVEL_CONFIG: Record<string, any> = {
  Explorer:     { color: "#6B7280", bg: "bg-gray-100",    next: "Foundation",   at: 20 },
  Foundation:   { color: "#059669", bg: "bg-emerald-50",  next: "Practitioner", at: 40 },
  Practitioner: { color: "#2563EB", bg: "bg-blue-50",     next: "Leader",       at: 60 },
  Leader:       { color: "#D97706", bg: "bg-amber-50",    next: "Mentor",       at: 75 },
  Mentor:       { color: "#7C3AED", bg: "bg-purple-50",   next: "Innovator",    at: 90 },
  Innovator:    { color: "#DC2626", bg: "bg-red-50",      next: null,           at: 100 },
};

const CATEGORY_ICON: Record<string, any> = {
  technical:    FiCpu,
  professional: FiBriefcase,
  leadership:   FiAward,
  research:     FiSearch,
  innovation:   FiZap,
  social:       FiGlobe,
  personal:     FiHeart,
};

const EVIDENCE_TYPE: Record<string, any> = {
  activity: { label: "Activity", bg: "bg-red-50",    text: "text-red-700" },
  badge:    { label: "Badge",    bg: "bg-amber-50",  text: "text-amber-700" },
};

function CategoryIcon({ id, size = 14 }: { id: string; size?: number }) {
  const Icon = CATEGORY_ICON[id] || FiTag;
  return <Icon size={size} />;
}

export default function CompetenciesPage() {
  const [categories, setCategories]   = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState(false);
  const [activeCategory, setActiveCategory] = useState("technical");
  const [activeView, setActiveView]   = useState("overview");
  const [expanded, setExpanded]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) throw new Error("Not authenticated");
      const authData = await authRes.json();
      const res = await fetch(`/api/dashboard/student/samam/competencies/${authData.user.username}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCategories(data);
      if (data.length > 0)
        setActiveCategory((prev) => data.some((c: any) => c.id === prev) ? prev : data[0].id);
      setLoadError(false);
    } catch (e) {
      console.error(e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <FiAlertCircle size={30} className="mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium text-gray-700">Couldn&apos;t load your competencies</p>
        <button onClick={load} className="text-xs font-semibold mt-2 hover:underline" style={{ color: BRAND }}>
          Try again
        </button>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return <div className="p-8 text-center text-gray-500">No competencies are configured yet.</div>;
  }

  const cat = categories.find((c) => c.id === activeCategory) || categories[0];

  // Radar shows only scored (non-opportunity) competencies — max 8 to keep chart readable
  const radarData = cat.competencies
    .filter((c: any) => !c.isOpportunity && c.score > 0)
    .slice(0, 8)
    .map((c: any) => ({ name: c.name, score: c.score }));

  // Per-category average: only from scored (evidence-based) competencies
  const overall = categories.map((c) => {
    const scored = c.competencies.filter((x: any) => !x.isOpportunity && x.score > 0);
    return {
      ...c,
      avg: scored.length
        ? Math.round(scored.reduce((s: number, x: any) => s + x.score, 0) / scored.length)
        : 0,
      scoredCount: scored.length,
    };
  });

  // Flat list of all scored competencies
  const allScored = categories.flatMap((c: any) =>
    c.competencies
      .filter((x: any) => !x.isOpportunity && x.score > 0)
      .map((x: any) => ({ ...x, categoryTitle: c.title, categoryId: c.id }))
  );

  const strongest   = [...allScored].sort((a, b) => b.score - a.score)[0] || null;
  const totalEvidence = allScored.reduce((s, c) => s + (c.evidence?.length || 0), 0);
  const anyDerived  = allScored.some((c) => c.scoreSource === "derived");

  // "How to improve" — weak scored competencies with suggestions, PLUS 0-score opportunities
  const allWithSuggestions = categories.flatMap((c: any) =>
    c.competencies
      .filter((x: any) => x.suggestions?.length > 0)
      .map((x: any) => ({ ...x, categoryTitle: c.title, categoryId: c.id }))
  );
  const growth = [...allWithSuggestions]
    .sort((a, b) => (a.score - b.score) || (b.opportunityCount - a.opportunityCount))
    .slice(0, 6);

  const hasAnyData = allScored.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Competency Profile</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Built automatically from the activities you complete and badges you earn.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {overall.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setActiveView("overview"); setActiveCategory(c.id); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    activeCategory === c.id && activeView === "overview"
                      ? "border-transparent text-white"
                      : "bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 hover:border-gray-200"
                  }`}
                  style={activeCategory === c.id && activeView === "overview" ? { backgroundColor: BRAND } : {}}
                >
                  <CategoryIcon id={c.id} />
                  <span className="text-xs font-bold">{c.avg}%</span>
                  <span className="text-[10px] opacity-75">{c.title.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Nothing yet ── */}
      {!hasAnyData && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 text-center">
          <FiCompass size={30} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-semibold text-gray-800 dark:text-white">Your profile fills in as you complete activities</p>
          <p className="text-xs text-gray-500 mt-1.5 max-w-lg mx-auto leading-relaxed">
            Every activity lists the competencies it develops. Once marked complete, those competencies
            start filling in here automatically — no self-assessment needed.
          </p>
          <Link
            href="/dashboard/student/activity-catalogue"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: BRAND }}
          >
            Find an activity <FiArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* ── View toggle ── */}
      <div className="flex gap-1 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-1 w-fit shadow-sm">
        {[
          { key: "overview",  label: "Competencies",    icon: FiCompass },
          { key: "grow",      label: "How to improve",  icon: FiTarget },
          { key: "insights",  label: "Insights",        icon: FiBarChart2 },
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

      {/* ══ OVERVIEW ══ */}
      {activeView === "overview" && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 dark:border-zinc-800 overflow-x-auto">
            <div className="flex min-w-max">
              {categories.map((c) => {
                const sc = c.competencies.filter((x: any) => !x.isOpportunity && x.score > 0);
                const avg = sc.length ? Math.round(sc.reduce((s: number, x: any) => s + x.score, 0) / sc.length) : 0;
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
              {/* Radar */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 self-start">Radar Profile</p>
                {radarData.length > 1
                  ? <CompetencyRadar data={radarData} accentColor={cat.competencies[0]?.color || BRAND} />
                  : (
                    <div className="w-full h-40 flex items-center justify-center text-center px-4">
                      <p className="text-xs text-gray-400">
                        {radarData.length === 1
                          ? "Complete at least 2 different activities to see the radar chart."
                          : "No completed activities in this category yet."}
                      </p>
                    </div>
                  )
                }
              </div>

              {/* Competency list */}
              <div className="space-y-2.5 lg:col-span-2">
                {/* Scored competencies */}
                {cat.competencies.filter((c: any) => !c.isOpportunity).length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your competencies in this area</p>
                    {cat.competencies
                      .filter((c: any) => !c.isOpportunity)
                      .map((comp: any) => <CompetencyRow key={comp.id} comp={comp} expanded={expanded} setExpanded={setExpanded} />)}
                  </>
                )}

                {/* Opportunities (0-score) */}
                {cat.competencies.filter((c: any) => c.isOpportunity).length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Areas to explore in this category
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {cat.competencies
                        .filter((c: any) => c.isOpportunity)
                        .map((comp: any) => (
                          <div key={comp.id} className="flex items-start justify-between gap-2 p-2.5 rounded-lg border border-dashed border-gray-200 dark:border-zinc-700">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">{comp.name}</p>
                              <p className="text-[10px] text-gray-400">{comp.opportunityCount} activit{comp.opportunityCount === 1 ? "y" : "ies"} available</p>
                            </div>
                            {comp.suggestions?.[0] && (
                              <Link
                                href={`/dashboard/student/activity-catalogue/${comp.suggestions[0].code}`}
                                className="flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md bg-gray-50 dark:bg-zinc-800 text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap"
                              >
                                Start
                              </Link>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {cat.competencies.length === 0 && (
                  <p className="text-sm text-gray-500 italic mt-4">No competencies defined for this category yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ HOW TO IMPROVE ══ */}
      {activeView === "grow" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Your biggest growth opportunities</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Competencies you can build right now, ranked by lowest score first.
              Each card links to real catalogue activities that develop them.
            </p>
          </div>

          {growth.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm text-center py-14 px-6">
              <FiCheckCircle size={28} className="mx-auto mb-3 text-emerald-400" />
              <p className="text-sm font-semibold text-gray-700 dark:text-white">You&apos;re on top of it!</p>
              <p className="text-xs text-gray-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                You&apos;re either enrolled in every activity that maps to your competencies,
                or more activities are being added to the catalogue soon.
              </p>
            </div>
          ) : growth.map((c: any) => (
            <div key={c.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3 flex-wrap border-b border-gray-50 dark:border-zinc-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-400"><CategoryIcon id={c.categoryId} /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.categoryTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-28 h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.score}%`, backgroundColor: c.color || BRAND }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200 w-9 text-right">{c.score}%</span>
                </div>
              </div>

              {/* What's built so far */}
              {c.evidence?.length > 0 && (
                <div className="px-4 pt-3 pb-0">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Already built via</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.evidence.slice(0, 4).map((ev: any, i: number) => {
                      const t = EVIDENCE_TYPE[ev.type] || EVIDENCE_TYPE.activity;
                      return (
                        <span key={i} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${t.bg} ${t.text}`}>
                          {ev.title.length > 30 ? ev.title.slice(0, 29) + "…" : ev.title}
                        </span>
                      );
                    })}
                    {c.evidence.length > 4 && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        +{c.evidence.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p className="col-span-full text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                  Activities to boost this ({c.opportunityCount} in catalogue)
                </p>
                {c.suggestions.map((s: any) => (
                  <Link
                    key={s.code}
                    href={`/dashboard/student/activity-catalogue/${s.code}`}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-500 hover:shadow-sm transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{s.title}</p>
                      <p className="text-[10px] font-mono text-gray-400">
                        {s.code}{s.domain ? ` · ${s.domain}` : ""}{s.credits ? ` · ${s.credits} pts` : ""}
                      </p>
                    </div>
                    <FiArrowRight size={13} className="text-gray-300 group-hover:text-gray-700 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ INSIGHTS ══ */}
      {activeView === "insights" && (
        <div className="space-y-4">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Strongest area",
                value: strongest ? strongest.name.split(" ").slice(0, 3).join(" ") : "—",
                sub: strongest ? `${strongest.score}% · ${strongest.level}` : "complete an activity",
                icon: FiAward,
              },
              {
                label: "Competencies built",
                value: `${allScored.length}`,
                sub: "with evidence from activities",
                icon: FiTrendingUp,
              },
              {
                label: "Activities & badges",
                value: `${totalEvidence}`,
                sub: "pieces of evidence recorded",
                icon: FiLink,
              },
              {
                label: "Growth opportunities",
                value: `${growth.length}`,
                sub: "areas with activities available",
                icon: FiTarget,
              },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-4">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                  <s.icon size={13} />
                  <p className="text-[10px] uppercase tracking-wide font-semibold">{s.label}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug truncate" title={String(s.value)}>{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Category comparison */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Category breakdown</h2>
            <p className="text-xs text-gray-500 mb-4">
              Average score across the competencies you&apos;ve started in each domain.
            </p>
            <div className="space-y-4">
              {overall.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                      <CategoryIcon id={c.id} />
                      {c.title}
                      <span className="text-[10px] text-gray-400">({c.scoredCount} competenc{c.scoredCount === 1 ? "y" : "ies"})</span>
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                      {c.scoredCount > 0 ? `${c.avg}%` : "—"}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${c.avg}%`, backgroundColor: c.competencies[0]?.color || BRAND }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coverage table — top competencies by catalogue opportunity count */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Activity coverage</h2>
            <p className="text-xs text-gray-500 mb-4">
              For the competencies you&apos;ve started, how many of the available catalogue activities have you completed?
            </p>
            {allScored.filter(c => c.opportunityCount > 0).length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                No catalogue activities have listed competencies yet. Coverage will appear automatically once activities are catalogued.
              </p>
            ) : (
              <div className="space-y-2.5">
                {[...allScored]
                  .filter((c) => c.opportunityCount > 0)
                  .sort((a, b) => b.opportunityCount - a.opportunityCount)
                  .slice(0, 12)
                  .map((c: any) => {
                    const pct = Math.min(100, Math.round((c.activityCount / c.opportunityCount) * 100));
                    return (
                      <div key={c.id} className="flex items-center gap-3">
                        <p className="text-xs text-gray-700 dark:text-gray-300 flex-1 min-w-0 truncate">{c.name}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">
                            {c.activityCount}
                          </span>
                          <span className="text-[10px] text-gray-400">of {c.opportunityCount}</span>
                          <div className="w-20 h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color || BRAND }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Level distribution */}
          {allScored.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Level distribution</h2>
              <p className="text-xs text-gray-500 mb-4">
                Your competencies distributed across mastery levels.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(LEVEL_CONFIG).map(([lvl, cfg]: any) => {
                  const count = allScored.filter(c => c.level === lvl).length;
                  if (count === 0) return null;
                  return (
                    <div key={lvl} className={`${cfg.bg} rounded-lg p-3 flex items-center gap-3`}>
                      <div>
                        <p className="text-lg font-black" style={{ color: cfg.color }}>{count}</p>
                        <p className="text-[10px] font-semibold" style={{ color: cfg.color }}>{lvl}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Score methodology note */}
      {anyDerived && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900">
          <FiInfo size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <strong className="text-gray-700 dark:text-gray-300">How scores are calculated:</strong> Each completed activity that lists a
            competency contributes to a logarithmic progression (1 activity ≈ 18%, 3 ≈ 44%, 5 ≈ 64%,
            saturating near 100%). Each badge adds 15%. The formula rewards breadth early and depth
            as you advance — completing 5 activities beats completing 1 five times. If an administrator
            records an official score, that value is shown instead.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Competency row (shared) ───────────────────────────────────────────────────
function CompetencyRow({ comp, expanded, setExpanded }: {
  comp: any;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
}) {
  const lc = LEVEL_CONFIG[comp.level] || LEVEL_CONFIG.Explorer;
  const isOpen = expanded === comp.id;
  const toNext = lc.next ? Math.max(0, lc.at - comp.score) : 0;

  return (
    <div className="rounded-lg border border-gray-100 dark:border-zinc-800 overflow-hidden">
      <button
        onClick={() => setExpanded(isOpen ? null : comp.id)}
        className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-1.5 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{comp.name}</span>
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${lc.bg}`}
              style={{ color: lc.color }}
            >
              {comp.level}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{comp.score}%</span>
            {isOpen
              ? <FiChevronUp size={13} className="text-gray-400" />
              : <FiChevronDown size={13} className="text-gray-400" />}
          </div>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${comp.score}%`, backgroundColor: comp.color || BRAND }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 gap-2">
          <p className="text-[10px] text-gray-500">
            {comp.activityCount} activit{comp.activityCount === 1 ? "y" : "ies"}
            {comp.badgeCount ? ` · ${comp.badgeCount} badge${comp.badgeCount === 1 ? "" : "s"}` : ""}
          </p>
          {lc.next && (
            <p className="text-[10px] text-gray-400">
              {toNext > 0 ? `${toNext}% to ${lc.next}` : `Ready for ${lc.next}`}
            </p>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-50 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 space-y-3">
          {comp.evidence?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">What built this</p>
              <div className="flex flex-wrap gap-1">
                {comp.evidence.map((ev: any, i: number) => {
                  const t = EVIDENCE_TYPE[ev.type] || EVIDENCE_TYPE.activity;
                  return (
                    <span key={i} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${t.bg} ${t.text}`}>
                      <FiLink size={8} className="inline mr-0.5" />
                      {ev.title.length > 32 ? ev.title.slice(0, 31) + "…" : ev.title}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {comp.suggestions?.length > 0 ? (
            <div>
              <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Activities that build this ({comp.opportunityCount} available)
              </p>
              <div className="space-y-1">
                {comp.suggestions.map((s: any) => (
                  <Link
                    key={s.code}
                    href={`/dashboard/student/activity-catalogue/${s.code}`}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-500 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-gray-800 dark:text-gray-200 truncate group-hover:text-gray-900">{s.title}</p>
                      <p className="text-[9px] font-mono text-gray-400">
                        {s.code}{s.credits ? ` · ${s.credits} pts` : ""}
                        {s.difficulty ? ` · ${s.difficulty}` : ""}
                      </p>
                    </div>
                    <FiPlusCircle size={13} className="text-gray-300 group-hover:text-gray-600 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-gray-500">
              {comp.opportunityCount > 0
                ? "You're already enrolled in every catalogue activity that builds this."
                : "No catalogue activity currently lists this competency."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
