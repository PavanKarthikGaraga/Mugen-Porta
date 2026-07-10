export interface Competency {
  id: string;
  name: string;
  score: number;
  trend: number;
  evidence: number;
  level: "Foundation" | "Explorer" | "Practitioner" | "Leader" | "Innovator";
}

export interface CompetencyCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  competencies: Competency[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  bg: string;
  color: string;
  domain: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  description: string;
  earnedFrom: string;
  issuedOn: string;
  competencies: string[];
  verificationId: string;
  shareUrl: string;
}

export interface LockedBadge {
  id: string;
  name: string;
  icon: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  requirement: string;
}

export interface Project {
  id: string;
  name: string;
  status: "Ongoing" | "Completed" | "Under Review" | "Published";
  year: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
}

export interface Internship {
  id: string;
  role: string;
  company: string;
  location: string;
  duration: string;
  description: string;
  skills: string[];
}

export interface Research {
  id: string;
  title: string;
  journal: string;
  coAuthors: string[];
  year: string;
  status: "Published" | "Under Review";
}

export interface LeadershipRole {
  id: string;
  role: string;
  org: string;
  year: string;
  impact: string;
}

export interface CommunityService {
  id: string;
  activity: string;
  hours: number;
  impact: string;
}

export interface Achievement {
  id: string;
  title: string;
  org: string;
  year: string;
  icon: string;
}

export interface TimelineEvent {
  year: string;
  events: string[];
}

export interface Passport {
  about: string;
  tagline: string;
  links: {
    github: string;
    linkedin: string;
    portfolio: string;
  };
  academic: {
    institution: string;
    degree: string;
    cgpa: string;
    year: string;
    rollNo: string;
    campus: string;
  };
  projects: Project[];
  internships: Internship[];
  research: Research[];
  leadership: LeadershipRole[];
  community: CommunityService[];
  achievements: Achievement[];
  timeline: TimelineEvent[];
}

export interface CertificationRecommendation {
  name: string;
  provider: string;
  timeMonths: number;
  priority: "Critical" | "High" | "Medium";
}

export interface RoadmapStep {
  milestone: string;
  status: "done" | "active" | "upcoming";
  dueMonths: number;
}

export interface CareerPath {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  description: string;
  readinessScore: number;
  keyCompetencies: {
    name: string;
    required: number;
    current: number;
    gap: number;
  }[];
  missingCompetencies: string[];
  recommendedCertifications: CertificationRecommendation[];
  roadmap: RoadmapStep[];
  activities: string[];
}
