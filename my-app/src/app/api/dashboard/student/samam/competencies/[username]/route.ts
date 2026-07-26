import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser, canAccessUsername, safeMessage } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

/**
 * Competency profile for a student.
 *
 * Scores come from student_competencies when an administrator has recorded
 * one. Nothing in the application currently writes to that table, so for
 * virtually every student it is empty — which previously left this page
 * showing 0% across the board with no way for it to ever change.
 *
 * So when there is no recorded score, one is derived from evidence the
 * student has actually accumulated: completed activities and earned badges
 * whose own `competencies` list names that competency. Derived scores are
 * flagged as such and returned alongside the evidence they were computed
 * from, so the number is always explainable rather than arbitrary.
 *
 * Each competency also carries the catalogue activities that develop it,
 * which turns the page from a read-only report into something actionable.
 */

const POINTS_PER_ACTIVITY = 20;
const POINTS_PER_BADGE = 25;
const MAX_SUGGESTIONS = 4;

function safeJsonArray(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch { return []; }
    }
    return [];
}

const norm = (s: string) => String(s || '').trim().toLowerCase();

function levelFor(score: number) {
    if (score >= 90) return 'Innovator';
    if (score >= 75) return 'Mentor';
    if (score >= 60) return 'Leader';
    if (score >= 40) return 'Practitioner';
    if (score >= 20) return 'Foundation';
    return 'Explorer';
}

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;
        if (!username) return NextResponse.json({ message: "Username is required" }, { status: 400 });

        const sessionUser = await getSessionUser();
        if (!sessionUser) return NextResponse.json({ message: "Authentication required" }, { status: 401 });
        if (!canAccessUsername(sessionUser, username, ['admin', 'faculty', 'lead'])) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const [rows] = await pool.execute(`
            SELECT
                cd.id as comp_id, cd.name, cd.category_id, cd.category_name,
                cd.color, cd.sort_order,
                sc.score, sc.trend, sc.level
            FROM competency_definitions cd
            LEFT JOIN student_competencies sc
                ON cd.id = sc.competency_id AND sc.username = ?
            WHERE cd.is_active = 1
            ORDER BY cd.category_id, cd.sort_order
        `, [username]) as any[];

        const { evidenceByName, enrolledCodes } = await getEvidence(username);
        const catalogueByName = await getCatalogueIndex();

        const categoriesMap: Record<string, any> = {};

        rows.forEach(row => {
            const catId = row.category_id;
            if (!categoriesMap[catId]) {
                categoriesMap[catId] = {
                    id: catId,
                    title: row.category_name,
                    description: getCategoryDescription(catId),
                    competencies: []
                };
            }

            const key = norm(row.name);
            const evidence = evidenceByName.get(key) || [];

            const activityCount = evidence.filter((e) => e.type === 'activity').length;
            const badgeCount = evidence.filter((e) => e.type === 'badge').length;

            const recorded = Number(row.score) > 0 ? Number(row.score) : null;
            const derived = Math.min(
                100,
                activityCount * POINTS_PER_ACTIVITY + badgeCount * POINTS_PER_BADGE
            );
            const score = recorded ?? derived;

            // Catalogue activities that build this competency but which the
            // student has not enrolled in — the concrete "what do I do next".
            const all = catalogueByName.get(key) || [];
            const suggestions = all
                .filter((a) => !enrolledCodes.has(a.code))
                .slice(0, MAX_SUGGESTIONS);

            categoriesMap[catId].competencies.push({
                id: row.comp_id,
                name: row.name,
                score,
                scoreSource: recorded != null ? 'recorded' : 'derived',
                trend: row.trend || 0,
                level: recorded != null ? (row.level || levelFor(score)) : levelFor(score),
                color: row.color,
                evidence,
                activityCount,
                badgeCount,
                opportunityCount: all.length,
                suggestions,
            });
        });

        return NextResponse.json(Object.values(categoriesMap));

    } catch (error: any) {
        console.error('Database error fetching competencies:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch competencies') }, { status: 500 });
    }
}

/**
 * Evidence the student has actually earned, keyed by normalised competency
 * name, plus every activity code they're enrolled in (so suggestions never
 * recommend something they're already doing).
 */
async function getEvidence(username: string) {
    const evidenceByName = new Map<string, { title: string; type: string; code: string | null; date: string | null }[]>();
    const enrolledCodes = new Set<string>();

    const add = (names: string[], entry: any) => {
        for (const raw of names) {
            const key = norm(raw);
            if (!key) continue;
            if (!evidenceByName.has(key)) evidenceByName.set(key, []);
            const list = evidenceByName.get(key)!;
            if (!list.some((e) => e.title === entry.title)) list.push(entry);
        }
    };

    try {
        const [rows]: any = await pool.execute(
            `SELECT ac.code, ac.title, ac.competencies, ae.status, ae.enrolled_at
             FROM activity_enrollments ae
             JOIN activity_catalogue ac ON ae.activity_code = ac.code
             WHERE ae.username = ?`,
            [username]
        );
        for (const r of rows) {
            enrolledCodes.add(r.code);
            if (r.status !== 'completed') continue;
            add(safeJsonArray(r.competencies), {
                title: r.title, type: 'activity', code: r.code,
                date: r.enrolled_at ? new Date(r.enrolled_at).toISOString() : null,
            });
        }
    } catch { /* table unavailable — degrade to no evidence */ }

    try {
        const [rows]: any = await pool.execute(
            `SELECT bd.name, bd.code, bd.competencies, sb.issued_on
             FROM student_badges sb
             JOIN badge_definitions bd ON sb.badge_id = bd.id
             WHERE sb.username = ?`,
            [username]
        );
        for (const r of rows) {
            add(safeJsonArray(r.competencies), {
                title: r.name, type: 'badge', code: r.code || null,
                date: r.issued_on ? new Date(r.issued_on).toISOString() : null,
            });
        }
    } catch { /* badge tables unavailable */ }

    return { evidenceByName, enrolledCodes };
}

/** Catalogue activities indexed by each competency they claim to develop. */
async function getCatalogueIndex() {
    const index = new Map<string, { code: string; title: string; domain: string | null; credits: number | null }[]>();
    try {
        const [rows]: any = await pool.execute(
            `SELECT code, title, category, sdc_credits, competencies
             FROM activity_catalogue WHERE competencies IS NOT NULL`
        );
        for (const r of rows) {
            const entry = { code: r.code, title: r.title, domain: r.category || null, credits: r.sdc_credits ?? null };
            for (const raw of safeJsonArray(r.competencies)) {
                const key = norm(raw);
                if (!key) continue;
                if (!index.has(key)) index.set(key, []);
                index.get(key)!.push(entry);
            }
        }
    } catch { /* catalogue unavailable — no suggestions */ }
    return index;
}

function getCategoryDescription(catId: string) {
    const desc: Record<string, string> = {
        'technical': 'Core engineering and technical skills',
        'professional': 'Workplace readiness and soft skills',
        'leadership': 'Guiding teams and driving impact',
        'research': 'Academic inquiry and analysis',
        'innovation': 'Creative problem solving and ventures',
        'personal': 'Self-awareness and emotional intelligence'
    };
    return desc[catId] || '';
}
