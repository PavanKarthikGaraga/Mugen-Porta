"use client";
import { useState, useEffect } from "react";
import { FiArrowRight, FiArrowLeft, FiRefreshCw, FiStar, FiMapPin, FiTrendingUp, FiUsers, FiTarget, FiZap, FiCheck } from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const DOMAIN_COLORS: Record<string, string> = {
  TEC: "#2563eb", LCH: "#7c3aed", ESO: "#16a34a", HWB: "#ea580c", IIE: "#d97706",
};
const DOMAIN_LABELS: Record<string, string> = {
  TEC: "Technical", LCH: "Cultural", ESO: "Social Outreach", HWB: "Health & Wellbeing", IIE: "Innovation",
};
const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-green-100 text-green-700 border-green-200",
};

const QUESTIONS = [
  {
    id: "interests",
    question: "What topics or activities spark your curiosity?",
    subtitle: "Select all that apply (up to 4)",
    type: "multi", max: 4,
    options: [
      { label: "Technology & Coding",        icon: "💻" },
      { label: "Arts, Music & Dance",         icon: "🎨" },
      { label: "Sports & Fitness",            icon: "⚽" },
      { label: "Social Work & Community",     icon: "🤝" },
      { label: "Business & Startups",         icon: "🚀" },
      { label: "Science & Research",          icon: "🔬" },
      { label: "Environment & Nature",        icon: "🌱" },
      { label: "Health & Wellness",           icon: "❤️" },
    ],
  },
  {
    id: "freeTime",
    question: "What do you enjoy doing in your free time?",
    subtitle: "Select up to 3",
    type: "multi", max: 3,
    options: [
      { label: "Building apps or projects",      icon: "🛠️" },
      { label: "Performing (dance, music, drama)", icon: "🎭" },
      { label: "Playing or watching sports",     icon: "🏃" },
      { label: "Volunteering or helping others", icon: "🤲" },
      { label: "Reading, writing or researching",icon: "📚" },
      { label: "Designing or creating content",  icon: "✏️" },
      { label: "Gaming or exploring tech",        icon: "🎮" },
      { label: "Yoga, meditation or fitness",    icon: "🧘" },
    ],
  },
  {
    id: "superpower",
    question: "What would you call your biggest superpower?",
    subtitle: "Choose one that feels most like you",
    type: "single",
    options: [
      { label: "Problem-solving & logic",     icon: "🧠" },
      { label: "Creativity & imagination",    icon: "🎨" },
      { label: "Empathy & people skills",     icon: "💬" },
      { label: "Leadership & organization",   icon: "👑" },
      { label: "Curiosity & research mindset",icon: "🔍" },
      { label: "Physical discipline & energy",icon: "💪" },
    ],
  },
  {
    id: "excitingProblem",
    question: "Which type of problem excites you the most?",
    subtitle: "Choose one",
    type: "single",
    options: [
      { label: "Building AI or software products",           icon: "🤖" },
      { label: "Designing experiences that move people",    icon: "🎭" },
      { label: "Helping communities & solving social issues",icon: "🌍" },
      { label: "Discovering something no one found before", icon: "🔭" },
      { label: "Creating a business that changes the world",icon: "🚀" },
      { label: "Improving health & mental wellbeing",       icon: "❤️" },
    ],
  },
  {
    id: "skillToLearn",
    question: "What skill do you most want to master in college?",
    subtitle: "Select up to 3",
    type: "multi", max: 3,
    options: [
      { label: "AI, ML & Data Science",          icon: "🤖" },
      { label: "Web / App Development",          icon: "💻" },
      { label: "Design & Creative Arts",         icon: "🎨" },
      { label: "Leadership & Communication",     icon: "🗣️" },
      { label: "Research & Scientific Writing",  icon: "📝" },
      { label: "Sports Science & Coaching",      icon: "🏃" },
      { label: "Entrepreneurship & Finance",     icon: "💰" },
      { label: "Social Impact & Policy",         icon: "🌱" },
    ],
  },
  {
    id: "dreamWork",
    question: "Where do you dream of working?",
    subtitle: "Choose one",
    type: "single",
    options: [
      { label: "A global tech company (Google, Microsoft)", icon: "🌐" },
      { label: "My own startup",                            icon: "⚡" },
      { label: "A creative studio (film, design, media)",  icon: "🎬" },
      { label: "A research university or lab",             icon: "🏛️" },
      { label: "An NGO or social enterprise",              icon: "🌍" },
      { label: "A hospital or wellness centre",            icon: "🏥" },
    ],
  },
  {
    id: "roleModel",
    question: "Who inspires you the most?",
    subtitle: "Choose one",
    type: "single",
    options: [
      { label: "Elon Musk / Steve Jobs — Visionary Innovator", icon: "🚀" },
      { label: "A.R. Rahman / BTS — Creative Artist",          icon: "🎵" },
      { label: "APJ Abdul Kalam — Scientist & Dreamer",        icon: "🔭" },
      { label: "Malala / Mother Teresa — Social Leader",       icon: "🌍" },
      { label: "Virat Kohli / P.V. Sindhu — Champion Athlete", icon: "🏆" },
      { label: "Ratan Tata / Warren Buffett — Business Leader",icon: "💼" },
    ],
  },
  {
    id: "domainChoice",
    question: "Which SAC domain aligns with your passion?",
    subtitle: "Choose one — this helps us suggest the right clubs",
    type: "single",
    options: [
      { label: "TEC — Technology & Engineering",        icon: "⚙️" },
      { label: "LCH — Arts, Culture & Heritage",        icon: "🎭" },
      { label: "ESO — Social Outreach & Environment",   icon: "🌱" },
      { label: "HWB — Health & Wellbeing",              icon: "❤️" },
      { label: "IIE — Innovation & Entrepreneurship",   icon: "💡" },
    ],
  },
  {
    id: "futureAt30",
    question: "Where do you see yourself at 30?",
    subtitle: "Be honest — there's no wrong answer",
    type: "single",
    options: [
      { label: "Leading a tech team at a top company", icon: "💻" },
      { label: "Running my own successful startup",    icon: "🚀" },
      { label: "A professional artist / creator",      icon: "🎨" },
      { label: "A researcher or university professor", icon: "🏛️" },
      { label: "Creating social impact through an NGO",icon: "🤝" },
      { label: "A healthcare or wellness professional",icon: "🏥" },
    ],
  },
  {
    id: "friendsDesc",
    question: "How would your best friend describe you?",
    subtitle: "Choose one",
    type: "single",
    options: [
      { label: "\"The tech whiz always building something\"",  icon: "🛠️" },
      { label: "\"The creative soul who thinks differently\"", icon: "🌈" },
      { label: "\"The caring heart who helps everyone\"",      icon: "❤️" },
      { label: "\"The curious mind who reads everything\"",    icon: "📚" },
      { label: "\"The leader who gets things done\"",          icon: "👑" },
      { label: "\"The athlete who's always active\"",          icon: "⚡" },
    ],
  },
];

type Step = "intro" | "quiz" | "analyzing" | "results";

export default function CareerRoadmapPage() {
  const [step, setStep] = useState<Step>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [roadmap, setRoadmap] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  const q = QUESTIONS[currentQ];
  const current = answers[q?.id];
  const isMulti = q?.type === "multi";
  const isAnswered = isMulti
    ? Array.isArray(current) && (current as string[]).length > 0
    : !!current;

  const selectOption = (label: string) => {
    if (!q) return;
    if (isMulti) {
      const prev = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
      if (prev.includes(label)) {
        setAnswers(a => ({ ...a, [q.id]: prev.filter(x => x !== label) }));
      } else if (prev.length < (q.max ?? 4)) {
        setAnswers(a => ({ ...a, [q.id]: [...prev, label] }));
      }
    } else {
      setAnswers(a => ({ ...a, [q.id]: label }));
    }
  };

  const isSelected = (label: string) => {
    if (isMulti) return Array.isArray(current) && (current as string[]).includes(label);
    return current === label;
  };

  const next = () => {
    if (currentQ < QUESTIONS.length - 1) setCurrentQ(c => c + 1);
    else submitQuiz();
  };

  const submitQuiz = async () => {
    setStep("analyzing");
    try {
      const formatted: Record<string, string> = {};
      for (const [k, v] of Object.entries(answers)) {
        formatted[k] = Array.isArray(v) ? v.join(", ") : (v as string);
      }

      const res = await fetch("/api/dashboard/student/career-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formatted }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to generate roadmap");
        setStep("quiz");
        return;
      }
      setRoadmap(data.roadmap);
      setStudentInfo(data.student);
      setStep("results");
    } catch {
      toast.error("Network error — please try again");
      setStep("quiz");
    }
  };

  const reset = () => {
    setStep("intro");
    setCurrentQ(0);
    setAnswers({});
    setRoadmap(null);
  };

  // ─── Intro ─────────────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-8">
        <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-4xl shadow-lg"
          style={{ background: "linear-gradient(135deg, rgb(151,0,3), #ff4444)" }}>
          🗺️
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Discover Your Career Roadmap</h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-base leading-relaxed">
            Answer 10 quick questions about your interests and passions.<br />
            Our AI will build a personalised 4-year career roadmap and suggest the best SAC clubs for you.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[["🎯", "10 Questions", "~3 minutes"], ["🤖", "AI Analysis", "Personalised for you"], ["🏆", "Club Picks", "From your interests"]].map(([icon, title, sub]) => (
            <div key={title} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-4">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="font-bold text-gray-900 dark:text-white">{title}</p>
              <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setStep("quiz")}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-base shadow-md hover:opacity-90 transition-all"
          style={{ backgroundColor: BRAND }}
        >
          Start Now <FiArrowRight />
        </button>
      </div>
    );
  }

  // ─── Analyzing ─────────────────────────────────────────────────────────────
  if (step === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-gray-100 border-t-red-700 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analysing your interests…</h2>
          <p className="text-sm text-gray-400 mt-1">Our AI is building your personalised roadmap. This takes about 10 seconds.</p>
        </div>
      </div>
    );
  }

  // ─── Quiz ──────────────────────────────────────────────────────────────────
  if (step === "quiz") {
    const progress = ((currentQ) / QUESTIONS.length) * 100;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: BRAND }} />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{q.question}</h2>
            <p className="text-sm text-gray-400 mt-1">{q.subtitle}</p>
            {isMulti && (
              <p className="text-xs text-gray-400 mt-1">
                {(Array.isArray(current) ? current.length : 0)}/{q.max} selected
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {q.options.map(opt => {
              const sel = isSelected(opt.label);
              return (
                <button
                  key={opt.label}
                  onClick={() => selectOption(opt.label)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all text-sm font-medium ${
                    sel
                      ? "border-transparent text-white shadow-sm"
                      : "border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
                  }`}
                  style={sel ? { backgroundColor: BRAND } : {}}
                >
                  <span className="text-xl flex-shrink-0">{opt.icon}</span>
                  <span className="leading-tight">{opt.label}</span>
                  {sel && <FiCheck size={14} className="ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentQ(c => Math.max(0, c - 1))}
            disabled={currentQ === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 disabled:opacity-40 transition-all"
          >
            <FiArrowLeft size={14} /> Back
          </button>
          <button
            onClick={next}
            disabled={!isAnswered}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40 transition-all shadow-sm"
            style={{ backgroundColor: BRAND }}
          >
            {currentQ === QUESTIONS.length - 1 ? "Generate My Roadmap 🚀" : "Next"} <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // ─── Results ───────────────────────────────────────────────────────────────
  if (step === "results" && roadmap) {
    const domColor = DOMAIN_COLORS[roadmap.primaryDomain] || BRAND;
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Hero banner */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: `linear-gradient(135deg, ${domColor}15 0%, ${BRAND}10 100%)`, border: `1px solid ${domColor}30` }}>
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: domColor }}>
                    {roadmap.primaryDomain} · {DOMAIN_LABELS[roadmap.primaryDomain] || roadmap.primaryDomain}
                  </span>
                  {studentInfo?.branch && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-zinc-900">
                      {studentInfo.branch}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{roadmap.headline}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">{roadmap.overview}</p>
                {roadmap.personalityTraits?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {roadmap.personalityTraits.map((t: string) => (
                      <span key={t} className="text-xs font-semibold px-2.5 py-1 rounded-full border text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700">
                        ✦ {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-500 hover:bg-white dark:hover:bg-zinc-800 transition-all">
                <FiRefreshCw size={12} /> Retake
              </button>
            </div>
          </div>
          {roadmap.motivationalMessage && (
            <div className="px-6 md:px-8 py-4 border-t" style={{ borderColor: domColor + "20", backgroundColor: domColor + "08" }}>
              <p className="text-sm italic text-gray-600 dark:text-gray-400">💡 {roadmap.motivationalMessage}</p>
            </div>
          )}
        </div>

        {/* Career paths */}
        {roadmap.careerPaths?.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><FiTrendingUp size={16} style={{ color: BRAND }} /> Career Paths For You</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roadmap.careerPaths.map((cp: any, i: number) => (
                <div key={cp.title} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: i === 0 ? BRAND : i === 1 ? domColor : "#6b7280" }}>
                      {i === 0 ? "Best Match" : i === 1 ? "Great Fit" : "Good Fit"}
                    </span>
                    <span className="text-lg font-extrabold" style={{ color: i === 0 ? BRAND : domColor }}>{cp.relevanceScore}%</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{cp.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{cp.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FiTarget size={11} /> {cp.timeToReach}
                  </div>
                  {/* Relevance bar */}
                  <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cp.relevanceScore}%`, backgroundColor: i === 0 ? BRAND : domColor }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Year-wise roadmap */}
        {roadmap.yearwiseRoadmap && (
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><FiMapPin size={16} style={{ color: BRAND }} /> Your 4-Year Roadmap</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(["year1", "year2", "year3", "year4"] as const).map((yr, i) => {
                const y = roadmap.yearwiseRoadmap[yr];
                if (!y) return null;
                const yearColors = [BRAND, domColor, "#7c3aed", "#16a34a"];
                return (
                  <div key={yr} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="px-4 py-3" style={{ backgroundColor: yearColors[i] + "12", borderBottom: `2px solid ${yearColors[i]}40` }}>
                      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: yearColors[i] }}>Year {i + 1}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{y.focus}</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {y.goals?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Goals</p>
                          <ul className="space-y-1">
                            {y.goals.map((g: string) => (
                              <li key={g} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                                <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: yearColors[i] }} />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {y.skills?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {y.skills.map((s: string) => (
                              <span key={s} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {y.samamTip && (
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 italic border-l-2 border-blue-300 pl-2">{y.samamTip}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Skills */}
          {roadmap.skillsToLearn?.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><FiZap size={14} style={{ color: BRAND }} /> Skills to Master</h3>
              <div className="space-y-2.5">
                {roadmap.skillsToLearn.map((s: any) => (
                  <div key={s.skill} className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{s.skill}</p>
                      <p className="text-[10px] text-gray-400">{s.timeframe}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${PRIORITY_COLORS[s.priority] || PRIORITY_COLORS.Medium}`}>
                      {s.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Club Recommendations */}
          {roadmap.clubRecommendations?.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><FiUsers size={14} style={{ color: BRAND }} /> Clubs For You</h3>
              <div className="space-y-3">
                {roadmap.clubRecommendations.map((c: any, i: number) => {
                  const cc = DOMAIN_COLORS[c.domain] || "#6b7280";
                  return (
                    <div key={c.clubName} className="rounded-xl p-3 space-y-1.5" style={{ backgroundColor: cc + "0e", border: `1px solid ${cc}25` }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{ backgroundColor: cc }}>{c.domain}</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight truncate">{c.clubName}</p>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{c.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Companies + Social Impact */}
          <div className="space-y-4">
            {roadmap.topCompanies?.length > 0 && (
              <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><FiStar size={14} style={{ color: BRAND }} /> Top Companies</h3>
                <div className="flex flex-wrap gap-2">
                  {roadmap.topCompanies.map((c: string) => (
                    <span key={c} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-gray-300">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {roadmap.socialImpactOpportunities?.length > 0 && (
              <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">🌍 Social Impact</h3>
                <ul className="space-y-2">
                  {roadmap.socialImpactOpportunities.map((s: string) => (
                    <li key={s} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-center pb-4">
          <button onClick={reset} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <FiRefreshCw size={14} /> Retake the questionnaire
          </button>
        </div>
      </div>
    );
  }

  return null;
}
