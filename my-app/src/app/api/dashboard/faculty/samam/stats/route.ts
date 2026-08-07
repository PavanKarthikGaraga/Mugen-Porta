import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';

async function getFacultyClubs(username: string): Promise<string[]> {
    const [rows]: any = await pool.execute(
        'SELECT assignedClubs FROM faculty WHERE username = ?',
        [username]
    );
    if (!rows.length) return [];
    const raw = rows[0].assignedClubs;
    if (!raw) return [];
    const parsed = Array.isArray(raw) ? raw : JSON.parse(raw);
    return parsed.filter(Boolean).map(String);
}

export async function GET() {
    const auth = await requireAuth(['faculty']);
    if (auth.response) return auth.response;
    const username = auth.user.username as string;

    try {
        const clubIds = await getFacultyClubs(username);
        if (!clubIds.length) {
            return NextResponse.json({
                activeSamamStudents: 0,
                activitiesCompleted: 0,
                uniqueBadgesDistributed: 0,
                topClub: null,
                topClubCredits: 0,
                levelBreakdown: [],
                domainSdcBreakdown: [],
                recentBadges: [],
                topSdcStudents: [],
            });
        }

        const ph = clubIds.map(() => '?').join(',');

        const [
            activeStudentsResult,
            activitiesCompletedResult,
            badgesResult,
            topClubResult,
            levelBreakdownResult,
            domainSdcResult,
            recentBadgesResult,
            topStudentsResult,
        ] = await Promise.all([
            // Active SAMAM students in faculty's clubs
            pool.execute(
                `SELECT COUNT(*) as count FROM students WHERE clubId IN (${ph}) AND samam_access = 1`,
                clubIds
            ),

            // Activities completed = distinct activities where attendance was locked
            // for at least one student belonging to faculty's clubs
            pool.execute(
                `SELECT COUNT(DISTINCT ae.activity_code) as total
                 FROM activity_enrollments ae
                 JOIN students s ON ae.username = s.username
                 WHERE ae.attendance_marked = TRUE AND s.clubId IN (${ph})`,
                clubIds
            ),

            // Unique badge definitions distributed to students in faculty's clubs
            pool.execute(
                `SELECT COUNT(DISTINCT sb.badge_id) as unique_badges
                 FROM student_badges sb
                 JOIN students s ON sb.username = s.username
                 WHERE s.clubId IN (${ph})`,
                clubIds
            ),

            // Top club by total SAMAM points among faculty's assigned clubs
            pool.execute(
                `SELECT c.name AS club_name, COALESCE(SUM(t.credits), 0) AS total_credits
                 FROM clubs c
                 JOIN students s ON s.clubId = c.id
                 LEFT JOIN sdc_transactions t ON t.username = s.username
                 WHERE c.id IN (${ph})
                 GROUP BY c.id, c.name
                 ORDER BY total_credits DESC
                 LIMIT 1`,
                clubIds
            ),

            // Level breakdown for students in faculty's clubs
            pool.execute(
                `SELECT COALESCE(sp.level, 'Explorer') as level, COUNT(*) as count
                 FROM students s
                 LEFT JOIN student_profiles sp ON s.username = sp.username
                 WHERE s.clubId IN (${ph}) AND s.samam_access = 1
                 GROUP BY COALESCE(sp.level, 'Explorer')
                 ORDER BY count DESC`,
                clubIds
            ),

            // Points by domain for students in faculty's clubs
            pool.execute(
                `SELECT t.domain, SUM(t.credits) as total_credits, COUNT(DISTINCT t.username) as student_count
                 FROM sdc_transactions t
                 JOIN students s ON t.username = s.username
                 WHERE s.clubId IN (${ph})
                 GROUP BY t.domain
                 ORDER BY total_credits DESC`,
                clubIds
            ),

            // Recently issued badges (last 7 days) for students in faculty's clubs
            pool.execute(
                `SELECT sb.username, s.name, bd.name as badge_name, bd.rarity, sb.issued_on
                 FROM student_badges sb
                 JOIN badge_definitions bd ON sb.badge_id = bd.id
                 JOIN students s ON sb.username = s.username
                 WHERE s.clubId IN (${ph}) AND sb.issued_on >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                 ORDER BY sb.issued_on DESC
                 LIMIT 10`,
                clubIds
            ),

            // Top 5 students by points in faculty's clubs
            pool.execute(
                `SELECT s.username, s.name, s.branch, COALESCE(SUM(t.credits), 0) as total_credits
                 FROM students s
                 LEFT JOIN sdc_transactions t ON s.username = t.username
                 WHERE s.clubId IN (${ph})
                 GROUP BY s.username, s.name, s.branch
                 ORDER BY total_credits DESC
                 LIMIT 5`,
                clubIds
            ),
        ]);

        const topClub = (topClubResult[0] as any[])[0];

        return NextResponse.json({
            activeSamamStudents: Number((activeStudentsResult[0] as any[])[0]?.count ?? 0),
            activitiesCompleted: Number((activitiesCompletedResult[0] as any[])[0]?.total ?? 0),
            uniqueBadgesDistributed: Number((badgesResult[0] as any[])[0]?.unique_badges ?? 0),
            topClub: topClub?.club_name ?? null,
            topClubCredits: Number(topClub?.total_credits ?? 0),
            levelBreakdown: levelBreakdownResult[0] as any[],
            domainSdcBreakdown: domainSdcResult[0] as any[],
            recentBadges: recentBadgesResult[0] as any[],
            topSdcStudents: topStudentsResult[0] as any[],
        });
    } catch (error: any) {
        console.error('Faculty SAMAM stats error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch SAMAM stats' }, { status: 500 });
    }
}
