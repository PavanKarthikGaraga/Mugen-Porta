"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiLock, FiCheckCircle, FiArrowRight, FiZap } from "react-icons/fi";
import { JOURNEY_STAGES, DOMAINS } from "@/app/Data/activities-mock";

const BRAND = "rgb(151,0,3)";

export default function LearningJourneyPage() {
  const [activeStage, setActiveStage] = useState("practitioner");
  const [activeTab, setActiveTab]   = useState("activities");
  const [studentCredits, setStudentCredits] = useState(0);
  const [levelPoints, setLevelPoints] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Not auth");
        const authData = await res.json();
        const sdcRes = await fetch(`/api/dashboard/student/samam/sdc/${authData.user.username}`);
        if (sdcRes.ok) {
          const sdcData = await sdcRes.json();
          setStudentCredits(sdcData.total || 0);
        }
        
        const actRes = await fetch("/api/student/activities");
        if (actRes.ok) {
          const actData = await actRes.json();
          if (actData.success) {
            const allActivities = [...actData.data.ongoing, ...actData.data.completed];
            const lp: Record<string, number> = {};
            allActivities.forEach((a: any) => {
               const l = (a.level || 'explorer').toLowerCase();
               if (!lp[l]) lp[l] = 0;
               if (a.enrollment_status === 'completed') {
                 lp[l] += Number(a.sdc_credits || a.credits || 0);
               }
            });
            setLevelPoints(lp);
          }
        }
      } catch (err) {
        console.error("Failed to load credits", err);
      }
      setLoading(false);
    };
    fetchCredits();
  }, []);

  const activeStageData = JOURNEY_STAGES.find((s) => s.id === activeStage);
  const isUnlocked = (stage: any) => true;

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading learning journey...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Your Learning Journey</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Progress through 6 stages of holistic development. Earn SAMAM Points to unlock the next level.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
              <FiZap className="text-amber-500" size={18} />
              <div>
                <p className="text-xs text-gray-500 leading-none">Total SAMAM Points</p>
                <p className="text-xl font-bold text-gray-900 leading-tight">{studentCredits}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Animated Roadmap ── */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gray-200 z-0 hidden sm:block" />

        <div className="space-y-4">
          {JOURNEY_STAGES.map((stage, idx) => {
            const unlocked = isUnlocked(stage);
            const isActive = activeStage === stage.id;
            const totalActivities = stage.activities.length;
            const completedActivities = stage.completed_activities;
            const stagePct = totalActivities > 0
              ? Math.round((completedActivities / totalActivities) * 100) : 0;

            return (
              <div
                key={stage.id}
                className="relative flex items-start gap-4"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Stage orb */}
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex flex-col items-center justify-center text-xl border-2 transition-all duration-300 ${
                    isActive
                      ? "shadow-lg scale-110 text-white"
                      : "hover:scale-105 shadow-sm"
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: stage.color, borderColor: stage.color }
                      : { backgroundColor: stage.bg, borderColor: stage.border }
                  }
                  aria-label={stage.name}
                >
                  <span>{stage.icon}</span>
                  {completedActivities === totalActivities && totalActivities > 0 && (
                    <FiCheckCircle
                      className="absolute -top-1 -right-1 text-emerald-500 bg-white rounded-full"
                      size={16}
                    />
                  )}
                </button>

                {/* Stage card */}
                <div
                  className={`flex-1 bg-white rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive ? "shadow-md" : "shadow-sm hover:shadow-md"
                  }`}
                  style={{ borderColor: isActive ? stage.color : "#E5E7EB" }}
                  onClick={() => setActiveStage(stage.id)}
                >
                  {isActive && <div className="h-1" style={{ backgroundColor: stage.color }} />}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                            style={{ backgroundColor: stage.bg, color: stage.color }}
                          >
                            {stage.name}
                          </span>
                          <span className="text-[10px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            <FiZap size={10} /> {levelPoints[stage.id] || 0} Points
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{stage.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow connector */}
                {idx < JOURNEY_STAGES.length - 1 && (
                  <div className="absolute left-8 bottom-0 translate-y-1/2 z-20 hidden sm:flex items-center justify-center">
                    <FiArrowRight
                      size={12}
                      className="rotate-90 text-gray-300"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Active Stage Detail ── */}
      {activeStageData && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1" style={{ backgroundColor: activeStageData.color }} />
          <div className="p-5">
            {/* Stage header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: activeStageData.bg }}
              >
                {activeStageData.icon}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{activeStageData.name} Stage Activities</h2>
                <p className="text-xs text-gray-500">{activeStageData.activities.length} activities available in this stage</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-50 p-1 rounded-lg w-fit">
              {["activities", "competencies", "badges"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md capitalize transition-all ${
                    activeTab === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "activities" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeStageData.activities.slice(0, 9).map((a) => {
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
                          <span className="font-medium" style={{ color: BRAND }}>{a.credits} SDC</span> · {a.hours}h · {a.difficulty}
                        </p>
                        {(a.userStatus === "completed") && (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-0.5">
                            <FiCheckCircle size={9} /> Completed
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {activeTab === "competencies" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...new Set(activeStageData.activities.flatMap((a) => a.competencies))].slice(0, 8).map((c) => (
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
                {activeStageData.activities.slice(0, 8).map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border text-center ${
                      a.badgeEarned ? "" : "opacity-50"
                    }`}
                    style={
                      a.badgeEarned
                        ? { backgroundColor: activeStageData.bg, borderColor: activeStageData.color }
                        : { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }
                    }
                  >
                    <p className="text-2xl mb-1">{a.badgeEarned ? "🏆" : "🔒"}</p>
                    <p className="text-[11px] font-semibold text-gray-800">{a.badge}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5 truncate">{a.code}</p>
                  </div>
                ))}
              </div>
            )}

            {/* View all link */}
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
