"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiTrendingUp, FiTrendingDown, FiLink, FiTarget, FiArrowRight,
  FiCpu, FiBriefcase, FiAward, FiSearch, FiZap, FiHeart, FiTag,
  FiBarChart2, FiCompass, FiAlertCircle, FiInfo, FiChevronDown, FiChevronUp,
  FiCheckCircle, FiPlusCircle,
} from "react-icons/fi";
import CompetencyRadar from "@/app/components/dashboard/CompetencyRadar";

const BRAND = "rgb(151,0,3)";

const LEVEL_CONFIG: Record<string, any> = {
  Explorer:     { color: "#6B7280", bg: "bg-gray-100",   next: "Foundation",   at: 20 },
  Foundation:   { color: "#059669", bg: "bg-emerald-50", next: "Practitioner", at: 40 },
  Practitioner: { color: "#2563EB", bg: "bg-blue-50",    next: "Leader",       at: 60 },
  Leader:       { color: "#D97706", bg: "bg-amber-50",   next: "Mentor",       at: 75 },
  Mentor:       { color: "#7C3AED", bg: "bg-purple-50",  next: "Innovator",    at: 90 },
  Innovator:    { color: "#DC2626", bg: "bg-red-50",     next: null,           at: 100 },
};

const CATEGORY_ICON: Record<string, any> = {
  technical: FiCpu, professional: FiBriefcase, leadership: FiAward,
  research: FiSearch, innovation: FiZap, personal: FiHeart,
};

const EVIDENCE_TYPE: Record<string, any> = {
  activity: { label: "Activity", bg: "bg-red-50", text: "text-red-700" },
  badge: { label: "Badge", bg: "bg-amber-50", text: "text-amber-700" },
};

function CategoryIcon({ id, size = 14 }: { id: string; size?: number }) {
  const Icon = CATEGORY_ICON[id] || FiTag;
  return <Icon size={size} />;
}

export default function CompetenciesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("technical");
  const [activeView, setActiveView] = useState("overview");
  const [expanded, setExpanded] = useState<string | null>(null);

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
      if (data.length > 0) setActiveCategory((prev) => data.some((c: any) => c.id === prev) ? prev : data[0].id);
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
        <button onClick={load} className="text-xs font-semibold mt-2 hover:underline" style={{ color: BRAND }}>Try again</button>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return <div className="p-8 text-center text-gray-500">No competencies are configured yet.</div>;
  }

  const cat = categories.find((c) => c.id === activeCategory) || categories[0];
  const radarData = cat.competencies.map((c: any) => ({ name: c.name, score: c.score }));

  const overall = categories.map((c) => ({
    ...c,
    avg: c.competencies.length ? Math.round(c.competencies.reduce((s: number, x: any) => s + x.score, 0) / c.competencies.length) : 0,
  }));

  const all = categories.flatMap((c: any) =>
    c.competencies.map((x: any) => ({ ...x, categoryTitle: c.title, categoryId: c.id }))
  );
  const scored = all.filter((c) => c.score > 0);
  const strongest = [...scored].sort((a, b) => b.score - a.score)[0] || null;
  const totalEvidence = all.reduce((s, c) => s + (c.evidence?.length || 0), 0);
  const anyDerived = all.some((c) => c.scoreSource === "derived" && c.score > 0);

  // Biggest wins available: competencies with the most catalogue activities
  // that would develop them, weighted toward what's currently weakest.
  const growth = [...all]
    .filter((c) => c.suggestions?.length > 0)
    .sort((a, b) => (a.score - b.score) || (b.opportunityCount - a.opportunityCount))
    .slice(0, 5);

  const hasAnyData = scored.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Competency Profile</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Built automatically from the activities you complete and the badges you earn.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {overall.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setActiveView("overview"); setActiveCategory(c.id); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    activeCategory === c.id && activeView === "overview"
                      ? "border-transparent text-white" : "bg-gray-50 border-gray-100 hover:border-gray-200"
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

      {/* ── Nothing yet: explain how this fills up ── */}
      {!hasAnyData && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <FiCompass size={30} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-semibold text-gray-800">Your profile is waiting on your first completed activity</p>
          <p className="text-xs text-gray-500 mt-1.5 max-w-lg mx-auto leading-relaxed">
            Every activity and badge lists the competencies it develops. As soon as an activity is
            marked complete, the competencies it covers start filling in here — no self-assessment
            needed.
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
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
        {[
          { key: "overview", label: "Competencies", icon: FiCompass },
          { key: "grow", label: "How to improve", icon: FiTarget },
          { key: "insights", label: "Insights", icon: FiBarChart2 },
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 overflow-x-auto">
            <div className="flex min-w-max">
              {categories.map((c) => {
                const avg = c.competencies.length ? Math.round(c.competencies.reduce((s: number, x: any) => s + x.score, 0) / c.competencies.length) : 0;
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
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-semibold text-gray-700 self-start">Radar Profile</p>
                {radarData.length > 0
                  ? <CompetencyRadar data={radarData} accentColor={cat.competencies[0]?.color || BRAND} />
                  : <p className="text-xs text-gray-400 mt-10">No competencies</p>}
              </div>

              <div className="space-y-2.5 lg:col-span-2">
                <p className="text-xs font-semibold text-gray-700">Individual competencies</p>
                {cat.competencies.map((comp: any) => {
                  const lc = LEVEL_CONFIG[comp.level] || LEVEL_CONFIG.Explorer;
                  const isOpen = expanded === comp.id;
                  const toNext = lc.next ? Math.max(0, lc.at - comp.score) : 0;
                  return (
                    <div key={comp.id} className="rounded-lg border border-gray-100 overflow-hidden">
                      <button
                        onClick={() => setExpanded(isOpen ? null : comp.id)}
                        className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-medium text-gray-800 truncate">{comp.name}</span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${lc.bg}`} style={{ color: lc.color }}>
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
                            <span className="text-xs font-bold text-gray-700">{comp.score}%</span>
                            {isOpen ? <FiChevronUp size={13} className="text-gray-400" /> : <FiChevronDown size={13} className="text-gray-400" />}
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                               style={{ width: `${comp.score}%`, backgroundColor: comp.color || BRAND }} />
                        </div>
                        <div className="flex items-center justify-between mt-1.5 gap-2">
                          <p className="text-[10px] text-gray-500">
                            {comp.evidence?.length
                              ? `${comp.activityCount} activit${comp.activityCount === 1 ? "y" : "ies"}${comp.badgeCount ? ` · ${comp.badgeCount} badge${comp.badgeCount === 1 ? "" : "s"}` : ""}`
                              : "No evidence yet"}
                          </p>
                          {lc.next && (
                            <p className="text-[10px] text-gray-400">
                              {toNext > 0 ? `${toNext}% to ${lc.next}` : `Ready for ${lc.next}`}
                            </p>
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-3 pb-3 pt-1 border-t border-gray-50 bg-gray-50/50 space-y-3">
                          {comp.evidence?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5">What built this</p>
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
                              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                                Activities that build this ({comp.opportunityCount} available)
                              </p>
                              <div className="space-y-1">
                                {comp.suggestions.map((s: any) => (
                                  <Link
                                    key={s.code}
                                    href={`/dashboard/student/activity-catalogue/${s.code}`}
                                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-gray-100 hover:border-gray-300 transition-colors group"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-medium text-gray-800 truncate group-hover:text-gray-900">{s.title}</p>
                                      <p className="text-[9px] font-mono text-gray-400">{s.code}{s.credits ? ` · ${s.credits} pts` : ""}</p>
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
                })}
                {cat.competencies.length === 0 && (
                  <p className="text-sm text-gray-500 italic mt-4">No competencies defined for this category.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ HOW TO IMPROVE ══ */}
      {activeView === "grow" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900">Your biggest opportunities</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Your lowest competencies, paired with real catalogue activities that develop them.
            </p>
          </div>

          {growth.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-14 px-6">
              <FiCheckCircle size={28} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">No suggestions available</p>
              <p className="text-xs text-gray-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                Either you&apos;re enrolled in everything that maps to your competencies, or the
                catalogue activities haven&apos;t listed which competencies they develop yet.
              </p>
            </div>
          ) : growth.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3 flex-wrap border-b border-gray-50">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-400"><CategoryIcon id={c.categoryId} /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.categoryTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.score}%`, backgroundColor: c.color || BRAND }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-9 text-right">{c.score}%</span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {c.suggestions.map((s: any) => (
                  <Link
                    key={s.code}
                    href={`/dashboard/student/activity-catalogue/${s.code}`}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{s.title}</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Strongest", value: strongest ? strongest.name : "—", sub: strongest ? `${strongest.score}%` : "no data", icon: FiAward },
              { label: "Developing", value: `${scored.length} of ${all.length}`, sub: "competencies started", icon: FiTrendingUp },
              { label: "Evidence", value: `${totalEvidence}`, sub: "activities & badges", icon: FiLink },
              { label: "Open to build", value: `${growth.length}`, sub: "with activities available", icon: FiTarget },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                  <s.icon size={13} />
                  <p className="text-[10px] uppercase tracking-wide font-semibold">{s.label}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 leading-snug truncate" title={String(s.value)}>{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-0.5">Category comparison</h2>
            <p className="text-xs text-gray-500 mb-4">Average score across each competency domain.</p>
            <div className="space-y-3">
              {overall.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                      <CategoryIcon id={c.id} />
                      {c.title}
                    </div>
                    <span className="text-xs font-bold text-gray-700">{c.avg}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width: `${c.avg}%`, backgroundColor: c.competencies[0]?.color || BRAND }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-0.5">Coverage</h2>
            <p className="text-xs text-gray-500 mb-4">
              How many catalogue activities exist for each competency, and how many you&apos;ve completed.
            </p>
            <div className="space-y-2">
              {[...all]
                .filter((c) => c.opportunityCount > 0)
                .sort((a, b) => b.opportunityCount - a.opportunityCount)
                .slice(0, 10)
                .map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <p className="text-xs text-gray-700 flex-1 min-w-0 truncate">{c.name}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-semibold text-gray-700">{c.activityCount}</span>
                      <span className="text-[10px] text-gray-400">of {c.opportunityCount}</span>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                             style={{ width: `${Math.min(100, (c.activityCount / c.opportunityCount) * 100)}%`, backgroundColor: c.color || BRAND }} />
                      </div>
                    </div>
                  </div>
                ))}
              {all.every((c) => c.opportunityCount === 0) && (
                <p className="text-xs text-gray-500">
                  No catalogue activity lists the competencies it develops yet, so coverage can&apos;t be calculated.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* How scores are calculated — shown only when scores are derived */}
      {anyDerived && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl border border-gray-200 bg-gray-50">
          <FiInfo size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Scores are calculated from your record: each completed activity that lists a competency
            adds 20%, and each badge adds 25%, capped at 100%. They update automatically as you
            complete more. If an administrator records an official score for a competency, that
            value is shown instead.
          </p>
        </div>
      )}
    </div>
  );
}
