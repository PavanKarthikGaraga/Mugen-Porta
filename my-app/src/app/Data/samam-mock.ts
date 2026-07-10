// SAMAM Student Development Platform — Mock Data
// Replace useEffect fetch calls with real API calls when backend is ready.

export const mockStudent = {
  id: "2100030001",
  name: "Arjun Sharma",
  initials: "AS",
  branch: "Computer Science & Engineering",
  year: "3rd Year",
  campus: "KL University - Main",
  club: "ZeroOne CodeClub",
  domain: "Technical (TEC)",
  level: "Silver",
  levelProgress: 72, // % toward next level
  nextLevel: "Gold",
  careerChoice: "Placement",
  joinedDate: "Aug 2022",
  graduationYear: "2026",
};

export const mockSDC = {
  total: 247,
  target: 350,
  breakdown: [
    { category: "Club Activities", credits: 80, color: "#970003" },
    { category: "Events & Workshops", credits: 55, color: "#D97706" },
    { category: "Volunteering", credits: 42, color: "#059669" },
    { category: "Competitions", credits: 38, color: "#2563EB" },
    { category: "Online Courses", credits: 32, color: "#7C3AED" },
  ],
};

export const mockStats = {
  activitiesCompleted: 34,
  activitiesInProgress: 3,
  competenciesDeveloped: 8,
  badgesEarned: 12,
  graduateAttributeScore: 78,
  careerReadinessScore: 65,
  learningHoursTotal: 186,
  reflections: 21,
};

export const mockWeeklyHours = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 4.0 },
  { day: "Wed", hours: 1.5 },
  { day: "Thu", hours: 3.5 },
  { day: "Fri", hours: 5.0 },
  { day: "Sat", hours: 2.0 },
  { day: "Sun", hours: 3.0 },
];

export const mockCompetencies = [
  { name: "Communication", score: 82 },
  { name: "Problem Solving", score: 75 },
  { name: "Leadership", score: 60 },
  { name: "Teamwork", score: 88 },
  { name: "Critical Thinking", score: 70 },
  { name: "Digital Literacy", score: 91 },
];

export const mockUpcomingActivities = [
  {
    id: 1,
    title: "National Hackathon 2025",
    category: "Competition",
    date: "2025-07-20",
    time: "09:00 AM",
    venue: "Main Auditorium",
    credits: 15,
    status: "Registered",
    color: "#2563EB",
  },
  {
    id: 2,
    title: "Leadership Masterclass",
    category: "Workshop",
    date: "2025-07-23",
    time: "02:00 PM",
    venue: "Seminar Hall B",
    credits: 8,
    status: "Open",
    color: "#D97706",
  },
  {
    id: 3,
    title: "Industry Connect: FAANG Series",
    category: "Seminar",
    date: "2025-07-28",
    time: "11:00 AM",
    venue: "Online (Zoom)",
    credits: 5,
    status: "Open",
    color: "#059669",
  },
  {
    id: 4,
    title: "Open Source Contribution Sprint",
    category: "Club Activity",
    date: "2025-08-02",
    time: "10:00 AM",
    venue: "Tech Lab 3",
    credits: 10,
    status: "Upcoming",
    color: "#7C3AED",
  },
];

export const mockRecentBadges = [
  { id: 1, name: "Code Ninja", icon: "⚡", earnedOn: "Jul 5, 2025", rarity: "Rare" },
  { id: 2, name: "Team Player", icon: "🤝", earnedOn: "Jun 28, 2025", rarity: "Common" },
  { id: 3, name: "Hackathon Finalist", icon: "🏆", earnedOn: "Jun 15, 2025", rarity: "Epic" },
  { id: 4, name: "Community Builder", icon: "🌱", earnedOn: "Jun 10, 2025", rarity: "Common" },
];

export const mockNotifications = [
  {
    id: 1,
    type: "activity",
    title: "New activity available",
    message: "National Hackathon 2025 registrations are now open.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "badge",
    title: "Badge earned!",
    message: "You earned the 'Code Ninja' badge for completing the DSA sprint.",
    time: "1 day ago",
    read: false,
  },
  {
    id: 3,
    type: "sdc",
    title: "SDC Credits updated",
    message: "8 credits added for attending the Python Workshop.",
    time: "2 days ago",
    read: true,
  },
  {
    id: 4,
    type: "reminder",
    title: "Reflection pending",
    message: "You have a pending reflection for 'Leadership Bootcamp'.",
    time: "3 days ago",
    read: true,
  },
  {
    id: 5,
    type: "system",
    title: "Profile incomplete",
    message: "Add your LinkedIn profile to improve your Career Readiness score.",
    time: "5 days ago",
    read: true,
  },
];

export const mockAIRecommendations = [
  {
    id: 1,
    type: "activity",
    title: "Join the DSA Challenge Series",
    reason: "Strengthens your Problem Solving competency (currently at 75%)",
    credits: 12,
    icon: "💡",
    urgency: "high",
  },
  {
    id: 2,
    type: "skill",
    title: "Complete the Communication module",
    reason: "Recommended for your Placement career path — HR rounds focus on this",
    credits: 8,
    icon: "🎯",
    urgency: "medium",
  },
  {
    id: 3,
    type: "event",
    title: "Attend Industry Connect: FAANG Series",
    reason: "Builds Industry Exposure — a key Graduate Attribute gap in your passport",
    credits: 5,
    icon: "🚀",
    urgency: "low",
  },
];

export const mockGraduateAttributes = [
  { name: "Domain Knowledge", score: 80 },
  { name: "Problem Solving", score: 75 },
  { name: "Communication", score: 70 },
  { name: "Leadership", score: 58 },
  { name: "Ethics & Values", score: 85 },
  { name: "Industry Exposure", score: 52 },
  { name: "Global Awareness", score: 65 },
  { name: "Research Aptitude", score: 60 },
];
