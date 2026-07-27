// ─────────────────────────────────────────────────────────────────────────────
// SAMAM Activity Management Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export const DOMAINS: Record<string, any> = {
  TEC: { id: "TEC", name: "Technology & Emerging Technologies", color: "#2563EB", bg: "#EFF6FF" },
  LCH: { id: "LCH", name: "Literary, Cultural & Heritage",      color: "#7C3AED", bg: "#F5F3FF" },
  ESO: { id: "ESO", name: "Extension & Social Outreach",        color: "#059669", bg: "#ECFDF5" },
  IIE: { id: "IIE", name: "Innovation & Entrepreneurship",      color: "#D97706", bg: "#FFFBEB" },
  HWB: { id: "HWB", name: "Health & Well-being",                color: "#DC2626", bg: "#FEF2F2" },
};

export const SDG_MAP: Record<number, string> = {
  1: "No Poverty",
  2: "Zero Hunger",
  3: "Good Health and Well-being",
  4: "Quality Education",
  5: "Gender Equality",
  6: "Clean Water and Sanitation",
  7: "Affordable and Clean Energy",
  8: "Decent Work and Economic Growth",
  9: "Industry, Innovation and Infrastructure",
  10: "Reduced Inequalities",
  11: "Sustainable Cities and Communities",
  12: "Responsible Consumption and Production",
  13: "Climate Action",
  14: "Life Below Water",
  15: "Life on Land",
  16: "Peace, Justice and Strong Institutions",
  17: "Partnerships for the Goals"
};

export const LEVELS = [
  {
    id: "explorer",
    name: "Explorer",
    icon: "Compass",
    description: "Begin your journey. Discover what interests you.",
    credits_required: 0,
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
  },
  {
    id: "foundation",
    name: "Foundation",
    icon: "Layers",
    description: "Build your base competencies across core areas.",
    credits_required: 500,
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  {
    id: "practitioner",
    name: "Practitioner",
    icon: "Briefcase",
    description: "Apply knowledge. Contribute to real-world projects.",
    credits_required: 1250,
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    id: "leader",
    name: "Leader",
    icon: "Award",
    description: "Lead teams, mentor peers, drive initiatives.",
    credits_required: 2000,
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  {
    id: "innovator",
    name: "Innovator",
    icon: "Lightbulb",
    description: "Create novel solutions. Drive systemic change.",
    credits_required: 3000,
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
  {
    id: "fellow",
    name: "Fellow",
    icon: "Star",
    description: "Highest level of achievement and thought leadership.",
    credits_required: 4500,
    color: "#DB2777",
    bg: "#FDF2F8",
    border: "#FBCFE8",
  },
];

const rawActivities: any[] = [
  {
    id: "TECH-AI-001",
    code: "TECH-AI-001",
    name: "AI Productivity Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Artificial Intelligence & Intelligent Systems",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "AI Explorer",
    sdgs: [4, 8],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "Introduce students to basic AI tools to enhance productivity.",
    outcomes: ["Understand AI basics", "Use AI tools for writing", "Apply AI for productivity"],
    competencies: ["AI Fundamentals", "Prompt Engineering", "Problem Solving", "Critical Thinking", "Technical Communication"],
  syllabus: [
    "Module 1: Introduction to AI Productivity and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AI Productivity",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 45,
    maxEnrollment: 100,
    faculty: "Prof. AI Basics",
  },
  {
    id: "TECH-AI-002",
    code: "TECH-AI-002",
    name: "Prompt Engineering & AI Communication",
    domain: "TEC",
    level: "foundation",
    pack: "Artificial Intelligence & Intelligent Systems",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "AI Communicator",
    sdgs: [4, 8, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "Learn effective prompt engineering to communicate with AI models.",
    outcomes: ["Write effective prompts", "Optimize AI outputs", "Automate basic tasks"],
    competencies: ["Prompt Engineering", "Generative AI Applications", "AI Communication", "Workflow Automation", "Critical Thinking", "Documentation"],
  syllabus: [
    "Module 1: Introduction to Prompt Engineering & AI Communication and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Prompt Engineering & AI Communication",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 30,
    maxEnrollment: 50,
    faculty: "Dr. Prompt Smith",
  },
  {
    id: "TECH-AI-003",
    code: "TECH-AI-003",
    name: "AI Application Development & Intelligent Automation",
    domain: "TEC",
    level: "practitioner",
    pack: "Artificial Intelligence & Intelligent Systems",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "AI Developer",
    sdgs: [4, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Build intelligent automation scripts and AI applications.",
    outcomes: ["Develop AI apps", "Automate workflows", "Deploy simple models"],
    competencies: ["AI Application Development", "Machine Learning Applications", "Automation", "API Integration", "Model Evaluation", "Debugging", "Software Engineering"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of AI Application Development & Intelligent Automation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AI Application Development & Intelligent Automation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 20,
    maxEnrollment: 40,
    faculty: "Prof. ML Engineer",
  },
  {
    id: "TECH-AI-004",
    code: "TECH-AI-004",
    name: "AI Innovation Challenge & Industry Solutions",
    domain: "TEC",
    level: "leader",
    pack: "Artificial Intelligence & Intelligent Systems",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "AI Innovator",
    sdgs: [8, 9, 11],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Solve real industry challenges using AI.",
    outcomes: ["Build industry solutions", "Lead an AI project team", "Present AI prototypes"],
    competencies: ["AI Solution Design", "Innovation Management", "Project Management", "Industry Collaboration", "Leadership", "Ethical AI", "Presentation Skills"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of AI Innovation Challenge & Industry Solutions",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AI Innovation Challenge & Industry Solutions",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 10,
    maxEnrollment: 25,
    faculty: "Dr. Innovation",
  },
  {
    id: "TECH-AI-005",
    code: "TECH-AI-005",
    name: "AI Research, Startup Incubation & Global Innovation Fellowship",
    domain: "TEC",
    level: "fellow",
    pack: "Artificial Intelligence & Intelligent Systems",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished AI Innovation Fellow",
    sdgs: [4, 8, 9, 11, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To enable outstanding students to transform AI innovations into research publications, patents, startups, technology transfer projects, or scalable societal solutions through structured mentoring, incubation, and global collaboration.",
    outcomes: ["Conduct advanced AI research", "Develop industry-grade AI solutions", "Publish research papers", "File patents or copyrights where appropriate", "Build startup-ready AI products", "Collaborate with industry and international partners", "Demonstrate ethical and responsible AI leadership"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of AI Research, Startup Incubation & Global Innovation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AI Research, Startup Incubation & Global Innovation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 5,
    maxEnrollment: 10,
    faculty: "Principal Faculty Mentor",
    competencies: ["Advanced AI Development", "Machine Learning Applications", "Research Methodology", "Product Engineering", "Technology Commercialization", "Innovation Leadership", "Entrepreneurship", "Global Collaboration"],
  },
  {
    id: "TECH-SWD-001",
    code: "TECH-SWD-001",
    name: "Full Stack Development Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Software Engineering & Full Stack Development",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Web Explorer",
    sdgs: [4, 8],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "Introduce students to web development basics.",
    outcomes: ["Understand HTML/CSS", "Build simple web pages", "Introduction to JavaScript"],
    competencies: ["Programming Fundamentals", "Web Development", "Version Control", "Problem Solving", "Technical Communication"],
  syllabus: [
    "Module 1: Introduction to Full Stack Development and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Full Stack Development",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 60,
    maxEnrollment: 120,
    faculty: "Prof. Web Basics",
  },
  {
    id: "TECH-SWD-002",
    code: "TECH-SWD-002",
    name: "Modern Frontend Development & UI/UX Engineering",
    domain: "TEC",
    level: "foundation",
    pack: "Software Engineering & Full Stack Development",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Frontend Engineer",
    sdgs: [4, 8, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "Learn frontend frameworks and UI/UX design principles.",
    outcomes: ["Build reactive UIs", "Apply UI/UX principles", "Consume REST APIs"],
    competencies: ["Frontend Development", "Responsive Web Design", "UI/UX Principles", "JavaScript Frameworks", "Accessibility", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to Modern Frontend Development & UI/UX Engineering and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Modern Frontend Development & UI/UX Engineering",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 40,
    maxEnrollment: 80,
    faculty: "Dr. Frontend",
  },
  {
    id: "TECH-SWD-003",
    code: "TECH-SWD-003",
    name: "Full Stack Application Development & Database Engineering",
    domain: "TEC",
    level: "practitioner",
    pack: "Software Engineering & Full Stack Development",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Full Stack Developer",
    sdgs: [4, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Develop full-stack applications with robust databases.",
    outcomes: ["Develop server-side logic", "Design databases", "Deploy full-stack apps"],
    competencies: ["Backend Development", "Database Engineering", "REST API Development", "Authentication & Authorization", "Cloud Deployment", "System Integration", "Software Testing"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Full Stack Application Development & Database Engineering",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Full Stack Application Development & Database Engineering",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 30,
    maxEnrollment: 60,
    faculty: "Prof. Backend",
  },
  {
    id: "TECH-SWD-004",
    code: "TECH-SWD-004",
    name: "Enterprise Software Engineering & Digital Product Innovation",
    domain: "TEC",
    level: "leader",
    pack: "Software Engineering & Full Stack Development",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Enterprise Architect",
    sdgs: [8, 9, 11],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Engineer scalable enterprise digital products.",
    outcomes: ["Architect enterprise software", "Implement CI/CD pipelines", "Lead software teams"],
    competencies: ["Software Architecture", "Enterprise Application Development", "Agile Project Management", "Product Engineering", "Software Quality Assurance", "Technical Leadership", "Stakeholder Management"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Enterprise Software Engineering & Digital Product Innovation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Enterprise Software Engineering & Digital Product Innovation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 15,
    maxEnrollment: 30,
    faculty: "Dr. Software Arch",
  },
  {
    id: "TECH-SWD-005",
    code: "TECH-SWD-005",
    name: "Global Software Innovation Fellowship & Technology Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Software Engineering & Full Stack Development",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Software Innovation Fellow",
    sdgs: [4, 8, 9, 11, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare students to build globally competitive software products that can evolve into startups, open-source platforms, institutional solutions, research outcomes, or commercial technologies while strengthening leadership, innovation, and entrepreneurial capabilities.",
    outcomes: ["Architect enterprise-grade software ecosystems", "Build scalable cloud-native applications", "Lead multidisciplinary software teams", "Commercialize software products", "Publish technical research", "Contribute to open-source communities", "Launch technology startups"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Software Innovation  & Technology Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Software Innovation  & Technology Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 5,
    maxEnrollment: 10,
    faculty: "Principal Software Mentor",
    competencies: ["Enterprise Software Architecture", "Cloud-Native Development", "DevOps & CI/CD", "Technology Entrepreneurship", "Research & Innovation", "Product Strategy", "Professional Ethics", "Global Collaboration"],
  },
  {
    id: "TECH-CYS-001",
    code: "TECH-CYS-001",
    name: "Cybersecurity & Digital Safety Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Cybersecurity & Digital Trust",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Cyber Explorer",
    sdgs: [4, 8, 16],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "Introduce students to basic digital safety and cybersecurity concepts.",
    outcomes: ["Understand digital threats", "Practice safe browsing", "Secure personal devices"],
    competencies: ["Cybersecurity Fundamentals", "Network Security", "Digital Safety", "Risk Awareness", "Technical Communication"],
  syllabus: [
    "Module 1: Introduction to Cybersecurity & Digital Safety and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Cybersecurity & Digital Safety",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 50,
    maxEnrollment: 100,
    faculty: "Prof. Security Basics",
  },
  {
    id: "TECH-CYS-002",
    code: "TECH-CYS-002",
    name: "Ethical Hacking & Security Testing Foundation Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Cybersecurity & Digital Trust",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Ethical Hacker",
    sdgs: [4, 8, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "Learn foundational ethical hacking and vulnerability assessment.",
    outcomes: ["Conduct vulnerability scans", "Understand penetration testing", "Identify common exploits"],
    competencies: ["Ethical Hacking", "Vulnerability Assessment", "Penetration Testing", "Network Security", "Cyber Ethics", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to Ethical Hacking & Security Testing and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Ethical Hacking & Security Testing",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 35,
    maxEnrollment: 70,
    faculty: "Dr. Pen Tester",
  },
  {
    id: "TECH-CYS-003",
    code: "TECH-CYS-003",
    name: "Cyber Defense, Digital Forensics & Incident Response Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Cybersecurity & Digital Trust",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Cyber Defender",
    sdgs: [4, 9, 16],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Develop skills to defend systems and respond to cyber incidents.",
    outcomes: ["Implement network defense", "Perform digital forensics", "Execute incident response"],
    competencies: ["Digital Forensics", "Incident Response", "Threat Analysis", "Malware Analysis", "Security Operations", "Critical Thinking", "Problem Solving"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Cyber Defense, Digital Forensics & Incident Response",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Cyber Defense, Digital Forensics & Incident Response",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 25,
    maxEnrollment: 50,
    faculty: "Prof. Cyber Analyst",
  },
  {
    id: "TECH-CYS-004",
    code: "TECH-CYS-004",
    name: "Security Operations Centre (SOC) Leadership & Cyber Risk Management Programme",
    domain: "TEC",
    level: "leader",
    pack: "Cybersecurity & Digital Trust",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "SOC Leader",
    sdgs: [8, 9, 11],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Manage security operations and mitigate organizational cyber risks.",
    outcomes: ["Lead SOC teams", "Manage cyber risks", "Develop security policies"],
    competencies: ["SOC Operations", "Cyber Risk Management", "Threat Intelligence", "Leadership", "Security Governance", "Decision Making", "Stakeholder Management"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Security Operations Centre (SOC) Leadership & Cyber Risk Management",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Security Operations Centre (SOC) Leadership & Cyber Risk Management",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 15,
    maxEnrollment: 30,
    faculty: "Dr. Cyber Risk",
  },
  {
    id: "TECH-CYS-005",
    code: "TECH-CYS-005",
    name: "Global Cybersecurity Fellowship, Research & Innovation Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Cybersecurity & Digital Trust",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Cybersecurity Innovation Fellow",
    sdgs: [4, 8, 9, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare students to conduct advanced cybersecurity research, develop innovative security technologies, contribute to national cyber resilience, and transform cybersecurity innovations into research publications, patents, startups, or deployable organizational solutions.",
    outcomes: ["Conduct advanced cybersecurity research", "Design innovative cyber defense solutions", "Develop secure software and infrastructure", "Build cybersecurity products and services", "Publish research papers", "File patents or copyrights where appropriate", "Present cybersecurity innovations at national and international platforms", "Mentor junior cybersecurity students"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Cybersecurity , Research & Innovation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Cybersecurity , Research & Innovation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 5,
    maxEnrollment: 10,
    faculty: "Principal Cybersecurity Mentor",
    competencies: ["Advanced Cyber Defense", "Threat Intelligence", "Cloud Security", "Cybersecurity Research", "Innovation Leadership", "Technology Strategy", "Global Collaboration", "Professional Ethics"],
  },
  {
    id: "TECH-DSA-001",
    code: "TECH-DSA-001",
    name: "Data Science & Analytics Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Data Science, Analytics & Business Intelligence",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Data Explorer",
    sdgs: [4, 8],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "Introduce students to basic data science concepts, data collection, and elementary analysis.",
    outcomes: ["Understand data lifecycles", "Perform basic data cleaning", "Use spreadsheets for analysis"],
    competencies: ["Data Analysis", "Statistics Fundamentals", "Data Visualization", "Critical Thinking", "Technical Communication"],
  syllabus: [
    "Module 1: Introduction to Data Science & Analytics and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Data Science & Analytics",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 60,
    maxEnrollment: 100,
    faculty: "Prof. Analytics Basics",
  },
  {
    id: "TECH-DSA-002",
    code: "TECH-DSA-002",
    name: "Data Analysis & Visualization Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Data Science, Analytics & Business Intelligence",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Data Visualizer",
    sdgs: [4, 8, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "Learn to analyze datasets and create compelling data visualizations.",
    outcomes: ["Create dashboards", "Use BI tools like Tableau/PowerBI", "Communicate data insights"],
    competencies: ["Data Wrangling", "Exploratory Data Analysis", "Data Visualization", "SQL", "Python for Analytics", "Reporting"],
  syllabus: [
    "Module 1: Introduction to Data Analysis & Visualization and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Data Analysis & Visualization",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 45,
    maxEnrollment: 80,
    faculty: "Dr. Visuals",
  },
  {
    id: "TECH-DSA-003",
    code: "TECH-DSA-003",
    name: "Predictive Modeling & Machine Learning Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Data Science, Analytics & Business Intelligence",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Predictive Analyst",
    sdgs: [4, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Build predictive models and apply machine learning algorithms to real-world datasets.",
    outcomes: ["Train machine learning models", "Evaluate model accuracy", "Deploy predictive models"],
    competencies: ["Machine Learning", "Predictive Analytics", "Feature Engineering", "Model Evaluation", "Python", "Critical Thinking", "Problem Solving"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Predictive Modeling & Machine Learning",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Predictive Modeling & Machine Learning",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 30,
    maxEnrollment: 60,
    faculty: "Prof. ML Analytics",
  },
  {
    id: "TECH-DSA-004",
    code: "TECH-DSA-004",
    name: "Data Science Leadership, AI Strategy & Decision Intelligence Programme",
    domain: "TEC",
    level: "leader",
    pack: "Data Science, Analytics & Business Intelligence",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Data Science Leadership Excellence",
    sdgs: [4, 8, 9, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "To prepare students to lead data-driven organizations by developing enterprise analytics strategies, AI governance frameworks, decision intelligence systems, and ethical data-driven transformation initiatives.",
    outcomes: ["Design enterprise analytics strategies", "Lead multidisciplinary analytics teams", "Build executive dashboards", "Develop AI governance frameworks", "Evaluate organizational data maturity", "Present strategic recommendations to leadership", "Promote ethical and responsible use of AI and data"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Data Science Leadership, AI Strategy & Decision Intelligence",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Data Science Leadership, AI Strategy & Decision Intelligence",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 15,
    maxEnrollment: 30,
    faculty: "Data Science Faculty Mentor",
    competencies: ["Enterprise Analytics", "Decision Intelligence", "AI Governance", "Leadership", "Business Strategy", "Stakeholder Management", "Ethical Decision Making"],
  },
  {
    id: "TECH-DSA-005",
    code: "TECH-DSA-005",
    name: "Global Data Science Fellowship, Research & Innovation Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Data Science, Analytics & Business Intelligence",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Data Science Fellow",
    sdgs: [4, 8, 9, 11, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare students to lead advanced data science research, drive global analytics innovation, and build transformative AI models for enterprise and societal impact.",
    outcomes: ["Conduct advanced data science research", "Build transformative AI and ML solutions", "Publish analytics research", "Commercialize data products", "Mentor junior analysts"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Data Science , Research & Innovation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Data Science , Research & Innovation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 5,
    maxEnrollment: 10,
    faculty: "Principal Analytics Mentor",
    competencies: ["Advanced Data Science", "Research Methodology", "AI Innovation", "Technology Commercialization", "Innovation Leadership", "Global Collaboration", "Professional Ethics", "Lifelong Learning"],
  },
  {
    id: "TECH-CLD-001",
    code: "TECH-CLD-001",
    name: "Cloud Computing & Digital Infrastructure Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Cloud Computing & DevOps",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Cloud Explorer",
    sdgs: [4, 8, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "Introduce students to basic cloud computing models, infrastructure, and services.",
    outcomes: ["Understand cloud concepts (IaaS, PaaS, SaaS)", "Deploy basic resources", "Explore cloud security basics"],
    competencies: ["Cloud Computing Fundamentals", "Virtualization", "Cloud Storage", "Networking Basics", "Technical Communication"],
  syllabus: [
    "Module 1: Introduction to Cloud Computing & Digital Infrastructure and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Cloud Computing & Digital Infrastructure",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 55,
    maxEnrollment: 100,
    faculty: "Prof. Cloud Basics",
  },
  {
    id: "TECH-CLD-002",
    code: "TECH-CLD-002",
    name: "Cloud Infrastructure & DevOps Foundation Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Cloud Computing & DevOps",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "DevOps Engineer",
    sdgs: [4, 8, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "Learn foundational cloud infrastructure provisioning and basic DevOps pipelines.",
    outcomes: ["Provision cloud servers", "Understand containerization", "Build basic CI/CD pipelines"],
    competencies: ["Cloud Infrastructure", "Linux Administration", "DevOps Fundamentals", "CI/CD", "Containerization", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to Cloud Infrastructure & DevOps and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Cloud Infrastructure & DevOps",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 40,
    maxEnrollment: 80,
    faculty: "Dr. DevOps",
  },
  {
    id: "TECH-CLD-003",
    code: "TECH-CLD-003",
    name: "Cloud Architecture, Automation & Site Reliability Engineering",
    domain: "TEC",
    level: "practitioner",
    pack: "Cloud Computing & DevOps",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Cloud Architect",
    sdgs: [4, 9, 11],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Architect scalable cloud solutions and implement site reliability engineering practices.",
    outcomes: ["Design high-availability architectures", "Write Infrastructure as Code", "Implement SRE monitoring"],
    competencies: ["Cloud Architecture", "Infrastructure as Code", "Site Reliability Engineering", "Automation", "Kubernetes", "Monitoring", "Cloud Security"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Cloud Architecture, Automation & Site Reliability Engineering",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Cloud Architecture, Automation & Site Reliability Engineering",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 25,
    maxEnrollment: 50,
    faculty: "Prof. Site Reliability",
  },
  {
    id: "TECH-CLD-004",
    code: "TECH-CLD-004",
    name: "Enterprise Cloud Strategy, DevSecOps & Platform Leadership",
    domain: "TEC",
    level: "leader",
    pack: "Cloud Computing & DevOps",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Cloud Leader",
    sdgs: [8, 9, 11, 16],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Lead enterprise cloud transformations and integrate security into DevOps pipelines.",
    outcomes: ["Lead DevSecOps implementations", "Manage multi-cloud strategies", "Govern enterprise cloud platforms"],
    competencies: ["Enterprise Cloud Strategy", "DevSecOps", "Platform Engineering", "Technology Leadership", "Risk Management", "Strategic Planning", "Stakeholder Management"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Enterprise Cloud Strategy, DevSecOps & Platform Leadership",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Enterprise Cloud Strategy, DevSecOps & Platform Leadership",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 15,
    maxEnrollment: 30,
    faculty: "Dr. Cloud Strategy",
  },
  {
    id: "TECH-CLD-005",
    code: "TECH-CLD-005",
    name: "Global Cloud Innovation Fellowship, Research & Startup Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Cloud Computing & DevOps",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Cloud Innovation Fellow",
    sdgs: [4, 8, 9, 11, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To develop globally competent cloud professionals capable of designing enterprise cloud platforms, conducting advanced research, building cloud-native products, creating startups, and leading digital transformation initiatives.",
    outcomes: ["Design enterprise-scale cloud platforms", "Build cloud-native applications", "Implement AI-driven cloud operations", "Develop cloud security frameworks", "Conduct advanced cloud computing research", "Publish research papers and patents", "Build cloud startups", "Mentor junior students"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Cloud Innovation , Research & Startup",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Cloud Innovation , Research & Startup",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 5,
    maxEnrollment: 10,
    faculty: "Principal Cloud Mentor",
    competencies: ["Cloud Native Computing", "Multi-Cloud Architecture", "Cloud Security Engineering", "AIOps", "Research Leadership", "Technology Entrepreneurship", "Global Collaboration", "Professional Ethics"],
  },
  {
    id: "TECH-IOT-001",
    code: "TECH-IOT-001",
    name: "Internet of Things (IoT) & Smart Systems Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Internet of Things (IoT) & Smart Systems",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "IoT Explorer",
    sdgs: [4, 7, 9, 11, 13],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "To introduce students to the Internet of Things (IoT), smart devices, sensors, embedded systems, and connected technologies, enabling them to understand how intelligent systems solve real-world problems in homes, industries, agriculture, healthcare, and smart villages.",
    outcomes: ["Explain IoT architecture and components", "Identify different types of sensors and actuators", "Understand embedded systems fundamentals", "Connect simple IoT devices", "Collect and visualize sensor data", "Understand IoT communication protocols", "Apply IoT responsibly with security and privacy awareness"],
  syllabus: [
    "Module 1: Introduction to Internet of Things (IoT) & Smart Systems and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Internet of Things (IoT) & Smart Systems",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 60,
    maxEnrollment: 100,
    faculty: "IoT Faculty Mentor",
    competencies: ["IoT Fundamentals", "Embedded Systems Basics", "Sensor Integration", "Wireless Communication", "Problem Solving"],
  },
  {
    id: "TECH-IOT-002",
    code: "TECH-IOT-002",
    name: "Smart Sensors, Embedded Systems & IoT Networks Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Internet of Things (IoT) & Smart Systems",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Embedded Engineer",
    sdgs: [4, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "Deepen knowledge in smart sensors, microcontrollers, and IoT network integration.",
    outcomes: ["Program microcontrollers", "Integrate advanced sensors", "Develop basic IoT networks"],
    competencies: ["Embedded Systems", "Sensor Networks", "Microcontroller Programming", "IoT Communication Protocols", "Hardware Debugging", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to Smart Sensors, Embedded Systems & IoT Networks and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Smart Sensors, Embedded Systems & IoT Networks",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 40,
    maxEnrollment: 80,
    faculty: "Dr. Embedded Systems",
  },
  {
    id: "TECH-IOT-003",
    code: "TECH-IOT-003",
    name: "IoT Networks & Edge Computing",
    domain: "TEC",
    level: "practitioner",
    pack: "Internet of Things (IoT) & Smart Systems",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "IoT Network Specialist",
    sdgs: [4, 9, 11],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Design IoT network architectures and implement edge computing solutions for real-time processing.",
    outcomes: ["Design IoT networks", "Implement Edge processing", "Optimize IoT data transmission"],
    competencies: ["Edge Computing", "IoT Network Architecture", "Cloud Integration", "Real-Time Data Processing", "IoT Security", "System Integration", "Performance Optimization"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of IoT Networks & Edge Computing",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for IoT Networks & Edge Computing",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 25,
    maxEnrollment: 50,
    faculty: "Prof. Edge Computing",
  },
  {
    id: "TECH-IOT-004",
    code: "TECH-IOT-004",
    name: "Smart Cities & Industrial IoT",
    domain: "TEC",
    level: "leader",
    pack: "Internet of Things (IoT) & Smart Systems",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Industrial IoT Leader",
    sdgs: [8, 9, 11],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Develop scalable industrial IoT solutions and smart city infrastructure applications.",
    outcomes: ["Architect Industrial IoT systems", "Implement smart city solutions", "Lead IoT development teams"],
    competencies: ["Industrial IoT", "Smart City Solutions", "System Architecture", "Leadership", "Project Management", "Innovation", "Strategic Planning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Smart Cities & Industrial IoT",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Smart Cities & Industrial IoT",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 15,
    maxEnrollment: 30,
    faculty: "Dr. Smart Systems",
  },
  {
    id: "TECH-IOT-005",
    code: "TECH-IOT-005",
    name: "Global IoT Innovation Fellowship",
    domain: "TEC",
    level: "fellow",
    pack: "Internet of Things (IoT) & Smart Systems",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished IoT Innovation Fellow",
    sdgs: [4, 7, 9, 11, 13, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To develop globally competent IoT professionals capable of designing enterprise IoT platforms, conducting advanced research, building IoT startups, and leading digital transformation initiatives.",
    outcomes: ["Design enterprise-scale IoT platforms", "Conduct advanced IoT research", "Publish research papers and patents", "Build IoT startups", "Mentor junior students"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global IoT Innovation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global IoT Innovation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 5,
    maxEnrollment: 10,
    faculty: "Principal IoT Mentor",
    competencies: ["Advanced IoT Architecture", "Industrial IoT Platforms", "Edge AI", "Technology Leadership", "Research & Development", "Product Innovation", "Global Collaboration", "Lifelong Learning"],
  },
  {
    id: "TECH-ROB-001",
    code: "TECH-ROB-001",
    name: "Robotics & Intelligent Automation Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Robotics & Intelligent Automation",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Robotics Explorer",
    sdgs: [4, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "Introduce students to the foundational concepts of robotics and automation.",
    outcomes: ["Understand basic robotic components", "Identify automation use cases", "Explore robotics ethics"],
    competencies: ["Robotics Fundamentals", "Automation Basics", "Embedded Systems", "Programming Fundamentals", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to Robotics & Intelligent Automation and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Robotics & Intelligent Automation",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 50,
    maxEnrollment: 100,
    faculty: "Prof. Robotics Basics",
  },
  {
    id: "TECH-ROB-002",
    code: "TECH-ROB-002",
    name: "Robot Design, Programming & Control Systems Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Robotics & Intelligent Automation",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Robot Designer",
    sdgs: [4, 8, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "Learn to design, assemble, and program basic robotic systems.",
    outcomes: ["Design basic robots", "Program microcontrollers for robotics", "Implement simple control loops"],
    competencies: ["Robot Design", "Robot Programming", "Control Systems", "Embedded Programming", "Sensor Integration", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to Robot Design, Programming & Control Systems and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Robot Design, Programming & Control Systems",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 35,
    maxEnrollment: 80,
    faculty: "Dr. Control Systems",
  },
  {
    id: "TECH-ROB-003",
    code: "TECH-ROB-003",
    name: "Autonomous Robotics, Computer Vision & Human–Robot Interaction Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Robotics & Intelligent Automation",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Autonomous Systems Practitioner",
    sdgs: [4, 9, 11],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Develop autonomous robots capable of computer vision and human-robot interaction.",
    outcomes: ["Integrate computer vision", "Program autonomous navigation", "Implement HRI principles"],
    competencies: ["Autonomous Robotics", "Computer Vision", "Human-Robot Interaction", "AI for Robotics", "Sensor Fusion", "System Integration", "Innovation"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Autonomous Robotics, Computer Vision & Human–Robot Interaction",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Autonomous Robotics, Computer Vision & Human–Robot Interaction",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 25,
    maxEnrollment: 50,
    faculty: "Prof. Autonomous Systems",
  },
  {
    id: "TECH-ROB-004",
    code: "TECH-ROB-004",
    name: "Industrial Robotics, Collaborative Robots (Cobots) & Intelligent Manufacturing Leadership Programme",
    domain: "TEC",
    level: "leader",
    pack: "Robotics & Intelligent Automation",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Industrial Robotics Leader",
    sdgs: [8, 9, 11],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Lead the implementation of industrial robots and cobots in smart manufacturing environments.",
    outcomes: ["Program industrial cobots", "Design smart manufacturing workflows", "Lead automation projects"],
    competencies: ["Industrial Robotics", "Collaborative Robotics", "Automation Leadership", "Project Management", "Strategic Planning", "Manufacturing Innovation", "Stakeholder Management"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Industrial Robotics, Collaborative Robots (Cobots) & Intelligent Manufacturing Leadership",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Industrial Robotics, Collaborative Robots (Cobots) & Intelligent Manufacturing Leadership",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 15,
    maxEnrollment: 30,
    faculty: "Dr. Smart Manufacturing",
  },
  {
    id: "TECH-ROB-005",
    code: "TECH-ROB-005",
    name: "Global Robotics Innovation Fellowship, Research & Automation Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Robotics & Intelligent Automation",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Robotics Innovation Fellow",
    sdgs: [3, 4, 8, 9, 11, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare students as global robotics innovators capable of conducting advanced research, designing intelligent robotic systems, publishing research, securing patents, launching robotics startups, and leading technological transformation through automation.",
    outcomes: ["Design advanced intelligent robotic systems", "Integrate AI, IoT, Edge Computing, and Computer Vision into robotics", "Conduct publishable robotics research", "Develop industry-ready robotic products", "File patents and intellectual property", "Build robotics startups", "Mentor junior robotics innovators", "Present innovations before national and international expert panels"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Robotics Innovation , Research & Automation Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Robotics Innovation , Research & Automation Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 5,
    maxEnrollment: 10,
    faculty: "Principal Robotics Mentor",
    competencies: ["Advanced Robotics", "Autonomous Systems", "Research & Development", "Technology Entrepreneurship", "Innovation Leadership", "Global Collaboration", "Professional Ethics", "Lifelong Learning"],
  },
  {
    id: "TECH-DRN-001",
    code: "TECH-DRN-001",
    name: "Drone Technology & Geospatial Systems Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Drone Technology & Geospatial Systems",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Drone Explorer",
    sdgs: [4, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "Introduce students to the fundamentals of drone technology and basic geospatial concepts.",
    outcomes: ["Understand drone components", "Learn basic flight principles", "Explore geospatial mapping"],
    competencies: ["Drone Fundamentals", "Flight Safety", "Geospatial Basics", "Navigation", "Technical Communication"],
  syllabus: [
    "Module 1: Introduction to Drone Technology & Geospatial Systems and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Drone Technology & Geospatial Systems",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 50,
    maxEnrollment: 100,
    faculty: "Prof. Aerospace Basics",
  },
  {
    id: "TECH-DRN-002",
    code: "TECH-DRN-002",
    name: "Drone Operations, Navigation & Mapping Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Drone Technology & Geospatial Systems",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Drone Pilot",
    sdgs: [4, 8, 9, 11],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "Learn to operate drones safely, navigate flight paths, and capture mapping data.",
    outcomes: ["Operate drones safely", "Plan flight missions", "Capture aerial mapping data"],
    competencies: ["Drone Operations", "Mission Planning", "GPS Navigation", "Mapping", "Surveying", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to Drone Operations, Navigation & Mapping and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Drone Operations, Navigation & Mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 35,
    maxEnrollment: 80,
    faculty: "Dr. Drone Navigation",
  },
  {
    id: "TECH-DRN-003",
    code: "TECH-DRN-003",
    name: "Advanced Drone Systems, Computer Vision & Photogrammetry Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Drone Technology & Geospatial Systems",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Geospatial Practitioner",
    sdgs: [4, 9, 11],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Process aerial data using photogrammetry and apply computer vision to drone feeds.",
    outcomes: ["Process drone imagery", "Apply computer vision to aerial data", "Generate 3D models"],
    competencies: ["Computer Vision", "Photogrammetry", "Autonomous Flight", "Image Processing", "Drone Analytics", "AI Integration", "System Optimization"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Drone Systems, Computer Vision & Photogrammetry",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Drone Systems, Computer Vision & Photogrammetry",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 25,
    maxEnrollment: 50,
    faculty: "Prof. Photogrammetry",
  },
  {
    id: "TECH-DRN-004",
    code: "TECH-DRN-004",
    name: "Industrial Drone Applications & Geospatial Leadership Programme",
    domain: "TEC",
    level: "leader",
    pack: "Drone Technology & Geospatial Systems",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Aerospace Innovator",
    sdgs: [8, 9, 11],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Lead industrial drone deployments for sectors like agriculture, construction, and disaster management.",
    outcomes: ["Manage industrial drone fleets", "Lead geospatial data projects", "Implement industry-specific drone solutions"],
    competencies: ["Industrial Drone Applications", "Geospatial Leadership", "Project Management", "Drone Regulations", "Strategic Planning", "Stakeholder Management", "Innovation"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Industrial Drone Applications & Geospatial Leadership",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Industrial Drone Applications & Geospatial Leadership",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 15,
    maxEnrollment: 30,
    faculty: "Dr. Aerospace Leadership",
  },
  {
    id: "TECH-DRN-005",
    code: "TECH-DRN-005",
    name: "Global Drone Innovation Fellowship, Research & Aerospace Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Drone Technology & Geospatial Systems",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Drone Innovation Fellow",
    sdgs: [3, 4, 8, 9, 11, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare students as global drone innovators capable of conducting advanced aerospace research, designing specialized UAVs, and launching aerospace startups.",
    outcomes: ["Design specialized UAVs", "Conduct aerospace research", "Build drone startups", "Develop custom drone payloads", "Lead autonomous fleet operations", "Mentor junior aerospace innovators"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Drone Innovation , Research & Aerospace Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Drone Innovation , Research & Aerospace Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 5,
    maxEnrollment: 10,
    faculty: "Principal Aerospace Mentor",
    competencies: ["Advanced UAV Design", "Autonomous Navigation", "Geospatial Analytics", "Aerospace Research", "Innovation Leadership", "Technology Entrepreneurship", "Global Collaboration", "Professional Ethics"],
  },
  {
    id: "TECH-BC-001",
    code: "TECH-BC-001",
    name: "Blockchain, Web3 & Decentralized Digital Systems Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Blockchain, Web3 & Decentralized Digital Systems",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Blockchain Explorer",
    sdgs: [4, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "Introduce students to the fundamentals of blockchain technology and decentralized systems.",
    outcomes: ["Understand blockchain basics", "Explore Web3 concepts", "Identify decentralized use cases"],
    competencies: ["Blockchain Fundamentals", "Distributed Ledger Technology", "Cryptography Basics", "Web3 Fundamentals", "Technical Communication"],
  syllabus: [
    "Module 1: Introduction to Blockchain, Web3 & Decentralized Digital Systems and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Blockchain, Web3 & Decentralized Digital Systems",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 50,
    maxEnrollment: 100,
    faculty: "Prof. Blockchain Basics",
  },
  {
    id: "TECH-BC-002",
    code: "TECH-BC-002",
    name: "Smart Contracts, Digital Assets & Decentralized Applications Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Blockchain, Web3 & Decentralized Digital Systems",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Smart Contract Developer",
    sdgs: [4, 8, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "Learn to write smart contracts and build decentralized applications (DApps).",
    outcomes: ["Write smart contracts", "Develop basic DApps", "Understand tokenomics"],
    competencies: ["Smart Contract Development", "Solidity Programming", "Decentralized Applications", "Digital Assets", "Blockchain Testing", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to Smart Contracts, Digital Assets & Decentralized Applications and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Smart Contracts, Digital Assets & Decentralized Applications",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 35,
    maxEnrollment: 80,
    faculty: "Dr. Crypto Code",
  },
  {
    id: "TECH-BC-003",
    code: "TECH-BC-003",
    name: "Enterprise Blockchain, Decentralized Identity & Web3 Systems Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Blockchain, Web3 & Decentralized Digital Systems",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Enterprise Web3 Practitioner",
    sdgs: [4, 9, 16],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Design enterprise blockchain solutions and decentralized identity platforms.",
    outcomes: ["Architect enterprise blockchain", "Implement decentralized identity", "Build Web3 systems"],
    competencies: ["Enterprise Blockchain", "Decentralized Identity", "Cross-Chain Systems", "Blockchain Security", "System Integration", "Architecture Design", "Technical Leadership"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Enterprise Blockchain, Decentralized Identity & Web3 Systems",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Enterprise Blockchain, Decentralized Identity & Web3 Systems",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 25,
    maxEnrollment: 50,
    faculty: "Prof. Web3 Systems",
  },
  {
    id: "TECH-BC-004",
    code: "TECH-BC-004",
    name: "Blockchain Governance, FinTech & Digital Trust Leadership Programme",
    domain: "TEC",
    level: "leader",
    pack: "Blockchain, Web3 & Decentralized Digital Systems",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Digital Trust Leader",
    sdgs: [8, 9, 16],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Lead blockchain governance and FinTech digital trust initiatives.",
    outcomes: ["Manage blockchain governance", "Implement FinTech solutions", "Lead digital trust projects"],
    competencies: ["Blockchain Governance", "Digital Trust", "FinTech Systems", "Strategic Leadership", "Risk Management", "Compliance", "Stakeholder Management"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Blockchain Governance, FinTech & Digital Trust Leadership",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Blockchain Governance, FinTech & Digital Trust Leadership",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 15,
    maxEnrollment: 30,
    faculty: "Dr. FinTech Trust",
  },
  {
    id: "TECH-BC-005",
    code: "TECH-BC-005",
    name: "Global Blockchain Innovation Fellowship, Research & Web3 Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Blockchain, Web3 & Decentralized Digital Systems",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Blockchain Innovation Fellow",
    sdgs: [4, 8, 9, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competent blockchain innovators capable of designing enterprise-grade decentralized platforms, conducting advanced blockchain research, publishing research papers, securing patents, building Web3 startups, and leading digital transformation through trusted decentralized ecosystems.",
    outcomes: ["Design enterprise blockchain ecosystems", "Develop scalable Web3 platforms", "Implement decentralized identity and trusted digital credential systems", "Integrate blockchain with AI, IoT, Cloud, and Digital Governance", "Conduct advanced blockchain research", "Publish research papers and file patents", "Build blockchain startups", "Mentor junior innovators"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Blockchain Innovation , Research & Web3 Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Blockchain Innovation , Research & Web3 Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 5,
    maxEnrollment: 10,
    faculty: "Principal Blockchain Mentor",
    competencies: ["Enterprise Blockchain Engineering", "Advanced Smart Contracts", "Web3 Architecture", "Blockchain Research", "Technology Entrepreneurship", "Innovation Leadership", "Global Collaboration", "Professional Ethics"],
  },
  {
    id: "TECH-QC-001",
    code: "TECH-QC-001",
    name: "Quantum Computing & Future Computing Technologies Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Quantum Computing & Future Computing Technologies",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Quantum Explorer",
    sdgs: [4, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "Introduce students to the fundamental principles of quantum mechanics, quantum computing, and future computing paradigms.",
    outcomes: ["Understand quantum superposition and entanglement", "Explore future computing technologies", "Identify applications of quantum computing"],
    competencies: ["Quantum Computing Fundamentals", "Linear Algebra for Quantum Systems", "Quantum Mechanics Basics", "Problem Solving", "Technical Communication"],
  syllabus: [
    "Module 1: Introduction to Quantum Computing & Future Computing Technologies and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Quantum Computing & Future Computing Technologies",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 40,
    maxEnrollment: 100,
    faculty: "Prof. Quantum Physics",
  },
  {
    id: "TECH-QC-002",
    code: "TECH-QC-002",
    name: "Quantum Programming, Algorithms & Simulations Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Quantum Computing & Future Computing Technologies",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Quantum Programmer",
    sdgs: [4, 8, 9],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "Learn to write quantum algorithms and run quantum simulations on cloud-based quantum platforms.",
    outcomes: ["Program quantum circuits", "Run quantum simulations", "Understand basic quantum algorithms like Shor's and Grover's"],
    competencies: ["Quantum Programming", "Quantum Algorithms", "Quantum Circuit Design", "Quantum Simulation", "Python Programming", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to Quantum Programming, Algorithms & Simulations and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Quantum Programming, Algorithms & Simulations",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 30,
    maxEnrollment: 80,
    faculty: "Dr. Qubit Developer",
  },
  {
    id: "TECH-QC-003",
    code: "TECH-QC-003",
    name: "Quantum Machine Learning, Quantum Cryptography & Hybrid Computing Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Quantum Computing & Future Computing Technologies",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Quantum Computing Practitioner",
    sdgs: [4, 9, 16],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Explore the intersection of quantum computing with machine learning and advanced cryptography.",
    outcomes: ["Develop hybrid AI-Quantum models", "Implement post-quantum cryptography concepts", "Optimize complex systems"],
    competencies: ["Quantum Machine Learning", "Quantum Cryptography", "Hybrid Quantum-Classical Computing", "Quantum Optimization", "Research Skills", "Critical Thinking", "Innovation"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Quantum Machine Learning, Quantum Cryptography & Hybrid Computing",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Quantum Machine Learning, Quantum Cryptography & Hybrid Computing",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 20,
    maxEnrollment: 50,
    faculty: "Prof. Quantum AI",
  },
  {
    id: "TECH-QC-004",
    code: "TECH-QC-004",
    name: "Quantum Systems Architecture & Future Computing Leadership Programme",
    domain: "TEC",
    level: "leader",
    pack: "Quantum Computing & Future Computing Technologies",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Quantum Technologies Leader",
    sdgs: [8, 9, 16],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Lead the development of quantum system architectures and pioneer future computing initiatives.",
    outcomes: ["Architect quantum computing solutions", "Lead scientific computing projects", "Strategize enterprise quantum adoption"],
    competencies: ["Quantum Systems Architecture", "Technology Leadership", "Future Computing Strategy", "Project Management", "Strategic Planning", "Innovation Leadership", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Quantum Systems Architecture & Future Computing Leadership",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Quantum Systems Architecture & Future Computing Leadership",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 10,
    maxEnrollment: 30,
    faculty: "Dr. Computing Architecture",
  },
  {
    id: "TECH-QC-005",
    code: "TECH-QC-005",
    name: "Global Quantum Innovation Fellowship, Research & Deep Technology Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Quantum Computing & Future Computing Technologies",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Quantum Innovation Fellow",
    sdgs: [4, 8, 9, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competitive quantum innovators capable of designing next-generation quantum computing systems, conducting high-impact research, publishing scientific papers, filing patents, launching deep-technology startups, and solving complex scientific, industrial, and societal challenges using quantum technologies.",
    outcomes: ["Design advanced quantum computing solutions", "Develop hybrid AI–Quantum applications", "Conduct publishable quantum computing research", "Integrate quantum technologies with cloud, AI, cybersecurity, and scientific computing", "File patents and technology disclosures", "Build deep-tech startups", "Lead multidisciplinary research and innovation teams", "Mentor future quantum innovators"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Quantum Innovation , Research & Deep Technology Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Quantum Innovation , Research & Deep Technology Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 5,
    maxEnrollment: 10,
    faculty: "Principal Quantum Mentor",
    competencies: ["Advanced Quantum Computing", "Quantum Research", "Deep Technology Innovation", "Technology Entrepreneurship", "Global Collaboration", "Research Leadership", "Professional Ethics", "Lifelong Learning"],
  },
  {
    id: "TECH-SPC-001",
    code: "TECH-SPC-001",
    name: "Space Technology, Satellite Systems & NewSpace Innovation Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Space Technology & Satellite Systems",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Space Technology Explorer",
    sdgs: [4, 9, 11, 13, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "To introduce students to the fundamentals of space science, satellite technology, NewSpace innovation, orbital mechanics, satellite communication, Earth observation, and space applications while developing awareness of how space technologies contribute to national development, scientific research, disaster management, agriculture, climate monitoring, and sustainable development.",
    outcomes: ["Explain the fundamentals of space technology", "Understand satellite systems and orbital mechanics", "Identify different types of satellites", "Explain satellite communication principles", "Understand Earth observation technologies", "Recognize India's achievements in space exploration", "Appreciate ethical and sustainable uses of space technology"],
    competencies: ["Space Technology Fundamentals", "Satellite Systems", "Orbital Mechanics Basics", "Scientific Thinking", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to Space Technology, Satellite Systems & NewSpace Innovation and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Space Technology, Satellite Systems & NewSpace Innovation",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Space Technology Mentor"
  },
  {
    id: "TECH-SPC-002",
    code: "TECH-SPC-002",
    name: "Satellite Design, Remote Sensing & Space Applications Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Space Technology & Satellite Systems",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Satellite Systems Developer",
    sdgs: [2, 6, 9, 11, 13, 15],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "To develop practical competencies in satellite subsystem design, remote sensing, Earth observation, GIS integration, satellite communication fundamentals, and geospatial applications for solving real-world problems related to agriculture, water resources, infrastructure, climate, disaster management, and rural development.",
    outcomes: ["Understand satellite subsystem architecture", "Design conceptual satellite payloads", "Interpret satellite imagery", "Apply remote sensing principles", "Integrate satellite data with GIS", "Develop Earth observation applications", "Evaluate satellite mission requirements"],
    competencies: ["Satellite Design", "Remote Sensing", "Space Mission Planning", "Earth Observation", "Geospatial Analysis", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to Satellite Design, Remote Sensing & Space Applications and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Satellite Design, Remote Sensing & Space Applications",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Space Technology Mentor"
  },
  {
    id: "TECH-SPC-003",
    code: "TECH-SPC-003",
    name: "Space Robotics, Earth Observation & Satellite Data Analytics Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Space Technology & Satellite Systems",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Space Technology Practitioner",
    sdgs: [2, 6, 9, 11, 13, 15],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "To enable students to integrate satellite data, artificial intelligence, robotics, remote sensing, and geospatial intelligence to develop advanced applications for agriculture, environmental monitoring, climate resilience, disaster management, infrastructure planning, and future space exploration.",
    outcomes: ["Analyze multi-source satellite datasets", "Develop AI-assisted Earth observation solutions", "Apply satellite analytics to real-world challenges", "Understand concepts of robotic systems used in space exploration", "Design intelligent geospatial decision-support systems", "Integrate remote sensing with AI and GIS", "Evaluate space technology solutions for sustainability"],
    competencies: ["Space Robotics", "Satellite Data Analytics", "Earth Observation", "Computer Vision", "Scientific Computing", "Research Skills", "Innovation"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Space Robotics, Earth Observation & Satellite Data Analytics",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Space Robotics, Earth Observation & Satellite Data Analytics",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Space Technology Mentor"
  },
  {
    id: "TECH-SPC-004",
    code: "TECH-SPC-004",
    name: "Space Mission Design, NewSpace Leadership & Aerospace Systems Programme",
    domain: "TEC",
    level: "leader",
    pack: "Space Technology & Satellite Systems",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Space Mission Leader",
    sdgs: [4, 9, 11, 13, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "To prepare students to lead end-to-end space mission planning by integrating satellite engineering, mission analysis, aerospace systems, NewSpace entrepreneurship, Earth observation, artificial intelligence, and systems engineering while addressing global challenges through innovative space technologies.",
    outcomes: ["Design complete satellite mission architectures", "Develop satellite payload concepts", "Plan launch and mission operations", "Evaluate mission feasibility and risk", "Lead multidisciplinary aerospace projects", "Apply systems engineering principles", "Develop strategic NewSpace business opportunities"],
    competencies: ["Space Mission Design", "Aerospace Systems", "Technology Leadership", "Strategic Planning", "Systems Engineering", "Project Management", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Space Mission Design, NewSpace Leadership & Aerospace Systems",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Space Mission Design, NewSpace Leadership & Aerospace Systems",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 30,
    faculty: "Space Technology Mentor"
  },
  {
    id: "TECH-SPC-005",
    code: "TECH-SPC-005",
    name: "Global Space Innovation Fellowship, Research & Aerospace Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Space Technology & Satellite Systems",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Space Innovation Fellow",
    sdgs: [2, 6, 9, 11, 13, 15, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competitive aerospace innovators capable of designing satellite missions, conducting advanced space research, developing Earth observation solutions, publishing scientific papers, filing patents, launching NewSpace startups, and addressing global challenges through space technologies.",
    outcomes: ["Design complete space missions", "Develop advanced satellite systems", "Integrate AI, GIS, IoT, and satellite technologies", "Conduct publishable aerospace research", "Develop commercial NewSpace products", "File patents and technology disclosures", "Build aerospace startups", "Mentor future space innovators"],
    competencies: ["Space Research", "Aerospace Innovation", "Technology Entrepreneurship", "Research Leadership", "Global Collaboration", "Technology Commercialization", "Professional Ethics", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Space Innovation , Research & Aerospace Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Space Innovation , Research & Aerospace Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 10,
    faculty: "Principal Space Technology Mentor"
  },
  {
    id: "TECH-BIO-001",
    code: "TECH-BIO-001",
    name: "Biotechnology, Bioinformatics & Synthetic Biology Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Biotechnology, Bioinformatics & Synthetic Biology",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Biotechnology Explorer",
    sdgs: [2, 3, 4, 9, 12, 15],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "To introduce students to the fundamentals of biotechnology, molecular biology, genetics, bioinformatics, synthetic biology, and biotechnology innovation while developing awareness of how biological sciences contribute to healthcare, agriculture, environmental sustainability, food security, industrial biotechnology, and rural development.",
    outcomes: ["Explain the fundamentals of biotechnology", "Understand DNA, RNA, proteins, and genes", "Describe basic molecular biology techniques", "Understand bioinformatics and biological databases", "Explain synthetic biology concepts", "Identify biotechnology applications across multiple sectors", "Appreciate ethical, biosafety, and biosecurity considerations"],
    competencies: ["Biotechnology Fundamentals", "Bioinformatics Basics", "Molecular Biology", "Scientific Thinking", "Laboratory Safety"],
  syllabus: [
    "Module 1: Introduction to Biotechnology, Bioinformatics & Synthetic Biology and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Biotechnology, Bioinformatics & Synthetic Biology",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Biotechnology Mentor"
  },
  {
    id: "TECH-MFG-001",
    code: "TECH-MFG-001",
    name: "Advanced Manufacturing, Industry 4.0 & Smart Factories Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Advanced Manufacturing, Industry 4.0 & Smart Factories",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Advanced Manufacturing Explorer",
    sdgs: [8, 9, 11, 12, 13],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "To introduce students to modern manufacturing systems, Industry 4.0 technologies, smart factories, automation, robotics, additive manufacturing, industrial Internet of Things (IIoT), digital twins, cyber-physical systems, and sustainable manufacturing while developing awareness of future industrial ecosystems.",
    outcomes: ["Explain Industry 4.0 concepts", "Understand smart factory architecture", "Describe modern manufacturing systems", "Identify Industry 4.0 technologies", "Understand digital manufacturing workflows", "Recognize sustainable manufacturing practices", "Appreciate ethical and environmental responsibilities in manufacturing"],
    competencies: ["Manufacturing Fundamentals", "Industry 4.0", "Automation Basics", "Quality Awareness", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to Manufacturing, Industry 4.0 & Smart Factories and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Manufacturing, Industry 4.0 & Smart Factories",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Faculty Mentor"
  },
  {
    id: "TECH-MFG-002",
    code: "TECH-MFG-002",
    name: "Digital Manufacturing, CAD/CAM, CNC & Industrial Automation Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Advanced Manufacturing, Industry 4.0 & Smart Factories",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Digital Manufacturing Developer",
    sdgs: [8, 9, 11, 12],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "To develop practical competencies in digital product design, CAD/CAM technologies, CNC machining concepts, programmable logic controllers (PLCs), industrial automation, robotics integration, and smart manufacturing workflows that enhance productivity, quality, and operational efficiency.",
    outcomes: ["Design engineering components using CAD principles", "Understand CAM workflows", "Explain CNC machining operations", "Develop basic PLC logic", "Understand industrial automation architecture", "Integrate digital manufacturing concepts", "Evaluate manufacturing efficiency improvements"],
    competencies: ["CAD/CAM", "CNC Programming", "Industrial Automation", "Manufacturing Processes", "Technical Drawing", "Documentation"],
  syllabus: [
    "Module 1: Introduction to Digital Manufacturing, CAD/CAM, CNC & Industrial Automation and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Digital Manufacturing, CAD/CAM, CNC & Industrial Automation",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Manufacturing Engineering Mentor"
  },
  {
    id: "TECH-MFG-003",
    code: "TECH-MFG-003",
    name: "Industrial IoT, Digital Twins & Intelligent Manufacturing Systems Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Advanced Manufacturing, Industry 4.0 & Smart Factories",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Smart Manufacturing Practitioner",
    sdgs: [8, 9, 11, 12, 13],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "To enable students to integrate Industrial Internet of Things (IIoT), digital twins, artificial intelligence, cloud computing, robotics, sensor networks, and predictive analytics to design intelligent manufacturing systems capable of improving productivity, quality, efficiency, and sustainability.",
    outcomes: ["Design Industrial IoT architectures", "Integrate sensors with manufacturing systems", "Develop digital twin models", "Apply AI for predictive maintenance", "Analyze real-time manufacturing data", "Optimize industrial production processes", "Design intelligent manufacturing solutions"],
    competencies: ["Industrial IoT", "Digital Twin Technology", "Manufacturing Analytics", "Predictive Maintenance", "System Integration", "Innovation", "Critical Thinking"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Industrial IoT, Digital Twins & Intelligent Manufacturing Systems",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Industrial IoT, Digital Twins & Intelligent Manufacturing Systems",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Industrial Automation Mentor"
  },
  {
    id: "TECH-MFG-004",
    code: "TECH-MFG-004",
    name: "Smart Factory Leadership, Lean Manufacturing & Industrial Innovation Programme",
    domain: "TEC",
    level: "leader",
    pack: "Advanced Manufacturing, Industry 4.0 & Smart Factories",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Smart Factory Innovation Leader",
    sdgs: [8, 9, 11, 12, 13],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "To prepare students to lead digital manufacturing transformation by integrating Lean Manufacturing, Industry 4.0 technologies, industrial automation, Industrial IoT, artificial intelligence, digital twins, sustainability, operational excellence, and Industry 5.0 principles into future-ready manufacturing enterprises.",
    outcomes: ["Lead smart factory transformation initiatives", "Apply Lean Manufacturing principles", "Understand Six Sigma quality improvement methodologies", "Design intelligent manufacturing ecosystems", "Optimize production using AI and analytics", "Lead multidisciplinary manufacturing innovation teams", "Develop sustainable industrial strategies"],
    competencies: ["Lean Manufacturing", "Smart Factory Management", "Operational Excellence", "Leadership", "Strategic Planning", "Quality Management", "Stakeholder Coordination"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Smart Factory Leadership, Lean Manufacturing & Industrial Innovation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Smart Factory Leadership, Lean Manufacturing & Industrial Innovation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Manufacturing Innovation Mentor"
  },
  {
    id: "TECH-MFG-005",
    code: "TECH-MFG-005",
    name: "Global Advanced Manufacturing Fellowship, Research & Industry 5.0 Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Advanced Manufacturing, Industry 4.0 & Smart Factories",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Industry 5.0 Innovation Fellow",
    sdgs: [8, 9, 11, 12, 13, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competitive manufacturing innovators capable of designing intelligent factories, integrating AI, robotics, Industrial IoT, digital twins, additive manufacturing, and Industry 5.0 technologies while creating scalable industrial solutions, research outcomes, patents, and globally competitive manufacturing startups.",
    outcomes: ["Design Industry 5.0 manufacturing ecosystems", "Develop AI-enabled manufacturing solutions", "Integrate IIoT, robotics, and digital twins", "Conduct publishable manufacturing research", "Develop commercially viable manufacturing products", "File patents and technology disclosures", "Launch manufacturing technology startups", "Mentor future manufacturing innovators"],
    competencies: ["Industry 5.0", "Manufacturing Research", "Innovation Leadership", "Technology Commercialization", "Entrepreneurship", "Global Collaboration", "Professional Ethics", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global  Manufacturing , Research & Industry 5.0 Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global  Manufacturing , Research & Industry 5.0 Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 10,
    faculty: "Principal Manufacturing Mentor"
  },
  {
    id: "TECH-REN-001",
    code: "TECH-REN-001",
    name: "Renewable Energy, Smart Grids & Sustainable Energy Systems Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Renewable Energy, Smart Grids & Sustainable Energy Systems",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Renewable Energy Explorer",
    sdgs: [7, 9, 11, 12, 13],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "To introduce students to renewable energy technologies, sustainable energy systems, smart grids, energy conservation, clean energy innovation, climate-resilient infrastructure, and the role of renewable energy in achieving energy security, environmental sustainability, and inclusive economic development.",
    outcomes: ["Explain the fundamentals of renewable energy", "Identify various renewable energy sources", "Understand smart grid concepts", "Explain sustainable energy practices", "Analyze energy consumption patterns", "Appreciate clean energy technologies", "Recognize the importance of climate action and energy conservation"],
    competencies: ["Renewable Energy Fundamentals", "Smart Grid Basics", "Sustainability", "Energy Awareness", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to Renewable Energy, Smart Grids & Sustainable Energy Systems and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Renewable Energy, Smart Grids & Sustainable Energy Systems",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Renewable Energy Mentor"
  },
  {
    id: "TECH-REN-002",
    code: "TECH-REN-002",
    name: "Solar, Wind, Bioenergy & Energy Storage Technologies Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Renewable Energy, Smart Grids & Sustainable Energy Systems",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Renewable Energy System Developer",
    sdgs: [7, 8, 9, 11, 13],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "To develop practical competencies in solar photovoltaic (PV) systems, wind energy technologies, bioenergy systems, battery energy storage systems (BESS), hybrid renewable energy systems, and clean-energy design for residential, commercial, industrial, and rural applications.",
    outcomes: ["Design basic solar PV systems", "Understand wind turbine operation", "Explain bioenergy conversion technologies", "Evaluate battery energy storage systems", "Design hybrid renewable energy systems", "Perform renewable energy feasibility studies", "Recommend sustainable energy solutions"],
    competencies: ["Solar Energy Systems", "Wind Energy", "Bioenergy", "Energy Storage", "Energy System Design", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to Solar, Wind, Bioenergy & Energy Storage Technologies and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Solar, Wind, Bioenergy & Energy Storage Technologies",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Renewable Energy Mentor"
  },
  {
    id: "TECH-REN-003",
    code: "TECH-REN-003",
    name: "Smart Grids, Energy Analytics & Intelligent Power Systems Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Renewable Energy, Smart Grids & Sustainable Energy Systems",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Smart Energy Systems Practitioner",
    sdgs: [7, 9, 11, 12, 13],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "To enable students to integrate smart grids, IoT, artificial intelligence, digital twins, cloud computing, battery energy storage systems, renewable energy integration, and predictive analytics for designing intelligent, resilient, and sustainable power systems.",
    outcomes: ["Design smart grid architectures", "Integrate renewable energy into power systems", "Develop IoT-enabled energy monitoring systems", "Apply AI for energy forecasting and optimization", "Design intelligent microgrids", "Analyze energy consumption patterns", "Optimize power system performance"],
    competencies: ["Smart Grid Technologies", "Energy Analytics", "Power System Automation", "Grid Optimization", "Data Analysis", "Innovation", "Critical Thinking"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Smart Grids, Energy Analytics & Intelligent Power Systems",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Smart Grids, Energy Analytics & Intelligent Power Systems",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Faculty Mentor"
  },
  {
    id: "TECH-REN-004",
    code: "TECH-REN-004",
    name: "Sustainable Energy Leadership, Energy Policy & Green Innovation Programme",
    domain: "TEC",
    level: "leader",
    pack: "Renewable Energy, Smart Grids & Sustainable Energy Systems",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Sustainable Energy Innovation Leader",
    sdgs: [7, 8, 9, 11, 12, 13, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "To prepare students to lead clean energy transitions by integrating renewable energy technologies, smart grids, climate resilience, sustainable energy policy, carbon management, green entrepreneurship, and community energy planning into innovative solutions for industries and rural communities.",
    outcomes: ["Develop sustainable energy transition strategies", "Evaluate renewable energy policies", "Design climate-resilient energy systems", "Lead multidisciplinary green innovation projects", "Conduct carbon footprint assessments", "Develop clean energy business models", "Promote community participation in energy sustainability"],
    competencies: ["Energy Leadership", "Energy Policy", "Green Innovation", "Strategic Planning", "Stakeholder Management", "Project Leadership", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Sustainable Energy Leadership, Energy Policy & Green Innovation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Sustainable Energy Leadership, Energy Policy & Green Innovation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Faculty Mentor"
  },
  {
    id: "TECH-REN-005",
    code: "TECH-REN-005",
    name: "Global Renewable Energy Innovation Fellowship, Research & Clean Energy Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Renewable Energy, Smart Grids & Sustainable Energy Systems",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Renewable Energy Innovation Fellow",
    sdgs: [7, 8, 9, 11, 12, 13, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competitive clean-energy innovators capable of designing next-generation renewable energy systems, integrating artificial intelligence with smart grids, conducting impactful research, creating commercially viable green technologies, filing patents, and launching clean-energy startups that accelerate sustainable development.",
    outcomes: ["Design integrated renewable energy systems", "Develop AI-enabled energy management platforms", "Build resilient microgrid solutions", "Conduct publishable renewable energy research", "Develop commercially viable clean-energy products", "File patents and technology disclosures", "Launch renewable energy startups", "Mentor future clean-energy innovators"],
    competencies: ["Renewable Energy Research", "Clean Energy Innovation", "Energy Entrepreneurship", "Technology Commercialization", "Global Collaboration", "Leadership", "Professional Ethics", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Renewable Energy Innovation , Research & Clean Energy Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Renewable Energy Innovation , Research & Clean Energy Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 10,
    faculty: "Principal Renewable Energy Mentor"
  },
  {
    id: "TECH-DHL-001",
    code: "TECH-DHL-001",
    name: "Digital Health, Telemedicine & Health Informatics Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Digital Health, Telemedicine & Health Informatics",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Digital Health Explorer",
    sdgs: [3, 4, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "To introduce students to digital healthcare ecosystems, telemedicine, electronic health records, health informatics, wearable technologies, medical Internet of Things (IoMT), healthcare analytics, and digital public health while promoting technology-enabled, accessible, and patient-centered healthcare services.",
    outcomes: ["Explain digital health concepts", "Understand telemedicine systems", "Describe electronic health records", "Explain health informatics fundamentals", "Understand wearable healthcare technologies", "Appreciate digital public health initiatives", "Recognize ethical, legal, and privacy considerations in digital healthcare"],
    competencies: ["Digital Health Fundamentals", "Health Informatics", "Telemedicine", "Healthcare Technology", "Ethical Practice"],
  syllabus: [
    "Module 1: Introduction to Digital Health, Telemedicine & Health Informatics and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Digital Health, Telemedicine & Health Informatics",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Digital Health Mentor"
  },
  {
    id: "TECH-DHL-002",
    code: "TECH-DHL-002",
    name: "Electronic Health Records, Healthcare Data Analytics & Medical IoT Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Digital Health, Telemedicine & Health Informatics",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Healthcare Information Systems Developer",
    sdgs: [3, 4, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "To develop practical competencies in electronic health records (EHR), healthcare information systems (HIS), hospital management systems (HMS), healthcare data analytics, medical Internet of Things (IoMT), interoperability standards, and digital healthcare workflows for improving patient care, operational efficiency, and evidence-based healthcare delivery.",
    outcomes: ["Understand electronic health record architecture", "Manage healthcare information securely", "Analyze healthcare datasets", "Understand medical IoT devices and sensors", "Explain healthcare interoperability concepts", "Design digital patient management workflows", "Apply healthcare analytics for decision-making"],
    competencies: ["Electronic Health Records", "Healthcare Analytics", "Medical IoT", "Health Data Management", "Problem Solving", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to Electronic Health Records, Healthcare Data Analytics & Medical IoT and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Electronic Health Records, Healthcare Data Analytics & Medical IoT",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Digital Health Mentor"
  },
  {
    id: "TECH-DHL-003",
    code: "TECH-DHL-003",
    name: "AI in Healthcare, Clinical Decision Support & Precision Digital Health Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Digital Health, Telemedicine & Health Informatics",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "AI Healthcare Practitioner",
    sdgs: [3, 4, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "To enable students to integrate artificial intelligence, machine learning, clinical decision support systems, healthcare analytics, wearable technologies, precision digital health, and predictive healthcare models to improve healthcare quality, accessibility, and evidence-based clinical decision-making.",
    outcomes: ["Understand AI applications in healthcare", "Design clinical decision support systems", "Analyze healthcare datasets using AI", "Develop predictive healthcare models", "Integrate wearable health monitoring devices", "Build precision digital health solutions", "Apply ethical principles in AI-enabled healthcare"],
    competencies: ["AI in Healthcare", "Clinical Decision Support", "Precision Medicine", "Healthcare Analytics", "Machine Learning", "Research Skills", "Innovation"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of AI in Healthcare, Clinical Decision Support & Precision Digital Health",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AI in Healthcare, Clinical Decision Support & Precision Digital Health",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Healthcare AI Mentor"
  },
  {
    id: "TECH-DHL-004",
    code: "TECH-DHL-004",
    name: "Digital Health Leadership, Healthcare Innovation & Hospital Transformation Programme",
    domain: "TEC",
    level: "leader",
    pack: "Digital Health, Telemedicine & Health Informatics",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Digital Health Innovation Leader",
    sdgs: [3, 4, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "To prepare students to lead digital healthcare transformation by integrating artificial intelligence, health informatics, telemedicine, medical IoT, hospital information systems, healthcare analytics, digital public health, healthcare quality improvement, and innovation management for resilient, patient-centered healthcare systems.",
    outcomes: ["Lead digital transformation initiatives in healthcare", "Design patient-centric digital healthcare systems", "Evaluate healthcare innovation strategies", "Improve hospital operational efficiency", "Develop digital public health programmes", "Lead multidisciplinary healthcare innovation teams", "Build sustainable HealthTech business models"],
    competencies: ["Healthcare Leadership", "Digital Transformation", "Hospital Informatics", "Strategic Planning", "Innovation Management", "Stakeholder Management", "Ethical Leadership"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Digital Health Leadership, Healthcare Innovation & Hospital Transformation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Digital Health Leadership, Healthcare Innovation & Hospital Transformation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Digital Health Mentor"
  },
  {
    id: "TECH-DHL-005",
    code: "TECH-DHL-005",
    name: "Global Digital Health Innovation Fellowship, Research & HealthTech Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Digital Health, Telemedicine & Health Informatics",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Digital Health Innovation Fellow",
    sdgs: [3, 4, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competitive digital health innovators capable of designing intelligent healthcare systems, integrating artificial intelligence with health informatics, conducting impactful research, filing patents, creating scalable HealthTech startups, and improving healthcare accessibility, quality, affordability, and public health outcomes.",
    outcomes: ["Design integrated digital healthcare ecosystems", "Develop AI-enabled healthcare platforms", "Build intelligent telemedicine solutions", "Conduct publishable digital health research", "Develop commercially viable HealthTech products", "File patents and technology disclosures", "Launch HealthTech startups", "Mentor future digital healthcare innovators"],
    competencies: ["HealthTech Research", "Digital Health Innovation", "Healthcare Entrepreneurship", "Technology Commercialization", "Global Collaboration", "Research Leadership", "Professional Ethics", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Digital Health Innovation , Research & HealthTech Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Digital Health Innovation , Research & HealthTech Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 10,
    faculty: "Principal Digital Health Mentor"
  },
  {
    id: "TECH-AGR-001",
    code: "TECH-AGR-001",
    name: "AgriTech, Precision Farming & Food Systems Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "AgriTech, Precision Farming & Food Systems Innovation",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "AgriTech Explorer",
    sdgs: [2, 6, 8, 12, 13, 15],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "To introduce students to modern agriculture technologies, precision farming, climate-smart agriculture, sustainable food systems, digital agriculture, smart irrigation, soil health management, and agricultural innovation while promoting food security, environmental sustainability, and rural prosperity.",
    outcomes: ["Explain AgriTech fundamentals", "Understand precision farming concepts", "Identify modern agricultural technologies", "Explain sustainable food systems", "Understand climate-smart agriculture", "Recognize digital agriculture applications", "Appreciate the importance of food security and sustainable farming"],
    competencies: ["Agriculture Fundamentals", "Precision Farming", "Digital Agriculture", "Sustainability", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to AgriTech, Precision Farming & Food Systems and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AgriTech, Precision Farming & Food Systems",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Agriculture Mentor"
  },
  {
    id: "TECH-AGR-002",
    code: "TECH-AGR-002",
    name: "Smart Agriculture, IoT Farming & GIS-Based Crop Management Programme",
    domain: "TEC",
    level: "foundation",
    pack: "AgriTech, Precision Farming & Food Systems Innovation",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Smart Agriculture System Developer",
    sdgs: [2, 6, 8, 9, 12, 13, 15],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "To develop practical competencies in Internet of Things (IoT)-enabled agriculture, GIS-based crop management, precision irrigation, environmental sensing, smart greenhouse technologies, farm automation, and digital farm management for improving agricultural productivity, sustainability, and climate resilience.",
    outcomes: ["Design IoT-enabled smart farming systems", "Understand GIS applications in agriculture", "Monitor crop and soil conditions using sensors", "Develop automated irrigation systems", "Analyze agricultural data for decision-making", "Design digital farm management solutions", "Apply sustainable precision farming techniques"],
    competencies: ["IoT in Agriculture", "GIS Mapping", "Sensor Integration", "Crop Monitoring", "Agricultural Data Analysis", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to Smart Agriculture, IoT Farming & GIS-Based Crop Management and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Smart Agriculture, IoT Farming & GIS-Based Crop Management",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Agriculture Technology Mentor"
  },
  {
    id: "TECH-AGR-003",
    code: "TECH-AGR-003",
    name: "AI, Drone Agriculture & Precision Farming Analytics Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "AgriTech, Precision Farming & Food Systems Innovation",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "AI Precision Agriculture Practitioner",
    sdgs: [2, 6, 8, 9, 12, 13, 15],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "To enable students to integrate Artificial Intelligence (AI), drone technology, remote sensing, GIS, IoT, machine learning, and precision farming analytics for designing intelligent agricultural systems that improve crop productivity, optimize resource utilization, reduce environmental impact, and strengthen food security.",
    outcomes: ["Develop AI-enabled crop monitoring systems", "Analyze drone imagery for agriculture", "Predict crop yield using AI models", "Detect crop diseases through computer vision", "Design precision farming decision-support systems", "Optimize irrigation and fertilizer application", "Build intelligent farm management solutions"],
    competencies: ["AI in Agriculture", "Drone Operations", "Precision Agriculture", "Agricultural Data Analytics", "Machine Learning Applications", "Decision Support", "Innovation"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of AI, Drone Agriculture & Precision Farming Analytics",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AI, Drone Agriculture & Precision Farming Analytics",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "AgriTech Innovation Mentor"
  },
  {
    id: "TECH-POL-002",
    code: "TECH-POL-002",
    name: "Emerging Technology Policy, Ethics & Regulatory Innovation Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Technology Policy, Digital Leadership, Innovation Management & Future Governance",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Technology Governance Professional",
    sdgs: [4, 8, 9, 10, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "To develop practical competencies in emerging technology policy, digital ethics, artificial intelligence governance, cybersecurity regulation, data protection, intellectual property management, regulatory innovation, digital rights, and responsible technology governance for public institutions, industries, startups, and society.",
    outcomes: ["Analyze emerging technology policies", "Understand AI governance frameworks", "Apply digital ethics principles", "Interpret cybersecurity and privacy regulations", "Develop responsible technology governance models", "Design regulatory innovation strategies", "Evaluate technology risks and societal impacts"],
    competencies: ["Technology Ethics", "Regulatory Frameworks", "Policy Analysis", "Governance", "Risk Assessment", "Technical Writing"],
  syllabus: [
    "Module 1: Introduction to Emerging Technology Policy, Ethics & Regulatory Innovation and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Emerging Technology Policy, Ethics & Regulatory Innovation",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Faculty Mentor"
  },
  {
    id: "TECH-POL-003",
    code: "TECH-POL-003",
    name: "AI Governance, Responsible Innovation & Strategic Technology Foresight Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Technology Policy, Digital Leadership, Innovation Management & Future Governance",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "AI Governance & Policy Practitioner",
    sdgs: [4, 8, 9, 10, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "To enable students to integrate Artificial Intelligence governance, responsible innovation, strategic technology foresight, policy analytics, technology risk assessment, digital trust, ethical AI, and long-term innovation planning for governments, industries, universities, startups, and Smart Village ecosystems.",
    outcomes: ["Design AI governance frameworks", "Conduct strategic technology foresight studies", "Develop responsible innovation policies", "Analyze technology risks and societal impacts", "Create long-term technology roadmaps", "Integrate ethical AI into organizational governance", "Support evidence-based technology policymaking"],
    competencies: ["AI Governance", "Responsible Innovation", "Technology Foresight", "Strategic Analysis", "Policy Development", "Research Skills", "Ethical Decision Making"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of AI Governance, Responsible Innovation & Strategic Technology Foresight",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AI Governance, Responsible Innovation & Strategic Technology Foresight",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "AI Governance Mentor"
  },
  {
    id: "TECH-POL-004",
    code: "TECH-POL-004",
    name: "Global Technology Leadership, Innovation Strategy & Public Policy Programme",
    domain: "TEC",
    level: "leader",
    pack: "Technology Policy, Digital Leadership, Innovation Management & Future Governance",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Global Technology Leadership Professional",
    sdgs: [4, 8, 9, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "To prepare students to become strategic technology leaders capable of designing innovation strategies, technology policies, AI governance frameworks, digital public infrastructure initiatives, startup ecosystems, and national technology roadmaps while contributing to sustainable development and global digital transformation.",
    outcomes: ["Lead technology-driven public innovation", "Develop national and institutional technology strategies", "Design digital governance frameworks", "Formulate innovation policies", "Lead multidisciplinary technology teams", "Build sustainable innovation ecosystems", "Promote responsible technology leadership"],
    competencies: ["Technology Leadership", "Innovation Strategy", "Public Policy", "Stakeholder Engagement", "Strategic Planning", "Global Governance", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Technology Leadership, Innovation Strategy & Public Policy",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Technology Leadership, Innovation Strategy & Public Policy",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Faculty Mentor"
  },
  {
    id: "TECH-POL-005",
    code: "TECH-POL-005",
    name: "Distinguished Global Technology Policy Fellowship, Research & Innovation Leadership Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Technology Policy, Digital Leadership, Innovation Management & Future Governance",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Global Technology Policy Fellow",
    sdgs: [4, 8, 9, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competitive technology leaders capable of shaping future technology policies, leading responsible innovation ecosystems, influencing public policy, building sustainable startups, conducting internationally recognized research, and driving national and global digital transformation aligned with ethical governance and societal well-being.",
    outcomes: ["Develop national and international technology policies", "Lead responsible innovation ecosystems", "Design AI and emerging technology governance frameworks", "Conduct high-impact interdisciplinary research", "File patents and technology disclosures", "Build globally scalable technology ventures", "Advise governments and institutions on digital transformation", "Mentor future technology leaders"],
    competencies: ["Technology Policy Research", "Innovation Leadership", "Global Technology Governance", "Strategic Consulting", "Technology Commercialization", "Research Communication", "Visionary Leadership", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Distinguished Global Technology Policy , Research & Innovation Leadership",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Distinguished Global Technology Policy , Research & Innovation Leadership",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 10,
    faculty: "Chief Fellowship Mentor"
  },
  {
    id: "TECH-BIO-002",
    code: "TECH-BIO-002",
    name: "Genomics, Bioinformatics & Molecular Data Analysis Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Biotechnology, Bioinformatics & Synthetic Biology",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Bioinformatics Analyst",
    sdgs: [2, 3, 4, 9, 12, 15],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "To develop practical competencies in genomics, DNA sequencing concepts, bioinformatics tools, molecular databases, computational biology, biological data analysis, and AI-assisted genomic interpretation for healthcare, agriculture, environmental science, and biotechnology innovation.",
    outcomes: ["Understand genome organization and sequencing technologies", "Explore biological and genomic databases", "Perform basic sequence analysis", "Apply bioinformatics tools to biological problems", "Interpret molecular and genomic datasets", "Understand AI-assisted genomic analysis", "Develop computational biology solutions"],
    competencies: ["Genomics", "Bioinformatics", "Biological Data Analysis", "Sequence Analysis", "Research Skills", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to Genomics, Bioinformatics & Molecular Data Analysis and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Genomics, Bioinformatics & Molecular Data Analysis",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Bioinformatics Mentor"
  },
  {
    id: "TECH-BIO-003",
    code: "TECH-BIO-003",
    name: "Synthetic Biology, Precision Medicine & Computational Biotechnology Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Biotechnology, Bioinformatics & Synthetic Biology",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Computational Biotechnology Practitioner",
    sdgs: [2, 3, 9, 12, 13, 15],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "To enable students to integrate synthetic biology, computational biotechnology, artificial intelligence, bioinformatics, and precision medicine concepts to develop innovative biological solutions for healthcare, agriculture, environmental sustainability, industrial biotechnology, and personalized medicine.",
    outcomes: ["Understand synthetic biology design principles", "Apply computational biotechnology tools", "Explore precision medicine concepts", "Analyze biological systems using AI-assisted methods", "Design synthetic biological solutions (conceptual and educational)", "Integrate genomics with healthcare applications", "Evaluate biotechnology innovations ethically and responsibly"],
    competencies: ["Synthetic Biology", "Precision Medicine", "Computational Biology", "Biostatistics", "Research Methodology", "Innovation", "Critical Thinking"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Synthetic Biology, Precision Medicine & Computational Biotechnology",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Synthetic Biology, Precision Medicine & Computational Biotechnology",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Biotechnology Mentor"
  },
  {
    id: "TECH-BIO-004",
    code: "TECH-BIO-004",
    name: "Biotechnology Innovation, Bioentrepreneurship & Healthcare Leadership Programme",
    domain: "TEC",
    level: "leader",
    pack: "Biotechnology, Bioinformatics & Synthetic Biology",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Biotechnology Innovation Leader",
    sdgs: [2, 3, 8, 9, 12, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "To prepare students to lead biotechnology innovation by integrating healthcare technologies, agricultural biotechnology, industrial biotechnology, bioinformatics, entrepreneurship, regulatory awareness, and sustainable biotechnology solutions for national and global challenges.",
    outcomes: ["Develop biotechnology-based innovations", "Design healthcare biotechnology solutions", "Understand biotechnology regulations and ethics", "Build biotechnology startup models", "Lead multidisciplinary biotechnology projects", "Evaluate commercialization opportunities", "Develop sustainable biotechnology products"],
    competencies: ["Biotechnology Innovation", "Bioentrepreneurship", "Healthcare Leadership", "Strategic Planning", "Product Development", "Professional Ethics", "Stakeholder Management"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Biotechnology Innovation, Bioentrepreneurship & Healthcare Leadership",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Biotechnology Innovation, Bioentrepreneurship & Healthcare Leadership",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Biotechnology Mentor"
  },
  {
    id: "TECH-BIO-005",
    code: "TECH-BIO-005",
    name: "Global Biotechnology Innovation Fellowship, Research & Bioentrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Biotechnology, Bioinformatics & Synthetic Biology",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Biotechnology Innovation Fellow",
    sdgs: [2, 3, 6, 9, 12, 13, 15, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competitive biotechnology innovators capable of conducting advanced biological research, integrating artificial intelligence with biotechnology, publishing high-impact scientific papers, filing patents, launching biotechnology startups, and developing sustainable healthcare, agricultural, environmental, and industrial biotechnology solutions.",
    outcomes: ["Design advanced biotechnology solutions", "Integrate AI, genomics, and bioinformatics", "Conduct publishable biotechnology research", "Develop biotechnology products and services", "File patents and technology disclosures", "Build biotechnology startups", "Lead multidisciplinary biotechnology innovation teams", "Mentor future biotechnology innovators"],
    competencies: ["Biotechnology Research", "Synthetic Biology", "Innovation Leadership", "Technology Commercialization", "Bioentrepreneurship", "Global Collaboration", "Research Communication", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Biotechnology Innovation , Research & Bioentrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Biotechnology Innovation , Research & Bioentrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 10,
    faculty: "Principal Biotechnology Mentor"
  },
  {
    id: "TECH-AGR-004",
    code: "TECH-AGR-004",
    name: "AgriTech Leadership, Climate-Smart Agriculture & Agribusiness Innovation Programme",
    domain: "TEC",
    level: "leader",
    pack: "AgriTech, Precision Farming & Food Systems Innovation",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "AgriTech Innovation Leader",
    sdgs: [1, 2, 8, 12, 13, 15, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "To prepare students to become leaders in sustainable agriculture by integrating AgriTech, artificial intelligence, climate-smart farming, precision agriculture, agribusiness innovation, food value chains, rural entrepreneurship, and policy into scalable agricultural solutions that improve farmer income, food security, and environmental sustainability.",
    outcomes: ["Lead AgriTech transformation projects", "Design climate-smart farming systems", "Develop agribusiness strategies", "Evaluate agricultural value chains", "Apply sustainable farming practices", "Build farmer-centric innovation models", "Create scalable AgriTech enterprises"],
    competencies: ["Climate-Smart Agriculture", "Agribusiness Management", "Technology Leadership", "Strategic Planning", "Stakeholder Management", "Sustainable Innovation", "Decision Making"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of AgriTech Leadership, Climate-Smart Agriculture & Agribusiness Innovation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AgriTech Leadership, Climate-Smart Agriculture & Agribusiness Innovation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "AgriTech Mentor"
  },
  {
    id: "TECH-AGR-005",
    code: "TECH-AGR-005",
    name: "Global AgriTech Innovation Fellowship, Research & Agri-Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "AgriTech, Precision Farming & Food Systems Innovation",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished AgriTech Innovation Fellow",
    sdgs: [1, 2, 6, 8, 12, 13, 15, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competitive AgriTech innovators capable of designing intelligent farming systems, integrating artificial intelligence, drones, IoT, GIS, robotics, and precision agriculture technologies while conducting impactful research, creating commercially viable agricultural innovations, filing patents, and launching sustainable AgriTech enterprises.",
    outcomes: ["Design integrated smart farming ecosystems", "Develop AI-powered agricultural solutions", "Build precision agriculture platforms", "Conduct publishable AgriTech research", "Develop commercially viable agricultural products", "File patents and technology disclosures", "Launch AgriTech startups", "Mentor future agricultural innovators"],
    competencies: ["Agricultural Research", "Agri-Entrepreneurship", "Innovation Leadership", "Technology Commercialization", "Research Communication", "Global Collaboration", "Professional Ethics", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global AgriTech Innovation , Research & Agri-Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global AgriTech Innovation , Research & Agri-Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 10,
    faculty: "Principal AgriTech Mentor"
  },
  {
    id: "TECH-FIN-001",
    code: "TECH-FIN-001",
    name: "FinTech, Digital Banking & Financial Innovation Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "FinTech, Digital Banking & Financial Innovation",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "FinTech Explorer",
    sdgs: [1, 8, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "To introduce students to digital banking, FinTech ecosystems, digital payments, financial inclusion, financial literacy, blockchain-based finance, personal finance management, digital lending, and emerging financial technologies while promoting responsible financial behavior, innovation, and inclusive economic development.",
    outcomes: ["Explain FinTech fundamentals", "Understand digital banking systems", "Describe digital payment ecosystems", "Understand financial inclusion concepts", "Explain digital lending and savings models", "Appreciate financial literacy and responsible finance", "Recognize emerging financial technologies"],
    competencies: ["Financial Technology Fundamentals", "Digital Banking", "Financial Literacy", "Problem Solving", "Professional Ethics"],
  syllabus: [
    "Module 1: Introduction to FinTech, Digital Banking & Financial Innovation and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for FinTech, Digital Banking & Financial Innovation",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "FinTech Mentor"
  },
  {
    id: "TECH-FIN-002",
    code: "TECH-FIN-002",
    name: "Digital Payments, Blockchain Finance & Financial Analytics Programme",
    domain: "TEC",
    level: "foundation",
    pack: "FinTech, Digital Banking & Financial Innovation",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Digital Finance Systems Developer",
    sdgs: [1, 8, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "To develop practical competencies in digital payment systems, blockchain-enabled financial services, financial analytics, fraud detection, digital wallets, payment gateways, financial data visualization, and secure digital financial transactions for businesses, banks, MSMEs, and rural communities.",
    outcomes: ["Understand digital payment architectures", "Explain blockchain applications in finance", "Analyze financial datasets", "Design digital payment workflows", "Understand fraud detection techniques", "Build financial dashboards", "Apply secure digital financial practices"],
    competencies: ["Digital Payments", "Financial Analytics", "Blockchain Finance", "Data Analysis", "Regulatory Compliance", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to Digital Payments, Blockchain Finance & Financial Analytics and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Digital Payments, Blockchain Finance & Financial Analytics",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "FinTech Mentor"
  },
  {
    id: "TECH-FIN-003",
    code: "TECH-FIN-003",
    name: "AI in Finance, RegTech & Intelligent Financial Systems Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "FinTech, Digital Banking & Financial Innovation",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "AI Financial Systems Practitioner",
    sdgs: [1, 8, 9, 10, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "To enable students to integrate Artificial Intelligence, Machine Learning, Big Data Analytics, Regulatory Technology (RegTech), intelligent automation, fraud analytics, and predictive financial intelligence for designing secure, intelligent, and inclusive financial systems.",
    outcomes: ["Develop AI-enabled financial applications", "Design fraud detection systems", "Build intelligent credit assessment models", "Analyze financial datasets using AI", "Develop RegTech compliance solutions", "Create predictive financial decision-support systems", "Apply ethical AI principles in financial technology"],
    competencies: ["AI in Finance", "RegTech", "Financial Risk Analytics", "Machine Learning", "Fraud Detection", "Critical Thinking", "Innovation"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of AI in Finance, RegTech & Intelligent Financial Systems",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AI in Finance, RegTech & Intelligent Financial Systems",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "FinTech Mentor"
  },
  {
    id: "TECH-FIN-004",
    code: "TECH-FIN-004",
    name: "FinTech Leadership, Financial Inclusion & Digital Economy Innovation Programme",
    domain: "TEC",
    level: "leader",
    pack: "FinTech, Digital Banking & Financial Innovation",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "FinTech Innovation Leader",
    sdgs: [1, 5, 8, 9, 10, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "To prepare students to lead digital financial transformation by integrating FinTech, artificial intelligence, blockchain, digital banking, financial inclusion, digital public infrastructure, regulatory innovation, entrepreneurship, and sustainable finance into scalable financial solutions that empower individuals, businesses, and rural communities.",
    outcomes: ["Lead FinTech transformation initiatives", "Design inclusive digital financial ecosystems", "Develop financial inclusion strategies", "Evaluate digital economy policies", "Build sustainable FinTech business models", "Lead multidisciplinary innovation teams", "Promote responsible digital finance"],
    competencies: ["FinTech Strategy", "Financial Inclusion", "Leadership", "Innovation Management", "Stakeholder Management", "Business Strategy", "Ethical Leadership"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of FinTech Leadership, Financial Inclusion & Digital Economy Innovation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for FinTech Leadership, Financial Inclusion & Digital Economy Innovation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "FinTech Mentor"
  },
  {
    id: "TECH-FIN-005",
    code: "TECH-FIN-005",
    name: "Global FinTech Innovation Fellowship, Research & Financial Technology Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "FinTech, Digital Banking & Financial Innovation",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished FinTech Innovation Fellow",
    sdgs: [1, 5, 8, 9, 10, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competitive FinTech innovators capable of designing next-generation digital financial systems by integrating Artificial Intelligence, Blockchain, Digital Banking, Open Banking, Embedded Finance, Digital Public Infrastructure, Regulatory Technology (RegTech), and Financial Analytics while creating scalable financial innovations, patents, startups, and impactful financial inclusion solutions.",
    outcomes: ["Design intelligent financial ecosystems", "Develop AI-powered FinTech platforms", "Build secure blockchain financial applications", "Conduct publishable FinTech research", "Develop commercially viable financial technology products", "File patents and technology disclosures", "Launch FinTech startups", "Mentor future financial technology innovators"],
    competencies: ["FinTech Research", "Technology Commercialization", "Financial Innovation", "Entrepreneurship", "Global Collaboration", "Leadership", "Professional Ethics", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global FinTech Innovation , Research & Financial Technology Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global FinTech Innovation , Research & Financial Technology Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 10,
    faculty: "Principal FinTech Mentor"
  },
  {
    id: "TECH-SCU-001",
    code: "TECH-SCU-001",
    name: "Smart Cities, Urban Innovation & Sustainable Infrastructure Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Smart Cities, Urban Innovation & Sustainable Infrastructure",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Smart City Explorer",
    sdgs: [6, 7, 9, 11, 13, 16],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "To introduce students to smart cities, sustainable urban development, intelligent infrastructure, digital governance, urban mobility, smart utilities, waste management, water systems, energy-efficient cities, climate resilience, and citizen-centric urban innovation while promoting sustainable and inclusive communities.",
    outcomes: ["Explain smart city concepts", "Understand sustainable urban planning", "Identify intelligent infrastructure technologies", "Describe digital governance systems", "Understand smart mobility and transportation", "Explain urban sustainability principles", "Recognize the role of citizens in smart city development"],
    competencies: ["Smart City Fundamentals", "Urban Infrastructure", "Sustainability", "Digital Infrastructure", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to Smart Cities, Urban Innovation & Sustainable Infrastructure and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Smart Cities, Urban Innovation & Sustainable Infrastructure",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Faculty Mentor"
  },
  {
    id: "TECH-SCU-002",
    code: "TECH-SCU-002",
    name: "IoT for Smart Cities, Intelligent Mobility & Urban Digital Infrastructure Programme",
    domain: "TEC",
    level: "foundation",
    pack: "Smart Cities, Urban Innovation & Sustainable Infrastructure",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Smart Infrastructure Systems Developer",
    sdgs: [6, 7, 9, 11, 13, 16],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "To develop practical competencies in Internet of Things (IoT), intelligent transportation systems, smart utilities, GIS-enabled infrastructure management, urban digital infrastructure, smart street lighting, smart parking, environmental sensing, and connected public services for creating efficient, resilient, and sustainable cities.",
    outcomes: ["Design IoT-enabled smart city solutions", "Develop intelligent mobility systems", "Understand GIS-based infrastructure monitoring", "Build smart utility monitoring systems", "Integrate sensors into urban infrastructure", "Analyze urban data for decision-making", "Design connected public service platforms"],
    competencies: ["IoT for Smart Cities", "Intelligent Mobility", "Urban Data Collection", "Sensor Networks", "GIS Applications", "Technical Documentation"],
  syllabus: [
    "Module 1: Introduction to IoT for Smart Cities, Intelligent Mobility & Urban Digital Infrastructure and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for IoT for Smart Cities, Intelligent Mobility & Urban Digital Infrastructure",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Faculty Mentor"
  },
  {
    id: "TECH-SCU-003",
    code: "TECH-SCU-003",
    name: "AI, Digital Twins & Smart Urban Analytics Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "Smart Cities, Urban Innovation & Sustainable Infrastructure",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Smart Urban Analytics Practitioner",
    sdgs: [6, 7, 9, 11, 13, 16],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "To enable students to integrate Artificial Intelligence (AI), Digital Twins, Geographic Information Systems (GIS), Internet of Things (IoT), predictive analytics, remote sensing, and urban intelligence platforms for designing resilient, sustainable, and citizen-centric smart cities and Smart Village–Smart City ecosystems.",
    outcomes: ["Design AI-enabled smart city solutions", "Develop digital twins for urban infrastructure", "Analyze urban datasets using AI", "Build predictive urban analytics models", "Integrate IoT with city management systems", "Optimize urban services using data-driven decision-making", "Apply ethical AI principles in urban governance"],
    competencies: ["Digital Twin Technology", "Urban Analytics", "AI for Smart Cities", "Data Visualization", "Predictive Analytics", "System Integration", "Innovation"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of AI, Digital Twins & Smart Urban Analytics",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AI, Digital Twins & Smart Urban Analytics",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Smart City Mentor"
  },
  {
    id: "TECH-SCU-004",
    code: "TECH-SCU-004",
    name: "Smart City Leadership, Urban Governance & Sustainable Development Programme",
    domain: "TEC",
    level: "leader",
    pack: "Smart Cities, Urban Innovation & Sustainable Infrastructure",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Smart City Innovation Leader",
    sdgs: [6, 7, 9, 11, 13, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "To prepare students to become leaders in smart urban transformation by integrating artificial intelligence, digital governance, GIS, IoT, digital twins, sustainable infrastructure, citizen engagement, public policy, climate resilience, and urban innovation into scalable solutions for future-ready cities and Smart Village–Smart City ecosystems.",
    outcomes: ["Lead Smart City transformation initiatives", "Design citizen-centric urban governance systems", "Develop sustainable urban development strategies", "Integrate AI and IoT into city governance", "Design resilient public infrastructure", "Develop digital governance frameworks", "Lead multidisciplinary urban innovation teams"],
    competencies: ["Urban Governance", "Smart City Strategy", "Sustainable Development", "Leadership", "Stakeholder Management", "Strategic Planning", "Policy Implementation"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Smart City Leadership, Urban Governance & Sustainable Development",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Smart City Leadership, Urban Governance & Sustainable Development",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Smart City Mentor"
  },
  {
    id: "TECH-SCU-005",
    code: "TECH-SCU-005",
    name: "Global Smart City Innovation Fellowship, Research & Urban Technology Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "Smart Cities, Urban Innovation & Sustainable Infrastructure",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished Smart City Innovation Fellow",
    sdgs: [6, 7, 9, 11, 13, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competitive urban innovators capable of designing next-generation smart cities by integrating Artificial Intelligence, Digital Twins, IoT, GIS, intelligent infrastructure, digital governance, climate resilience, sustainable mobility, and urban analytics while creating scalable technologies, patents, startups, and citizen-centric public solutions.",
    outcomes: ["Design integrated Smart City ecosystems", "Develop AI-powered urban intelligence platforms", "Build Digital Twin solutions for infrastructure", "Conduct publishable Smart City research", "Develop commercially viable urban technology products", "File patents and technology disclosures", "Launch UrbanTech startups", "Mentor future Smart City innovators"],
    competencies: ["Urban Technology Research", "Smart Infrastructure Innovation", "Technology Entrepreneurship", "Innovation Leadership", "Global Collaboration", "Research Communication", "Professional Ethics", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global Smart City Innovation , Research & Urban Technology Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global Smart City Innovation , Research & Urban Technology Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 10,
    faculty: "Principal Smart City Mentor"
  },
  {
    id: "TECH-EDU-001",
    code: "TECH-EDU-001",
    name: "EdTech, Learning Analytics & Digital Education Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "EdTech, Learning Analytics & Digital Education Innovation",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "EdTech Explorer",
    sdgs: [4, 5, 8, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "To introduce students to Educational Technology (EdTech), digital learning ecosystems, learning management systems, learning analytics, virtual classrooms, artificial intelligence in education, personalized learning, digital content creation, and future-ready education while promoting lifelong learning and digital literacy.",
    outcomes: ["Explain the fundamentals of EdTech", "Understand digital learning ecosystems", "Use Learning Management Systems (LMS)", "Explain learning analytics concepts", "Understand personalized learning approaches", "Create basic digital educational resources", "Appreciate technology-enabled lifelong learning"],
    competencies: ["Educational Technology Fundamentals", "Digital Learning", "Learning Management Systems", "Communication", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to EdTech, Learning Analytics & Digital Education and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for EdTech, Learning Analytics & Digital Education",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "EdTech Mentor"
  },
  {
    id: "TECH-EDU-002",
    code: "TECH-EDU-002",
    name: "Learning Management Systems, Digital Content Creation & Educational Technologies Programme",
    domain: "TEC",
    level: "foundation",
    pack: "EdTech, Learning Analytics & Digital Education Innovation",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Digital Learning Systems Developer",
    sdgs: [4, 5, 8, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Communication", "Teamwork & Collaboration"],
    purpose: "To develop practical competencies in Learning Management Systems (LMS), instructional design, digital content development, virtual laboratories, interactive multimedia, digital assessments, learning analytics, and educational media production for modern education ecosystems.",
    outcomes: ["Configure and manage Learning Management Systems", "Design engaging digital learning experiences", "Develop interactive multimedia educational content", "Create online assessments and quizzes", "Build virtual learning environments", "Apply instructional design principles", "Evaluate learner engagement using analytics"],
    competencies: ["Learning Management Systems", "Instructional Design", "Digital Content Development", "Multimedia Production", "Assessment Design", "Technical Communication"],
  syllabus: [
    "Module 1: Introduction to Learning Management Systems, Digital Content Creation & Educational Technologies and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Learning Management Systems, Digital Content Creation & Educational Technologies",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "EdTech Mentor"
  },
  {
    id: "TECH-EDU-003",
    code: "TECH-EDU-003",
    name: "AI in Education, Adaptive Learning & Learning Analytics Programme",
    domain: "TEC",
    level: "practitioner",
    pack: "EdTech, Learning Analytics & Digital Education Innovation",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "AI in Education Practitioner",
    sdgs: [4, 5, 8, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "To enable students to integrate Artificial Intelligence (AI), Learning Analytics, Adaptive Learning Technologies, Natural Language Processing (NLP), intelligent tutoring systems, predictive analytics, and educational data mining to design personalized, inclusive, and evidence-based learning experiences.",
    outcomes: ["Develop AI-enabled educational applications", "Design adaptive learning environments", "Build intelligent tutoring systems", "Analyze learner performance using AI", "Develop predictive student success models", "Create personalized learning pathways", "Apply ethical AI principles in education"],
    competencies: ["AI in Education", "Learning Analytics", "Adaptive Learning Systems", "Educational Data Analysis", "Research Skills", "Innovation", "Critical Thinking"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of AI in Education, Adaptive Learning & Learning Analytics",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for AI in Education, Adaptive Learning & Learning Analytics",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "EdTech Mentor"
  },
  {
    id: "TECH-EDU-004",
    code: "TECH-EDU-004",
    name: "Educational Leadership, Digital Pedagogy & Academic Innovation Programme",
    domain: "TEC",
    level: "leader",
    pack: "EdTech, Learning Analytics & Digital Education Innovation",
    difficulty: "Advanced",
    credits: 340,
    hours: 1700,
    badge: "Educational Innovation Leader",
    sdgs: [4, 5, 8, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "To prepare students to become leaders in educational transformation by integrating Artificial Intelligence, digital pedagogy, learning analytics, curriculum innovation, assessment technologies, educational leadership, academic quality assurance, and institutional transformation into scalable educational solutions.",
    outcomes: ["Lead educational transformation initiatives", "Design innovative digital learning ecosystems", "Develop learner-centered curriculum models", "Integrate AI into teaching and assessment", "Improve academic quality through learning analytics", "Lead institutional innovation projects", "Promote inclusive and future-ready education"],
    competencies: ["Educational Leadership", "Digital Pedagogy", "Curriculum Innovation", "Strategic Planning", "Change Management", "Stakeholder Engagement", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Educational Leadership, Digital Pedagogy & Academic Innovation",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Educational Leadership, Digital Pedagogy & Academic Innovation",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Educational Leadership Mentor"
  },
  {
    id: "TECH-EDU-005",
    code: "TECH-EDU-005",
    name: "Global EdTech Innovation Fellowship, Research & Educational Technology Entrepreneurship Programme",
    domain: "TEC",
    level: "fellow",
    pack: "EdTech, Learning Analytics & Digital Education Innovation",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Distinguished EdTech Innovation Fellow",
    sdgs: [4, 5, 8, 9, 10, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "To prepare globally competitive educational technology innovators capable of designing next-generation learning ecosystems by integrating Artificial Intelligence, Learning Analytics, Adaptive Learning, Digital Pedagogy, Virtual Laboratories, Immersive Learning Technologies, Educational Data Intelligence, and Personalized Learning while creating scalable educational innovations, patents, startups, and transformative academic solutions.",
    outcomes: ["Design intelligent digital learning ecosystems", "Develop AI-powered educational platforms", "Build adaptive learning environments", "Conduct publishable EdTech research", "Develop commercially viable educational technology products", "File patents and technology disclosures", "Launch EdTech startups", "Mentor future educational innovators"],
    competencies: ["EdTech Research", "Educational Innovation", "Technology Entrepreneurship", "Product Development", "Research Communication", "Global Collaboration", "Leadership", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Global EdTech Innovation , Research & Educational Technology Entrepreneurship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Global EdTech Innovation , Research & Educational Technology Entrepreneurship",
    "Module 4: Deployment, Optimization, and Integration into existing systems",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 10,
    faculty: "Principal EdTech Mentor"
  },
  {
    id: "TECH-POL-001",
    code: "TECH-POL-001",
    name: "Technology Policy, Innovation Management & Digital Governance Foundation Programme",
    domain: "TEC",
    level: "explorer",
    pack: "Technology Policy, Digital Leadership, Innovation Management & Future Governance",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Technology Policy Explorer",
    sdgs: [4, 8, 9, 16, 17],
    ga: ["Digital Competence", "Engineering Excellence", "Lifelong Learning", "Critical Thinking"],
    purpose: "To introduce students to technology policy, digital governance, innovation management, public policy, responsible innovation, emerging technologies, intellectual property, ethical technology development, and national innovation ecosystems while preparing them to become responsible technology leaders.",
    outcomes: ["Explain technology policy fundamentals", "Understand digital governance ecosystems", "Describe innovation management principles", "Explain technology regulations and standards", "Understand intellectual property fundamentals", "Appreciate responsible innovation", "Recognize the role of technology in national development"],
    competencies: ["Technology Policy Fundamentals", "Digital Governance", "Innovation Awareness", "Critical Thinking", "Communication"],
  syllabus: [
    "Module 1: Introduction to Technology Policy, Innovation Management & Digital Governance and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Building prototypes and writing code for Technology Policy, Innovation Management & Digital Governance",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 100,
    faculty: "Technology Policy Mentor"
  },
  {
    id: "ESO-SVR-001",
    code: "ESO-SVR-001",
    name: "Village Immersion & Community Orientation Programme",
    domain: "ESO",
    level: "explorer",
    pack: "Smart Village Revolution (SVR)",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Smart Village Revolution Explorer",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Lifelong Learning", "Critical Thinking"],
    purpose: "Engage in the Village Immersion & Community Orientation Programme to develop crucial skills in Smart Village Revolution (SVR) and contribute to society.",
    outcomes: ["Understand core concepts of Smart Village Revolution (SVR)", "Apply techniques learned in Village Immersion & Community Orientation Programme"],
    competencies: ["Community Immersion", "Rural Engagement", "Communication", "Observation Skills", "Cultural Awareness"],
  syllabus: [
    "Module 1: Introduction to Village Immersion & Community Orientation and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SVR-002",
    code: "ESO-SVR-002",
    name: "Village Resource Mapping & Community Profiling",
    domain: "ESO",
    level: "foundation",
    pack: "Smart Village Revolution (SVR)",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Smart Village Revolution Foundation",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Communication", "Teamwork & Collaboration"],
    purpose: "Engage in the Village Resource Mapping & Community Profiling to develop crucial skills in Smart Village Revolution (SVR) and contribute to society.",
    outcomes: ["Understand core concepts of Smart Village Revolution (SVR)", "Apply techniques learned in Village Resource Mapping & Community Profiling"],
    competencies: ["Resource Mapping", "Community Profiling", "Survey Design", "Data Collection", "GIS Awareness", "Documentation"],
  syllabus: [
    "Module 1: Introduction to Village Resource Mapping & Community Profiling and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SVR-003",
    code: "ESO-SVR-003",
    name: "Smart Village Development Planning Programme",
    domain: "ESO",
    level: "practitioner",
    pack: "Smart Village Revolution (SVR)",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Smart Village Revolution Practitioner",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Smart Village Development Planning Programme to develop crucial skills in Smart Village Revolution (SVR) and contribute to society.",
    outcomes: ["Understand core concepts of Smart Village Revolution (SVR)", "Apply techniques learned in Smart Village Development Planning Programme"],
    competencies: ["Village Development Planning", "Participatory Planning", "Community Mobilization", "Project Design", "Leadership", "Problem Solving", "Stakeholder Engagement"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Smart Village Development Planning",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SVR-004",
    code: "ESO-SVR-004",
    name: "Smart Village Innovation Challenge",
    domain: "ESO",
    level: "leader",
    pack: "Smart Village Revolution (SVR)",
    difficulty: "Intermediate",
    credits: 340,
    hours: 1700,
    badge: "Smart Village Revolution Leader",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Engage in the Smart Village Innovation Challenge to develop crucial skills in Smart Village Revolution (SVR) and contribute to society.",
    outcomes: ["Understand core concepts of Smart Village Revolution (SVR)", "Apply techniques learned in Smart Village Innovation Challenge"],
    competencies: ["Rural Innovation", "Design Thinking", "Technology Adoption", "Project Leadership", "Innovation Management", "Communication", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Smart Village Innovation Challenge",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SVR-005",
    code: "ESO-SVR-005",
    name: "Adopt-a-Village Transformation Project",
    domain: "ESO",
    level: "innovator",
    pack: "Smart Village Revolution (SVR)",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Smart Village Revolution Innovator",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Adopt-a-Village Transformation Project to develop crucial skills in Smart Village Revolution (SVR) and contribute to society.",
    outcomes: ["Understand core concepts of Smart Village Revolution (SVR)", "Apply techniques learned in Adopt-a-Village Transformation Project"],
    competencies: ["Village Transformation", "Community Leadership", "Impact Assessment", "Strategic Planning", "Project Management", "Mentoring", "Professional Ethics", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Adopt-a-Village Transformation",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-CES-001",
    code: "ESO-CES-001",
    name: "Community Engagement & Service Learning Foundation Programme",
    domain: "ESO",
    level: "explorer",
    pack: "Community Engagement & Service Learning (CES)",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Community Engagement & Service Learning Explorer",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Lifelong Learning", "Critical Thinking"],
    purpose: "Engage in the Community Engagement & Service Learning Foundation Programme to develop crucial skills in Community Engagement & Service Learning (CES) and contribute to society.",
    outcomes: ["Understand core concepts of Community Engagement & Service Learning (CES)", "Apply techniques learned in Community Engagement & Service Learning Foundation Programme"],
    competencies: ["Community Engagement", "Social Responsibility", "Communication", "Empathy", "Teamwork"],
  syllabus: [
    "Module 1: Introduction to Community Engagement & Service Learning and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-CES-002",
    code: "ESO-CES-002",
    name: "Community Needs Assessment, Participatory Rural Appraisal & Service Learning Programme",
    domain: "ESO",
    level: "foundation",
    pack: "Community Engagement & Service Learning (CES)",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Community Engagement & Service Learning Foundation",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Communication", "Teamwork & Collaboration"],
    purpose: "Engage in the Community Needs Assessment, Participatory Rural Appraisal & Service Learning Programme to develop crucial skills in Community Engagement & Service Learning (CES) and contribute to society.",
    outcomes: ["Understand core concepts of Community Engagement & Service Learning (CES)", "Apply techniques learned in Community Needs Assessment, Participatory Rural Appraisal & Service Learning Programme"],
    competencies: ["Community Needs Assessment", "Participatory Rural Appraisal", "Field Data Collection", "Community Communication", "Documentation", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to Community Needs Assessment, Participatory Rural Appraisal & Service Learning and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-CES-003",
    code: "ESO-CES-003",
    name: "Community Project Planning & Implementation Programme",
    domain: "ESO",
    level: "practitioner",
    pack: "Community Engagement & Service Learning (CES)",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Community Engagement & Service Learning Practitioner",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Community Project Planning & Implementation Programme to develop crucial skills in Community Engagement & Service Learning (CES) and contribute to society.",
    outcomes: ["Understand core concepts of Community Engagement & Service Learning (CES)", "Apply techniques learned in Community Project Planning & Implementation Programme"],
    competencies: ["Project Planning", "Volunteer Management", "Community Mobilization", "Resource Management", "Leadership", "Collaboration", "Monitoring & Evaluation"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Community  Planning & Implementation",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-CES-004",
    code: "ESO-CES-004",
    name: "Community Leadership & Social Change Programme",
    domain: "ESO",
    level: "leader",
    pack: "Community Engagement & Service Learning (CES)",
    difficulty: "Intermediate",
    credits: 340,
    hours: 1700,
    badge: "Community Engagement & Service Learning Leader",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Engage in the Community Leadership & Social Change Programme to develop crucial skills in Community Engagement & Service Learning (CES) and contribute to society.",
    outcomes: ["Understand core concepts of Community Engagement & Service Learning (CES)", "Apply techniques learned in Community Leadership & Social Change Programme"],
    competencies: ["Community Leadership", "Social Change Management", "Stakeholder Engagement", "Conflict Resolution", "Strategic Planning", "Advocacy", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Community Leadership & Social Change",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-CES-005",
    code: "ESO-CES-005",
    name: "Community Development Capstone Project",
    domain: "ESO",
    level: "innovator",
    pack: "Community Engagement & Service Learning (CES)",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Community Engagement & Service Learning Innovator",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Community Development Capstone Project to develop crucial skills in Community Engagement & Service Learning (CES) and contribute to society.",
    outcomes: ["Understand core concepts of Community Engagement & Service Learning (CES)", "Apply techniques learned in Community Development Capstone Project"],
    competencies: ["Community Development", "Impact Assessment", "Project Leadership", "Research", "Innovation", "Mentoring", "Professional Ethics", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Community Development Capstone",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SDE-001",
    code: "ESO-SDE-001",
    name: "Environmental Awareness & Sustainability Foundation",
    domain: "ESO",
    level: "explorer",
    pack: "Sustainable Development & Environment (SDE)",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Sustainable Development & Environment Explorer",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Lifelong Learning", "Critical Thinking"],
    purpose: "Engage in the Environmental Awareness & Sustainability Foundation to develop crucial skills in Sustainable Development & Environment (SDE) and contribute to society.",
    outcomes: ["Understand core concepts of Sustainable Development & Environment (SDE)", "Apply techniques learned in Environmental Awareness & Sustainability Foundation"],
    competencies: ["Environmental Awareness", "Sustainability", "Climate Responsibility", "Resource Conservation", "Teamwork"],
  syllabus: [
    "Module 1: Introduction to Environmental Awareness & Sustainability and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SDE-002",
    code: "ESO-SDE-002",
    name: "Waste Management & Circular Economy Programme",
    domain: "ESO",
    level: "foundation",
    pack: "Sustainable Development & Environment (SDE)",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Sustainable Development & Environment Foundation",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Communication", "Teamwork & Collaboration"],
    purpose: "Engage in the Waste Management & Circular Economy Programme to develop crucial skills in Sustainable Development & Environment (SDE) and contribute to society.",
    outcomes: ["Understand core concepts of Sustainable Development & Environment (SDE)", "Apply techniques learned in Waste Management & Circular Economy Programme"],
    competencies: ["Waste Management", "Circular Economy", "Recycling Practices", "Resource Optimization", "Community Awareness", "Project Implementation"],
  syllabus: [
    "Module 1: Introduction to Waste Management & Circular Economy and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SDE-003",
    code: "ESO-SDE-003",
    name: "Biodiversity Conservation & Climate Action Programme",
    domain: "ESO",
    level: "practitioner",
    pack: "Sustainable Development & Environment (SDE)",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Sustainable Development & Environment Practitioner",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Biodiversity Conservation & Climate Action Programme to develop crucial skills in Sustainable Development & Environment (SDE) and contribute to society.",
    outcomes: ["Understand core concepts of Sustainable Development & Environment (SDE)", "Apply techniques learned in Biodiversity Conservation & Climate Action Programme"],
    competencies: ["Biodiversity Conservation", "Climate Action", "Environmental Monitoring", "Ecological Restoration", "Data Collection", "Leadership", "Problem Solving"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Biodiversity Conservation & Climate Action",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SDE-004",
    code: "ESO-SDE-004",
    name: "Sustainable Campus & Green Community Initiative",
    domain: "ESO",
    level: "leader",
    pack: "Sustainable Development & Environment (SDE)",
    difficulty: "Intermediate",
    credits: 340,
    hours: 1700,
    badge: "Sustainable Development & Environment Leader",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Engage in the Sustainable Campus & Green Community Initiative to develop crucial skills in Sustainable Development & Environment (SDE) and contribute to society.",
    outcomes: ["Understand core concepts of Sustainable Development & Environment (SDE)", "Apply techniques learned in Sustainable Campus & Green Community Initiative"],
    competencies: ["Sustainability Leadership", "Green Campus Management", "Project Coordination", "Community Mobilization", "Environmental Auditing", "Strategic Planning", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Sustainable Campus & Green Community",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SDE-005",
    code: "ESO-SDE-005",
    name: "Sustainability Leadership & Environmental Impact Project",
    domain: "ESO",
    level: "innovator",
    pack: "Sustainable Development & Environment (SDE)",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Sustainable Development & Environment Innovator",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Sustainability Leadership & Environmental Impact Project to develop crucial skills in Sustainable Development & Environment (SDE) and contribute to society.",
    outcomes: ["Understand core concepts of Sustainable Development & Environment (SDE)", "Apply techniques learned in Sustainability Leadership & Environmental Impact Project"],
    competencies: ["Environmental Leadership", "Impact Assessment", "Sustainability Strategy", "Innovation", "Policy Awareness", "Professional Ethics", "Mentoring", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Sustainability Leadership & Environmental Impact",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-HHN-001",
    code: "ESO-HHN-001",
    name: "Community Health Awareness Programme",
    domain: "ESO",
    level: "explorer",
    pack: "Health, Hygiene & Nutrition (HHN)",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Health, Hygiene & Nutrition Explorer",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Lifelong Learning", "Critical Thinking"],
    purpose: "Engage in the Community Health Awareness Programme to develop crucial skills in Health, Hygiene & Nutrition (HHN) and contribute to society.",
    outcomes: ["Understand core concepts of Health, Hygiene & Nutrition (HHN)", "Apply techniques learned in Community Health Awareness Programme"],
    competencies: ["Health Education", "Health Communication", "Preventive Healthcare", "Community Engagement", "Empathy"],
  syllabus: [
    "Module 1: Introduction to Community Health Awareness and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-HHN-002",
    code: "ESO-HHN-002",
    name: "Hygiene, Sanitation & Public Health Initiative",
    domain: "ESO",
    level: "foundation",
    pack: "Health, Hygiene & Nutrition (HHN)",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Health, Hygiene & Nutrition Foundation",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Communication", "Teamwork & Collaboration"],
    purpose: "Engage in the Hygiene, Sanitation & Public Health Initiative to develop crucial skills in Health, Hygiene & Nutrition (HHN) and contribute to society.",
    outcomes: ["Understand core concepts of Health, Hygiene & Nutrition (HHN)", "Apply techniques learned in Hygiene, Sanitation & Public Health Initiative"],
    competencies: ["Public Health", "Hygiene Promotion", "Sanitation Management", "Health Awareness Campaigns", "Community Mobilization", "Communication"],
  syllabus: [
    "Module 1: Introduction to Hygiene, Sanitation & Public Health and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-HHN-003",
    code: "ESO-HHN-003",
    name: "Nutrition & Lifestyle Improvement Programme",
    domain: "ESO",
    level: "practitioner",
    pack: "Health, Hygiene & Nutrition (HHN)",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Health, Hygiene & Nutrition Practitioner",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Nutrition & Lifestyle Improvement Programme to develop crucial skills in Health, Hygiene & Nutrition (HHN) and contribute to society.",
    outcomes: ["Understand core concepts of Health, Hygiene & Nutrition (HHN)", "Apply techniques learned in Nutrition & Lifestyle Improvement Programme"],
    competencies: ["Nutrition Education", "Healthy Lifestyle Promotion", "Health Counselling", "Community Outreach", "Program Implementation", "Problem Solving", "Leadership"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Nutrition & Lifestyle Improvement",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-HHN-004",
    code: "ESO-HHN-004",
    name: "Community Health Camp Management",
    domain: "ESO",
    level: "leader",
    pack: "Health, Hygiene & Nutrition (HHN)",
    difficulty: "Intermediate",
    credits: 340,
    hours: 1700,
    badge: "Health, Hygiene & Nutrition Leader",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Engage in the Community Health Camp Management to develop crucial skills in Health, Hygiene & Nutrition (HHN) and contribute to society.",
    outcomes: ["Understand core concepts of Health, Hygiene & Nutrition (HHN)", "Apply techniques learned in Community Health Camp Management"],
    competencies: ["Health Camp Planning", "Volunteer Management", "Healthcare Coordination", "Leadership", "Stakeholder Engagement", "Project Management", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Community Health Camp Management",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-HHN-005",
    code: "ESO-HHN-005",
    name: "Public Health Leadership Project",
    domain: "ESO",
    level: "innovator",
    pack: "Health, Hygiene & Nutrition (HHN)",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Health, Hygiene & Nutrition Innovator",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Public Health Leadership Project to develop crucial skills in Health, Hygiene & Nutrition (HHN) and contribute to society.",
    outcomes: ["Understand core concepts of Health, Hygiene & Nutrition (HHN)", "Apply techniques learned in Public Health Leadership Project"],
    competencies: ["Public Health Leadership", "Health Program Management", "Community Health Research", "Strategic Planning", "Policy Awareness", "Professional Ethics", "Mentoring", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Public Health Leadership",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-EDI-001",
    code: "ESO-EDI-001",
    name: "Adult Literacy & Learning Support Programme",
    domain: "ESO",
    level: "explorer",
    pack: "Education, Literacy & Digital Inclusion (EDI)",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Education, Literacy & Digital Inclusion Explorer",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Lifelong Learning", "Critical Thinking"],
    purpose: "Engage in the Adult Literacy & Learning Support Programme to develop crucial skills in Education, Literacy & Digital Inclusion (EDI) and contribute to society.",
    outcomes: ["Understand core concepts of Education, Literacy & Digital Inclusion (EDI)", "Apply techniques learned in Adult Literacy & Learning Support Programme"],
    competencies: ["Diversity Awareness", "Inclusion", "Respect for Diversity", "Communication", "Empathy"],
  syllabus: [
    "Module 1: Introduction to Adult Literacy & Learning Support and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-EDI-002",
    code: "ESO-EDI-002",
    name: "School Student Mentorship Programme",
    domain: "ESO",
    level: "foundation",
    pack: "Education, Literacy & Digital Inclusion (EDI)",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Education, Literacy & Digital Inclusion Foundation",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Communication", "Teamwork & Collaboration"],
    purpose: "Engage in the School Student Mentorship Programme to develop crucial skills in Education, Literacy & Digital Inclusion (EDI) and contribute to society.",
    outcomes: ["Understand core concepts of Education, Literacy & Digital Inclusion (EDI)", "Apply techniques learned in School Student Mentorship Programme"],
    competencies: ["Inclusive Practices", "Accessibility", "Universal Design", "Community Awareness", "Communication", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to School Student Mentorship and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-EDI-003",
    code: "ESO-EDI-003",
    name: "Digital Literacy for Rural Communities",
    domain: "ESO",
    level: "practitioner",
    pack: "Education, Literacy & Digital Inclusion (EDI)",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Education, Literacy & Digital Inclusion Practitioner",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Digital Literacy for Rural Communities to develop crucial skills in Education, Literacy & Digital Inclusion (EDI) and contribute to society.",
    outcomes: ["Understand core concepts of Education, Literacy & Digital Inclusion (EDI)", "Apply techniques learned in Digital Literacy for Rural Communities"],
    competencies: ["Equity Advocacy", "Policy Awareness", "Leadership", "Conflict Resolution", "Ethical Decision Making", "Collaboration", "Public Speaking"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Digital Literacy for Rural Communities",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-EDI-004",
    code: "ESO-EDI-004",
    name: "Financial Literacy & Digital Banking Awareness Programme",
    domain: "ESO",
    level: "leader",
    pack: "Education, Literacy & Digital Inclusion (EDI)",
    difficulty: "Intermediate",
    credits: 340,
    hours: 1700,
    badge: "Education, Literacy & Digital Inclusion Leader",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Engage in the Financial Literacy & Digital Banking Awareness Programme to develop crucial skills in Education, Literacy & Digital Inclusion (EDI) and contribute to society.",
    outcomes: ["Understand core concepts of Education, Literacy & Digital Inclusion (EDI)", "Apply techniques learned in Financial Literacy & Digital Banking Awareness Programme"],
    competencies: ["Inclusive Leadership", "Stakeholder Management", "Social Justice", "Strategic Planning", "Policy Implementation", "Professional Ethics", "Change Management"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Financial Literacy & Digital Banking Awareness",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-EDI-005",
    code: "ESO-EDI-005",
    name: "Career Guidance & Higher Education Awareness Programme",
    domain: "ESO",
    level: "innovator",
    pack: "Education, Literacy & Digital Inclusion (EDI)",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Education, Literacy & Digital Inclusion Innovator",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Career Guidance & Higher Education Awareness Programme to develop crucial skills in Education, Literacy & Digital Inclusion (EDI) and contribute to society.",
    outcomes: ["Understand core concepts of Education, Literacy & Digital Inclusion (EDI)", "Apply techniques learned in Career Guidance & Higher Education Awareness Programme"],
    competencies: ["DEI Strategy", "Impact Assessment", "Research", "Leadership", "Innovation", "Professional Ethics", "Mentoring", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Career Guidance & Higher Education Awareness",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-ARI-001",
    code: "ESO-ARI-001",
    name: "Sustainable Agriculture Awareness Programme",
    domain: "ESO",
    level: "explorer",
    pack: "Agriculture & Rural Innovation (ARI)",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Agriculture & Rural Innovation Explorer",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Lifelong Learning", "Critical Thinking"],
    purpose: "Engage in the Sustainable Agriculture Awareness Programme to develop crucial skills in Agriculture & Rural Innovation (ARI) and contribute to society.",
    outcomes: ["Understand core concepts of Agriculture & Rural Innovation (ARI)", "Apply techniques learned in Sustainable Agriculture Awareness Programme"],
    competencies: ["Research Fundamentals", "Problem Identification", "Observation", "Critical Thinking", "Communication"],
  syllabus: [
    "Module 1: Introduction to Sustainable Agriculture Awareness and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-ARI-002",
    code: "ESO-ARI-002",
    name: "Smart Farming Technology Demonstration",
    domain: "ESO",
    level: "foundation",
    pack: "Agriculture & Rural Innovation (ARI)",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Agriculture & Rural Innovation Foundation",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Communication", "Teamwork & Collaboration"],
    purpose: "Engage in the Smart Farming Technology Demonstration to develop crucial skills in Agriculture & Rural Innovation (ARI) and contribute to society.",
    outcomes: ["Understand core concepts of Agriculture & Rural Innovation (ARI)", "Apply techniques learned in Smart Farming Technology Demonstration"],
    competencies: ["Field Research", "Survey Design", "Data Collection", "Data Recording", "Community Interaction", "Documentation"],
  syllabus: [
    "Module 1: Introduction to Smart Farming Technology Demonstration and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-ARI-003",
    code: "ESO-ARI-003",
    name: "Water Conservation & Irrigation Management Project",
    domain: "ESO",
    level: "practitioner",
    pack: "Agriculture & Rural Innovation (ARI)",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Agriculture & Rural Innovation Practitioner",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Water Conservation & Irrigation Management Project to develop crucial skills in Agriculture & Rural Innovation (ARI) and contribute to society.",
    outcomes: ["Understand core concepts of Agriculture & Rural Innovation (ARI)", "Apply techniques learned in Water Conservation & Irrigation Management Project"],
    competencies: ["Action Research", "Impact Assessment", "Data Analysis", "Evidence-Based Decision Making", "Research Communication", "Leadership", "Problem Solving"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Water Conservation & Irrigation Management",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-ARI-004",
    code: "ESO-ARI-004",
    name: "Farmer Capacity Building & Agricultural Extension Programme",
    domain: "ESO",
    level: "leader",
    pack: "Agriculture & Rural Innovation (ARI)",
    difficulty: "Intermediate",
    credits: 340,
    hours: 1700,
    badge: "Agriculture & Rural Innovation Leader",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Engage in the Farmer Capacity Building & Agricultural Extension Programme to develop crucial skills in Agriculture & Rural Innovation (ARI) and contribute to society.",
    outcomes: ["Understand core concepts of Agriculture & Rural Innovation (ARI)", "Apply techniques learned in Farmer Capacity Building & Agricultural Extension Programme"],
    competencies: ["Research Leadership", "Innovation Management", "Strategic Planning", "Stakeholder Engagement", "Project Management", "Ethical Research", "Professional Communication"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Farmer Capacity Building & Agricultural Extension",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-ARI-005",
    code: "ESO-ARI-005",
    name: "Rural Innovation & Agri-Entrepreneurship Project",
    domain: "ESO",
    level: "innovator",
    pack: "Agriculture & Rural Innovation (ARI)",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Agriculture & Rural Innovation Innovator",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Rural Innovation & Agri-Entrepreneurship Project to develop crucial skills in Agriculture & Rural Innovation (ARI) and contribute to society.",
    outcomes: ["Understand core concepts of Agriculture & Rural Innovation (ARI)", "Apply techniques learned in Rural Innovation & Agri-Entrepreneurship Project"],
    competencies: ["Research Methodology", "Innovation Leadership", "Community Impact", "Technology Adoption", "Research Publication", "Mentoring", "Professional Ethics", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Rural Innovation & Agri-Entrepreneurship",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-WYE-001",
    code: "ESO-WYE-001",
    name: "Women Empowerment & Gender Equality Foundation",
    domain: "ESO",
    level: "explorer",
    pack: "Women & Youth Empowerment (WYE)",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Women & Youth Empowerment Explorer",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Lifelong Learning", "Critical Thinking"],
    purpose: "Engage in the Women Empowerment & Gender Equality Foundation to develop crucial skills in Women & Youth Empowerment (WYE) and contribute to society.",
    outcomes: ["Understand core concepts of Women & Youth Empowerment (WYE)", "Apply techniques learned in Women Empowerment & Gender Equality Foundation"],
    competencies: ["Gender Equality", "Women's Empowerment", "Social Awareness", "Communication", "Empathy"],
  syllabus: [
    "Module 1: Introduction to Women Empowerment & Gender Equality and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-WYE-002",
    code: "ESO-WYE-002",
    name: "Self-Help Group Development Programme",
    domain: "ESO",
    level: "foundation",
    pack: "Women & Youth Empowerment (WYE)",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Women & Youth Empowerment Foundation",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Communication", "Teamwork & Collaboration"],
    purpose: "Engage in the Self-Help Group Development Programme to develop crucial skills in Women & Youth Empowerment (WYE) and contribute to society.",
    outcomes: ["Understand core concepts of Women & Youth Empowerment (WYE)", "Apply techniques learned in Self-Help Group Development Programme"],
    competencies: ["Self-Help Group Facilitation", "Financial Inclusion", "Community Mobilization", "Leadership", "Capacity Building", "Communication"],
  syllabus: [
    "Module 1: Introduction to Self-Help Group Development and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-WYE-003",
    code: "ESO-WYE-003",
    name: "Youth Leadership & Civic Engagement Camp",
    domain: "ESO",
    level: "practitioner",
    pack: "Women & Youth Empowerment (WYE)",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Women & Youth Empowerment Practitioner",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Youth Leadership & Civic Engagement Camp to develop crucial skills in Women & Youth Empowerment (WYE) and contribute to society.",
    outcomes: ["Understand core concepts of Women & Youth Empowerment (WYE)", "Apply techniques learned in Youth Leadership & Civic Engagement Camp"],
    competencies: ["Youth Leadership", "Civic Engagement", "Public Speaking", "Team Building", "Decision Making", "Collaboration", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Youth Leadership & Civic Engagement Camp",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-WYE-004",
    code: "ESO-WYE-004",
    name: "Employability & Skill Development Initiative",
    domain: "ESO",
    level: "leader",
    pack: "Women & Youth Empowerment (WYE)",
    difficulty: "Intermediate",
    credits: 340,
    hours: 1700,
    badge: "Women & Youth Empowerment Leader",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Engage in the Employability & Skill Development Initiative to develop crucial skills in Women & Youth Empowerment (WYE) and contribute to society.",
    outcomes: ["Understand core concepts of Women & Youth Empowerment (WYE)", "Apply techniques learned in Employability & Skill Development Initiative"],
    competencies: ["Career Readiness", "Employability Skills", "Resume Development", "Interview Skills", "Professional Communication", "Leadership", "Self-Management"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Employability & Skill Development",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-WYE-005",
    code: "ESO-WYE-005",
    name: "Women & Youth Social Innovation Project",
    domain: "ESO",
    level: "innovator",
    pack: "Women & Youth Empowerment (WYE)",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Women & Youth Empowerment Innovator",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Women & Youth Social Innovation Project to develop crucial skills in Women & Youth Empowerment (WYE) and contribute to society.",
    outcomes: ["Understand core concepts of Women & Youth Empowerment (WYE)", "Apply techniques learned in Women & Youth Social Innovation Project"],
    competencies: ["Social Innovation", "Community Leadership", "Project Management", "Entrepreneurship", "Strategic Planning", "Mentoring", "Professional Ethics", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Women & Youth Social Innovation",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-DPS-001",
    code: "ESO-DPS-001",
    name: "Disaster Preparedness Foundation Programme",
    domain: "ESO",
    level: "explorer",
    pack: "Disaster Management & Public Safety (DPS)",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Disaster Management & Public Safety Explorer",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Lifelong Learning", "Critical Thinking"],
    purpose: "Engage in the Disaster Preparedness Foundation Programme to develop crucial skills in Disaster Management & Public Safety (DPS) and contribute to society.",
    outcomes: ["Understand core concepts of Disaster Management & Public Safety (DPS)", "Apply techniques learned in Disaster Preparedness Foundation Programme"],
    competencies: ["Disaster Awareness", "Emergency Preparedness", "Risk Identification", "Safety Awareness", "Teamwork"],
  syllabus: [
    "Module 1: Introduction to Disaster Preparedness and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-DPS-002",
    code: "ESO-DPS-002",
    name: "First Aid & Emergency Response Training",
    domain: "ESO",
    level: "foundation",
    pack: "Disaster Management & Public Safety (DPS)",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Disaster Management & Public Safety Foundation",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Communication", "Teamwork & Collaboration"],
    purpose: "Engage in the First Aid & Emergency Response Training to develop crucial skills in Disaster Management & Public Safety (DPS) and contribute to society.",
    outcomes: ["Understand core concepts of Disaster Management & Public Safety (DPS)", "Apply techniques learned in First Aid & Emergency Response Training"],
    competencies: ["First Aid", "Emergency Response", "CPR Basics", "Communication", "Decision Making", "Team Coordination"],
  syllabus: [
    "Module 1: Introduction to First Aid & Emergency Response Training and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-DPS-003",
    code: "ESO-DPS-003",
    name: "Fire Safety & Disaster Simulation Exercise",
    domain: "ESO",
    level: "practitioner",
    pack: "Disaster Management & Public Safety (DPS)",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Disaster Management & Public Safety Practitioner",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Fire Safety & Disaster Simulation Exercise to develop crucial skills in Disaster Management & Public Safety (DPS) and contribute to society.",
    outcomes: ["Understand core concepts of Disaster Management & Public Safety (DPS)", "Apply techniques learned in Fire Safety & Disaster Simulation Exercise"],
    competencies: ["Risk Assessment", "Community Resilience", "Disaster Planning", "Incident Response", "Leadership", "Problem Solving", "Communication"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Fire Safety & Disaster Simulation Exercise",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-DPS-004",
    code: "ESO-DPS-004",
    name: "Road Safety & Community Risk Reduction Programme",
    domain: "ESO",
    level: "leader",
    pack: "Disaster Management & Public Safety (DPS)",
    difficulty: "Intermediate",
    credits: 340,
    hours: 1700,
    badge: "Disaster Management & Public Safety Leader",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Engage in the Road Safety & Community Risk Reduction Programme to develop crucial skills in Disaster Management & Public Safety (DPS) and contribute to society.",
    outcomes: ["Understand core concepts of Disaster Management & Public Safety (DPS)", "Apply techniques learned in Road Safety & Community Risk Reduction Programme"],
    competencies: ["Disaster Management", "Emergency Leadership", "Strategic Planning", "Stakeholder Coordination", "Resource Management", "Professional Ethics", "Decision Making"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Road Safety & Community Risk Reduction",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-DPS-005",
    code: "ESO-DPS-005",
    name: "Community Disaster Management Leadership Project",
    domain: "ESO",
    level: "innovator",
    pack: "Disaster Management & Public Safety (DPS)",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Disaster Management & Public Safety Innovator",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Community Disaster Management Leadership Project to develop crucial skills in Disaster Management & Public Safety (DPS) and contribute to society.",
    outcomes: ["Understand core concepts of Disaster Management & Public Safety (DPS)", "Apply techniques learned in Community Disaster Management Leadership Project"],
    competencies: ["Disaster Leadership", "Community Preparedness", "Risk Governance", "Project Management", "Mentoring", "Professional Ethics", "Resilience", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Community Disaster Management Leadership",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-CGG-001",
    code: "ESO-CGG-001",
    name: "Citizenship & Constitutional Values Programme",
    domain: "ESO",
    level: "explorer",
    pack: "Civic Engagement & Good Governance (CGG)",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Civic Engagement & Good Governance Explorer",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Lifelong Learning", "Critical Thinking"],
    purpose: "Engage in the Citizenship & Constitutional Values Programme to develop crucial skills in Civic Engagement & Good Governance (CGG) and contribute to society.",
    outcomes: ["Understand core concepts of Civic Engagement & Good Governance (CGG)", "Apply techniques learned in Citizenship & Constitutional Values Programme"],
    competencies: ["Civic Awareness", "Responsible Citizenship", "Ethical Responsibility", "Communication", "Critical Thinking"],
  syllabus: [
    "Module 1: Introduction to Citizenship & Constitutional Values and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-CGG-002",
    code: "ESO-CGG-002",
    name: "Government Schemes Awareness Programme",
    domain: "ESO",
    level: "foundation",
    pack: "Civic Engagement & Good Governance (CGG)",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Civic Engagement & Good Governance Foundation",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Communication", "Teamwork & Collaboration"],
    purpose: "Engage in the Government Schemes Awareness Programme to develop crucial skills in Civic Engagement & Good Governance (CGG) and contribute to society.",
    outcomes: ["Understand core concepts of Civic Engagement & Good Governance (CGG)", "Apply techniques learned in Government Schemes Awareness Programme"],
    competencies: ["Public Policy Awareness", "Government Schemes", "Community Outreach", "Policy Communication", "Documentation", "Problem Solving"],
  syllabus: [
    "Module 1: Introduction to Government Schemes Awareness and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-CGG-003",
    code: "ESO-CGG-003",
    name: "Electoral Literacy & Democratic Participation Programme",
    domain: "ESO",
    level: "practitioner",
    pack: "Civic Engagement & Good Governance (CGG)",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Civic Engagement & Good Governance Practitioner",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Electoral Literacy & Democratic Participation Programme to develop crucial skills in Civic Engagement & Good Governance (CGG) and contribute to society.",
    outcomes: ["Understand core concepts of Civic Engagement & Good Governance (CGG)", "Apply techniques learned in Electoral Literacy & Democratic Participation Programme"],
    competencies: ["Democratic Participation", "Civic Innovation", "Public Speaking", "Community Mobilization", "Leadership", "Collaboration", "Ethical Decision Making"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Electoral Literacy & Democratic Participation",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-CGG-004",
    code: "ESO-CGG-004",
    name: "Legal Literacy, RTI & Consumer Rights Programme",
    domain: "ESO",
    level: "leader",
    pack: "Civic Engagement & Good Governance (CGG)",
    difficulty: "Intermediate",
    credits: 340,
    hours: 1700,
    badge: "Civic Engagement & Good Governance Leader",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Engage in the Legal Literacy, RTI & Consumer Rights Programme to develop crucial skills in Civic Engagement & Good Governance (CGG) and contribute to society.",
    outcomes: ["Understand core concepts of Civic Engagement & Good Governance (CGG)", "Apply techniques learned in Legal Literacy, RTI & Consumer Rights Programme"],
    competencies: ["Public Leadership", "Good Governance", "Policy Implementation", "Stakeholder Management", "Strategic Planning", "Professional Ethics", "Conflict Resolution"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Legal Literacy, RTI & Consumer Rights",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-CGG-005",
    code: "ESO-CGG-005",
    name: "Good Governance & Civic Leadership Project",
    domain: "ESO",
    level: "innovator",
    pack: "Civic Engagement & Good Governance (CGG)",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Civic Engagement & Good Governance Innovator",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Good Governance & Civic Leadership Project to develop crucial skills in Civic Engagement & Good Governance (CGG) and contribute to society.",
    outcomes: ["Understand core concepts of Civic Engagement & Good Governance (CGG)", "Apply techniques learned in Good Governance & Civic Leadership Project"],
    competencies: ["Governance Leadership", "Policy Innovation", "Community Development", "Research", "Strategic Thinking", "Professional Ethics", "Mentoring", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Good Governance & Civic Leadership",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SII-001",
    code: "ESO-SII-001",
    name: "Social Innovation Foundation Programme",
    domain: "ESO",
    level: "explorer",
    pack: "Social Innovation & Impact (SII)",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Social Innovation & Impact Explorer",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Lifelong Learning", "Critical Thinking"],
    purpose: "Engage in the Social Innovation Foundation Programme to develop crucial skills in Social Innovation & Impact (SII) and contribute to society.",
    outcomes: ["Understand core concepts of Social Innovation & Impact (SII)", "Apply techniques learned in Social Innovation Foundation Programme"],
    competencies: ["Social Innovation", "Design Thinking", "Problem Identification", "Creativity", "Community Engagement"],
  syllabus: [
    "Module 1: Introduction to Social Innovation and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SII-002",
    code: "ESO-SII-002",
    name: "NGO Collaboration & Community Partnership Programme",
    domain: "ESO",
    level: "foundation",
    pack: "Social Innovation & Impact (SII)",
    difficulty: "Beginner",
    credits: 240,
    hours: 1200,
    badge: "Social Innovation & Impact Foundation",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Communication", "Teamwork & Collaboration"],
    purpose: "Engage in the NGO Collaboration & Community Partnership Programme to develop crucial skills in Social Innovation & Impact (SII) and contribute to society.",
    outcomes: ["Understand core concepts of Social Innovation & Impact (SII)", "Apply techniques learned in NGO Collaboration & Community Partnership Programme"],
    competencies: ["NGO Collaboration", "Partnership Development", "Stakeholder Communication", "Volunteer Coordination", "Community Outreach", "Leadership"],
  syllabus: [
    "Module 1: Introduction to NGO Collaboration & Community Partnership and Core Fundamentals",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SII-003",
    code: "ESO-SII-003",
    name: "Sustainable Development Goals (SDG) Action Project",
    domain: "ESO",
    level: "practitioner",
    pack: "Social Innovation & Impact (SII)",
    difficulty: "Intermediate",
    credits: 280,
    hours: 1400,
    badge: "Social Innovation & Impact Practitioner",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Sustainable Development Goals (SDG) Action Project to develop crucial skills in Social Innovation & Impact (SII) and contribute to society.",
    outcomes: ["Understand core concepts of Social Innovation & Impact (SII)", "Apply techniques learned in Sustainable Development Goals (SDG) Action Project"],
    competencies: ["SDG Implementation", "Project Planning", "Impact Assessment", "Research", "Community Engagement", "Leadership", "Collaboration"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Sustainable Development Goals (SDG) Action",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SII-004",
    code: "ESO-SII-004",
    name: "Social Entrepreneurship & Innovation Challenge",
    domain: "ESO",
    level: "leader",
    pack: "Social Innovation & Impact (SII)",
    difficulty: "Intermediate",
    credits: 340,
    hours: 1700,
    badge: "Social Innovation & Impact Leader",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Leadership", "Industry Readiness", "Creativity & Innovation"],
    purpose: "Engage in the Social Entrepreneurship & Innovation Challenge to develop crucial skills in Social Innovation & Impact (SII) and contribute to society.",
    outcomes: ["Understand core concepts of Social Innovation & Impact (SII)", "Apply techniques learned in Social Entrepreneurship & Innovation Challenge"],
    competencies: ["Social Entrepreneurship", "Innovation Management", "Business Model Development", "Leadership", "Pitching", "Strategic Planning", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Social Entrepreneurship & Innovation Challenge",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "ESO-SII-005",
    code: "ESO-SII-005",
    name: "Grand Community Impact Capstone Project",
    domain: "ESO",
    level: "innovator",
    pack: "Social Innovation & Impact (SII)",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Social Innovation & Impact Innovator",
    sdgs: [1, 11],
    ga: ["Social Responsibility", "Public Service", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Grand Community Impact Capstone Project to develop crucial skills in Social Innovation & Impact (SII) and contribute to society.",
    outcomes: ["Understand core concepts of Social Innovation & Impact (SII)", "Apply techniques learned in Grand Community Impact Capstone Project"],
    competencies: ["Community Impact Assessment", "Social Innovation Leadership", "Project Management", "Research", "Mentoring", "Professional Ethics", "Strategic Thinking", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Grand Community Impact Capstone",
    "Module 2: Theoretical Frameworks, Methodologies, and Key Principles",
    "Module 3: Hands-on Practice: Case study analysis and real-world scenario mapping",
    "Module 4: Community Integration, Ethical Considerations, and Impact Assessment",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Community Outreach Mentor"
  },
  {
    id: "IIE-001",
    code: "IIE-001",
    name: "Innovation Mindset & Design Thinking Foundation Programme",
    domain: "IIE",
    level: "explorer",
    pack: "Innovation, Incubation & Entrepreneurship (IIE)",
    difficulty: "Beginner",
    credits: 200,
    hours: 1000,
    badge: "Innovation, Incubation & Entrepreneurship Explorer",
    sdgs: [8, 9],
    ga: ["Entrepreneurship", "Creativity & Innovation", "Lifelong Learning", "Critical Thinking"],
    purpose: "Engage in the Innovation Mindset & Design Thinking Foundation Programme to develop crucial skills in Innovation, Incubation & Entrepreneurship (IIE).",
    outcomes: ["Understand core concepts of Innovation", "Apply techniques learned in Innovation Mindset & Design Thinking Foundation Programme"],
    competencies: ["Design Thinking", "Creative Problem Solving", "Opportunity Identification", "Critical Thinking", "Communication"],
  syllabus: [
    "Module 1: Introduction to Innovation Mindset & Design Thinking and Core Fundamentals",
    "Module 2: Essential Tools, Frameworks, and Setup",
    "Module 3: Hands-on Practice: Market validation and building a Minimum Viable Product (MVP)",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Innovation Mentor"
  },
  {
    id: "IIE-002",
    code: "IIE-002",
    name: "Idea Validation & Problem Discovery Programme",
    domain: "IIE",
    level: "foundation",
    pack: "Innovation, Incubation & Entrepreneurship (IIE)",
    difficulty: "Beginner",
    credits: 220,
    hours: 1100,
    badge: "Innovation, Incubation & Entrepreneurship Beginner",
    sdgs: [8, 9],
    ga: ["Entrepreneurship", "Creativity & Innovation", "Communication", "Teamwork & Collaboration"],
    purpose: "Engage in the Idea Validation & Problem Discovery Programme to develop crucial skills in Innovation, Incubation & Entrepreneurship (IIE).",
    outcomes: ["Understand core concepts of Innovation", "Apply techniques learned in Idea Validation & Problem Discovery Programme"],
    competencies: ["Problem Discovery", "Customer Research", "Idea Validation", "Market Analysis", "Analytical Thinking", "Documentation"],
  syllabus: [
    "Module 1: Introduction to Idea Validation & Problem Discovery and Core Fundamentals",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Market validation and building a Minimum Viable Product (MVP)",
    "Module 4: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Innovation Mentor"
  },
  {
    id: "IIE-003",
    code: "IIE-003",
    name: "Business Model Canvas & Startup Planning Programme",
    domain: "IIE",
    level: "practitioner",
    pack: "Innovation, Incubation & Entrepreneurship (IIE)",
    difficulty: "Intermediate",
    credits: 240,
    hours: 1200,
    badge: "Innovation, Incubation & Entrepreneurship Intermediate",
    sdgs: [8, 9],
    ga: ["Entrepreneurship", "Creativity & Innovation", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Business Model Canvas & Startup Planning Programme to develop crucial skills in Innovation, Incubation & Entrepreneurship (IIE).",
    outcomes: ["Understand core concepts of Innovation", "Apply techniques learned in Business Model Canvas & Startup Planning Programme"],
    competencies: ["Business Model Development", "Value Proposition Design", "Market Strategy", "Financial Planning", "Entrepreneurial Thinking", "Presentation Skills"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Business Model Canvas & Startup Planning",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Market validation and building a Minimum Viable Product (MVP)",
    "Module 4: Pitching, Scaling Strategies, and Financial Modeling",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Innovation Mentor"
  },
  {
    id: "IIE-004",
    code: "IIE-004",
    name: "Prototype Development & MVP Bootcamp",
    domain: "IIE",
    level: "practitioner",
    pack: "Innovation, Incubation & Entrepreneurship (IIE)",
    difficulty: "Intermediate",
    credits: 260,
    hours: 1300,
    badge: "Innovation, Incubation & Entrepreneurship Intermediate",
    sdgs: [8, 9],
    ga: ["Entrepreneurship", "Creativity & Innovation", "Problem Solving", "Professional Competence", "Teamwork & Collaboration"],
    purpose: "Engage in the Prototype Development & MVP Bootcamp to develop crucial skills in Innovation, Incubation & Entrepreneurship (IIE).",
    outcomes: ["Understand core concepts of Innovation", "Apply techniques learned in Prototype Development & MVP Bootcamp"],
    competencies: ["Rapid Prototyping", "Minimum Viable Product (MVP) Development", "Product Design", "User Testing", "Iteration", "Team Collaboration", "Technical Communication"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Prototype Development & MVP",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Market validation and building a Minimum Viable Product (MVP)",
    "Module 4: Pitching, Scaling Strategies, and Financial Modeling",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Innovation Mentor"
  },
  {
    id: "IIE-005",
    code: "IIE-005",
    name: "Startup Incubation & Mentorship Programme",
    domain: "IIE",
    level: "leader",
    pack: "Innovation, Incubation & Entrepreneurship (IIE)",
    difficulty: "Advanced",
    credits: 280,
    hours: 1400,
    badge: "Innovation, Incubation & Entrepreneurship Advanced",
    sdgs: [8, 9],
    ga: ["Entrepreneurship", "Creativity & Innovation", "Leadership", "Industry Readiness"],
    purpose: "Engage in the Startup Incubation & Mentorship Programme to develop crucial skills in Innovation, Incubation & Entrepreneurship (IIE).",
    outcomes: ["Understand core concepts of Innovation", "Apply techniques learned in Startup Incubation & Mentorship Programme"],
    competencies: ["Startup Development", "Business Mentoring", "Networking", "Leadership", "Resource Management", "Strategic Planning", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Startup Incubation & Mentorship",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Market validation and building a Minimum Viable Product (MVP)",
    "Module 4: Pitching, Scaling Strategies, and Financial Modeling",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Innovation Mentor"
  },
  {
    id: "IIE-006",
    code: "IIE-006",
    name: "Entrepreneurship Development & Business Registration Programme",
    domain: "IIE",
    level: "leader",
    pack: "Innovation, Incubation & Entrepreneurship (IIE)",
    difficulty: "Advanced",
    credits: 300,
    hours: 1500,
    badge: "Innovation, Incubation & Entrepreneurship Advanced",
    sdgs: [8, 9],
    ga: ["Entrepreneurship", "Creativity & Innovation", "Leadership", "Industry Readiness"],
    purpose: "Engage in the Entrepreneurship Development & Business Registration Programme to develop crucial skills in Innovation, Incubation & Entrepreneurship (IIE).",
    outcomes: ["Understand core concepts of Innovation", "Apply techniques learned in Entrepreneurship Development & Business Registration Programme"],
    competencies: ["Business Registration", "Legal Compliance", "Business Operations", "Financial Management", "Leadership", "Decision Making", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Entrepreneurship Development & Business Registration",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Market validation and building a Minimum Viable Product (MVP)",
    "Module 4: Pitching, Scaling Strategies, and Financial Modeling",
    "Module 5: Final Assessment, Review, and Deliverable Submission"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Innovation Mentor"
  },
  {
    id: "IIE-007",
    code: "IIE-007",
    name: "Startup Pitching & Investor Readiness Programme",
    domain: "IIE",
    level: "innovator",
    pack: "Innovation, Incubation & Entrepreneurship (IIE)",
    difficulty: "Advanced",
    credits: 330,
    hours: 1650,
    badge: "Innovation, Incubation & Entrepreneurship Professional",
    sdgs: [8, 9],
    ga: ["Entrepreneurship", "Creativity & Innovation", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Startup Pitching & Investor Readiness Programme to develop crucial skills in Innovation, Incubation & Entrepreneurship (IIE).",
    outcomes: ["Understand core concepts of Innovation", "Apply techniques learned in Startup Pitching & Investor Readiness Programme"],
    competencies: ["Pitching", "Investor Communication", "Business Storytelling", "Negotiation", "Financial Presentation", "Confidence Building", "Leadership"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Startup Pitching & Investor Readiness",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Market validation and building a Minimum Viable Product (MVP)",
    "Module 4: Pitching, Scaling Strategies, and Financial Modeling",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Innovation Mentor"
  },
  {
    id: "IIE-008",
    code: "IIE-008",
    name: "Innovation Challenge & National Hackathon Programme",
    domain: "IIE",
    level: "innovator",
    pack: "Innovation, Incubation & Entrepreneurship (IIE)",
    difficulty: "Advanced",
    credits: 350,
    hours: 1750,
    badge: "Innovation, Incubation & Entrepreneurship Professional",
    sdgs: [8, 9],
    ga: ["Entrepreneurship", "Creativity & Innovation", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Innovation Challenge & National Hackathon Programme to develop crucial skills in Innovation, Incubation & Entrepreneurship (IIE).",
    outcomes: ["Understand core concepts of Innovation", "Apply techniques learned in Innovation Challenge & National Hackathon Programme"],
    competencies: ["Innovation Management", "Hackathon Participation", "Collaborative Problem Solving", "Rapid Solution Development", "Project Management", "Leadership", "Professional Ethics"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Innovation Challenge & National Hackathon",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Market validation and building a Minimum Viable Product (MVP)",
    "Module 4: Pitching, Scaling Strategies, and Financial Modeling",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Innovation Mentor"
  },
  {
    id: "IIE-009",
    code: "IIE-009",
    name: "Startup Accelerator & Venture Growth Programme",
    domain: "IIE",
    level: "fellow",
    pack: "Innovation, Incubation & Entrepreneurship (IIE)",
    difficulty: "Advanced",
    credits: 375,
    hours: 1875,
    badge: "Innovation, Incubation & Entrepreneurship Expert",
    sdgs: [8, 9],
    ga: ["Entrepreneurship", "Creativity & Innovation", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Startup Accelerator & Venture Growth Programme to develop crucial skills in Innovation, Incubation & Entrepreneurship (IIE).",
    outcomes: ["Understand core concepts of Innovation", "Apply techniques learned in Startup Accelerator & Venture Growth Programme"],
    competencies: ["Business Scaling", "Growth Strategy", "Innovation Leadership", "Strategic Partnerships", "Business Analytics", "Risk Management", "Entrepreneurship", "Decision Making"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Startup Accelerator & Venture Growth",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Market validation and building a Minimum Viable Product (MVP)",
    "Module 4: Pitching, Scaling Strategies, and Financial Modeling",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Innovation Mentor"
  },
  {
    id: "IIE-010",
    code: "IIE-010",
    name: "Entrepreneur-in-Residence (EiR) Capstone Project",
    domain: "IIE",
    level: "fellow",
    pack: "Innovation, Incubation & Entrepreneurship (IIE)",
    difficulty: "Advanced",
    credits: 400,
    hours: 2000,
    badge: "Innovation, Incubation & Entrepreneurship Master",
    sdgs: [8, 9],
    ga: ["Entrepreneurship", "Creativity & Innovation", "Global Citizenship", "Research Excellence", "Sustainability", "Leadership"],
    purpose: "Engage in the Entrepreneur-in-Residence (EiR) Capstone Project to develop crucial skills in Innovation, Incubation & Entrepreneurship (IIE).",
    outcomes: ["Understand core concepts of Innovation", "Apply techniques learned in Entrepreneur-in-Residence (EiR) Capstone Project"],
    competencies: ["Entrepreneurial Leadership", "Innovation Strategy", "Technology Commercialization", "Business Mentorship", "Investment Readiness", "Professional Networking", "Visionary Leadership", "Lifelong Learning"],
  syllabus: [
    "Module 1: Advanced Concepts and Strategic Overview of Entrepreneur-in-Residence (EiR) Capstone",
    "Module 2: Architecture, Frameworks, and Implementation Methodologies",
    "Module 3: Hands-on Practice: Market validation and building a Minimum Viable Product (MVP)",
    "Module 4: Pitching, Scaling Strategies, and Financial Modeling",
    "Module 5: Final Capstone Project: Global Innovation Challenge & Presentation"
  ],
    enrolledCount: 0,
    maxEnrollment: 50,
    faculty: "Innovation Mentor"
  },
    {
        "id": "LCH-DC-A01",
        "code": "DC-A01",
        "name": "Dance Club Orientation & Open Dance Jam",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Dance Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Dance Enthusiast",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Effective Communication",
            "Teamwork and Collaboration",
            "Lifelong Learning",
            "Leadership Potential"
        ],
        "purpose": "This introductory event welcomes new members to the Dance Club by presenting the club's vision, annual activities, training opportunities, and performance pathways. The session concludes with an open dance jam that encourages interaction, creativity, and community building among participants.",
        "outcomes": [
            "Understand the objectives and structure of the Dance Club.",
            "Demonstrate confidence in participating in informal dance activities.",
            "Appreciate various dance styles practiced within the club.",
            "Build initial collaboration and networking skills with fellow members."
        ],
        "competencies": [
            "Communication",
            "Self-confidence",
            "Team participation",
            "Social interaction",
            "Creative expression"
        ],
        "syllabus": [
            "Introduction to the Dance Club",
            "Annual calendar and opportunities",
            "Overview of dance styles",
            "Ice-breaking movement activities",
            "Open dance jam",
            "Team interaction and networking"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Dance Club President"
    },
    {
        "id": "LCH-DC-A02",
        "code": "DC-A02",
        "name": "Beginner Dance Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Dance Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Beginner Dancer",
        "sdgs": [
            3,
            4
        ],
        "ga": [
            "Problem Solving",
            "Lifelong Learning",
            "Self-management",
            "Adaptability"
        ],
        "purpose": "A foundation workshop designed for beginners to learn essential dance techniques, body posture, rhythm, balance, and coordination. The workshop prepares participants for further training in different dance styles.",
        "outcomes": [
            "Perform basic dance movements with proper posture.",
            "Understand rhythm and timing.",
            "Demonstrate body coordination.",
            "Build confidence in dance practice."
        ],
        "competencies": [
            "Coordination",
            "Rhythm",
            "Physical fitness",
            "Confidence",
            "Discipline"
        ],
        "syllabus": [
            "Warm-up techniques",
            "Body posture",
            "Basic footwork",
            "Rhythm counting",
            "Coordination drills",
            "Cool-down exercises"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Dance Instructor"
    },
    {
        "id": "LCH-DC-A03",
        "code": "DC-A03",
        "name": "Freestyle Dance Session",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Dance Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Freestyle Dancer",
        "sdgs": [
            3,
            4
        ],
        "ga": [
            "Creativity and Innovation",
            "Communication",
            "Leadership"
        ],
        "purpose": "An interactive dance session encouraging participants to express creativity through spontaneous movement while improving musical interpretation and confidence.",
        "outcomes": [
            "Express emotions through dance.",
            "Interpret music creatively.",
            "Develop improvisation skills.",
            "Build stage confidence."
        ],
        "competencies": [
            "Creativity",
            "Improvisation",
            "Confidence",
            "Musicality",
            "Self-expression"
        ],
        "syllabus": [
            "Music interpretation",
            "Improvisation exercises",
            "Freestyle movement",
            "Expression techniques",
            "Confidence-building activities"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Dance Instructor"
    },
    {
        "id": "LCH-DC-A04",
        "code": "DC-A04",
        "name": "Hip-Hop Dance Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Dance Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Hip-Hop Dancer",
        "sdgs": [
            3,
            4
        ],
        "ga": [
            "Teamwork",
            "Communication",
            "Creativity",
            "Leadership"
        ],
        "purpose": "A practical workshop introducing participants to hip-hop fundamentals, grooves, popping, locking, and choreography while enhancing energy, rhythm, and synchronization.",
        "outcomes": [
            "Execute fundamental hip-hop movements.",
            "Demonstrate synchronization.",
            "Maintain rhythm and timing.",
            "Perform a short choreography."
        ],
        "competencies": [
            "Rhythm",
            "Coordination",
            "Synchronization",
            "Performance skills",
            "Fitness"
        ],
        "syllabus": [
            "Hip-hop history",
            "Basic grooves",
            "Locking",
            "Popping",
            "Choreography",
            "Performance practice"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Hip-Hop Instructor"
    },
    {
        "id": "LCH-DC-A05",
        "code": "DC-A05",
        "name": "Contemporary Dance Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Dance Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Contemporary Dancer",
        "sdgs": [
            3,
            4
        ],
        "ga": [
            "Creativity",
            "Emotional Intelligence",
            "Lifelong Learning"
        ],
        "purpose": "A workshop focusing on contemporary dance techniques emphasizing body flow, flexibility, emotional expression, and storytelling through movement.",
        "outcomes": [
            "Demonstrate contemporary movement techniques.",
            "Improve flexibility and balance.",
            "Express emotions through movement.",
            "Perform expressive choreography."
        ],
        "competencies": [
            "Flexibility",
            "Emotional intelligence",
            "Creativity",
            "Stage presence",
            "Body control"
        ],
        "syllabus": [
            "Floor work",
            "Body flow",
            "Balance exercises",
            "Emotional expression",
            "Contemporary choreography"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Contemporary Instructor"
    },
    {
        "id": "LCH-DC-A06",
        "code": "DC-A06",
        "name": "Classical Dance Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Dance Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Classical Dancer",
        "sdgs": [
            4,
            11
        ],
        "ga": [
            "Cultural Awareness",
            "Ethical Responsibility",
            "Lifelong Learning"
        ],
        "purpose": "This workshop introduces participants to the fundamentals of Indian classical dance, including posture, hand gestures, expressions, rhythm, and cultural significance.",
        "outcomes": [
            "Demonstrate basic classical dance movements.",
            "Perform simple hand gestures (Mudras).",
            "Understand rhythmic patterns.",
            "Appreciate Indian cultural heritage."
        ],
        "competencies": [
            "Discipline",
            "Cultural awareness",
            "Coordination",
            "Concentration",
            "Artistic expression"
        ],
        "syllabus": [
            "Classical dance overview",
            "Basic postures",
            "Mudras",
            "Rhythm",
            "Facial expressions",
            "Simple choreography"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Classical Instructor"
    },
    {
        "id": "LCH-DC-A07",
        "code": "DC-A07",
        "name": "Folk Dance Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Dance Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Folk Dancer",
        "sdgs": [
            4,
            11
        ],
        "ga": [
            "Cultural Competence",
            "Teamwork",
            "Leadership"
        ],
        "purpose": "Participants explore traditional Indian folk dances while learning regional dance forms, cultural significance, teamwork, and festive performances.",
        "outcomes": [
            "Perform basic folk dance routines.",
            "Recognize regional dance traditions.",
            "Demonstrate teamwork during performances.",
            "Appreciate India's cultural diversity."
        ],
        "competencies": [
            "Teamwork",
            "Cultural appreciation",
            "Coordination",
            "Stage confidence"
        ],
        "syllabus": [
            "Folk dance overview",
            "Regional dance styles",
            "Group formations",
            "Costumes and traditions",
            "Performance practice"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Folk Instructor"
    },
    {
        "id": "LCH-DC-A08",
        "code": "DC-A08",
        "name": "Bollywood Dance Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Dance Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Bollywood Dancer",
        "sdgs": [
            3,
            4
        ],
        "ga": [
            "Communication",
            "Creativity",
            "Leadership"
        ],
        "purpose": "A fun and energetic workshop introducing Bollywood dance styles, cinematic choreography, expressions, and group performance techniques.",
        "outcomes": [
            "Perform Bollywood dance routines.",
            "Synchronize movements in groups.",
            "Express emotions through dance.",
            "Build stage confidence."
        ],
        "competencies": [
            "Performance",
            "Creativity",
            "Coordination",
            "Confidence",
            "Teamwork"
        ],
        "syllabus": [
            "Bollywood dance basics",
            "Expressions",
            "Choreography",
            "Group synchronization",
            "Stage performance"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Bollywood Instructor"
    },
    {
        "id": "LCH-DC-A09",
        "code": "DC-A09",
        "name": "K-Pop Dance Challenge",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Dance Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "K-Pop Challenger",
        "sdgs": [
            3,
            4
        ],
        "ga": [
            "Collaboration",
            "Adaptability",
            "Creativity",
            "Leadership"
        ],
        "purpose": "Participants learn and perform popular K-Pop choreography while improving precision, synchronization, endurance, and teamwork in a competitive environment.",
        "outcomes": [
            "Perform synchronized K-Pop choreography.",
            "Improve endurance and coordination.",
            "Work effectively in dance teams.",
            "Demonstrate stage confidence."
        ],
        "competencies": [
            "Precision",
            "Teamwork",
            "Physical endurance",
            "Performance skills",
            "Musicality"
        ],
        "syllabus": [
            "K-Pop choreography",
            "Synchronization drills",
            "Team coordination",
            "Performance rehearsal",
            "Final showcase"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "K-Pop Instructor"
    },
    {
        "id": "LCH-DC-A10",
        "code": "DC-A10",
        "name": "Duo & Group Dance Competition",
        "domain": "LCH",
        "level": "leader",
        "pack": "Dance Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Competition Star",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Leadership",
            "Teamwork",
            "Innovation",
            "Communication"
        ],
        "purpose": "A competitive platform where participants showcase choreographed routines in pairs or groups, promoting teamwork, creativity, and stage excellence.",
        "outcomes": [
            "Develop collaborative choreography.",
            "Demonstrate synchronized performances.",
            "Apply stage presentation techniques.",
            "Evaluate performances using constructive feedback."
        ],
        "competencies": [
            "Collaboration",
            "Leadership",
            "Choreography",
            "Performance management",
            "Critical evaluation"
        ],
        "syllabus": [
            "Team choreography",
            "Formation planning",
            "Stage utilization",
            "Costume coordination",
            "Performance evaluation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Dance Club Committee"
    },
    {
        "id": "LCH-DC-A11",
        "code": "DC-A11",
        "name": "Dance Battle (1v1 / Crew vs Crew)",
        "domain": "LCH",
        "level": "leader",
        "pack": "Dance Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Battle Champion",
        "sdgs": [
            3,
            4
        ],
        "ga": [
            "Leadership",
            "Creativity & Innovation",
            "Effective Communication",
            "Teamwork",
            "Professional Ethics"
        ],
        "purpose": "The Dance Battle is a competitive platform where individual dancers and dance crews showcase their technical abilities, creativity, improvisation, and stage presence in a structured battle format. Participants compete through multiple rounds judged on technique, originality, musicality, confidence, and audience engagement.",
        "outcomes": [
            "Demonstrate advanced dance techniques in competitive settings.",
            "Apply improvisation and freestyle skills effectively.",
            "Respond creatively to different music genres.",
            "Exhibit confidence and sportsmanship during competitions.",
            "Analyze and improve performance based on judges' feedback."
        ],
        "competencies": [
            "Competitive performance",
            "Improvisation",
            "Creativity",
            "Critical thinking",
            "Confidence",
            "Decision-making",
            "Emotional resilience"
        ],
        "syllabus": [
            "Battle formats and competition rules",
            "Freestyle techniques",
            "Musical interpretation",
            "Performance strategy",
            "Stage confidence",
            "Sportsmanship and professional ethics",
            "Judging criteria and feedback"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Dance Club Committee"
    },
    {
        "id": "LCH-DC-A12",
        "code": "DC-A12",
        "name": "Choreography Showcase",
        "domain": "LCH",
        "level": "innovator",
        "pack": "Dance Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Choreography Showcase",
        "sdgs": [
            4,
            11
        ],
        "ga": [
            "Innovation",
            "Leadership",
            "Creativity",
            "Communication"
        ],
        "purpose": "A showcase event where members present original choreographies developed individually or in teams. The event encourages innovation, storytelling, artistic interpretation, and creative leadership.",
        "outcomes": [
            "Design original choreography.",
            "Apply principles of dance composition.",
            "Integrate storytelling through movement.",
            "Evaluate dance performances critically.",
            "Present creative work confidently."
        ],
        "competencies": [
            "Creative thinking",
            "Choreography",
            "Artistic direction",
            "Leadership",
            "Presentation skills",
            "Critical evaluation"
        ],
        "syllabus": [
            "Dance composition principles",
            "Theme selection",
            "Music analysis",
            "Formation design",
            "Storytelling techniques",
            "Performance presentation",
            "Peer review"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Dance Club Committee"
    },
    {
        "id": "LCH-DC-A13",
        "code": "DC-A13",
        "name": "Dance Fitness Session",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Dance Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Dance Fit",
        "sdgs": [
            3
        ],
        "ga": [
            "Self-management",
            "Lifelong Learning",
            "Adaptability"
        ],
        "purpose": "A fitness-oriented session combining dance movements with cardiovascular and strength exercises to improve physical health, endurance, flexibility, and overall wellness.",
        "outcomes": [
            "Improve physical fitness through dance.",
            "Perform aerobic dance routines.",
            "Develop stamina and endurance.",
            "Practice healthy lifestyle habits."
        ],
        "competencies": [
            "Physical fitness",
            "Endurance",
            "Flexibility",
            "Discipline",
            "Stress management"
        ],
        "syllabus": [
            "Dynamic warm-up",
            "Cardio dance routines",
            "Strength and conditioning",
            "Flexibility exercises",
            "Cool-down techniques",
            "Wellness awareness"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Fitness Instructor"
    },
    {
        "id": "LCH-DC-A14",
        "code": "DC-A14",
        "name": "Dance Film Screening & Discussion",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Dance Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Dance Critic",
        "sdgs": [
            4,
            11
        ],
        "ga": [
            "Critical Thinking",
            "Communication",
            "Cultural Competence",
            "Lifelong Learning"
        ],
        "purpose": "Participants watch acclaimed dance performances, documentaries, and dance films followed by guided discussions on choreography, culture, artistic expression, and performance analysis.",
        "outcomes": [
            "Analyze professional dance performances.",
            "Understand diverse dance cultures.",
            "Critically evaluate choreography.",
            "Appreciate dance as an art form."
        ],
        "competencies": [
            "Analytical thinking",
            "Observation",
            "Communication",
            "Cultural awareness",
            "Critical evaluation"
        ],
        "syllabus": [
            "Dance film screening",
            "Dance history",
            "Performance analysis",
            "Choreography appreciation",
            "Group discussion",
            "Reflection activities"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Dance Club Committee"
    },
    {
        "id": "LCH-DC-A15",
        "code": "DC-A15",
        "name": "Cultural Dance Festival",
        "domain": "LCH",
        "level": "innovator",
        "pack": "Dance Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Cultural Ambassador",
        "sdgs": [
            4,
            10,
            11
        ],
        "ga": [
            "Social Responsibility",
            "Cultural Awareness",
            "Leadership",
            "Teamwork"
        ],
        "purpose": "A festival celebrating India's rich cultural diversity through performances of regional, folk, and classical dance forms. The event promotes inclusivity, heritage preservation, and cultural exchange.",
        "outcomes": [
            "Perform traditional cultural dances.",
            "Appreciate regional diversity.",
            "Demonstrate teamwork in cultural productions.",
            "Promote cultural heritage through performance."
        ],
        "competencies": [
            "Cultural literacy",
            "Team collaboration",
            "Stage performance",
            "Artistic expression",
            "Event participation"
        ],
        "syllabus": [
            "Regional dance traditions",
            "Folk dance choreography",
            "Classical performances",
            "Costume and makeup",
            "Cultural presentations",
            "Stage management"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Dance Club Committee"
    },
    {
        "id": "LCH-DC-A16",
        "code": "DC-A16",
        "name": "Flash Mob Performance",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Dance Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Flash Mob Star",
        "sdgs": [
            3,
            11,
            17
        ],
        "ga": [
            "Leadership",
            "Communication",
            "Teamwork",
            "Social Responsibility"
        ],
        "purpose": "Participants collaboratively design and perform surprise public dance performances to engage audiences, promote social awareness campaigns, and showcase the Dance Club.",
        "outcomes": [
            "Organize public dance performances.",
            "Coordinate large-group choreography.",
            "Engage audiences effectively.",
            "Promote social causes through dance."
        ],
        "competencies": [
            "Leadership",
            "Public engagement",
            "Team coordination",
            "Event execution",
            "Communication"
        ],
        "syllabus": [
            "Flash mob planning",
            "Public performance etiquette",
            "Group synchronization",
            "Crowd engagement",
            "Awareness campaign integration",
            "Safety protocols"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Dance Club Committee"
    },
    {
        "id": "LCH-DC-A17",
        "code": "DC-A17",
        "name": "Inter-College Dance Competition",
        "domain": "LCH",
        "level": "fellow",
        "pack": "Dance Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Competition Rep",
        "sdgs": [
            3,
            4
        ],
        "ga": [
            "Leadership",
            "Professional Ethics",
            "Teamwork",
            "Communication"
        ],
        "purpose": "A competitive event enabling participants to represent the institution at inter-college dance competitions while fostering excellence, discipline, and institutional pride.",
        "outcomes": [
            "Demonstrate competitive-level performances.",
            "Collaborate effectively in dance teams.",
            "Represent the institution professionally.",
            "Apply performance feedback for continuous improvement."
        ],
        "competencies": [
            "Competitive excellence",
            "Teamwork",
            "Leadership",
            "Discipline",
            "Professionalism"
        ],
        "syllabus": [
            "Competition choreography",
            "Stage rehearsals",
            "Team synchronization",
            "Costume planning",
            "Performance evaluation",
            "Competition regulations"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Dance Coach"
    },
    {
        "id": "LCH-DC-A18",
        "code": "DC-A18",
        "name": "Campus Dance Showcase",
        "domain": "LCH",
        "level": "innovator",
        "pack": "Dance Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Campus Star",
        "sdgs": [
            4,
            11
        ],
        "ga": [
            "Communication",
            "Leadership",
            "Teamwork",
            "Creativity"
        ],
        "purpose": "A university-wide performance event where club members present dance productions to the campus community, providing exposure and encouraging artistic collaboration.",
        "outcomes": [
            "Present polished dance performances.",
            "Demonstrate stage confidence.",
            "Collaborate across dance teams.",
            "Receive constructive audience feedback."
        ],
        "competencies": [
            "Performance excellence",
            "Collaboration",
            "Communication",
            "Event participation",
            "Confidence"
        ],
        "syllabus": [
            "Performance planning",
            "Stage rehearsal",
            "Technical coordination",
            "Audience interaction",
            "Event management",
            "Performance review"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Dance Club Committee"
    },
    {
        "id": "LCH-DC-A19",
        "code": "DC-A19",
        "name": "Annual Dance Festival",
        "domain": "LCH",
        "level": "fellow",
        "pack": "Dance Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Festival Organizer",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Leadership",
            "Professional Ethics",
            "Communication",
            "Teamwork",
            "Innovation"
        ],
        "purpose": "The flagship annual event of the Dance Club featuring performances across multiple dance genres, guest artists, competitions, awards, and collaborative productions celebrating dance as a performing art.",
        "outcomes": [
            "Execute large-scale dance productions.",
            "Collaborate with multidisciplinary teams.",
            "Demonstrate advanced performance skills.",
            "Manage event responsibilities professionally."
        ],
        "competencies": [
            "Leadership",
            "Event management",
            "Collaboration",
            "Performance skills",
            "Time management",
            "Organizational skills"
        ],
        "syllabus": [
            "Festival planning",
            "Production management",
            "Stage coordination",
            "Guest artist interaction",
            "Technical rehearsals",
            "Performance execution",
            "Event review"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Dance Club Committee"
    },
    {
        "id": "LCH-DC-A20",
        "code": "DC-A20",
        "name": "Dance Awards & Recognition Ceremony",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Dance Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Dance Awardee",
        "sdgs": [
            4,
            8
        ],
        "ga": [
            "Lifelong Learning",
            "Leadership",
            "Ethical Responsibility",
            "Professionalism"
        ],
        "purpose": "An annual recognition programme honoring outstanding performers, choreographers, volunteers, and club leaders for their contributions, achievements, and commitment to the Dance Club.",
        "outcomes": [
            "Recognize excellence in dance and leadership.",
            "Reflect on personal growth and achievements.",
            "Appreciate peer contributions.",
            "Develop motivation for continuous improvement."
        ],
        "competencies": [
            "Self-reflection",
            "Motivation",
            "Leadership",
            "Professional ethics",
            "Goal setting"
        ],
        "syllabus": [
            "Annual performance review",
            "Recognition categories",
            "Achievement presentations",
            "Leadership appreciation",
            "Reflection session",
            "Future goal setting"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 300,
        "faculty": "Dance Club President"
    },
    {
        "id": "LCH-PC-A01",
        "code": "PC-A01",
        "name": "Photography Orientation & Camera Basics",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Photography Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Camera Explorer",
        "sdgs": [
            4,
            9
        ],
        "ga": [
            "Lifelong Learning",
            "Critical Thinking",
            "Creativity",
            "Digital Literacy"
        ],
        "purpose": "An introductory session designed to familiarize participants with the fundamentals of photography, camera operations, exposure settings, and visual composition, enabling them to confidently begin their photography journey.",
        "outcomes": [
            "Understand the fundamentals of photography.",
            "Identify different camera types and essential equipment.",
            "Apply exposure triangle principles (ISO, Aperture, Shutter Speed).",
            "Capture photographs using basic composition techniques."
        ],
        "competencies": [
            "Technical photography skills",
            "Camera handling",
            "Visual observation",
            "Composition techniques",
            "Creative thinking"
        ],
        "syllabus": [
            "Introduction to Photography",
            "Camera Types & Equipment",
            "Exposure Triangle",
            "Camera Modes",
            "Composition Rules",
            "Lighting Basics"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Photography Club Mentor"
    },
    {
        "id": "LCH-PC-A02",
        "code": "PC-A02",
        "name": "Mobile Photography Challenge",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Photography Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Mobile Shooter",
        "sdgs": [
            4,
            9,
            11
        ],
        "ga": [
            "Creativity",
            "Digital Literacy",
            "Critical Thinking",
            "Innovation"
        ],
        "purpose": "A creative photography challenge that encourages participants to capture compelling images using smartphone cameras, demonstrating that impactful photography depends on vision, creativity, and composition rather than professional equipment.",
        "outcomes": [
            "Capture high-quality photographs using mobile devices.",
            "Apply composition and lighting techniques in mobile photography.",
            "Utilize smartphone camera features effectively.",
            "Develop creativity through themed photography challenges."
        ],
        "competencies": [
            "Mobile photography",
            "Creativity",
            "Visual storytelling",
            "Photo editing",
            "Observation skills"
        ],
        "syllabus": [
            "Mobile Camera Features",
            "Composition Techniques",
            "Natural & Artificial Lighting",
            "Smartphone Editing Applications",
            "Creative Photography Themes",
            "Photo Submission & Evaluation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Photography Club Mentor"
    },
    {
        "id": "LCH-PC-A03",
        "code": "PC-A03",
        "name": "Photo Walk (Campus/Nature/City)",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Photography Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Urban Explorer",
        "sdgs": [
            4,
            11,
            15
        ],
        "ga": [
            "Creativity",
            "Critical Thinking",
            "Environmental Awareness",
            "Lifelong Learning"
        ],
        "purpose": "A guided outdoor photography activity where participants explore campus, natural landscapes, or urban environments to practice photography techniques while capturing diverse subjects and developing observational skills.",
        "outcomes": [
            "Apply photography principles in real-world environments.",
            "Capture photographs using natural lighting and surroundings.",
            "Identify suitable compositions for different subjects.",
            "Develop observational and visual storytelling skills."
        ],
        "competencies": [
            "Outdoor photography",
            "Visual composition",
            "Observation skills",
            "Environmental awareness",
            "Creative storytelling"
        ],
        "syllabus": [
            "Outdoor Photography Techniques",
            "Landscape & Nature Photography",
            "Street Observation",
            "Framing & Composition",
            "Lighting in Outdoor Environments",
            "Photo Review & Critique"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Photography Club Mentor"
    },
    {
        "id": "LCH-PC-A04",
        "code": "PC-A04",
        "name": "Portrait Photography Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Photography Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Portrait Artist",
        "sdgs": [
            4,
            5,
            10
        ],
        "ga": [
            "Creativity",
            "Communication",
            "Critical Thinking",
            "Digital Literacy"
        ],
        "purpose": "A practical workshop focused on the art of portrait photography, enabling participants to capture expressive and visually compelling portraits through effective use of lighting, posing, composition, and camera techniques.",
        "outcomes": [
            "Capture well-composed portrait photographs.",
            "Apply lighting techniques for portrait photography.",
            "Direct subjects using appropriate posing techniques.",
            "Enhance portrait images through basic post-processing."
        ],
        "competencies": [
            "Portrait photography",
            "Lighting techniques",
            "Subject communication",
            "Composition",
            "Photo editing"
        ],
        "syllabus": [
            "Fundamentals of Portrait Photography",
            "Natural & Studio Lighting",
            "Subject Posing Techniques",
            "Camera Settings for Portraits",
            "Background Selection & Composition",
            "Basic Portrait Editing"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Photography Club Mentor"
    },
    {
        "id": "LCH-PC-A05",
        "code": "PC-A05",
        "name": "Street Photography Challenge",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Photography Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Street Observer",
        "sdgs": [
            4,
            11,
            16
        ],
        "ga": [
            "Creativity",
            "Critical Thinking",
            "Ethical Responsibility",
            "Cultural Awareness"
        ],
        "purpose": "A photography challenge that encourages participants to document everyday life, culture, and human interactions in public spaces, fostering the ability to capture authentic moments through ethical and creative street photography.",
        "outcomes": [
            "Capture candid moments in public environments.",
            "Apply composition and timing techniques in street photography.",
            "Demonstrate ethical practices while photographing people and public spaces.",
            "Create visual narratives that reflect everyday life and culture."
        ],
        "competencies": [
            "Street photography",
            "Visual storytelling",
            "Observation skills",
            "Ethical decision-making",
            "Creative composition"
        ],
        "syllabus": [
            "Fundamentals of Street Photography",
            "Candid Photography Techniques",
            "Composition & Timing",
            "Ethics and Privacy in Public Photography",
            "Storytelling Through Images",
            "Photo Review & Critique"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Photography Club Mentor"
    },
    {
        "id": "LCH-PC-A06",
        "code": "PC-A06",
        "name": "Monochrome Photography Contest",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Photography Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Monochrome Master",
        "sdgs": [
            4,
            9,
            11
        ],
        "ga": [
            "Creativity",
            "Critical Thinking",
            "Innovation",
            "Digital Literacy"
        ],
        "purpose": "A photography competition that challenges participants to create impactful black-and-white photographs, emphasizing contrast, texture, lighting, composition, and emotion without the use of color.",
        "outcomes": [
            "Create compelling monochrome photographs using artistic composition.",
            "Apply contrast, lighting, and tonal techniques effectively.",
            "Communicate emotions and stories through black-and-white imagery.",
            "Critically evaluate monochrome photographs based on aesthetic and technical quality."
        ],
        "competencies": [
            "Monochrome photography",
            "Creative composition",
            "Visual storytelling",
            "Tonal editing",
            "Artistic interpretation"
        ],
        "syllabus": [
            "Principles of Monochrome Photography",
            "Contrast, Tone & Texture",
            "Light and Shadow Techniques",
            "Composition in Black & White",
            "Monochrome Editing Techniques",
            "Photo Judging & Critique"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Photography Club Mentor"
    },
    {
        "id": "LCH-PC-A07",
        "code": "PC-A07",
        "name": "Macro Photography Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Photography Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Macro Specialist",
        "sdgs": [
            4,
            9,
            15
        ],
        "ga": [
            "Creativity",
            "Critical Thinking",
            "Scientific Observation",
            "Digital Literacy"
        ],
        "purpose": "A hands-on workshop that introduces participants to macro photography techniques, enabling them to capture detailed close-up images of small subjects while understanding focus, depth of field, lighting, and composition.",
        "outcomes": [
            "Capture detailed close-up photographs of small subjects.",
            "Apply macro photography techniques using appropriate camera settings.",
            "Control focus, depth of field, and lighting for macro images.",
            "Create visually engaging macro compositions."
        ],
        "competencies": [
            "Macro photography",
            "Precision focusing",
            "Technical camera operation",
            "Lighting techniques",
            "Attention to detail"
        ],
        "syllabus": [
            "Introduction to Macro Photography",
            "Macro Lenses & Accessories",
            "Focus & Depth of Field",
            "Lighting for Macro Photography",
            "Composition Techniques",
            "Image Review & Editing"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Photography Club Mentor"
    },
    {
        "id": "LCH-PC-A08",
        "code": "PC-A08",
        "name": "Night Photography Expedition",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Photography Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Night Owl",
        "sdgs": [
            4,
            9,
            11
        ],
        "ga": [
            "Creativity",
            "Critical Thinking",
            "Problem Solving",
            "Digital Literacy"
        ],
        "purpose": "An experiential photography session that enables participants to explore low-light and night photography techniques, capturing cityscapes, landscapes, and light trails while mastering exposure, stability, and creative lighting.",
        "outcomes": [
            "Capture high-quality photographs in low-light conditions.",
            "Apply long-exposure photography techniques effectively.",
            "Configure camera settings for night photography.",
            "Produce creative images using artificial and ambient lighting."
        ],
        "competencies": [
            "Night photography",
            "Long-exposure photography",
            "Technical camera operation",
            "Low-light image processing",
            "Creative visualization"
        ],
        "syllabus": [
            "Fundamentals of Night Photography",
            "Long Exposure Techniques",
            "ISO, Aperture & Shutter Speed Optimization",
            "Tripod & Camera Stabilization",
            "Light Trails & Creative Lighting",
            "Noise Reduction & Post-Processing"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Photography Club Mentor"
    },
    {
        "id": "LCH-PC-A09",
        "code": "PC-A09",
        "name": "Campus Photography Exhibition",
        "domain": "LCH",
        "level": "leader",
        "pack": "Photography Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Exhibition Curator",
        "sdgs": [
            4,
            11,
            17
        ],
        "ga": [
            "Creativity",
            "Communication",
            "Leadership",
            "Professionalism"
        ],
        "purpose": "A curated exhibition that provides participants with an opportunity to showcase their best photographic works, receive professional feedback, and engage the university community through visual storytelling and artistic expression.",
        "outcomes": [
            "Present photographic work in a professional exhibition setting.",
            "Curate and organize photographs based on a common theme.",
            "Communicate ideas and stories through visual presentations.",
            "Evaluate photographic works through peer and expert feedback."
        ],
        "competencies": [
            "Portfolio development",
            "Exhibition curation",
            "Visual communication",
            "Presentation skills",
            "Critical evaluation"
        ],
        "syllabus": [
            "Portfolio Selection",
            "Exhibition Planning & Curation",
            "Print Preparation & Display Techniques",
            "Visual Storytelling",
            "Audience Engagement",
            "Exhibition Review & Feedback"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Photography Club Committee"
    },
    {
        "id": "LCH-PC-A10",
        "code": "PC-A10",
        "name": "Annual Photography Awards",
        "domain": "LCH",
        "level": "leader",
        "pack": "Photography Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Award Winning Lens",
        "sdgs": [
            4,
            9,
            17
        ],
        "ga": [
            "Creativity",
            "Leadership",
            "Professionalism",
            "Lifelong Learning"
        ],
        "purpose": "A prestigious annual recognition event that celebrates excellence in photography by honoring outstanding works across various categories, encouraging innovation, artistic expression, and continuous improvement among photographers.",
        "outcomes": [
            "Demonstrate excellence in photographic creativity and technical execution.",
            "Present a professional photography portfolio for evaluation.",
            "Analyze photographic works based on established judging criteria.",
            "Appreciate diverse photographic styles and artistic perspectives."
        ],
        "competencies": [
            "Portfolio presentation",
            "Professional photography",
            "Creative excellence",
            "Critical evaluation",
            "Artistic expression"
        ],
        "syllabus": [
            "Photography Award Categories",
            "Portfolio Submission Guidelines",
            "Judging Criteria & Evaluation",
            "Artistic & Technical Excellence",
            "Awards Presentation",
            "Jury Feedback & Reflection"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Photography Club Committee"
    },
    {
        "id": "LCH-SF-A01",
        "code": "SF-A01",
        "name": "Short Film Club Orientation & Film Appreciation Session",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Film Explorer",
        "sdgs": [
            4,
            10,
            16
        ],
        "ga": [
            "Critical thinking",
            "Communication",
            "Ethical awareness",
            "Lifelong learning"
        ],
        "purpose": "An introductory session that familiarizes students with the Short Film Makers Club, filmmaking fundamentals, and the art of appreciating cinema through guided film screenings and discussions.",
        "outcomes": [
            "Understand the objectives and activities of the club.",
            "Identify the basic elements of filmmaking.",
            "Analyze short films from artistic and technical perspectives.",
            "Develop critical appreciation of visual storytelling."
        ],
        "competencies": [
            "Film appreciation",
            "Critical thinking",
            "Media literacy",
            "Observation skills",
            "Communication"
        ],
        "syllabus": [
            "Club orientation",
            "Introduction to filmmaking",
            "Film genres",
            "Visual storytelling",
            "Film appreciation techniques",
            "Group discussion and film review"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A02",
        "code": "SF-A02",
        "name": "Mobile Filmmaking Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Mobile Filmmaker",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Digital literacy",
            "Creativity",
            "Innovation",
            "Problem solving"
        ],
        "purpose": "A practical workshop that teaches participants to create professional-quality videos using smartphones by applying filming, editing, lighting, and storytelling techniques.",
        "outcomes": [
            "Capture high-quality videos using mobile devices.",
            "Apply framing and composition techniques.",
            "Record clear audio and use effective lighting.",
            "Edit and publish engaging video content."
        ],
        "competencies": [
            "Mobile filmmaking",
            "Video production",
            "Editing",
            "Visual storytelling",
            "Digital content creation"
        ],
        "syllabus": [
            "Mobile camera settings",
            "Shot composition",
            "Camera movements",
            "Lighting techniques",
            "Audio recording",
            "Mobile video editing",
            "Social media publishing"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A03",
        "code": "SF-A03",
        "name": "Screenwriting Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Screenwriter",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Creativity",
            "Communication",
            "Critical thinking",
            "Innovation"
        ],
        "purpose": "A creative writing workshop that enables participants to develop original stories, write screenplays, and structure compelling narratives for short films.",
        "outcomes": [
            "Generate original story ideas.",
            "Structure stories using screenplay formats.",
            "Develop characters and dialogues.",
            "Produce complete short film scripts."
        ],
        "competencies": [
            "Creative writing",
            "Storytelling",
            "Script development",
            "Communication",
            "Creative thinking"
        ],
        "syllabus": [
            "Story development",
            "Three-act structure",
            "Character creation",
            "Dialogue writing",
            "Screenplay formatting",
            "Script pitching"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A04",
        "code": "SF-A04",
        "name": "Storyboarding Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Storyboard Artist",
        "sdgs": [
            4,
            9
        ],
        "ga": [
            "Creativity",
            "Teamwork",
            "Communication",
            "Problem solving"
        ],
        "purpose": "A hands-on workshop where participants convert scripts into visual storyboards to plan scenes, camera angles, and shot sequences before production.",
        "outcomes": [
            "Create storyboards from scripts.",
            "Plan effective shot sequences.",
            "Visualize camera movements.",
            "Improve production planning."
        ],
        "competencies": [
            "Visualization",
            "Production planning",
            "Creative communication",
            "Team collaboration",
            "Artistic design"
        ],
        "syllabus": [
            "Storyboarding basics",
            "Shot planning",
            "Camera angles",
            "Scene composition",
            "Continuity planning",
            "Digital storyboarding tools"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A05",
        "code": "SF-A05",
        "name": "Cinematography Basics Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Cinematographer",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Technical competence",
            "Creativity",
            "Communication",
            "Teamwork"
        ],
        "purpose": "A practical workshop introducing participants to camera operations, framing, lighting, composition, and visual storytelling techniques used in filmmaking.",
        "outcomes": [
            "Operate cameras effectively.",
            "Apply framing and composition principles.",
            "Use lighting for cinematic visuals.",
            "Capture high-quality video footage."
        ],
        "competencies": [
            "Cinematography",
            "Camera handling",
            "Lighting techniques",
            "Visual storytelling",
            "Technical proficiency"
        ],
        "syllabus": [
            "Camera operations",
            "Exposure and focus",
            "Shot composition",
            "Camera movements",
            "Lighting basics",
            "Practical filming exercises"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A06",
        "code": "SF-A06",
        "name": "Camera Handling & Framing Session",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Camera Operator",
        "sdgs": [
            4,
            8
        ],
        "ga": [
            "Technical competence",
            "Creativity",
            "Critical thinking",
            "Communication"
        ],
        "purpose": "A practical training session focused on developing participants' skills in operating cameras, selecting appropriate shot types, and applying framing techniques to create visually compelling scenes.",
        "outcomes": [
            "Operate cameras confidently and safely.",
            "Apply framing and composition techniques.",
            "Select appropriate shot sizes and angles.",
            "Capture visually balanced footage."
        ],
        "competencies": [
            "Camera operation",
            "Framing",
            "Composition",
            "Visual observation",
            "Technical proficiency"
        ],
        "syllabus": [
            "Camera handling",
            "Shot sizes",
            "Camera angles",
            "Framing techniques",
            "Composition principles",
            "Practical shooting exercises"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A07",
        "code": "SF-A07",
        "name": "Video Editing Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Video Editor",
        "sdgs": [
            4,
            9
        ],
        "ga": [
            "Digital literacy",
            "Creativity",
            "Innovation",
            "Problem solving"
        ],
        "purpose": "A hands-on workshop introducing participants to video editing techniques, enabling them to organize footage, apply transitions, add sound, and produce polished short films.",
        "outcomes": [
            "Edit video using professional software.",
            "Apply transitions, titles, and effects.",
            "Synchronize audio with visuals.",
            "Produce a complete edited video."
        ],
        "competencies": [
            "Video editing",
            "Audio synchronization",
            "Post-production",
            "Attention to detail",
            "Digital creativity"
        ],
        "syllabus": [
            "Editing interface",
            "Timeline management",
            "Video trimming",
            "Audio editing",
            "Transitions and titles",
            "Export settings"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A08",
        "code": "SF-A08",
        "name": "Acting for Camera Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Film Actor",
        "sdgs": [
            3,
            4
        ],
        "ga": [
            "Communication",
            "Creativity",
            "Self-confidence",
            "Teamwork"
        ],
        "purpose": "A practical workshop designed to develop participants' on-camera acting skills through character development, expression, dialogue delivery, and performance techniques.",
        "outcomes": [
            "Perform confidently before the camera.",
            "Develop believable characters.",
            "Demonstrate effective facial expressions and body language.",
            "Deliver dialogues naturally."
        ],
        "competencies": [
            "Acting",
            "Communication",
            "Confidence",
            "Emotional expression",
            "Stage presence"
        ],
        "syllabus": [
            "Acting fundamentals",
            "Character development",
            "Facial expressions",
            "Body language",
            "Dialogue delivery",
            "Camera performance exercises"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A09",
        "code": "SF-A09",
        "name": "Direction & Filmmaking Masterclass",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Film Director",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Leadership",
            "Innovation",
            "Critical thinking",
            "Teamwork"
        ],
        "purpose": "An advanced learning session where participants explore the responsibilities of a film director, including script interpretation, actor direction, production planning, and visual storytelling.",
        "outcomes": [
            "Interpret scripts for production.",
            "Direct actors effectively.",
            "Plan film shoots systematically.",
            "Apply creative decision-making during filmmaking."
        ],
        "competencies": [
            "Film direction",
            "Leadership",
            "Decision making",
            "Creative planning",
            "Team management"
        ],
        "syllabus": [
            "Role of a director",
            "Script interpretation",
            "Directing actors",
            "Shot planning",
            "Production workflow",
            "Leadership in filmmaking"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A10",
        "code": "SF-A10",
        "name": "One-Minute Film Challenge",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Micro Filmmaker",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Creativity",
            "Innovation",
            "Problem solving",
            "Communication"
        ],
        "purpose": "A creative filmmaking competition where participants conceptualize, produce, and edit a compelling story within a one-minute duration, encouraging concise storytelling and technical efficiency.",
        "outcomes": [
            "Develop impactful stories within time constraints.",
            "Apply filmmaking techniques effectively.",
            "Demonstrate creativity in visual storytelling.",
            "Evaluate films using constructive feedback."
        ],
        "competencies": [
            "Storytelling",
            "Creativity",
            "Time management",
            "Video production",
            "Critical evaluation"
        ],
        "syllabus": [
            "Concept development",
            "Storyboarding",
            "One-minute storytelling",
            "Video production",
            "Editing techniques",
            "Film screening and evaluation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A11",
        "code": "SF-A11",
        "name": "48-Hour Short Film Challenge",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "48H Filmmaker",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Leadership",
            "Teamwork",
            "Innovation",
            "Adaptability"
        ],
        "purpose": "An intensive filmmaking competition where participants conceptualize, script, shoot, edit, and present a short film within 48 hours, fostering creativity, teamwork, and effective time management.",
        "outcomes": [
            "Develop and execute a film project within a limited timeframe.",
            "Collaborate effectively in production teams.",
            "Apply end-to-end filmmaking techniques.",
            "Demonstrate problem-solving under production constraints."
        ],
        "competencies": [
            "Teamwork",
            "Time management",
            "Film production",
            "Creative problem solving",
            "Leadership"
        ],
        "syllabus": [
            "Rapid story development",
            "Scriptwriting",
            "Production planning",
            "Shooting techniques",
            "Video editing",
            "Film presentation and evaluation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Short Film Club Committee"
    },
    {
        "id": "LCH-SF-A12",
        "code": "SF-A12",
        "name": "Documentary Film Challenge",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Docu Maker",
        "sdgs": [
            4,
            11,
            13,
            16
        ],
        "ga": [
            "Ethical responsibility",
            "Critical thinking",
            "Communication",
            "Social responsibility"
        ],
        "purpose": "A filmmaking challenge where participants create documentary films on social, cultural, environmental, or community-based themes, promoting research, factual storytelling, and social awareness.",
        "outcomes": [
            "Conduct basic research for documentary filmmaking.",
            "Develop factual visual narratives.",
            "Apply interview and field recording techniques.",
            "Produce informative documentary films."
        ],
        "competencies": [
            "Research",
            "Visual storytelling",
            "Communication",
            "Interviewing",
            "Social awareness"
        ],
        "syllabus": [
            "Documentary filmmaking",
            "Research methods",
            "Interview techniques",
            "Field shooting",
            "Editing documentaries",
            "Ethical storytelling"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Short Film Club Committee"
    },
    {
        "id": "LCH-SF-A13",
        "code": "SF-A13",
        "name": "Film Review & Discussion Session",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Film Critic",
        "sdgs": [
            4,
            10,
            16
        ],
        "ga": [
            "Critical thinking",
            "Communication",
            "Lifelong learning",
            "Ethical awareness"
        ],
        "purpose": "An interactive session where participants critically review short films and engage in discussions on storytelling, cinematography, editing, direction, and the social impact of cinema.",
        "outcomes": [
            "Critically analyze films.",
            "Express opinions through constructive discussions.",
            "Evaluate technical and artistic aspects of filmmaking.",
            "Develop appreciation for diverse cinematic styles."
        ],
        "competencies": [
            "Critical thinking",
            "Film appreciation",
            "Communication",
            "Analytical skills",
            "Observation"
        ],
        "syllabus": [
            "Film review techniques",
            "Story analysis",
            "Cinematography evaluation",
            "Editing analysis",
            "Character analysis",
            "Group discussion"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A14",
        "code": "SF-A14",
        "name": "Film Screening & Analysis",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Film Analyst",
        "sdgs": [
            4,
            10
        ],
        "ga": [
            "Critical thinking",
            "Communication",
            "Creativity",
            "Lifelong learning"
        ],
        "purpose": "An educational activity where selected films are screened and analyzed to understand filmmaking techniques, narrative structures, visual language, and audience engagement.",
        "outcomes": [
            "Interpret cinematic language.",
            "Identify filmmaking techniques used in films.",
            "Analyze visual storytelling methods.",
            "Appreciate different filmmaking styles and genres."
        ],
        "competencies": [
            "Film appreciation",
            "Visual analysis",
            "Observation",
            "Critical evaluation",
            "Media literacy"
        ],
        "syllabus": [
            "Film screening",
            "Narrative analysis",
            "Cinematography",
            "Editing styles",
            "Sound design",
            "Audience interpretation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A15",
        "code": "SF-A15",
        "name": "Reels & Short Video Content Challenge",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Reels Creator",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Digital literacy",
            "Creativity",
            "Innovation",
            "Entrepreneurship"
        ],
        "purpose": "A creative competition where participants produce engaging short-form videos for digital platforms, emphasizing storytelling, audience engagement, and responsible digital content creation.",
        "outcomes": [
            "Produce engaging short-form videos.",
            "Apply storytelling techniques for digital media.",
            "Use editing tools to enhance content quality.",
            "Evaluate content based on creativity and audience impact."
        ],
        "competencies": [
            "Content creation",
            "Mobile videography",
            "Video editing",
            "Creativity",
            "Digital communication"
        ],
        "syllabus": [
            "Content ideation",
            "Short-form storytelling",
            "Mobile videography",
            "Video editing",
            "Social media optimization",
            "Content evaluation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A16",
        "code": "SF-A16",
        "name": "Sound Design & Background Music Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Sound Designer",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Creativity",
            "Technical competence",
            "Communication",
            "Innovation"
        ],
        "purpose": "A practical workshop that introduces participants to the fundamentals of sound design, audio recording, background music selection, Foley techniques, and audio editing to enhance the emotional and narrative impact of films.",
        "outcomes": [
            "Understand the role of sound in filmmaking.",
            "Record and edit high-quality audio.",
            "Apply background music and sound effects effectively.",
            "Enhance storytelling through sound design."
        ],
        "competencies": [
            "Sound design",
            "Audio editing",
            "Foley production",
            "Creative storytelling",
            "Technical proficiency"
        ],
        "syllabus": [
            "Fundamentals of sound design",
            "Audio recording techniques",
            "Foley and sound effects",
            "Background music selection",
            "Audio editing and mixing",
            "Sound synchronization"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A17",
        "code": "SF-A17",
        "name": "VFX & Color Grading Basics Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "VFX Artist",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Digital literacy",
            "Creativity",
            "Innovation",
            "Technical competence"
        ],
        "purpose": "A hands-on workshop that introduces participants to visual effects (VFX), color correction, and color grading techniques to improve the visual quality and cinematic appeal of short films.",
        "outcomes": [
            "Apply basic visual effects to videos.",
            "Perform color correction and grading.",
            "Enhance the visual aesthetics of film projects.",
            "Produce polished and professional-looking videos."
        ],
        "competencies": [
            "Visual effects",
            "Color grading",
            "Video enhancement",
            "Digital creativity",
            "Post-production"
        ],
        "syllabus": [
            "Introduction to VFX",
            "Color correction",
            "Color grading",
            "Visual enhancement techniques",
            "Motion graphics basics",
            "Exporting final projects"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Short Film Club Mentor"
    },
    {
        "id": "LCH-SF-A18",
        "code": "SF-A18",
        "name": "Inter-College Short Film Competition",
        "domain": "LCH",
        "level": "leader",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Film Rep",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Leadership",
            "Teamwork",
            "Communication",
            "Innovation"
        ],
        "purpose": "A competitive event where student filmmakers from different institutions present original short films, encouraging creativity, collaboration, healthy competition, and exposure to diverse filmmaking styles.",
        "outcomes": [
            "Produce original short films for competition.",
            "Demonstrate creativity and technical filmmaking skills.",
            "Collaborate effectively within production teams.",
            "Evaluate films through peer and expert feedback."
        ],
        "competencies": [
            "Film production",
            "Teamwork",
            "Leadership",
            "Creative thinking",
            "Professional presentation"
        ],
        "syllabus": [
            "Film production",
            "Competition guidelines",
            "Team collaboration",
            "Film presentation",
            "Jury evaluation",
            "Feedback and reflection"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Short Film Club Committee"
    },
    {
        "id": "LCH-SF-A19",
        "code": "SF-A19",
        "name": "Campus Short Film Festival",
        "domain": "LCH",
        "level": "leader",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Festival Host",
        "sdgs": [
            4,
            11,
            17
        ],
        "ga": [
            "Leadership",
            "Communication",
            "Teamwork",
            "Social responsibility"
        ],
        "purpose": "A film festival showcasing student-produced short films to the campus community, providing a platform for creative expression, audience engagement, peer learning, and recognition of filmmaking excellence.",
        "outcomes": [
            "Showcase original filmmaking projects.",
            "Present creative work to public audiences.",
            "Analyze audience responses and feedback.",
            "Promote a culture of artistic appreciation."
        ],
        "competencies": [
            "Event management",
            "Film presentation",
            "Public engagement",
            "Communication",
            "Leadership"
        ],
        "syllabus": [
            "Film festival planning",
            "Film screening",
            "Audience engagement",
            "Panel discussions",
            "Jury feedback",
            "Awards presentation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 300,
        "faculty": "Short Film Club Committee"
    },
    {
        "id": "LCH-SF-A20",
        "code": "SF-A20",
        "name": "Annual Film Awards & Premiere Night",
        "domain": "LCH",
        "level": "leader",
        "pack": "Short Film Makers Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Film Awardee",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Leadership",
            "Communication",
            "Lifelong learning",
            "Professional ethics"
        ],
        "purpose": "A celebratory event recognizing outstanding achievements in filmmaking through film premieres, award presentations, and appreciation of excellence in directing, acting, cinematography, editing, and storytelling.",
        "outcomes": [
            "Present completed film projects professionally.",
            "Recognize quality standards in filmmaking.",
            "Appreciate diverse creative contributions.",
            "Reflect on personal and team achievements."
        ],
        "competencies": [
            "Professional presentation",
            "Leadership",
            "Teamwork",
            "Creative excellence",
            "Self-reflection"
        ],
        "syllabus": [
            "Film premiere",
            "Award categories",
            "Jury evaluation",
            "Creative excellence",
            "Reflection and feedback",
            "Future filmmaking opportunities"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 300,
        "faculty": "Short Film Club Committee"
    },
    {
        "id": "LCH-HC-A01",
        "code": "HC-A01",
        "name": "Handicrafts Club Orientation & Craft Showcase",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Craft Explorer",
        "sdgs": [
            4,
            11,
            12
        ],
        "ga": [
            "Creativity",
            "Lifelong Learning",
            "Cultural Appreciation",
            "Effective Communication",
            "Teamwork"
        ],
        "purpose": "The Handicrafts Club Orientation & Craft Showcase serves as the inaugural activity introducing students to the club's vision, objectives, annual roadmap, and competency programmes.",
        "outcomes": [
            "Understand the vision, objectives, and structure of the Handicrafts Club.",
            "Identify various traditional and contemporary handicraft techniques.",
            "Recognize opportunities for skill development through club activities and programmes.",
            "Appreciate the cultural, artistic, and economic significance of handicrafts.",
            "Develop motivation to participate in creative and collaborative craft initiatives."
        ],
        "competencies": [
            "Creative Awareness",
            "Artistic Appreciation",
            "Observation Skills",
            "Communication",
            "Cultural Understanding",
            "Collaboration",
            "Self-Motivation"
        ],
        "syllabus": [
            "Introduction to the Handicrafts Club",
            "Club Vision, Mission, and Annual Activities",
            "Overview of Competency Programmes",
            "Traditional Indian Handicrafts",
            "Contemporary Craft Trends",
            "Sustainable Craft Practices",
            "Student Craft Showcase"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A02",
        "code": "HC-A02",
        "name": "DIY Craft Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "DIY Crafter",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Creativity",
            "Innovation",
            "Critical Thinking",
            "Self-Learning",
            "Professional Ethics"
        ],
        "purpose": "The DIY (Do-It-Yourself) Craft Workshop introduces participants to the fundamentals of creating handmade decorative and functional items using simple tools and readily available materials.",
        "outcomes": [
            "Apply basic craft-making techniques independently.",
            "Design and create simple handmade craft products.",
            "Select appropriate materials and tools for various craft projects.",
            "Demonstrate creativity in developing personalized craft designs.",
            "Practice safe handling of craft tools and materials."
        ],
        "competencies": [
            "Creativity",
            "Design Thinking",
            "Fine Motor Skills",
            "Problem Solving",
            "Manual Dexterity",
            "Innovation",
            "Craftsmanship"
        ],
        "syllabus": [
            "Introduction to DIY Crafts",
            "Craft Planning and Design",
            "Material Selection",
            "Basic Cutting and Assembly Techniques",
            "Decorative Techniques",
            "Adhesives and Finishing"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A03",
        "code": "HC-A03",
        "name": "Paper Craft Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Paper Crafter",
        "sdgs": [
            4,
            11,
            12
        ],
        "ga": [
            "Creativity",
            "Innovation",
            "Critical Thinking",
            "Lifelong Learning",
            "Cultural Appreciation"
        ],
        "purpose": "The Paper Craft Workshop introduces participants to creative paper-based art and design techniques used for decorative, educational, and functional purposes.",
        "outcomes": [
            "Apply fundamental paper crafting techniques.",
            "Create decorative and functional paper craft products.",
            "Demonstrate precision in cutting, folding, and assembling paper.",
            "Design original paper-based artistic creations.",
            "Present completed paper crafts with professional finishing."
        ],
        "competencies": [
            "Precision",
            "Artistic Design",
            "Creativity",
            "Visual Composition",
            "Manual Skills",
            "Patience",
            "Attention to Detail"
        ],
        "syllabus": [
            "Types of Craft Paper",
            "Paper Folding Techniques",
            "Cutting and Layering",
            "Paper Sculpting",
            "Decorative Paper Art",
            "Greeting Card Design"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A04",
        "code": "HC-A04",
        "name": "Origami Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Origami Folder",
        "sdgs": [
            4,
            11,
            12
        ],
        "ga": [
            "Creativity",
            "Critical Thinking",
            "Lifelong Learning",
            "Innovation",
            "Discipline"
        ],
        "purpose": "The Origami Workshop introduces the Japanese art of paper folding, enabling participants to transform flat sheets into intricate three-dimensional creations without cutting or gluing.",
        "outcomes": [
            "Apply basic and intermediate origami folding techniques.",
            "Construct geometric and artistic origami models accurately.",
            "Demonstrate improved concentration and spatial visualization.",
            "Interpret origami diagrams and folding instructions.",
            "Create original paper-folding designs using learned techniques."
        ],
        "competencies": [
            "Spatial Reasoning",
            "Precision",
            "Concentration",
            "Creativity",
            "Problem Solving",
            "Fine Motor Skills",
            "Patience"
        ],
        "syllabus": [
            "History of Origami",
            "Basic Folding Symbols",
            "Valley and Mountain Folds",
            "Geometric Folding",
            "Animal Models",
            "Floral Models"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A05",
        "code": "HC-A05",
        "name": "Quilling Art Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Quilling Artist",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Creativity",
            "Innovation",
            "Critical Thinking",
            "Lifelong Learning",
            "Professional Excellence"
        ],
        "purpose": "The Quilling Art Workshop introduces participants to the decorative craft of rolling, shaping, and assembling narrow strips of paper into intricate artistic designs.",
        "outcomes": [
            "Demonstrate basic and intermediate paper quilling techniques.",
            "Create decorative quilled artworks using various shapes and patterns.",
            "Apply principles of color harmony and composition in quilling projects.",
            "Produce professional-quality handmade decorative products.",
            "Evaluate and refine craft work based on aesthetic and technical quality."
        ],
        "competencies": [
            "Precision",
            "Creativity",
            "Fine Motor Coordination",
            "Artistic Design",
            "Attention to Detail",
            "Visual Composition",
            "Craftsmanship"
        ],
        "syllabus": [
            "Introduction to Paper Quilling",
            "Quilling Tools and Materials",
            "Basic Coil Techniques",
            "Advanced Quilling Shapes",
            "Floral and Decorative Patterns",
            "Layering and Composition"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A06",
        "code": "HC-A06",
        "name": "Best Out of Waste Challenge",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Eco Crafter",
        "sdgs": [
            4,
            12,
            13
        ],
        "ga": [
            "Creativity",
            "Innovation",
            "Environmental Responsibility",
            "Critical Thinking",
            "Social Responsibility"
        ],
        "purpose": "The Best Out of Waste Challenge encourages participants to transform discarded and recyclable materials into innovative, functional, and aesthetically appealing handicraft products.",
        "outcomes": [
            "Apply creative design principles to upcycle waste materials.",
            "Develop innovative handicraft products using recyclable resources.",
            "Demonstrate responsible material utilization and waste reduction practices.",
            "Present sustainable craft solutions with functional and artistic value.",
            "Evaluate designs based on creativity, usability, and sustainability."
        ],
        "competencies": [
            "Creativity",
            "Sustainable Design",
            "Innovation",
            "Problem Solving",
            "Resource Management",
            "Craftsmanship",
            "Environmental Responsibility"
        ],
        "syllabus": [
            "Introduction to Upcycling",
            "Types of Recyclable Materials",
            "Sustainable Design Principles",
            "Product Concept Development",
            "Craft Construction Techniques",
            "Decorative Finishing"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A07",
        "code": "HC-A07",
        "name": "Greeting Card & Bookmark Making",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Card Maker",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Creativity",
            "Communication",
            "Innovation",
            "Lifelong Learning",
            "Cultural Appreciation"
        ],
        "purpose": "This activity introduces participants to the design and creation of handmade greeting cards and bookmarks using paper crafting techniques, decorative materials, and creative typography.",
        "outcomes": [
            "Design aesthetically appealing greeting cards and bookmarks.",
            "Apply decorative paper craft techniques effectively.",
            "Demonstrate creativity through personalized artistic designs.",
            "Utilize color, typography, and composition principles.",
            "Produce professionally finished handmade stationery products."
        ],
        "competencies": [
            "Creativity",
            "Artistic Design",
            "Visual Communication",
            "Precision",
            "Fine Motor Skills",
            "Craftsmanship",
            "Aesthetic Appreciation"
        ],
        "syllabus": [
            "Greeting Card Design Principles",
            "Bookmark Design",
            "Paper Selection",
            "Typography Basics",
            "Decorative Embellishments",
            "Layering Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A08",
        "code": "HC-A08",
        "name": "Clay Modelling Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Clay Modeler",
        "sdgs": [
            4,
            11,
            12
        ],
        "ga": [
            "Creativity",
            "Critical Thinking",
            "Innovation",
            "Lifelong Learning",
            "Professional Excellence"
        ],
        "purpose": "The Clay Modelling Workshop provides hands-on experience in sculpting and shaping clay into artistic and functional objects.",
        "outcomes": [
            "Apply fundamental clay modelling techniques.",
            "Construct three-dimensional artistic forms.",
            "Demonstrate control over shaping, carving, and texturing methods.",
            "Develop original clay craft designs.",
            "Evaluate finished products based on craftsmanship and aesthetics."
        ],
        "competencies": [
            "Sculpture Skills",
            "Creativity",
            "Spatial Visualization",
            "Fine Motor Coordination",
            "Patience",
            "Craftsmanship",
            "Artistic Expression"
        ],
        "syllabus": [
            "Introduction to Clay Types",
            "Clay Preparation",
            "Hand Building Techniques",
            "Pinching, Coiling and Slab Construction",
            "Sculpting Methods",
            "Surface Texturing"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A09",
        "code": "HC-A09",
        "name": "Terracotta Art Demonstration",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Terracotta Artist",
        "sdgs": [
            4,
            11,
            12
        ],
        "ga": [
            "Cultural Appreciation",
            "Creativity",
            "Innovation",
            "Ethical Responsibility",
            "Lifelong Learning"
        ],
        "purpose": "The Terracotta Art Demonstration introduces participants to one of the oldest traditional craft forms, highlighting techniques used in shaping, decorating, and preserving terracotta artifacts.",
        "outcomes": [
            "Understand traditional terracotta craft techniques.",
            "Demonstrate basic shaping and decorative methods.",
            "Recognize the cultural significance of terracotta art.",
            "Apply surface finishing and ornamentation techniques.",
            "Appreciate the role of traditional crafts in heritage preservation."
        ],
        "competencies": [
            "Traditional Craftsmanship",
            "Cultural Awareness",
            "Artistic Skills",
            "Creativity",
            "Observation",
            "Precision",
            "Heritage Appreciation"
        ],
        "syllabus": [
            "History of Terracotta Art",
            "Types of Clay",
            "Traditional Hand Building Techniques",
            "Decorative Carving",
            "Surface Ornamentation",
            "Traditional Motifs"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A10",
        "code": "HC-A10",
        "name": "Bottle & Glass Painting Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Glass Painter",
        "sdgs": [
            4,
            12,
            13
        ],
        "ga": [
            "Creativity",
            "Innovation",
            "Environmental Responsibility",
            "Critical Thinking",
            "Professional Excellence"
        ],
        "purpose": "The Bottle & Glass Painting Workshop enables participants to transform ordinary glass bottles, jars, and decorative glassware into attractive artistic pieces using specialized painting techniques.",
        "outcomes": [
            "Apply glass painting techniques using appropriate materials.",
            "Design decorative patterns suitable for glass surfaces.",
            "Demonstrate proper surface preparation and finishing methods.",
            "Repurpose used glass products into decorative craft items.",
            "Produce professionally finished glass art suitable for exhibitions and gifting."
        ],
        "competencies": [
            "Decorative Painting",
            "Creativity",
            "Color Coordination",
            "Precision",
            "Fine Motor Skills",
            "Sustainable Design",
            "Artistic Expression"
        ],
        "syllabus": [
            "Introduction to Glass Painting",
            "Surface Cleaning and Preparation",
            "Glass Paints and Tools",
            "Brush Techniques",
            "Stencil and Freehand Designs",
            "Color Blending"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A11",
        "code": "HC-A11",
        "name": "Fabric Painting Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Fabric Painter",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Creativity",
            "Innovation",
            "Critical Thinking",
            "Lifelong Learning",
            "Professional Excellence"
        ],
        "purpose": "The Fabric Painting Workshop introduces participants to decorative textile art through the application of painting techniques on fabrics using specialized paints and tools.",
        "outcomes": [
            "Apply fabric painting techniques on different textile materials.",
            "Design creative patterns using color theory and composition.",
            "Demonstrate proper fabric preparation and finishing methods.",
            "Produce customized fabric-based decorative and wearable products.",
            "Evaluate finished artwork based on aesthetics, durability, and craftsmanship."
        ],
        "competencies": [
            "Textile Design",
            "Creativity",
            "Color Coordination",
            "Fine Motor Skills",
            "Artistic Expression",
            "Precision",
            "Product Design"
        ],
        "syllabus": [
            "Introduction to Fabric Painting",
            "Types of Fabrics and Paints",
            "Fabric Preparation Techniques",
            "Brush and Sponge Techniques",
            "Stencil Printing",
            "Freehand Textile Design"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A12",
        "code": "HC-A12",
        "name": "Candle Making Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Candle Maker",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Innovation",
            "Creativity",
            "Entrepreneurship",
            "Professional Ethics",
            "Lifelong Learning"
        ],
        "purpose": "The Candle Making Workshop introduces participants to the process of designing and producing decorative, scented, and functional candles using different waxes, molds, colors, fragrances, and decorative elements.",
        "outcomes": [
            "Prepare decorative and functional candles using standard techniques.",
            "Select suitable waxes, fragrances, molds, and decorative materials.",
            "Demonstrate safe handling of candle-making equipment.",
            "Design aesthetically appealing candles for gifting and commercial purposes.",
            "Apply quality control and finishing techniques in candle production."
        ],
        "competencies": [
            "Product Development",
            "Creativity",
            "Precision",
            "Safety Awareness",
            "Entrepreneurial Skills",
            "Quality Control",
            "Craftsmanship"
        ],
        "syllabus": [
            "Introduction to Candle Making",
            "Types of Wax",
            "Wick Selection",
            "Melting and Pouring Techniques",
            "Color and Fragrance Selection",
            "Decorative Candle Design"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A13",
        "code": "HC-A13",
        "name": "Soap Making Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Soap Maker",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Innovation",
            "Entrepreneurship",
            "Professional Ethics",
            "Creativity",
            "Lifelong Learning"
        ],
        "purpose": "The Soap Making Workshop provides participants with practical experience in producing handmade soaps using natural ingredients, fragrances, essential oils, colors, and molds.",
        "outcomes": [
            "Prepare handmade soaps using standard manufacturing techniques.",
            "Select appropriate ingredients based on product requirements.",
            "Demonstrate safe handling of soap-making materials and equipment.",
            "Design attractive handmade soaps with professional finishing.",
            "Apply packaging and branding concepts for commercial presentation."
        ],
        "competencies": [
            "Product Formulation",
            "Creativity",
            "Hygiene Management",
            "Entrepreneurial Skills",
            "Product Design",
            "Quality Assurance",
            "Craftsmanship"
        ],
        "syllabus": [
            "Introduction to Soap Making",
            "Soap Bases and Ingredients",
            "Essential Oils and Fragrances",
            "Natural Colorants",
            "Molding Techniques",
            "Decorative Soap Design"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A14",
        "code": "HC-A14",
        "name": "Resin Art Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Resin Artist",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Innovation",
            "Creativity",
            "Critical Thinking",
            "Professional Excellence",
            "Lifelong Learning"
        ],
        "purpose": "The Resin Art Workshop introduces participants to contemporary resin-based craft techniques used to create decorative items, jewelry, coasters, keychains, bookmarks, and home décor products using epoxy resin.",
        "outcomes": [
            "Apply resin casting techniques to produce decorative products.",
            "Demonstrate safe handling and mixing of resin materials.",
            "Design artistic resin products using pigments, inclusions, and molds.",
            "Produce professionally finished resin crafts suitable for exhibitions and sales.",
            "Evaluate resin products based on quality, aesthetics, and functionality."
        ],
        "competencies": [
            "Contemporary Craft Skills",
            "Creativity",
            "Precision",
            "Product Design",
            "Quality Control",
            "Safety Awareness",
            "Innovation"
        ],
        "syllabus": [
            "Introduction to Resin Art",
            "Types of Resin",
            "Safety Precautions",
            "Mixing Ratios",
            "Mold Preparation",
            "Color Pigments and Decorative Inclusions"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A15",
        "code": "HC-A15",
        "name": "Jewellery Making Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Jewellery Maker",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Creativity",
            "Innovation",
            "Entrepreneurship",
            "Professional Excellence",
            "Lifelong Learning"
        ],
        "purpose": "The Jewellery Making Workshop provides participants with practical training in designing and assembling handmade jewelry using beads, wires, threads, stones, metals, resin, and other decorative materials.",
        "outcomes": [
            "Design and create handmade jewelry using various materials and techniques.",
            "Demonstrate precision in assembling decorative jewelry components.",
            "Apply aesthetic principles of color, balance, and composition.",
            "Produce market-ready jewelry products with professional finishing.",
            "Develop branding and presentation skills for handcrafted accessories."
        ],
        "competencies": [
            "Jewellery Design",
            "Creativity",
            "Precision",
            "Fine Motor Coordination",
            "Product Development",
            "Entrepreneurship",
            "Craftsmanship"
        ],
        "syllabus": [
            "Introduction to Jewellery Design",
            "Beading Techniques",
            "Wire Wrapping",
            "Thread Jewellery",
            "Resin Jewellery Basics",
            "Stone and Crystal Embellishments"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Handicrafts Club Mentor"
    },
    {
        "id": "LCH-HC-A16",
        "code": "HC-A16",
        "name": "Home Décor Craft Competition",
        "domain": "LCH",
        "level": "leader",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Décor Designer",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Creativity",
            "Innovation",
            "Critical Thinking",
            "Professional Excellence",
            "Lifelong Learning"
        ],
        "purpose": "The Home Décor Craft Competition provides participants with an opportunity to conceptualize, design, and create innovative handcrafted home décor products using diverse materials and artistic techniques.",
        "outcomes": [
            "Design functional and aesthetically appealing home décor products.",
            "Apply creative problem-solving in decorative craft design.",
            "Demonstrate craftsmanship using appropriate materials and techniques.",
            "Present handcrafted products professionally for evaluation.",
            "Critically evaluate craft products based on design, usability, and innovation."
        ],
        "competencies": [
            "Product Design",
            "Creativity",
            "Innovation",
            "Craftsmanship",
            "Aesthetic Judgment",
            "Presentation Skills",
            "Critical Evaluation"
        ],
        "syllabus": [
            "Principles of Interior Decoration",
            "Decorative Product Design",
            "Material Selection",
            "Color Harmony",
            "Surface Decoration Techniques",
            "Functional Craft Development"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Committee"
    },
    {
        "id": "LCH-HC-A17",
        "code": "HC-A17",
        "name": "Eco-Friendly Craft Exhibition",
        "domain": "LCH",
        "level": "leader",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Eco Exhibitor",
        "sdgs": [
            4,
            12,
            13
        ],
        "ga": [
            "Environmental Responsibility",
            "Creativity",
            "Leadership",
            "Communication",
            "Innovation"
        ],
        "purpose": "The Eco-Friendly Craft Exhibition provides participants with a platform to display handcrafted products developed using recycled, biodegradable, and sustainable materials.",
        "outcomes": [
            "Develop eco-friendly handicraft products using sustainable materials.",
            "Demonstrate environmental responsibility through creative design.",
            "Organize and present professional craft exhibitions.",
            "Communicate sustainability concepts through artistic expression.",
            "Evaluate the environmental impact of handcrafted products."
        ],
        "competencies": [
            "Sustainable Design",
            "Environmental Awareness",
            "Exhibition Management",
            "Creativity",
            "Public Communication",
            "Product Presentation",
            "Collaboration"
        ],
        "syllabus": [
            "Sustainable Craft Design",
            "Eco-Friendly Materials",
            "Recycling and Upcycling",
            "Exhibition Planning",
            "Display Techniques",
            "Visitor Engagement"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Handicrafts Club Committee"
    },
    {
        "id": "LCH-HC-A18",
        "code": "HC-A18",
        "name": "Festival Decoration Challenge",
        "domain": "LCH",
        "level": "leader",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Festival Decorator",
        "sdgs": [
            4,
            11,
            12
        ],
        "ga": [
            "Creativity",
            "Teamwork",
            "Leadership",
            "Cultural Appreciation",
            "Innovation"
        ],
        "purpose": "The Festival Decoration Challenge encourages participants to design and create handcrafted decorations inspired by cultural, national, and seasonal festivals.",
        "outcomes": [
            "Design themed decorative crafts for various festivals.",
            "Apply artistic principles to large-scale decorative projects.",
            "Collaborate effectively in planning and executing decoration concepts.",
            "Integrate traditional and contemporary craft techniques.",
            "Demonstrate creativity in sustainable festive décor."
        ],
        "competencies": [
            "Creativity",
            "Teamwork",
            "Cultural Appreciation",
            "Design Thinking",
            "Event Decoration",
            "Leadership",
            "Project Coordination"
        ],
        "syllabus": [
            "Festival Themes and Cultural Significance",
            "Decorative Planning",
            "Floral and Paper Decorations",
            "Eco-Friendly Decoration Techniques",
            "Lighting and Color Coordination",
            "Traditional Craft Motifs"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Handicrafts Club Committee"
    },
    {
        "id": "LCH-HC-A19",
        "code": "HC-A19",
        "name": "Handmade Gift Fair",
        "domain": "LCH",
        "level": "leader",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Gift Artisan",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Entrepreneurship",
            "Communication",
            "Innovation",
            "Leadership",
            "Professional Ethics"
        ],
        "purpose": "The Handmade Gift Fair provides participants with an opportunity to showcase, market, and sell handcrafted products developed during club activities.",
        "outcomes": [
            "Present handcrafted products professionally to customers.",
            "Apply pricing and branding strategies for handmade products.",
            "Demonstrate effective customer communication and sales techniques.",
            "Evaluate consumer preferences and market trends.",
            "Develop entrepreneurial confidence through practical selling experience."
        ],
        "competencies": [
            "Entrepreneurship",
            "Marketing",
            "Communication",
            "Customer Service",
            "Product Branding",
            "Financial Literacy",
            "Business Planning"
        ],
        "syllabus": [
            "Product Selection",
            "Branding and Packaging",
            "Pricing Strategies",
            "Display Design",
            "Customer Interaction",
            "Sales Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 300,
        "faculty": "Handicrafts Club Committee"
    },
    {
        "id": "LCH-HC-A20",
        "code": "HC-A20",
        "name": "Annual Handicrafts Exhibition & Awards",
        "domain": "LCH",
        "level": "leader",
        "pack": "Handicrafts Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Craft Awardee",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Professional Excellence",
            "Leadership",
            "Creativity",
            "Lifelong Learning",
            "Innovation"
        ],
        "purpose": "The Annual Handicrafts Exhibition & Awards is the flagship event of the Handicrafts Club, showcasing outstanding student creations developed throughout the academic year.",
        "outcomes": [
            "Curate and present a professional handicraft portfolio.",
            "Demonstrate mastery of selected craft techniques.",
            "Communicate design concepts and creative processes effectively.",
            "Evaluate personal and peer achievements through reflective practice.",
            "Build confidence through public exhibitions and professional recognition."
        ],
        "competencies": [
            "Portfolio Development",
            "Exhibition Management",
            "Professional Presentation",
            "Creativity",
            "Leadership",
            "Communication",
            "Reflective Practice"
        ],
        "syllabus": [
            "Portfolio Preparation",
            "Exhibition Planning",
            "Display Design",
            "Product Documentation",
            "Live Craft Demonstrations",
            "Jury Evaluation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 400,
        "faculty": "Handicrafts Club Committee"
    },
    {
        "id": "LCH-LC-A01",
        "code": "LC-A01",
        "name": "Literature Club Orientation & Book Café",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Literature Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Literature Enthusiast",
        "sdgs": [
            4,
            5,
            10,
            17
        ],
        "ga": [
            "Effective Communication",
            "Lifelong Learning",
            "Critical Thinking",
            "Cultural Awareness",
            "Leadership Participation",
            "Collaboration"
        ],
        "purpose": "The Literature Club Orientation & Book Café serves as the introductory event for new and existing members, providing an overview of the club's vision, objectives, annual activities, long-term programmes, and opportunities for participation.",
        "outcomes": [
            "Understand the objectives and structure of the Literature Club.",
            "Identify various literary genres and club opportunities.",
            "Develop interest in regular reading and literary discussions.",
            "Build connections with fellow literature enthusiasts.",
            "Select books based on personal reading interests."
        ],
        "competencies": [
            "Reading Motivation",
            "Literary Awareness",
            "Communication Skills",
            "Networking",
            "Critical Curiosity",
            "Collaborative Learning"
        ],
        "syllabus": [
            "Vision and Mission",
            "Club Structure",
            "Annual Calendar",
            "Membership Opportunities",
            "Types of Literature",
            "Fiction vs Non-fiction"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A02",
        "code": "LC-A02",
        "name": "Book Reading Circle",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Literature Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Active Reader",
        "sdgs": [
            4,
            10,
            16
        ],
        "ga": [
            "Critical Thinking",
            "Effective Communication",
            "Teamwork",
            "Lifelong Learning",
            "Ethical Reasoning"
        ],
        "purpose": "The Book Reading Circle is a collaborative reading activity where members collectively read selected literary works and engage in guided discussions.",
        "outcomes": [
            "Develop consistent reading habits.",
            "Interpret literary texts critically.",
            "Participate confidently in literary discussions.",
            "Appreciate diverse perspectives.",
            "Summarize and evaluate literary works."
        ],
        "competencies": [
            "Reading Comprehension",
            "Critical Analysis",
            "Discussion Skills",
            "Reflective Thinking",
            "Communication",
            "Collaboration"
        ],
        "syllabus": [
            "Active Reading",
            "Annotation Techniques",
            "Reading Journals",
            "Plot",
            "Characterization",
            "Setting"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A03",
        "code": "LC-A03",
        "name": "Book Review & Discussion Session",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Literature Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Book Reviewer",
        "sdgs": [
            4,
            10,
            16
        ],
        "ga": [
            "Critical Thinking",
            "Effective Communication",
            "Lifelong Learning",
            "Intellectual Curiosity",
            "Professional Ethics"
        ],
        "purpose": "This activity enables participants to critically evaluate books through structured reviews and panel discussions.",
        "outcomes": [
            "Write structured book reviews.",
            "Evaluate literary works critically.",
            "Present literary opinions confidently.",
            "Compare different literary styles.",
            "Engage in constructive literary debates."
        ],
        "competencies": [
            "Literary Criticism",
            "Analytical Thinking",
            "Academic Writing",
            "Presentation Skills",
            "Communication",
            "Evidence-based Reasoning"
        ],
        "syllabus": [
            "Summary",
            "Analysis",
            "Evaluation",
            "Recommendation",
            "Themes",
            "Writing Style"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A04",
        "code": "LC-A04",
        "name": "Poetry Reading Evening",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Literature Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Poetry Reciter",
        "sdgs": [
            4,
            10,
            16
        ],
        "ga": [
            "Effective Communication",
            "Critical Thinking",
            "Cultural Appreciation",
            "Lifelong Learning",
            "Creativity"
        ],
        "purpose": "Poetry Reading Evening is an interactive literary event where participants recite and interpret poems from classical, modern, and contemporary literature.",
        "outcomes": [
            "Interpret poetic works with clarity and emotion.",
            "Demonstrate effective poetry recitation techniques.",
            "Analyze literary devices used in poetry.",
            "Appreciate diverse poetic styles and traditions.",
            "Build confidence in literary public speaking."
        ],
        "competencies": [
            "Poetry Appreciation",
            "Public Speaking",
            "Literary Interpretation",
            "Oral Communication",
            "Confidence Building",
            "Emotional Expression"
        ],
        "syllabus": [
            "Types of Poetry",
            "Structure and Form",
            "Rhythm and Meter",
            "Rhyme Schemes",
            "Imagery",
            "Symbolism"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A05",
        "code": "LC-A05",
        "name": "Creative Writing Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Literature Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Creative Writer",
        "sdgs": [
            4,
            5,
            10
        ],
        "ga": [
            "Creativity and Innovation",
            "Effective Communication",
            "Critical Thinking",
            "Lifelong Learning",
            "Professional Ethics"
        ],
        "purpose": "The Creative Writing Workshop provides participants with practical training in writing fiction, poetry, personal essays, and creative non-fiction.",
        "outcomes": [
            "Generate original literary ideas.",
            "Apply creative writing techniques effectively.",
            "Develop engaging characters and narratives.",
            "Revise written work using constructive feedback.",
            "Produce polished creative literary pieces."
        ],
        "competencies": [
            "Creative Writing",
            "Storytelling",
            "Critical Editing",
            "Written Communication",
            "Creativity",
            "Self-expression"
        ],
        "syllabus": [
            "Finding Inspiration",
            "Writing Process",
            "Idea Development",
            "Creative Thinking",
            "Plot Development",
            "Character Building"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A06",
        "code": "LC-A06",
        "name": "Short Story Writing Competition",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Literature Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Story Writer",
        "sdgs": [
            4,
            10,
            16
        ],
        "ga": [
            "Creativity",
            "Communication",
            "Critical Thinking",
            "Lifelong Learning",
            "Professional Excellence"
        ],
        "purpose": "The Short Story Writing Competition challenges participants to create original short stories based on predefined or open themes.",
        "outcomes": [
            "Develop complete short stories with coherent structure.",
            "Apply narrative writing techniques effectively.",
            "Demonstrate originality and creativity.",
            "Organize ideas into compelling literary works.",
            "Evaluate stories using literary criteria."
        ],
        "competencies": [
            "Story Writing",
            "Narrative Development",
            "Creativity",
            "Written Communication",
            "Critical Evaluation",
            "Time Management"
        ],
        "syllabus": [
            "Theme Selection",
            "Plot Design",
            "Story Structure",
            "Storyboarding",
            "Character Profiles",
            "Dialogue Writing"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A07",
        "code": "LC-A07",
        "name": "Poetry Writing Competition",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Literature Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Poet",
        "sdgs": [
            4,
            5,
            10
        ],
        "ga": [
            "Creativity and Innovation",
            "Effective Communication",
            "Cultural Awareness",
            "Lifelong Learning",
            "Critical Thinking"
        ],
        "purpose": "The Poetry Writing Competition encourages participants to compose original poems that reflect imagination, emotion, social awareness, and artistic expression.",
        "outcomes": [
            "Compose original poems using appropriate literary techniques.",
            "Apply poetic forms and structures.",
            "Express emotions and ideas creatively.",
            "Utilize literary devices effectively.",
            "Critically review poetic compositions."
        ],
        "competencies": [
            "Poetry Writing",
            "Literary Creativity",
            "Language Proficiency",
            "Emotional Intelligence",
            "Written Communication",
            "Critical Reflection"
        ],
        "syllabus": [
            "Forms of Poetry",
            "Rhythm",
            "Meter",
            "Free Verse",
            "Imagery",
            "Simile"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A08",
        "code": "LC-A08",
        "name": "Essay Writing Competition",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Literature Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Essayist",
        "sdgs": [
            4,
            10,
            16
        ],
        "ga": [
            "Critical Thinking",
            "Effective Communication",
            "Research Competency",
            "Lifelong Learning",
            "Ethical Responsibility"
        ],
        "purpose": "The Essay Writing Competition provides participants with an opportunity to develop structured, analytical, and persuasive essays on literary, social, scientific, cultural, or contemporary topics.",
        "outcomes": [
            "Organize ideas into coherent essays.",
            "Develop persuasive and analytical arguments.",
            "Apply academic writing conventions.",
            "Support viewpoints with credible evidence.",
            "Demonstrate clarity, coherence, and critical thinking."
        ],
        "competencies": [
            "Academic Writing",
            "Critical Thinking",
            "Research Skills",
            "Persuasive Communication",
            "Logical Reasoning",
            "Time Management"
        ],
        "syllabus": [
            "Essay Structure",
            "Thesis Statement",
            "Introduction",
            "Conclusion",
            "Information Gathering",
            "Referencing"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A09",
        "code": "LC-A09",
        "name": "Debate & Literary Discussion",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Literature Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Debater",
        "sdgs": [
            4,
            10,
            16
        ],
        "ga": [
            "Effective Communication",
            "Critical Thinking",
            "Leadership",
            "Ethical Responsibility",
            "Teamwork",
            "Lifelong Learning"
        ],
        "purpose": "The Debate & Literary Discussion activity provides a structured platform for participants to analyze literary works, discuss contemporary issues, and present evidence-based arguments.",
        "outcomes": [
            "Construct logical and evidence-based arguments.",
            "Communicate ideas confidently in formal discussions.",
            "Critically evaluate opposing viewpoints.",
            "Apply literary concepts in discussions and debates.",
            "Demonstrate ethical and respectful communication."
        ],
        "competencies": [
            "Critical Thinking",
            "Public Speaking",
            "Persuasive Communication",
            "Logical Reasoning",
            "Active Listening",
            "Team Collaboration"
        ],
        "syllabus": [
            "Types of Debate",
            "Debate Structure",
            "Rules and Etiquette",
            "Team Roles",
            "Claim and Evidence",
            "Logical Reasoning"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A10",
        "code": "LC-A10",
        "name": "Extempore Speaking Challenge",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Literature Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Orator",
        "sdgs": [
            4,
            5,
            10
        ],
        "ga": [
            "Effective Communication",
            "Leadership",
            "Critical Thinking",
            "Adaptability",
            "Lifelong Learning"
        ],
        "purpose": "The Extempore Speaking Challenge develops participants' ability to think critically and communicate effectively without prior preparation.",
        "outcomes": [
            "Organize thoughts quickly under time constraints.",
            "Deliver structured speeches confidently.",
            "Demonstrate effective verbal communication.",
            "Improve confidence in public speaking.",
            "Respond to spontaneous topics with logical reasoning."
        ],
        "competencies": [
            "Public Speaking",
            "Spontaneous Thinking",
            "Confidence",
            "Communication Skills",
            "Leadership",
            "Time Management"
        ],
        "syllabus": [
            "Speech Structure",
            "Thinking on Your Feet",
            "Time Management",
            "Confidence Building",
            "Voice Modulation",
            "Body Language"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A11",
        "code": "LC-A11",
        "name": "Storytelling Session",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Literature Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Storyteller",
        "sdgs": [
            4,
            10,
            11
        ],
        "ga": [
            "Effective Communication",
            "Creativity and Innovation",
            "Leadership",
            "Cultural Awareness",
            "Lifelong Learning"
        ],
        "purpose": "The Storytelling Session enables participants to narrate original or adapted stories using effective verbal communication, expression, voice modulation, and audience engagement techniques.",
        "outcomes": [
            "Narrate stories using engaging storytelling techniques.",
            "Demonstrate effective voice modulation and expression.",
            "Structure stories with clear beginning, climax, and conclusion.",
            "Connect emotionally with audiences.",
            "Enhance creativity and communication skills."
        ],
        "competencies": [
            "Storytelling",
            "Oral Communication",
            "Creativity",
            "Confidence",
            "Emotional Intelligence",
            "Audience Engagement"
        ],
        "syllabus": [
            "Story Structure",
            "Types of Stories",
            "Audience Analysis",
            "Narrative Flow",
            "Voice Modulation",
            "Facial Expressions"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A12",
        "code": "LC-A12",
        "name": "Author Spotlight & Literary Appreciation",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Literature Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Literary Scholar",
        "sdgs": [
            4,
            10,
            16
        ],
        "ga": [
            "Critical Thinking",
            "Effective Communication",
            "Global Perspective",
            "Cultural Appreciation",
            "Lifelong Learning"
        ],
        "purpose": "Author Spotlight & Literary Appreciation introduces participants to the lives, works, writing styles, and literary contributions of renowned national and international authors.",
        "outcomes": [
            "Identify major literary authors and their contributions.",
            "Analyze writing styles across different literary periods.",
            "Appreciate cultural and historical influences on literature.",
            "Compare literary movements and genres.",
            "Present author-focused literary analyses."
        ],
        "competencies": [
            "Literary Appreciation",
            "Research Skills",
            "Critical Analysis",
            "Presentation Skills",
            "Cultural Awareness",
            "Communication"
        ],
        "syllabus": [
            "Literary Periods",
            "Major Authors",
            "Literary Movements",
            "Historical Context",
            "Biography",
            "Major Works"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A13",
        "code": "LC-A13",
        "name": "Literary Quiz",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Literature Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Quiz Master",
        "sdgs": [
            4,
            10,
            16
        ],
        "ga": [
            "Lifelong Learning",
            "Critical Thinking",
            "Teamwork",
            "Effective Communication",
            "Intellectual Curiosity"
        ],
        "purpose": "The Literary Quiz is a competitive knowledge-based activity that tests participants' understanding of literature, authors, literary movements, famous works, poetry, drama, grammar, and language.",
        "outcomes": [
            "Recall key literary concepts and authors.",
            "Demonstrate knowledge of literary works and genres.",
            "Apply literary knowledge in competitive settings.",
            "Improve reading habits through continuous learning.",
            "Collaborate effectively during team-based quiz rounds."
        ],
        "competencies": [
            "Literary Knowledge",
            "General Awareness",
            "Critical Thinking",
            "Teamwork",
            "Decision Making",
            "Time Management"
        ],
        "syllabus": [
            "Literary Genres",
            "Famous Books",
            "Literary Terms",
            "Grammar Basics",
            "Indian Authors",
            "International Authors"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A14",
        "code": "LC-A14",
        "name": "Open Mic – Poetry & Prose",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Literature Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Spoken Word Artist",
        "sdgs": [
            4,
            5,
            10
        ],
        "ga": [
            "Effective Communication",
            "Creativity and Innovation",
            "Leadership",
            "Cultural Awareness",
            "Lifelong Learning"
        ],
        "purpose": "The Open Mic – Poetry & Prose is a literary performance platform where participants present original or selected poems, prose, monologues, spoken word pieces, and literary excerpts before a live audience.",
        "outcomes": [
            "Present literary works confidently before an audience.",
            "Demonstrate effective vocal delivery and stage presence.",
            "Express ideas creatively through poetry and prose.",
            "Appreciate diverse literary styles and perspectives.",
            "Develop confidence through public literary performances."
        ],
        "competencies": [
            "Public Speaking",
            "Literary Performance",
            "Creative Expression",
            "Communication Skills",
            "Confidence Building",
            "Stage Presence"
        ],
        "syllabus": [
            "Spoken Word Poetry",
            "Prose Reading",
            "Monologues",
            "Performance Techniques",
            "Voice Modulation",
            "Stage Presence"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A15",
        "code": "LC-A15",
        "name": "Script & Screenplay Reading Session",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Literature Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Script Reader",
        "sdgs": [
            4,
            10,
            11
        ],
        "ga": [
            "Effective Communication",
            "Critical Thinking",
            "Creativity",
            "Teamwork",
            "Cultural Appreciation"
        ],
        "purpose": "The Script & Screenplay Reading Session introduces participants to the fundamentals of dramatic writing through guided readings of stage plays, film scripts, and screenplays.",
        "outcomes": [
            "Interpret scripts and screenplays effectively.",
            "Analyze dramatic structure and dialogue.",
            "Identify techniques used in screenplay writing.",
            "Perform script readings collaboratively.",
            "Appreciate the relationship between literature and visual storytelling."
        ],
        "competencies": [
            "Script Analysis",
            "Literary Interpretation",
            "Dramatic Reading",
            "Collaboration",
            "Communication Skills",
            "Creative Thinking"
        ],
        "syllabus": [
            "Script Formats",
            "Stage Plays",
            "Film Screenplays",
            "Scene Structure",
            "Dialogue Writing",
            "Character Arcs"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Mentor"
    },
    {
        "id": "LCH-LC-A16",
        "code": "LC-A16",
        "name": "Book Exchange Fair",
        "domain": "LCH",
        "level": "leader",
        "pack": "Literature Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Book Ambassador",
        "sdgs": [
            4,
            12,
            17
        ],
        "ga": [
            "Lifelong Learning",
            "Social Responsibility",
            "Effective Communication",
            "Teamwork",
            "Cultural Awareness"
        ],
        "purpose": "The Book Exchange Fair promotes a culture of reading and resource sharing by enabling participants to exchange books across various genres.",
        "outcomes": [
            "Explore diverse literary genres through book exchange.",
            "Promote responsible sharing of educational resources.",
            "Develop appreciation for community-based learning.",
            "Expand personal reading collections economically.",
            "Build networking opportunities among readers."
        ],
        "competencies": [
            "Reading Habits",
            "Resource Management",
            "Communication",
            "Networking",
            "Community Engagement",
            "Lifelong Learning"
        ],
        "syllabus": [
            "Importance of Reading",
            "Book Selection",
            "Reading Diversity",
            "Literary Exploration",
            "Exchange Guidelines",
            "Cataloguing Books"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Literature Club Committee"
    },
    {
        "id": "LCH-LC-A17",
        "code": "LC-A17",
        "name": "Literary Magazine Contribution Drive",
        "domain": "LCH",
        "level": "leader",
        "pack": "Literature Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Literary Contributor",
        "sdgs": [
            4,
            5,
            10
        ],
        "ga": [
            "Creativity and Innovation",
            "Effective Communication",
            "Professional Ethics",
            "Teamwork",
            "Lifelong Learning"
        ],
        "purpose": "The Literary Magazine Contribution Drive invites participants to create and submit original literary works for publication in the club's annual magazine.",
        "outcomes": [
            "Produce publication-quality literary content.",
            "Apply editorial standards in creative writing.",
            "Collaborate with editorial teams during publication.",
            "Demonstrate originality and ethical writing practices.",
            "Prepare manuscripts for publication."
        ],
        "competencies": [
            "Creative Writing",
            "Editorial Skills",
            "Proofreading",
            "Publication Management",
            "Collaboration",
            "Written Communication"
        ],
        "syllabus": [
            "Magazine Structure",
            "Submission Guidelines",
            "Editorial Process",
            "Publication Ethics",
            "Poetry",
            "Fiction"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Literature Club Committee"
    },
    {
        "id": "LCH-LC-A18",
        "code": "LC-A18",
        "name": "Inter-College Literary Fest",
        "domain": "LCH",
        "level": "leader",
        "pack": "Literature Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Lit Fest Rep",
        "sdgs": [
            4,
            10,
            17
        ],
        "ga": [
            "Leadership",
            "Effective Communication",
            "Cultural Awareness",
            "Teamwork",
            "Global Perspective",
            "Lifelong Learning"
        ],
        "purpose": "The Inter-College Literary Fest is a flagship literary event that brings together students from multiple institutions to participate in competitions, panel discussions, author interactions, debates, creative writing contests, poetry performances, quizzes, and cultural literary activities.",
        "outcomes": [
            "Demonstrate literary and communication skills in competitive environments.",
            "Collaborate with peers from diverse institutions.",
            "Showcase creative and analytical abilities.",
            "Build professional and academic networks.",
            "Appreciate diverse literary cultures and perspectives."
        ],
        "competencies": [
            "Leadership",
            "Communication Skills",
            "Literary Excellence",
            "Teamwork",
            "Networking",
            "Event Participation"
        ],
        "syllabus": [
            "Creative Writing",
            "Poetry",
            "Debate",
            "Quiz",
            "Author Talks",
            "Panel Discussions"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Literature Club Committee"
    },
    {
        "id": "LCH-LC-A19",
        "code": "LC-A19",
        "name": "World Book Day Celebration",
        "domain": "LCH",
        "level": "leader",
        "pack": "Literature Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "World Book Day Host",
        "sdgs": [
            4,
            10,
            11,
            17
        ],
        "ga": [
            "Lifelong Learning",
            "Effective Communication",
            "Social Responsibility",
            "Cultural Awareness",
            "Leadership"
        ],
        "purpose": "World Book Day Celebration is an annual literary event organized to promote reading habits, celebrate books and authors, and encourage lifelong learning.",
        "outcomes": [
            "Recognize the importance of reading as a lifelong learning habit.",
            "Appreciate the contributions of authors and literary works.",
            "Participate actively in literary and cultural celebrations.",
            "Promote reading culture within the university community.",
            "Develop awareness of global literary traditions."
        ],
        "competencies": [
            "Reading Habits",
            "Literary Appreciation",
            "Communication Skills",
            "Cultural Awareness",
            "Community Engagement",
            "Lifelong Learning"
        ],
        "syllabus": [
            "History and Significance",
            "UNESCO Initiative",
            "Importance of Reading",
            "Global Literary Culture",
            "Reading Marathon",
            "Storytelling"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Literature Club Committee"
    },
    {
        "id": "LCH-LC-A20",
        "code": "LC-A20",
        "name": "Annual Literature Festival & Awards",
        "domain": "LCH",
        "level": "leader",
        "pack": "Literature Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Lit Festival Awardee",
        "sdgs": [
            4,
            5,
            10,
            17
        ],
        "ga": [
            "Leadership",
            "Effective Communication",
            "Creativity and Innovation",
            "Teamwork",
            "Professional Ethics",
            "Lifelong Learning"
        ],
        "purpose": "The Annual Literature Festival & Awards is the flagship event of the Literature Club that showcases the literary achievements of members through competitions, exhibitions, performances, author interactions, panel discussions, publication launches, and award ceremonies.",
        "outcomes": [
            "Showcase literary talents through diverse events.",
            "Demonstrate excellence in creative and analytical writing.",
            "Present literary works confidently before audiences.",
            "Collaborate in organizing large-scale literary events.",
            "Reflect on personal growth and literary achievements."
        ],
        "competencies": [
            "Leadership",
            "Event Management",
            "Literary Excellence",
            "Public Speaking",
            "Teamwork",
            "Creative Expression",
            "Communication Skills"
        ],
        "syllabus": [
            "Poetry Performances",
            "Storytelling",
            "Creative Writing Showcase",
            "Book Reviews",
            "Essay Writing",
            "Debate"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Literature Club Committee"
    },
    {
        "id": "LCH-ADV-A01",
        "code": "ADV-A01",
        "name": "Adventure Club Orientation & Safety Briefing",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Adventure Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Adventure Explorer",
        "sdgs": [
            3,
            4,
            12,
            13,
            15
        ],
        "ga": [
            "Self-awareness",
            "Responsibility",
            "Teamwork",
            "Ethical behaviour",
            "Safety-oriented mindset"
        ],
        "purpose": "The Adventure Club Orientation & Safety Briefing introduces new members to the purpose, vision, activities, operational guidelines, safety standards, and ethical practices of adventure-based learning.",
        "outcomes": [
            "Understand the objectives and functioning of the Adventure Club.",
            "Identify safety rules and risk management practices.",
            "Understand basic outdoor ethics and responsible adventure behaviour.",
            "Recognize personal responsibilities during adventure activities.",
            "Demonstrate awareness of teamwork and discipline requirements."
        ],
        "competencies": [
            "Adventure safety awareness",
            "Equipment identification",
            "Risk recognition",
            "Emergency awareness",
            "Team discipline",
            "Communication skills",
            "Responsibility",
            "Safety consciousness"
        ],
        "syllabus": [
            "Importance of adventure learning",
            "Adventure sports overview",
            "Club objectives and activities",
            "Personal safety practices",
            "Safety equipment awareness",
            "Common outdoor hazards"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A02",
        "code": "ADV-A02",
        "name": "Campus Adventure Challenge",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Adventure Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Campus Adventurer",
        "sdgs": [
            3,
            4,
            5,
            17
        ],
        "ga": [
            "Confidence",
            "Resilience",
            "Creativity",
            "Leadership",
            "Team spirit"
        ],
        "purpose": "The Campus Adventure Challenge is a fun, competitive activity conducted within the campus that introduces students to obstacle-based challenges, rope activities, and team problem-solving tasks.",
        "outcomes": [
            "Demonstrate basic physical coordination and agility.",
            "Apply teamwork strategies to complete challenges.",
            "Solve simple challenges under time pressure.",
            "Build confidence in an adventure-style environment.",
            "Demonstrate sportsmanship and cooperation."
        ],
        "competencies": [
            "Physical coordination",
            "Obstacle management",
            "Basic navigation",
            "Challenge-solving techniques",
            "Team leadership",
            "Communication",
            "Collaboration",
            "Decision-making"
        ],
        "syllabus": [
            "Obstacle navigation",
            "Rope activities",
            "Memory challenges",
            "Team puzzles",
            "Balance activities",
            "Navigation games"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A03",
        "code": "ADV-A03",
        "name": "One-Day Trekking Expedition",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Adventure Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Trekker",
        "sdgs": [
            3,
            4,
            13,
            15
        ],
        "ga": [
            "Resilience",
            "Physical fitness",
            "Environmental sensitivity",
            "Leadership",
            "Self-confidence"
        ],
        "purpose": "The One-Day Trekking Expedition introduces members to outdoor trekking through a supervised, single-day trek that develops fitness, trail awareness, navigation basics, and environmental sensitivity.",
        "outcomes": [
            "Prepare adequately for a one-day trek.",
            "Apply basic trekking and trail-walking techniques.",
            "Demonstrate safe group movement on trails.",
            "Observe and respect the natural environment.",
            "Practice responsible waste management during outdoor activities."
        ],
        "competencies": [
            "Trek preparation",
            "Trail navigation",
            "Outdoor safety",
            "Basic hiking skills",
            "Environmental observation",
            "Team coordination",
            "Time management",
            "Responsibility",
            "Adaptability"
        ],
        "syllabus": [
            "Trek planning",
            "Personal fitness requirements",
            "Backpack preparation",
            "Clothing and footwear selection",
            "Safety precautions",
            "Walking techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A04",
        "code": "ADV-A04",
        "name": "Nature Trail & Hiking",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Adventure Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Nature Hiker",
        "sdgs": [
            4,
            13,
            14,
            15
        ],
        "ga": [
            "Environmental consciousness",
            "Scientific attitude",
            "Observation skills",
            "Social responsibility"
        ],
        "purpose": "The Nature Trail & Hiking activity takes participants through natural landscapes to develop awareness of local ecosystems, biodiversity, and conservation practices.",
        "outcomes": [
            "Identify basic flora and fauna encountered on the trail.",
            "Explain the importance of biodiversity conservation.",
            "Apply sustainable outdoor practices during hikes.",
            "Document field observations accurately.",
            "Demonstrate responsible and ethical outdoor behaviour."
        ],
        "competencies": [
            "Environmental observation",
            "Biodiversity awareness",
            "Field documentation",
            "Nature interpretation",
            "Curiosity",
            "Analytical thinking",
            "Communication",
            "Responsible behaviour"
        ],
        "syllabus": [
            "Local ecosystems",
            "Forest and landscape features",
            "Flora identification",
            "Fauna awareness",
            "Biodiversity importance",
            "Human impact on nature"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A05",
        "code": "ADV-A05",
        "name": "Cycling Adventure Ride",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Adventure Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Adventure Cyclist",
        "sdgs": [
            3,
            11,
            12,
            13
        ],
        "ga": [
            "Fitness consciousness",
            "Sustainability mindset",
            "Confidence",
            "Responsibility",
            "Teamwork"
        ],
        "purpose": "The Cycling Adventure Ride is a group cycling activity that develops endurance, bicycle-handling skills, and awareness of sustainable mobility.",
        "outcomes": [
            "Demonstrate safe and controlled bicycle riding.",
            "Apply group riding discipline and traffic awareness.",
            "Perform basic bicycle maintenance checks.",
            "Explain the benefits of cycling as sustainable mobility.",
            "Respond appropriately to on-road emergencies."
        ],
        "competencies": [
            "Cycling skills",
            "Route planning",
            "Bicycle safety",
            "Physical endurance",
            "Discipline",
            "Team coordination",
            "Risk awareness",
            "Time management"
        ],
        "syllabus": [
            "Bicycle maintenance basics",
            "Riding techniques",
            "Balance and control",
            "Endurance development",
            "Traffic awareness",
            "Protective equipment"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A06",
        "code": "ADV-A06",
        "name": "Orienteering & Navigation Challenge",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Adventure Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Navigator",
        "sdgs": [
            4,
            13,
            15,
            17
        ],
        "ga": [
            "Analytical thinking",
            "Confidence",
            "Leadership",
            "Resourcefulness",
            "Team spirit"
        ],
        "purpose": "The Orienteering & Navigation Challenge trains participants in map reading, compass use, and field navigation through a structured checkpoint-based challenge.",
        "outcomes": [
            "Read and interpret topographic maps.",
            "Use a compass to take bearings and follow directions.",
            "Plan and execute a navigation route.",
            "Locate checkpoints using field navigation techniques.",
            "Apply teamwork and strategy to complete a navigation challenge."
        ],
        "competencies": [
            "Map interpretation",
            "Compass navigation",
            "Route planning",
            "Field orientation",
            "Decision-making",
            "Team communication",
            "Problem-solving",
            "Strategic thinking"
        ],
        "syllabus": [
            "Map symbols and scales",
            "Direction and distance measurement",
            "Grid references",
            "Route planning",
            "Compass components",
            "Taking bearings"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A07",
        "code": "ADV-A07",
        "name": "Treasure Hunt Adventure",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Adventure Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Treasure Hunter",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Creativity",
            "Confidence",
            "Team orientation",
            "Critical thinking"
        ],
        "purpose": "The Treasure Hunt Adventure is a creative, clue-based outdoor challenge that combines navigation, logical reasoning, and teamwork.",
        "outcomes": [
            "Apply logical reasoning to solve clues and puzzles.",
            "Navigate between checkpoints efficiently.",
            "Coordinate effectively within a team under time pressure.",
            "Manage roles and responsibilities within a group.",
            "Resolve minor team conflicts constructively."
        ],
        "competencies": [
            "Navigation awareness",
            "Logical reasoning",
            "Challenge solving",
            "Route planning",
            "Leadership",
            "Communication",
            "Collaboration",
            "Decision-making"
        ],
        "syllabus": [
            "Logical reasoning",
            "Puzzle solving",
            "Observation skills",
            "Decision-making",
            "Basic navigation",
            "Route identification"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A08",
        "code": "ADV-A08",
        "name": "Camping Experience",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Adventure Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Camper",
        "sdgs": [
            3,
            4,
            12,
            13,
            15
        ],
        "ga": [
            "Independence",
            "Resilience",
            "Environmental responsibility",
            "Collaboration"
        ],
        "purpose": "The Camping Experience introduces participants to outdoor living through a supervised overnight or day camp.",
        "outcomes": [
            "Select an appropriate campsite and set up shelter.",
            "Prepare basic meals using outdoor cooking methods.",
            "Maintain hygiene and cleanliness at a campsite.",
            "Manage waste responsibly during camping.",
            "Follow fire safety and night-time safety procedures."
        ],
        "competencies": [
            "Campsite management",
            "Outdoor cooking",
            "Shelter setup",
            "Resource management",
            "Responsibility",
            "Teamwork",
            "Adaptability",
            "Leadership"
        ],
        "syllabus": [
            "Camp planning",
            "Equipment selection",
            "Campsite selection",
            "Tent pitching",
            "Outdoor cooking",
            "Camp hygiene"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A09",
        "code": "ADV-A09",
        "name": "Campfire & Outdoor Games",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Adventure Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Campfire Host",
        "sdgs": [
            3,
            4,
            5,
            17
        ],
        "ga": [
            "Confidence",
            "Collaboration",
            "Cultural awareness",
            "Emotional intelligence",
            "Leadership"
        ],
        "purpose": "The Campfire & Outdoor Games activity brings members together around structured team-building games, traditional outdoor recreation, and a campfire session for reflection and bonding.",
        "outcomes": [
            "Participate actively in team-building activities.",
            "Demonstrate cooperation during outdoor games.",
            "Communicate effectively within a group setting.",
            "Reflect on personal and team experiences.",
            "Demonstrate respect for cultural and group diversity."
        ],
        "competencies": [
            "Basic outdoor recreation skills",
            "Group activity management",
            "Safety awareness",
            "Communication",
            "Teamwork",
            "Leadership",
            "Social interaction"
        ],
        "syllabus": [
            "Ice-breaker games",
            "Trust-building activities",
            "Group challenges",
            "Communication exercises",
            "Traditional outdoor games",
            "Fun adventure activities"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A10",
        "code": "ADV-A10",
        "name": "Rock Climbing Experience",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Adventure Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Rock Climber",
        "sdgs": [
            3,
            4,
            15
        ],
        "ga": [
            "Self-confidence",
            "Resilience",
            "Determination",
            "Safety consciousness",
            "Mental strength"
        ],
        "purpose": "The Rock Climbing Experience introduces participants to the fundamentals of rock climbing under expert supervision, covering climbing techniques, safety equipment, and controlled movement.",
        "outcomes": [
            "Explain the fundamentals and terminology of rock climbing.",
            "Use climbing equipment correctly and safely.",
            "Demonstrate proper body positioning and controlled movement.",
            "Apply communication commands during climbing.",
            "Follow fall-prevention and risk-management procedures."
        ],
        "competencies": [
            "Climbing techniques",
            "Equipment handling",
            "Safety systems",
            "Physical coordination",
            "Courage",
            "Focus",
            "Risk awareness",
            "Problem-solving"
        ],
        "syllabus": [
            "Introduction to rock climbing",
            "Types of climbing",
            "Climbing terminology",
            "Body positioning",
            "Helmets, harnesses, ropes, carabiners and safety devices"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A11",
        "code": "ADV-A11",
        "name": "Rappelling Demonstration",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Adventure Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Rappeller",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Courage",
            "Discipline",
            "Self-confidence",
            "Team support"
        ],
        "purpose": "The Rappelling Demonstration introduces participants to controlled descent techniques using ropes under professional supervision.",
        "outcomes": [
            "Identify rope types and basic rope-handling techniques.",
            "Demonstrate correct body position during rappelling.",
            "Apply brake-control techniques during descent.",
            "Follow communication commands throughout the activity.",
            "Perform basic equipment inspection and partner safety checks."
        ],
        "competencies": [
            "Rope handling",
            "Equipment knowledge",
            "Descent techniques",
            "Safety procedures",
            "Confidence",
            "Trust-building",
            "Responsibility",
            "Risk management"
        ],
        "syllabus": [
            "Rope types",
            "Rope handling",
            "Knots and connections",
            "Anchoring basics",
            "Body position",
            "Brake control"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A12",
        "code": "ADV-A12",
        "name": "Rope Course & Obstacle Challenge",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Adventure Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Rope Challenger",
        "sdgs": [
            3,
            4,
            5,
            17
        ],
        "ga": [
            "Resilience",
            "Self-confidence",
            "Collaboration",
            "Decision-making ability",
            "Risk awareness"
        ],
        "purpose": "The Rope Course & Obstacle Challenge combines rope-based elements, balance activities, and team obstacles to develop coordination, confidence, and collaborative problem-solving.",
        "outcomes": [
            "Navigate rope-based and balance obstacles safely.",
            "Apply coordination and balance techniques.",
            "Collaborate with team members to complete timed challenges.",
            "Use protective equipment correctly.",
            "Assess and manage personal risk during the course."
        ],
        "competencies": [
            "Rope activity techniques",
            "Physical coordination",
            "Obstacle navigation",
            "Safety practices",
            "Leadership",
            "Teamwork",
            "Adaptability",
            "Confidence building"
        ],
        "syllabus": [
            "Rope balancing",
            "Rope bridges",
            "Climbing elements",
            "Suspension activities",
            "Balance challenges",
            "Coordination tasks"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A13",
        "code": "ADV-A13",
        "name": "Survival Skills Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Adventure Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Survivalist",
        "sdgs": [
            3,
            4,
            6,
            12,
            15
        ],
        "ga": [
            "Resilience",
            "Independence",
            "Responsibility",
            "Critical thinking",
            "Environmental awareness"
        ],
        "purpose": "The Survival Skills Workshop teaches essential wilderness survival techniques including shelter building, fire management, water purification awareness, and emergency food identification.",
        "outcomes": [
            "Explain core survival priorities and psychological preparedness.",
            "Construct a temporary shelter using available materials.",
            "Demonstrate safe fire-making and fire-management practices.",
            "Explain water purification and emergency food principles.",
            "Apply decision-making skills in simulated survival scenarios."
        ],
        "competencies": [
            "Shelter building",
            "Fire management",
            "Water purification awareness",
            "Survival planning",
            "Adaptability",
            "Decision-making",
            "Self-reliance",
            "Crisis management"
        ],
        "syllabus": [
            "Survival priorities",
            "Psychological preparedness",
            "Emergency planning",
            "Survival equipment",
            "Temporary shelters",
            "Fire preparation methods"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A14",
        "code": "ADV-A14",
        "name": "First Aid & Emergency Response Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Adventure Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "First Responder",
        "sdgs": [
            3,
            4,
            11,
            17
        ],
        "ga": [
            "Social responsibility",
            "Confidence",
            "Ethical awareness",
            "Service mindset"
        ],
        "purpose": "The First Aid & Emergency Response Workshop trains participants in essential first aid principles and outdoor emergency care, including wound management, injury assessment, and evacuation procedures.",
        "outcomes": [
            "Explain fundamental first aid principles and emergency assessment.",
            "Demonstrate basic wound and injury care.",
            "Respond appropriately to sprains, fractures, heat and cold injuries.",
            "Apply evacuation and rescue coordination procedures.",
            "Communicate clearly and calmly during an emergency."
        ],
        "competencies": [
            "First aid skills",
            "Emergency response",
            "Injury management",
            "Safety assessment",
            "Responsibility",
            "Leadership",
            "Calm decision-making",
            "Communication"
        ],
        "syllabus": [
            "First aid principles",
            "Emergency assessment",
            "Injury identification",
            "Basic wound care",
            "Sprains and fractures",
            "Heat and cold injuries"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A15",
        "code": "ADV-A15",
        "name": "Wilderness Photography Walk",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Adventure Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Wildlife Photographer",
        "sdgs": [
            4,
            13,
            15
        ],
        "ga": [
            "Creativity",
            "Awareness",
            "Innovation",
            "Social responsibility"
        ],
        "purpose": "The Wilderness Photography Walk combines outdoor exploration with visual storytelling, teaching participants composition, lighting, and ethical photography practices while documenting natural landscapes and wildlife responsibly.",
        "outcomes": [
            "Apply basic composition and lighting techniques in outdoor photography.",
            "Document landscapes and biodiversity through photography.",
            "Communicate environmental messages through visual storytelling.",
            "Practice non-invasive and ethical wildlife photography.",
            "Reflect on the role of photography in conservation awareness."
        ],
        "competencies": [
            "Photography techniques",
            "Documentation skills",
            "Visual communication",
            "Creativity",
            "Observation",
            "Communication",
            "Environmental responsibility"
        ],
        "syllabus": [
            "Composition",
            "Lighting",
            "Framing",
            "Outdoor photography techniques",
            "Landscape photography",
            "Biodiversity documentation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Adventure Club Mentor"
    },
    {
        "id": "LCH-ADV-A16",
        "code": "ADV-A16",
        "name": "Environmental Conservation Drive",
        "domain": "LCH",
        "level": "leader",
        "pack": "Adventure Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Eco Steward",
        "sdgs": [
            4,
            6,
            12,
            13,
            15,
            17
        ],
        "ga": [
            "Environmental stewardship",
            "Civic responsibility",
            "Ethical awareness",
            "Leadership",
            "Social commitment"
        ],
        "purpose": "The Environmental Conservation Drive engages members in hands-on conservation activities such as waste collection, tree plantation, and habitat protection.",
        "outcomes": [
            "Explain the importance of ecosystem and biodiversity conservation.",
            "Participate in waste collection and segregation activities.",
            "Contribute to tree plantation and habitat protection efforts.",
            "Apply Leave No Trace and responsible tourism principles.",
            "Demonstrate community participation and civic responsibility."
        ],
        "competencies": [
            "Environmental assessment",
            "Conservation practices",
            "Waste management",
            "Sustainability planning",
            "Social responsibility",
            "Leadership",
            "Community engagement",
            "Project management"
        ],
        "syllabus": [
            "Ecosystem importance",
            "Biodiversity conservation",
            "Human impact on nature",
            "Climate change awareness",
            "Waste collection and segregation",
            "Tree plantation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Adventure Club Committee"
    },
    {
        "id": "LCH-ADV-A17",
        "code": "ADV-A17",
        "name": "Night Trek / Star Gazing Camp",
        "domain": "LCH",
        "level": "leader",
        "pack": "Adventure Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Night Trekker",
        "sdgs": [
            4,
            13,
            15
        ],
        "ga": [
            "Curiosity",
            "Scientific attitude",
            "Confidence",
            "Environmental awareness"
        ],
        "purpose": "The Night Trek / Star Gazing Camp introduces members to safe night-time outdoor movement and astronomy observation.",
        "outcomes": [
            "Apply safe night movement and group communication techniques.",
            "Use flashlight discipline appropriately during a night trek.",
            "Identify basic constellations and celestial objects.",
            "Explain the effects of light pollution on dark-sky ecosystems.",
            "Demonstrate respect for natural habitats during night activities."
        ],
        "competencies": [
            "Night navigation awareness",
            "Observation techniques",
            "Astronomy basics",
            "Outdoor safety",
            "Confidence",
            "Adaptability",
            "Team coordination",
            "Risk awareness"
        ],
        "syllabus": [
            "Night movement techniques",
            "Safety precautions",
            "Group communication",
            "Flashlight discipline",
            "Introduction to stars",
            "Constellation identification"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Adventure Club Committee"
    },
    {
        "id": "LCH-ADV-A18",
        "code": "ADV-A18",
        "name": "Inter-College Adventure Challenge",
        "domain": "LCH",
        "level": "leader",
        "pack": "Adventure Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Adventure Challenger",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Competitive spirit",
            "Leadership",
            "Confidence",
            "Collaboration"
        ],
        "purpose": "The Inter-College Adventure Challenge is a competitive event where student teams from different institutions compete in trekking, navigation, survival, and rope-based tasks.",
        "outcomes": [
            "Apply trekking, navigation, and survival skills competitively.",
            "Demonstrate rope-handling and challenge-solving under pressure.",
            "Manage team strategy and role allocation during competition.",
            "Communicate and coordinate effectively within a competitive team.",
            "Demonstrate sportsmanship and respect for competing teams."
        ],
        "competencies": [
            "Adventure techniques",
            "Navigation",
            "Survival skills",
            "Challenge management",
            "Leadership",
            "Teamwork",
            "Communication",
            "Strategic thinking"
        ],
        "syllabus": [
            "Trekking challenges",
            "Navigation tasks",
            "Survival activities",
            "Rope challenges",
            "Team problem-solving",
            "Team management"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Adventure Club Committee"
    },
    {
        "id": "LCH-ADV-A19",
        "code": "ADV-A19",
        "name": "Adventure Film & Experience Sharing Session",
        "domain": "LCH",
        "level": "leader",
        "pack": "Adventure Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Adventure Storyteller",
        "sdgs": [
            4,
            13,
            15
        ],
        "ga": [
            "Curiosity",
            "Inspiration",
            "Communication",
            "Lifelong learning"
        ],
        "purpose": "The Adventure Film & Experience Sharing Session brings members together to view adventure and expedition films, followed by discussions and personal experience-sharing from senior members and guest adventurers.",
        "outcomes": [
            "Analyze themes of adventure, survival, and leadership presented in films.",
            "Reflect critically on personal and shared adventure experiences.",
            "Identify environmental and ethical messages conveyed through adventure media.",
            "Communicate reflections and takeaways to peers.",
            "Develop an appreciation for lifelong outdoor learning."
        ],
        "competencies": [
            "Adventure awareness",
            "Expedition understanding",
            "Environmental knowledge",
            "Communication",
            "Reflection",
            "Critical thinking"
        ],
        "syllabus": [
            "Adventure expedition stories",
            "Survival experiences",
            "Leadership lessons",
            "Environmental messages",
            "Outdoor ethics"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 300,
        "faculty": "Adventure Club Committee"
    },
    {
        "id": "LCH-ADV-A20",
        "code": "ADV-A20",
        "name": "Annual Adventure Expedition",
        "domain": "LCH",
        "level": "leader",
        "pack": "Adventure Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Expedition Leader",
        "sdgs": [
            3,
            4,
            6,
            12,
            13,
            15,
            17
        ],
        "ga": [
            "Leadership capability",
            "Self-confidence",
            "Resilience",
            "Independence",
            "Environmental consciousness",
            "Problem-solving ability",
            "Social responsibility",
            "Lifelong learning attitude"
        ],
        "purpose": "The Annual Adventure Expedition is the club's flagship activity — a multi-day outdoor expedition that integrates trekking, camping, navigation, survival, and leadership skills gained across the year.",
        "outcomes": [
            "Apply trekking and expedition planning principles.",
            "Demonstrate outdoor survival and safety skills.",
            "Manage personal and group responsibilities during expeditions.",
            "Apply navigation and route planning techniques.",
            "Demonstrate leadership and teamwork abilities.",
            "Practice sustainable outdoor ethics.",
            "Reflect on personal growth through adventure experiences."
        ],
        "competencies": [
            "Expedition planning",
            "Trekking techniques",
            "Navigation skills",
            "Camping management",
            "Survival techniques",
            "Emergency response",
            "Environmental practices",
            "Leadership",
            "Team coordination",
            "Decision-making",
            "Communication",
            "Time management",
            "Adaptability",
            "Responsibility"
        ],
        "syllabus": [
            "Expedition objectives, route selection and weather/equipment planning",
            "Team role allocation and risk assessment",
            "Trail movement, map reading and compass navigation",
            "Route marking, terrain understanding and group movement",
            "Tent pitching, campsite management and outdoor cooking",
            "Water management, survival techniques and resource conservation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Adventure Club Committee"
    },
    {
        "id": "LCH-FC-A01",
        "code": "FC-A01",
        "name": "Fashion Club Orientation & Trend Showcase",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Fashion Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Fashion Explorer",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Creative Thinking",
            "Lifelong Learning",
            "Effective Communication",
            "Cultural Appreciation",
            "Professional Ethics"
        ],
        "purpose": "The Fashion Club Orientation & Trend Showcase introduces students to the club's vision, opportunities, and annual roadmap.",
        "outcomes": [
            "Understand the objectives and functioning of the Fashion Club.",
            "Identify emerging fashion trends and industry practices.",
            "Recognize opportunities in fashion design, styling, and entrepreneurship.",
            "Develop awareness of ethical and sustainable fashion practices."
        ],
        "competencies": [
            "Fashion Awareness",
            "Trend Observation",
            "Creative Thinking",
            "Communication Skills",
            "Professional Networking"
        ],
        "syllabus": [
            "Introduction to the Fashion Club",
            "Overview of Fashion Industry",
            "Global and Indian Fashion Trends",
            "Fashion Careers and Higher Education",
            "Sustainable Fashion Concepts",
            "Annual Club Activities and Competitions"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A02",
        "code": "FC-A02",
        "name": "Fashion Illustration Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Fashion Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Fashion Illustrator",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Creativity",
            "Problem Solving",
            "Visual Literacy",
            "Innovation",
            "Professional Competence"
        ],
        "purpose": "This workshop develops the fundamental skills required to communicate fashion ideas through illustrations.",
        "outcomes": [
            "Create basic fashion figures and garment sketches.",
            "Apply design principles in fashion illustrations.",
            "Use color effectively in fashion rendering.",
            "Present fashion concepts visually."
        ],
        "competencies": [
            "Fashion Illustration",
            "Drawing Skills",
            "Visual Communication",
            "Creativity",
            "Design Presentation"
        ],
        "syllabus": [
            "Human Figure Proportions",
            "Fashion Croquis",
            "Garment Sketching",
            "Rendering Techniques",
            "Color Application",
            "Digital Illustration Basics"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A03",
        "code": "FC-A03",
        "name": "Styling & Personal Grooming Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Fashion Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Personal Stylist",
        "sdgs": [
            3,
            4,
            8
        ],
        "ga": [
            "Professionalism",
            "Self-Confidence",
            "Effective Communication",
            "Adaptability",
            "Ethical Behaviour"
        ],
        "purpose": "This workshop introduces participants to the principles of personal styling, wardrobe planning, grooming, and image management.",
        "outcomes": [
            "Understand the principles of personal styling.",
            "Coordinate clothing based on body type and occasion.",
            "Apply grooming techniques professionally.",
            "Build confidence through appropriate fashion choices."
        ],
        "competencies": [
            "Fashion Styling",
            "Image Management",
            "Personal Branding",
            "Grooming Skills",
            "Communication"
        ],
        "syllabus": [
            "Fashion Styling Basics",
            "Body Shapes and Styling",
            "Wardrobe Essentials",
            "Color Coordination",
            "Personal Grooming",
            "Professional Dressing"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A04",
        "code": "FC-A04",
        "name": "Fashion Sketch Competition",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Fashion Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Fashion Sketcher",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Innovation",
            "Creative Thinking",
            "Leadership",
            "Confidence",
            "Lifelong Learning"
        ],
        "purpose": "The Fashion Sketch Competition provides participants with an opportunity to demonstrate originality, artistic ability, and design thinking by creating fashion illustrations based on a given theme within a specified time.",
        "outcomes": [
            "Produce creative fashion sketches.",
            "Apply design principles in competitive settings.",
            "Demonstrate originality and innovation.",
            "Improve presentation and visualization skills."
        ],
        "competencies": [
            "Fashion Sketching",
            "Design Thinking",
            "Creativity",
            "Time Management",
            "Artistic Presentation"
        ],
        "syllabus": [
            "Theme Interpretation",
            "Fashion Illustration",
            "Color Rendering",
            "Design Composition",
            "Creativity Techniques",
            "Presentation Skills"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A05",
        "code": "FC-A05",
        "name": "Sustainable Fashion Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Fashion Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Eco Fashionista",
        "sdgs": [
            4,
            12,
            13
        ],
        "ga": [
            "Environmental Responsibility",
            "Ethical Leadership",
            "Creativity",
            "Critical Thinking",
            "Global Citizenship"
        ],
        "purpose": "This workshop introduces participants to environmentally responsible fashion practices, including sustainable materials, ethical manufacturing, circular fashion, and garment upcycling.",
        "outcomes": [
            "Explain the principles of sustainable fashion.",
            "Identify eco-friendly fabrics and materials.",
            "Apply basic upcycling techniques.",
            "Promote responsible fashion consumption."
        ],
        "competencies": [
            "Sustainable Design",
            "Environmental Awareness",
            "Creative Problem Solving",
            "Innovation",
            "Responsible Decision Making"
        ],
        "syllabus": [
            "Sustainable Fashion Concepts",
            "Eco-friendly Textiles",
            "Circular Fashion Economy",
            "Garment Upcycling",
            "Ethical Fashion Brands",
            "Green Fashion Innovations"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A06",
        "code": "FC-A06",
        "name": "Upcycling & DIY Fashion Challenge",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Fashion Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Upcycler",
        "sdgs": [
            4,
            12,
            13
        ],
        "ga": [
            "Creativity",
            "Environmental Responsibility",
            "Critical Thinking",
            "Innovation",
            "Lifelong Learning"
        ],
        "purpose": "The Upcycling & DIY Fashion Challenge encourages participants to transform discarded garments and materials into innovative fashion products.",
        "outcomes": [
            "Apply upcycling techniques to create new fashion products.",
            "Demonstrate creativity using recycled materials.",
            "Practice sustainable fashion design principles.",
            "Present innovative fashion solutions to real-world environmental challenges."
        ],
        "competencies": [
            "Creative Design",
            "Sustainable Fashion Practices",
            "Problem Solving",
            "Craftsmanship",
            "Innovation"
        ],
        "syllabus": [
            "Introduction to Upcycling",
            "DIY Fashion Techniques",
            "Fabric Modification",
            "Recycled Material Selection",
            "Garment Reconstruction",
            "Sustainable Design Practices"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A07",
        "code": "FC-A07",
        "name": "Traditional & Ethnic Wear Showcase",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Fashion Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Ethnic Designer",
        "sdgs": [
            4,
            10,
            11
        ],
        "ga": [
            "Cultural Competence",
            "Effective Communication",
            "Global Citizenship",
            "Creativity",
            "Respect for Diversity"
        ],
        "purpose": "This showcase celebrates cultural diversity by encouraging participants to present traditional and ethnic attire from different regions.",
        "outcomes": [
            "Appreciate cultural diversity through fashion.",
            "Identify regional textile and costume traditions.",
            "Explain the significance of traditional garments.",
            "Develop confidence in cultural presentation."
        ],
        "competencies": [
            "Cultural Awareness",
            "Presentation Skills",
            "Fashion Appreciation",
            "Communication",
            "Research Skills"
        ],
        "syllabus": [
            "Indian Traditional Wear",
            "Global Ethnic Fashion",
            "Traditional Textiles",
            "Cultural Heritage in Fashion",
            "Costume Presentation",
            "Fashion Storytelling"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A08",
        "code": "FC-A08",
        "name": "Fashion Photography Collaboration",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Fashion Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Fashion Photographer",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Teamwork",
            "Creativity",
            "Digital Literacy",
            "Professional Communication",
            "Innovation"
        ],
        "purpose": "The Fashion Photography Collaboration provides participants with practical exposure to fashion shoots involving designers, stylists, photographers, and models.",
        "outcomes": [
            "Plan and execute a fashion photoshoot.",
            "Coordinate styling with photography concepts.",
            "Apply lighting and composition principles.",
            "Produce visually appealing fashion content."
        ],
        "competencies": [
            "Fashion Photography",
            "Team Collaboration",
            "Visual Storytelling",
            "Creative Direction",
            "Digital Media Skills"
        ],
        "syllabus": [
            "Fashion Photography Basics",
            "Styling for Photography",
            "Lighting Techniques",
            "Composition",
            "Model Direction",
            "Post-processing Fundamentals"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A09",
        "code": "FC-A09",
        "name": "Makeup & Styling Basics Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Fashion Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Makeup Artist",
        "sdgs": [
            3,
            4,
            8
        ],
        "ga": [
            "Professionalism",
            "Creativity",
            "Self-Management",
            "Adaptability",
            "Communication"
        ],
        "purpose": "This workshop introduces participants to the fundamentals of makeup application, hairstyling, skincare preparation, and styling techniques used in fashion shows, photoshoots, and professional events.",
        "outcomes": [
            "Understand basic makeup techniques.",
            "Apply appropriate styling for different occasions.",
            "Coordinate makeup with fashion themes.",
            "Demonstrate professional grooming standards."
        ],
        "competencies": [
            "Makeup Application",
            "Styling Skills",
            "Grooming",
            "Attention to Detail",
            "Professional Presentation"
        ],
        "syllabus": [
            "Skin Preparation",
            "Makeup Fundamentals",
            "Hairstyling Basics",
            "Fashion Styling",
            "Grooming Techniques",
            "Hygiene and Safety"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A10",
        "code": "FC-A10",
        "name": "Textile & Fabric Exploration Session",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Fashion Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Textile Expert",
        "sdgs": [
            4,
            9,
            12
        ],
        "ga": [
            "Critical Thinking",
            "Innovation",
            "Environmental Responsibility",
            "Lifelong Learning",
            "Professional Competence"
        ],
        "purpose": "This session familiarizes participants with various natural, synthetic, and blended textiles used in the fashion industry.",
        "outcomes": [
            "Identify commonly used textile materials.",
            "Compare fabric characteristics and applications.",
            "Select suitable fabrics for fashion projects.",
            "Evaluate sustainable textile alternatives."
        ],
        "competencies": [
            "Textile Knowledge",
            "Material Selection",
            "Analytical Thinking",
            "Sustainable Decision Making",
            "Fashion Product Development"
        ],
        "syllabus": [
            "Natural Fibres",
            "Synthetic Fibres",
            "Fabric Construction",
            "Fabric Properties",
            "Textile Testing Basics",
            "Sustainable Textiles"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A11",
        "code": "FC-A11",
        "name": "Accessories Design Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Fashion Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Accessory Designer",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Creativity",
            "Innovation",
            "Critical Thinking",
            "Professional Competence",
            "Lifelong Learning"
        ],
        "purpose": "The Accessories Design Workshop introduces participants to the creative process of designing fashion accessories such as jewelry, handbags, belts, scarves, footwear, and wearable embellishments.",
        "outcomes": [
            "Understand the principles of accessory design.",
            "Create original accessory concepts using various materials.",
            "Select suitable materials based on functionality and aesthetics.",
            "Present accessory designs professionally."
        ],
        "competencies": [
            "Product Design",
            "Creative Thinking",
            "Material Selection",
            "Design Visualization",
            "Presentation Skills"
        ],
        "syllabus": [
            "Introduction to Fashion Accessories",
            "Design Principles",
            "Material Selection",
            "Jewelry and Bag Design",
            "Footwear and Belt Concepts",
            "Prototype Development"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A12",
        "code": "FC-A12",
        "name": "Costume Design Challenge",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Fashion Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Costume Designer",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Creativity",
            "Cultural Awareness",
            "Innovation",
            "Communication",
            "Critical Thinking"
        ],
        "purpose": "The Costume Design Challenge encourages participants to create costumes based on themes such as culture, cinema, theatre, fantasy, or historical periods.",
        "outcomes": [
            "Design costumes based on specific themes.",
            "Apply storytelling principles through costume design.",
            "Demonstrate creativity in garment visualization.",
            "Present costume concepts confidently."
        ],
        "competencies": [
            "Costume Design",
            "Creativity",
            "Storytelling",
            "Design Thinking",
            "Presentation Skills"
        ],
        "syllabus": [
            "Costume Design Fundamentals",
            "Theme Interpretation",
            "Character-Based Design",
            "Color and Fabric Selection",
            "Costume Illustration",
            "Presentation Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A13",
        "code": "FC-A13",
        "name": "Fashion Quiz & Trend Discussion",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Fashion Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Fashion Analyst",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Critical Thinking",
            "Lifelong Learning",
            "Effective Communication",
            "Teamwork",
            "Global Perspective"
        ],
        "purpose": "This interactive activity enhances participants' knowledge of fashion history, designers, textiles, brands, sustainability, and emerging industry trends through quizzes, discussions, and collaborative learning.",
        "outcomes": [
            "Demonstrate knowledge of fashion concepts and history.",
            "Identify leading designers and fashion brands.",
            "Analyze current fashion trends.",
            "Improve critical thinking through discussions."
        ],
        "competencies": [
            "Fashion Knowledge",
            "Research Skills",
            "Analytical Thinking",
            "Communication",
            "Team Collaboration"
        ],
        "syllabus": [
            "Fashion History",
            "Global Fashion Designers",
            "Fashion Brands",
            "Textile Knowledge",
            "Sustainable Fashion",
            "Current Industry Trends"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A14",
        "code": "FC-A14",
        "name": "Fashion Portfolio Review Session",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Fashion Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Portfolio Master",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Professionalism",
            "Self-Directed Learning",
            "Critical Thinking",
            "Adaptability",
            "Lifelong Learning"
        ],
        "purpose": "The Fashion Portfolio Review Session provides participants with constructive feedback on their fashion sketches, garment designs, styling projects, and creative portfolios.",
        "outcomes": [
            "Organize a professional fashion portfolio.",
            "Evaluate strengths and areas for improvement.",
            "Apply constructive feedback to design work.",
            "Enhance presentation and documentation skills."
        ],
        "competencies": [
            "Portfolio Development",
            "Professional Presentation",
            "Self-Evaluation",
            "Design Documentation",
            "Communication"
        ],
        "syllabus": [
            "Portfolio Planning",
            "Design Documentation",
            "Fashion Presentation",
            "Industry Expectations",
            "Portfolio Review Techniques",
            "Professional Improvement Strategies"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A15",
        "code": "FC-A15",
        "name": "Fashion Styling Competition",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Fashion Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Competitive Stylist",
        "sdgs": [
            4,
            5,
            8
        ],
        "ga": [
            "Creativity",
            "Leadership",
            "Confidence",
            "Innovation",
            "Professional Competence"
        ],
        "purpose": "The Fashion Styling Competition challenges participants to create complete fashion looks based on assigned themes, occasions, or target audiences.",
        "outcomes": [
            "Develop complete fashion styling concepts.",
            "Coordinate garments, accessories, and grooming effectively.",
            "Demonstrate creativity under competitive conditions.",
            "Present styling ideas with confidence."
        ],
        "competencies": [
            "Fashion Styling",
            "Creative Decision Making",
            "Visual Communication",
            "Presentation Skills",
            "Time Management"
        ],
        "syllabus": [
            "Styling Principles",
            "Theme-Based Styling",
            "Color Coordination",
            "Accessory Selection",
            "Grooming and Presentation",
            "Fashion Judging Criteria"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Mentor"
    },
    {
        "id": "LCH-FC-A16",
        "code": "FC-A16",
        "name": "Fashion Marketing & Branding Talk",
        "domain": "LCH",
        "level": "leader",
        "pack": "Fashion Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Brand Strategist",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Business Acumen",
            "Innovation",
            "Communication",
            "Critical Thinking",
            "Entrepreneurship"
        ],
        "purpose": "The Fashion Marketing & Branding Talk introduces participants to the fundamentals of fashion branding, consumer behavior, digital marketing, and brand communication.",
        "outcomes": [
            "Explain the fundamentals of fashion marketing and branding.",
            "Understand consumer behavior in the fashion industry.",
            "Identify effective digital marketing strategies for fashion products.",
            "Develop basic branding concepts for fashion businesses."
        ],
        "competencies": [
            "Marketing Strategy",
            "Brand Development",
            "Consumer Analysis",
            "Digital Communication",
            "Entrepreneurial Thinking"
        ],
        "syllabus": [
            "Introduction to Fashion Marketing",
            "Brand Identity and Positioning",
            "Consumer Behavior",
            "Digital and Social Media Marketing",
            "Fashion Advertising",
            "Influencer and Content Marketing"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Fashion Club Committee"
    },
    {
        "id": "LCH-FC-A17",
        "code": "FC-A17",
        "name": "Campus Fashion Exhibition",
        "domain": "LCH",
        "level": "leader",
        "pack": "Fashion Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Fashion Curator",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Creativity",
            "Leadership",
            "Collaboration",
            "Professionalism",
            "Lifelong Learning"
        ],
        "purpose": "The Campus Fashion Exhibition provides a platform for participants to display fashion illustrations, garments, accessories, textile samples, and styling concepts created during club activities.",
        "outcomes": [
            "Curate and present fashion work professionally.",
            "Demonstrate creativity through exhibition displays.",
            "Communicate design concepts to audiences.",
            "Receive and apply constructive feedback."
        ],
        "competencies": [
            "Exhibition Management",
            "Presentation Skills",
            "Communication",
            "Teamwork",
            "Creative Display Design"
        ],
        "syllabus": [
            "Exhibition Planning",
            "Display Techniques",
            "Portfolio Presentation",
            "Fashion Communication",
            "Visitor Engagement",
            "Feedback and Reflection"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 300,
        "faculty": "Fashion Club Committee"
    },
    {
        "id": "LCH-FC-A18",
        "code": "FC-A18",
        "name": "Inter-College Fashion Competition",
        "domain": "LCH",
        "level": "leader",
        "pack": "Fashion Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Fashion Rep",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Excellence",
            "Leadership",
            "Adaptability",
            "Innovation",
            "Professional Ethics"
        ],
        "purpose": "The Inter-College Fashion Competition enables participants to represent the institution in competitive fashion events, showcasing their skills in fashion design, styling, illustration, garment construction, or runway presentation.",
        "outcomes": [
            "Demonstrate fashion competencies in competitive environments.",
            "Apply creativity to solve design challenges.",
            "Develop professional confidence and networking skills.",
            "Evaluate performance using competition feedback."
        ],
        "competencies": [
            "Competitive Performance",
            "Fashion Design",
            "Communication",
            "Leadership",
            "Networking"
        ],
        "syllabus": [
            "Competition Preparation",
            "Design Innovation",
            "Styling and Presentation",
            "Team Coordination",
            "Professional Ethics",
            "Performance Evaluation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Fashion Club Committee"
    },
    {
        "id": "LCH-FC-A19",
        "code": "FC-A19",
        "name": "Fashion Week Showcase",
        "domain": "LCH",
        "level": "leader",
        "pack": "Fashion Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Showcase Producer",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Leadership",
            "Innovation",
            "Teamwork",
            "Communication",
            "Professional Excellence"
        ],
        "purpose": "The Fashion Week Showcase is a large-scale event where participants present themed collections, styling concepts, and creative fashion projects through runway presentations, exhibitions, and multimedia displays.",
        "outcomes": [
            "Organize and participate in fashion showcase events.",
            "Present complete fashion collections professionally.",
            "Collaborate effectively within multidisciplinary teams.",
            "Demonstrate confidence in runway presentation."
        ],
        "competencies": [
            "Fashion Collection Development",
            "Event Management",
            "Team Collaboration",
            "Public Presentation",
            "Creative Leadership"
        ],
        "syllabus": [
            "Collection Development",
            "Fashion Styling",
            "Runway Presentation",
            "Event Coordination",
            "Stage Management",
            "Audience Engagement"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Fashion Club Committee"
    },
    {
        "id": "LCH-FC-A20",
        "code": "FC-A20",
        "name": "Annual Fashion Show & Awards",
        "domain": "LCH",
        "level": "leader",
        "pack": "Fashion Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Fashion Awardee",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Leadership",
            "Professionalism",
            "Creativity",
            "Collaboration",
            "Lifelong Learning"
        ],
        "purpose": "The Annual Fashion Show & Awards serves as the flagship event of the Fashion Club, celebrating members' achievements through runway presentations, designer showcases, styling competitions, and recognition of outstanding contributions.",
        "outcomes": [
            "Execute professional fashion show presentations.",
            "Demonstrate leadership in organizing large-scale fashion events.",
            "Showcase comprehensive fashion design and styling skills.",
            "Reflect on personal growth through portfolio presentation and recognition."
        ],
        "competencies": [
            "Fashion Event Management",
            "Leadership",
            "Runway Presentation",
            "Team Coordination",
            "Professional Portfolio Presentation"
        ],
        "syllabus": [
            "Fashion Show Production",
            "Runway Choreography",
            "Collection Presentation",
            "Event Operations",
            "Judging and Awards",
            "Professional Reflection"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Fashion Club Committee"
    },
    {
        "id": "LCH-ESC-A01",
        "code": "ESC-A01",
        "name": "eSports Club Orientation & Community Meet",
        "domain": "LCH",
        "level": "explorer",
        "pack": "eSports Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "eSports Recruit",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Effective Communication",
            "Teamwork and Collaboration",
            "Ethical Responsibility",
            "Leadership Potential",
            "Lifelong Learning"
        ],
        "purpose": "The eSports Club Orientation & Community Meet introduces students to the club's vision, competitive ecosystem, membership opportunities, tournament structure, code of conduct, and annual activity calendar.",
        "outcomes": [
            "Understand the objectives, structure, and opportunities offered by the eSports Club.",
            "Explain esports ethics, fair play principles, and responsible gaming practices.",
            "Identify various competitive gaming pathways and club programmes.",
            "Build professional relationships within the university gaming community."
        ],
        "competencies": [
            "Communication Skills",
            "Networking Skills",
            "Team Collaboration",
            "Professional Conduct",
            "Community Building",
            "Leadership Awareness"
        ],
        "syllabus": [
            "Introduction to Esports",
            "Evolution of Competitive Gaming",
            "Club Vision, Mission & Annual Roadmap",
            "Membership Structure",
            "Tournament Ecosystem",
            "Fair Play & Anti-Cheating Policies"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A02",
        "code": "ESC-A02",
        "name": "Weekly BGMI Tournament",
        "domain": "LCH",
        "level": "explorer",
        "pack": "eSports Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "BGMI Contender",
        "sdgs": [
            3,
            4,
            9
        ],
        "ga": [
            "Problem Solving",
            "Teamwork",
            "Leadership",
            "Ethical Behaviour",
            "Adaptability"
        ],
        "purpose": "A recurring competitive tournament where students participate in solo, duo, or squad-based Battlegrounds Mobile India (BGMI) matches.",
        "outcomes": [
            "Apply strategic gameplay techniques during competitive matches.",
            "Demonstrate effective squad communication and coordination.",
            "Analyze gameplay to identify strengths and improvement areas.",
            "Exhibit professionalism, discipline, and sportsmanship during tournaments."
        ],
        "competencies": [
            "Strategic Thinking",
            "Tactical Decision-Making",
            "Team Coordination",
            "Leadership",
            "Pressure Management",
            "Performance Analysis"
        ],
        "syllabus": [
            "BGMI Game Mechanics",
            "Team Roles",
            "Map Awareness",
            "Rotations & Positioning",
            "Loot Optimization",
            "Combat Strategies"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A03",
        "code": "ESC-A03",
        "name": "Weekly Free Fire MAX Tournament",
        "domain": "LCH",
        "level": "explorer",
        "pack": "eSports Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Free Fire Specialist",
        "sdgs": [
            4,
            9,
            17
        ],
        "ga": [
            "Critical Thinking",
            "Leadership",
            "Team Collaboration",
            "Ethical Responsibility",
            "Continuous Learning"
        ],
        "purpose": "A structured weekly Free Fire MAX tournament designed to strengthen teamwork, tactical planning, quick decision-making, and competitive performance through organized league-style matches.",
        "outcomes": [
            "Demonstrate effective gameplay strategies.",
            "Coordinate efficiently within competitive teams.",
            "Evaluate match performance using gameplay analysis.",
            "Apply fair play principles during esports competitions."
        ],
        "competencies": [
            "Tactical Planning",
            "Critical Thinking",
            "Communication",
            "Teamwork",
            "Competitive Discipline",
            "Analytical Skills"
        ],
        "syllabus": [
            "Character Skills",
            "Weapon Selection",
            "Map Strategy",
            "Team Coordination",
            "Positioning",
            "Rotation Planning"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A04",
        "code": "ESC-A04",
        "name": "Weekly Call of Duty: Mobile Tournament",
        "domain": "LCH",
        "level": "explorer",
        "pack": "eSports Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "CODM Specialist",
        "sdgs": [
            3,
            4,
            9
        ],
        "ga": [
            "Strategic Thinking",
            "Teamwork",
            "Leadership",
            "Ethical Conduct",
            "Adaptability"
        ],
        "purpose": "A competitive Call of Duty: Mobile tournament focusing on precision gameplay, tactical execution, team coordination, and objective-based competition through structured weekly events.",
        "outcomes": [
            "Execute tactical gameplay under competitive conditions.",
            "Coordinate effectively during objective-based matches.",
            "Improve reaction time and strategic awareness.",
            "Demonstrate professionalism and competitive ethics."
        ],
        "competencies": [
            "Tactical Execution",
            "Decision Making",
            "Team Coordination",
            "Analytical Thinking",
            "Leadership",
            "Performance Evaluation"
        ],
        "syllabus": [
            "Multiplayer Modes",
            "Objective-Based Strategies",
            "Weapon Loadouts",
            "Map Control",
            "Team Communication",
            "Tactical Positioning"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A05",
        "code": "ESC-A05",
        "name": "Weekly Valorant Tournament",
        "domain": "LCH",
        "level": "explorer",
        "pack": "eSports Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Valorant Agent",
        "sdgs": [
            4,
            9,
            17
        ],
        "ga": [
            "Critical Thinking",
            "Leadership",
            "Teamwork",
            "Professional Ethics",
            "Lifelong Learning"
        ],
        "purpose": "A weekly tactical FPS tournament where participants compete in organized Valorant matches, emphasizing communication, strategic planning, agent coordination, and professional esports standards.",
        "outcomes": [
            "Apply tactical FPS strategies during competitive matches.",
            "Coordinate effectively using agent roles and abilities.",
            "Analyze team performance for continuous improvement.",
            "Demonstrate ethical behaviour and sportsmanship in esports competitions."
        ],
        "competencies": [
            "Tactical Planning",
            "Strategic Decision-Making",
            "Team Leadership",
            "Communication",
            "Adaptability",
            "Critical Analysis"
        ],
        "syllabus": [
            "Agent Roles",
            "Utility Management",
            "Economy Management",
            "Tactical Execution",
            "Defensive Strategies",
            "Offensive Strategies"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A06",
        "code": "ESC-A06",
        "name": "Weekly Tekken 8 Tournament",
        "domain": "LCH",
        "level": "foundation",
        "pack": "eSports Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Tekken Fighter",
        "sdgs": [
            4,
            9,
            17
        ],
        "ga": [
            "Critical Thinking",
            "Ethical Responsibility",
            "Self-Management",
            "Continuous Learning",
            "Problem Solving"
        ],
        "purpose": "The Weekly Tekken 8 Tournament provides students with a structured platform to compete in one-on-one fighting game matches.",
        "outcomes": [
            "Demonstrate advanced character control and combo execution.",
            "Apply strategic decision-making during competitive matches.",
            "Analyze opponents' playstyles and adapt tactics accordingly.",
            "Exhibit sportsmanship, discipline, and fair play throughout the tournament."
        ],
        "competencies": [
            "Strategic Thinking",
            "Decision Making",
            "Precision Execution",
            "Adaptability",
            "Competitive Discipline",
            "Analytical Thinking"
        ],
        "syllabus": [
            "Tekken 8 Game Mechanics",
            "Character Selection & Matchups",
            "Basic & Advanced Combos",
            "Movement Techniques",
            "Defensive Strategies",
            "Frame Data Fundamentals"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A07",
        "code": "ESC-A07",
        "name": "Fun Friday Custom Room Matches",
        "domain": "LCH",
        "level": "foundation",
        "pack": "eSports Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Casual Gamer",
        "sdgs": [
            3,
            4,
            16
        ],
        "ga": [
            "Team Collaboration",
            "Ethical Behaviour",
            "Leadership",
            "Communication Skills",
            "Social Responsibility"
        ],
        "purpose": "Fun Friday Custom Room Matches offer informal gaming sessions where members participate in friendly competitions across various games.",
        "outcomes": [
            "Build positive relationships within the gaming community.",
            "Practice teamwork in a non-competitive environment.",
            "Demonstrate responsible gaming behaviour.",
            "Improve communication through collaborative gameplay."
        ],
        "competencies": [
            "Teamwork",
            "Communication",
            "Social Interaction",
            "Leadership",
            "Collaboration",
            "Community Building"
        ],
        "syllabus": [
            "Friendly Custom Matches",
            "Team Formation",
            "Casual Game Modes",
            "Mini Challenges",
            "Communication Activities",
            "Team Coordination"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A08",
        "code": "ESC-A08",
        "name": "1v1 & Squad Knockout Challenges",
        "domain": "LCH",
        "level": "foundation",
        "pack": "eSports Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Knockout Specialist",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Adaptability",
            "Leadership",
            "Problem Solving",
            "Self-Management",
            "Lifelong Learning"
        ],
        "purpose": "This activity features knockout-format competitions for both individual players and squads, allowing participants to test their skills under high-pressure conditions while improving tactical execution and competitive resilience.",
        "outcomes": [
            "Perform effectively under tournament pressure.",
            "Apply tactical gameplay during elimination matches.",
            "Demonstrate resilience after wins and losses.",
            "Evaluate performance for continuous improvement."
        ],
        "competencies": [
            "Decision Making",
            "Tactical Planning",
            "Emotional Resilience",
            "Competitive Mindset",
            "Critical Thinking",
            "Performance Analysis"
        ],
        "syllabus": [
            "Knockout Tournament Formats",
            "Solo Competitions",
            "Squad Challenges",
            "Match Preparation",
            "Tactical Planning",
            "Opponent Analysis"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A09",
        "code": "ESC-A09",
        "name": "Inter-Department eSports League",
        "domain": "LCH",
        "level": "foundation",
        "pack": "eSports Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Department Champion",
        "sdgs": [
            4,
            10,
            17
        ],
        "ga": [
            "Leadership",
            "Teamwork",
            "Ethical Responsibility",
            "Communication",
            "Professionalism"
        ],
        "purpose": "The Inter-Department eSports League is a university-wide championship where teams representing different academic departments compete across multiple esports titles, promoting institutional engagement, teamwork, and healthy competition.",
        "outcomes": [
            "Represent their department professionally during competitions.",
            "Coordinate effectively within multidisciplinary teams.",
            "Apply strategic gameplay across multiple tournament formats.",
            "Demonstrate leadership and sportsmanship."
        ],
        "competencies": [
            "Leadership",
            "Team Coordination",
            "Strategic Planning",
            "Communication",
            "Competitive Discipline",
            "Organizational Skills"
        ],
        "syllabus": [
            "League Structure",
            "Team Registration",
            "Match Scheduling",
            "Tournament Rules",
            "Team Strategy",
            "Communication Systems"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A10",
        "code": "ESC-A10",
        "name": "Casual Gaming Night",
        "domain": "LCH",
        "level": "foundation",
        "pack": "eSports Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Community Gamer",
        "sdgs": [
            3,
            4,
            16
        ],
        "ga": [
            "Communication Skills",
            "Teamwork",
            "Social Responsibility",
            "Adaptability",
            "Emotional Intelligence"
        ],
        "purpose": "Casual Gaming Night provides members with a relaxed environment to explore different multiplayer games, strengthen friendships, reduce academic stress, and foster an inclusive gaming culture without the pressure of formal competition.",
        "outcomes": [
            "Build meaningful relationships within the esports community.",
            "Demonstrate collaborative gameplay and teamwork.",
            "Practice responsible gaming habits.",
            "Appreciate gaming as a medium for recreation and social engagement."
        ],
        "competencies": [
            "Collaboration",
            "Communication",
            "Social Skills",
            "Teamwork",
            "Emotional Intelligence",
            "Community Engagement"
        ],
        "syllabus": [
            "Multiplayer Party Games",
            "Cooperative Gameplay",
            "Community Activities",
            "Team Challenges",
            "Icebreaker Games",
            "Friendly Competitions"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A11",
        "code": "ESC-A11",
        "name": "Gaming Quiz & eSports Trivia",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "eSports Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Trivia Master",
        "sdgs": [
            4,
            9,
            17
        ],
        "ga": [
            "Critical Thinking",
            "Lifelong Learning",
            "Team Collaboration",
            "Communication Skills",
            "Professional Awareness"
        ],
        "purpose": "The Gaming Quiz & eSports Trivia activity engages members in quizzes covering gaming history, esports tournaments, professional players, game mechanics, technology, and industry developments.",
        "outcomes": [
            "Demonstrate knowledge of esports history, games, and tournaments.",
            "Identify professional esports teams, players, and gaming organizations.",
            "Apply critical thinking while solving gaming-related questions.",
            "Collaborate effectively during team-based quiz competitions."
        ],
        "competencies": [
            "Critical Thinking",
            "General Knowledge",
            "Analytical Skills",
            "Communication",
            "Teamwork",
            "Quick Decision Making"
        ],
        "syllabus": [
            "History of eSports",
            "Popular Game Titles",
            "Professional Players & Teams",
            "Tournament Formats",
            "Gaming Technology",
            "Game Mechanics"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A12",
        "code": "ESC-A12",
        "name": "Speedrun & Challenge Events",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "eSports Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Speedrunner",
        "sdgs": [
            4,
            9,
            3
        ],
        "ga": [
            "Critical Thinking",
            "Adaptability",
            "Continuous Learning",
            "Self-Management",
            "Innovation"
        ],
        "purpose": "Speedrun & Challenge Events encourage participants to complete gaming objectives within predefined constraints or time limits.",
        "outcomes": [
            "Execute gaming objectives efficiently under time constraints.",
            "Demonstrate adaptability in dynamic gameplay situations.",
            "Apply innovative strategies to overcome game challenges.",
            "Evaluate personal performance for continuous improvement."
        ],
        "competencies": [
            "Problem Solving",
            "Time Management",
            "Adaptability",
            "Precision",
            "Strategic Thinking",
            "Analytical Skills"
        ],
        "syllabus": [
            "Speedrunning Fundamentals",
            "Challenge-Based Gameplay",
            "Time Optimization",
            "Route Planning",
            "Precision Techniques",
            "Resource Management"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A13",
        "code": "ESC-A13",
        "name": "Gaming Strategy Workshops",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "eSports Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Tactician",
        "sdgs": [
            4,
            9,
            17
        ],
        "ga": [
            "Leadership",
            "Teamwork",
            "Critical Thinking",
            "Lifelong Learning",
            "Professional Competence"
        ],
        "purpose": "Gaming Strategy Workshops provide structured learning sessions where experienced players and mentors teach tactical gameplay, team coordination, map control, communication techniques, and competitive strategies applicable to various esports titles.",
        "outcomes": [
            "Apply advanced gaming strategies during competitive matches.",
            "Analyze professional gameplay to improve performance.",
            "Develop effective communication and teamwork skills.",
            "Design game plans based on tactical objectives."
        ],
        "competencies": [
            "Strategic Planning",
            "Leadership",
            "Team Coordination",
            "Communication",
            "Critical Analysis",
            "Tactical Decision Making"
        ],
        "syllabus": [
            "Tactical Planning",
            "Map Control",
            "Team Communication",
            "Role Assignment",
            "Strategy Development",
            "Professional Gameplay Analysis"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A14",
        "code": "ESC-A14",
        "name": "Game Patch & Meta Discussion Sessions",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "eSports Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Meta Analyst",
        "sdgs": [
            4,
            9,
            17
        ],
        "ga": [
            "Analytical Thinking",
            "Adaptability",
            "Lifelong Learning",
            "Communication Skills",
            "Professional Awareness"
        ],
        "purpose": "This activity enables members to study game updates, balance changes, new content releases, and evolving competitive meta strategies.",
        "outcomes": [
            "Interpret game patch updates and balance changes.",
            "Analyze evolving competitive meta strategies.",
            "Adapt gameplay according to new game mechanics.",
            "Communicate tactical recommendations within teams."
        ],
        "competencies": [
            "Critical Analysis",
            "Adaptability",
            "Research Skills",
            "Strategic Thinking",
            "Communication",
            "Decision Making"
        ],
        "syllabus": [
            "Patch Note Analysis",
            "Meta Evolution",
            "Character & Weapon Balancing",
            "Competitive Strategies",
            "Team Discussions",
            "Professional Match Reviews"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A15",
        "code": "ESC-A15",
        "name": "Live Match Watch Parties (Professional Tournaments)",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "eSports Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Match Analyst",
        "sdgs": [
            4,
            9,
            17
        ],
        "ga": [
            "Critical Thinking",
            "Lifelong Learning",
            "Team Collaboration",
            "Professional Awareness",
            "Problem Solving"
        ],
        "purpose": "Live Match Watch Parties bring members together to watch professional esports tournaments. Participants observe elite gameplay, analyze strategies, discuss tactical decisions, and learn from professional players and coaches.",
        "outcomes": [
            "Analyze professional esports strategies and gameplay.",
            "Identify effective teamwork and communication techniques.",
            "Evaluate tactical decisions made during professional matches.",
            "Apply professional insights to improve personal performance."
        ],
        "competencies": [
            "Strategic Analysis",
            "Observation Skills",
            "Critical Thinking",
            "Communication",
            "Tactical Awareness",
            "Continuous Learning"
        ],
        "syllabus": [
            "Professional Tournament Viewing",
            "Match Analysis",
            "Team Strategies",
            "Communication Systems",
            "Tactical Execution",
            "Role-Based Gameplay"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Mentor"
    },
    {
        "id": "LCH-ESC-A16",
        "code": "ESC-A16",
        "name": "LAN Gaming Festival",
        "domain": "LCH",
        "level": "leader",
        "pack": "eSports Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "LAN Organizer",
        "sdgs": [
            4,
            9,
            17
        ],
        "ga": [
            "Leadership",
            "Team Collaboration",
            "Professional Ethics",
            "Adaptability",
            "Communication Skills"
        ],
        "purpose": "The LAN Gaming Festival is a large-scale on-campus esports event where participants compete in multiple gaming titles using a local area network (LAN).",
        "outcomes": [
            "Demonstrate competitive gaming skills in a LAN tournament environment.",
            "Collaborate effectively with teammates during live competitions.",
            "Apply tournament etiquette and professional esports standards.",
            "Build networking opportunities with fellow gamers and organizers."
        ],
        "competencies": [
            "Teamwork",
            "Strategic Planning",
            "Communication",
            "Leadership",
            "Adaptability",
            "Competitive Discipline"
        ],
        "syllabus": [
            "LAN Tournament Setup",
            "Tournament Formats",
            "Team Coordination",
            "Competitive Rules",
            "Match Scheduling",
            "Event Logistics"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "eSports Club Committee"
    },
    {
        "id": "LCH-ESC-A17",
        "code": "ESC-A17",
        "name": "Content Creation Challenge (Highlights, Shorts & Reels)",
        "domain": "LCH",
        "level": "leader",
        "pack": "eSports Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Content Creator",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Creativity",
            "Digital Literacy",
            "Communication Skills",
            "Lifelong Learning",
            "Innovation"
        ],
        "purpose": "The Content Creation Challenge encourages members to produce engaging gaming content such as match highlights, YouTube Shorts, Instagram Reels, and gameplay montages.",
        "outcomes": [
            "Create engaging gaming videos for digital platforms.",
            "Apply basic video editing and storytelling techniques.",
            "Design content that effectively communicates gaming experiences.",
            "Evaluate audience engagement using digital media analytics."
        ],
        "competencies": [
            "Creativity",
            "Video Editing",
            "Digital Storytelling",
            "Content Marketing",
            "Communication",
            "Social Media Management"
        ],
        "syllabus": [
            "Gaming Content Planning",
            "Script Development",
            "Gameplay Recording",
            "Video Editing",
            "Short-form Content Creation",
            "Thumbnail Design"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Committee"
    },
    {
        "id": "LCH-ESC-A18",
        "code": "ESC-A18",
        "name": "Game Casting & Shoutcasting Workshop",
        "domain": "LCH",
        "level": "leader",
        "pack": "eSports Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Shoutcaster",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Effective Communication",
            "Leadership",
            "Professionalism",
            "Creativity",
            "Lifelong Learning"
        ],
        "purpose": "This workshop trains students in the fundamentals of esports commentary, live match analysis, public speaking, broadcasting, and audience engagement.",
        "outcomes": [
            "Deliver professional live esports commentary.",
            "Analyze gameplay while communicating effectively to audiences.",
            "Demonstrate public speaking and presentation skills.",
            "Apply broadcasting ethics during live events."
        ],
        "competencies": [
            "Public Speaking",
            "Communication",
            "Presentation Skills",
            "Broadcasting",
            "Confidence Building",
            "Event Hosting"
        ],
        "syllabus": [
            "Introduction to Shoutcasting",
            "Voice Modulation",
            "Match Commentary",
            "Public Speaking",
            "Live Broadcasting",
            "Audience Engagement"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "eSports Club Committee"
    },
    {
        "id": "LCH-ESC-A19",
        "code": "ESC-A19",
        "name": "Annual KL eSports Championship",
        "domain": "LCH",
        "level": "leader",
        "pack": "eSports Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "eSports Champion",
        "sdgs": [
            4,
            9,
            17
        ],
        "ga": [
            "Leadership",
            "Ethical Responsibility",
            "Team Collaboration",
            "Critical Thinking",
            "Professional Competence"
        ],
        "purpose": "The Annual KL eSports Championship is the flagship competitive event of the club, bringing together the university's top players across multiple esports titles.",
        "outcomes": [
            "Perform effectively in a high-level competitive environment.",
            "Apply advanced strategic and tactical gameplay.",
            "Demonstrate professionalism throughout tournament participation.",
            "Analyze competitive performance for continuous improvement."
        ],
        "competencies": [
            "Leadership",
            "Strategic Thinking",
            "Teamwork",
            "Competitive Excellence",
            "Performance Analysis",
            "Professional Conduct"
        ],
        "syllabus": [
            "Championship Regulations",
            "Tournament Operations",
            "Competitive Strategies",
            "Team Coordination",
            "Match Scheduling",
            "Performance Analytics"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 300,
        "faculty": "eSports Club Committee"
    },
    {
        "id": "LCH-ESC-A20",
        "code": "ESC-A20",
        "name": "eSports Awards & Recognition Ceremony",
        "domain": "LCH",
        "level": "leader",
        "pack": "eSports Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "MVP",
        "sdgs": [
            4,
            16,
            17
        ],
        "ga": [
            "Leadership",
            "Ethical Behaviour",
            "Lifelong Learning",
            "Self-Management",
            "Social Responsibility"
        ],
        "purpose": "The eSports Awards & Recognition Ceremony celebrates outstanding achievements, leadership, sportsmanship, content creation, tournament organization, and community contributions made by club members throughout the academic year.",
        "outcomes": [
            "Recognize excellence in esports and community service.",
            "Appreciate the importance of leadership and teamwork.",
            "Reflect on personal achievements and future goals.",
            "Strengthen motivation for continued participation and growth."
        ],
        "competencies": [
            "Self-Reflection",
            "Leadership",
            "Professionalism",
            "Motivation",
            "Goal Setting",
            "Community Engagement"
        ],
        "syllabus": [
            "Annual Club Review",
            "Performance Recognition",
            "Leadership Awards",
            "Tournament Awards",
            "Community Contribution Awards",
            "Content Creator Awards"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 400,
        "faculty": "eSports Club Committee"
    },
    {
        "id": "LCH-TA-A01",
        "code": "TA-A01",
        "name": "Theatre Club Orientation & Icebreaker Games",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Theatre Explorer",
        "sdgs": [
            4,
            5,
            16
        ],
        "ga": [
            "Effective Communication",
            "Leadership",
            "Team Collaboration",
            "Creative Thinking",
            "Emotional Intelligence",
            "Lifelong Learning"
        ],
        "purpose": "The Theatre Club Orientation & Icebreaker Games introduces students to the vision, culture, and opportunities within the Theatre Arts Club while fostering confidence, communication, creativity, and teamwork.",
        "outcomes": [
            "Understand the objectives, structure, and opportunities of the Theatre Arts Club.",
            "Build confidence in interacting and performing with peers.",
            "Demonstrate basic improvisation and creative thinking skills.",
            "Develop teamwork, trust, and effective communication."
        ],
        "competencies": [
            "Communication Skills",
            "Teamwork",
            "Confidence Building",
            "Creative Thinking",
            "Collaboration",
            "Leadership Potential",
            "Social Interaction",
            "Stage Awareness"
        ],
        "syllabus": [
            "Introduction to Theatre Arts Club",
            "Theatre Etiquette and Stage Discipline",
            "Icebreaker Theatre Games",
            "Trust and Team-Building Exercises",
            "Communication through Theatre",
            "Introduction to Improvisation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A02",
        "code": "TA-A02",
        "name": "Acting Fundamentals Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Aspiring Actor",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Creativity",
            "Communication",
            "Confidence",
            "Professional Ethics",
            "Teamwork",
            "Adaptability"
        ],
        "purpose": "This workshop introduces participants to the core principles of acting, including observation, expression, characterization, emotional control, and stage presence.",
        "outcomes": [
            "Understand the fundamentals of stage acting.",
            "Perform basic character portrayals with confidence.",
            "Apply voice and body techniques during performances.",
            "Demonstrate effective stage presence."
        ],
        "competencies": [
            "Acting Skills",
            "Observation",
            "Emotional Expression",
            "Body Coordination",
            "Voice Control",
            "Confidence",
            "Creativity",
            "Public Performance"
        ],
        "syllabus": [
            "History of Theatre",
            "Principles of Acting",
            "Observation Skills",
            "Character Development",
            "Voice Projection",
            "Facial Expressions"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A03",
        "code": "TA-A03",
        "name": "Voice Modulation & Diction Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Vocal Artist",
        "sdgs": [
            4,
            8,
            10
        ],
        "ga": [
            "Communication",
            "Confidence",
            "Professionalism",
            "Adaptability",
            "Emotional Intelligence",
            "Lifelong Learning"
        ],
        "purpose": "This workshop trains participants to improve vocal clarity, pronunciation, breathing, articulation, pitch, and emotional delivery.",
        "outcomes": [
            "Improve pronunciation and diction.",
            "Control voice volume, pitch, and pace.",
            "Deliver dialogues with emotional impact.",
            "Apply breathing techniques for stage performances."
        ],
        "competencies": [
            "Voice Projection",
            "Public Speaking",
            "Verbal Communication",
            "Pronunciation",
            "Stage Confidence",
            "Emotional Expression",
            "Presentation Skills",
            "Listening Skills"
        ],
        "syllabus": [
            "Voice Production",
            "Breathing Techniques",
            "Pronunciation Practice",
            "Diction Improvement",
            "Pitch and Tone Control",
            "Emotional Voice Delivery"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A04",
        "code": "TA-A04",
        "name": "Improvisation (Improv) Games",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Improv Master",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Critical Thinking",
            "Creativity",
            "Collaboration",
            "Communication",
            "Leadership",
            "Adaptability"
        ],
        "purpose": "Participants engage in spontaneous theatre exercises that develop creativity, quick thinking, adaptability, and collaborative storytelling.",
        "outcomes": [
            "Think creatively under pressure.",
            "Perform unscripted scenes confidently.",
            "Collaborate effectively during live performances.",
            "Improve spontaneity and problem-solving skills."
        ],
        "competencies": [
            "Creativity",
            "Quick Decision Making",
            "Teamwork",
            "Adaptability",
            "Communication",
            "Leadership",
            "Confidence",
            "Innovation"
        ],
        "syllabus": [
            "Principles of Improvisation",
            "“Yes, And...” Technique",
            "Story Building Games",
            "Character Improvisation",
            "Group Improvisation",
            "Emotional Improvisation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A05",
        "code": "TA-A05",
        "name": "Mime Performance Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Mime Artist",
        "sdgs": [
            4,
            10,
            11
        ],
        "ga": [
            "Creativity",
            "Communication",
            "Emotional Intelligence",
            "Teamwork",
            "Confidence",
            "Lifelong Learning"
        ],
        "purpose": "The Mime Performance Workshop teaches participants to communicate stories, emotions, and ideas without spoken dialogue.",
        "outcomes": [
            "Communicate effectively without verbal dialogue.",
            "Perform expressive mime sequences.",
            "Demonstrate control over body movements and facial expressions.",
            "Interpret emotions and narratives through physical performance."
        ],
        "competencies": [
            "Non-Verbal Communication",
            "Physical Coordination",
            "Creativity",
            "Emotional Expression",
            "Observation",
            "Stage Presence",
            "Performance Skills",
            "Artistic Interpretation"
        ],
        "syllabus": [
            "History of Mime",
            "Principles of Non-Verbal Communication",
            "Facial Expressions",
            "Body Isolation Techniques",
            "Illusion Movements",
            "Character Creation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A06",
        "code": "TA-A06",
        "name": "Monologue Competition",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Solo Performer",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Effective Communication",
            "Creativity",
            "Confidence",
            "Professionalism",
            "Self-Learning",
            "Emotional Intelligence"
        ],
        "purpose": "The Monologue Competition provides participants with an opportunity to perform individual dramatic, comedic, or inspirational monologues.",
        "outcomes": [
            "Perform a complete monologue with confidence and clarity.",
            "Demonstrate emotional depth through character portrayal.",
            "Apply voice modulation, body language, and stage movement effectively.",
            "Receive and implement constructive performance feedback."
        ],
        "competencies": [
            "Solo Performance",
            "Acting Skills",
            "Voice Modulation",
            "Emotional Intelligence",
            "Stage Confidence",
            "Critical Self-Evaluation",
            "Presentation Skills",
            "Time Management"
        ],
        "syllabus": [
            "Selecting an Appropriate Monologue",
            "Script Interpretation",
            "Character Analysis",
            "Emotional Expression Techniques",
            "Voice Projection",
            "Stage Movement"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A07",
        "code": "TA-A07",
        "name": "Dialogue Delivery Challenge",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Dialogue Expert",
        "sdgs": [
            4,
            10,
            17
        ],
        "ga": [
            "Communication",
            "Collaboration",
            "Creativity",
            "Leadership",
            "Adaptability",
            "Emotional Intelligence"
        ],
        "purpose": "The Dialogue Delivery Challenge focuses on effective communication between actors through paired or group performances.",
        "outcomes": [
            "Deliver dialogues naturally and expressively.",
            "Demonstrate effective interaction with fellow actors.",
            "Apply appropriate pacing, timing, and emotional transitions.",
            "Improve listening and collaborative acting skills."
        ],
        "competencies": [
            "Dialogue Delivery",
            "Active Listening",
            "Teamwork",
            "Emotional Expression",
            "Voice Control",
            "Collaboration",
            "Stage Coordination",
            "Communication Skills"
        ],
        "syllabus": [
            "Dialogue Interpretation",
            "Scene Analysis",
            "Timing and Rhythm",
            "Voice and Tone Control",
            "Character Relationships",
            "Active Listening"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A08",
        "code": "TA-A08",
        "name": "Character Portrayal Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Character Actor",
        "sdgs": [
            4,
            5,
            16
        ],
        "ga": [
            "Critical Thinking",
            "Creativity",
            "Emotional Intelligence",
            "Communication",
            "Adaptability",
            "Lifelong Learning"
        ],
        "purpose": "This workshop enables participants to understand, develop, and portray diverse fictional and real-life characters.",
        "outcomes": [
            "Analyze and interpret different character roles.",
            "Build convincing character personalities and behaviors.",
            "Demonstrate consistent character portrayal throughout a performance.",
            "Apply observation and empathy in acting."
        ],
        "competencies": [
            "Character Development",
            "Observation Skills",
            "Emotional Intelligence",
            "Creativity",
            "Analytical Thinking",
            "Acting Techniques",
            "Adaptability",
            "Storytelling"
        ],
        "syllabus": [
            "Fundamentals of Character Building",
            "Character Background Development",
            "Psychological Analysis",
            "Physical Transformation",
            "Costume and Props Integration",
            "Emotional Memory"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A09",
        "code": "TA-A09",
        "name": "Stage Movement & Body Language Session",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Stage Mover",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Communication",
            "Creativity",
            "Confidence",
            "Adaptability",
            "Professionalism",
            "Teamwork"
        ],
        "purpose": "The Stage Movement & Body Language Session develops participants' ability to communicate effectively through posture, gestures, movement, and spatial awareness.",
        "outcomes": [
            "Demonstrate effective stage movement techniques.",
            "Use body language to express emotions and character traits.",
            "Maintain proper stage positioning during performances.",
            "Coordinate movement with dialogue and performance objectives."
        ],
        "competencies": [
            "Stage Movement",
            "Physical Coordination",
            "Body Language",
            "Confidence",
            "Observation",
            "Performance Skills",
            "Creativity",
            "Spatial Awareness"
        ],
        "syllabus": [
            "Stage Geography",
            "Movement Techniques",
            "Body Balance and Posture",
            "Gestures and Expressions",
            "Spatial Awareness",
            "Blocking Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A10",
        "code": "TA-A10",
        "name": "Street Play (Nukkad Natak) Performance",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Street Performer",
        "sdgs": [
            4,
            11,
            16
        ],
        "ga": [
            "Social Responsibility",
            "Leadership",
            "Communication",
            "Collaboration",
            "Ethical Values",
            "Creativity"
        ],
        "purpose": "The Street Play Performance activity trains participants to create and perform socially relevant theatrical productions in public spaces.",
        "outcomes": [
            "Develop and perform socially relevant street plays.",
            "Communicate awareness messages effectively through theatre.",
            "Engage diverse audiences in interactive performances.",
            "Demonstrate teamwork in planning and executing public performances."
        ],
        "competencies": [
            "Social Awareness",
            "Public Performance",
            "Community Engagement",
            "Leadership",
            "Teamwork",
            "Communication",
            "Creativity",
            "Civic Responsibility"
        ],
        "syllabus": [
            "Introduction to Street Theatre",
            "Social Issue Identification",
            "Script Development",
            "Voice Projection in Open Spaces",
            "Audience Interaction Techniques",
            "Group Coordination"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A11",
        "code": "TA-A11",
        "name": "Script Reading Circle",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Script Analyst",
        "sdgs": [
            4,
            10,
            11
        ],
        "ga": [
            "Critical Thinking",
            "Communication",
            "Creativity",
            "Teamwork",
            "Lifelong Learning",
            "Ethical Awareness"
        ],
        "purpose": "The Script Reading Circle provides participants with structured reading sessions to explore classic and contemporary theatre scripts.",
        "outcomes": [
            "Analyze theatrical scripts critically.",
            "Interpret characters and dramatic situations effectively.",
            "Read scripts with appropriate expression and voice modulation.",
            "Appreciate different styles and genres of theatre."
        ],
        "competencies": [
            "Script Analysis",
            "Critical Thinking",
            "Reading Fluency",
            "Communication Skills",
            "Interpretation",
            "Collaboration",
            "Observation",
            "Storytelling"
        ],
        "syllabus": [
            "Introduction to Script Reading",
            "Theatre Genres",
            "Character Analysis",
            "Dialogue Interpretation",
            "Dramatic Structure",
            "Script Annotation Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A12",
        "code": "TA-A12",
        "name": "Short Play Competition",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Play Director",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Leadership",
            "Creativity",
            "Collaboration",
            "Communication",
            "Adaptability",
            "Professionalism"
        ],
        "purpose": "The Short Play Competition enables participants to conceptualize, rehearse, and perform original or adapted theatrical productions within a limited duration.",
        "outcomes": [
            "Produce and perform a complete short play.",
            "Collaborate effectively within a theatre production team.",
            "Demonstrate stage confidence and audience engagement.",
            "Apply acting and production techniques in a competitive setting."
        ],
        "competencies": [
            "Acting",
            "Teamwork",
            "Leadership",
            "Time Management",
            "Production Planning",
            "Creativity",
            "Communication",
            "Problem Solving"
        ],
        "syllabus": [
            "Script Selection",
            "Casting",
            "Rehearsal Planning",
            "Acting Techniques",
            "Stage Blocking",
            "Technical Coordination"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A13",
        "code": "TA-A13",
        "name": "Stage Makeup & Costume Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Theatre Stylist",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Creativity",
            "Professionalism",
            "Teamwork",
            "Innovation",
            "Adaptability",
            "Lifelong Learning"
        ],
        "purpose": "This workshop introduces participants to theatrical makeup, costume design, character transformation, and visual storytelling.",
        "outcomes": [
            "Apply basic theatrical makeup techniques.",
            "Select costumes appropriate for different characters.",
            "Understand visual character transformation.",
            "Support theatre productions through backstage roles."
        ],
        "competencies": [
            "Makeup Techniques",
            "Costume Design",
            "Creativity",
            "Attention to Detail",
            "Visual Communication",
            "Teamwork",
            "Problem Solving",
            "Theatre Production Support"
        ],
        "syllabus": [
            "Fundamentals of Stage Makeup",
            "Character Makeup",
            "Costume Selection",
            "Costume Maintenance",
            "Special Effects Makeup Basics",
            "Wig and Hair Styling"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A14",
        "code": "TA-A14",
        "name": "Stage Design & Props Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Set Designer",
        "sdgs": [
            4,
            9,
            12
        ],
        "ga": [
            "Creativity",
            "Leadership",
            "Innovation",
            "Professionalism",
            "Collaboration",
            "Sustainability Awareness"
        ],
        "purpose": "The Stage Design & Props Workshop trains participants in designing theatrical sets, creating stage properties, and planning performance spaces.",
        "outcomes": [
            "Design basic theatre sets and stage layouts.",
            "Create and manage props effectively.",
            "Apply principles of stage aesthetics.",
            "Support theatre productions through technical design."
        ],
        "competencies": [
            "Set Design",
            "Creative Visualization",
            "Project Planning",
            "Craftsmanship",
            "Teamwork",
            "Technical Theatre",
            "Resource Management",
            "Problem Solving"
        ],
        "syllabus": [
            "Principles of Stage Design",
            "Set Planning",
            "Props Design",
            "Material Selection",
            "Stage Layout",
            "Visual Composition"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A15",
        "code": "TA-A15",
        "name": "Lighting & Sound Basics Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Tech Operator",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Technical Competence",
            "Innovation",
            "Teamwork",
            "Professionalism",
            "Leadership",
            "Lifelong Learning"
        ],
        "purpose": "This workshop introduces participants to the technical aspects of theatre production, including stage lighting, sound systems, cue management, and basic audiovisual operations.",
        "outcomes": [
            "Understand the fundamentals of theatre lighting and sound.",
            "Operate basic stage lighting and audio equipment.",
            "Coordinate technical cues during performances.",
            "Support live productions through technical management."
        ],
        "competencies": [
            "Lighting Operations",
            "Audio Management",
            "Technical Theatre",
            "Equipment Handling",
            "Coordination",
            "Problem Solving",
            "Time Management",
            "Team Collaboration"
        ],
        "syllabus": [
            "Introduction to Stage Lighting",
            "Types of Theatre Lights",
            "Sound Systems",
            "Microphones and Audio Mixing",
            "Cue Sheets",
            "Technical Rehearsals"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Theatre Arts Club Mentor"
    },
    {
        "id": "LCH-TA-A16",
        "code": "TA-A16",
        "name": "Theatre Film Screening & Discussion",
        "domain": "LCH",
        "level": "leader",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Theatre Critic",
        "sdgs": [
            4,
            10,
            11
        ],
        "ga": [
            "Critical Thinking",
            "Communication",
            "Creativity",
            "Lifelong Learning",
            "Ethical Awareness",
            "Global Perspective"
        ],
        "purpose": "The Theatre Film Screening & Discussion activity exposes participants to acclaimed stage productions, theatre adaptations, and performance-based films.",
        "outcomes": [
            "Analyze theatrical performances critically.",
            "Compare different acting and directing styles.",
            "Identify techniques used in professional theatre productions.",
            "Develop appreciation for diverse theatrical traditions and genres."
        ],
        "competencies": [
            "Critical Analysis",
            "Observation Skills",
            "Communication",
            "Creative Appreciation",
            "Analytical Thinking",
            "Story Interpretation",
            "Presentation Skills",
            "Collaborative Learning"
        ],
        "syllabus": [
            "Introduction to Theatre Cinema",
            "Theatre-to-Film Adaptations",
            "Acting Style Analysis",
            "Directing Techniques",
            "Stage vs Film Performance",
            "Visual Storytelling"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Theatre Arts Club Committee"
    },
    {
        "id": "LCH-TA-A17",
        "code": "TA-A17",
        "name": "Open Mic – Drama & Performance Evening",
        "domain": "LCH",
        "level": "leader",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Open Mic Artist",
        "sdgs": [
            4,
            5,
            10
        ],
        "ga": [
            "Communication",
            "Confidence",
            "Creativity",
            "Leadership",
            "Emotional Intelligence",
            "Lifelong Learning"
        ],
        "purpose": "The Open Mic – Drama & Performance Evening provides an inclusive platform for students to present monologues, skits, poetry performances, dramatic readings, and experimental theatre pieces.",
        "outcomes": [
            "Perform confidently before a live audience.",
            "Demonstrate creativity through original or adapted performances.",
            "Improve stage presence and audience engagement.",
            "Build confidence through continuous public performance."
        ],
        "competencies": [
            "Public Speaking",
            "Stage Confidence",
            "Creativity",
            "Communication",
            "Improvisation",
            "Emotional Expression",
            "Self-Confidence",
            "Performance Skills"
        ],
        "syllabus": [
            "Performance Preparation",
            "Monologues and Dramatic Readings",
            "Short Skits",
            "Improvised Performances",
            "Audience Interaction",
            "Stage Etiquette"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Theatre Arts Club Committee"
    },
    {
        "id": "LCH-TA-A18",
        "code": "TA-A18",
        "name": "Inter-College Drama Competition",
        "domain": "LCH",
        "level": "leader",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Drama Rep",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Leadership",
            "Collaboration",
            "Communication",
            "Professionalism",
            "Creativity",
            "Adaptability"
        ],
        "purpose": "The Inter-College Drama Competition enables students to represent the institution by performing theatrical productions against teams from other colleges.",
        "outcomes": [
            "Perform high-quality theatrical productions in competitive environments.",
            "Demonstrate teamwork during rehearsals and live performances.",
            "Apply professional stage discipline and production standards.",
            "Evaluate performances using competition criteria."
        ],
        "competencies": [
            "Competitive Performance",
            "Leadership",
            "Teamwork",
            "Professional Ethics",
            "Time Management",
            "Stage Discipline",
            "Communication",
            "Adaptability"
        ],
        "syllabus": [
            "Competition Guidelines",
            "Script Selection",
            "Advanced Rehearsals",
            "Team Coordination",
            "Technical Production",
            "Performance Management"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Theatre Arts Club Committee"
    },
    {
        "id": "LCH-TA-A19",
        "code": "TA-A19",
        "name": "Theatre Festival",
        "domain": "LCH",
        "level": "leader",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Festival Organizer",
        "sdgs": [
            4,
            11,
            17
        ],
        "ga": [
            "Leadership",
            "Innovation",
            "Professionalism",
            "Communication",
            "Collaboration",
            "Social Responsibility"
        ],
        "purpose": "The Theatre Festival is the flagship cultural event of the Theatre Arts Club, featuring multiple theatrical productions, workshops, guest artists, panel discussions, and student performances.",
        "outcomes": [
            "Organize and manage large-scale theatre events.",
            "Showcase advanced acting and production skills.",
            "Collaborate with artists, faculty, and external theatre professionals.",
            "Demonstrate event planning and cultural management capabilities."
        ],
        "competencies": [
            "Event Management",
            "Theatre Production",
            "Leadership",
            "Team Coordination",
            "Communication",
            "Problem Solving",
            "Creativity",
            "Cultural Management"
        ],
        "syllabus": [
            "Festival Planning",
            "Event Management",
            "Multiple Stage Productions",
            "Guest Theatre Workshops",
            "Panel Discussions",
            "Audience Engagement"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Theatre Arts Club Committee"
    },
    {
        "id": "LCH-TA-A20",
        "code": "TA-A20",
        "name": "Annual Stage Production & Awards",
        "domain": "LCH",
        "level": "leader",
        "pack": "Theatre Arts Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Theatre Laureate",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Leadership",
            "Professionalism",
            "Creativity",
            "Communication",
            "Collaboration",
            "Lifelong Learning"
        ],
        "purpose": "The Annual Stage Production & Awards serves as the culminating event of the Theatre Arts Club, where members present a professionally managed theatrical production followed by recognition of outstanding performers, directors, writers, technicians, and volunteers.",
        "outcomes": [
            "Execute a complete theatrical production from planning to performance.",
            "Demonstrate advanced acting, directing, and production competencies.",
            "Evaluate theatre projects using professional performance standards.",
            "Build a documented portfolio of theatrical achievements."
        ],
        "competencies": [
            "Theatre Production",
            "Acting Excellence",
            "Direction",
            "Leadership",
            "Project Management",
            "Teamwork",
            "Technical Theatre",
            "Professional Presentation"
        ],
        "syllabus": [
            "Production Planning",
            "Advanced Rehearsals",
            "Technical Integration",
            "Stage Management",
            "Costume and Makeup Coordination",
            "Live Performance Execution"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Theatre Arts Club Committee"
    },
    {
        "id": "LCH-AC-A01",
        "code": "AC-A01",
        "name": "Art Club Orientation & Creative Icebreakers",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Art Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Art Explorer",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Creative and Innovative Thinker",
            "Effective Communicator",
            "Collaborative Team Member",
            "Lifelong Learner",
            "Socially Responsible Citizen",
            "Cultural Appreciation",
            "Professional Ethics"
        ],
        "purpose": "The Art Club Orientation & Creative Icebreakers serves as the entry point for new members into the club ecosystem.",
        "outcomes": [
            "Understand the vision, structure, and opportunities offered by the Art Club.",
            "Identify different visual art disciplines and select areas of personal interest.",
            "Demonstrate basic creative thinking through collaborative art activities.",
            "Build confidence in presenting ideas and interacting with fellow artists."
        ],
        "competencies": [
            "Creative Thinking",
            "Artistic Observation",
            "Visual Communication",
            "Team Collaboration",
            "Self-Expression",
            "Confidence Building",
            "Networking Skills",
            "Appreciation of Art"
        ],
        "syllabus": [
            "Introduction to Art Club",
            "Club Vision, Activities and Programmes",
            "Overview of Visual Arts Disciplines",
            "Creativity Icebreaker Activities",
            "Team-based Drawing Challenges",
            "Art Appreciation and Observation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A02",
        "code": "AC-A02",
        "name": "Sketching & Drawing Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Art Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Sketch Artist",
        "sdgs": [
            4,
            9,
            11
        ],
        "ga": [
            "Analytical Thinker",
            "Creative Problem Solver",
            "Detail-Oriented Professional",
            "Lifelong Learner",
            "Effective Visual Communicator",
            "Self-Directed Learner"
        ],
        "purpose": "This workshop introduces students to the foundations of drawing by developing observation, proportion, perspective, and shading techniques.",
        "outcomes": [
            "Apply basic sketching techniques to create accurate drawings.",
            "Demonstrate understanding of perspective and proportions.",
            "Use shading techniques to create depth and realism.",
            "Improve visual observation and hand-eye coordination."
        ],
        "competencies": [
            "Sketching Skills",
            "Observation Skills",
            "Perspective Drawing",
            "Precision",
            "Patience",
            "Creativity",
            "Visual Analysis",
            "Manual Dexterity"
        ],
        "syllabus": [
            "Drawing Materials and Tools",
            "Basic Shapes and Forms",
            "Line Techniques",
            "Perspective Drawing",
            "Proportions",
            "Shading Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A03",
        "code": "AC-A03",
        "name": "Live Sketch Challenge",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Art Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Live Sketcher",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Creative Thinker",
            "Adaptive Learner",
            "Problem Solver",
            "Effective Performer",
            "Confident Professional",
            "Reflective Practitioner"
        ],
        "purpose": "The Live Sketch Challenge provides participants with real-time drawing experience by sketching live subjects, objects, or scenes within a fixed time.",
        "outcomes": [
            "Produce quick observational sketches within a time limit.",
            "Capture proportions and movement accurately.",
            "Apply composition techniques in live environments.",
            "Demonstrate confidence in spontaneous artistic expression."
        ],
        "competencies": [
            "Speed Sketching",
            "Observation",
            "Visual Memory",
            "Time Management",
            "Creativity",
            "Adaptability",
            "Confidence",
            "Artistic Interpretation"
        ],
        "syllabus": [
            "Gesture Drawing",
            "Rapid Observation",
            "Live Object Sketching",
            "Human Figure Basics",
            "Time Management in Art",
            "Composition Under Constraints"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A04",
        "code": "AC-A04",
        "name": "Pencil Shading Competition",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Art Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Shading Master",
        "sdgs": [
            4,
            9,
            11
        ],
        "ga": [
            "Detail-Oriented Professional",
            "Creative Thinker",
            "Quality Conscious Individual",
            "Self-Motivated Learner",
            "Professional Competitor",
            "Reflective Artist"
        ],
        "purpose": "The Pencil Shading Competition challenges participants to create realistic monochromatic artwork using advanced shading techniques.",
        "outcomes": [
            "Apply tonal variation to create realistic effects.",
            "Demonstrate mastery of shading techniques.",
            "Represent texture and depth effectively.",
            "Produce high-quality monochromatic artwork."
        ],
        "competencies": [
            "Tonal Rendering",
            "Precision Drawing",
            "Visual Analysis",
            "Patience",
            "Attention to Detail",
            "Artistic Accuracy",
            "Creativity",
            "Quality Control"
        ],
        "syllabus": [
            "Types of Pencils",
            "Tonal Values",
            "Light and Shadow",
            "Blending Techniques",
            "Texture Creation",
            "Realistic Rendering"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A05",
        "code": "AC-A05",
        "name": "Watercolour Painting Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Art Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Watercolour Artist",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Creative Innovator",
            "Artistic Communicator",
            "Lifelong Learner",
            "Self-Directed Professional",
            "Cultural Appreciation",
            "Ethical Practitioner"
        ],
        "purpose": "This workshop introduces students to the principles and techniques of watercolour painting.",
        "outcomes": [
            "Apply fundamental watercolour techniques effectively.",
            "Mix colours to achieve desired artistic effects.",
            "Create paintings using layering and wash techniques.",
            "Demonstrate understanding of composition and colour harmony."
        ],
        "competencies": [
            "Watercolour Techniques",
            "Colour Theory Application",
            "Brush Control",
            "Creative Expression",
            "Composition",
            "Patience",
            "Artistic Confidence",
            "Visual Storytelling"
        ],
        "syllabus": [
            "Watercolour Materials",
            "Colour Theory",
            "Colour Mixing",
            "Wet-on-Wet Technique",
            "Wet-on-Dry Technique",
            "Washes and Gradients"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A06",
        "code": "AC-A06",
        "name": "Acrylic Painting Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Art Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Acrylic Painter",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Creative Thinker",
            "Innovative Problem Solver",
            "Detail-Oriented Professional",
            "Lifelong Learner",
            "Effective Visual Communicator",
            "Self-Motivated Individual"
        ],
        "purpose": "The Acrylic Painting Workshop introduces participants to the versatility of acrylic paints and professional painting techniques.",
        "outcomes": [
            "Apply acrylic painting techniques to create original artworks.",
            "Demonstrate colour blending, layering, and texture creation.",
            "Use different painting tools effectively for varied artistic effects.",
            "Develop confidence in planning and executing canvas paintings."
        ],
        "competencies": [
            "Acrylic Painting Techniques",
            "Colour Application",
            "Texture Design",
            "Brush Control",
            "Creative Composition",
            "Artistic Planning",
            "Visual Communication",
            "Fine Motor Skills"
        ],
        "syllabus": [
            "Introduction to Acrylic Paints",
            "Painting Materials and Canvas Preparation",
            "Colour Theory and Mixing",
            "Brush Handling Techniques",
            "Layering Methods",
            "Texture Creation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A07",
        "code": "AC-A07",
        "name": "Canvas Painting Competition",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Art Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Canvas Artist",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Innovative Thinker",
            "Creative Professional",
            "Independent Learner",
            "Effective Communicator",
            "Ethical Competitor",
            "Lifelong Learner"
        ],
        "purpose": "The Canvas Painting Competition provides students with an opportunity to showcase artistic talent by creating original paintings based on assigned themes.",
        "outcomes": [
            "Create complete thematic paintings independently.",
            "Demonstrate originality and artistic creativity.",
            "Apply composition and colour principles effectively.",
            "Present professional-quality artwork for evaluation."
        ],
        "competencies": [
            "Creative Thinking",
            "Theme Interpretation",
            "Composition Skills",
            "Colour Management",
            "Artistic Confidence",
            "Decision Making",
            "Presentation Skills",
            "Professional Competition Readiness"
        ],
        "syllabus": [
            "Theme Interpretation",
            "Concept Development",
            "Composition Planning",
            "Colour Harmony",
            "Acrylic and Mixed Media Techniques",
            "Artistic Expression"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A08",
        "code": "AC-A08",
        "name": "Portrait Drawing Challenge",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Art Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Portrait Artist",
        "sdgs": [
            4,
            10,
            11
        ],
        "ga": [
            "Analytical Thinker",
            "Detail-Oriented Professional",
            "Creative Artist",
            "Self-Directed Learner",
            "Effective Visual Communicator",
            "Lifelong Learner"
        ],
        "purpose": "The Portrait Drawing Challenge develops students' ability to capture facial structure, proportions, expressions, and personality through detailed portraiture.",
        "outcomes": [
            "Draw accurate facial proportions and features.",
            "Apply shading techniques to create realistic portraits.",
            "Capture facial expressions and emotions.",
            "Produce aesthetically balanced portrait compositions."
        ],
        "competencies": [
            "Portrait Drawing",
            "Observation Skills",
            "Anatomy Understanding",
            "Shading Techniques",
            "Precision",
            "Visual Analysis",
            "Creativity",
            "Artistic Interpretation"
        ],
        "syllabus": [
            "Human Facial Anatomy",
            "Facial Proportions",
            "Eyes, Nose, Lips and Ears",
            "Hair Rendering",
            "Facial Expressions",
            "Light and Shadow"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A09",
        "code": "AC-A09",
        "name": "Landscape Painting Session",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Art Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Landscape Painter",
        "sdgs": [
            4,
            13,
            15
        ],
        "ga": [
            "Creative Innovator",
            "Environmentally Conscious Citizen",
            "Effective Communicator",
            "Lifelong Learner",
            "Self-Motivated Professional",
            "Visual Thinker"
        ],
        "purpose": "The Landscape Painting Session enables participants to depict natural and urban environments using perspective, colour harmony, atmospheric effects, and composition.",
        "outcomes": [
            "Paint realistic or expressive landscapes.",
            "Apply perspective to create depth.",
            "Use colour effectively to represent atmosphere and lighting.",
            "Demonstrate strong compositional planning."
        ],
        "competencies": [
            "Landscape Painting",
            "Perspective Drawing",
            "Colour Blending",
            "Observation",
            "Creative Visualization",
            "Composition",
            "Environmental Awareness",
            "Artistic Expression"
        ],
        "syllabus": [
            "Types of Landscapes",
            "Perspective in Nature",
            "Sky and Cloud Painting",
            "Water and Reflection Techniques",
            "Trees and Vegetation",
            "Mountains and Architecture"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A10",
        "code": "AC-A10",
        "name": "Still Life Drawing Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Art Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Still Life Artist",
        "sdgs": [
            4,
            9,
            12
        ],
        "ga": [
            "Detail-Oriented Professional",
            "Critical Observer",
            "Creative Thinker",
            "Independent Learner",
            "Effective Visual Communicator",
            "Lifelong Learner"
        ],
        "purpose": "The Still Life Drawing Workshop teaches students to observe and accurately render everyday objects by studying form, proportion, lighting, texture, and composition.",
        "outcomes": [
            "Draw objects with correct proportions and perspective.",
            "Apply light and shadow to create three-dimensional effects.",
            "Represent textures realistically.",
            "Develop observational accuracy through structured practice."
        ],
        "competencies": [
            "Observational Drawing",
            "Perspective",
            "Tonal Rendering",
            "Texture Illustration",
            "Precision",
            "Visual Analysis",
            "Patience",
            "Composition Skills"
        ],
        "syllabus": [
            "Principles of Still Life",
            "Object Arrangement",
            "Proportion and Scale",
            "Perspective",
            "Light Source Analysis",
            "Shading Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A11",
        "code": "AC-A11",
        "name": "Charcoal Art Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Art Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Charcoal Artist",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Creative Thinker",
            "Detail-Oriented Professional",
            "Effective Visual Communicator",
            "Lifelong Learner",
            "Innovative Artist",
            "Self-Motivated Individual"
        ],
        "purpose": "The Charcoal Art Workshop introduces participants to monochromatic drawing using charcoal as a professional artistic medium.",
        "outcomes": [
            "Apply charcoal drawing techniques effectively.",
            "Create realistic tonal values and textures.",
            "Demonstrate control over blending and contrast.",
            "Produce expressive monochromatic artworks."
        ],
        "competencies": [
            "Charcoal Rendering",
            "Tonal Control",
            "Texture Creation",
            "Observation Skills",
            "Creative Expression",
            "Visual Communication",
            "Precision",
            "Artistic Confidence"
        ],
        "syllabus": [
            "Introduction to Charcoal Medium",
            "Types of Charcoal",
            "Tonal Values",
            "Blending Techniques",
            "Texture Rendering",
            "Light and Shadow"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A12",
        "code": "AC-A12",
        "name": "Ink Illustration Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Art Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Ink Illustrator",
        "sdgs": [
            4,
            9,
            11
        ],
        "ga": [
            "Creative Innovator",
            "Effective Communicator",
            "Detail-Oriented Professional",
            "Independent Learner",
            "Lifelong Learner",
            "Ethical Practitioner"
        ],
        "purpose": "The Ink Illustration Workshop introduces students to traditional ink-based illustration techniques using pens, brushes, and markers.",
        "outcomes": [
            "Create illustrations using professional ink techniques.",
            "Apply line variation and texture effectively.",
            "Demonstrate composition and visual storytelling.",
            "Produce high-quality ink illustrations independently."
        ],
        "competencies": [
            "Ink Illustration",
            "Precision Drawing",
            "Texture Development",
            "Visual Storytelling",
            "Composition",
            "Creativity",
            "Fine Motor Skills",
            "Artistic Presentation"
        ],
        "syllabus": [
            "Introduction to Ink Art",
            "Illustration Tools",
            "Line Quality",
            "Hatching and Cross-Hatching",
            "Stippling Techniques",
            "Brush Pen Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A13",
        "code": "AC-A13",
        "name": "Mandala Art Workshop",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Art Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Mandala Artist",
        "sdgs": [
            3,
            4,
            11
        ],
        "ga": [
            "Creative Thinker",
            "Self-Directed Learner",
            "Detail-Oriented Professional",
            "Lifelong Learner",
            "Emotionally Balanced Individual",
            "Ethical Practitioner"
        ],
        "purpose": "The Mandala Art Workshop teaches students the principles of geometric symmetry, repetitive patterns, and mindful artistic creation.",
        "outcomes": [
            "Design balanced and symmetrical mandala artworks.",
            "Apply repetitive patterns creatively.",
            "Improve concentration and artistic precision.",
            "Demonstrate mindfulness through structured artistic practice."
        ],
        "competencies": [
            "Pattern Design",
            "Symmetry",
            "Precision",
            "Creative Thinking",
            "Concentration",
            "Patience",
            "Fine Motor Skills",
            "Artistic Expression"
        ],
        "syllabus": [
            "History of Mandala Art",
            "Geometric Shapes",
            "Radial Symmetry",
            "Pattern Development",
            "Decorative Motifs",
            "Colour Applications"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A14",
        "code": "AC-A14",
        "name": "Doodle & Zentangle Competition",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Art Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Doodler",
        "sdgs": [
            3,
            4,
            11
        ],
        "ga": [
            "Innovative Thinker",
            "Creative Professional",
            "Independent Learner",
            "Lifelong Learner",
            "Effective Visual Communicator",
            "Self-Motivated Individual"
        ],
        "purpose": "The Doodle & Zentangle Competition encourages participants to explore structured and free-form pattern creation through imaginative doodles and Zentangle techniques.",
        "outcomes": [
            "Create original doodle and Zentangle artworks.",
            "Apply repetitive patterns with balance and precision.",
            "Demonstrate creative visualization skills.",
            "Present aesthetically appealing compositions."
        ],
        "competencies": [
            "Pattern Design",
            "Creativity",
            "Visual Composition",
            "Concentration",
            "Artistic Confidence",
            "Fine Motor Skills",
            "Imagination",
            "Time Management"
        ],
        "syllabus": [
            "Introduction to Doodling",
            "Zentangle Method",
            "Pattern Libraries",
            "Line Variations",
            "Shape Composition",
            "Decorative Fill Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A15",
        "code": "AC-A15",
        "name": "Poster Making Competition",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Art Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Poster Designer",
        "sdgs": [
            4,
            13,
            16
        ],
        "ga": [
            "Effective Communicator",
            "Creative Innovator",
            "Socially Responsible Citizen",
            "Independent Learner",
            "Problem Solver",
            "Lifelong Learner"
        ],
        "purpose": "The Poster Making Competition develops participants' ability to communicate ideas visually through impactful poster designs.",
        "outcomes": [
            "Design visually effective posters for communication.",
            "Apply principles of typography and layout.",
            "Integrate illustrations with meaningful messages.",
            "Produce creative awareness-oriented visual content."
        ],
        "competencies": [
            "Visual Communication",
            "Graphic Design Fundamentals",
            "Creativity",
            "Typography",
            "Layout Design",
            "Message Development",
            "Presentation Skills",
            "Critical Thinking"
        ],
        "syllabus": [
            "Principles of Poster Design",
            "Typography Basics",
            "Colour Psychology",
            "Layout and Composition",
            "Visual Hierarchy",
            "Theme Interpretation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Mentor"
    },
    {
        "id": "LCH-AC-A16",
        "code": "AC-A16",
        "name": "Mural Painting Project",
        "domain": "LCH",
        "level": "leader",
        "pack": "Art Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Muralist",
        "sdgs": [
            4,
            11,
            17
        ],
        "ga": [
            "Creative Innovator",
            "Collaborative Team Member",
            "Responsible Citizen",
            "Effective Communicator",
            "Leadership",
            "Lifelong Learner"
        ],
        "purpose": "The Mural Painting Project engages students in designing and executing large-scale collaborative artworks on campus walls and public spaces.",
        "outcomes": [
            "Design and execute collaborative mural artworks.",
            "Apply large-scale painting techniques effectively.",
            "Demonstrate teamwork and project management skills.",
            "Communicate meaningful messages through public art."
        ],
        "competencies": [
            "Mural Design",
            "Large-Scale Painting",
            "Team Collaboration",
            "Project Planning",
            "Leadership",
            "Visual Storytelling",
            "Creativity",
            "Community Engagement"
        ],
        "syllabus": [
            "Introduction to Public Art",
            "Theme Selection and Research",
            "Mural Design and Scaling",
            "Grid Transfer Technique",
            "Surface Preparation",
            "Large-Scale Painting Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Art Club Committee"
    },
    {
        "id": "LCH-AC-A17",
        "code": "AC-A17",
        "name": "Calligraphy Workshop",
        "domain": "LCH",
        "level": "leader",
        "pack": "Art Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Calligrapher",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Creative Thinker",
            "Detail-Oriented Professional",
            "Effective Communicator",
            "Self-Directed Learner",
            "Lifelong Learner",
            "Ethical Practitioner"
        ],
        "purpose": "The Calligraphy Workshop introduces participants to the art of decorative handwriting using traditional and modern calligraphy tools.",
        "outcomes": [
            "Demonstrate proper calligraphy techniques.",
            "Apply lettering styles with consistency and precision.",
            "Design aesthetically pleasing calligraphic compositions.",
            "Produce creative handwritten artworks."
        ],
        "competencies": [
            "Calligraphy",
            "Typography",
            "Fine Motor Skills",
            "Precision",
            "Patience",
            "Artistic Presentation",
            "Creativity",
            "Visual Design"
        ],
        "syllabus": [
            "Introduction to Calligraphy",
            "Writing Instruments",
            "Basic Pen Strokes",
            "Letter Formation",
            "Script Styles",
            "Spacing and Alignment"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Committee"
    },
    {
        "id": "LCH-AC-A18",
        "code": "AC-A18",
        "name": "Creative Bookmark & Greeting Card Design",
        "domain": "LCH",
        "level": "leader",
        "pack": "Art Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Product Designer",
        "sdgs": [
            4,
            8,
            12
        ],
        "ga": [
            "Innovative Thinker",
            "Creative Professional",
            "Effective Communicator",
            "Entrepreneurial Mindset",
            "Lifelong Learner",
            "Responsible Citizen"
        ],
        "purpose": "This activity encourages participants to create personalized bookmarks and greeting cards by combining illustration, lettering, decorative art, and creative design principles.",
        "outcomes": [
            "Design creative bookmarks and greeting cards.",
            "Apply principles of colour, typography, and composition.",
            "Produce handcrafted artistic products.",
            "Demonstrate creativity in personalized design."
        ],
        "competencies": [
            "Creative Design",
            "Illustration",
            "Typography",
            "Product Development",
            "Craftsmanship",
            "Creativity",
            "Presentation Skills",
            "Entrepreneurial Thinking"
        ],
        "syllabus": [
            "Principles of Product Design",
            "Greeting Card Layouts",
            "Bookmark Design",
            "Decorative Illustration",
            "Colour Harmony",
            "Typography"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Art Club Committee"
    },
    {
        "id": "LCH-AC-A19",
        "code": "AC-A19",
        "name": "Campus Art Exhibition",
        "domain": "LCH",
        "level": "leader",
        "pack": "Art Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Art Curator",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Effective Communicator",
            "Creative Innovator",
            "Professional Leader",
            "Lifelong Learner",
            "Collaborative Team Member",
            "Ethical Practitioner"
        ],
        "purpose": "The Campus Art Exhibition provides students with a professional platform to display their artworks, receive constructive feedback, engage with audiences, and experience gallery-style exhibition management.",
        "outcomes": [
            "Curate and present artworks professionally.",
            "Communicate artistic concepts to diverse audiences.",
            "Evaluate artworks through constructive critique.",
            "Demonstrate professionalism in exhibition management."
        ],
        "competencies": [
            "Portfolio Presentation",
            "Exhibition Management",
            "Public Communication",
            "Professional Networking",
            "Creativity",
            "Critical Reflection",
            "Event Coordination",
            "Confidence Building"
        ],
        "syllabus": [
            "Exhibition Planning",
            "Artwork Selection",
            "Portfolio Presentation",
            "Display Techniques",
            "Gallery Etiquette",
            "Visitor Interaction"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 300,
        "faculty": "Art Club Committee"
    },
    {
        "id": "LCH-AC-A20",
        "code": "AC-A20",
        "name": "Annual Art Festival & Awards",
        "domain": "LCH",
        "level": "leader",
        "pack": "Art Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Arts Laureate",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Leadership",
            "Creative Thinker",
            "Effective Communicator",
            "Collaborative Professional",
            "Entrepreneurial Mindset",
            "Lifelong Learner"
        ],
        "purpose": "The Annual Art Festival & Awards is the flagship event of the Art Club, celebrating creativity through exhibitions, live demonstrations, competitions, workshops, artist interactions, and award ceremonies.",
        "outcomes": [
            "Showcase artistic achievements in a professional environment.",
            "Participate in interdisciplinary creative events.",
            "Demonstrate leadership in organizing large-scale art festivals.",
            "Build professional networks within the creative community."
        ],
        "competencies": [
            "Event Management",
            "Leadership",
            "Teamwork",
            "Public Relations",
            "Professional Networking",
            "Creativity",
            "Organizational Skills",
            "Cultural Promotion"
        ],
        "syllabus": [
            "Festival Planning",
            "Event Management",
            "Art Competitions",
            "Live Demonstrations",
            "Guest Artist Sessions",
            "Exhibition Coordination"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Art Club Committee"
    },
    {
        "id": "LCH-MC-A01",
        "code": "MC-A01",
        "name": "Music Club Orientation & Jam Session",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Music Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Music Explorer",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Communication Skills",
            "Teamwork",
            "Creativity and Innovation",
            "Cultural Awareness",
            "Self-confidence"
        ],
        "purpose": "An introductory musical gathering designed to welcome members, introduce club activities, identify musical interests, and encourage collaboration through informal group performances and jam sessions.",
        "outcomes": [
            "Understand the objectives and functioning of the Music Club.",
            "Identify their musical interests and areas for skill development.",
            "Collaborate with fellow musicians through group performances.",
            "Develop confidence in informal musical expression.",
            "Participate effectively in ensemble activities."
        ],
        "competencies": [
            "Musical awareness",
            "Team collaboration",
            "Communication",
            "Creativity",
            "Performance confidence"
        ],
        "syllabus": [
            "Introduction to Music Club structure",
            "Overview of musical genres",
            "Member introductions and talent identification",
            "Basic ensemble coordination",
            "Jam session practices",
            "Music collaboration methods"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A02",
        "code": "MC-A02",
        "name": "Open Mic – Singing & Instrumental Performance",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Music Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Open Mic Artist",
        "sdgs": [
            3,
            4,
            10
        ],
        "ga": [
            "Confidence",
            "Communication Skills",
            "Creativity",
            "Professionalism",
            "Lifelong Learning"
        ],
        "purpose": "A performance platform that allows students to showcase their singing and instrumental abilities while developing confidence, creativity, and stage presence.",
        "outcomes": [
            "Perform confidently before an audience.",
            "Apply vocal and instrumental techniques.",
            "Improve stage presentation skills.",
            "Receive and provide constructive performance feedback.",
            "Explore individual musical expression."
        ],
        "competencies": [
            "Public performance",
            "Musical expression",
            "Stage confidence",
            "Self-evaluation",
            "Communication"
        ],
        "syllabus": [
            "Song selection",
            "Performance preparation",
            "Vocal/instrumental practice",
            "Microphone handling",
            "Stage presentation",
            "Audience interaction"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A03",
        "code": "MC-A03",
        "name": "Karaoke Night",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Music Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Karaoke Star",
        "sdgs": [
            3,
            4,
            11
        ],
        "ga": [
            "Confidence",
            "Cultural Appreciation",
            "Communication",
            "Emotional Intelligence",
            "Team Spirit"
        ],
        "purpose": "A recreational and interactive musical activity where participants perform popular songs in a supportive environment to enhance confidence, enjoyment, and vocal expression.",
        "outcomes": [
            "Develop basic singing confidence.",
            "Improve rhythm and pitch awareness.",
            "Express themselves through music.",
            "Engage positively with audiences.",
            "Appreciate different musical styles."
        ],
        "competencies": [
            "Vocal confidence",
            "Rhythm awareness",
            "Self-expression",
            "Social interaction",
            "Creativity"
        ],
        "syllabus": [
            "Song selection techniques",
            "Rhythm and timing",
            "Basic vocal expression",
            "Karaoke performance methods",
            "Audience engagement",
            "Music appreciation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A04",
        "code": "MC-A04",
        "name": "Vocal Training Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Music Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Vocalist",
        "sdgs": [
            3,
            4,
            8
        ],
        "ga": [
            "Professional Competence",
            "Self-management",
            "Creativity",
            "Communication Skills",
            "Continuous Learning"
        ],
        "purpose": "A skill-development workshop focused on improving vocal techniques, singing ability, breathing control, and musical expression through guided practice.",
        "outcomes": [
            "Apply proper breathing and voice techniques.",
            "Improve pitch accuracy and vocal control.",
            "Understand vocal health practices.",
            "Perform songs using appropriate expression.",
            "Develop personal singing styles."
        ],
        "competencies": [
            "Vocal technique",
            "Musical expression",
            "Listening skills",
            "Discipline",
            "Performance ability"
        ],
        "syllabus": [
            "Vocal warm-up exercises",
            "Breathing techniques",
            "Pitch and scale practice",
            "Voice modulation",
            "Rhythm and timing",
            "Vocal health and maintenance"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A05",
        "code": "MC-A05",
        "name": "Guitar Workshop",
        "domain": "LCH",
        "level": "explorer",
        "pack": "Music Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Guitarist",
        "sdgs": [
            3,
            4,
            8
        ],
        "ga": [
            "Technical Competence",
            "Creativity",
            "Problem Solving",
            "Collaboration",
            "Lifelong Learning"
        ],
        "purpose": "A practical workshop designed to introduce guitar playing techniques, musical concepts, and performance skills for beginners and intermediate learners.",
        "outcomes": [
            "Understand basic guitar techniques.",
            "Play fundamental chords and melodies.",
            "Apply rhythm patterns in songs.",
            "Perform simple guitar pieces.",
            "Collaborate with other musicians."
        ],
        "competencies": [
            "Instrumental proficiency",
            "Coordination",
            "Rhythm skills",
            "Musical creativity",
            "Practice discipline"
        ],
        "syllabus": [
            "Introduction to guitar anatomy",
            "Guitar tuning",
            "Basic chords",
            "Strumming patterns",
            "Finger exercises",
            "Song accompaniment"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A06",
        "code": "MC-A06",
        "name": "Keyboard & Piano Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Music Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Pianist",
        "sdgs": [
            3,
            4,
            8
        ],
        "ga": [
            "Technical Competence",
            "Creativity and Innovation",
            "Self-learning Ability",
            "Communication Skills",
            "Professional Development"
        ],
        "purpose": "A practical music workshop focused on developing keyboard and piano playing skills, including musical fundamentals, accompaniment techniques, and performance abilities.",
        "outcomes": [
            "Understand keyboard and piano fundamentals.",
            "Identify musical notes, scales, and chords.",
            "Perform basic melodies and accompaniments.",
            "Apply rhythm and harmony concepts.",
            "Develop confidence in keyboard performance."
        ],
        "competencies": [
            "Keyboard proficiency",
            "Music theory application",
            "Coordination",
            "Creativity",
            "Performance skills"
        ],
        "syllabus": [
            "Introduction to keyboard layout",
            "Notes and scales",
            "Basic chords and progressions",
            "Finger positioning techniques",
            "Melody practice",
            "Accompaniment patterns"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A07",
        "code": "MC-A07",
        "name": "Drums & Percussion Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Music Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Percussionist",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Problem Solving",
            "Teamwork",
            "Discipline",
            "Creativity",
            "Adaptability"
        ],
        "purpose": "A rhythm-based workshop designed to develop percussion skills, timing accuracy, coordination, and ensemble performance abilities.",
        "outcomes": [
            "Understand basic rhythm structures.",
            "Develop hand and foot coordination.",
            "Perform fundamental drum patterns.",
            "Maintain tempo during group performances.",
            "Apply percussion techniques in musical arrangements."
        ],
        "competencies": [
            "Rhythm management",
            "Coordination",
            "Discipline",
            "Team performance",
            "Musical timing"
        ],
        "syllabus": [
            "Introduction to drum kit and percussion instruments",
            "Basic rhythm patterns",
            "Beat counting",
            "Tempo control",
            "Drum fills",
            "Coordination exercises"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A08",
        "code": "MC-A08",
        "name": "Indian Classical Music Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Music Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Classical Musician",
        "sdgs": [
            4,
            11,
            16
        ],
        "ga": [
            "Cultural Awareness",
            "Creativity",
            "Ethical Responsibility",
            "Lifelong Learning",
            "Communication"
        ],
        "purpose": "A cultural and skill-based workshop introducing participants to Indian classical music traditions, vocal techniques, rhythm systems, and musical expression.",
        "outcomes": [
            "Understand fundamentals of Indian classical music.",
            "Practice basic ragas and rhythmic patterns.",
            "Develop voice control and musical discipline.",
            "Appreciate Indian musical heritage.",
            "Perform classical compositions."
        ],
        "competencies": [
            "Classical music knowledge",
            "Vocal discipline",
            "Cultural appreciation",
            "Musical creativity",
            "Listening ability"
        ],
        "syllabus": [
            "Introduction to Indian classical music",
            "Raga concepts",
            "Tala and rhythm structures",
            "Voice culture",
            "Classical compositions",
            "Improvisation techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A09",
        "code": "MC-A09",
        "name": "Western Music Workshop",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Music Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Western Musician",
        "sdgs": [
            4,
            10,
            17
        ],
        "ga": [
            "Global Perspective",
            "Innovation",
            "Communication",
            "Cultural Competence",
            "Lifelong Learning"
        ],
        "purpose": "A music learning workshop introducing Western music concepts, performance styles, harmony, and contemporary musical practices.",
        "outcomes": [
            "Understand Western music fundamentals.",
            "Apply scales, chords, and harmony concepts.",
            "Perform Western songs confidently.",
            "Analyze different musical styles.",
            "Collaborate in Western music ensembles."
        ],
        "competencies": [
            "Music analysis",
            "Instrumental/vocal skills",
            "Creative thinking",
            "Ensemble collaboration",
            "Musical literacy"
        ],
        "syllabus": [
            "Western music history",
            "Musical notation",
            "Scales and chords",
            "Harmony concepts",
            "Popular music styles",
            "Band arrangement"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A10",
        "code": "MC-A10",
        "name": "Band Jam Session",
        "domain": "LCH",
        "level": "foundation",
        "pack": "Music Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Jam Master",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Leadership",
            "Teamwork",
            "Creativity",
            "Communication Skills",
            "Professionalism"
        ],
        "purpose": "A collaborative musical activity where students form groups and perform together to develop teamwork, improvisation, and live performance skills.",
        "outcomes": [
            "Work effectively in a musical team.",
            "Coordinate with different instruments and vocals.",
            "Apply improvisation techniques.",
            "Develop live performance confidence.",
            "Create collaborative musical arrangements."
        ],
        "competencies": [
            "Team collaboration",
            "Leadership",
            "Musical arrangement",
            "Problem solving",
            "Performance management"
        ],
        "syllabus": [
            "Band formation",
            "Role distribution",
            "Song arrangement",
            "Instrument coordination",
            "Improvisation techniques",
            "Rehearsal planning"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A11",
        "code": "MC-A11",
        "name": "Songwriting Challenge",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Music Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Songwriter",
        "sdgs": [
            4,
            8,
            11
        ],
        "ga": [
            "Innovation",
            "Communication Skills",
            "Creativity",
            "Independent Learning",
            "Problem Solving"
        ],
        "purpose": "A creative competition that encourages participants to develop original songs by combining lyrics, melodies, musical ideas, and personal expression.",
        "outcomes": [
            "Create original song concepts.",
            "Develop meaningful lyrics and melodies.",
            "Apply basic composition techniques.",
            "Express ideas through musical storytelling.",
            "Present original compositions confidently."
        ],
        "competencies": [
            "Creativity",
            "Composition skills",
            "Storytelling",
            "Critical thinking",
            "Artistic expression"
        ],
        "syllabus": [
            "Songwriting fundamentals",
            "Lyric writing techniques",
            "Melody creation",
            "Song structure",
            "Chord progression basics",
            "Creative inspiration methods"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A12",
        "code": "MC-A12",
        "name": "Battle of the Bands",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Music Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Band Performer",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Leadership",
            "Teamwork",
            "Professionalism",
            "Communication",
            "Innovation"
        ],
        "purpose": "A competitive live music event where student bands showcase their musical talent, teamwork, creativity, and stage performance abilities.",
        "outcomes": [
            "Perform effectively as a musical group.",
            "Develop professional stage presence.",
            "Coordinate musical arrangements.",
            "Manage live performance challenges.",
            "Evaluate and appreciate different musical styles."
        ],
        "competencies": [
            "Team leadership",
            "Ensemble performance",
            "Stage management",
            "Collaboration",
            "Creative problem solving"
        ],
        "syllabus": [
            "Band formation and preparation",
            "Song arrangement",
            "Rehearsal strategies",
            "Stage management",
            "Sound setup",
            "Live performance techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A13",
        "code": "MC-A13",
        "name": "Solo Singing Competition",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Music Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Soloist",
        "sdgs": [
            3,
            4,
            8
        ],
        "ga": [
            "Confidence",
            "Communication Skills",
            "Excellence",
            "Emotional Intelligence",
            "Lifelong Learning"
        ],
        "purpose": "A competitive platform that allows singers to demonstrate vocal ability, musical interpretation, confidence, and individual performance skills.",
        "outcomes": [
            "Demonstrate vocal performance techniques.",
            "Improve pitch, rhythm, and expression.",
            "Develop confidence in solo performance.",
            "Interpret songs creatively.",
            "Accept and apply performance feedback."
        ],
        "competencies": [
            "Vocal ability",
            "Self-confidence",
            "Performance management",
            "Creativity",
            "Self-evaluation"
        ],
        "syllabus": [
            "Vocal preparation",
            "Song interpretation",
            "Pitch and rhythm control",
            "Expression techniques",
            "Stage presentation",
            "Competition guidelines"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A14",
        "code": "MC-A14",
        "name": "Instrumental Performance Competition",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Music Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Instrumentalist",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Technical Competence",
            "Innovation",
            "Discipline",
            "Confidence",
            "Continuous Improvement"
        ],
        "purpose": "A competitive event where students demonstrate instrumental skills, creativity, technical ability, and musical interpretation.",
        "outcomes": [
            "Demonstrate instrumental proficiency.",
            "Perform technical and creative compositions.",
            "Apply musical interpretation techniques.",
            "Develop stage confidence.",
            "Analyze and improve performance quality."
        ],
        "competencies": [
            "Instrumental mastery",
            "Concentration",
            "Creativity",
            "Performance skills",
            "Critical evaluation"
        ],
        "syllabus": [
            "Instrument selection",
            "Technical practice methods",
            "Performance preparation",
            "Musical interpretation",
            "Solo instrumental techniques",
            "Stage presentation"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A15",
        "code": "MC-A15",
        "name": "Music Appreciation & Listening Session",
        "domain": "LCH",
        "level": "practitioner",
        "pack": "Music Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Music Analyst",
        "sdgs": [
            4,
            10,
            11
        ],
        "ga": [
            "Global Awareness",
            "Cultural Sensitivity",
            "Critical Thinking",
            "Communication",
            "Lifelong Learning"
        ],
        "purpose": "An interactive learning activity that develops musical understanding through guided listening, discussion, analysis, and appreciation of diverse musical traditions.",
        "outcomes": [
            "Identify different musical styles and elements.",
            "Analyze musical structures and compositions.",
            "Appreciate cultural diversity in music.",
            "Develop critical listening skills.",
            "Discuss musical ideas effectively."
        ],
        "competencies": [
            "Critical listening",
            "Music analysis",
            "Cultural awareness",
            "Communication",
            "Appreciation skills"
        ],
        "syllabus": [
            "Introduction to music genres",
            "Music history",
            "Listening analysis",
            "Instrument identification",
            "Musical interpretation",
            "Cultural influences in music"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Mentor"
    },
    {
        "id": "LCH-MC-A16",
        "code": "MC-A16",
        "name": "Live Concert Experience / Guest Artist Session",
        "domain": "LCH",
        "level": "leader",
        "pack": "Music Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Concert Organizer",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Professionalism",
            "Lifelong Learning",
            "Communication Skills",
            "Global Perspective",
            "Adaptability"
        ],
        "purpose": "An experiential learning activity where students interact with professional musicians, observe live performances, and gain insights into music careers, performance practices, and industry expectations.",
        "outcomes": [
            "Understand professional music performance practices.",
            "Learn from experienced musicians and artists.",
            "Analyze live performance techniques.",
            "Develop awareness of music industry opportunities.",
            "Apply professional practices in their own performances."
        ],
        "competencies": [
            "Professional awareness",
            "Communication",
            "Performance analysis",
            "Networking",
            "Career planning"
        ],
        "syllabus": [
            "Interaction with guest musicians",
            "Live performance observation",
            "Artist journey and career insights",
            "Stage performance techniques",
            "Music industry overview",
            "Audience engagement methods"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 200,
        "faculty": "Music Club Committee"
    },
    {
        "id": "LCH-MC-A17",
        "code": "MC-A17",
        "name": "Recording Studio Experience",
        "domain": "LCH",
        "level": "leader",
        "pack": "Music Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Music Producer",
        "sdgs": [
            4,
            8,
            9
        ],
        "ga": [
            "Technical Competence",
            "Innovation",
            "Digital Literacy",
            "Problem Solving",
            "Professional Skills"
        ],
        "purpose": "A practical exposure activity that introduces students to professional audio recording environments, music production processes, and studio-based workflows.",
        "outcomes": [
            "Understand the basics of studio recording.",
            "Learn microphone and recording techniques.",
            "Experience digital audio production workflows.",
            "Understand the role of producers and sound engineers.",
            "Prepare music for professional presentation."
        ],
        "competencies": [
            "Audio awareness",
            "Technical skills",
            "Digital literacy",
            "Recording practices",
            "Creative production"
        ],
        "syllabus": [
            "Recording studio setup",
            "Microphone techniques",
            "Audio recording process",
            "Digital Audio Workstation (DAW) introduction",
            "Track arrangement",
            "Basic editing concepts"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Committee"
    },
    {
        "id": "LCH-MC-A18",
        "code": "MC-A18",
        "name": "Inter-College Music Competition",
        "domain": "LCH",
        "level": "leader",
        "pack": "Music Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Music Rep",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Leadership",
            "Excellence",
            "Collaboration",
            "Confidence",
            "Professionalism"
        ],
        "purpose": "A competitive musical event that provides students with opportunities to represent their institution, collaborate with peers, and demonstrate excellence in music performance.",
        "outcomes": [
            "Perform competitively at external platforms.",
            "Develop professional-level preparation skills.",
            "Work effectively under performance pressure.",
            "Demonstrate creativity and musical excellence.",
            "Represent institutional talent confidently."
        ],
        "competencies": [
            "Competitive skills",
            "Teamwork",
            "Performance excellence",
            "Leadership",
            "Time management"
        ],
        "syllabus": [
            "Competition preparation",
            "Performance selection",
            "Rehearsal management",
            "Team coordination",
            "Stage performance",
            "Judging criteria"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Music Club Committee"
    },
    {
        "id": "LCH-MC-A19",
        "code": "MC-A19",
        "name": "Campus Music Festival",
        "domain": "LCH",
        "level": "leader",
        "pack": "Music Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Festival Leader",
        "sdgs": [
            4,
            11,
            17
        ],
        "ga": [
            "Leadership",
            "Social Responsibility",
            "Innovation",
            "Teamwork",
            "Entrepreneurship"
        ],
        "purpose": "A large-scale musical celebration that brings together students through concerts, performances, competitions, and cultural activities to promote creativity and community engagement.",
        "outcomes": [
            "Organize and participate in musical events.",
            "Develop event management skills.",
            "Perform for diverse audiences.",
            "Collaborate across different teams.",
            "Promote cultural and creative expression."
        ],
        "competencies": [
            "Event management",
            "Leadership",
            "Team coordination",
            "Creativity",
            "Communication"
        ],
        "syllabus": [
            "Music festival planning",
            "Event coordination",
            "Artist management",
            "Stage production",
            "Audience engagement",
            "Promotion and publicity"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Music Club Committee"
    },
    {
        "id": "LCH-MC-A20",
        "code": "MC-A20",
        "name": "Annual Music Concert & Awards",
        "domain": "LCH",
        "level": "leader",
        "pack": "Music Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Music Laureate",
        "sdgs": [
            4,
            8,
            17
        ],
        "ga": [
            "Leadership",
            "Creativity",
            "Professionalism",
            "Excellence",
            "Collaboration"
        ],
        "purpose": "The flagship annual event of the Music Club celebrating musical achievements through performances, recognition of talents, and showcasing student creativity.",
        "outcomes": [
            "Demonstrate advanced performance skills.",
            "Apply concert preparation techniques.",
            "Showcase musical achievements.",
            "Develop professional stage confidence.",
            "Recognize and appreciate musical excellence."
        ],
        "competencies": [
            "Performance management",
            "Leadership",
            "Event organization",
            "Communication",
            "Professional presentation"
        ],
        "syllabus": [
            "Concert planning",
            "Performance scheduling",
            "Stage design",
            "Sound management",
            "Artist coordination",
            "Award selection process"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Music Club Committee"
    },
    {
        "id": "HWB-SL-A01",
        "code": "SL-A01",
        "name": "SafeLife Club Orientation & Safety Awareness",
        "domain": "HWB",
        "level": "explorer",
        "pack": "SafeLife Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Safety Explorer",
        "sdgs": [
            3,
            4,
            11
        ],
        "ga": [
            "Social responsibility",
            "Communication ability",
            "Ethical awareness",
            "Leadership potential",
            "Lifelong learning attitude"
        ],
        "purpose": "SafeLife Club Orientation & Safety Awareness is an introductory activity designed to familiarize students with the purpose, objectives, structure, and activities of the SafeLife Club.",
        "outcomes": [
            "Understand the vision, mission, and objectives of SafeLife Club.",
            "Recognize the importance of safety awareness in academic and community environments.",
            "Identify common hazards and risks in daily life and campus settings.",
            "Understand basic emergency preparedness principles.",
            "Develop awareness of personal responsibility towards public safety."
        ],
        "competencies": [
            "Safety awareness skills",
            "Risk identification skills",
            "Communication skills",
            "Team participation skills",
            "Social responsibility skills"
        ],
        "syllabus": [
            "Club objectives and structure",
            "Role of students in safety promotion",
            "Overview of club activities and programmes",
            "Importance of prevention and preparedness",
            "Safety behaviour and responsibility",
            "Building a safety-conscious campus"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "SafeLife Club Mentor"
    },
    {
        "id": "HWB-SL-A02",
        "code": "SL-A02",
        "name": "Basic First Aid Workshop",
        "domain": "HWB",
        "level": "explorer",
        "pack": "SafeLife Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "First Aider",
        "sdgs": [
            3,
            4,
            16
        ],
        "ga": [
            "Problem-solving ability",
            "Professional responsibility",
            "Confidence and leadership",
            "Community engagement",
            "Practical competence"
        ],
        "purpose": "The Basic First Aid Workshop provides students with essential knowledge and practical skills required to respond effectively during common medical emergencies.",
        "outcomes": [
            "Explain basic first aid principles.",
            "Perform initial assessment of emergency situations.",
            "Apply first aid techniques for common injuries.",
            "Demonstrate safe handling of injured individuals.",
            "Understand when and how to seek professional medical help."
        ],
        "competencies": [
            "First aid application skills",
            "Emergency assessment skills",
            "Patient support skills",
            "Decision-making skills",
            "Crisis response skills"
        ],
        "syllabus": [
            "Definition and importance of first aid",
            "Role of a first responder",
            "Emergency scene assessment",
            "Cuts and wounds",
            "Bleeding control",
            "Burns treatment"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "SafeLife Club Mentor"
    },
    {
        "id": "HWB-SL-A03",
        "code": "SL-A03",
        "name": "CPR & AED Demonstration",
        "domain": "HWB",
        "level": "explorer",
        "pack": "SafeLife Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Life Saver",
        "sdgs": [
            3,
            4,
            10
        ],
        "ga": [
            "Professional competence",
            "Leadership skills",
            "Responsible citizenship",
            "Adaptability",
            "Problem-solving ability"
        ],
        "purpose": "The CPR & AED Demonstration introduces students to critical lifesaving techniques used during cardiac emergencies.",
        "outcomes": [
            "Understand cardiac emergency response procedures.",
            "Explain the importance of early CPR intervention.",
            "Demonstrate basic CPR techniques.",
            "Understand AED operation procedures.",
            "Respond confidently during simulated emergencies."
        ],
        "competencies": [
            "CPR competency",
            "Emergency response skills",
            "Team coordination skills",
            "Confidence under pressure",
            "Safety decision-making"
        ],
        "syllabus": [
            "Cardiac arrest recognition",
            "Chain of survival",
            "Importance of immediate response",
            "Chest compression techniques",
            "Rescue breathing principles",
            "Adult and child CPR awareness"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "SafeLife Club Mentor"
    },
    {
        "id": "HWB-SL-A04",
        "code": "SL-A04",
        "name": "Fire Safety & Evacuation Drill",
        "domain": "HWB",
        "level": "foundation",
        "pack": "SafeLife Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Fire Warden",
        "sdgs": [
            3,
            11,
            13
        ],
        "ga": [
            "Safety leadership",
            "Responsible behaviour",
            "Teamwork",
            "Decision-making ability",
            "Community awareness"
        ],
        "purpose": "The Fire Safety & Evacuation Drill trains students to recognize fire hazards, follow emergency evacuation procedures, and respond safely during fire-related incidents.",
        "outcomes": [
            "Identify common fire hazards.",
            "Understand fire prevention methods.",
            "Follow emergency evacuation procedures.",
            "Use basic fire safety equipment.",
            "Demonstrate safe behaviour during fire emergencies."
        ],
        "competencies": [
            "Emergency evacuation skills",
            "Risk prevention skills",
            "Situational awareness",
            "Team coordination",
            "Crisis management skills"
        ],
        "syllabus": [
            "Types of fire hazards",
            "Fire prevention practices",
            "Fire safety responsibilities",
            "Alarm response",
            "Evacuation routes",
            "Assembly point procedures"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "SafeLife Club Mentor"
    },
    {
        "id": "HWB-SL-A05",
        "code": "SL-A05",
        "name": "Disaster Preparedness Workshop",
        "domain": "HWB",
        "level": "foundation",
        "pack": "SafeLife Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Preparedness Advocate",
        "sdgs": [
            3,
            11,
            13
        ],
        "ga": [
            "Resilience",
            "Leadership",
            "Social responsibility",
            "Critical thinking",
            "Community engagement"
        ],
        "purpose": "The Disaster Preparedness Workshop develops student awareness and readiness for natural and human-made disasters.",
        "outcomes": [
            "Explain disaster preparedness concepts.",
            "Identify common disaster risks.",
            "Develop personal emergency plans.",
            "Understand disaster response procedures.",
            "Participate effectively in disaster management activities."
        ],
        "competencies": [
            "Disaster preparedness skills",
            "Risk assessment skills",
            "Emergency planning skills",
            "Leadership skills",
            "Team collaboration skills"
        ],
        "syllabus": [
            "Types of disasters",
            "Disaster risk factors",
            "Impact on communities",
            "Emergency kits",
            "Communication planning",
            "Evacuation planning"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "SafeLife Club Mentor"
    },
    {
        "id": "HWB-SL-A06",
        "code": "SL-A06",
        "name": "Road Safety Awareness Campaign",
        "domain": "HWB",
        "level": "foundation",
        "pack": "SafeLife Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Road Safety Ambassador",
        "sdgs": [
            3,
            11,
            12
        ],
        "ga": [
            "Social responsibility",
            "Ethical awareness",
            "Communication skills",
            "Community leadership",
            "Civic consciousness"
        ],
        "purpose": "The Road Safety Awareness Campaign is designed to educate students about safe transportation practices, traffic regulations, responsible road behaviour, and accident prevention.",
        "outcomes": [
            "Understand major causes of road accidents and traffic-related injuries.",
            "Identify safe practices for pedestrians, cyclists, and vehicle users.",
            "Recognize the importance of traffic rules and regulations.",
            "Develop responsible road behaviour.",
            "Promote road safety awareness within the community."
        ],
        "competencies": [
            "Safety communication skills",
            "Public awareness skills",
            "Risk identification skills",
            "Community engagement skills",
            "Responsible decision-making skills"
        ],
        "syllabus": [
            "Importance of road safety",
            "Global road accident challenges",
            "Role of individuals in preventing accidents",
            "Traffic signs and signals",
            "Pedestrian safety",
            "Helmet and seatbelt awareness"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "SafeLife Club Mentor"
    },
    {
        "id": "HWB-SL-A07",
        "code": "SL-A07",
        "name": "Emergency Response Simulation",
        "domain": "HWB",
        "level": "practitioner",
        "pack": "SafeLife Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Emergency Responder",
        "sdgs": [
            3,
            11,
            16
        ],
        "ga": [
            "Leadership",
            "Critical thinking",
            "Adaptability",
            "Professional responsibility",
            "Problem-solving ability"
        ],
        "purpose": "The Emergency Response Simulation provides students with practical exposure to emergency situations through realistic scenarios.",
        "outcomes": [
            "Apply emergency response principles in simulated situations.",
            "Demonstrate teamwork during crisis scenarios.",
            "Make appropriate decisions under pressure.",
            "Practice emergency communication procedures.",
            "Evaluate response effectiveness after simulations."
        ],
        "competencies": [
            "Crisis management skills",
            "Emergency coordination skills",
            "Leadership skills",
            "Teamwork skills",
            "Decision-making ability"
        ],
        "syllabus": [
            "Types of emergencies",
            "Simulation preparation",
            "Roles and responsibilities",
            "Initial assessment",
            "Rescue coordination",
            "Communication procedures"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "SafeLife Club Mentor"
    },
    {
        "id": "HWB-SL-A08",
        "code": "SL-A08",
        "name": "Blood Donation & Organ Donation Awareness",
        "domain": "HWB",
        "level": "practitioner",
        "pack": "SafeLife Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Donation Advocate",
        "sdgs": [
            3,
            4,
            10
        ],
        "ga": [
            "Compassion",
            "Ethical awareness",
            "Social commitment",
            "Communication ability",
            "Community engagement"
        ],
        "purpose": "The Blood Donation & Organ Donation Awareness Programme promotes understanding of voluntary donation, healthcare responsibility, and community service.",
        "outcomes": [
            "Understand the importance of blood donation and organ donation.",
            "Explain donation procedures and eligibility requirements.",
            "Address common misconceptions about donation.",
            "Promote health awareness within society.",
            "Develop humanitarian responsibility."
        ],
        "competencies": [
            "Health communication skills",
            "Community outreach skills",
            "Awareness campaign skills",
            "Ethical decision-making",
            "Social responsibility skills"
        ],
        "syllabus": [
            "Importance of blood supply",
            "Blood groups",
            "Donation process",
            "Donor safety",
            "Importance of organ transplantation",
            "Donation ethics"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "SafeLife Club Mentor"
    },
    {
        "id": "HWB-SL-A09",
        "code": "SL-A09",
        "name": "Mental Health First Aid Session",
        "domain": "HWB",
        "level": "leader",
        "pack": "SafeLife Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Mental Health Ally",
        "sdgs": [
            3,
            4,
            10
        ],
        "ga": [
            "Empathy",
            "Emotional intelligence",
            "Ethical responsibility",
            "Communication ability",
            "Holistic wellbeing awareness"
        ],
        "purpose": "The Mental Health First Aid Session introduces students to basic concepts of mental health awareness, emotional support, stress management, and psychological first aid.",
        "outcomes": [
            "Understand basic mental health concepts.",
            "Recognize signs of emotional distress.",
            "Provide basic psychological support.",
            "Develop healthy coping strategies.",
            "Promote mental health awareness among peers."
        ],
        "competencies": [
            "Active listening skills",
            "Emotional intelligence",
            "Peer support skills",
            "Communication skills",
            "Stress management skills"
        ],
        "syllabus": [
            "Importance of mental well-being",
            "Common mental health challenges",
            "Reducing stigma",
            "Listening skills",
            "Emotional support techniques",
            "Referral and support systems"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "SafeLife Club Committee"
    },
    {
        "id": "HWB-SL-A10",
        "code": "SL-A10",
        "name": "Annual Campus Safety Summit",
        "domain": "HWB",
        "level": "leader",
        "pack": "SafeLife Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Safety Leader",
        "sdgs": [
            3,
            4,
            11,
            17
        ],
        "ga": [
            "Leadership",
            "Innovation mindset",
            "Communication excellence",
            "Professional competence",
            "Social responsibility"
        ],
        "purpose": "The Annual Campus Safety Summit is a flagship SafeLife Club event that brings together students, faculty members, safety professionals, and community partners to promote safety awareness, knowledge sharing, and innovation in emergency preparedness.",
        "outcomes": [
            "Understand current trends in safety and emergency management.",
            "Share knowledge about safety practices and innovations.",
            "Develop leadership and presentation skills.",
            "Collaborate with safety stakeholders.",
            "Promote a culture of safety within the institution."
        ],
        "competencies": [
            "Leadership skills",
            "Presentation skills",
            "Networking skills",
            "Project management skills",
            "Safety advocacy skills"
        ],
        "syllabus": [
            "Importance of safety culture",
            "Student safety ambassadors",
            "Leadership in emergencies",
            "First aid practices",
            "Disaster preparedness",
            "Campus emergency planning"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 300,
        "faculty": "SafeLife Club Committee"
    },
    {
        "id": "HWB-MAC-A01",
        "code": "MAC-A01",
        "name": "Marathon Club Orientation & Fitness Assessment",
        "domain": "HWB",
        "level": "explorer",
        "pack": "Marathon Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Fitness Explorer",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Lifelong learner",
            "Healthy lifestyle advocate",
            "Self-disciplined individual",
            "Responsible citizen",
            "Reflective practitioner"
        ],
        "purpose": "This introductory activity familiarizes students with the objectives, structure, safety guidelines, and opportunities offered by the Marathon Club.",
        "outcomes": [
            "Understand the objectives and activities of the Marathon Club.",
            "Assess their current fitness and endurance levels.",
            "Identify personal fitness goals for long-term improvement.",
            "Demonstrate awareness of safe running practices and injury prevention."
        ],
        "competencies": [
            "Self-assessment",
            "Physical fitness awareness",
            "Goal-setting",
            "Health monitoring",
            "Personal responsibility",
            "Safe exercise practices"
        ],
        "syllabus": [
            "Introduction to Marathon Club",
            "Benefits of Distance Running",
            "Club Rules & Safety Guidelines",
            "Physical Fitness Assessment",
            "Cardiovascular Endurance Test",
            "Flexibility & Mobility Screening"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Marathon Club Mentor"
    },
    {
        "id": "HWB-MAC-A02",
        "code": "MAC-A02",
        "name": "Beginner Running Workshop",
        "domain": "HWB",
        "level": "explorer",
        "pack": "Marathon Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Beginner Runner",
        "sdgs": [
            3,
            4,
            11
        ],
        "ga": [
            "Physically fit",
            "Self-motivated",
            "Disciplined",
            "Adaptive learner",
            "Positive attitude"
        ],
        "purpose": "This workshop introduces beginners to the fundamentals of running, including posture, running mechanics, breathing techniques, pacing, and proper warm-up and cool-down exercises to develop safe and effective running habits.",
        "outcomes": [
            "Demonstrate proper running posture and technique.",
            "Apply correct breathing methods while running.",
            "Perform effective warm-up and cool-down routines.",
            "Build confidence to begin regular running practice."
        ],
        "competencies": [
            "Running technique",
            "Coordination",
            "Breathing control",
            "Physical endurance",
            "Injury prevention",
            "Self-confidence"
        ],
        "syllabus": [
            "Running Fundamentals",
            "Correct Body Posture",
            "Foot Strike Techniques",
            "Breathing Methods",
            "Warm-up Exercises",
            "Cool-down & Stretching"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Marathon Club Mentor"
    },
    {
        "id": "HWB-MAC-A03",
        "code": "MAC-A03",
        "name": "Endurance Run Training Session",
        "domain": "HWB",
        "level": "explorer",
        "pack": "Marathon Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Endurance Runner",
        "sdgs": [
            3,
            8,
            11
        ],
        "ga": [
            "Persistent learner",
            "Healthy individual",
            "Emotionally resilient",
            "Goal-oriented",
            "Responsible citizen"
        ],
        "purpose": "Participants engage in structured endurance training sessions designed to progressively improve cardiovascular endurance, stamina, pace consistency, and mental resilience required for long-distance running.",
        "outcomes": [
            "Improve aerobic endurance.",
            "Maintain consistent pacing during long runs.",
            "Monitor heart rate and physical performance.",
            "Develop perseverance through endurance training."
        ],
        "competencies": [
            "Endurance",
            "Stamina",
            "Time management",
            "Physical resilience",
            "Self-monitoring",
            "Consistency"
        ],
        "syllabus": [
            "Aerobic Conditioning",
            "Long Distance Running",
            "Pace Management",
            "Heart Rate Monitoring",
            "Hydration During Runs",
            "Recovery Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Marathon Club Mentor"
    },
    {
        "id": "HWB-MAC-A04",
        "code": "MAC-A04",
        "name": "Speed & Interval Training Workshop",
        "domain": "HWB",
        "level": "foundation",
        "pack": "Marathon Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Speed Trainer",
        "sdgs": [
            3,
            4,
            9
        ],
        "ga": [
            "Self-disciplined",
            "Performance-oriented",
            "Goal-focused",
            "Physically competitive",
            "Resilient athlete"
        ],
        "purpose": "This workshop develops participants' speed, power, and anaerobic capacity through structured interval training methods.",
        "outcomes": [
            "Apply interval training methods to improve running speed.",
            "Perform structured sprint and recovery sets effectively.",
            "Understand the principles of anaerobic and aerobic training zones.",
            "Design personal speed training sessions for performance improvement."
        ],
        "competencies": [
            "Speed development",
            "Interval training",
            "Anaerobic fitness",
            "Sprint technique",
            "Agility",
            "Performance optimization"
        ],
        "syllabus": [
            "Introduction to Speed Training",
            "Interval Training Methods",
            "Sprint Mechanics",
            "Fartlek Training",
            "Track Sessions",
            "Heart Rate Zones for Speed Training"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Marathon Club Mentor"
    },
    {
        "id": "HWB-MAC-A05",
        "code": "MAC-A05",
        "name": "Long Distance Group Run",
        "domain": "HWB",
        "level": "foundation",
        "pack": "Marathon Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Group Runner",
        "sdgs": [
            3,
            11,
            17
        ],
        "ga": [
            "Team player",
            "Healthy individual",
            "Goal-oriented",
            "Resilient",
            "Community contributor"
        ],
        "purpose": "The Long Distance Group Run brings Marathon Club members together for structured outdoor running sessions, building community spirit, mutual motivation, and collective endurance.",
        "outcomes": [
            "Complete a structured long-distance run successfully.",
            "Apply pacing strategies for sustained effort over longer distances.",
            "Demonstrate teamwork and mutual encouragement during group runs.",
            "Build aerobic endurance through consistent long-distance training."
        ],
        "competencies": [
            "Endurance",
            "Pacing",
            "Teamwork",
            "Physical stamina",
            "Community spirit",
            "Self-motivation"
        ],
        "syllabus": [
            "Group Run Orientation",
            "Pacing Strategies",
            "Running Etiquette",
            "Long Distance Techniques",
            "Hydration During Long Runs",
            "Group Formation & Safety"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Marathon Club Mentor"
    },
    {
        "id": "HWB-MAC-A06",
        "code": "MAC-A06",
        "name": "Running Technique & Biomechanics Workshop",
        "domain": "HWB",
        "level": "foundation",
        "pack": "Marathon Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Running Analyst",
        "sdgs": [
            3,
            4,
            9
        ],
        "ga": [
            "Analytical thinker",
            "Physically competent",
            "Lifelong learner",
            "Health-conscious individual",
            "Performance-oriented athlete"
        ],
        "purpose": "This workshop focuses on improving running efficiency through proper biomechanics, posture, stride mechanics, foot strike patterns, arm movement, and body alignment.",
        "outcomes": [
            "Demonstrate correct running posture and biomechanics.",
            "Apply efficient stride and foot strike techniques.",
            "Analyze personal running mechanics for improvement.",
            "Reduce injury risk through proper movement techniques."
        ],
        "competencies": [
            "Running biomechanics",
            "Movement analysis",
            "Body coordination",
            "Performance optimization",
            "Injury prevention",
            "Self-evaluation"
        ],
        "syllabus": [
            "Introduction to Running Biomechanics",
            "Running Posture & Body Alignment",
            "Stride Length and Cadence",
            "Foot Strike Techniques",
            "Arm Swing Coordination",
            "Running Efficiency"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Marathon Club Mentor"
    },
    {
        "id": "HWB-MAC-A07",
        "code": "MAC-A07",
        "name": "Strength & Conditioning for Runners",
        "domain": "HWB",
        "level": "practitioner",
        "pack": "Marathon Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Strength Runner",
        "sdgs": [
            3,
            4,
            11
        ],
        "ga": [
            "Self-disciplined",
            "Physically fit",
            "Adaptable learner",
            "Healthy individual",
            "Resilient athlete"
        ],
        "purpose": "This activity introduces participants to strength training, functional fitness, flexibility, mobility, and conditioning exercises specifically designed to improve running performance, muscular endurance, and injury resistance.",
        "outcomes": [
            "Perform strength exercises for runners.",
            "Improve muscular endurance and flexibility.",
            "Develop balanced fitness for long-distance running.",
            "Apply conditioning principles to enhance athletic performance."
        ],
        "competencies": [
            "Functional fitness",
            "Muscular endurance",
            "Flexibility",
            "Core strength",
            "Conditioning",
            "Injury prevention"
        ],
        "syllabus": [
            "Functional Strength Training",
            "Core Stability",
            "Lower Body Strength",
            "Upper Body Conditioning",
            "Flexibility Exercises",
            "Mobility Drills"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Marathon Club Mentor"
    },
    {
        "id": "HWB-MAC-A08",
        "code": "MAC-A08",
        "name": "Recovery & Injury Prevention Clinic",
        "domain": "HWB",
        "level": "practitioner",
        "pack": "Marathon Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Recovery Specialist",
        "sdgs": [
            3,
            4,
            12
        ],
        "ga": [
            "Responsible individual",
            "Health-conscious learner",
            "Self-managed athlete",
            "Lifelong learner",
            "Reflective practitioner"
        ],
        "purpose": "This clinic provides practical knowledge on recovery strategies, injury prevention, stretching techniques, mobility exercises, sleep, and rehabilitation methods that help runners maintain consistent performance while minimizing injuries.",
        "outcomes": [
            "Identify common running injuries.",
            "Demonstrate recovery techniques after training.",
            "Perform stretching and mobility exercises correctly.",
            "Develop personal injury prevention plans."
        ],
        "competencies": [
            "Recovery management",
            "Flexibility",
            "Risk assessment",
            "Injury prevention",
            "Wellness planning",
            "Self-care"
        ],
        "syllabus": [
            "Common Running Injuries",
            "Recovery Principles",
            "Static & Dynamic Stretching",
            "Foam Rolling Techniques",
            "Mobility Exercises",
            "Sleep & Recovery"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Marathon Club Mentor"
    },
    {
        "id": "HWB-MAC-A09",
        "code": "MAC-A09",
        "name": "Campus Mini Marathon",
        "domain": "HWB",
        "level": "leader",
        "pack": "Marathon Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Mini Marathoner",
        "sdgs": [
            3,
            11,
            17
        ],
        "ga": [
            "Team player",
            "Ethical sportsperson",
            "Physically active citizen",
            "Confident learner",
            "Community contributor"
        ],
        "purpose": "The Campus Mini Marathon provides participants with an opportunity to apply their training in a competitive yet supportive environment.",
        "outcomes": [
            "Successfully complete a mini marathon.",
            "Demonstrate endurance and pacing skills.",
            "Exhibit sportsmanship and teamwork.",
            "Reflect on personal performance for future improvement."
        ],
        "competencies": [
            "Endurance",
            "Goal achievement",
            "Time management",
            "Teamwork",
            "Mental resilience",
            "Competitive spirit"
        ],
        "syllabus": [
            "Event Briefing",
            "Race Preparation",
            "Warm-up Session",
            "Mini Marathon Participation",
            "Pace Management",
            "Hydration During Competition"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 300,
        "faculty": "Marathon Club Committee"
    },
    {
        "id": "HWB-MAC-A10",
        "code": "MAC-A10",
        "name": "Annual Marathon Championship",
        "domain": "HWB",
        "level": "leader",
        "pack": "Marathon Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Marathon Champion",
        "sdgs": [
            3,
            4,
            11,
            17
        ],
        "ga": [
            "Ethical leader",
            "Resilient individual",
            "Team collaborator",
            "Lifelong fitness advocate",
            "Socially responsible citizen"
        ],
        "purpose": "The Annual Marathon Championship is the flagship event of the Marathon Club, providing participants with an opportunity to demonstrate their endurance, discipline, leadership, and competitive abilities.",
        "outcomes": [
            "Complete a marathon event successfully.",
            "Demonstrate advanced endurance and race strategies.",
            "Exhibit leadership and sportsmanship throughout the competition.",
            "Evaluate race performance for continuous improvement."
        ],
        "competencies": [
            "Advanced endurance",
            "Leadership",
            "Strategic planning",
            "Stress management",
            "Decision-making",
            "Competitive excellence"
        ],
        "syllabus": [
            "Marathon Rules & Regulations",
            "Race Strategy",
            "Advanced Pace Management",
            "Hydration & Nutrition During Competition",
            "Safety Procedures",
            "Leadership in Sports"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 500,
        "faculty": "Marathon Club Committee"
    },
    {
        "id": "HWB-YC-A01",
        "code": "YC-A01",
        "name": "Yoga Club Orientation & Wellness Awareness",
        "domain": "HWB",
        "level": "explorer",
        "pack": "Yoga Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Wellness Explorer",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Holistic wellness awareness",
            "Lifelong learning mindset",
            "Self-management skills",
            "Social responsibility"
        ],
        "purpose": "The Yoga Club Orientation & Wellness Awareness activity introduces students to the philosophy, objectives, and benefits of yoga as a holistic approach to physical, mental, emotional, and social well-being.",
        "outcomes": [
            "Understand the fundamentals and philosophy of yoga.",
            "Explain the physical, mental, and emotional benefits of regular yoga practice.",
            "Identify different yoga practices and their applications in daily life.",
            "Develop awareness about healthy lifestyle practices and wellness habits."
        ],
        "competencies": [
            "Basic understanding of yoga concepts",
            "Wellness awareness and self-care skills",
            "Communication and participation skills",
            "Ability to develop healthy routines"
        ],
        "syllabus": [
            "Introduction to Yoga: Meaning, History, and Evolution",
            "Principles of Yogic Living",
            "Components of Holistic Wellness",
            "Importance of Physical Activity and Mindfulness",
            "Overview of Yoga Club Activities",
            "Daily Yoga and Wellness Practices"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 150,
        "faculty": "Yoga Club Mentor"
    },
    {
        "id": "HWB-YC-A02",
        "code": "YC-A02",
        "name": "Beginner Yoga Workshop",
        "domain": "HWB",
        "level": "explorer",
        "pack": "Yoga Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Yoga Beginner",
        "sdgs": [
            3,
            4,
            12
        ],
        "ga": [
            "Physical fitness awareness",
            "Self-confidence",
            "Discipline and commitment",
            "Personal wellness management"
        ],
        "purpose": "The Beginner Yoga Workshop introduces participants to fundamental yoga postures, breathing techniques, and relaxation practices.",
        "outcomes": [
            "Perform basic yoga postures with correct alignment.",
            "Understand the importance of breathing coordination during yoga practice.",
            "Apply yoga principles for improving flexibility and body awareness.",
            "Develop a regular beginner-level yoga practice routine."
        ],
        "competencies": [
            "Basic yoga practice skills",
            "Body awareness and coordination",
            "Flexibility development",
            "Self-discipline and consistency"
        ],
        "syllabus": [
            "Introduction to Basic Asanas",
            "Standing, Sitting, and Relaxation Postures",
            "Correct Body Alignment",
            "Basic Breathing Awareness",
            "Warm-up and Cooling-down Techniques",
            "Safety Guidelines in Yoga Practice"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Yoga Club Mentor"
    },
    {
        "id": "HWB-YC-A03",
        "code": "YC-A03",
        "name": "Surya Namaskar Practice Session",
        "domain": "HWB",
        "level": "explorer",
        "pack": "Yoga Club Activities",
        "difficulty": "Beginner",
        "credits": 50,
        "hours": 200,
        "badge": "Surya Namaskar Practitioner",
        "sdgs": [
            3,
            4,
            13
        ],
        "ga": [
            "Health consciousness",
            "Discipline",
            "Self-improvement attitude",
            "Performance orientation"
        ],
        "purpose": "The Surya Namaskar Practice Session develops physical strength, flexibility, endurance, and concentration through systematic practice of the twelve-step Sun Salutation sequence.",
        "outcomes": [
            "Perform Surya Namaskar with proper sequence and technique.",
            "Improve flexibility, stamina, and body coordination.",
            "Understand the health benefits of dynamic yoga practices.",
            "Integrate Surya Namaskar into daily fitness routines."
        ],
        "competencies": [
            "Physical endurance",
            "Movement coordination",
            "Concentration skills",
            "Fitness management skills"
        ],
        "syllabus": [
            "Introduction to Surya Namaskar",
            "Twelve Steps of Sun Salutation",
            "Breathing Coordination",
            "Benefits of Regular Practice",
            "Common Mistakes and Corrections",
            "Developing Daily Practice Habits"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Yoga Club Mentor"
    },
    {
        "id": "HWB-YC-A04",
        "code": "YC-A04",
        "name": "Pranayama & Breathing Techniques Workshop",
        "domain": "HWB",
        "level": "foundation",
        "pack": "Yoga Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Pranayama Practitioner",
        "sdgs": [
            3,
            4,
            16
        ],
        "ga": [
            "Emotional intelligence",
            "Self-awareness",
            "Mental resilience",
            "Wellness leadership"
        ],
        "purpose": "This workshop introduces participants to yogic breathing techniques that improve respiratory efficiency, relaxation, concentration, and emotional balance.",
        "outcomes": [
            "Understand the role of breath regulation in yoga.",
            "Practice basic pranayama techniques safely.",
            "Apply breathing exercises for relaxation and concentration.",
            "Develop awareness of the connection between breath and emotions."
        ],
        "competencies": [
            "Breathing control techniques",
            "Stress regulation skills",
            "Concentration improvement",
            "Emotional management skills"
        ],
        "syllabus": [
            "Concept of Pranayama",
            "Breath Awareness Techniques",
            "Anulom Vilom",
            "Bhramari Pranayama",
            "Deep Breathing Practices",
            "Relaxation through Breath Control"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Yoga Club Mentor"
    },
    {
        "id": "HWB-YC-A05",
        "code": "YC-A05",
        "name": "Meditation & Mindfulness Session",
        "domain": "HWB",
        "level": "foundation",
        "pack": "Yoga Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Mindful Practitioner",
        "sdgs": [
            3,
            4,
            16
        ],
        "ga": [
            "Emotional intelligence",
            "Reflective thinking",
            "Mental resilience",
            "Responsible decision-making"
        ],
        "purpose": "The Meditation & Mindfulness Session develops awareness, concentration, emotional balance, and mental clarity through guided meditation practices.",
        "outcomes": [
            "Practice basic meditation techniques.",
            "Improve concentration and attention span.",
            "Apply mindfulness practices in daily situations.",
            "Develop emotional awareness and self-regulation."
        ],
        "competencies": [
            "Mindfulness skills",
            "Concentration ability",
            "Emotional regulation",
            "Stress coping skills"
        ],
        "syllabus": [
            "Introduction to Meditation",
            "Mindfulness Concepts",
            "Guided Meditation",
            "Awareness of Thoughts and Emotions",
            "Relaxation Techniques",
            "Daily Mindfulness Practices"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Yoga Club Mentor"
    },
    {
        "id": "HWB-YC-A06",
        "code": "YC-A06",
        "name": "Flexibility & Mobility Yoga Workshop",
        "domain": "HWB",
        "level": "foundation",
        "pack": "Yoga Club Activities",
        "difficulty": "Intermediate",
        "credits": 50,
        "hours": 200,
        "badge": "Mobility Master",
        "sdgs": [
            3,
            4,
            12
        ],
        "ga": [
            "Health and fitness consciousness",
            "Self-management ability",
            "Problem-solving through body awareness",
            "Commitment to personal development"
        ],
        "purpose": "The Flexibility & Mobility Yoga Workshop focuses on improving joint mobility, muscle flexibility, posture, and body awareness through targeted yoga practices.",
        "outcomes": [
            "Understand the importance of flexibility and mobility for physical health.",
            "Perform yoga stretches with correct alignment and breathing coordination.",
            "Improve range of motion and body balance.",
            "Apply mobility exercises for maintaining healthy posture."
        ],
        "competencies": [
            "Flexibility improvement skills",
            "Body awareness and posture control",
            "Safe movement practices",
            "Physical wellness management"
        ],
        "syllabus": [
            "Fundamentals of Flexibility and Mobility",
            "Joint Mobility Exercises",
            "Dynamic and Static Stretching",
            "Yoga Postures for Flexibility Development",
            "Posture Correction Techniques",
            "Injury Prevention Through Safe Practice"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Yoga Club Mentor"
    },
    {
        "id": "HWB-YC-A07",
        "code": "YC-A07",
        "name": "Strength & Balance Yoga Session",
        "domain": "HWB",
        "level": "practitioner",
        "pack": "Yoga Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Strength & Balance Yogi",
        "sdgs": [
            3,
            4,
            8
        ],
        "ga": [
            "Confidence and self-efficacy",
            "Discipline and perseverance",
            "Physical wellness leadership",
            "Performance improvement mindset"
        ],
        "purpose": "The Strength & Balance Yoga Session develops muscular strength, stability, coordination, and body control through yoga-based strength practices.",
        "outcomes": [
            "Practice yoga postures that improve strength and stability.",
            "Develop better balance and coordination.",
            "Understand the relationship between strength, flexibility, and posture.",
            "Apply yoga techniques for functional fitness improvement."
        ],
        "competencies": [
            "Physical strength development",
            "Balance and coordination skills",
            "Functional fitness skills",
            "Body control and awareness"
        ],
        "syllabus": [
            "Introduction to Strength-Based Yoga",
            "Standing Balance Postures",
            "Core Strengthening Practices",
            "Stability and Coordination Exercises",
            "Functional Movement Patterns",
            "Balance Improvement Techniques"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 50,
        "faculty": "Yoga Club Mentor"
    },
    {
        "id": "HWB-YC-A08",
        "code": "YC-A08",
        "name": "Stress Management Through Yoga",
        "domain": "HWB",
        "level": "practitioner",
        "pack": "Yoga Club Activities",
        "difficulty": "Advanced",
        "credits": 50,
        "hours": 200,
        "badge": "Stress Reliever",
        "sdgs": [
            3,
            4,
            16
        ],
        "ga": [
            "Mental resilience",
            "Emotional intelligence",
            "Adaptability",
            "Responsible lifestyle management"
        ],
        "purpose": "The Stress Management Through Yoga Programme introduces yoga-based approaches for managing academic, professional, and personal stress.",
        "outcomes": [
            "Identify common sources and effects of stress.",
            "Practice yoga techniques for stress reduction.",
            "Develop emotional regulation strategies.",
            "Apply relaxation methods in daily life situations."
        ],
        "competencies": [
            "Stress management skills",
            "Emotional regulation",
            "Relaxation techniques",
            "Self-awareness and resilience"
        ],
        "syllabus": [
            "Understanding Stress and Its Impact",
            "Yoga Philosophy for Mental Balance",
            "Relaxation Asanas",
            "Breathing Practices for Stress Control",
            "Meditation for Emotional Wellness",
            "Healthy Coping Strategies"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Yoga Club Mentor"
    },
    {
        "id": "HWB-YC-A09",
        "code": "YC-A09",
        "name": "Yoga for Academic Performance & Exam Wellness",
        "domain": "HWB",
        "level": "leader",
        "pack": "Yoga Club Activities",
        "difficulty": "Advanced",
        "credits": 100,
        "hours": 400,
        "badge": "Academic Wellness Guide",
        "sdgs": [
            3,
            4,
            10
        ],
        "ga": [
            "Academic excellence orientation",
            "Lifelong learning attitude",
            "Self-confidence",
            "Emotional maturity"
        ],
        "purpose": "The Yoga for Academic Performance & Exam Wellness activity focuses on improving concentration, memory, relaxation, and emotional balance among students.",
        "outcomes": [
            "Apply yoga techniques to improve concentration and focus.",
            "Practice relaxation methods during academic stress.",
            "Develop healthy study-life balance habits.",
            "Improve self-confidence and emotional control."
        ],
        "competencies": [
            "Concentration improvement",
            "Stress coping ability",
            "Time and lifestyle management",
            "Self-regulation skills"
        ],
        "syllabus": [
            "Student Wellness and Academic Stress",
            "Concentration Enhancement Practices",
            "Breathing Exercises for Focus",
            "Meditation for Memory and Attention",
            "Relaxation Techniques Before Examinations",
            "Time Management and Healthy Habits"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 100,
        "faculty": "Yoga Club Committee"
    },
    {
        "id": "HWB-YC-A10",
        "code": "YC-A10",
        "name": "International Day of Yoga Celebration & Wellness Campaign",
        "domain": "HWB",
        "level": "leader",
        "pack": "Yoga Club Activities",
        "difficulty": "Advanced",
        "credits": 150,
        "hours": 600,
        "badge": "Wellness Campaigner",
        "sdgs": [
            3,
            4,
            17
        ],
        "ga": [
            "Social responsibility",
            "Leadership capability",
            "Communication excellence",
            "Global citizenship"
        ],
        "purpose": "The International Day of Yoga Celebration & Wellness Campaign is a large-scale awareness activity that promotes yoga, healthy living, and community wellness.",
        "outcomes": [
            "Demonstrate yoga practices in a public wellness event.",
            "Understand the social importance of yoga promotion.",
            "Develop teamwork and event organization skills.",
            "Promote health awareness among campus and community members."
        ],
        "competencies": [
            "Event management skills",
            "Leadership and teamwork",
            "Public communication skills",
            "Community engagement skills"
        ],
        "syllabus": [
            "History and Significance of International Day of Yoga",
            "Mass Yoga Demonstration",
            "Yoga Awareness Campaign Planning",
            "Wellness Exhibition and Outreach Activities",
            "Community Participation",
            "Health and Lifestyle Awareness"
        ],
        "enrolledCount": 0,
        "maxEnrollment": 300,
        "faculty": "Yoga Club Committee"
    }
];

export const ACTIVITIES = rawActivities.map((a, idx) => ({
  ...a,
  rating: a.rating || (4.0 + Math.random()).toFixed(1),
  semester: a.semester || "Even Sem 2024",
  timeline: a.timeline || [
    { event: "Registration Opens", date: "Jan 10, 2024" },
    { event: "Orientation", date: "Jan 25, 2024" },
    { event: "Project Submission", date: "Apr 15, 2024" },
  ],
  resources: a.resources || [
    { id: 1, type: "pdf",   title: "Activity Handbook", url: "#" },
    { id: 2, type: "video", title: "Intro Video",        url: "#" },
    { id: 3, type: "link",  title: "Reading Material",   url: "#" },
  ],
  assignments: a.assignments || [
    { id: 1, title: "Pre-Activity Reflection", dueDate: "2025-07-18", submitted: idx % 3 !== 0, grade: idx % 3 === 1 ? "A" : null },
    { id: 2, title: "Mid-Activity Report", dueDate: "2025-07-25", submitted: idx % 6 >= 3, grade: idx % 6 === 3 ? "A+" : null },
    { id: 3, title: "Final Submission", dueDate: "2025-08-05", submitted: idx % 6 === 4, grade: idx % 6 === 4 ? "A" : null },
  ],
  nationalMission: a.nationalMission || "Digital India",
  competencies: a.competencies || ["Analytical Thinking", "Technical Communication"],
  career: a.career || ["Core Engineering", "Research & Development"],
  facultyFeedback: a.facultyFeedback || (idx % 3 === 0 ? "Excellent understanding of core concepts. Ready for the next level." : null),
  userStatus: a.userStatus || ["not_enrolled","registered","ongoing","completed","pending_review","archived"][idx % 6],
  userProgress: typeof a.userProgress === "number" ? a.userProgress : [0, 20, 45, 100, 100, 0][idx % 6],
  userAttendance: typeof a.userAttendance === "number" ? a.userAttendance : [0, 60, 75, 90, 100, 0][idx % 6],
  certificateReady: a.certificateReady !== undefined ? a.certificateReady : (idx % 6 === 4),
  badgeEarned: a.badgeEarned !== undefined ? a.badgeEarned : (idx % 6 === 3 || idx % 6 === 4),
  credits_earned: a.credits_earned !== undefined ? a.credits_earned : (idx % 6 >= 3 ? a.credits : 0),
  submittedOn: a.submittedOn !== undefined ? a.submittedOn : (idx % 6 === 4 ? "2025-06-15" : null),
  reflection: a.reflection !== undefined ? a.reflection : (idx % 6 === 3 ? "This activity transformed my perspective on the subject." : null),
}));

export const ACTIVITY_PACKS = [
  "Core Skills Pack", "Leadership Pack", "Tech Frontier Pack",
  "Social Impact Pack", "Wellness Pack", "Creative Arts Pack",
  "Innovation Pack", "Research Pack", "Career Readiness Pack",
  "Global Citizenship Pack",
];

export const FACULTIES = [
  "Dr. Ramesh Kumar",   "Prof. Anitha Reddy",  "Dr. Suresh Babu",
  "Dr. Priya Sharma",   "Prof. Venkat Rao",    "Dr. Lavanya Devi",
  "Prof. Kiran Patel",  "Dr. Mohan Das",       "Dr. Sunitha Nair",
  "Prof. Arun Menon",
];

export const SDGS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];

export const GRADUATE_ATTRIBUTES = [
  "Domain Knowledge","Problem Solving","Communication",
  "Leadership","Ethics & Values","Industry Exposure",
  "Global Awareness","Research Aptitude",
];

export const JOURNEY_STAGES = LEVELS.map((level) => ({
  ...level,
  activities: ACTIVITIES.filter((a) => a.level === level.id),
  completed_activities: ACTIVITIES.filter(
    (a) => a.level === level.id && (a.userStatus === "completed" || a.userStatus === "certificates_ready")
  ).length,
}));

// ─── My Activities split ───────────────────────────────────────────────────────
export const MY_ACTIVITIES = {
  registered:      ACTIVITIES.filter((a) => a.userStatus === "registered"),
  ongoing:         ACTIVITIES.filter((a) => a.userStatus === "ongoing"),
  completed:       ACTIVITIES.filter((a) => a.userStatus === "completed"),
  pending_review:  ACTIVITIES.filter((a) => a.userStatus === "pending_review"),
  certificates:    ACTIVITIES.filter((a) => a.certificateReady),
  archived:        ACTIVITIES.filter((a) => a.userStatus === "archived"),
};

// ─── Journal entries ───────────────────────────────────────────────────────────
export const JOURNAL_ENTRIES = [
  {
    id: 1,
    activityCode: "TEC-003",
    activityName: "Web Development Bootcamp",
    date: "2025-06-20",
    mood: "🔥",
    prompt: "What was the most significant thing you learned today?",
    content: "Today I finally understood how REST APIs work. Building the backend connected so many dots I had been missing. The moment the frontend fetched my own data — that was genuinely exciting. I also realised I learn best by building, not just watching tutorials.",
    facultyFeedback: "Excellent reflection, Arjun. Your observation about learning by building shows real metacognitive awareness. Consider also reflecting on where you struggled and what that taught you.",
    tags: ["web","backend","learning style"],
    wordCount: 68,
  },
  {
    id: 2,
    activityCode: "ESO-005",
    activityName: "School Mentorship Programme",
    date: "2025-06-10",
    mood: "💙",
    prompt: "How did this experience change your perspective?",
    content: "Mentoring 10th-grade students showed me how much potential goes unrealised because of lack of guidance. One student, Ravi, hadn't considered engineering until I explained how it solves real problems. Seeing his eyes light up reminded me why we do this work.",
    facultyFeedback: "A moving reflection. Your empathy is evident. Try to also document concrete outcomes — did Ravi's grades improve? This makes your impact measurable.",
    tags: ["mentorship","social impact","empathy"],
    wordCount: 75,
  },
  {
    id: 3,
    activityCode: "IIE-015",
    activityName: "Innovation Bootcamp (48-Hour Hackathon)",
    date: "2025-05-15",
    mood: "😤",
    prompt: "Describe a challenge you faced and how you overcame it.",
    content: "At hour 36, our idea hit a wall — the API we relied on was rate-limited and our product broke. The team almost gave up. I convinced us to pivot: instead of fetching live data, we pre-loaded it. The constraint became a feature. We won 2nd place.",
    facultyFeedback: "This is exactly what innovation looks like — pivoting under pressure. Document this decision-making process in your passport. It speaks to your problem-solving competency.",
    tags: ["hackathon","problem-solving","resilience"],
    wordCount: 71,
  },
];

export const REFLECTION_PROMPTS = [
  "What was the most significant thing you learned from this activity?",
  "How did this experience change or challenge your existing perspectives?",
  "Describe a challenge you faced and how you overcame it.",
  "What competencies did you develop, and how will you apply them?",
  "How does this activity connect to your career goals?",
  "What would you do differently if you participated again?",
  "How has this activity contributed to your personal growth?",
  "What impact did you observe on those around you or in the community?",
];
