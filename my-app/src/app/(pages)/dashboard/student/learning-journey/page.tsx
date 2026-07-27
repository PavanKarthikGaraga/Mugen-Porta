"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiLock, FiCheckCircle, FiArrowRight, FiZap, FiAward } from "react-icons/fi";
import { Compass, Layers, Briefcase, Award, Lightbulb, Star } from "lucide-react";
import { JOURNEY_STAGES, DOMAINS } from "@/app/Data/activities-mock";

const BRAND = "rgb(151,0,3)";

const getIcon = (name: string, size = 24) => {
  switch (name) {
    case "Compass":   return <Compass   size={size} />;
    case "Layers":    return <Layers    size={size} />;
    case "Briefcase": return <Briefcase size={size} />;
    case "Award":     return <Award     size={size} />;
    case "Lightbulb": return <Lightbulb size={size} />;
    case "Star":      return <Star      size={size} />;
    default:          return <Star      size={size} />;
  }
};

// Human-readable points label
function pts(n: number) {
  return n.toLocaleString() + " pts";
}

export default function LearningJourneyPage() {
  const [activeStage,    setActiveStage   ] = useState("explorer");
  const [activeTab,      setActiveTab     ] = useState("activities");
  const [studentCredits, setStudentCredits] = useState(0);
  const [loading,        setLoading       ] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Not auth");
        const { user } = await res.json();
        const sdcRes = await fetch(`/api/dashboard/student/samam/sdc/${user.username}`);
        if (sdcRes.ok) {
          const sdcData = await sdcRes.json();
          setStudentCredits(sdcData.total || 0);
        }
      } catch (err) {
        console.error("Failed to load credits", err);
      }
      setLoading(false);
    })();
  }, []);

  const activeStageData = JOURNEY_STAGES.find((s) => s.id === activeStage);

  // Determine which level the student is currently at
  const currentLevelIdx = [...JOURNEY_STAGES]
    .reverse()
    .findIndex((s) => studentCredits >= s.credits_required);
  const currentLevel = JOURNEY_STAGES[JOURNEY_STAGES.length - 1 - currentLevelIdx] || JOURNEY_STAGES[0];

  const isUnlocked = (stage: any) => studentCredits >= stage.credits_required;
  const isCurrent  = (stage: any) => stage.id === currentLevel.id;

  // Next level (for progress bar)
  const currentIdx  = JOURNEY_STAGES.findIndex((s) => s.id === currentLevel.id);
  const nextLevel   = JOURNEY_STAGES[currentIdx + 1] || null;
  const progressPct = nextLevel
    ? Math.min(100, Math.round(
        ((studentCredits - currentLevel.credits_required) /
         (nextLevel.credits_required - currentLevel.credits_required)) * 100
      ))
    : 100;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-4 animate-pulse">
        <div className="h-24 bg-gray-100 rounded-2xl" />
        {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-8">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${BRAND} 0%, #7C3AED 50%, #2563EB 100%)` }} />
        <div className="p-5 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Your Learning Journey</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Progress through 6 stages of holistic development. Earn SAMAM Points to unlock the next level.
            </p>
          </div>

          {/* Points + progress to next level */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 min-w-[220px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <FiZap size={15} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-none">Total SAMAM Points</p>
                <p className="text-2xl font-black text-gray-900 leading-tight">{studentCredits.toLocaleString()}</p>
              </div>
            </div>
            {nextLevel ? (
              <>
                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                  <span>→ {nextLevel.name}</span>
                  <span className="font-bold" style={{ color: nextLevel.color }}>
                    {nextLevel.credits_required - studentCredits > 0
                      ? `${(nextLevel.credits_required - studentCredits).toLocaleString()} pts to go`
                      : "Unlocking…"}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%`, backgroundColor: nextLevel.color }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs font-bold text-pink-600 flex items-center gap-1">
                <Star size={12} /> Highest level reached!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Level roadmap ── */}
      <div className="relative">
        {/* Vertical connector */}
        <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gray-200 z-0 hidden sm:block" />

        <div className="space-y-3">
          {JOURNEY_STAGES.map((stage, idx) => {
            const unlocked  = isUnlocked(stage);
            const current   = isCurrent(stage);
            const isActive  = activeStage === stage.id;
            const nextStage = JOURNEY_STAGES[idx + 1];
            const ptsNeeded = stage.credits_required - studentCredits;

            return (
              <div key={stage.id} className="relative flex items-start gap-4">

                {/* Stage orb */}
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 ${
                    isActive ? "shadow-lg scale-110 text-white" : "hover:scale-105 shadow-sm"
                  } ${!unlocked ? "opacity-50" : ""}`}
                  style={
                    isActive
                      ? { backgroundColor: stage.color, borderColor: stage.color }
                      : { backgroundColor: stage.bg, borderColor: stage.border }
                  }
                  aria-label={stage.name}
                >
                  <span style={{ color: isActive ? "#fff" : stage.color }}>
                    {getIcon(stage.icon, 26)}
                  </span>
                  {/* Badges */}
                  {current && unlocked && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white"
                      style={{ backgroundColor: stage.color }}
                    >
                      YOU
                    </span>
                  )}
                  {!current && unlocked && (
                    <FiCheckCircle
                      className="absolute -top-1 -right-1 bg-white rounded-full text-emerald-500"
                      size={16}
                    />
                  )}
                  {!unlocked && (
                    <FiLock
                      className="absolute -top-1 -right-1 bg-white rounded-full text-gray-400"
                      size={14}
                    />
                  )}
                </button>

                {/* Stage card */}
                <div
                  className={`flex-1 bg-white rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive ? "shadow-md" : "shadow-sm hover:shadow-md"
                  } ${!unlocked ? "opacity-80" : ""}`}
                  style={{ borderColor: isActive ? stage.color : "#E5E7EB" }}
                  onClick={() => setActiveStage(stage.id)}
                >
                  {isActive && <div className="h-1" style={{ backgroundColor: stage.color }} />}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Level name badge */}
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{ backgroundColor: stage.bg, color: stage.color }}
                        >
                          {stage.name}
                        </span>

                        {/* Status chip */}
                        {current && unlocked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✦ Current Level
                          </span>
                        ) : unlocked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex items-center gap-0.5">
                            <FiCheckCircle size={9} /> Unlocked
                          </span>
                        ) : null}
                      </div>

                      {/* Required points */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {stage.credits_required === 0 ? (
                          <span className="text-[10px] font-semibold text-gray-400">Starting level</span>
                        ) : (
                          <span
                            className="text-[10px] font-bold px-2.5 py-1 rounded-xl border"
                            style={{
                              color: unlocked ? stage.color : "#6B7280",
                              backgroundColor: unlocked ? stage.bg : "#F9FAFB",
                              borderColor: unlocked ? stage.border : "#E5E7EB",
                            }}
                          >
                            <FiZap size={9} className="inline mr-0.5" />
                            {pts(stage.credits_required)} required
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-1.5">{stage.description}</p>

                    {/* Progress bar — only for current level */}
                    {current && nextStage && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                          <span>{studentCredits.toLocaleString()} / {nextStage.credits_required.toLocaleString()} pts</span>
                          <span className="font-bold" style={{ color: stage.color }}>{progressPct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progressPct}%`, backgroundColor: stage.color }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {(nextStage.credits_required - studentCredits).toLocaleString()} more pts to reach <span className="font-bold" style={{ color: nextStage.color }}>{nextStage.name}</span>
                        </p>
                      </div>
                    )}

                    {/* Locked: show how many pts still needed */}
                    {!unlocked && (
                      <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                        <FiLock size={9} />
                        Earn {ptsNeeded.toLocaleString()} more pts to unlock
                      </p>
                    )}
                  </div>
                </div>

                {/* Connector arrow */}
                {idx < JOURNEY_STAGES.length - 1 && (
                  <div className="absolute left-8 bottom-0 translate-y-1/2 z-20 hidden sm:flex items-center justify-center">
                    <FiArrowRight size={12} className="rotate-90 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Active Stage Detail ── */}
      {activeStageData && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1" style={{ backgroundColor: activeStageData.color }} />
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: activeStageData.bg, color: activeStageData.color }}
              >
                {getIcon(activeStageData.icon, 24)}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{activeStageData.name} — Activities</h2>
                <p className="text-xs text-gray-400">
                  {activeStageData.activities.length} activities in this stage ·{" "}
                  {activeStageData.credits_required === 0
                    ? "Starting level"
                    : `Requires ${pts(activeStageData.credits_required)}`}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-50 p-1 rounded-xl w-fit">
              {["activities", "competencies", "badges"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg capitalize transition-all ${
                    activeTab === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "activities" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeStageData.activities.slice(0, 9).map((a: any) => {
                  const dom = DOMAINS[a.domain] || DOMAINS.TEC;
                  return (
                    <Link
                      key={a.id}
                      href={`/dashboard/student/activity-catalogue/${a.code}`}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50 hover:bg-white"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: dom.color }}
                      >
                        {a.domain[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{a.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          <span className="font-bold" style={{ color: BRAND }}>{a.credits} pts</span>
                          {a.difficulty ? ` · ${a.difficulty}` : ""}
                        </p>
                        {a.userStatus === "completed" && (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-0.5">
                            <FiCheckCircle size={9} /> Completed
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
                {activeStageData.activities.length === 0 && (
                  <p className="text-sm text-gray-400 italic col-span-3">No activities in this stage.</p>
                )}
              </div>
            )}

            {activeTab === "competencies" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...new Set(activeStageData.activities.flatMap((a: any) => a.competencies || []))].slice(0, 8).map((c: any) => (
                  <div
                    key={c}
                    className="p-3 rounded-xl border text-center"
                    style={{ backgroundColor: activeStageData.bg, borderColor: activeStageData.border }}
                  >
                    <p className="text-xs font-semibold" style={{ color: activeStageData.color }}>{c}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "badges" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeStageData.activities.slice(0, 8).map((a: any) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border text-center ${!a.badgeEarned ? "opacity-50" : ""}`}
                    style={
                      a.badgeEarned
                        ? { backgroundColor: activeStageData.bg, borderColor: activeStageData.color }
                        : { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }
                    }
                  >
                    <p className="mb-1 flex justify-center" style={{ color: a.badgeEarned ? activeStageData.color : "#9CA3AF" }}>
                      {a.badgeEarned ? <FiAward size={22} /> : <FiLock size={22} />}
                    </p>
                    <p className="text-[11px] font-semibold text-gray-800">{a.badge}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5 truncate">{a.code}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-center">
              <Link
                href="/dashboard/student/activity-catalogue"
                className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                style={{ color: BRAND }}
              >
                View all activities in catalogue <FiArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
