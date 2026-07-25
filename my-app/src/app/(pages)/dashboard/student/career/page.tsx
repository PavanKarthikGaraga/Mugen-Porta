"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FiTrendingUp, FiSearch, FiCheckCircle, FiAlertCircle, FiArrowRight, FiClock,
} from "react-icons/fi";
import { Sparkles, Loader2, Target, Award } from "lucide-react";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import RingProgress from "@/app/components/dashboard/RingProgress";

const BRAND = "rgb(151,0,3)";

const LEVEL_CONFIG: Record<string, any> = {
  Explorer: { color: "#6B7280", bg: "bg-gray-100" },
  Foundation: { color: "#059669", bg: "bg-emerald-50" },
  Practitioner: { color: "#2563EB", bg: "bg-blue-50" },
  Leader: { color: "#D97706", bg: "bg-amber-50" },
  Mentor: { color: "#7C3AED", bg: "bg-purple-50" },
  Innovator: { color: "#DC2626", bg: "bg-red-50" },
};

const VERDICT_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  "Strong Fit": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Good Fit": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Developing Fit": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Early Stage": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

function matchColor(pct: number) {
  return pct >= 75 ? "#059669" : pct >= 50 ? "#D97706" : BRAND;
}

interface RoleMatch {
  role: string;
  domain: string;
  matchPercentage: number;
  rationale: string;
  keyStrengths: string[];
  growthAreas: string[];
}

interface RoleFitAnalysis {
  role: string;
  matchPercentage: number;
  verdict: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  improvementPlan: { action: string; why: string }[];
  timeframeMonths: number | null;
}

export default function CareerPage() {
  const [username, setUsername] = useState<string | null>(null);

  // Competencies
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCompetencies, setLoadingCompetencies] = useState(true);

  // AI role matches
  const [roleMatches, setRoleMatches] = useState<RoleMatch[] | null>(null);
  const [analyzingRoles, setAnalyzingRoles] = useState(false);
  const [rolesGeneratedAt, setRolesGeneratedAt] = useState<string | null>(null);

  // Role fit checker
  const [targetRole, setTargetRole] = useState("");
  const [fitAnalysis, setFitAnalysis] = useState<RoleFitAnalysis | null>(null);
  const [analyzingFit, setAnalyzingFit] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) throw new Error("Not authenticated");
        const authData = await authRes.json();
        const uname = authData.user.username;
        setUsername(uname);

        const compRes = await fetch(`/api/dashboard/student/samam/competencies/${uname}`);
        if (compRes.ok) {
          const data = await compRes.json();
          setCategories(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCompetencies(false);
      }
    };
    load();
  }, []);

  const runRoleMatchAnalysis = async () => {
    setAnalyzingRoles(true);
    try {
      const res = await fetch("/api/dashboard/student/career/role-matches", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setRoleMatches(data.roles);
        setRolesGeneratedAt(data.generatedAt);
      } else {
        toast.error(data.error || "Could not run AI analysis right now.");
      }
    } catch (e) {
      toast.error("Network error while running AI analysis.");
    } finally {
      setAnalyzingRoles(false);
    }
  };

  const runRoleFitAnalysis = async () => {
    if (!targetRole.trim()) {
      toast.error("Enter a role first, e.g. \"Data Analyst\" or \"Product Manager\".");
      return;
    }
    setAnalyzingFit(true);
    setFitAnalysis(null);
    try {
      const res = await fetch("/api/dashboard/student/career/role-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFitAnalysis(data.analysis);
      } else {
        toast.error(data.error || "Could not analyze this role right now.");
      }
    } catch (e) {
      toast.error("Network error while analyzing role fit.");
    } finally {
      setAnalyzingFit(false);
    }
  };

  // Flatten competencies with a score for the "skills attained" summary.
  const allScoredCompetencies = categories
    .flatMap((c: any) => c.competencies.map((comp: any) => ({ ...comp, category: c.title })))
    .filter((c: any) => c.score > 0)
    .sort((a: any, b: any) => b.score - a.score);

  const overallScores = categories.map((c: any) => ({
    ...c,
    avg: c.competencies.length > 0
      ? Math.round(c.competencies.reduce((s: number, x: any) => s + x.score, 0) / c.competencies.length)
      : 0,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5" style={{ background: BRAND }} />
        <div className="p-5">
          <h1 className="text-xl font-bold text-gray-900">Career Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Your competencies, an AI-powered scan of career roles you&rsquo;re best suited for, and a fit check for
            any specific role you have in mind.
          </p>
        </div>
      </div>

      {/* ── Competencies & Skills Attained ── */}
      <DashboardCard
        title="Competencies & Skills Attained"
        subtitle="Real scores from your SAMAM activities, projects, and achievements"
      >
        {loadingCompetencies ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: BRAND }} />
          </div>
        ) : allScoredCompetencies.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No competency scores on record yet. Complete SAMAM activities and update your Passport to build
            your profile — then AI Career Analysis below will have real evidence to work with.
          </div>
        ) : (
          <>
            {/* Category averages */}
            <div className="flex flex-wrap gap-2 mb-5">
              {overallScores.map((c: any) => (
                <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-gray-50 border-gray-100">
                  <span className="text-sm">{c.icon}</span>
                  <span className="text-xs font-bold text-gray-700">{c.avg}%</span>
                  <span className="text-[10px] text-gray-500">{c.title}</span>
                </div>
              ))}
            </div>

            {/* Top skills grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {allScoredCompetencies.slice(0, 12).map((comp: any) => {
                const lc = LEVEL_CONFIG[comp.level] || LEVEL_CONFIG.Explorer;
                return (
                  <div key={comp.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium text-gray-800 truncate">{comp.name}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${lc.bg}`} style={{ color: lc.color }}>
                          {comp.level}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-700 flex-shrink-0">{comp.score}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${comp.score}%`, backgroundColor: comp.color || BRAND }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </DashboardCard>

      {/* ── AI Role Match Scan ── */}
      <DashboardCard
        title={<span className="flex items-center gap-2"><Sparkles size={18} className="text-amber-500" /> AI Career Role Match</span>}
        subtitle="SAMAM AI scans your full profile and ranks the roles you're best suited for right now"
        action={
          <button
            onClick={runRoleMatchAnalysis}
            disabled={analyzingRoles}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: BRAND }}
          >
            {analyzingRoles ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {analyzingRoles ? "Analyzing…" : roleMatches ? "Re-run Analysis" : "Run AI Analysis"}
          </button>
        }
      >
        {analyzingRoles ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Loader2 className="animate-spin mb-3" size={26} style={{ color: BRAND }} />
            <p className="text-sm font-medium">SAMAM AI is analyzing your competencies, activities, and passport…</p>
          </div>
        ) : !roleMatches ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
            <Target size={28} className="text-gray-300" />
            <p className="text-sm text-gray-500 max-w-md">
              Click <span className="font-semibold text-gray-700">Run AI Analysis</span> to get your top 5-10
              best-fit career roles across every domain, with a match percentage for each.
            </p>
          </div>
        ) : (
          <>
            {rolesGeneratedAt && (
              <p className="text-[10px] text-gray-400 mb-3">
                Generated {new Date(rolesGeneratedAt).toLocaleString()}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleMatches.map((r, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <RingProgress value={r.matchPercentage} size={56} strokeWidth={6} color={matchColor(r.matchPercentage)} showValue={false}>
                      <span className="text-xs font-bold" style={{ color: matchColor(r.matchPercentage) }}>{r.matchPercentage}%</span>
                    </RingProgress>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{r.role}</p>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 inline-block mt-1">
                        {r.domain}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mt-3">{r.rationale}</p>
                  {r.keyStrengths.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide mb-1">Key Strengths</p>
                      <div className="flex flex-wrap gap-1">
                        {r.keyStrengths.map((s, si) => (
                          <span key={si} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.growthAreas.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1">Growth Areas</p>
                      <div className="flex flex-wrap gap-1">
                        {r.growthAreas.map((s, si) => (
                          <span key={si} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </DashboardCard>

      {/* ── Check a Specific Role ── */}
      <DashboardCard
        title={<span className="flex items-center gap-2"><FiSearch size={16} /> Check a Specific Role</span>}
        subtitle="Interested in a particular role or position? See how well you currently fit, and what to improve."
      >
        <div className="flex gap-2 mb-5">
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !analyzingFit && runRoleFitAnalysis()}
            placeholder="e.g. Data Analyst, Product Manager, UX Designer…"
            maxLength={100}
            disabled={analyzingFit}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1"
            style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
          />
          <button
            onClick={runRoleFitAnalysis}
            disabled={analyzingFit || !targetRole.trim()}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
            style={{ backgroundColor: BRAND }}
          >
            {analyzingFit ? <Loader2 size={14} className="animate-spin" /> : <FiArrowRight size={14} />}
            {analyzingFit ? "Analyzing…" : "Analyze Fit"}
          </button>
        </div>

        {analyzingFit ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Loader2 className="animate-spin mb-3" size={26} style={{ color: BRAND }} />
            <p className="text-sm font-medium">SAMAM AI is checking your fit for &ldquo;{targetRole}&rdquo;…</p>
          </div>
        ) : fitAnalysis ? (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <RingProgress value={fitAnalysis.matchPercentage} size={100} strokeWidth={10} color={matchColor(fitAnalysis.matchPercentage)} />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <p className="text-base font-bold text-gray-900">{fitAnalysis.role}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${(VERDICT_CONFIG[fitAnalysis.verdict] || VERDICT_CONFIG["Developing Fit"]).bg} ${(VERDICT_CONFIG[fitAnalysis.verdict] || VERDICT_CONFIG["Developing Fit"]).text} ${(VERDICT_CONFIG[fitAnalysis.verdict] || VERDICT_CONFIG["Developing Fit"]).border}`}>
                    {fitAnalysis.verdict}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mt-2">{fitAnalysis.summary}</p>
                {fitAnalysis.timeframeMonths != null && (
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-2 justify-center sm:justify-start">
                    <FiClock size={10} /> Estimated ~{fitAnalysis.timeframeMonths} month{fitAnalysis.timeframeMonths === 1 ? "" : "s"} of focused effort to become a strong candidate
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2 flex items-center gap-1.5">
                  <FiCheckCircle size={12} /> Strengths
                </p>
                <div className="space-y-2">
                  {fitAnalysis.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl border border-emerald-100 bg-emerald-50">
                      <span className="text-xs text-emerald-800">{s}</span>
                    </div>
                  ))}
                  {fitAnalysis.strengths.length === 0 && <p className="text-xs text-gray-400">None identified.</p>}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700 mb-2 flex items-center gap-1.5">
                  <FiAlertCircle size={12} /> Gaps to Close
                </p>
                <div className="space-y-2">
                  {fitAnalysis.gaps.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl border border-red-100 bg-red-50">
                      <span className="text-xs text-red-800">{s}</span>
                    </div>
                  ))}
                  {fitAnalysis.gaps.length === 0 && <p className="text-xs text-gray-400">None identified.</p>}
                </div>
              </div>
            </div>

            {fitAnalysis.improvementPlan.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-3 flex items-center gap-1.5">
                  <Award size={13} /> Improvement Plan
                </p>
                <div className="space-y-3">
                  {fitAnalysis.improvementPlan.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: BRAND }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 p-3 rounded-xl border border-gray-100 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-900">{step.action}</p>
                        {step.why && <p className="text-[11px] text-gray-500 mt-0.5">{step.why}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <FiTrendingUp size={26} className="text-gray-300" />
            <p className="text-sm text-gray-500 max-w-md">
              Type in a role you&rsquo;re interested in and hit <span className="font-semibold text-gray-700">Analyze Fit</span> to
              see your match percentage and a personalized improvement plan.
            </p>
          </div>
        )}
      </DashboardCard>

    </div>
  );
}
