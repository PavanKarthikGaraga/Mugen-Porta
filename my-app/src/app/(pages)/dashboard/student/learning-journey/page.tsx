"use client";
import { useState, useEffect } from "react";
import { FiLock, FiCheckCircle, FiArrowRight, FiZap } from "react-icons/fi";
import { Compass, Layers, Briefcase, Award, Lightbulb, Star } from "lucide-react";
import { JOURNEY_STAGES } from "@/app/Data/activities-mock";

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

    </div>
  );
}
