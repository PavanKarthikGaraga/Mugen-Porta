import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser, canAccessUsername, safeMessage } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

// ─── Score formula ────────────────────────────────────────────────────────────
// Progression: 1 act→18%, 2→32%, 3→44%, 4→55%, 5→64%, badges boost +15% each.
// Capped at 100%.
function deriveScore(activityCount: number, badgeCount: number): number {
    if (activityCount === 0 && badgeCount === 0) return 0;
    const actScore = Math.round((1 - Math.pow(0.82, activityCount)) * 100);
    return Math.min(100, actScore + badgeCount * 15);
}

function levelFor(score: number): string {
    if (score >= 90) return 'Innovator';
    if (score >= 75) return 'Mentor';
    if (score >= 60) return 'Leader';
    if (score >= 40) return 'Practitioner';
    if (score >= 20) return 'Foundation';
    return 'Explorer';
}

function norm(s: string): string {
    return String(s || '')
        .toLowerCase()
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function safeJsonArray(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    if (typeof val === 'string') {
        try {
            const p = JSON.parse(val);
            return Array.isArray(p) ? p.map(String) : [];
        } catch { return []; }
    }
    return [];
}

// ─── Category definitions ─────────────────────────────────────────────────────
const CATEGORIES: { id: string; title: string; description: string; color: string; keywords: RegExp }[] = [
    {
        id: 'technical',
        title: 'Technical Skills',
        description: 'Engineering, software, data, cloud, and applied technology competencies built through hands-on activities.',
        color: '#2563EB',
        keywords: /\b(ai|ml|machine learning|deep learning|data|cloud|iot|web|frontend|backend|software|code|coding|programming|devops|kubernetes|docker|api|database|sql|python|javascript|network|security|cyber|embedded|hardware|firmware|iot|algorithm|system|architecture|blockchain|quantum|automation|analytics|robotics|drone|satellite|bioinformatics|genomics|cad|cam|cnc|gis|remote sensing|signal|circuit|embedded|microcontroller|soc|fpga|iot)\b/i,
    },
    {
        id: 'professional',
        title: 'Professional Skills',
        description: 'Workplace readiness, communication, and collaboration skills that make you effective in any career.',
        color: '#059669',
        keywords: /\b(communication|teamwork|collaboration|presentation|stakeholder|interview|resume|career|employability|professionalism|documentation|reporting|writing|public speaking|negotiation|networking|client|customer|professional|work|workplace)\b/i,
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
        keywords: /\b(research|methodology|analysis|analytical|scientific|academic|publication|statistics|data collection|survey|hypothesis|evidence|field research|literature|laboratory|biology|biotech|genomics|clinical|medical|health data|epidemiology)\b/i,
    },
    {
        id: 'innovation',
        title: 'Innovation & Entrepreneurship',
        description: 'Creative problem-solving, product design, startup thinking, and turning ideas into impact.',
        color: '#DC2626',
        keywords: /\b(entrepreneurship|startup|innovation|design thinking|product|prototyping|venture|ideation|pitching|mvp|business model|market|customer discovery|social entrepreneur|fintech|edtech|healthtech|agritech|deep tech|commercializ|incubat)\b/i,
    },
    {
        id: 'social',
        title: 'Social Impact & Values',
        description: 'Community engagement, sustainability, inclusion, ethics, and responsible citizenship.',
        color: '#0891B2',
        keywords: /\b(community|social|outreach|sustainability|environment|inclusion|diversity|equity|empathy|volunteering|ngo|civic|public health|sdg|ethics|responsibility|resilience|climate|conservation|disaster|welfare|awareness|advocacy)\b/i,
    },
];

function categoriseCompetency(name: string): string {
    const n = norm(name);
    for (const cat of CATEGORIES) {
        if (cat.keywords.test(n)) return cat.id;
    }
    return 'professional'; // fallback
}

const MAX_SUGGESTIONS = 5;

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;
        if (!username) return NextResponse.json({ message: 'Username is required' }, { status: 400 });

        const sessionUser = await getSessionUser();
        if (!sessionUser) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        if (!canAccessUsername(sessionUser, username, ['admin', 'faculty', 'lead'])) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // ── 1. Catalogue: all active activities with competencies ──────────────
        const [catRows]: any = await pool.execute(
            `SELECT code, title, category, domain, sdc_credits, difficulty, competencies
             FROM activity_catalogue
             WHERE competencies IS NOT NULL AND approval_status IN ('active', 'pending_approval')
             ORDER BY sdc_credits DESC`
        ).catch(() => [[]]);

        // Build: competency name → list of activities that develop it
        const catalogueIndex = new Map<string, { code: string; title: string; domain: string | null; credits: number | null; difficulty: string | null }[]>();
        for (const r of catRows) {
            for (const raw of safeJsonArray(r.competencies)) {
                const key = norm(raw);
                if (!key) continue;
                if (!catalogueIndex.has(key)) catalogueIndex.set(key, []);
                catalogueIndex.get(key)!.push({
                    code: r.code,
                    title: r.title,
                    domain: r.domain || r.category || null,
                    credits: r.sdc_credits ?? null,
                    difficulty: r.difficulty || null,
                });
            }
        }

        // ── 2. Student evidence: completed activities + all enrollments ────────
        const [enrollRows]: any = await pool.execute(
            `SELECT ac.code, ac.title, ac.competencies, ac.domain, ae.status, ae.enrolled_at
             FROM activity_enrollments ae
             JOIN activity_catalogue ac ON ae.activity_code = ac.code
             WHERE ae.username = ?`,
            [username]
        ).catch(() => [[]]);

        const enrolledCodes = new Set<string>();
        // Map: normalised comp name → evidence list
        const evidenceMap = new Map<string, { title: string; type: string; code: string; date: string | null }[]>();

        for (const r of enrollRows) {
            enrolledCodes.add(r.code);
            if (r.status !== 'completed') continue;
            for (const raw of safeJsonArray(r.competencies)) {
                const key = norm(raw);
                if (!key) continue;
                if (!evidenceMap.has(key)) evidenceMap.set(key, []);
                const list = evidenceMap.get(key)!;
                if (!list.some(e => e.title === r.title)) {
                    list.push({ title: r.title, type: 'activity', code: r.code, date: r.enrolled_at ? new Date(r.enrolled_at).toISOString() : null });
                }
            }
        }

        // ── 3. Badge evidence ─────────────────────────────────────────────────
        const [badgeRows]: any = await pool.execute(
            `SELECT bd.name, bd.code, bd.competencies, sb.issued_on
             FROM student_badges sb
             JOIN badge_definitions bd ON sb.badge_id = bd.id
             WHERE sb.username = ?`,
            [username]
        ).catch(() => [[]]);

        for (const r of badgeRows) {
            for (const raw of safeJsonArray(r.competencies)) {
                const key = norm(raw);
                if (!key) continue;
                if (!evidenceMap.has(key)) evidenceMap.set(key, []);
                const list = evidenceMap.get(key)!;
                if (!list.some(e => e.title === r.name)) {
                    list.push({ title: r.name, type: 'badge', code: r.code || null, date: r.issued_on ? new Date(r.issued_on).toISOString() : null });
                }
            }
        }

        // ── 4. Check for admin-recorded scores (override when present) ────────
        let recordedScores = new Map<number, { score: number; trend: number; level: string }>();
        try {
            const [recRows]: any = await pool.execute(
                `SELECT cd.name, sc.score, sc.trend, sc.level
                 FROM student_competencies sc
                 JOIN competency_definitions cd ON sc.competency_id = cd.id
                 WHERE sc.username = ? AND sc.score > 0`,
                [username]
            );
            for (const r of recRows) {
                const key = norm(r.name);
                recordedScores.set(key as any, { score: Number(r.score), trend: r.trend || 0, level: r.level || levelFor(Number(r.score)) });
            }
        } catch { /* table might not exist — fine, use derived */ }

        // ── 5. Build the full competency set from the catalogue ───────────────
        // All competency names that exist in the catalogue (these are the "possible" competencies)
        const allCompNames = new Set<string>();
        for (const key of catalogueIndex.keys()) allCompNames.add(key);
        // Also add any the student has evidence for (even if no catalogue activity)
        for (const key of evidenceMap.keys()) allCompNames.add(key);

        // ── 6. Group into categories ──────────────────────────────────────────
        const catMap: Record<string, { id: string; title: string; description: string; competencies: any[] }> = {};
        for (const cat of CATEGORIES) {
            catMap[cat.id] = { id: cat.id, title: cat.title, description: cat.description, competencies: [] };
        }

        for (const normName of allCompNames) {
            const catId = categoriseCompetency(normName);
            const evidence = evidenceMap.get(normName) || [];
            const activityCount = evidence.filter(e => e.type === 'activity').length;
            const badgeCount = evidence.filter(e => e.type === 'badge').length;

            const recorded = (recordedScores as any).get(normName);
            const score = recorded ? recorded.score : deriveScore(activityCount, badgeCount);

            const allCatActivities = catalogueIndex.get(normName) || [];
            const suggestions = allCatActivities
                .filter(a => !enrolledCodes.has(a.code))
                .slice(0, MAX_SUGGESTIONS);

            // Display name: restore title-case from the original name
            // Pick the original casing from catalogue or evidence
            const displayName = (() => {
                // Try to find original casing from catalogue
                for (const r of catRows) {
                    for (const raw of safeJsonArray(r.competencies)) {
                        if (norm(raw) === normName) return raw;
                    }
                }
                return normName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            })();

            catMap[catId].competencies.push({
                id: normName,
                name: displayName,
                score,
                scoreSource: recorded ? 'recorded' : 'derived',
                trend: recorded?.trend || 0,
                level: recorded?.level || levelFor(score),
                color: CATEGORIES.find(c => c.id === catId)?.color || '#6b7280',
                evidence,
                activityCount,
                badgeCount,
                opportunityCount: allCatActivities.length,
                suggestions,
            });
        }

        // Sort each category: scored first (desc), then alphabetical
        for (const cat of Object.values(catMap)) {
            cat.competencies.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.name.localeCompare(b.name);
            });
            // Limit 0-score entries: keep only top 8 by opportunityCount so we
            // don't return 300+ empty competencies for a student with no activity history.
            const scored = cat.competencies.filter((c: any) => c.score > 0);
            const opportunities = cat.competencies
                .filter((c: any) => c.score === 0 && c.opportunityCount > 0)
                .sort((a: any, b: any) => b.opportunityCount - a.opportunityCount)
                .slice(0, 8)
                .map((c: any) => ({ ...c, isOpportunity: true }));
            cat.competencies = [...scored, ...opportunities];
        }

        // Only return categories that have at least one competency
        const result = Object.values(catMap).filter(c => c.competencies.length > 0);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Competencies GET error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch competencies') }, { status: 500 });
    }
}
