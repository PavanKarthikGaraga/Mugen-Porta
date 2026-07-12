import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return null;
    return decoded;
}

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        if (!await checkAdmin()) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { username } = await params;

        const [profileRows, sdcRows, badgeRows, competencyRows] = await Promise.all([
            // Full profile + student info
            pool.execute(`
                SELECT s.username, s.name, s.email, s.branch, s.year, s.gender, s.residenceType, c.name as clubName,
                       sp.level, sp.level_progress, sp.next_level, sp.career_choice, sp.cgpa, sp.tagline, sp.about
                FROM students s
                LEFT JOIN student_profiles sp ON s.username = sp.username
                LEFT JOIN clubs c ON s.clubId = c.id
                WHERE s.username = ?
            `, [username]),

            // SDC / points history
            pool.execute(`
                SELECT t.id, t.credits as points, t.domain, t.category, t.description,
                       t.granted_at, t.granted_by,
                       COALESCE(a.title, t.description) as activity_title
                FROM sdc_transactions t
                LEFT JOIN student_activities a ON t.activity_id = a.id
                WHERE t.username = ?
                ORDER BY t.granted_at DESC
                LIMIT 50
            `, [username]),

            // Badges
            pool.execute(`
                SELECT sb.id, sb.issued_on, sb.earned_from, sb.verification_id,
                       bd.name, bd.icon, bd.domain, bd.rarity, bd.color, bd.bg_color, bd.description
                FROM student_badges sb
                JOIN badge_definitions bd ON sb.badge_id = bd.id
                WHERE sb.username = ?
                ORDER BY sb.issued_on DESC
            `, [username]),

            // Competencies
            pool.execute(`
                SELECT cd.name, cd.category_name, sc.score, sc.level, sc.trend
                FROM student_competencies sc
                JOIN competency_definitions cd ON sc.competency_id = cd.id
                WHERE sc.username = ?
                ORDER BY cd.category_id, cd.sort_order
            `, [username]),
        ]) as any[];

        const profile = (profileRows[0] as any[])[0];
        if (!profile) return NextResponse.json({ message: 'Student not found' }, { status: 404 });

        // Aggregate stats
        const sdcList = sdcRows[0] as any[];
        const totalPoints = sdcList.reduce((sum: number, r: any) => sum + Number(r.points), 0);

        const domainBreakdown: Record<string, number> = {};
        sdcList.forEach((r: any) => {
            domainBreakdown[r.domain] = (domainBreakdown[r.domain] || 0) + Number(r.points);
        });

        return NextResponse.json({
            profile: {
                ...profile,
                totalPoints,
                badgeCount: (badgeRows[0] as any[]).length,
            },
            sdcHistory: sdcList,
            domainBreakdown,
            badges: badgeRows[0],
            competencies: competencyRows[0],
        });

    } catch (error: any) {
        console.error('SAMAM student detail error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
