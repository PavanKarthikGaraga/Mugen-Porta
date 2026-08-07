"use client";
import { useState, useEffect, useRef } from "react";
import {
  FiArrowRight, FiArrowLeft, FiRefreshCw, FiTrendingUp, FiUsers,
  FiTarget, FiZap, FiCheck, FiBriefcase, FiBook, FiSearch, FiHeart,
  FiGlobe, FiCode, FiCpu, FiBarChart2, FiFileText, FiEdit3, FiShield,
  FiAward, FiGrid, FiUser, FiActivity, FiLayers, FiStar,
  FiSettings, FiMapPin, FiHome, FiList, FiFlag, FiFeather, FiVolume2, FiVolumeX
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
  TEC: "Technical", LCH: "Liberal Arts, Culture and Heritage", ESO: "Social Outreach",
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
  type: "single" | "multi" | "text" | "scale"; max?: number;
  options?: Option[]; hasOther?: boolean;
  section?: string; placeholder?: string;
}

const QUESTIONS: Question[] = [
  // ── SECTION 1: Student Profile ──────────────────────────────────────────────
  {
    id: "academicStage", section: "Section 1 · Student Profile",
    question: "What stage of your academic journey are you currently at?",
    subtitle: "This helps calibrate your roadmap to where you are right now",
    type: "single",
    options: [
      { label: "UG – 1st Year", icon: "book" },
      { label: "UG – 2nd Year", icon: "book" },
      { label: "UG – 3rd Year", icon: "layers" },
      { label: "UG – 4th Year", icon: "layers" },
      { label: "PG – 1st Year", icon: "award" },
      { label: "PG – Final Year", icon: "award" },
      { label: "PhD / Research Scholar", icon: "search" },
    ],
  },
  {
    id: "academicField",
    question: "Which academic field are you studying?",
    subtitle: "Choose the discipline that best reflects your degree programme",
    type: "single", hasOther: true,
    options: [
      { label: "Engineering & Technology", icon: "cpu" },
      { label: "Sciences", icon: "layers" },
      { label: "Management", icon: "briefcase" },
      { label: "Commerce", icon: "trending" },
      { label: "Arts & Humanities", icon: "feather" },
      { label: "Law", icon: "shield" },
      { label: "Pharmacy", icon: "heart" },
      { label: "Medicine", icon: "heart" },
      { label: "Agriculture", icon: "activity" },
      { label: "Design", icon: "edit" },
      { label: "Architecture", icon: "home" },
      { label: "Education", icon: "users" },
    ],
  },
  {
    id: "branchSpecialization",
    question: "Which branch / specialization are you in?",
    subtitle: "E.g. Computer Science, Mechanical Engineering, MBA Finance, LLB, MBBS, B.Des — be specific",
    type: "text", placeholder: "Type your branch or specialization…",
  },

  // ── SECTION 2: Personality & Interests ──────────────────────────────────────
  {
    id: "activitiesEnjoy", section: "Section 2 · Personality & Interests",
    question: "Which activities do you genuinely enjoy?",
    subtitle: "Select all that apply — the more honest you are, the better your roadmap",
    type: "multi", max: 8, hasOther: true,
    options: [
      { label: "Solving problems", icon: "layers" },
      { label: "Designing things", icon: "edit" },
      { label: "Drawing", icon: "feather" },
      { label: "Coding", icon: "code" },
      { label: "Speaking / Presenting", icon: "users" },
      { label: "Teaching others", icon: "users" },
      { label: "Organizing events", icon: "list" },
      { label: "Music", icon: "star" },
      { label: "Dance", icon: "activity" },
      { label: "Photography", icon: "grid" },
      { label: "Sports", icon: "activity" },
      { label: "Reading books", icon: "book" },
      { label: "Travelling", icon: "globe" },
      { label: "Gaming", icon: "grid" },
      { label: "Helping people", icon: "heart" },
      { label: "Writing", icon: "feather" },
      { label: "Research", icon: "search" },
      { label: "Building hardware", icon: "cpu" },
      { label: "Starting businesses", icon: "trending" },
      { label: "Making videos / content", icon: "flag" },
      { label: "Cooking", icon: "heart" },
      { label: "Gardening / Nature", icon: "activity" },
    ],
  },
  {
    id: "freeTime",
    question: "During your free time, what do you usually do?",
    subtitle: "Select up to 3 — your leisure habits reveal your dominant intelligences",
    type: "multi", max: 3, hasOther: true,
    options: [
      { label: "Watch YouTube / OTT", icon: "flag" },
      { label: "Read Books", icon: "book" },
      { label: "Meet Friends", icon: "users" },
      { label: "Play Sports", icon: "activity" },
      { label: "Listen to Music", icon: "star" },
      { label: "Learn New Skills", icon: "zap" },
      { label: "Create Content", icon: "edit" },
      { label: "Coding", icon: "code" },
      { label: "Sleep / Rest", icon: "home" },
      { label: "Travel", icon: "globe" },
      { label: "Social Media", icon: "grid" },
      { label: "Volunteer / Social Work", icon: "heart" },
    ],
  },
  {
    id: "happiness",
    question: "What makes you feel happiest?",
    subtitle: "Choose the one that resonates most deeply — this is your core emotional motivator",
    type: "single", hasOther: true,
    options: [
      { label: "Solving difficult problems", icon: "layers" },
      { label: "Helping people", icon: "heart" },
      { label: "Winning competitions", icon: "award" },
      { label: "Creating something new", icon: "zap" },
      { label: "Appreciating nature", icon: "activity" },
      { label: "Performing on stage", icon: "star" },
      { label: "Spending time with family", icon: "home" },
      { label: "Learning something new", icon: "book" },
      { label: "Earning money", icon: "trending" },
      { label: "Leading a team", icon: "users" },
    ],
  },
  {
    id: "stressResponse",
    question: "When you feel stressed, what do you usually do?",
    subtitle: "This reveals your emotional intelligence and coping style",
    type: "single", hasOther: true,
    options: [
      { label: "Talk with friends", icon: "users" },
      { label: "Talk with family", icon: "home" },
      { label: "Stay alone / Reflect", icon: "user" },
      { label: "Listen to music", icon: "star" },
      { label: "Exercise / Sports", icon: "activity" },
      { label: "Pray / Meditate", icon: "heart" },
      { label: "Sleep", icon: "home" },
      { label: "Watch movies / shows", icon: "flag" },
      { label: "Play games", icon: "grid" },
      { label: "Write my thoughts", icon: "feather" },
      { label: "Work harder / Stay busy", icon: "zap" },
    ],
  },
  {
    id: "personalityType",
    question: "Which describes you best?",
    subtitle: "Introvert, Extrovert, or Ambivert — this shapes your ideal work environment",
    type: "single",
    options: [
      { label: "I enjoy meeting many people — I recharge socially", sub: "Extrovert", icon: "users" },
      { label: "I enjoy spending time alone — I recharge in solitude", sub: "Introvert", icon: "user" },
      { label: "I enjoy both equally depending on context", sub: "Ambivert", icon: "grid" },
    ],
  },

  // ── SECTION 3: Dreams & Career Vision ───────────────────────────────────────
  {
    id: "childhoodDream", section: "Section 3 · Dreams & Career Vision",
    question: "What was your childhood dream or aspiration?",
    subtitle: "Even if it has changed — childhood dreams often reveal your deepest values and strengths",
    type: "text", placeholder: "e.g. Astronaut, Teacher, Doctor, Game developer, Singer…",
  },
  {
    id: "fiveYearCareer",
    question: "What would you like to become in the next five years?",
    subtitle: "Pick the role that feels most aligned with where you're heading right now",
    type: "single", hasOther: true,
    options: [
      { label: "Software Engineer", icon: "code" },
      { label: "AI / ML Engineer", icon: "cpu" },
      { label: "Scientist / Researcher", icon: "search" },
      { label: "Entrepreneur / Founder", icon: "trending" },
      { label: "IAS / IPS / Civil Servant", icon: "shield" },
      { label: "Doctor / Healthcare Professional", icon: "heart" },
      { label: "Professor / Educator", icon: "users" },
      { label: "Research Scholar", icon: "book" },
      { label: "Artist / Creative Professional", icon: "star" },
      { label: "Business Leader", icon: "briefcase" },
      { label: "Lawyer", icon: "shield" },
      { label: "Chartered Accountant", icon: "chart" },
      { label: "Social Entrepreneur", icon: "heart" },
    ],
  },
  {
    id: "careerMotivation",
    question: "Why do you want this career?",
    subtitle: "The reason behind your goal matters as much as the goal itself",
    type: "single", hasOther: true,
    options: [
      { label: "Passion — I genuinely love this field", icon: "heart" },
      { label: "Good salary / Financial security", icon: "trending" },
      { label: "Family expectation / Family dream", icon: "home" },
      { label: "Social respect and recognition", icon: "award" },
      { label: "Job security / Stability", icon: "shield" },
      { label: "Opportunity to help society", icon: "users" },
      { label: "Innovation and creating new things", icon: "zap" },
      { label: "Personal interest and curiosity", icon: "search" },
    ],
  },
  {
    id: "careerValues",
    question: "What matters most in your future career?",
    subtitle: "Choose your top TWO priorities — these define the kind of career that will truly fulfil you",
    type: "multi", max: 2,
    options: [
      { label: "High Salary", icon: "trending" },
      { label: "Job Security", icon: "shield" },
      { label: "Creativity", icon: "edit" },
      { label: "Innovation", icon: "zap" },
      { label: "Leadership", icon: "users" },
      { label: "Social Impact", icon: "heart" },
      { label: "Research", icon: "search" },
      { label: "Freedom / Autonomy", icon: "globe" },
      { label: "Recognition", icon: "award" },
      { label: "Work-Life Balance", icon: "home" },
    ],
  },

  // ── SECTION 4: Learning Style ────────────────────────────────────────────────
  {
    id: "learningStyle", section: "Section 4 · Learning Style",
    question: "How do you learn best?",
    subtitle: "Choose what genuinely works for you, not what you think you should say",
    type: "single",
    options: [
      { label: "Reading textbooks / articles", icon: "book" },
      { label: "Watching videos / tutorials", icon: "flag" },
      { label: "Doing hands-on projects", icon: "settings" },
      { label: "Listening to lectures", icon: "users" },
      { label: "Group discussion & debate", icon: "grid" },
      { label: "Teaching / explaining to others", icon: "star" },
      { label: "Trial and error / experimenting", icon: "zap" },
    ],
  },
  {
    id: "bloomsLevel",
    question: "When learning something new, you prefer to…",
    subtitle: "This maps your cognitive preference to Bloom's Taxonomy — a key indicator of your learning depth",
    type: "single",
    options: [
      { label: "Remember facts and definitions", sub: "Recall · Memorize · Recognize", icon: "list" },
      { label: "Understand the core concept", sub: "Explain · Summarize · Interpret", icon: "book" },
      { label: "Apply the idea to a real situation", sub: "Use · Demonstrate · Solve", icon: "settings" },
      { label: "Analyze and break problems apart", sub: "Compare · Examine · Differentiate", icon: "layers" },
      { label: "Evaluate different solutions critically", sub: "Judge · Justify · Critique", icon: "search" },
      { label: "Create something entirely new", sub: "Design · Invent · Build", icon: "zap" },
    ],
  },
  {
    id: "problemApproach",
    question: "When solving problems you usually…",
    subtitle: "Pick the approach that feels most natural to you",
    type: "single",
    options: [
      { label: "Follow existing instructions step by step", icon: "list" },
      { label: "Use known methods I've seen before", icon: "book" },
      { label: "Compare different methods and pick the best", icon: "layers" },
      { label: "Design my own solution from scratch", icon: "edit" },
      { label: "Experiment with entirely new ideas", icon: "zap" },
    ],
  },
  {
    id: "selfStatement",
    question: "Which statement suits you best?",
    subtitle: "Be honest — there are no wrong answers here",
    type: "single",
    options: [
      { label: "I enjoy memorizing information efficiently", icon: "list" },
      { label: "I enjoy understanding concepts deeply", icon: "book" },
      { label: "I enjoy applying knowledge practically", icon: "settings" },
      { label: "I enjoy solving real-world problems", icon: "target" },
      { label: "I enjoy creating original new ideas", icon: "zap" },
    ],
  },

  // ── SECTION 5: Multiple Intelligence ────────────────────────────────────────
  {
    id: "gardnerActivities", section: "Section 5 · Multiple Intelligence",
    question: "Which activities sound most exciting to you?",
    subtitle: "Choose exactly 5 — these responses reveal your Howard Gardner intelligence profile",
    type: "multi", max: 5,
    options: [
      { label: "Writing stories / poetry", icon: "feather" },
      { label: "Learning new languages", icon: "globe" },
      { label: "Solving logical puzzles", icon: "layers" },
      { label: "Mathematics / Calculus", icon: "chart" },
      { label: "Coding / Programming", icon: "code" },
      { label: "Playing a musical instrument", icon: "star" },
      { label: "Singing / Vocal performance", icon: "star" },
      { label: "Dancing / Choreography", icon: "activity" },
      { label: "Drawing / Illustration", icon: "edit" },
      { label: "Photography / Filmmaking", icon: "grid" },
      { label: "Building machines / Electronics", icon: "cpu" },
      { label: "Gardening / Botany", icon: "activity" },
      { label: "Wildlife / Animals / Ecology", icon: "activity" },
      { label: "Team leadership / Coordination", icon: "users" },
      { label: "Teaching / Coaching", icon: "users" },
      { label: "Public speaking / Debate", icon: "users" },
      { label: "Meditation / Mindfulness", icon: "heart" },
      { label: "Self-reflection / Journaling", icon: "feather" },
      { label: "Sports / Athletics", icon: "activity" },
      { label: "Acting / Theatre / Drama", icon: "flag" },
    ],
  },

  // ── SECTION 6: Skills & Campus Life ─────────────────────────────────────────
  {
    id: "skillsImproving", section: "Section 6 · Skills & Campus Life",
    question: "Which skills are you currently improving?",
    subtitle: "Select up to 5 — be honest about where you're actually putting in time",
    type: "multi", max: 5, hasOther: true,
    options: [
      { label: "Programming / Coding", icon: "code" },
      { label: "Artificial Intelligence / ML", icon: "cpu" },
      { label: "Data Science / Analytics", icon: "chart" },
      { label: "Electronics / Robotics", icon: "cpu" },
      { label: "Public Speaking", icon: "users" },
      { label: "Leadership", icon: "target" },
      { label: "Marketing / Branding", icon: "globe" },
      { label: "Finance / Accounting", icon: "trending" },
      { label: "Research / Academic Writing", icon: "search" },
      { label: "Graphic Design / UI-UX", icon: "edit" },
      { label: "Video Editing / Content Creation", icon: "flag" },
      { label: "Entrepreneurship / Business", icon: "trending" },
      { label: "Creative Writing", icon: "feather" },
      { label: "Teaching / Tutoring", icon: "book" },
      { label: "Photography", icon: "grid" },
      { label: "Languages", icon: "globe" },
    ],
  },
  {
    id: "campusActivities",
    question: "Which campus activities excite you most?",
    subtitle: "Select up to 3 that you genuinely enjoy or would love to participate in",
    type: "multi", max: 3,
    options: [
      { label: "Hackathons / Tech Competitions", icon: "code" },
      { label: "Research / Academic Projects", icon: "search" },
      { label: "Clubs / Extracurriculars", icon: "star" },
      { label: "NSS / Social Service", icon: "heart" },
      { label: "Sports / Athletics", icon: "activity" },
      { label: "Cultural Events / Fests", icon: "flag" },
      { label: "Innovation Challenges", icon: "zap" },
      { label: "Startup / Business Competitions", icon: "trending" },
      { label: "Conferences / Seminars", icon: "users" },
    ],
  },
  {
    id: "teamRole",
    question: "Which role do you naturally take in a team?",
    subtitle: "Think of any group project, club, or event you have been part of",
    type: "single",
    options: [
      { label: "Leader — I set direction and motivate the team", icon: "target" },
      { label: "Planner — I organize tasks and timelines", icon: "list" },
      { label: "Creative Thinker — I generate ideas", icon: "zap" },
      { label: "Researcher — I gather data and insights", icon: "search" },
      { label: "Presenter — I communicate ideas to others", icon: "users" },
      { label: "Technical Expert — I do the core technical work", icon: "cpu" },
      { label: "Supporter — I help whoever needs it most", icon: "heart" },
      { label: "Organizer — I handle logistics and details", icon: "settings" },
    ],
  },

  // ── SECTION 7: Career Readiness ──────────────────────────────────────────────
  {
    id: "postGradPlan", section: "Section 7 · Career Readiness",
    question: "After graduation, what is your first preference?",
    subtitle: "Be realistic about what you're most likely to pursue immediately after finishing your degree",
    type: "single",
    options: [
      { label: "Job / Corporate placement", icon: "briefcase" },
      { label: "Higher Studies (PG / MS / MBA)", icon: "book" },
      { label: "Start my own business / Startup", icon: "trending" },
      { label: "Government job / Civil services", icon: "shield" },
      { label: "Research / PhD", icon: "search" },
      { label: "Family business", icon: "home" },
      { label: "Still undecided", icon: "layers" },
    ],
  },
  {
    id: "workLocation",
    question: "Where would you like to work?",
    subtitle: "Select all that apply — location shapes your salary, lifestyle, and opportunities",
    type: "multi", max: 3,
    options: [
      { label: "India — major metro city", icon: "pin" },
      { label: "Abroad / International", icon: "globe" },
      { label: "Remote / Work from anywhere", icon: "grid" },
      { label: "Startup ecosystem", icon: "trending" },
      { label: "MNC / Large corporation", icon: "briefcase" },
      { label: "Government / Public sector", icon: "shield" },
      { label: "NGO / Social sector", icon: "heart" },
    ],
  },
  {
    id: "orgAttraction",
    question: "What type of organization attracts you most?",
    subtitle: "Select up to 3 — think about where you would be most fulfilled and effective",
    type: "multi", max: 3,
    options: [
      { label: "Google / Meta / Apple (Big Tech)", icon: "code" },
      { label: "Microsoft / Amazon / TCS / Infosys", icon: "briefcase" },
      { label: "ISRO / DRDO / BARC (Research & Defence)", icon: "search" },
      { label: "McKinsey / BCG / Deloitte (Consulting)", icon: "chart" },
      { label: "Hospitals / Healthcare systems", icon: "heart" },
      { label: "Universities / Academic institutions", icon: "users" },
      { label: "Startups / Early-stage ventures", icon: "trending" },
      { label: "NGOs / Non-profits / Social enterprises", icon: "globe" },
      { label: "Government / IAS / PSU", icon: "shield" },
      { label: "Law firms / Courts", icon: "shield" },
      { label: "Creative studios / Media houses", icon: "edit" },
    ],
  },
  {
    id: "careerConfidence",
    question: "How confident are you about your career direction?",
    subtitle: "Rate from 1 (very unsure) to 5 (extremely confident) — honesty gives you a better roadmap",
    type: "scale",
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
  const [featureEnabled, setFeatureEnabled] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const [roadmap, setRoadmap] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [checkingCache, setCheckingCache] = useState(true);
  const [activeProjectTab, setActiveProjectTab] = useState<"software" | "hardware" | "management">("software");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const otherRef = useRef<HTMLInputElement>(null);

  // Check feature flag on mount
  useEffect(() => {
    fetch("/api/features/career-roadmap")
      .then(r => r.json())
      .then(d => setFeatureEnabled(d.enabled !== false))
      .catch(() => setFeatureEnabled(true));
  }, []);

  // Check for cached roadmap on mount
  useEffect(() => {
    fetch("/api/dashboard/student/career-roadmap")
      .then(r => r.json())
      .then(d => {
        if (d.cached && d.roadmap) {
          setRoadmap(d.roadmap);
          setGeneratedAt(d.generatedAt);
          setStep("results");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingCache(false));
  }, []);

  // Voice Assistant logic
  useEffect(() => {
    if (!isVoiceEnabled || step !== "quiz") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentQuestion = QUESTIONS[currentQ];
    if (currentQuestion) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${currentQuestion.question}. ${currentQuestion.subtitle}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
    
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [currentQ, isVoiceEnabled, step]);

  const q = QUESTIONS[currentQ];
  const isMulti = q?.type === "multi";
  const isText = q?.type === "text";
  const isScale = q?.type === "scale";
  const current = answers[q?.id] ?? (isMulti ? [] : "");
  const isOtherSelected = isMulti
    ? Array.isArray(current) && (current as string[]).includes("Other")
    : current === "Other";
  const isAnswered = isText
    ? !!((answers[q?.id] as string) || "").trim()
    : isScale
    ? !!answers[q?.id]
    : isMulti
    ? Array.isArray(current) && (current as string[]).length > 0 && (!isOtherSelected || !!otherValues[q?.id])
    : !!current && (!isOtherSelected || !!otherValues[q?.id]);
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
    const SCALE_LABELS: Record<string, string> = {
      "1": "Not confident at all", "2": "Slightly confident",
      "3": "Moderately confident", "4": "Quite confident", "5": "Very confident",
    };
    const formatted: Record<string, string> = {};
    for (const qq of QUESTIONS) {
      const ans = answers[qq.id];
      const other = otherValues[qq.id] || "";
      if (!ans || (Array.isArray(ans) && ans.length === 0)) continue;
      if (qq.type === "scale") {
        formatted[qq.id] = `${ans}/5 — ${SCALE_LABELS[ans as string] || ans}`;
      } else if (Array.isArray(ans)) {
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
    setGeneratedAt(null);
    window.scrollTo({ top: 0 });
  };

  // ─── Cache check ───────────────────────────────────────────────────────────
  if (featureEnabled === null || checkingCache) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-gray-100 border-t-red-700 animate-spin" />
        <p className="text-sm text-gray-400">Loading your roadmap…</p>
      </div>
    );
  }

  if (!featureEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="text-5xl mb-2">🚧</div>
        <h2 className="text-[18px] font-semibold text-gray-800">This page is currently under development</h2>
        <p className="text-[14px] text-gray-500">Please check back later!</p>
      </div>
    );
  }

  // ─── Intro ─────────────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      // Two columns from lg up so the intro fills the width instead of
      // leaving large empty margins either side of a narrow centred column.
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-10 items-start">

          {/* Left — pitch, highlights and the CTA */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white uppercase tracking-wider" style={{ backgroundColor: BRAND }}>
                <FiMapPin size={10} /> AI-Powered Career Guidance
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-[1.15]">
                Discover Your Career Roadmap
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Answer 24 questions covering your personality, learning style, and career vision — tailored for UG, PG, and PhD students across every discipline. Our AI generates a deep personalised roadmap including your Gardner intelligence profile, Bloom's taxonomy level, personality analysis, and a complete personal development plan.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FiTarget, label: "24 Questions", sub: "~10 minutes" },
                { icon: FiLayers, label: "AI Analysis", sub: "Groq-powered" },
                { icon: FiMapPin, label: "Full Roadmap", sub: "7 sections" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 p-3 text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
                    <Icon size={14} style={{ color: BRAND }} />
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{label}</p>
                  <p className="text-[11px] text-gray-400 leading-tight">{sub}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep("quiz")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm shadow-md hover:opacity-90 transition-all"
              style={{ backgroundColor: BRAND }}
            >
              Begin Assessment <FiArrowRight size={14} />
            </button>
          </div>

          {/* Right — what they get. Single column here so the longer lines
              ("Top universities for Masters / PhD") don't wrap awkwardly. */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 p-5 space-y-3.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your roadmap includes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-y-3 gap-x-4">
              {([
                [FiTrendingUp, "Top career paths ranked by fit"],
                [FiUser,       "Personality profile analysis"],
                [FiGrid,       "Gardner intelligence report"],
                [FiLayers,     "Bloom's taxonomy level"],
                [FiMapPin,     "Year-wise career roadmap"],
                [FiCode,       "Project ideas — 3 categories"],
                [FiGlobe,      "Top universities for Masters / PhD"],
                [FiBriefcase,  "Top MNCs with salary data"],
                [FiUsers,      "SAC club recommendations"],
                [FiAward,      "Personal development plan"],
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
        </div>
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
          {["Analysing personality", "Mapping Gardner intelligence", "Scoring Bloom's level", "Building career roadmap", "Preparing development plan"].map((s, i) => (
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                {q.section && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {q.section}
                  </span>
                )}
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-md text-white uppercase tracking-wider"
                  style={{ backgroundColor: BRAND }}
                >
                  Q{currentQ + 1}
                </span>
                {isMulti && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-zinc-700">
                    Choose {q.max ? `up to ${q.max}` : "any"} &nbsp;·&nbsp; {selectedCount} selected
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsVoiceEnabled(v => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                  isVoiceEnabled
                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                    : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700"
                }`}
                title="VYN - Visionary Youth Navigator"
              >
                {isVoiceEnabled ? (
                  <><FiVolume2 size={12} className={isSpeaking ? "animate-pulse" : ""} /> VYN On</>
                ) : (
                  <><FiVolumeX size={12} /> VYN Off</>
                )}
              </button>
            </div>
            <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-snug">{q.question}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 leading-relaxed">{q.subtitle}</p>
          </div>

          <div className="p-4 space-y-3">
            {/* Text input */}
            {isText && (
              <textarea
                value={(answers[q.id] as string) || ""}
                onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                placeholder={q.placeholder || "Type your answer here…"}
                rows={4}
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700/40 transition-all resize-none"
              />
            )}

            {/* Scale 1–5 */}
            {isScale && (
              <div className="space-y-4 py-2">
                <div className="flex gap-2 justify-center flex-wrap">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setAnswers(a => ({ ...a, [q.id]: String(n) }))}
                      className={`w-16 h-16 rounded-2xl border-2 text-xl font-extrabold transition-all ${
                        answers[q.id] === String(n)
                          ? "text-white border-transparent shadow-lg scale-110"
                          : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-gray-400 hover:scale-105"
                      }`}
                      style={answers[q.id] === String(n) ? { backgroundColor: BRAND } : {}}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-medium px-2">
                  <span>1 — Very unsure</span>
                  <span>5 — Extremely confident</span>
                </div>
                {answers[q.id] && (
                  <p className="text-center text-sm font-semibold" style={{ color: BRAND }}>
                    {["", "Very unsure", "Slightly unsure", "Moderately confident", "Quite confident", "Extremely confident"][Number(answers[q.id]) || 0]}
                  </p>
                )}
              </div>
            )}

            {/* Options grid (single / multi) */}
            {(q.type === "single" || q.type === "multi") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(q.options || []).map(opt => (
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
                    opt={{ label: "Other", sub: "Specify your own answer below", icon: "edit" }}
                    selected={isOtherSelected}
                    onClick={() => selectOption("Other")}
                    disabled={!!(isMulti && atMax && !isOtherSelected)}
                  />
                )}
              </div>
            )}

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
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {generatedAt && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-600">
                    Generated {new Date(generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
                <button onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-500 hover:bg-white dark:hover:bg-zinc-900 transition-all">
                  <FiRefreshCw size={11} /> Retake
                </button>
              </div>
            </div>
          </div>
          {roadmap.motivationalMessage && (
            <div className="px-6 md:px-8 py-3.5 border-t" style={{ borderColor: domColor + "18", backgroundColor: domColor + "05" }}>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed">
                &quot;{roadmap.motivationalMessage}&quot;
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

        {/* SAC Club Suggestions — right after career paths */}
        {roadmap.clubRecommendations?.length > 0 && (
          <section>
            <SectionHeader icon={FiUsers} title="SAC Clubs Recommended for You" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roadmap.clubRecommendations.map((c: any) => {
                const cc = DOMAIN_COLORS[c.domain] || "#6b7280";
                return (
                  <div key={c.clubName} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md text-white flex-shrink-0" style={{ backgroundColor: cc }}>{c.domain}</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.clubName}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{c.reason}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Personality Profile ─────────────────────────────────────────── */}
        {roadmap.personalityProfile && (
          <section>
            <SectionHeader icon={FiUser} title="Personality Profile" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {([
                { key: "type",                 label: "Personality Type",        icon: FiUser },
                { key: "leadershipPotential",  label: "Leadership Potential",    icon: FiTarget },
                { key: "communicationStyle",   label: "Communication Style",     icon: FiUsers },
                { key: "decisionMakingStyle",  label: "Decision-Making Style",   icon: FiLayers },
                { key: "stressManagementPattern", label: "Stress Management",    icon: FiHeart },
                { key: "motivationType",       label: "Motivation Type",         icon: FiZap },
              ] as { key: string; label: string; icon: React.ComponentType<any> }[]).map(({ key, label, icon: Icon }) => {
                const val = roadmap.personalityProfile[key];
                if (!val) return null;
                return (
                  <div key={key} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
                        <Icon size={12} style={{ color: BRAND }} />
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{val}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Gardner + Bloom side by side ────────────────────────────────── */}
        {(roadmap.gardnerIntelligence || roadmap.bloomsLevel) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Gardner's Multiple Intelligence */}
            {roadmap.gardnerIntelligence && (
              <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(151,0,3,0.09)" }}>
                    <FiGrid size={14} style={{ color: BRAND }} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Gardner's Multiple Intelligence</h2>
                    {roadmap.gardnerIntelligence.primary && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Primary: <span className="font-semibold" style={{ color: BRAND }}>{roadmap.gardnerIntelligence.primary}</span>
                        {roadmap.gardnerIntelligence.secondary && <> · Secondary: <span className="font-semibold text-blue-600 dark:text-blue-400">{roadmap.gardnerIntelligence.secondary}</span></>}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2.5">
                  {Object.entries(roadmap.gardnerIntelligence.scores || {}).map(([intel, score]) => {
                    const pct = Math.min(100, Math.max(0, Number(score)));
                    const isPrimary = intel === roadmap.gardnerIntelligence.primary;
                    const isSecondary = intel === roadmap.gardnerIntelligence.secondary;
                    return (
                      <div key={intel}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className={`font-semibold ${isPrimary ? "text-red-700 dark:text-red-400" : isSecondary ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>
                            {intel} {isPrimary ? "★" : isSecondary ? "◆" : ""}
                          </span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">{pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{
                            width: `${pct}%`,
                            backgroundColor: isPrimary ? BRAND : isSecondary ? "#2563eb" : "#9ca3af",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bloom's Taxonomy Level */}
            {roadmap.bloomsLevel && (
              <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(151,0,3,0.09)" }}>
                    <FiLayers size={14} style={{ color: BRAND }} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Bloom's Taxonomy Level</h2>
                    {roadmap.bloomsLevel.dominantLevel && (
                      <p className="text-[11px] mt-0.5">
                        Dominant: <span className="font-bold" style={{ color: BRAND }}>{roadmap.bloomsLevel.dominantLevel}</span>
                      </p>
                    )}
                  </div>
                </div>
                {roadmap.bloomsLevel.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-l-2 pl-3" style={{ borderColor: BRAND + "60" }}>
                    {roadmap.bloomsLevel.description}
                  </p>
                )}
                <div className="space-y-2.5">
                  {(["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as const).map((level, i) => {
                    const score = roadmap.bloomsLevel.scores?.[level] ?? 0;
                    const isDominant = level === roadmap.bloomsLevel.dominantLevel;
                    const BLOOM_COLORS = ["#6b7280", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", BRAND];
                    return (
                      <div key={level}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className={`font-semibold ${isDominant ? "font-bold" : "text-gray-500 dark:text-gray-400"}`}
                            style={isDominant ? { color: BLOOM_COLORS[i] } : {}}>
                            {level} {isDominant ? "★" : ""}
                          </span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">{score}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{
                            width: `${score}%`,
                            backgroundColor: BLOOM_COLORS[i],
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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

        {/* Project & Portfolio Ideas — 3-category tabs */}
        {roadmap.projectIdeas && (
          <section>
            <SectionHeader icon={FiCode} title="Project & Portfolio Ideas" />
            {/* Tab buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {([
                { key: "software", label: "Software", icon: FiCode },
                { key: "hardware", label: "Hardware", icon: FiCpu },
                { key: "management", label: "Management", icon: FiBarChart2 },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveProjectTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold border transition-all ${
                    activeProjectTab === key
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white dark:bg-zinc-950 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-zinc-700 hover:border-gray-300"
                  }`}
                  style={activeProjectTab === key ? { backgroundColor: BRAND } : {}}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
            {/* Idea cards for active tab */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(roadmap.projectIdeas[activeProjectTab] || []).map((p: any) => (
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

        {/* Entrepreneur Pathways */}
        {roadmap.entrepreneurPaths?.length > 0 && (
          <section>
            <SectionHeader icon={FiTrendingUp} title="If You Want to Become an Entrepreneur" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.entrepreneurPaths.map((ep: any) => (
                <div key={ep.area} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "rgba(151,0,3,0.08)" }}>
                      <FiZap size={13} style={{ color: BRAND }} />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{ep.area}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{ep.description}</p>
                  {ep.ideas?.length > 0 && (
                    <ul className="space-y-1.5 pt-1">
                      {ep.ideas.map((idea: string) => (
                        <li key={idea} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 leading-snug">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: BRAND }} />
                          {idea}
                        </li>
                      ))}
                    </ul>
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

        {/* Top MNCs that recruit you */}
        {(roadmap.topMNCs?.length > 0) && (
          <section>
            <SectionHeader icon={FiBriefcase} title="Top MNCs That Recruit You" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roadmap.topMNCs.map((m: any) => (
                <div key={m.company} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-4 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                      <FiBriefcase size={13} className="text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{m.company}</p>
                      <p className="text-[11px] text-gray-400 truncate">{m.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-0.5">
                    <div className="flex-1 rounded-lg bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 px-2.5 py-1.5 space-y-0.5">
                      <p className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">India (INR)</p>
                      <p className="text-[12px] font-semibold text-green-700 dark:text-green-300">{m.avgPackageINR}</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 px-2.5 py-1.5 space-y-0.5">
                      <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Abroad (USD)</p>
                      <p className="text-[12px] font-semibold text-blue-700 dark:text-blue-300">{m.avgPackageUSD}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills + Social Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        {/* ── Personal Development Plan ───────────────────────────────────── */}
        {roadmap.personalDevelopmentPlan && (
          <section>
            <SectionHeader icon={FiAward} title="Personal Development Plan" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {([
                { key: "communication",       label: "Communication",        icon: FiUsers,      color: "#2563eb" },
                { key: "leadership",          label: "Leadership",           icon: FiTarget,     color: BRAND },
                { key: "networking",          label: "Networking",           icon: FiGlobe,      color: "#7c3aed" },
                { key: "wellbeing",           label: "Well-being",           icon: FiHeart,      color: "#16a34a" },
                { key: "timeManagement",      label: "Time Management",      icon: FiList,       color: "#ea580c" },
                { key: "emotionalResilience", label: "Emotional Resilience", icon: FiShield,     color: "#0891b2" },
              ] as { key: string; label: string; icon: React.ComponentType<any>; color: string }[]).map(({ key, label, icon: Icon, color }) => {
                const val = roadmap.personalDevelopmentPlan[key];
                if (!val) return null;
                return (
                  <div key={key} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-4 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "18" }}>
                        <Icon size={13} style={{ color }} />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color }}>{label}</p>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{val}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

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
