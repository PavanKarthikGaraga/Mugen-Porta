/**
 * Competency categorisation, shared by the Competencies page API and the
 * student overview.
 *
 * Activities and badges store competencies as free text ("Safety awareness
 * skills", "Team participation skills") rather than as foreign keys into
 * competency_definitions. Anything that renders a student's competencies
 * therefore has to bucket those strings by keyword. This lives in one place
 * so the overview and the Competencies page can't drift apart on either the
 * category list or the matching rules.
 */

export interface CompetencyCategory {
    id: string;
    title: string;
    description: string;
    color: string;
    keywords: RegExp;
}

export const COMPETENCY_CATEGORIES: CompetencyCategory[] = [
    {
        id: 'technical',
        title: 'Technical Skills',
        description: 'Engineering, software, data, cloud, and applied technology competencies built through hands-on activities.',
        color: '#2563EB',
        keywords: /\b(ai|ml|machine learning|deep learning|data|cloud|iot|web|frontend|backend|software|code|coding|programming|devops|kubernetes|docker|api|database|sql|python|javascript|network|security|cyber|embedded|hardware|firmware|algorithm|system|architecture|blockchain|quantum|automation|analytics|robotics|drone|satellite|bioinformatics|genomics|cad|cam|cnc|gis|remote sensing|signal|circuit|microcontroller|soc|fpga)\b/i,
    },
    {
        id: 'professional',
        title: 'Professional Skills',
        description: 'Workplace readiness, communication, and collaboration skills that make you effective in any career.',
        color: '#059669',
        keywords: /\b(communication|teamwork|collaboration|presentation|stakeholder|interview|resume|career|employability|professionalism|documentation|reporting|writing|public speaking|negotiation|networking|client|customer|professional|work|workplace|participation)\b/i,
    },
    {
        id: 'leadership',
        title: 'Leadership & Management',
        description: 'Guiding teams, managing projects, driving decisions, and creating organisational impact.',
        color: '#D97706',
        keywords: /\b(leadership|management|project management|strategic|governance|decision|team lead|coordination|planning|vision|mentor|coaching|organizational|change management|agile|scrum|programme|program|operations)\b/i,
    },
    {
        id: 'research',
        title: 'Research & Analysis',
        description: 'Academic inquiry, scientific methodology, critical analysis, and knowledge creation.',
        color: '#7C3AED',
        keywords: /\b(research|methodology|analysis|analytical|scientific|academic|publication|statistics|data collection|survey|hypothesis|evidence|field research|literature|laboratory|biology|biotech|genomics|clinical|medical|health data|epidemiology|identification|assessment)\b/i,
    },
    {
        id: 'innovation',
        title: 'Innovation & Entrepreneurship',
        description: 'Creative problem-solving, product design, startup thinking, and turning ideas into impact.',
        color: '#DC2626',
        keywords: /\b(entrepreneurship|startup|innovation|design thinking|product|prototyping|venture|ideation|pitching|mvp|business model|market|customer discovery|social entrepreneur|fintech|edtech|healthtech|agritech|deep tech|commercializ|incubat|creativity)\b/i,
    },
    {
        id: 'social',
        title: 'Social Impact & Values',
        description: 'Community engagement, sustainability, inclusion, ethics, and responsible citizenship.',
        color: '#0891B2',
        keywords: /\b(community|social|outreach|sustainability|environment|inclusion|diversity|equity|empathy|volunteering|ngo|civic|public health|sdg|ethics|responsibility|resilience|climate|conservation|disaster|welfare|awareness|advocacy|safety|first aid|risk|emergency|wellbeing|well-being|health)\b/i,
    },
];

/** Normalise a competency name for comparison: trimmed, collapsed, lowercased. */
export function normaliseCompetency(name: any): string {
    return String(name ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function categoriseCompetency(name: string): string {
    const n = normaliseCompetency(name);
    for (const cat of COMPETENCY_CATEGORIES) {
        if (cat.keywords.test(n)) return cat.id;
    }
    return 'professional'; // fallback
}

export function categoryMeta(id: string): CompetencyCategory {
    return COMPETENCY_CATEGORIES.find(c => c.id === id) ?? COMPETENCY_CATEGORIES[1];
}

/** Title-case a free-text competency for display ("safety awareness" → "Safety Awareness"). */
export function displayCompetencyName(name: string): string {
    return normaliseCompetency(name)
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}
