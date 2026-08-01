"use client";
import { useState, useRef } from "react";
import {
  FiArrowRight, FiArrowLeft, FiRefreshCw, FiTrendingUp, FiUsers,
  FiTarget, FiZap, FiCheck, FiBriefcase, FiBook, FiSearch, FiHeart,
  FiGlobe, FiCode, FiCpu, FiBarChart2, FiFileText, FiEdit3, FiShield,
  FiAward, FiGrid, FiUser, FiActivity, FiLayers, FiStar,
  FiSettings, FiMapPin, FiHome, FiList, FiFlag, FiFeather
} from "react-icons/fi";
import { toast } from "sonner";

const BRAND = "rgb(151,0,3)";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  briefcase: FiBriefcase, globe: FiGlobe, search: FiSearch, trending: FiTrendingUp,
  shield: FiShield, heart: FiHeart, code: FiCode, cpu: FiCpu, settings: FiSettings,
  home: FiHome, activity: FiActivity, zap: FiZap, target: FiTarget, users: FiUsers,
  book: FiBook, chart: FiBarChart2, file: FiFileText, edit: FiEdit3, layers: FiLayers,
  user: FiUser, list: FiList, star: FiStar, award: FiAward, grid: FiGrid,
  pin: FiMapPin, flag: FiFlag, feather: FiFeather,
};

const DOMAIN_COLORS: Record<string, string> = {
  TEC: "#2563eb", LCH: "#7c3aed", ESO: "#16a34a", HWB: "#ea580c", IIE: "#d97706",
};
const DOMAIN_LABELS: Record<string, string> = {
  TEC: "Technical", LCH: "Cultural & Heritage", ESO: "Social Outreach",
  HWB: "Health & Wellbeing", IIE: "Innovation & Entrepreneurship",
};
const YEAR_COLORS = [BRAND, "#2563eb", "#7c3aed", "#16a34a"];
const PRIORITY_STYLE: Record<string, string> = {
  High: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
  Low: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800",
};
const DIFFICULTY_STYLE: Record<string, string> = {
  Beginner: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800",
  Intermediate: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
  Advanced: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
};

interface Option { label: string; sub?: string; icon: string; }
interface Question {
  id: string; question: string; subtitle: string;
  type: "single" | "multi"; max?: number;
  options: Option[]; hasOther?: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: "academicStage",
    question: "What stage of your academic journey are you currently at?",
    subtitle: "This helps calibrate your roadmap to where you are right now — not just where you want to go",
    type: "single",
    options: [
      { label: "UG — Early Years (1st or 2nd Year)", sub: "Still exploring, building foundations and discovering interests", icon: "book" },
      { label: "UG — Final Years (3rd or 4th Year)", sub: "Preparing for placements, higher studies or entrepreneurship", icon: "layers" },
      { label: "Postgraduate — 1st Year (PG / MBA / MS / LLM)", sub: "Deepening expertise, expanding professional networks", icon: "trending" },
      { label: "Postgraduate — Final Year (completing project or thesis)", sub: "Finishing up and transitioning into career or doctoral work", icon: "award" },
      { label: "Pursuing PhD / Research Programme", sub: "Full-time research, publications, and academic advancement", icon: "search" },
      { label: "Completed degree — planning next steps", sub: "Evaluating options for career, further study or a new direction", icon: "flag" },
    ],
  },
  {
    id: "academicField",
    question: "Which broad academic field best describes your area of study?",
    subtitle: "Choose the discipline that reflects your primary degree or specialisation",
    type: "single", hasOther: true,
    options: [
      { label: "Engineering & Technology", sub: "CS, ECE, Mechanical, Civil, EEE, Chemical, IT and related branches", icon: "cpu" },
      { label: "Sciences", sub: "Physics, Chemistry, Mathematics, Biology, Biotechnology, Statistics", icon: "layers" },
      { label: "Arts, Humanities & Social Sciences", sub: "Literature, History, Philosophy, Psychology, Sociology, Political Science", icon: "feather" },
      { label: "Commerce, Economics & Finance", sub: "B.Com, Economics, Accounting, Banking, Finance, Actuarial Science", icon: "trending" },
      { label: "Management & Business Administration", sub: "BBA, MBA, Operations, Marketing, HR, Strategy", icon: "briefcase" },
      { label: "Law & Legal Studies", sub: "LLB, LLM, Corporate Law, Criminal Law, Constitutional Law", icon: "shield" },
      { label: "Medicine, Pharmacy & Health Sciences", sub: "MBBS, BDS, Nursing, Pharmacy, Public Health, Allied Health", icon: "heart" },
      { label: "Design, Architecture & Fine Arts", sub: "UI/UX, Fashion, Interior, Graphic Design, Fine Arts, Architecture", icon: "edit" },
      { label: "Agriculture, Environment & Life Sciences", sub: "Agri, Horticulture, Environmental Science, Food Technology", icon: "activity" },
      { label: "Education & Teacher Training", sub: "B.Ed, M.Ed, Early Childhood Education, Educational Technology", icon: "users" },
    ],
  },
  {
    id: "careerDirection",
    question: "What is your primary ambition after graduation?",
    subtitle: "This defines the direction of your entire career roadmap — choose what resonates most",
    type: "single", hasOther: true,
    options: [
      { label: "Industry / Corporate Career", sub: "Top companies, MNCs, or sector-specific professional roles", icon: "briefcase" },
      { label: "Higher Education (Masters or PG)", sub: "MS, MTech, MBA, LLM, MD, MFA — in India or abroad", icon: "globe" },
      { label: "Research & PhD / Academia", sub: "Scientific labs, universities, frontier academic research", icon: "search" },
      { label: "Entrepreneurship & Startups", sub: "Build your own product, service, or venture from scratch", icon: "trending" },
      { label: "Government, Civil Services & Public Sector", sub: "UPSC, PSUs, defence, judiciary, policy-making institutions", icon: "shield" },
      { label: "Social Impact, NGOs & Development Work", sub: "Grassroots change, international development, community work", icon: "heart" },
      { label: "Creative or Freelance Profession", sub: "Writer, designer, artist, filmmaker, consultant, independent creator", icon: "feather" },
      { label: "Professional Practice", sub: "Doctor, lawyer, CA, architect or licensed independent practitioner", icon: "award" },
    ],
  },
  {
    id: "workEnvironment",
    question: "What type of work environment makes you perform at your best?",
    subtitle: "Think about your ideal day-to-day professional setting — not just what sounds prestigious",
    type: "single", hasOther: true,
    options: [
      { label: "Research Lab, Hospital or University", sub: "Deep focus, intellectual rigour, structured academic or clinical culture", icon: "search" },
      { label: "Fast-Paced Tech or Creative Startup", sub: "Rapid iteration, high ownership, lean and agile teams", icon: "trending" },
      { label: "Large Corporate Organisation or MNC", sub: "Structured growth, global scale, defined career tracks", icon: "briefcase" },
      { label: "Field Work, Courtroom or Community", sub: "On-ground, client-facing, real-world professional settings", icon: "heart" },
      { label: "Remote or Independent / Freelance Work", sub: "Consulting, solo practice, location-independent flexibility", icon: "globe" },
      { label: "Government or Public Institution", sub: "Stability, public mandate, structured regulated environment", icon: "shield" },
      { label: "Creative Studio or Design Agency", sub: "Collaborative creative culture, portfolio-driven, client projects", icon: "edit" },
    ],
  },
  {
    id: "coreSkills",
    question: "Which skills are you actively investing time in right now?",
    subtitle: "Select up to 3 areas where you are genuinely building depth and expertise",
    type: "multi", max: 3, hasOther: true,
    options: [
      { label: "Programming & Software Development", sub: "Web, mobile, backend systems, cloud, DevOps, algorithms", icon: "code" },
      { label: "Data Analysis, AI & Research Methods", sub: "Statistics, ML, Python, R, data-driven decision making", icon: "chart" },
      { label: "Creative & Content Writing", sub: "Journalism, copywriting, scriptwriting, blogging, academic writing", icon: "feather" },
      { label: "Design, UI/UX & Visual Communication", sub: "Figma, Adobe suite, graphic design, user research, branding", icon: "edit" },
      { label: "Business, Finance & Entrepreneurship", sub: "Financial modelling, go-to-market strategy, pitching, accounting", icon: "trending" },
      { label: "Legal Research & Advocacy", sub: "Case analysis, drafting, moot courts, policy research", icon: "shield" },
      { label: "Clinical, Medical & Healthcare Skills", sub: "Patient care, diagnostics, pharmacology, public health practice", icon: "heart" },
      { label: "Research, Lab & Scientific Skills", sub: "Experiments, literature reviews, technical papers, lab protocols", icon: "search" },
      { label: "Leadership, Communication & Management", sub: "Team coordination, stakeholder management, project planning", icon: "users" },
      { label: "Teaching, Facilitation & Mentoring", sub: "Curriculum design, coaching, tutoring, training delivery", icon: "star" },
      { label: "Marketing, Branding & Social Media", sub: "Digital campaigns, SEO, content strategy, community building", icon: "globe" },
      { label: "Hardware, Electronics & Engineering", sub: "Circuit design, CAD, embedded systems, manufacturing, IoT", icon: "cpu" },
    ],
  },
  {
    id: "academicStrength",
    question: "Where do you consistently perform strongest academically?",
    subtitle: "Honest self-assessment maps your natural aptitude to the right career paths",
    type: "single", hasOther: true,
    options: [
      { label: "Quantitative Analysis & Problem Solving", sub: "Maths, logic, algorithms, numerical reasoning, modelling", icon: "layers" },
      { label: "Writing, Expression & Storytelling", sub: "Essays, reports, creative writing, persuasive communication", icon: "feather" },
      { label: "Hands-On Projects & Applied Work", sub: "Learning by doing, building, experimenting from real results", icon: "settings" },
      { label: "Theory, Concepts & Foundational Depth", sub: "Deep grasp of underlying principles, frameworks and abstractions", icon: "book" },
      { label: "Research, Investigation & Critical Analysis", sub: "Literature review, hypothesis testing, structured inquiry", icon: "search" },
      { label: "Creative & Design Thinking", sub: "Visual communication, aesthetics, ideation, user-centred design", icon: "edit" },
      { label: "Presenting, Persuading & Public Speaking", sub: "Articulating ideas confidently to technical and general audiences", icon: "users" },
    ],
  },
  {
    id: "problemSolving",
    question: "When you face a difficult challenge, you instinctively…",
    subtitle: "Choose what feels most natural — not what sounds most impressive",
    type: "single", hasOther: true,
    options: [
      { label: "Research deeply before taking action", sub: "Understand the full landscape before committing to any solution", icon: "search" },
      { label: "Experiment or prototype to test assumptions", sub: "Hands-on iteration and fast learning from feedback", icon: "code" },
      { label: "Decompose it into a structured plan", sub: "Step-by-step methodical execution with clear milestones", icon: "list" },
      { label: "Collaborate to gather diverse perspectives", sub: "Better answers emerge from collective cross-functional thinking", icon: "users" },
      { label: "Anchor every decision to real-world impact", sub: "Ground solutions in measurable, practical outcomes for people", icon: "globe" },
      { label: "Explore unconventional or creative approaches", sub: "Lateral thinking, reframing the problem, challenging assumptions", icon: "zap" },
    ],
  },
  {
    id: "campusInvolvement",
    question: "What best describes your engagement beyond the classroom?",
    subtitle: "Your extracurricular choices reveal powerful signals about your career trajectory",
    type: "single", hasOther: true,
    options: [
      { label: "Competitive Coding, Hackathons & Tech Events", sub: "Algorithmic contests, open-source contributions, build events", icon: "code" },
      { label: "Research Internships & Academic Projects", sub: "Lab work, faculty collaborations, published or presented work", icon: "search" },
      { label: "Debate, MUNs & Public Speaking", sub: "Policy discussions, competitive speaking, argumentation, MUN", icon: "shield" },
      { label: "Cultural Clubs, Arts & Creative Expression", sub: "Music, dance, drama, filmmaking, writing, media production", icon: "star" },
      { label: "Volunteering, NSS & Social Initiatives", sub: "Community outreach, NGO work, development and welfare programmes", icon: "heart" },
      { label: "Sports, Athletics & Physical Fitness", sub: "Competitive or recreational sports, coaching, fitness training", icon: "activity" },
      { label: "Startup, Business & Entrepreneurship Clubs", sub: "Business planning, investor pitches, incubation and ideation", icon: "trending" },
      { label: "Student Governance & Leadership Roles", sub: "Student council, club leadership, event management, mentorship", icon: "users" },
    ],
  },
  {
    id: "careerMotivation",
    question: "What do you value most in a career?",
    subtitle: "Your core motivation determines which paths will genuinely fulfil you long-term",
    type: "single", hasOther: true,
    options: [
      { label: "Financial Growth & Long-Term Stability", sub: "Compensation, wealth creation, economic security for family", icon: "trending" },
      { label: "Intellectual Challenge & Continuous Learning", sub: "Hard problems, deep expertise, always growing", icon: "book" },
      { label: "Innovation, Creation & Building New Things", sub: "Products, solutions, systems or art created from scratch", icon: "zap" },
      { label: "Recognition, Prestige & Career Status", sub: "Brand-name employers, professional reputation, respect in field", icon: "award" },
      { label: "Meaningful Social or Community Impact", sub: "Work that directly improves lives, communities or society", icon: "heart" },
      { label: "Creative Freedom & Artistic Expression", sub: "Space to create, design, perform or write on your own terms", icon: "feather" },
      { label: "Work-Life Balance & Personal Wellbeing", sub: "Sustainable pace, time for family and self, holistic fulfilment", icon: "user" },
    ],
  },
  {
    id: "collaborationStyle",
    question: "How do you prefer working with others?",
    subtitle: "Team dynamics are a strong predictor of long-term career satisfaction",
    type: "single", hasOther: true,
    options: [
      { label: "Independently with full ownership", sub: "Deep focus, self-directed outcomes, minimal oversight", icon: "user" },
      { label: "In collaborative cross-functional teams", sub: "Diverse expertise, shared goals, open and flat team culture", icon: "users" },
      { label: "Leading and guiding a small team", sub: "Mentoring, setting direction, driving results through others", icon: "target" },
      { label: "In a structured, process-driven environment", sub: "Clear roles, defined responsibilities, predictable workflows", icon: "list" },
      { label: "Adaptable across all working styles", sub: "Flexible, context-aware, switches between modes fluidly", icon: "grid" },
      { label: "With clients, patients or external stakeholders", sub: "Consulting, counselling, advising, client-relationship management", icon: "globe" },
    ],
  },
  {
    id: "locationPreference",
    question: "Where do you see your career taking root in the next 3–5 years?",
    subtitle: "Geography is a real career constraint — being honest here leads to a more actionable roadmap",
    type: "single",
    options: [
      { label: "My home city or state", sub: "Strong family ties or community roots, preferring local opportunities", icon: "home" },
      { label: "A major Indian metro", sub: "Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune or Kolkata", icon: "pin" },
      { label: "Studying or working abroad", sub: "International exposure — US, UK, Europe, Canada, Australia or Asia", icon: "globe" },
      { label: "Fully remote or location-independent", sub: "Work from anywhere — freelance, digital nomad, remote roles", icon: "grid" },
      { label: "A rural or underserved region", sub: "Community impact, government postings, ground-level development work", icon: "heart" },
      { label: "Open — wherever the best opportunity is", sub: "No strong preference, highly mobile and adaptable to context", icon: "flag" },
    ],
  },
  {
    id: "fiveYearVision",
    question: "In five years, what would you like to be recognised as?",
    subtitle: "Visualise your ideal professional identity — be aspirational and specific",
    type: "single", hasOther: true,
    options: [
      { label: "A specialist at a leading organisation in my field", sub: "Senior professional building things that matter at scale", icon: "briefcase" },
      { label: "A published researcher or PhD scholar", sub: "Advancing the frontier of knowledge in your discipline", icon: "search" },
      { label: "A founder of an impactful venture or practice", sub: "Startup, social enterprise, law firm, clinic or creative studio", icon: "trending" },
      { label: "A creative professional with an established portfolio", sub: "Writer, designer, artist, filmmaker or performer — known for your work", icon: "feather" },
      { label: "A licensed professional in independent practice", sub: "Doctor, lawyer, CA, architect or consultant with your own clients", icon: "award" },
      { label: "An expert with significant international exposure", sub: "Working or studying at a top global institution or organisation", icon: "globe" },
      { label: "A leader shaping policy or driving social change", sub: "Government institution, NGO, civil services or public advocacy", icon: "shield" },
      { label: "A mentor, teacher or domain expert guiding others", sub: "Professor, trainer, coach or senior consultant developing the next generation", icon: "users" },
    ],
  },
];

type Step = "intro" | "quiz" | "analyzing" | "results";

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<any>; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(151,0,3,0.09)" }}>
        <Icon size={14} style={{ color: BRAND }} />
      </div>
      <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
    </div>
  );
}

function OptionCard({ opt, selected, onClick, disabled }: {
  opt: Option; selected: boolean; onClick: () => void; disabled: boolean;
}) {
  const Icon = ICON_MAP[opt.icon] || FiStar;
  return (
    <button
      onClick={onClick}
      disabled={disabled && !selected}
      className={`group relative flex items-start gap-3 w-full px-4 py-3.5 rounded-xl border text-left transition-all duration-150 ${
        selected
          ? "shadow-sm"
          : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-sm"
      } ${disabled && !selected ? "opacity-35 cursor-not-allowed" : ""}`}
      style={selected ? { backgroundColor: BRAND, borderColor: "transparent" } : {}}
    >
      <div className={`mt-0.5 flex-shrink-0 transition-colors ${selected ? "text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${selected ? "text-white" : "text-gray-900 dark:text-gray-100"}`}>
          {opt.label}
        </p>
        {opt.sub && (
          <p className={`text-xs mt-0.5 leading-snug ${selected ? "text-red-100" : "text-gray-400 dark:text-gray-500"}`}>
            {opt.sub}
          </p>
        )}
      </div>
      {selected && <FiCheck size={13} className="text-white flex-shrink-0 mt-0.5" />}
    </button>
  );
}

export default function CareerRoadmapPage() {
  const [step, setStep] = useState<Step>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const [roadmap, setRoadmap] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  const q = QUESTIONS[currentQ];
  const isMulti = q?.type === "multi";
  const current = answers[q?.id] ?? (isMulti ? [] : "");
  const isOtherSelected = isMulti
    ? Array.isArray(current) && (current as string[]).includes("Other")
    : current === "Other";
  const isAnswered = isMulti
    ? Array.isArray(current) && (current as string[]).length > 0
    : !!current;
  const atMax = isMulti && Array.isArray(current) && (current as string[]).length >= (q?.max ?? 4);

  const selectOption = (label: string) => {
    if (!q) return;
    if (isMulti) {
      const prev = Array.isArray(current) ? [...(current as string[])] : [];
      if (prev.includes(label)) {
        setAnswers(a => ({ ...a, [q.id]: prev.filter(x => x !== label) }));
        if (label === "Other") setOtherValues(v => ({ ...v, [q.id]: "" }));
      } else if (prev.length < (q.max ?? 4)) {
        setAnswers(a => ({ ...a, [q.id]: [...prev, label] }));
        if (label === "Other") setTimeout(() => otherRef.current?.focus(), 80);
      }
    } else {
      if (current === label) {
        setAnswers(a => ({ ...a, [q.id]: "" }));
        if (label === "Other") setOtherValues(v => ({ ...v, [q.id]: "" }));
      } else {
        setAnswers(a => ({ ...a, [q.id]: label }));
        if (label === "Other") setTimeout(() => otherRef.current?.focus(), 80);
      }
    }
  };

  const isSelected = (label: string) =>
    isMulti ? Array.isArray(current) && (current as string[]).includes(label) : current === label;

  const getFormattedAnswers = () => {
    const formatted: Record<string, string> = {};
    for (const qq of QUESTIONS) {
      const ans = answers[qq.id];
      const other = otherValues[qq.id] || "";
      if (!ans || (Array.isArray(ans) && ans.length === 0)) continue;
      if (Array.isArray(ans)) {
        formatted[qq.id] = ans.map(a => a === "Other" && other ? `Other: ${other}` : a).join(", ");
      } else {
        formatted[qq.id] = (ans as string) === "Other" && other ? `Other: ${other}` : (ans as string);
      }
    }
    return formatted;
  };

  const next = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(c => c + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setStep("analyzing");
    window.scrollTo({ top: 0 });
    try {
      const res = await fetch("/api/dashboard/student/career-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: getFormattedAnswers() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to generate roadmap. Please try again.");
        setStep("quiz");
        return;
      }
      setRoadmap(data.roadmap);
      setStudentInfo(data.student);
      setStep("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Network error — please check your connection and try again.");
      setStep("quiz");
    }
  };

  const reset = () => {
    setStep("intro");
    setCurrentQ(0);
    setAnswers({});
    setOtherValues({});
    setRoadmap(null);
    setStudentInfo(null);
    window.scrollTo({ top: 0 });
  };

  // ─── Intro ─────────────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-7">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white uppercase tracking-wider" style={{ backgroundColor: BRAND }}>
            <FiMapPin size={10} /> AI-Powered Career Guidance
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Discover Your<br />Career Roadmap
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
            Answer 12 questions about your goals, strengths, and interests — tailored for all UG and PG students across every discipline. Our AI generates a personalised career roadmap with milestones, skill priorities, and university recommendations specific to your profile.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: FiTarget, label: "12 Questions", sub: "~5 minutes" },
            { icon: FiLayers, label: "AI Analysis", sub: "Groq-powered" },
            { icon: FiMapPin, label: "Full Roadmap", sub: "4 years, personalised" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 p-4 text-center space-y-1.5">
              <div className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
                <Icon size={14} style={{ color: BRAND }} />
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 p-5 space-y-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your roadmap includes</p>
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
            {([
              [FiTrendingUp, "Top career paths ranked by fit"],
              [FiLayers,     "Year-wise academic roadmap"],
              [FiSearch,     "Research areas to explore"],
              [FiCode,       "Project & portfolio ideas"],
              [FiGlobe,      "Top universities for Masters / PhD"],
              [FiUsers,      "SAC club recommendations"],
              [FiZap,        "Skills to build with priority"],
              [FiBriefcase,  "Top employers in your domain"],
            ] as [React.ComponentType<any>, string][]).map(([Icon, text]) => (
              <div key={text} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
                  <Icon size={10} style={{ color: BRAND }} />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStep("quiz")}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm shadow-md hover:opacity-90 transition-all"
          style={{ backgroundColor: BRAND }}
        >
          Begin Assessment <FiArrowRight size={14} />
        </button>
      </div>
    );
  }

  // ─── Analyzing ─────────────────────────────────────────────────────────────
  if (step === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-8 text-center px-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-700 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FiTarget size={18} style={{ color: BRAND }} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Building Your Roadmap</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            Our AI is analysing your responses and generating a personalised career pathway. This takes approximately 10–20 seconds.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {["Analysing responses", "Mapping career paths", "Finding clubs", "Building roadmap"].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: BRAND, animationDelay: `${i * 0.3}s` }} />
              {s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Quiz ──────────────────────────────────────────────────────────────────
  if (step === "quiz") {
    const progress = (currentQ / QUESTIONS.length) * 100;
    const selectedCount = isMulti && Array.isArray(current) ? (current as string[]).length : 0;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-400">
            <span className="font-medium text-gray-600 dark:text-gray-300">
              Question <span style={{ color: BRAND }}>{currentQ + 1}</span> / {QUESTIONS.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, backgroundColor: BRAND }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-50 dark:border-zinc-800/60">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-md text-white uppercase tracking-wider"
                style={{ backgroundColor: BRAND }}
              >
                Q{currentQ + 1}
              </span>
              {isMulti && (
                <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-zinc-700">
                  Select up to {q.max} &nbsp;·&nbsp; {selectedCount} selected
                </span>
              )}
            </div>
            <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-snug">{q.question}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 leading-relaxed">{q.subtitle}</p>
          </div>

          <div className="p-4 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map(opt => (
                <OptionCard
                  key={opt.label}
                  opt={opt}
                  selected={isSelected(opt.label)}
                  onClick={() => selectOption(opt.label)}
                  disabled={!!(isMulti && atMax && !isSelected(opt.label))}
                />
              ))}
              {q.hasOther && (
                <OptionCard
                  opt={{ label: "Other", sub: "Specify your own answer in the field below", icon: "edit" }}
                  selected={isOtherSelected}
                  onClick={() => selectOption("Other")}
                  disabled={!!(isMulti && atMax && !isOtherSelected)}
                />
              )}
            </div>

            {isOtherSelected && (
              <div className="pt-1">
                <input
                  ref={otherRef}
                  type="text"
                  value={otherValues[q.id] || ""}
                  onChange={e => setOtherValues(v => ({ ...v, [q.id]: e.target.value }))}
                  placeholder="Type your answer here…"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700/30 focus:border-red-700/40 transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => { setCurrentQ(c => Math.max(0, c - 1)); window.scrollTo({ top: 0 }); }}
            disabled={currentQ === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <FiArrowLeft size={13} /> Back
          </button>
          <button
            onClick={next}
            disabled={!isAnswered}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:opacity-90"
            style={{ backgroundColor: BRAND }}
          >
            {currentQ === QUESTIONS.length - 1 ? "Generate My Roadmap" : "Continue"} <FiArrowRight size={13} />
          </button>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 pt-1">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300 ease-out"
              style={{
                width: i === currentQ ? "18px" : "5px",
                height: "5px",
                backgroundColor: i <= currentQ ? BRAND : "#e5e7eb",
                opacity: i === currentQ ? 1 : i < currentQ ? 0.55 : 0.3,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── Results ───────────────────────────────────────────────────────────────
  if (step === "results" && roadmap) {
    const domColor = DOMAIN_COLORS[roadmap.primaryDomain] || BRAND;

    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-7">

        {/* Hero */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: domColor + "28" }}>
          <div className="p-6 md:p-8" style={{ background: `linear-gradient(135deg, ${domColor}10 0%, rgba(151,0,3,0.05) 100%)` }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-white" style={{ backgroundColor: domColor }}>
                    {roadmap.primaryDomain} · {DOMAIN_LABELS[roadmap.primaryDomain] || roadmap.primaryDomain}
                  </span>
                  {studentInfo?.branch && (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-900">
                      {studentInfo.branch}
                    </span>
                  )}
                  {roadmap.careerDirection && (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-900">
                      {roadmap.careerDirection}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{roadmap.headline}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">{roadmap.overview}</p>
                {roadmap.personalityTraits?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.personalityTraits.map((t: string) => (
                      <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-500 hover:bg-white dark:hover:bg-zinc-900 transition-all flex-shrink-0">
                <FiRefreshCw size={11} /> Retake
              </button>
            </div>
          </div>
          {roadmap.motivationalMessage && (
            <div className="px-6 md:px-8 py-3.5 border-t" style={{ borderColor: domColor + "18", backgroundColor: domColor + "05" }}>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed">
                "{roadmap.motivationalMessage}"
              </p>
            </div>
          )}
        </div>

        {/* Career Paths */}
        {roadmap.careerPaths?.length > 0 && (
          <section>
            <SectionHeader icon={FiTrendingUp} title="Career Paths Matched to Your Profile" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roadmap.careerPaths.map((cp: any, i: number) => {
                const rc = [BRAND, domColor, "#6b7280"][i];
                const rl = ["Best Match", "Strong Fit", "Good Fit"][i];
                return (
                  <div key={cp.title} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-3 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md text-white" style={{ backgroundColor: rc }}>{rl}</span>
                      <span className="text-2xl font-extrabold" style={{ color: rc }}>
                        {cp.relevanceScore}<span className="text-xs font-normal text-gray-400">%</span>
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{cp.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{cp.description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <FiTarget size={10} /> {cp.timeToReach}
                      </div>
                      <div className="h-1 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${cp.relevanceScore}%`, backgroundColor: rc }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4-Year Roadmap */}
        {roadmap.yearwiseRoadmap && (
          <section>
            <SectionHeader icon={FiMapPin} title="Your 4-Year Career Roadmap" />
            <div className="relative">
              {/* Connecting gradient line — desktop only */}
              <div
                className="hidden lg:block absolute z-0 h-0.5"
                style={{
                  top: "24px",
                  left: "12.5%",
                  right: "12.5%",
                  background: `linear-gradient(to right, ${BRAND}, #2563eb, #7c3aed, #16a34a)`,
                }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(["year1", "year2", "year3", "year4"] as const).map((yr, i) => {
                  const y = roadmap.yearwiseRoadmap[yr];
                  if (!y) return null;
                  const yc = YEAR_COLORS[i];
                  return (
                    <div key={yr} className="relative z-10">
                      {/* Desktop circle on timeline */}
                      <div className="hidden lg:flex justify-center mb-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-extrabold shadow-lg ring-4 ring-white dark:ring-zinc-900"
                          style={{ backgroundColor: yc }}
                        >
                          Y{i + 1}
                        </div>
                      </div>
                      {/* Mobile year divider */}
                      <div className="flex lg:hidden items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0" style={{ backgroundColor: yc }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 h-px" style={{ backgroundColor: yc + "40" }} />
                      </div>
                      {/* Card */}
                      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="px-4 py-3" style={{ backgroundColor: yc + "0e", borderBottom: `2px solid ${yc}28` }}>
                          <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: yc }}>Year {i + 1}</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{y.focus}</p>
                        </div>
                        <div className="p-4 space-y-3">
                          {y.goals?.length > 0 && (
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Goals</p>
                              <ul className="space-y-1.5">
                                {y.goals.map((g: string) => (
                                  <li key={g} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: yc }} />
                                    {g}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {y.skills?.length > 0 && (
                            <div>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Key Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {y.skills.map((s: string) => (
                                  <span key={s} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {y.samamTip && (
                            <div className="border-l-2 border-blue-300 dark:border-blue-700 pl-2.5">
                              <p className="text-[10px] text-blue-600 dark:text-blue-400 italic leading-relaxed">{y.samamTip}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Research Areas */}
        {roadmap.researchAreas?.length > 0 && (
          <section>
            <SectionHeader icon={FiSearch} title="Research Areas to Explore" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.researchAreas.map((r: any) => (
                <div key={r.area} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
                      <FiSearch size={13} style={{ color: BRAND }} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{r.area}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{r.description}</p>
                      {r.subfields?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {r.subfields.map((sf: string) => (
                            <span key={sf} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
                              {sf}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Project & Portfolio Ideas */}
        {roadmap.engineeringProjectIdeas?.length > 0 && (
          <section>
            <SectionHeader icon={FiCode} title="Project & Portfolio Ideas" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.engineeringProjectIdeas.map((p: any) => (
                <div key={p.title} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-4 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug flex-1">{p.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 mt-0.5 ${DIFFICULTY_STYLE[p.difficulty] || DIFFICULTY_STYLE.Intermediate}`}>
                      {p.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{p.description}</p>
                  {p.tools?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.tools.map((t: string) => (
                        <span key={t} className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.impact && (
                    <div className="flex items-start gap-1.5 text-[11px] text-green-600 dark:text-green-400">
                      <FiZap size={10} className="mt-0.5 flex-shrink-0" />{p.impact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Universities */}
        {roadmap.topUniversities?.length > 0 && (
          <section>
            <SectionHeader icon={FiGlobe} title="Top Universities for Masters / PhD" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roadmap.topUniversities.map((u: any) => (
                <div key={u.name} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-4 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
                      <FiFlag size={11} className="text-blue-500 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{u.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{u.country}{u.ranking ? ` · ${u.ranking}` : ""}</p>
                    </div>
                  </div>
                  {u.program && <p className="text-[11px] font-semibold" style={{ color: BRAND }}>{u.program}</p>}
                  {u.highlights && <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{u.highlights}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Clubs + Skills + Employers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roadmap.clubRecommendations?.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
                  <FiUsers size={11} style={{ color: BRAND }} />
                </div>
                SAC Clubs for You
              </h3>
              <div className="space-y-3">
                {roadmap.clubRecommendations.map((c: any) => {
                  const cc = DOMAIN_COLORS[c.domain] || "#6b7280";
                  return (
                    <div key={c.clubName} className="rounded-xl p-3 space-y-1.5" style={{ backgroundColor: cc + "0b", border: `1px solid ${cc}22` }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: cc }}>{c.domain}</span>
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{c.clubName}</p>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{c.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {roadmap.skillsToLearn?.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
                  <FiZap size={11} style={{ color: BRAND }} />
                </div>
                Skills to Master
              </h3>
              <div className="space-y-3">
                {roadmap.skillsToLearn.map((s: any) => (
                  <div key={s.skill} className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{s.skill}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{s.timeframe}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border flex-shrink-0 ${PRIORITY_STYLE[s.priority] || PRIORITY_STYLE.Medium}`}>
                      {s.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {roadmap.topCompanies?.length > 0 && (
              <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
                    <FiBriefcase size={11} style={{ color: BRAND }} />
                  </div>
                  Top Employers
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {roadmap.topCompanies.map((c: string) => (
                    <span key={c} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {roadmap.socialImpactOpportunities?.length > 0 && (
              <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
                    <FiHeart size={11} style={{ color: BRAND }} />
                  </div>
                  Social Impact
                </h3>
                <ul className="space-y-2">
                  {roadmap.socialImpactOpportunities.map((s: string) => (
                    <li key={s} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <div className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center pb-2">
          <button onClick={reset} className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <FiRefreshCw size={11} /> Retake the assessment
          </button>
        </div>
      </div>
    );
  }

  return null;
}
