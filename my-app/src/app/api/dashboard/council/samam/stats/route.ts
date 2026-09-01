import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { getCouncilDomains } from '@/lib/councilScope';

async function ensureSamamAccessColumn() {
    try {
        await pool.execute(
            `ALTER TABLE students ADD COLUMN samam_access TINYINT(1) NOT NULL DEFAULT 1`
        );
    } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
}

export async function GET() {
    const auth = await requireAuth(['council']);
    if (auth.response) return auth.response;
    const username = auth.user.username as string;

    try {
        const councilDomains = await getCouncilDomains(username);
        
        if (!councilDomains.length) {
            return NextResponse.json({
                totalClubStudents: 0,
                activitiesCompleted: 0,
                uniqueBadgesDistributed: 0,
                topClub: null,
                topClubCredits: 0,
                levelBreakdown: [],
                sdcStats: { totalCredits: 0, studentsWithCredits: 0, avgPerTransaction: 0 },
                badgeStats: { totalIssued: 0, studentsWithBadges: 0, uniqueBadges: 0 },
                competencyStats: { studentsWithCompetencies: 0 },
                topSdcStudents: [],
                domainSdcBreakdown: [],
                recentBadges: [],
            });
        }

        await ensureSamamAccessColumn();

        const domainPlaceholders = councilDomains.map(() => '?').join(',');

        const [
            levelBreakdownResult,
            sdcTotalResult,
            badgesResult,
            topSdcStudentsResult,
            domainSdcResult,
            recentBadgesResult,
            competencyResult,
            activeSamamStudentsResult,
            activitiesCompletedResult,
            topClubResult,
        ] = await Promise.all([
            // 1. Students per SAMAM level — global since journey levels aren't domain-specific
            pool.execute(`
                SELECT COALESCE(sp.level, 'Explorer') as level, COUNT(*) as count
                FROM students s
                LEFT JOIN student_profiles sp ON s.username = sp.username
                WHERE s.samam_access = 1
                GROUP BY COALESCE(sp.level, 'Explorer')
                ORDER BY count DESC
            `),

            // 2. Total SAMAM Points distributed in their domains
            pool.execute(`
                SELECT
                    SUM(credits) as total_credits,
                    COUNT(DISTINCT username) as students_with_credits,
                    AVG(credits) as avg_per_transaction
                FROM sdc_transactions
                WHERE domain IN (${domainPlaceholders})
            `, councilDomains),

            // 3. Badges overview - global since badges aren't directly tied to a domain
            pool.execute(`
                SELECT
                    COUNT(*) as total_issued,
                    COUNT(DISTINCT username) as students_with_badges,
                    COUNT(DISTINCT badge_id) as unique_badges
                FROM student_badges
            `),

            // 4. Top 5 students by SAMAM Points in their domains
            pool.execute(`
                SELECT s.username, s.name, s.branch, COALESCE(SUM(t.credits), 0) as total_credits
                FROM students s
                JOIN sdc_transactions t ON s.username = t.username
                WHERE t.domain IN (${domainPlaceholders})
                GROUP BY s.username, s.name, s.branch
                ORDER BY total_credits DESC
                LIMIT 5
            `, councilDomains),

            // 5. SDC by domain - grouped only for their domains
            pool.execute(`
                SELECT domain, SUM(credits) as total_credits, COUNT(DISTINCT username) as student_count
                FROM sdc_transactions
                WHERE domain IN (${domainPlaceholders})
                GROUP BY domain
                ORDER BY total_credits DESC
            `, councilDomains),

            // 6. Recently issued badges (last 7 days) - global
            pool.execute(`
                SELECT sb.username, s.name, bd.name as badge_name, bd.rarity, sb.issued_on
                FROM student_badges sb
                JOIN badge_definitions bd ON sb.badge_id = bd.id
                JOIN students s ON sb.username = s.username
                WHERE sb.issued_on >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                ORDER BY sb.issued_on DESC
                LIMIT 10
            `),

            // 7. Competency coverage - global
            pool.execute(`
                SELECT COUNT(DISTINCT username) as students_with_competencies
                FROM student_competencies
                WHERE score > 0
            `),

            // 8. Active SAMAM students - global
            pool.execute(`
                SELECT COUNT(*) as count FROM students WHERE samam_access = 1
            `),

            // 9. Activities completed in their domains
            pool.execute(`
                SELECT COUNT(DISTINCT ae.activity_code) as total
                FROM activity_enrollments ae
                JOIN activity_catalogue ac ON ae.activity_code = ac.code
                WHERE ae.attendance_marked = TRUE AND ac.domain IN (${domainPlaceholders})
            `, councilDomains),

            // 10. Top club by total SAMAM points in their domains
            pool.execute(`
                SELECT c.name AS club_name, COALESCE(SUM(t.credits), 0) AS total_credits
                FROM clubs c
                JOIN students s ON s.clubId = c.id
                JOIN sdc_transactions t ON t.username = s.username
                WHERE t.domain IN (${domainPlaceholders})
                GROUP BY c.id, c.name
                ORDER BY total_credits DESC
                LIMIT 1
            `, councilDomains),
        ]);

        const sdcStats = (sdcTotalResult[0] as any[])[0] || {};
        const badgeStats = (badgesResult[0] as any[])[0] || {};
        const compStats = (competencyResult[0] as any[])[0] || {};
        const activeSamamStats = (activeSamamStudentsResult[0] as any[])[0] || {};
        const activitiesStats = (activitiesCompletedResult[0] as any[])[0] || {};
        const topClubStats = (topClubResult[0] as any[])[0] || {};

        return NextResponse.json({
            totalClubStudents: Number(activeSamamStats.count || 0),
            activitiesCompleted: Number(activitiesStats.total || 0),
            uniqueBadgesDistributed: Number(badgeStats.unique_badges || 0),
            topClub: topClubStats.club_name || null,
            topClubCredits: Number(topClubStats.total_credits || 0),
            levelBreakdown: levelBreakdownResult[0] as any[],
            sdcStats: {
                totalCredits: Number(sdcStats.total_credits || 0),
                studentsWithCredits: Number(sdcStats.students_with_credits || 0),
                avgPerTransaction: Number(sdcStats.avg_per_transaction || 0).toFixed(1),
            },
            badgeStats: {
                totalIssued: Number(badgeStats.total_issued || 0),
                studentsWithBadges: Number(badgeStats.students_with_badges || 0),
                uniqueBadges: Number(badgeStats.unique_badges || 0),
            },
            competencyStats: {
                studentsWithCompetencies: Number(compStats.students_with_competencies || 0),
            },
            topSdcStudents: topSdcStudentsResult[0] as any[],
            domainSdcBreakdown: domainSdcResult[0] as any[],
            recentBadges: recentBadgesResult[0] as any[],
        });

    } catch (error: any) {
        console.error('Council SAMAM stats error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch SAMAM stats') }, { status: 500 });
    }
}
