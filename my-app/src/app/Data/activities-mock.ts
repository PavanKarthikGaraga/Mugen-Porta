// ─────────────────────────────────────────────────────────────────────────────
// SAMAM Activity Management Mock Data
// ~100 activities across 5 domains, 6 journey levels
// ─────────────────────────────────────────────────────────────────────────────

export const DOMAINS = {
  TEC: { id: "TEC", name: "Technical",                      color: "#2563EB", bg: "#EFF6FF" },
  LCH: { id: "LCH", name: "Literary, Cultural & Heritage",  color: "#7C3AED", bg: "#F5F3FF" },
  ESO: { id: "ESO", name: "Extension & Social Outreach",    color: "#059669", bg: "#ECFDF5" },
  IIE: { id: "IIE", name: "Innovation & Entrepreneurship",  color: "#D97706", bg: "#FFFBEB" },
  HWB: { id: "HWB", name: "Health & Well-being",            color: "#DC2626", bg: "#FEF2F2" },
};

export const LEVELS = [
  {
    id: "explorer",
    name: "Explorer",
    icon: "🔭",
    description: "Begin your journey. Discover what interests you.",
    credits_required: 0,
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
  },
  {
    id: "foundation",
    name: "Foundation",
    icon: "🌱",
    description: "Build your base competencies across core areas.",
    credits_required: 50,
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  {
    id: "practitioner",
    name: "Practitioner",
    icon: "⚙️",
    description: "Apply knowledge. Contribute to real-world projects.",
    credits_required: 120,
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    id: "leader",
    name: "Leader",
    icon: "🏅",
    description: "Lead teams, mentor peers, drive initiatives.",
    credits_required: 220,
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  {
    id: "mentor",
    name: "Mentor",
    icon: "🎓",
    description: "Guide others. Become a subject matter contributor.",
    credits_required: 300,
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
  {
    id: "innovator",
    name: "Innovator",
    icon: "🚀",
    description: "Create, publish, and inspire systemic change.",
    credits_required: 400,
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
];

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

export const COMPETENCIES_LIST = [
  "Critical Thinking","Communication","Teamwork","Leadership",
  "Problem Solving","Digital Literacy","Emotional Intelligence",
  "Creativity & Innovation","Research Skills","Adaptability",
];

const NATIONAL_MISSIONS = [
  "Digital India", "Skill India", "Swachh Bharat", "Make in India",
  "Startup India", "Fit India", "National Education Policy 2020",
];

// ─── Generate 100 Activities ──────────────────────────────────────────────────
const activityTemplates = [
  // TEC — Technical (20 activities)
  { code:"TEC-001", name:"Introduction to Programming with Python", domain:"TEC", level:"explorer",      pack:"Core Skills Pack",       difficulty:"Beginner",     credits:8,  hours:10, badge:"Code Starter",      sdgs:[4,8],     ga:["Domain Knowledge","Digital Literacy"],        purpose:"Equip students with foundational programming skills using Python.", outcomes:["Write basic Python programs","Understand variables and data types","Build simple algorithms"] },
  { code:"TEC-002", name:"Data Structures & Algorithms Sprint",     domain:"TEC", level:"foundation",    pack:"Tech Frontier Pack",     difficulty:"Intermediate", credits:12, hours:15, badge:"Algorithm Ace",      sdgs:[4,8,9],   ga:["Domain Knowledge","Problem Solving"],          purpose:"Develop strong DSA foundations essential for technical interviews.", outcomes:["Implement arrays, linked lists, trees","Analyze time complexity","Solve competitive problems"] },
  { code:"TEC-003", name:"Web Development Bootcamp",                domain:"TEC", level:"foundation",    pack:"Core Skills Pack",       difficulty:"Intermediate", credits:15, hours:20, badge:"Web Builder",        sdgs:[4,8,9],   ga:["Domain Knowledge","Digital Literacy"],         purpose:"Build full-stack web applications using modern tools.", outcomes:["Create responsive HTML/CSS layouts","Build REST APIs","Deploy web applications"] },
  { code:"TEC-004", name:"Machine Learning Fundamentals",           domain:"TEC", level:"practitioner",  pack:"Tech Frontier Pack",     difficulty:"Advanced",     credits:20, hours:25, badge:"ML Pioneer",         sdgs:[4,8,9],   ga:["Domain Knowledge","Research Aptitude"],        purpose:"Introduce ML concepts with hands-on model building.", outcomes:["Train classification models","Evaluate model performance","Apply ML to real datasets"] },
  { code:"TEC-005", name:"Cybersecurity Awareness Workshop",        domain:"TEC", level:"explorer",      pack:"Core Skills Pack",       difficulty:"Beginner",     credits:5,  hours:6,  badge:"Cyber Guard",        sdgs:[16],      ga:["Domain Knowledge","Ethics & Values"],          purpose:"Build awareness of digital threats and safe online practices.", outcomes:["Identify common threats","Apply password hygiene","Understand phishing attacks"] },
  { code:"TEC-006", name:"Cloud Computing with AWS",                domain:"TEC", level:"practitioner",  pack:"Tech Frontier Pack",     difficulty:"Advanced",     credits:18, hours:22, badge:"Cloud Architect",    sdgs:[8,9],     ga:["Domain Knowledge","Industry Exposure"],        purpose:"Gain practical AWS skills for cloud-based solutions.", outcomes:["Deploy EC2 instances","Configure S3 buckets","Set up load balancers"] },
  { code:"TEC-007", name:"Mobile App Development (Flutter)",        domain:"TEC", level:"practitioner",  pack:"Tech Frontier Pack",     difficulty:"Advanced",     credits:18, hours:25, badge:"App Creator",         sdgs:[8,9],     ga:["Domain Knowledge","Digital Literacy"],         purpose:"Build cross-platform mobile apps using Flutter & Dart.", outcomes:["Create UI with widgets","Manage state in Flutter","Publish app to Play Store"] },
  { code:"TEC-008", name:"Open Source Contribution Sprint",         domain:"TEC", level:"foundation",    pack:"Core Skills Pack",       difficulty:"Intermediate", credits:10, hours:12, badge:"Open Source Hero",    sdgs:[9,17],    ga:["Domain Knowledge","Teamwork"],                 purpose:"Contribute to real open-source projects on GitHub.", outcomes:["Fork and PR on GitHub","Review code","Write technical documentation"] },
  { code:"TEC-009", name:"Internet of Things (IoT) Hackathon",     domain:"TEC", level:"leader",        pack:"Innovation Pack",        difficulty:"Advanced",     credits:20, hours:18, badge:"IoT Champion",        sdgs:[9,11],    ga:["Domain Knowledge","Problem Solving"],          purpose:"Build IoT prototypes solving urban challenges.", outcomes:["Interface sensors with Raspberry Pi","Build dashboards","Present IoT prototype"] },
  { code:"TEC-010", name:"Database Design & SQL Mastery",           domain:"TEC", level:"foundation",    pack:"Core Skills Pack",       difficulty:"Intermediate", credits:10, hours:12, badge:"Data Maestro",        sdgs:[4,8],     ga:["Domain Knowledge","Problem Solving"],          purpose:"Design efficient databases and master SQL queries.", outcomes:["Design normalized schemas","Write complex queries","Optimize database performance"] },
  { code:"TEC-011", name:"DevOps & CI/CD Pipelines",               domain:"TEC", level:"leader",        pack:"Tech Frontier Pack",     difficulty:"Advanced",     credits:15, hours:18, badge:"DevOps Pro",          sdgs:[8,9],     ga:["Domain Knowledge","Industry Exposure"],        purpose:"Implement modern DevOps practices and automation.", outcomes:["Set up GitHub Actions","Dockerize applications","Deploy with Kubernetes"] },
  { code:"TEC-012", name:"Natural Language Processing Workshop",    domain:"TEC", level:"practitioner",  pack:"Research Pack",          difficulty:"Advanced",     credits:15, hours:20, badge:"NLP Expert",          sdgs:[4,9],     ga:["Domain Knowledge","Research Aptitude"],        purpose:"Apply NLP to build intelligent text-processing systems.", outcomes:["Tokenize and parse text","Build sentiment classifier","Create chatbot prototype"] },
  { code:"TEC-013", name:"Competitive Programming Challenge",       domain:"TEC", level:"foundation",    pack:"Tech Frontier Pack",     difficulty:"Intermediate", credits:8,  hours:10, badge:"Code Warrior",        sdgs:[4],       ga:["Problem Solving","Domain Knowledge"],          purpose:"Sharpen algorithmic problem-solving under competitive conditions.", outcomes:["Solve 50+ LeetCode problems","Understand DP and graphs","Participate in ICPC"] },
  { code:"TEC-014", name:"Blockchain Fundamentals",                 domain:"TEC", level:"practitioner",  pack:"Innovation Pack",        difficulty:"Intermediate", credits:10, hours:12, badge:"Chain Builder",        sdgs:[9,16],    ga:["Domain Knowledge","Research Aptitude"],        purpose:"Understand blockchain architecture and decentralized applications.", outcomes:["Explain consensus mechanisms","Write Solidity smart contracts","Deploy DApps"] },
  { code:"TEC-015", name:"UI/UX Design Thinking",                   domain:"TEC", level:"explorer",      pack:"Core Skills Pack",       difficulty:"Beginner",     credits:8,  hours:10, badge:"Design Thinker",      sdgs:[4,8],     ga:["Problem Solving","Communication"],             purpose:"Apply human-centred design principles to create intuitive interfaces.", outcomes:["Create user personas","Build Figma wireframes","Conduct usability tests"] },
  { code:"TEC-016", name:"Data Science Project Sprint",             domain:"TEC", level:"leader",        pack:"Research Pack",          difficulty:"Advanced",     credits:20, hours:30, badge:"Data Scientist",      sdgs:[8,9],     ga:["Domain Knowledge","Research Aptitude"],        purpose:"Execute end-to-end data science projects on real datasets.", outcomes:["Clean and explore datasets","Build predictive models","Present findings"] },
  { code:"TEC-017", name:"Quantum Computing Introduction",          domain:"TEC", level:"mentor",        pack:"Research Pack",          difficulty:"Advanced",     credits:12, hours:15, badge:"Quantum Thinker",     sdgs:[9],       ga:["Domain Knowledge","Research Aptitude"],        purpose:"Explore quantum computing concepts and their implications.", outcomes:["Understand qubits","Run basic quantum circuits","Explore QC applications"] },
  { code:"TEC-018", name:"Augmented Reality App Development",       domain:"TEC", level:"leader",        pack:"Innovation Pack",        difficulty:"Advanced",     credits:15, hours:20, badge:"AR Creator",          sdgs:[4,9],     ga:["Domain Knowledge","Digital Literacy"],         purpose:"Build AR experiences using Unity and ARCore.", outcomes:["Build AR markers","Develop spatial interfaces","Deploy AR app"] },
  { code:"TEC-019", name:"Embedded Systems Workshop",               domain:"TEC", level:"practitioner",  pack:"Tech Frontier Pack",     difficulty:"Advanced",     credits:12, hours:15, badge:"Systems Builder",     sdgs:[9],       ga:["Domain Knowledge","Problem Solving"],          purpose:"Program microcontrollers for real-world embedded applications.", outcomes:["Program Arduino","Interface actuators","Build sensor-driven projects"] },
  { code:"TEC-020", name:"Tech for Good: AI for Social Impact",     domain:"TEC", level:"innovator",     pack:"Social Impact Pack",     difficulty:"Advanced",     credits:25, hours:30, badge:"Tech Changemaker",    sdgs:[1,3,4,9], ga:["Global Awareness","Research Aptitude"],        purpose:"Build AI-powered solutions that address societal challenges.", outcomes:["Identify social problems","Build AI solutions","Pitch to stakeholders"] },

  // LCH — Literary, Cultural & Heritage (20 activities)
  { code:"LCH-001", name:"Creative Writing Masterclass",            domain:"LCH", level:"explorer",      pack:"Creative Arts Pack",     difficulty:"Beginner",     credits:6,  hours:8,  badge:"Wordsmith",           sdgs:[4],       ga:["Communication","Creativity & Innovation"],    purpose:"Develop creative expression through varied writing forms.", outcomes:["Write short stories","Draft poetry","Craft opinion essays"] },
  { code:"LCH-002", name:"Public Speaking & Debate",                domain:"LCH", level:"explorer",      pack:"Core Skills Pack",       difficulty:"Beginner",     credits:8,  hours:10, badge:"Orator",              sdgs:[4],       ga:["Communication","Leadership"],                 purpose:"Build confident public speaking and structured debate skills.", outcomes:["Structure arguments","Rebut effectively","Speak before an audience"] },
  { code:"LCH-003", name:"Film Making Workshop",                    domain:"LCH", level:"practitioner",  pack:"Creative Arts Pack",     difficulty:"Intermediate", credits:12, hours:15, badge:"Director",            sdgs:[4,11],    ga:["Creativity & Innovation","Communication"],    purpose:"Create short films from concept to screen.", outcomes:["Write scripts","Direct a 5-min short film","Edit using DaVinci Resolve"] },
  { code:"LCH-004", name:"Classical Dance Appreciation",            domain:"LCH", level:"explorer",      pack:"Creative Arts Pack",     difficulty:"Beginner",     credits:5,  hours:6,  badge:"Culture Keeper",      sdgs:[4,11],    ga:["Ethics & Values","Global Awareness"],         purpose:"Appreciate and perform elements of Indian classical dance traditions.", outcomes:["Understand Bharatanatyam basics","Perform a short piece","Write a cultural reflection"] },
  { code:"LCH-005", name:"Photography & Visual Storytelling",       domain:"LCH", level:"foundation",    pack:"Creative Arts Pack",     difficulty:"Beginner",     credits:8,  hours:10, badge:"Visual Narrator",     sdgs:[4,11],    ga:["Communication","Creativity & Innovation"],    purpose:"Use photography as a medium for storytelling and social commentary.", outcomes:["Master basic composition","Edit photos professionally","Mount a photo exhibition"] },
  { code:"LCH-006", name:"Heritage Walk & Documentation",           domain:"LCH", level:"foundation",    pack:"Global Citizenship Pack",difficulty:"Beginner",     credits:6,  hours:8,  badge:"Heritage Guardian",   sdgs:[11],      ga:["Global Awareness","Ethics & Values"],         purpose:"Explore, document, and preserve local heritage sites.", outcomes:["Visit 3 heritage sites","Create digital documentation","Produce heritage report"] },
  { code:"LCH-007", name:"Podcast Production Workshop",             domain:"LCH", level:"practitioner",  pack:"Creative Arts Pack",     difficulty:"Intermediate", credits:10, hours:12, badge:"Podcast Creator",     sdgs:[4,10],    ga:["Communication","Creativity & Innovation"],    purpose:"Create, record, and publish a podcast episode.", outcomes:["Plan podcast structure","Record and edit audio","Publish on Spotify"] },
  { code:"LCH-008", name:"Vernacular Literature Reading Circle",    domain:"LCH", level:"explorer",      pack:"Creative Arts Pack",     difficulty:"Beginner",     credits:5,  hours:6,  badge:"Literati",            sdgs:[4,10],    ga:["Communication","Ethics & Values"],            purpose:"Explore richness of regional Indian literature in translation.", outcomes:["Read 3 vernacular texts","Present literary analysis","Write comparative essay"] },
  { code:"LCH-009", name:"Street Play & Theatre for Change",        domain:"LCH", level:"foundation",    pack:"Social Impact Pack",     difficulty:"Intermediate", credits:10, hours:12, badge:"Change Actor",         sdgs:[3,4,10],  ga:["Communication","Leadership"],                 purpose:"Use street theatre to communicate social messages to communities.", outcomes:["Write a script on social issue","Perform in a public space","Debrief with audience"] },
  { code:"LCH-010", name:"Music Composition & Appreciation",        domain:"LCH", level:"explorer",      pack:"Creative Arts Pack",     difficulty:"Beginner",     credits:6,  hours:8,  badge:"Melody Maker",        sdgs:[4,11],    ga:["Creativity & Innovation","Ethics & Values"],  purpose:"Understand music theory and create original compositions.", outcomes:["Understand rhythm and melody","Compose a short piece","Perform for peers"] },
  { code:"LCH-011", name:"Research in Indian History & Culture",    domain:"LCH", level:"practitioner",  pack:"Research Pack",          difficulty:"Intermediate", credits:12, hours:15, badge:"Cultural Scholar",    sdgs:[4,11],    ga:["Research Aptitude","Global Awareness"],        purpose:"Conduct research on unexplored aspects of Indian cultural history.", outcomes:["Identify research gap","Collect primary sources","Publish paper"] },
  { code:"LCH-012", name:"Digital Archives & Cultural Preservation",domain:"LCH", level:"leader",        pack:"Global Citizenship Pack",difficulty:"Advanced",     credits:15, hours:18, badge:"Archive Keeper",      sdgs:[4,11,16], ga:["Digital Literacy","Global Awareness"],         purpose:"Create digital archives of endangered cultural practices.", outcomes:["Record oral traditions","Build digital repository","Present at symposium"] },
  { code:"LCH-013", name:"Literary Magazine — Write & Edit",        domain:"LCH", level:"foundation",    pack:"Creative Arts Pack",     difficulty:"Intermediate", credits:8,  hours:10, badge:"Published Author",    sdgs:[4],       ga:["Communication","Research Aptitude"],           purpose:"Contribute to and edit the college literary magazine.", outcomes:["Submit 2 pieces for publication","Edit peer submissions","Design magazine layout"] },
  { code:"LCH-014", name:"Cross-Cultural Communication",            domain:"LCH", level:"practitioner",  pack:"Global Citizenship Pack",difficulty:"Intermediate", credits:10, hours:12, badge:"Global Communicator", sdgs:[10,16],   ga:["Communication","Global Awareness"],            purpose:"Navigate diverse cultural contexts with sensitivity and effectiveness.", outcomes:["Analyse cultural dimensions","Practise intercultural dialogue","Deliver cross-cultural presentation"] },
  { code:"LCH-015", name:"Storytelling for Social Change",          domain:"LCH", level:"leader",        pack:"Social Impact Pack",     difficulty:"Advanced",     credits:15, hours:18, badge:"Story Leader",         sdgs:[4,10],    ga:["Communication","Leadership"],                 purpose:"Use narrative to drive social awareness and community engagement.", outcomes:["Craft compelling social narratives","Train 10 peers","Run community storytelling event"] },
  { code:"LCH-016", name:"Fine Arts & Illustration",                domain:"LCH", level:"explorer",      pack:"Creative Arts Pack",     difficulty:"Beginner",     credits:6,  hours:8,  badge:"Visual Artist",       sdgs:[4,11],    ga:["Creativity & Innovation","Ethics & Values"],  purpose:"Develop visual art skills and express ideas through illustration.", outcomes:["Complete 5 illustrations","Mount an art show","Write artist statement"] },
  { code:"LCH-017", name:"Debate & Model UN",                       domain:"LCH", level:"practitioner",  pack:"Leadership Pack",        difficulty:"Intermediate", credits:12, hours:15, badge:"Diplomat",            sdgs:[16,17],   ga:["Communication","Global Awareness"],            purpose:"Participate in Model United Nations and develop global policy debate skills.", outcomes:["Research UN resolution","Represent a country","Draft a position paper"] },
  { code:"LCH-018", name:"Script Writing for Digital Media",        domain:"LCH", level:"practitioner",  pack:"Creative Arts Pack",     difficulty:"Intermediate", credits:10, hours:12, badge:"Screenwriter",        sdgs:[4,8],     ga:["Communication","Creativity & Innovation"],    purpose:"Write scripts for YouTube, reels, and short-form digital content.", outcomes:["Write 3 scripts","Produce a 60-second video","Analyse engagement metrics"] },
  { code:"LCH-019", name:"Spoken Word Poetry",                      domain:"LCH", level:"foundation",    pack:"Creative Arts Pack",     difficulty:"Beginner",     credits:6,  hours:8,  badge:"Spoken Poet",         sdgs:[4,10],    ga:["Communication","Creativity & Innovation"],    purpose:"Express lived experiences and social commentary through spoken word.", outcomes:["Write 3 poems","Perform at Open Mic","Reflect on peer feedback"] },
  { code:"LCH-020", name:"Media Literacy & Fact-Checking",          domain:"LCH", level:"explorer",      pack:"Core Skills Pack",       difficulty:"Beginner",     credits:5,  hours:6,  badge:"Truth Seeker",        sdgs:[16],      ga:["Ethics & Values","Communication"],             purpose:"Identify misinformation and develop critical media consumption habits.", outcomes:["Fact-check 10 articles","Build a media literacy guide","Teach peers"] },

  // ESO — Extension & Social Outreach (20 activities)
  { code:"ESO-001", name:"Village Adoption & Rural Development",     domain:"ESO", level:"leader",        pack:"Social Impact Pack",     difficulty:"Advanced",     credits:25, hours:40, badge:"Village Champion",    sdgs:[1,2,11],  ga:["Global Awareness","Leadership"],              purpose:"Adopt and develop a village over one semester through structured interventions.", outcomes:["Conduct needs assessment","Implement 3 interventions","Document outcomes"] },
  { code:"ESO-002", name:"Blood Donation Drive",                     domain:"ESO", level:"explorer",      pack:"Wellness Pack",          difficulty:"Beginner",     credits:5,  hours:4,  badge:"Life Giver",          sdgs:[3],       ga:["Ethics & Values","Leadership"],               purpose:"Organise or participate in blood donation camps to save lives.", outcomes:["Recruit 20 donors","Manage camp logistics","Write impact report"] },
  { code:"ESO-003", name:"Digital Literacy for Seniors",            domain:"ESO", level:"foundation",    pack:"Social Impact Pack",     difficulty:"Beginner",     credits:10, hours:12, badge:"Digital Enabler",     sdgs:[4,10],    ga:["Communication","Digital Literacy"],            purpose:"Teach smartphone and internet basics to senior citizens.", outcomes:["Train 10 seniors","Create simple tutorials","Measure skill improvement"] },
  { code:"ESO-004", name:"Environmental Clean-up Campaign",          domain:"ESO", level:"explorer",      pack:"Social Impact Pack",     difficulty:"Beginner",     credits:5,  hours:6,  badge:"Eco Warrior",         sdgs:[6,13,15], ga:["Ethics & Values","Global Awareness"],         purpose:"Organise and lead community clean-up drives.", outcomes:["Clean 2 sites","Collect 100kg waste","Raise awareness among 50 residents"] },
  { code:"ESO-005", name:"School Mentorship Programme",             domain:"ESO", level:"practitioner",  pack:"Social Impact Pack",     difficulty:"Intermediate", credits:15, hours:20, badge:"Young Mentor",         sdgs:[4,10],    ga:["Leadership","Communication"],                 purpose:"Mentor government school students in academics and life skills.", outcomes:["Mentor 10 students for a semester","Track academic improvement","Present outcomes"] },
  { code:"ESO-006", name:"Women Empowerment Workshop",              domain:"ESO", level:"foundation",    pack:"Social Impact Pack",     difficulty:"Beginner",     credits:8,  hours:10, badge:"Empowerment Champion", sdgs:[5,10],    ga:["Ethics & Values","Global Awareness"],         purpose:"Conduct workshops on women's rights, health, and financial literacy.", outcomes:["Train 30 women","Create resource kits","Partner with NGO"] },
  { code:"ESO-007", name:"Tree Plantation & Biodiversity Drive",    domain:"ESO", level:"explorer",      pack:"Social Impact Pack",     difficulty:"Beginner",     credits:5,  hours:6,  badge:"Green Earth Keeper",  sdgs:[13,15],   ga:["Ethics & Values","Global Awareness"],         purpose:"Plant trees and restore biodiversity in urban and peri-urban areas.", outcomes:["Plant 100 trees","Create biodiversity inventory","Partner with municipality"] },
  { code:"ESO-008", name:"First Aid & Disaster Preparedness",       domain:"ESO", level:"foundation",    pack:"Wellness Pack",          difficulty:"Beginner",     credits:8,  hours:10, badge:"First Responder",     sdgs:[3,11],    ga:["Ethics & Values","Problem Solving"],           purpose:"Train communities in basic first aid and disaster response.", outcomes:["Get certified in CPR","Train 20 community members","Conduct mock drill"] },
  { code:"ESO-009", name:"Sanitation & Health Awareness Campaign",  domain:"ESO", level:"foundation",    pack:"Social Impact Pack",     difficulty:"Beginner",     credits:8,  hours:10, badge:"Health Champion",     sdgs:[3,6],     ga:["Ethics & Values","Communication"],             purpose:"Raise awareness on hygiene, sanitation and preventive health practices.", outcomes:["Reach 200 households","Create IEC materials","Conduct 5 workshops"] },
  { code:"ESO-010", name:"Financial Literacy for Rural Communities", domain:"ESO", level:"practitioner",  pack:"Social Impact Pack",     difficulty:"Intermediate", credits:12, hours:15, badge:"Money Mentor",         sdgs:[1,8,10],  ga:["Communication","Ethics & Values"],             purpose:"Build financial literacy and entrepreneurship skills in rural areas.", outcomes:["Train 50 farmers","Explain savings and loans","Create resource booklets"] },
  { code:"ESO-011", name:"Disability Inclusion Workshop",           domain:"ESO", level:"foundation",    pack:"Social Impact Pack",     difficulty:"Beginner",     credits:8,  hours:10, badge:"Inclusion Champion",  sdgs:[10,16],   ga:["Ethics & Values","Global Awareness"],         purpose:"Create awareness about disability rights and inclusive practices.", outcomes:["Attend sensitisation training","Run 2 workshops","Write inclusion report"] },
  { code:"ESO-012", name:"Youth Leadership Congress",               domain:"ESO", level:"leader",        pack:"Leadership Pack",        difficulty:"Advanced",     credits:20, hours:25, badge:"Youth Leader",         sdgs:[4,16,17], ga:["Leadership","Global Awareness"],              purpose:"Convene young leaders to design community solutions.", outcomes:["Organise 100-member congress","Facilitate 5 sessions","Produce policy brief"] },
  { code:"ESO-013", name:"Skill Training for Tribal Youth",         domain:"ESO", level:"practitioner",  pack:"Social Impact Pack",     difficulty:"Intermediate", credits:15, hours:20, badge:"Skill Enabler",        sdgs:[4,8,10],  ga:["Communication","Ethics & Values"],             purpose:"Provide vocational and digital skill training to tribal youth.", outcomes:["Train 20 youth","Facilitate employment linkages","Document success stories"] },
  { code:"ESO-014", name:"SDG Awareness Walk",                      domain:"ESO", level:"explorer",      pack:"Global Citizenship Pack",difficulty:"Beginner",     credits:4,  hours:4,  badge:"SDG Advocate",        sdgs:[17],      ga:["Global Awareness","Ethics & Values"],         purpose:"Raise awareness on Sustainable Development Goals through public events.", outcomes:["Organise SDG walk","Educate 500 people","Create social media campaign"] },
  { code:"ESO-015", name:"Old Age Home Visit & Engagement",         domain:"ESO", level:"explorer",      pack:"Wellness Pack",          difficulty:"Beginner",     credits:5,  hours:6,  badge:"Compassion Builder",  sdgs:[3,10],    ga:["Ethics & Values","Emotional Intelligence"],  purpose:"Build empathy through regular visits and activities at old age homes.", outcomes:["Visit 3 times","Organise 2 activities","Write reflective journal"] },
  { code:"ESO-016", name:"Climate Action Project",                  domain:"ESO", level:"leader",        pack:"Global Citizenship Pack",difficulty:"Advanced",     credits:20, hours:25, badge:"Climate Champion",    sdgs:[13,15],   ga:["Global Awareness","Problem Solving"],          purpose:"Design and implement a local climate action project.", outcomes:["Map local climate risks","Implement solution","Present to panchayat"] },
  { code:"ESO-017", name:"Community Health Screening Camp",         domain:"ESO", level:"practitioner",  pack:"Wellness Pack",          difficulty:"Intermediate", credits:12, hours:15, badge:"Health Volunteer",    sdgs:[3],       ga:["Ethics & Values","Leadership"],               purpose:"Organise health screening camps in underserved communities.", outcomes:["Screen 100 persons","Liaise with doctors","Provide referrals"] },
  { code:"ESO-018", name:"Rural Innovation Challenge",              domain:"ESO", level:"innovator",     pack:"Innovation Pack",        difficulty:"Advanced",     credits:25, hours:30, badge:"Rural Innovator",     sdgs:[1,2,8,9], ga:["Problem Solving","Global Awareness"],          purpose:"Design tech innovations solving rural livelihood challenges.", outcomes:["Identify rural problem","Prototype solution","Pilot in field"] },
  { code:"ESO-019", name:"STEM for Schools",                        domain:"ESO", level:"foundation",    pack:"Social Impact Pack",     difficulty:"Beginner",     credits:10, hours:12, badge:"STEM Enabler",         sdgs:[4,9],     ga:["Communication","Digital Literacy"],            purpose:"Conduct STEM workshops at government primary schools.", outcomes:["Deliver 5 sessions","Engage 100 students","Create take-home kits"] },
  { code:"ESO-020", name:"Farmers' Market & Agri Awareness",        domain:"ESO", level:"practitioner",  pack:"Social Impact Pack",     difficulty:"Intermediate", credits:10, hours:12, badge:"Agri Champion",        sdgs:[2,8,12],  ga:["Ethics & Values","Global Awareness"],         purpose:"Connect farmers directly to consumers; raise sustainable agriculture awareness.", outcomes:["Organise 1 market","Involve 10 farmers","Create consumer awareness"] },

  // IIE — Innovation, Incubation & Entrepreneurship (20 activities)
  { code:"IIE-001", name:"Startup Ideation Workshop",               domain:"IIE", level:"explorer",      pack:"Innovation Pack",        difficulty:"Beginner",     credits:6,  hours:8,  badge:"Idea Sparker",        sdgs:[8,9],     ga:["Creativity & Innovation","Problem Solving"],  purpose:"Generate and validate startup ideas using design thinking.", outcomes:["Generate 5 ideas","Validate with 20 users","Build business model canvas"] },
  { code:"IIE-002", name:"Business Plan Competition",               domain:"IIE", level:"foundation",    pack:"Innovation Pack",        difficulty:"Intermediate", credits:12, hours:15, badge:"Entrepreneur",         sdgs:[8,9,10],  ga:["Leadership","Problem Solving"],               purpose:"Create a fundable business plan and pitch to a panel of investors.", outcomes:["Develop full business plan","Present to jury","Receive investor feedback"] },
  { code:"IIE-003", name:"Product Prototyping with 3D Printing",    domain:"IIE", level:"practitioner",  pack:"Innovation Pack",        difficulty:"Intermediate", credits:12, hours:15, badge:"Prototype Builder",    sdgs:[9,12],    ga:["Creativity & Innovation","Problem Solving"],  purpose:"Build physical product prototypes using 3D printing and rapid prototyping tools.", outcomes:["Design 3D model","Print and test prototype","Iterate based on feedback"] },
  { code:"IIE-004", name:"Social Entrepreneurship Boot Camp",        domain:"IIE", level:"practitioner",  pack:"Social Impact Pack",     difficulty:"Intermediate", credits:15, hours:18, badge:"Social Entrepreneur",  sdgs:[1,8,10],  ga:["Leadership","Ethics & Values"],               purpose:"Build social enterprises that are financially sustainable and impact-driven.", outcomes:["Define impact thesis","Build social business model","Present impact metrics"] },
  { code:"IIE-005", name:"Investor Pitch Masterclass",              domain:"IIE", level:"leader",        pack:"Career Readiness Pack",  difficulty:"Advanced",     credits:15, hours:18, badge:"Pitch Master",         sdgs:[8,17],    ga:["Communication","Leadership"],                 purpose:"Master the art of pitching to angel investors and VCs.", outcomes:["Build pitch deck","Present to real investors","Negotiate term sheet basics"] },
  { code:"IIE-006", name:"Legal Essentials for Startups",           domain:"IIE", level:"practitioner",  pack:"Innovation Pack",        difficulty:"Intermediate", credits:8,  hours:10, badge:"Legal Ready",          sdgs:[8,16],    ga:["Ethics & Values","Domain Knowledge"],          purpose:"Understand legal frameworks, IP protection, and startup compliance.", outcomes:["Register IP","Understand startup compliances","Draft founders' agreement"] },
  { code:"IIE-007", name:"Market Research & Consumer Insights",      domain:"IIE", level:"foundation",    pack:"Innovation Pack",        difficulty:"Beginner",     credits:8,  hours:10, badge:"Market Researcher",   sdgs:[8,12],    ga:["Research Aptitude","Problem Solving"],         purpose:"Conduct market research to validate startup hypotheses.", outcomes:["Design survey","Analyse 100 responses","Present market report"] },
  { code:"IIE-008", name:"E-Commerce & Digital Marketing",          domain:"IIE", level:"foundation",    pack:"Career Readiness Pack",  difficulty:"Beginner",     credits:8,  hours:10, badge:"Digital Marketer",    sdgs:[8,9],     ga:["Digital Literacy","Industry Exposure"],        purpose:"Build and market an e-commerce product online.", outcomes:["Create Shopify store","Run FB/Google ad","Analyse conversion rates"] },
  { code:"IIE-009", name:"Incubator Site Visit & Mentorship",       domain:"IIE", level:"foundation",    pack:"Innovation Pack",        difficulty:"Beginner",     credits:6,  hours:8,  badge:"Startup Explorer",    sdgs:[8,9,17],  ga:["Industry Exposure","Leadership"],             purpose:"Visit KLEF incubator, interact with startups and mentors.", outcomes:["Visit 2 incubators","Interview 3 founders","Write startup analysis"] },
  { code:"IIE-010", name:"Design Thinking for Innovation",          domain:"IIE", level:"explorer",      pack:"Innovation Pack",        difficulty:"Beginner",     credits:8,  hours:10, badge:"Design Thinker",      sdgs:[9],       ga:["Creativity & Innovation","Problem Solving"],  purpose:"Apply design thinking to identify and solve real problems.", outcomes:["Complete 5-stage DT process","Build low-fi prototype","Test with users"] },
  { code:"IIE-011", name:"Fintech & Future of Finance",             domain:"IIE", level:"practitioner",  pack:"Tech Frontier Pack",     difficulty:"Intermediate", credits:10, hours:12, badge:"Fintech Innovator",   sdgs:[8,10],    ga:["Domain Knowledge","Industry Exposure"],        purpose:"Explore financial technology innovations and their societal implications.", outcomes:["Analyse 3 fintech models","Build simple fintech prototype","Present demo"] },
  { code:"IIE-012", name:"Agri-Tech Startup Challenge",             domain:"IIE", level:"leader",        pack:"Innovation Pack",        difficulty:"Advanced",     credits:18, hours:22, badge:"Agri Innovator",      sdgs:[2,8,9],   ga:["Problem Solving","Global Awareness"],          purpose:"Build technology solutions for agricultural productivity and sustainability.", outcomes:["Identify agri problem","Build MVP","Pilot with farmers"] },
  { code:"IIE-013", name:"Growth Hacking & Viral Marketing",        domain:"IIE", level:"practitioner",  pack:"Career Readiness Pack",  difficulty:"Intermediate", credits:10, hours:12, badge:"Growth Hacker",       sdgs:[8],       ga:["Digital Literacy","Creativity & Innovation"], purpose:"Apply growth hacking tactics to scale a startup quickly.", outcomes:["Run A/B tests","Achieve 100 organic users","Present growth metrics"] },
  { code:"IIE-014", name:"Patent Filing Workshop",                  domain:"IIE", level:"leader",        pack:"Research Pack",          difficulty:"Advanced",     credits:12, hours:15, badge:"Patent Holder",        sdgs:[9,16],    ga:["Research Aptitude","Ethics & Values"],         purpose:"Understand the patent filing process and protect your innovations.", outcomes:["Draft provisional patent","File with IP India","Track status"] },
  { code:"IIE-015", name:"Innovation Bootcamp (48-Hour Hackathon)", domain:"IIE", level:"practitioner",  pack:"Innovation Pack",        difficulty:"Advanced",     credits:20, hours:48, badge:"Hackathon Champion",  sdgs:[9,17],    ga:["Problem Solving","Teamwork"],                 purpose:"Build a functional product in 48 hours during an intensive hackathon.", outcomes:["Form team","Build product","Win/present at demo day"] },
  { code:"IIE-016", name:"Sustainable Business Models",             domain:"IIE", level:"leader",        pack:"Global Citizenship Pack",difficulty:"Advanced",     credits:15, hours:18, badge:"Sustainability Leader",sdgs:[12,13,17],ga:["Ethics & Values","Global Awareness"],         purpose:"Design businesses that are profitable and environmentally sustainable.", outcomes:["Analyse B-Corp model","Design circular economy startup","Present to panel"] },
  { code:"IIE-017", name:"Women in Entrepreneurship Symposium",     domain:"IIE", level:"foundation",    pack:"Social Impact Pack",     difficulty:"Beginner",     credits:6,  hours:8,  badge:"WE Champion",         sdgs:[5,8,10],  ga:["Ethics & Values","Leadership"],               purpose:"Celebrate and enable women entrepreneurs through networking and mentorship.", outcomes:["Attend symposium","Interview 2 women founders","Write reflection"] },
  { code:"IIE-018", name:"Technology Commercialisation",            domain:"IIE", level:"mentor",        pack:"Innovation Pack",        difficulty:"Advanced",     credits:20, hours:25, badge:"Commercialiser",      sdgs:[8,9],     ga:["Industry Exposure","Research Aptitude"],       purpose:"Take a research output and create a viable commercial product.", outcomes:["Identify tech transfer opportunity","Build GTM strategy","Pitch to accelerator"] },
  { code:"IIE-019", name:"Customer Discovery Fieldwork",            domain:"IIE", level:"foundation",    pack:"Innovation Pack",        difficulty:"Beginner",     credits:8,  hours:10, badge:"Customer Champion",   sdgs:[8],       ga:["Communication","Research Aptitude"],           purpose:"Conduct in-depth customer interviews and validate product hypotheses.", outcomes:["Interview 20 customers","Map customer journey","Pivot product hypothesis"] },
  { code:"IIE-020", name:"MSME Support & Consulting",               domain:"IIE", level:"leader",        pack:"Social Impact Pack",     difficulty:"Advanced",     credits:18, hours:22, badge:"Business Consultant",  sdgs:[8,10],    ga:["Problem Solving","Industry Exposure"],         purpose:"Provide pro-bono consulting to MSMEs in the community.", outcomes:["Analyse 3 MSMEs","Present recommendations","Implement 1 solution"] },

  // HWB — Health & Well-being (20 activities)
  { code:"HWB-001", name:"Yoga & Mindfulness Certification",        domain:"HWB", level:"explorer",      pack:"Wellness Pack",          difficulty:"Beginner",     credits:8,  hours:10, badge:"Mindful Achiever",    sdgs:[3],       ga:["Ethics & Values","Adaptability"],             purpose:"Develop a regular yoga and mindfulness practice for holistic wellbeing.", outcomes:["Complete 20 sessions","Earn yoga certification","Teach 5 peers"] },
  { code:"HWB-002", name:"Mental Health First Aid",                 domain:"HWB", level:"foundation",    pack:"Wellness Pack",          difficulty:"Beginner",     credits:8,  hours:10, badge:"Mental Health Ally",  sdgs:[3],       ga:["Ethics & Values","Emotional Intelligence"],  purpose:"Identify signs of mental health challenges and provide initial support.", outcomes:["Get MHFA certified","Run 1 awareness session","Create peer support group"] },
  { code:"HWB-003", name:"Nutrition & Diet Planning",               domain:"HWB", level:"explorer",      pack:"Wellness Pack",          difficulty:"Beginner",     credits:5,  hours:6,  badge:"Nutrition Advocate",  sdgs:[2,3],     ga:["Ethics & Values","Domain Knowledge"],          purpose:"Understand nutrition science and create personalised diet plans.", outcomes:["Create 7-day diet plan","Analyse nutritional labels","Present diet workshop"] },
  { code:"HWB-004", name:"Sports Leadership & Fitness",             domain:"HWB", level:"practitioner",  pack:"Wellness Pack",          difficulty:"Intermediate", credits:12, hours:15, badge:"Sports Leader",        sdgs:[3],       ga:["Leadership","Teamwork"],                      purpose:"Lead a sports team or fitness programme on campus.", outcomes:["Organise 2 tournaments","Coach 10 members","Create fitness curriculum"] },
  { code:"HWB-005", name:"Stress Management Workshop",              domain:"HWB", level:"explorer",      pack:"Wellness Pack",          difficulty:"Beginner",     credits:5,  hours:6,  badge:"Stress Buster",       sdgs:[3],       ga:["Adaptability","Emotional Intelligence"],      purpose:"Learn evidence-based techniques for managing academic and social stress.", outcomes:["Learn 5 techniques","Run peer workshop","Create self-care plan"] },
  { code:"HWB-006", name:"Physical Fitness Assessment & Training",  domain:"HWB", level:"foundation",    pack:"Wellness Pack",          difficulty:"Beginner",     credits:8,  hours:10, badge:"Fitness Champion",    sdgs:[3],       ga:["Domain Knowledge","Adaptability"],            purpose:"Assess baseline fitness and follow a structured improvement programme.", outcomes:["Complete fitness test","Follow 8-week plan","Re-assess and compare"] },
  { code:"HWB-007", name:"Peer Counselling Training",               domain:"HWB", level:"practitioner",  pack:"Wellness Pack",          difficulty:"Intermediate", credits:12, hours:15, badge:"Peer Counsellor",     sdgs:[3,10],    ga:["Emotional Intelligence","Communication"],      purpose:"Train to provide empathetic peer support to students facing challenges.", outcomes:["Complete 30-hour training","Conduct 5 sessions","Maintain confidentiality logs"] },
  { code:"HWB-008", name:"Substance Abuse Awareness Campaign",      domain:"HWB", level:"foundation",    pack:"Wellness Pack",          difficulty:"Beginner",     credits:6,  hours:8,  badge:"Clear Thinker",       sdgs:[3,16],    ga:["Ethics & Values","Communication"],             purpose:"Raise awareness about substance abuse risks and build resilience strategies.", outcomes:["Reach 300 students","Create IEC materials","Partner with counselling centre"] },
  { code:"HWB-009", name:"Adaptive Sports for Inclusion",           domain:"HWB", level:"practitioner",  pack:"Social Impact Pack",     difficulty:"Intermediate", credits:10, hours:12, badge:"Inclusion Athlete",   sdgs:[3,10],    ga:["Ethics & Values","Global Awareness"],         purpose:"Organise adaptive sports events for students with disabilities.", outcomes:["Plan 1 event","Recruit 20 participants","Write inclusion impact report"] },
  { code:"HWB-010", name:"Sleep Science & Recovery",                domain:"HWB", level:"explorer",      pack:"Wellness Pack",          difficulty:"Beginner",     credits:4,  hours:5,  badge:"Rest Expert",         sdgs:[3],       ga:["Domain Knowledge","Adaptability"],            purpose:"Understand sleep science and optimise sleep for academic performance.", outcomes:["Track sleep for 30 days","Apply sleep hygiene","Present sleep study"] },
  { code:"HWB-011", name:"Emotional Intelligence in Leadership",    domain:"HWB", level:"leader",        pack:"Leadership Pack",        difficulty:"Advanced",     credits:15, hours:18, badge:"EQ Leader",           sdgs:[3,4],     ga:["Emotional Intelligence","Leadership"],         purpose:"Develop emotional intelligence as a core leadership competency.", outcomes:["Complete EQ assessment","Apply EQ in team leadership","Coach 3 peers"] },
  { code:"HWB-012", name:"Environmental Health Awareness",          domain:"HWB", level:"foundation",    pack:"Social Impact Pack",     difficulty:"Beginner",     credits:6,  hours:8,  badge:"Eco Health Champion", sdgs:[3,13,15], ga:["Ethics & Values","Global Awareness"],         purpose:"Connect environmental factors to community health outcomes.", outcomes:["Map local environmental health risks","Run 2 workshops","Present to faculty"] },
  { code:"HWB-013", name:"Health Tech Hackathon",                   domain:"HWB", level:"practitioner",  pack:"Innovation Pack",        difficulty:"Advanced",     credits:15, hours:20, badge:"Health Innovator",    sdgs:[3,9],     ga:["Problem Solving","Creativity & Innovation"],  purpose:"Build technology solutions for real health challenges.", outcomes:["Build health app prototype","Test with patients","Pitch to health NGOs"] },
  { code:"HWB-014", name:"Workplace Wellness Programme Design",     domain:"HWB", level:"leader",        pack:"Career Readiness Pack",  difficulty:"Advanced",     credits:12, hours:15, badge:"Wellness Designer",   sdgs:[3,8],     ga:["Problem Solving","Industry Exposure"],         purpose:"Design an evidence-based workplace wellness programme.", outcomes:["Research best practices","Design 12-week programme","Pilot with club team"] },
  { code:"HWB-015", name:"Community Mental Health Outreach",        domain:"HWB", level:"practitioner",  pack:"Social Impact Pack",     difficulty:"Intermediate", credits:12, hours:15, badge:"Community Healer",    sdgs:[3,10],    ga:["Ethics & Values","Communication"],             purpose:"Conduct mental health outreach in schools and community centres.", outcomes:["Run 5 sessions","Reach 200 individuals","Collect outcome data"] },
  { code:"HWB-016", name:"Ayurveda & Traditional Health Practices", domain:"HWB", level:"explorer",      pack:"Creative Arts Pack",     difficulty:"Beginner",     credits:5,  hours:6,  badge:"Heritage Healer",     sdgs:[3,11],    ga:["Ethics & Values","Global Awareness"],         purpose:"Explore traditional Indian health systems and their contemporary relevance.", outcomes:["Attend 3 Ayurveda sessions","Create wellness guide","Practise daily routine"] },
  { code:"HWB-017", name:"Marathon & Long-Distance Running",        domain:"HWB", level:"practitioner",  pack:"Wellness Pack",          difficulty:"Intermediate", credits:10, hours:30, badge:"Endurance Champion",  sdgs:[3],       ga:["Adaptability","Domain Knowledge"],            purpose:"Train for and complete a half-marathon (21km) event.", outcomes:["Follow 12-week plan","Complete half-marathon","Document training journey"] },
  { code:"HWB-018", name:"Nutrition for Athletes",                  domain:"HWB", level:"practitioner",  pack:"Wellness Pack",          difficulty:"Intermediate", credits:8,  hours:10, badge:"Sports Nutritionist",  sdgs:[2,3],     ga:["Domain Knowledge","Ethics & Values"],          purpose:"Apply sports nutrition principles to enhance athletic performance.", outcomes:["Create athlete meal plan","Track performance metrics","Present case study"] },
  { code:"HWB-019", name:"Suicide Prevention Awareness",            domain:"HWB", level:"foundation",    pack:"Wellness Pack",          difficulty:"Beginner",     credits:6,  hours:8,  badge:"Hope Keeper",         sdgs:[3],       ga:["Ethics & Values","Emotional Intelligence"],  purpose:"Build awareness and skills to support peers experiencing suicidal ideation.", outcomes:["Complete QPR certification","Organise awareness event","Create peer network"] },
  { code:"HWB-020", name:"Holistic Wellness Leadership",            domain:"HWB", level:"innovator",     pack:"Leadership Pack",        difficulty:"Advanced",     credits:25, hours:30, badge:"Wellness Innovator",  sdgs:[3,4,17],  ga:["Leadership","Global Awareness"],              purpose:"Design and lead a campus-wide holistic wellness initiative.", outcomes:["Build wellness team","Run semester-long initiative","Present at national conference"] },
];

// ─── Enrich templates with additional fields ───────────────────────────────────
export const ACTIVITIES = activityTemplates.map((a, idx) => ({
  ...a,
  id: idx + 1,
  semester: ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"][idx % 8],
  faculty: FACULTIES[idx % FACULTIES.length],
  career: [
    ["Placement","Higher Education"][idx % 2],
    ["Entrepreneurship","Research & Development"][idx % 2],
  ],
  nationalMission: NATIONAL_MISSIONS[idx % NATIONAL_MISSIONS.length],
  competencies: COMPETENCIES_LIST.slice(idx % 5, (idx % 5) + 3),
  image: null,
  maxEnrollment: 30 + (idx % 5) * 10,
  enrolledCount: Math.floor(Math.random() * 30),
  rating: (3.5 + (idx % 15) / 10).toFixed(1),
  // Mocked user-specific data
  userStatus: ["not_enrolled","registered","ongoing","completed","pending_review","archived"][idx % 6],
  userProgress: [0, 20, 45, 100, 100, 0][idx % 6],
  userAttendance: [0, 60, 75, 90, 100, 0][idx % 6],
  certificateReady: idx % 6 === 4,
  badgeEarned: idx % 6 === 3 || idx % 6 === 4,
  credits_earned: idx % 6 >= 3 ? a.credits : 0,
  submittedOn: idx % 6 === 4 ? "2025-06-15" : null,
  facultyFeedback: idx % 6 === 3 || idx % 6 === 4
    ? "Excellent participation and reflection. Demonstrated strong commitment to the learning outcomes."
    : null,
  reflection: idx % 6 === 3
    ? "This activity transformed my perspective on the subject. I learned to collaborate with people from different backgrounds and apply theoretical knowledge to real scenarios."
    : null,
  timeline: [
    { date: "2025-07-01", event: "Activity announced" },
    { date: "2025-07-05", event: "Registration opens" },
    { date: "2025-07-15", event: "Registration closes" },
    { date: "2025-07-20", event: "Activity begins" },
    { date: `2025-0${7 + (idx % 3)}-${20 + (idx % 8)}`, event: "Activity concludes" },
    { date: `2025-0${8 + (idx % 2)}-0${1 + (idx % 9)}`, event: "Certificates issued" },
  ],
  assignments: [
    { id: 1, title: "Pre-Activity Reflection", dueDate: "2025-07-18", submitted: idx % 3 !== 0, grade: idx % 3 === 1 ? "A" : null },
    { id: 2, title: "Mid-Activity Report", dueDate: "2025-07-25", submitted: idx % 6 >= 3, grade: idx % 6 === 3 ? "A+" : null },
    { id: 3, title: "Final Submission", dueDate: "2025-08-05", submitted: idx % 6 === 4, grade: idx % 6 === 4 ? "A" : null },
  ],
  resources: [
    { id: 1, type: "pdf",   title: "Activity Handbook", url: "#" },
    { id: 2, type: "video", title: "Intro Video",        url: "#" },
    { id: 3, type: "link",  title: "Reading Material",   url: "#" },
  ],
}));

// ─── Journey stage data with activities mapped ────────────────────────────────
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
