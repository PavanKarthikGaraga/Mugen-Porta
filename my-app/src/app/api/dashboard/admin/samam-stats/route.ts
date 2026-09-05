import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getCouncilDomains } from '@/lib/councilScope';
import { getFacultyClubIds } from '@/lib/facultyScope';
import { getLeadClubIds } from '@/lib/leadScope';

async function ensureSamamAccessColumn() {
    try {
        await pool.execute(
            `ALTER TABLE students ADD COLUMN samam_access TINYINT(1) NOT NULL DEFAULT 1`
        );
    } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;
        if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        const decoded = await verifyToken(token) as { role: string; username: string } | null;
        if (!decoded) return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        if (!decoded || !['admin', 'superadmin', 'faculty', 'council', 'lead'].includes(decoded.role)) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await ensureSamamAccessColumn();

        let studentFilter = '';
        let sdcFilter = '';
        let badgeFilter = '';
        let compFilter = '';
        let activityFilter = '';
        let params: any[] = [];

        if (decoded.role === 'council') {
            const councilDomains = await getCouncilDomains(decoded.username);
            if (councilDomains.length > 0) {
                const placeholders = councilDomains.map(() => '?').join(',');
                studentFilter = ` AND s.clubId IN (SELECT id FROM clubs WHERE domain IN (${placeholders}))`;
                sdcFilter = ` WHERE username IN (SELECT username FROM students WHERE clubId IN (SELECT id FROM clubs WHERE domain IN (${placeholders})))`;
                badgeFilter = ` WHERE sb.username IN (SELECT username FROM students WHERE clubId IN (SELECT id FROM clubs WHERE domain IN (${placeholders})))`;
                compFilter = ` AND username IN (SELECT username FROM students WHERE clubId IN (SELECT id FROM clubs WHERE domain IN (${placeholders})))`;
                activityFilter = ` AND activity_code IN (SELECT code FROM activity_catalogue WHERE domain IN (${placeholders}))`;
                params.push(...councilDomains, ...councilDomains, ...councilDomains, ...councilDomains, ...councilDomains);
            } else {
                studentFilter = ' AND 1=0'; sdcFilter = ' WHERE 1=0'; badgeFilter = ' WHERE 1=0'; compFilter = ' AND 1=0'; activityFilter = ' AND 1=0';
            }
        } else if (decoded.role === 'faculty' || decoded.role === 'lead') {
            const clubIds = decoded.role === 'faculty' ? await getFacultyClubIds(decoded.username) : await getLeadClubIds(decoded.username);
            if (clubIds.length > 0) {
                const placeholders = clubIds.map(() => '?').join(',');
                studentFilter = ` AND s.clubId IN (${placeholders})`;
                sdcFilter = ` WHERE username IN (SELECT username FROM students WHERE clubId IN (${placeholders}))`;
                badgeFilter = ` WHERE sb.username IN (SELECT username FROM students WHERE clubId IN (${placeholders}))`;
                compFilter = ` AND username IN (SELECT username FROM students WHERE clubId IN (${placeholders}))`;
                activityFilter = ` AND activity_code IN (SELECT activity_code FROM club_activity_mappings WHERE club_id IN (${placeholders}))`;
                params.push(...clubIds, ...clubIds, ...clubIds, ...clubIds, ...clubIds);
            } else {
                studentFilter = ' AND 1=0'; sdcFilter = ' WHERE 1=0'; badgeFilter = ' WHERE 1=0'; compFilter = ' AND 1=0'; activityFilter = ' AND 1=0';
            }
        }

        // We need to use pool.execute or pool.query with formatted queries.
        // Given the different parameter requirements for each query, it's safer to use pool.query for the complex ones or carefully align params.
        // Actually, let's just use pool.query with string interpolation for the placeholders since they are just IDs/Domains, but we should escape them to be safe, or build individual param arrays.
        // Wait, since we are fetching stats, and it's internal, let's build individual parameter sets.

        const pStudent = decoded.role === 'admin' ? [] : (decoded.role === 'council' ? await getCouncilDomains(decoded.username) : (decoded.role === 'faculty' ? await getFacultyClubIds(decoded.username) : await getLeadClubIds(decoded.username)));
        
        const safeParams = pStudent;

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
            pool.execute(`
                SELECT COALESCE(sp.level, 'Explorer') as level, COUNT(*) as count
                FROM students s
                LEFT JOIN student_profiles sp ON s.username = sp.username
                WHERE s.samam_access = 1 ${studentFilter}
                GROUP BY COALESCE(sp.level, 'Explorer')
                ORDER BY count DESC
            `, safeParams),
            pool.execute(`
                SELECT
                    SUM(credits) as total_credits,
                    COUNT(DISTINCT username) as students_with_credits,
                    AVG(credits) as avg_per_transaction
                FROM sdc_transactions
                ${sdcFilter}
            `, safeParams),
            pool.execute(`
                SELECT
                    COUNT(*) as total_issued,
                    COUNT(DISTINCT sb.username) as students_with_badges,
                    COUNT(DISTINCT sb.badge_id) as unique_badges
                FROM student_badges sb
                ${badgeFilter}
            `, safeParams),
            pool.execute(`
                SELECT s.username, s.name, s.branch, COALESCE(SUM(t.credits), 0) as total_credits
                FROM students s
                LEFT JOIN sdc_transactions t ON s.username = t.username
                WHERE 1=1 ${studentFilter}
                GROUP BY s.username, s.name, s.branch
                ORDER BY total_credits DESC
                LIMIT 5
            `, safeParams),
            pool.execute(`
                SELECT domain, SUM(credits) as total_credits, COUNT(DISTINCT username) as student_count
                FROM sdc_transactions
                ${sdcFilter}
                GROUP BY domain
                ORDER BY total_credits DESC
            `, safeParams),
            pool.execute(`
                SELECT sb.username, s.name, bd.name as badge_name, bd.rarity, sb.issued_on
                FROM student_badges sb
                JOIN badge_definitions bd ON sb.badge_id = bd.id
                JOIN students s ON sb.username = s.username
                WHERE sb.issued_on >= DATE_SUB(NOW(), INTERVAL 7 DAY) ${studentFilter}
                ORDER BY sb.issued_on DESC
                LIMIT 10
            `, safeParams),
            pool.execute(`
                SELECT COUNT(DISTINCT username) as students_with_competencies
                FROM student_competencies
                WHERE score > 0 ${compFilter}
            `, safeParams),
            pool.execute(`
                SELECT COUNT(*) as count FROM students s WHERE s.samam_access = 1 ${studentFilter}
            `, safeParams),
            pool.execute(`
                SELECT COUNT(DISTINCT activity_code) as total
                FROM activity_enrollments
                WHERE attendance_marked = TRUE ${activityFilter}
            `, safeParams),
            pool.execute(`
                SELECT c.name AS club_name, COALESCE(SUM(t.credits), 0) AS total_credits
                FROM clubs c
                JOIN students s ON s.clubId = c.id
                LEFT JOIN sdc_transactions t ON t.username = s.username
                WHERE 1=1 ${studentFilter}
                GROUP BY c.id, c.name
                ORDER BY total_credits DESC
                LIMIT 1
            `, safeParams),
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
        console.error('SAMAM admin stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch SAMAM stats'}, { status: 500 });
    }
}
