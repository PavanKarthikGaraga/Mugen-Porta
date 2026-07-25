import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser, canAccessUsername, safeMessage } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;
        if (!username) return NextResponse.json({ message: "Username is required" }, { status: 400 });

        const sessionUser = await getSessionUser();
        if (!sessionUser) return NextResponse.json({ message: "Authentication required" }, { status: 401 });
        if (!canAccessUsername(sessionUser, username, ['admin', 'faculty', 'lead'])) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Fetch all definitions joined with student scores
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

        // Real evidence: completed activities + earned badges, matched against
        // each competency's name via the free-text `competencies` JSON arrays
        // stored on activity_catalogue and badge_definitions. This replaces the
        // old hardcoded mock evidence with data actually earned by the student.
        const evidenceByCompetency = await getRealEvidence(username);

        // Group by category
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

            const normalizedName = String(row.name || '').trim().toLowerCase();

            categoriesMap[catId].competencies.push({
                id: row.comp_id,
                name: row.name,
                score: row.score || 0,
                trend: row.trend || 0,
                level: row.level || 'Explorer',
                color: row.color,
                evidence: evidenceByCompetency.get(normalizedName) || []
            });
        });

        // Convert map to array
        const categories = Object.values(categoriesMap);

        return NextResponse.json(categories);

    } catch (error: any) {
        console.error('Database error fetching competencies:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch competencies') }, { status: 500 });
    }
}

function safeJsonArray(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch {
            return [];
        }
    }
    return [];
}

// Builds a map of normalized-competency-name -> evidence[] from the
// student's actually-completed activities and actually-earned badges,
// so the Competencies page can show real proof of growth instead of
// invented examples.
async function getRealEvidence(username: string): Promise<Map<string, { title: string; type: string; code: string | null }[]>> {
    const map = new Map<string, { title: string; type: string; code: string | null }[]>();

    const addEvidence = (competencyNames: string[], entry: { title: string; type: string; code: string | null }) => {
        for (const rawName of competencyNames) {
            const key = String(rawName).trim().toLowerCase();
            if (!key) continue;
            if (!map.has(key)) map.set(key, []);
            const list = map.get(key)!;
            if (list.length < 6 && !list.some((e) => e.title === entry.title)) list.push(entry);
        }
    };

    try {
        const [activityRows]: any = await pool.execute(
            `SELECT ac.code, ac.title, ac.competencies
             FROM activity_enrollments ae
             JOIN activity_catalogue ac ON ae.activity_code = ac.code
             WHERE ae.username = ? AND ae.status = 'completed'`,
            [username]
        );
        for (const row of activityRows) {
            const names = safeJsonArray(row.competencies);
            if (names.length) addEvidence(names, { title: row.title, type: 'activity', code: row.code });
        }
    } catch {
        // activity_enrollments / activity_catalogue.competencies unavailable — skip gracefully
    }

    try {
        const [badgeRows]: any = await pool.execute(
            `SELECT bd.name, bd.code, bd.competencies
             FROM student_badges sb
             JOIN badge_definitions bd ON sb.badge_id = bd.id
             WHERE sb.username = ?`,
            [username]
        );
        for (const row of badgeRows) {
            const names = safeJsonArray(row.competencies);
            if (names.length) addEvidence(names, { title: row.name, type: 'badge', code: row.code || null });
        }
    } catch {
        // badge tables unavailable — skip gracefully
    }

    return map;
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
