// ─────────────────────────────────────────────────────────────────────────────
// SAMAM Student Development Module — Mock Data
// Competencies · SDC · Badges · Passport · Career
// ─────────────────────────────────────────────────────────────────────────────

// ── COMPETENCY DATA ────────────────────────────────────────────────────────────
export const COMPETENCY_CATEGORIES = [
  {
    id: "technical",
    name: "Technical",
    icon: "⚙️",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    description: "Domain knowledge, coding, engineering, data and digital skills.",
    competencies: [
      { id: "prog",    name: "Programming",         score: 82, trend: +8,  evidence: 3, level: "Practitioner" },
      { id: "data",    name: "Data Analysis",       score: 71, trend: +12, evidence: 2, level: "Foundation"   },
      { id: "web",     name: "Web Development",     score: 78, trend: +5,  evidence: 4, level: "Practitioner" },
      { id: "ml",      name: "Machine Learning",    score: 55, trend: +18, evidence: 1, level: "Foundation"   },
      { id: "cloud",   name: "Cloud Computing",     score: 47, trend: +22, evidence: 1, level: "Explorer"     },
      { id: "security",name: "Cybersecurity",       score: 40, trend: +10, evidence: 1, level: "Explorer"     },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    icon: "💼",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    description: "Communication, teamwork, time management, and workplace readiness.",
    competencies: [
      { id: "comm",    name: "Communication",       score: 85, trend: +3,  evidence: 5, level: "Leader"       },
      { id: "team",    name: "Teamwork",            score: 88, trend: +2,  evidence: 6, level: "Leader"       },
      { id: "time",    name: "Time Management",     score: 70, trend: +8,  evidence: 2, level: "Practitioner" },
      { id: "adapt",   name: "Adaptability",        score: 75, trend: +5,  evidence: 3, level: "Practitioner" },
      { id: "ethics",  name: "Professional Ethics", score: 90, trend: +1,  evidence: 4, level: "Leader"       },
    ],
  },
  {
    id: "leadership",
    name: "Leadership",
    icon: "🏅",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    description: "Leading teams, driving initiatives, mentoring and decision-making.",
    competencies: [
      { id: "vision",  name: "Visioning",           score: 62, trend: +15, evidence: 2, level: "Foundation"   },
      { id: "decision",name: "Decision Making",     score: 68, trend: +10, evidence: 3, level: "Practitioner" },
      { id: "mentor",  name: "Mentoring Others",    score: 55, trend: +20, evidence: 1, level: "Foundation"   },
      { id: "conflict",name: "Conflict Resolution", score: 60, trend: +8,  evidence: 2, level: "Foundation"   },
      { id: "inspire", name: "Inspiring Teams",     score: 70, trend: +12, evidence: 2, level: "Practitioner" },
    ],
  },
  {
    id: "research",
    name: "Research",
    icon: "🔬",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    description: "Research methodology, academic writing, analysis and inquiry.",
    competencies: [
      { id: "method",  name: "Research Methods",    score: 65, trend: +18, evidence: 2, level: "Practitioner" },
      { id: "writing", name: "Academic Writing",    score: 72, trend: +5,  evidence: 3, level: "Practitioner" },
      { id: "analysis",name: "Critical Analysis",   score: 70, trend: +8,  evidence: 2, level: "Practitioner" },
      { id: "publish", name: "Publication",         score: 35, trend: +25, evidence: 1, level: "Explorer"     },
      { id: "stats",   name: "Statistical Skills",  score: 60, trend: +15, evidence: 1, level: "Foundation"   },
    ],
  },
  {
    id: "innovation",
    name: "Innovation",
    icon: "💡",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    description: "Design thinking, entrepreneurial mindset, creativity and problem-solving.",
    competencies: [
      { id: "design",  name: "Design Thinking",     score: 75, trend: +12, evidence: 3, level: "Practitioner" },
      { id: "creative",name: "Creative Problem Solving",score: 80, trend: +6, evidence: 3, level: "Practitioner" },
      { id: "product", name: "Product Development", score: 58, trend: +20, evidence: 1, level: "Foundation"   },
      { id: "patent",  name: "IP & Patents",        score: 25, trend: +30, evidence: 0, level: "Explorer"     },
      { id: "venture", name: "Venture Building",    score: 45, trend: +22, evidence: 1, level: "Explorer"     },
    ],
  },
  {
    id: "personal",
    name: "Personal",
    icon: "🌱",
    color: "#0891B2",
    bg: "#ECFEFF",
    border: "#A5F3FC",
    description: "Self-awareness, emotional intelligence, wellness and personal growth.",
    competencies: [
      { id: "eq",      name: "Emotional Intelligence", score: 78, trend: +8, evidence: 3, level: "Practitioner" },
      { id: "mindful", name: "Mindfulness",          score: 65, trend: +15, evidence: 2, level: "Foundation"   },
      { id: "resilience",name:"Resilience",          score: 80, trend: +5,  evidence: 3, level: "Practitioner" },
      { id: "selfaware",name:"Self Awareness",       score: 82, trend: +3,  evidence: 4, level: "Leader"       },
      { id: "growth",  name: "Growth Mindset",       score: 85, trend: +2,  evidence: 4, level: "Leader"       },
    ],
  },
];

// Growth data: 12 months of scores per category (for timeline/growth chart)
export const COMPETENCY_GROWTH = [
  { month: "Aug", technical: 40, professional: 60, leadership: 30, research: 35, innovation: 45, personal: 55 },
  { month: "Sep", technical: 45, professional: 65, leadership: 35, research: 40, innovation: 48, personal: 58 },
  { month: "Oct", technical: 52, professional: 68, leadership: 40, research: 45, innovation: 52, personal: 62 },
  { month: "Nov", technical: 58, professional: 72, leadership: 44, research: 50, innovation: 56, personal: 65 },
  { month: "Dec", technical: 60, professional: 74, leadership: 46, research: 54, innovation: 58, personal: 67 },
  { month: "Jan", technical: 63, professional: 76, leadership: 50, research: 56, innovation: 60, personal: 68 },
  { month: "Feb", technical: 65, professional: 78, leadership: 53, research: 58, innovation: 63, personal: 70 },
  { month: "Mar", technical: 68, professional: 80, leadership: 56, research: 61, innovation: 65, personal: 72 },
  { month: "Apr", technical: 70, professional: 82, leadership: 58, research: 63, innovation: 68, personal: 74 },
  { month: "May", technical: 72, professional: 84, leadership: 60, research: 65, innovation: 70, personal: 76 },
  { month: "Jun", technical: 74, professional: 85, leadership: 62, research: 67, innovation: 72, personal: 78 },
  { month: "Jul", technical: 76, professional: 86, leadership: 63, research: 68, innovation: 74, personal: 79 },
];

// Heatmap: weeks × activity types (50 weeks, 5 domains)
export const HEATMAP_DATA = Array.from({ length: 52 }, (_, week) =>
  Array.from({ length: 5 }, (_, day) => {
    const seed = (week * 7 + day * 13) % 100;
    return seed < 30 ? 0 : seed < 50 ? 1 : seed < 70 ? 2 : seed < 85 ? 3 : 4;
  })
);

export const COMPETENCY_EVIDENCE = {
  prog: [
    { title: "Web Dev Bootcamp Certificate", type: "certificate", date: "2025-06-20" },
    { title: "Open Source Contribution — 12 PRs merged", type: "github", date: "2025-05-15" },
    { title: "National Hackathon 2nd Place", type: "achievement", date: "2025-04-10" },
  ],
  data: [
    { title: "Data Science Project Report", type: "project", date: "2025-06-01" },
    { title: "Python for Data Science Course (Coursera)", type: "course", date: "2025-03-20" },
  ],
  ml: [
    { title: "ML Fundamentals Workshop Completion", type: "certificate", date: "2025-07-01" },
  ],
  comm: [
    { title: "Public Speaking Winner — Intl. Debate", type: "achievement", date: "2025-05-05" },
    { title: "Mentored 10 junior students", type: "activity", date: "2025-04-01" },
    { title: "Published op-ed in college newsletter", type: "publication", date: "2025-02-15" },
    { title: "Led team presentation at Industry Day", type: "activity", date: "2025-01-20" },
    { title: "Communication Workshop Facilitator", type: "activity", date: "2024-12-10" },
  ],
};

// ── SDC DATA ───────────────────────────────────────────────────────────────────
export const SDC_DATA = {
  total: 247,
  target: 350,
  semesterTarget: 80,
  semesterCurrent: 42,
  yearlyData: [
    { year: "2022-23", sem1: 55, sem2: 48, total: 103 },
    { year: "2023-24", sem1: 62, sem2: 70, total: 132 },
    { year: "2024-25", sem1: 42, sem2: null, total: 42 },
  ],
  byDomain: [
    { domain: "Technical",                   credits: 80, color: "#2563EB", pct: 32 },
    { domain: "Extension & Social Outreach", credits: 55, color: "#059669", pct: 22 },
    { domain: "Innovation",                  credits: 48, color: "#D97706", pct: 19 },
    { domain: "Literary & Cultural",         credits: 38, color: "#7C3AED", pct: 15 },
    { domain: "Health & Well-being",         credits: 26, color: "#DC2626", pct: 11 },
  ],
  history: [
    { date: "Jul 5, 2025",  activity: "National Hackathon 2025",        credits: 15, domain: "TEC", type: "Competition"   },
    { date: "Jun 28, 2025", activity: "Leadership Masterclass",          credits: 8,  domain: "IIE", type: "Workshop"      },
    { date: "Jun 15, 2025", activity: "Rural Development Camp",          credits: 20, domain: "ESO", type: "Social"        },
    { date: "Jun 1, 2025",  activity: "Python Workshop",                 credits: 8,  domain: "TEC", type: "Workshop"      },
    { date: "May 20, 2025", activity: "Open Source Sprint",              credits: 10, domain: "TEC", type: "Club Activity" },
    { date: "May 10, 2025", activity: "Photography Exhibition",          credits: 6,  domain: "LCH", type: "Arts"          },
    { date: "Apr 25, 2025", activity: "Blood Donation Drive",            credits: 5,  domain: "ESO", type: "Volunteer"     },
    { date: "Apr 10, 2025", activity: "Startup Ideation Workshop",       credits: 8,  domain: "IIE", type: "Workshop"      },
    { date: "Mar 30, 2025", activity: "Yoga & Mindfulness Certification",credits: 8,  domain: "HWB", type: "Wellness"      },
    { date: "Mar 15, 2025", activity: "Debate Competition Winner",       credits: 10, domain: "LCH", type: "Competition"   },
  ],
  monthlyTrend: [
    { month: "Aug", credits: 18 }, { month: "Sep", credits: 22 },
    { month: "Oct", credits: 15 }, { month: "Nov", credits: 28 },
    { month: "Dec", credits: 10 }, { month: "Jan", credits: 20 },
    { month: "Feb", credits: 25 }, { month: "Mar", credits: 18 },
    { month: "Apr", credits: 23 }, { month: "May", credits: 16 },
    { month: "Jun", credits: 33 }, { month: "Jul", credits: 23 },
  ],
};

// ── BADGE DATA ─────────────────────────────────────────────────────────────────
export const BADGES = [
  {
    id: 1, code: "TEC-003", name: "Web Builder",          icon: "🌐", domain: "TEC",
    rarity: "Rare",      color: "#2563EB", bg: "#EFF6FF",
    issuedOn: "Jun 20, 2025", earnedFrom: "Web Development Bootcamp",
    competencies: ["Programming", "Digital Literacy"],
    description: "Awarded for successfully completing the Web Development Bootcamp and deploying a full-stack application.",
    verificationId: "KLU-SAMAM-2025-0042",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0042",
  },
  {
    id: 2, code: "TEC-008", name: "Open Source Hero",     icon: "🦸", domain: "TEC",
    rarity: "Epic",      color: "#7C3AED", bg: "#F5F3FF",
    issuedOn: "May 15, 2025", earnedFrom: "Open Source Contribution Sprint",
    competencies: ["Programming", "Teamwork"],
    description: "Contributed 12+ pull requests to open-source repositories and had code merged into production.",
    verificationId: "KLU-SAMAM-2025-0038",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0038",
  },
  {
    id: 3, code: "IIE-015", name: "Hackathon Champion",   icon: "🏆", domain: "IIE",
    rarity: "Legendary", color: "#D97706", bg: "#FFFBEB",
    issuedOn: "Apr 12, 2025", earnedFrom: "Innovation Bootcamp (48-Hour Hackathon)",
    competencies: ["Problem Solving", "Creativity & Innovation", "Teamwork"],
    description: "Placed 2nd in the 48-Hour National Hackathon with 200+ participants. Demonstrated exceptional innovation under pressure.",
    verificationId: "KLU-SAMAM-2025-0031",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0031",
  },
  {
    id: 4, code: "LCH-002", name: "Orator",               icon: "🎙️", domain: "LCH",
    rarity: "Rare",      color: "#7C3AED", bg: "#F5F3FF",
    issuedOn: "May 5, 2025",  earnedFrom: "Public Speaking & Debate",
    competencies: ["Communication", "Leadership"],
    description: "Won 1st place in the Inter-College Debate Competition. Demonstrated structured argumentation and confident oratory.",
    verificationId: "KLU-SAMAM-2025-0036",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0036",
  },
  {
    id: 5, code: "HWB-001", name: "Mindful Achiever",     icon: "🧘", domain: "HWB",
    rarity: "Common",    color: "#059669", bg: "#ECFDF5",
    issuedOn: "Mar 30, 2025", earnedFrom: "Yoga & Mindfulness Certification",
    competencies: ["Emotional Intelligence", "Resilience"],
    description: "Completed 20 yoga and mindfulness sessions and received instructor certification.",
    verificationId: "KLU-SAMAM-2025-0028",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0028",
  },
  {
    id: 6, code: "ESO-005", name: "Young Mentor",         icon: "🤝", domain: "ESO",
    rarity: "Common",    color: "#059669", bg: "#ECFDF5",
    issuedOn: "Jun 28, 2025", earnedFrom: "School Mentorship Programme",
    competencies: ["Communication", "Leadership", "Emotional Intelligence"],
    description: "Mentored 10 government school students for one semester, demonstrating consistent commitment.",
    verificationId: "KLU-SAMAM-2025-0041",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0041",
  },
  {
    id: 7, code: "TEC-004", name: "ML Pioneer",           icon: "🤖", domain: "TEC",
    rarity: "Rare",      color: "#2563EB", bg: "#EFF6FF",
    issuedOn: "Jul 1, 2025",  earnedFrom: "Machine Learning Fundamentals",
    competencies: ["Machine Learning", "Data Analysis", "Research Skills"],
    description: "Trained and evaluated a classification model achieving 91% accuracy on a real-world dataset.",
    verificationId: "KLU-SAMAM-2025-0045",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0045",
  },
  {
    id: 8, code: "IIE-001", name: "Idea Sparker",         icon: "💡", domain: "IIE",
    rarity: "Common",    color: "#D97706", bg: "#FFFBEB",
    issuedOn: "Apr 8, 2025",  earnedFrom: "Startup Ideation Workshop",
    competencies: ["Creativity & Innovation", "Problem Solving"],
    description: "Generated and validated 5 startup ideas using design thinking methodology.",
    verificationId: "KLU-SAMAM-2025-0030",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0030",
  },
  {
    id: 9, code: "ESO-004", name: "Eco Warrior",          icon: "🌿", domain: "ESO",
    rarity: "Common",    color: "#059669", bg: "#ECFDF5",
    issuedOn: "Mar 10, 2025", earnedFrom: "Environmental Clean-up Campaign",
    competencies: ["Ethics & Values", "Global Awareness"],
    description: "Organised 2 environmental clean-up drives, collected 100kg waste.",
    verificationId: "KLU-SAMAM-2025-0022",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0022",
  },
  {
    id: 10, code: "LCH-005", name: "Visual Narrator",     icon: "📸", domain: "LCH",
    rarity: "Common",    color: "#7C3AED", bg: "#F5F3FF",
    issuedOn: "May 10, 2025", earnedFrom: "Photography & Visual Storytelling",
    competencies: ["Creativity & Innovation", "Communication"],
    description: "Mounted a solo photography exhibition themed around campus sustainability.",
    verificationId: "KLU-SAMAM-2025-0037",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0037",
  },
  {
    id: 11, code: "TEC-013", name: "Code Warrior",        icon: "⚔️", domain: "TEC",
    rarity: "Rare",      color: "#2563EB", bg: "#EFF6FF",
    issuedOn: "Jun 10, 2025", earnedFrom: "Competitive Programming Challenge",
    competencies: ["Programming", "Problem Solving"],
    description: "Solved 50+ LeetCode problems and ranked top 200 in an online coding contest.",
    verificationId: "KLU-SAMAM-2025-0040",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0040",
  },
  {
    id: 12, code: "HWB-002", name: "Mental Health Ally",  icon: "💙", domain: "HWB",
    rarity: "Common",    color: "#059669", bg: "#ECFDF5",
    issuedOn: "Feb 14, 2025", earnedFrom: "Mental Health First Aid",
    competencies: ["Emotional Intelligence", "Ethics & Values"],
    description: "Certified in Mental Health First Aid. Ran 1 awareness session for 40 students.",
    verificationId: "KLU-SAMAM-2025-0018",
    shareUrl: "https://samam.klu.ac.in/badges/verify/KLU-SAMAM-2025-0018",
  },
];

// Locked badges (not yet earned)
export const LOCKED_BADGES = [
  { id: 101, name: "AI Pioneer",    icon: "🚀", rarity: "Epic",      requirement: "Complete ML Fundamentals + AI for Social Impact" },
  { id: 102, name: "Patent Holder", icon: "📜", rarity: "Legendary", requirement: "File a provisional patent with IP India" },
  { id: 103, name: "Published",     icon: "📖", rarity: "Epic",      requirement: "Publish a research paper in a peer-reviewed journal" },
  { id: 104, name: "Marathon Hero", icon: "🏃", rarity: "Rare",      requirement: "Complete a half-marathon (21km)" },
  { id: 105, name: "Village Champion",icon:"🏘️",rarity: "Epic",      requirement: "Complete Village Adoption Programme" },
];

// ── PASSPORT DATA ──────────────────────────────────────────────────────────────
export const PASSPORT = {
  about: "I am a 3rd-year Computer Science Engineering student at KL University with a passion for full-stack development, machine learning, and social entrepreneurship. I believe technology should solve real problems for real people.",
  tagline: "Builder · Thinker · Change Agent",
  links: {
    github: "https://github.com/arjun-sharma",
    linkedin: "https://linkedin.com/in/arjun-sharma",
    portfolio: "https://arjunsharma.dev",
    resume: "#",
  },
  academic: {
    institution: "KL University",
    degree: "B.Tech Computer Science & Engineering",
    cgpa: 8.7,
    year: "3rd Year (2022–2026)",
    campus: "KL University - Main Campus",
    rollNo: "2100030001",
  },
  projects: [
    { id: 1, name: "SAMAM Student Platform", description: "Full-stack student development platform built with Next.js 16, MySQL, Redis and BullMQ.", tech: ["Next.js","MySQL","Redis","Tailwind CSS"], github: "#", demo: "#", year: "2025", status: "Ongoing" },
    { id: 2, name: "HealthSense AI",         description: "ML model for early detection of health anomalies from wearable sensor data.", tech: ["Python","TensorFlow","FastAPI","React"], github: "#", demo: "#", year: "2025", status: "Completed" },
    { id: 3, name: "AgriConnect",            description: "Mobile app connecting farmers to consumers. 500+ farmers onboarded in pilot.", tech: ["Flutter","Firebase","Node.js"], github: "#", demo: "#", year: "2024", status: "Completed" },
    { id: 4, name: "Open Source CLI Tool",   description: "Dev productivity CLI with 400+ GitHub stars and 1200+ downloads.", tech: ["Node.js","Commander.js","Chalk"], github: "#", demo: null, year: "2024", status: "Completed" },
  ],
  internships: [
    { id: 1, company: "TechNova Solutions",   role: "Full Stack Intern",       duration: "May – Jul 2025", location: "Hyderabad", description: "Built internal admin dashboards. Optimised 3 API endpoints by 40%.", skills: ["React","Node.js","MySQL"] },
    { id: 2, company: "GreenStar NGO",        role: "Tech Volunteer",          duration: "Jan – Mar 2025", location: "Remote",     description: "Built donation management system used by 3 NGOs.", skills: ["Next.js","Airtable","Stripe"] },
  ],
  research: [
    { id: 1, title: "Federated Learning for Healthcare Data Privacy", journal: "Under Review — IEEE Access",       year: "2025", coAuthors: ["Dr. Ramesh Kumar"], status: "Under Review" },
    { id: 2, title: "Blockchain-based Academic Credential Verification", journal: "Presented — NIT Warangal Symposium", year: "2024", coAuthors: ["Prof. Venkat Rao"], status: "Published" },
  ],
  leadership: [
    { id: 1, role: "Technical Secretary",  org: "ZeroOne CodeClub",   year: "2024–Present", impact: "Led 8 technical workshops, 500+ participants" },
    { id: 2, role: "House Captain",        org: "KLU Sports Council",  year: "2023–2024",    impact: "Captained winning team in inter-house sports" },
    { id: 3, role: "Student Coordinator",  org: "SAMAM Platform",      year: "2025",         impact: "Coordinated SDC tracking for 1200 students" },
  ],
  community: [
    { id: 1, activity: "Blood Donation Drive Organiser",    hours: 12, impact: "60 donors, 180 lives impacted" },
    { id: 2, activity: "School Mentorship (10 students)",   hours: 40, impact: "All 10 students improved grades" },
    { id: 3, activity: "Environmental Clean-up × 2",        hours: 8,  impact: "100kg waste removed" },
    { id: 4, activity: "Rural Digital Literacy Training",   hours: 20, impact: "Trained 30 senior citizens" },
  ],
  achievements: [
    { id: 1, title: "National Hackathon Runner-Up",     org: "Smart India Hackathon",     year: "2025", icon: "🏆" },
    { id: 2, title: "Best Technical Paper",             org: "NIT Warangal",              year: "2024", icon: "📜" },
    { id: 3, title: "Inter-College Debate Winner",      org: "KLU Cultural Fest",         year: "2025", icon: "🎙️" },
    { id: 4, title: "KLEF Merit Scholarship",           org: "KL University",             year: "2023–Present", icon: "⭐" },
    { id: 5, title: "Open Source 400 Stars",            org: "GitHub",                    year: "2024", icon: "🌟" },
  ],
  timeline: [
    { year: "2022", events: ["Joined KL University","Joined ZeroOne CodeClub","First blood donation"] },
    { year: "2023", events: ["CGPA 9.0 Sem 1","Won inter-house sports","First open source contribution","Merit Scholarship awarded"] },
    { year: "2024", events: ["Published research paper","Built AgriConnect app","Best Technical Paper Award","Hackathon Top 10"] },
    { year: "2025", events: ["Hackathon Runner-Up","TechNova internship","Web Dev Bootcamp certificate","Launched SAMAM platform"] },
  ],
};

// ── CAREER DATA ────────────────────────────────────────────────────────────────
export const CAREER_PATHS = {
  "Software Engineer": {
    icon: "💻", color: "#2563EB", bg: "#EFF6FF",
    description: "Build, test and ship production software at top tech companies.",
    readinessScore: 68,
    keyCompetencies: [
      { name: "Data Structures & Algorithms", required: 90, current: 71, gap: 19 },
      { name: "System Design",                required: 80, current: 45, gap: 35 },
      { name: "Full-Stack Development",       required: 80, current: 78, gap: 2  },
      { name: "Version Control (Git)",        required: 90, current: 82, gap: 8  },
      { name: "Communication",               required: 70, current: 85, gap: 0  },
      { name: "Problem Solving",             required: 90, current: 80, gap: 10 },
    ],
    missingCompetencies: ["System Design", "Competitive Programming (Advanced)", "OS & Networks"],
    recommendedCertifications: [
      { name: "AWS Certified Developer", provider: "AWS", priority: "High", timeMonths: 2 },
      { name: "Meta Full-Stack Certificate", provider: "Coursera", priority: "High", timeMonths: 3 },
      { name: "LeetCode 200+ Problems",  provider: "Self-paced", priority: "Critical", timeMonths: 4 },
    ],
    roadmap: [
      { milestone: "Complete 150+ DSA problems",       dueMonths: 2, status: "active"  },
      { milestone: "Build 2 system design projects",   dueMonths: 3, status: "upcoming"},
      { milestone: "AWS Developer Certification",      dueMonths: 4, status: "upcoming"},
      { milestone: "Apply to internships & PPOs",      dueMonths: 5, status: "upcoming"},
      { milestone: "Mock interviews × 10",             dueMonths: 6, status: "upcoming"},
    ],
    activities: ["TEC-002","TEC-006","TEC-011","TEC-013","TEC-016"],
  },
  "AI Engineer": {
    icon: "🤖", color: "#7C3AED", bg: "#F5F3FF",
    description: "Design and deploy AI/ML systems at the forefront of technology.",
    readinessScore: 52,
    keyCompetencies: [
      { name: "Machine Learning",         required: 90, current: 55, gap: 35 },
      { name: "Deep Learning",            required: 80, current: 30, gap: 50 },
      { name: "Python Programming",       required: 90, current: 82, gap: 8  },
      { name: "Data Analysis",            required: 80, current: 71, gap: 9  },
      { name: "Research Skills",          required: 75, current: 65, gap: 10 },
      { name: "Mathematical Foundations", required: 85, current: 60, gap: 25 },
    ],
    missingCompetencies: ["Deep Learning","Natural Language Processing","MLOps","Linear Algebra (Advanced)"],
    recommendedCertifications: [
      { name: "DeepLearning.AI Specialisation", provider: "Coursera",   priority: "Critical", timeMonths: 4 },
      { name: "TensorFlow Developer Certificate",provider: "Google",    priority: "High",     timeMonths: 3 },
      { name: "Kaggle Competitions × 3",         provider: "Kaggle",    priority: "High",     timeMonths: 6 },
    ],
    roadmap: [
      { milestone: "Complete Deep Learning course",     dueMonths: 3, status: "active"  },
      { milestone: "Publish ML paper (arXiv)",          dueMonths: 5, status: "upcoming"},
      { milestone: "Win a Kaggle competition",          dueMonths: 6, status: "upcoming"},
      { milestone: "Build production ML pipeline",      dueMonths: 7, status: "upcoming"},
    ],
    activities: ["TEC-004","TEC-012","TEC-016","TEC-017","TEC-020"],
  },
  "Researcher": {
    icon: "🔬", color: "#059669", bg: "#ECFDF5",
    description: "Contribute to cutting-edge knowledge through rigorous academic research.",
    readinessScore: 58,
    keyCompetencies: [
      { name: "Research Methodology",  required: 90, current: 65, gap: 25 },
      { name: "Academic Writing",      required: 85, current: 72, gap: 13 },
      { name: "Statistical Analysis",  required: 85, current: 60, gap: 25 },
      { name: "Literature Review",     required: 90, current: 55, gap: 35 },
      { name: "Publication Record",    required: 80, current: 35, gap: 45 },
      { name: "Critical Analysis",     required: 85, current: 70, gap: 15 },
    ],
    missingCompetencies: ["Publication Record","Advanced Statistics","Grant Writing","Conference Presentations"],
    recommendedCertifications: [
      { name: "Research Methods (Coursera)",   provider: "Coursera",    priority: "High", timeMonths: 2 },
      { name: "Academic English (IELTS 7+)",   provider: "British Council",priority:"High", timeMonths: 3 },
      { name: "GRE Preparation",               provider: "Self-paced",  priority: "High", timeMonths: 4 },
    ],
    roadmap: [
      { milestone: "Submit 1st-authored paper", dueMonths: 3, status: "active"  },
      { milestone: "Conference presentation",   dueMonths: 5, status: "upcoming"},
      { milestone: "Apply for PhD programmes",  dueMonths: 8, status: "upcoming"},
    ],
    activities: ["TEC-012","TEC-016","TEC-017","LCH-011"],
  },
  "Entrepreneur": {
    icon: "🚀", color: "#D97706", bg: "#FFFBEB",
    description: "Build ventures that create impact at scale.",
    readinessScore: 61,
    keyCompetencies: [
      { name: "Product Development",   required: 85, current: 58, gap: 27 },
      { name: "Market Research",       required: 80, current: 65, gap: 15 },
      { name: "Financial Literacy",    required: 75, current: 40, gap: 35 },
      { name: "Leadership",            required: 85, current: 63, gap: 22 },
      { name: "Communication",         required: 90, current: 85, gap: 5  },
      { name: "Venture Building",      required: 80, current: 45, gap: 35 },
    ],
    missingCompetencies: ["Financial Modelling","Fundraising","Legal Compliance","Go-to-Market Strategy"],
    recommendedCertifications: [
      { name: "Y Combinator Startup School", provider: "YC Online", priority: "Critical", timeMonths: 1 },
      { name: "Finance for Non-Finance",     provider: "Coursera",   priority: "High",     timeMonths: 2 },
      { name: "Google Analytics Certificate",provider: "Google",     priority: "Medium",   timeMonths: 1 },
    ],
    roadmap: [
      { milestone: "Validate product with 50 users", dueMonths: 2, status: "active"  },
      { milestone: "Apply to incubator/accelerator",  dueMonths: 3, status: "upcoming"},
      { milestone: "Raise pre-seed funding",          dueMonths: 6, status: "upcoming"},
    ],
    activities: ["IIE-001","IIE-002","IIE-005","IIE-015","IIE-019"],
  },
  "IAS Officer": {
    icon: "🏛️", color: "#DC2626", bg: "#FEF2F2",
    description: "Serve the nation through administrative leadership in the civil services.",
    readinessScore: 44,
    keyCompetencies: [
      { name: "Current Affairs & GK",  required: 90, current: 50, gap: 40 },
      { name: "Essay Writing",         required: 85, current: 72, gap: 13 },
      { name: "Leadership",            required: 85, current: 63, gap: 22 },
      { name: "Ethics & Values",       required: 90, current: 90, gap: 0  },
      { name: "Communication",         required: 90, current: 85, gap: 5  },
      { name: "Policy Understanding",  required: 80, current: 35, gap: 45 },
    ],
    missingCompetencies: ["UPSC Optionals","Current Affairs Depth","Interview Preparation","Administrative Law"],
    recommendedCertifications: [
      { name: "UPSC CSE Preparation",         provider: "Self-paced",  priority: "Critical", timeMonths: 24 },
      { name: "Public Policy (Harvard)",       provider: "edX",         priority: "High",     timeMonths: 3  },
      { name: "Hindi Proficiency (Advanced)",  provider: "IGNOU",       priority: "Medium",   timeMonths: 6  },
    ],
    roadmap: [
      { milestone: "Complete Polity & History",   dueMonths: 3,  status: "active"  },
      { milestone: "Prelims preparation",         dueMonths: 12, status: "upcoming"},
      { milestone: "Mains preparation",           dueMonths: 18, status: "upcoming"},
      { milestone: "Interview preparation",       dueMonths: 22, status: "upcoming"},
    ],
    activities: ["ESO-001","ESO-012","ESO-016","LCH-017"],
  },
  "Teacher / Educator": {
    icon: "📚", color: "#0891B2", bg: "#ECFEFF",
    description: "Inspire the next generation through transformative teaching.",
    readinessScore: 70,
    keyCompetencies: [
      { name: "Communication",         required: 95, current: 85, gap: 10 },
      { name: "Subject Expertise",     required: 85, current: 76, gap: 9  },
      { name: "Curriculum Design",     required: 80, current: 40, gap: 40 },
      { name: "Emotional Intelligence",required: 85, current: 78, gap: 7  },
      { name: "Research Skills",       required: 70, current: 65, gap: 5  },
      { name: "Mentoring",             required: 90, current: 55, gap: 35 },
    ],
    missingCompetencies: ["Curriculum Design","Pedagogical Techniques","Assessment Design","EdTech Tools"],
    recommendedCertifications: [
      { name: "B.Ed Eligibility / CTET",    provider: "NCTE",        priority: "Critical", timeMonths: 12 },
      { name: "Teaching in Higher Ed (Coursera)",provider:"Coursera", priority: "High",     timeMonths: 2  },
      { name: "UGC-NET Preparation",        provider: "Self-paced",  priority: "High",     timeMonths: 8  },
    ],
    roadmap: [
      { milestone: "Get B.Ed / UGC-NET certified", dueMonths: 8,  status: "active"  },
      { milestone: "Guest lecture at school",      dueMonths: 3,  status: "upcoming"},
      { milestone: "Design 1 course curriculum",   dueMonths: 5,  status: "upcoming"},
    ],
    activities: ["ESO-003","ESO-005","ESO-019","LCH-015"],
  },
};

export const CAREER_PATH_KEYS = Object.keys(CAREER_PATHS);
