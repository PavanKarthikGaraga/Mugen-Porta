"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FiTarget, FiChevronRight, FiClock, FiAlertCircle,
  FiCheckCircle, FiTrendingUp, FiAward, FiExternalLink,
} from "react-icons/fi";
import RingProgress  from "@/app/components/dashboard/RingProgress";
import SkillGapBar   from "@/app/components/dashboard/SkillGapBar";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import { CAREER_PATHS, CAREER_PATH_KEYS } from "@/app/Data/development-mock";

const BRAND = "rgb(151,0,3)";

const PRIORITY_CONFIG = {
  Critical: { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"   },
  High:     { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  Medium:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"  },
};

const STATUS_CONFIG = {
  active:   { color: BRAND,     label: "In Progress" },
  upcoming: { color: "#9CA3AF", label: "Upcoming"    },
  done:     { color: "#059669", label: "Done"        },
};

export default function CareerPage() {
  const [selectedCareer, setSelectedCareer] = useState("Software Engineer");
  const career = CAREER_PATHS[selectedCareer];
  const score  = career.readinessScore;

  const scoreColor =
    score >= 75 ? "#059669" :
    score >= 50 ? "#D97706" : BRAND;

  const metCompetencies  = career.keyCompetencies.filter((c) => c.current >= c.required);
  const gapCompetencies  = career.keyCompetencies.filter((c) => c.current <  c.required);
  const totalGap         = gapCompetencies.reduce((s, c) => s + c.gap, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Header + Career Selector ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${career.color}, rgb(151,0,3))` }} />
        <div className="p-5">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Career Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Set your career goal and get a personalised readiness score, skill gaps, and learning roadmap.
              </p>
            </div>
          </div>

          {/* Career Goal Selector — pill buttons */}
          <div className="flex flex-wrap gap-2">
            {CAREER_PATH_KEYS.map((key) => {
              const c = CAREER_PATHS[key];
              const isActive = selectedCareer === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCareer(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                    isActive ? "text-white shadow-sm" : "text-gray-600 border-gray-200 hover:border-gray-400 bg-white"
                  }`}
                  style={isActive ? { backgroundColor: c.color, borderColor: c.color } : {}}
                >
                  <span className="text-base">{c.icon}</span>
                  {key}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Selected career description ── */}
      <div
        className="rounded-xl border p-4 flex items-start gap-4"
        style={{ backgroundColor: career.bg, borderColor: career.color + "30" }}
      >
        <span className="text-4xl flex-shrink-0">{career.icon}</span>
        <div className="flex-1">
          <h2 className="text-base font-bold" style={{ color: career.color }}>{selectedCareer}</h2>
          <p className="text-sm text-gray-700 mt-0.5">{career.description}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-3xl font-bold" style={{ color: scoreColor }}>{score}%</p>
          <p className="text-xs text-gray-500">Career Readiness</p>
        </div>
      </div>

      {/* ── Top row: Ring + Missing Competencies + Certs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Readiness Ring */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 self-start">Readiness Score</p>
          <RingProgress value={score} size={160} strokeWidth={14} color={scoreColor}>
            <span className="text-2xl">{career.icon}</span>
          </RingProgress>

          {/* Score interpretation */}
          <div className={`w-full p-3 rounded-xl text-xs ${
            score >= 75 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
            score >= 50 ? "bg-amber-50 text-amber-800 border border-amber-200"   :
            "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {score >= 75
              ? "🎉 You're well on track! Focus on the remaining skill gaps to ace interviews."
              : score >= 50
              ? "📈 Good progress. Address the critical skill gaps in your roadmap below."
              : "🎯 Early stage. Follow the roadmap systematically to build readiness fast."
            }
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 w-full text-center">
            <div className="bg-emerald-50 rounded-xl p-2">
              <p className="text-lg font-bold text-emerald-700">{metCompetencies.length}</p>
              <p className="text-[10px] text-emerald-600">Skills Met</p>
            </div>
            <div className="bg-red-50 rounded-xl p-2">
              <p className="text-lg font-bold text-red-700">{gapCompetencies.length}</p>
              <p className="text-[10px] text-red-600">Gaps to close</p>
            </div>
          </div>
        </div>

        {/* Missing Competencies */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Missing Competencies</p>
          <div className="space-y-2">
            {career.missingCompetencies.map((c) => (
              <div key={c} className="flex items-start gap-2 p-2.5 rounded-xl border border-red-100 bg-red-50">
                <FiAlertCircle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-red-800 font-medium">{c}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Closing these gaps will increase your readiness score to approximately{" "}
              <span className="font-bold text-gray-800">
                {Math.min(100, score + Math.round(totalGap / career.keyCompetencies.length))}%
              </span>.
            </p>
          </div>
        </div>

        {/* Recommended Certifications */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Recommended Certifications</p>
          <div className="space-y-2.5">
            {career.recommendedCertifications.map((cert) => {
              const pCfg = PRIORITY_CONFIG[cert.priority] || PRIORITY_CONFIG.Medium;
              return (
                <div key={cert.name} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-900 flex-1">{cert.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${pCfg.bg} ${pCfg.text} ${pCfg.border}`}>
                      {cert.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-500">
                    <span>{cert.provider}</span>
                    <span className="flex items-center gap-0.5">
                      <FiClock size={9} /> ~{cert.timeMonths}mo
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Skill Gap Analysis ── */}
      <DashboardCard
        title="Skill Gap Analysis"
        subtitle={`${metCompetencies.length} of ${career.keyCompetencies.length} competencies met for ${selectedCareer}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {career.keyCompetencies.map((comp) => (
            <SkillGapBar
              key={comp.name}
              name={comp.name}
              required={comp.required}
              current={comp.current}
              color={career.color}
            />
          ))}
        </div>
      </DashboardCard>

      {/* ── Learning Roadmap ── */}
      <DashboardCard
        title="📍 Learning Roadmap"
        subtitle={`Your personalised path to becoming a ${selectedCareer}`}
      >
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-4">
            {career.roadmap.map((step, i) => {
              const sc = STATUS_CONFIG[step.status] || STATUS_CONFIG.upcoming;
              return (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className="w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 z-10"
                    style={{
                      borderColor: sc.color,
                      color: sc.color,
                      backgroundColor: step.status === "active" ? sc.color + "15" : "white",
                    }}
                  >
                    {step.status === "done" ? <FiCheckCircle size={14} /> : i + 1}
                  </div>
                  <div className={`flex-1 p-3 rounded-xl border transition-all ${
                    step.status === "active" ? "border-current shadow-sm" : "border-gray-100 bg-gray-50"
                  }`}
                    style={step.status === "active" ? { borderColor: career.color + "40", backgroundColor: career.bg } : {}}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <p className={`text-sm font-semibold ${step.status === "active" ? "" : "text-gray-600"}`}
                        style={step.status === "active" ? { color: career.color } : {}}
                      >
                        {step.milestone}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: sc.color + "20", color: sc.color }}
                        >
                          {sc.label}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <FiClock size={9} /> {step.dueMonths}mo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DashboardCard>

      {/* ── Recommended Activities ── */}
      <DashboardCard
        title="🎯 Recommended Activities"
        subtitle={`SAMAM activities that directly build ${selectedCareer} competencies`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {career.activities.map((code) => (
            <Link
              key={code}
              href={`/dashboard/student/activity-catalogue/${code}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:shadow-sm hover:border-gray-300 bg-gray-50 hover:bg-white transition-all"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: career.color }}
              >
                {code.split("-")[0][0]}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">{code}</p>
                <p className="text-[10px] text-gray-500">View activity →</p>
              </div>
              <FiChevronRight size={12} className="text-gray-400 ml-auto" />
            </Link>
          ))}
        </div>
      </DashboardCard>

    </div>
  );
}
