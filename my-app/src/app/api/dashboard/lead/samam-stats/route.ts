import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function getLeadClubData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;

    // First try with assigned_categories column (may not exist on older DB)
    let leadResult: any[] = [];
    try {
        const [rows]: any = await pool.execute(
            'SELECT l.clubId, c.name as clubName, l.assigned_categories FROM leads l LEFT JOIN clubs c ON l.clubId = c.id WHERE l.username = ?',
            [decoded.username as string]
        );
        leadResult = rows;
    } catch (e: any) {
        if (e.code === 'ER_BAD_FIELD_ERROR' || e.message?.includes('assigned_categories')) {
            const [rows]: any = await pool.execute(
                'SELECT l.clubId, c.name as clubName FROM leads l LEFT JOIN clubs c ON l.clubId = c.id WHERE l.username = ?',
                [decoded.username as string]
            );
            leadResult = rows;
        } else {
            throw e;
        }
    }

    if (leadResult.length > 0) {
        let assigned_categories: string[] = [];
        if (leadResult[0].assigned_categories) {
            try {
                assigned_categories = typeof leadResult[0].assigned_categories === 'string'
                    ? JSON.parse(leadResult[0].assigned_categories)
                    : leadResult[0].assigned_categories;
            } catch(e) {}
        }
        return { decoded, clubId: leadResult[0].clubId, clubName: leadResult[0].clubName, assigned_categories };
    }
    return null;
}

export async function GET(request: Request) {
    try {
        const leadData = await getLeadClubData();
        if (!leadData) return NextResponse.json({ message: 'Authentication required or not a lead' }, { status: 401 });
        const { assigned_categories } = leadData;

        // Always fetch club student count regardless of category assignment
        const [clubCountResult]: any = leadData.clubId
            ? await pool.execute('SELECT COUNT(*) as total FROM students WHERE clubId = ?', [leadData.clubId])
            : [[{ total: 0 }]];
        const totalClubStudents = Number((clubCountResult as any[])[0]?.total || 0);

        // If no categories assigned, return stats with club count
        if (!assigned_categories || assigned_categories.length === 0) {
             return NextResponse.json({
                totalClubStudents,
                levelBreakdown: [],
                sdcStats: { totalCredits: 0, studentsWithCredits: 0, avgPerTransaction: "0.0" },
                badgeStats: { totalIssued: 0, studentsWithBadges: 0, uniqueBadges: 0 },
                topPerformers: [],
                recentRecognitions: [],
            });
        }

        const categoryPlaceholders = assigned_categories.map(() => '?').join(',');

        const [
            levelBreakdownResult,
            sdcTotalResult,
            badgesResult,
            topPerformersResult,
            recentRecognitionsResult,
        ] = await Promise.all([
            pool.execute(`
                SELECT COALESCE(sp.level, 'Explorer') as level, COUNT(DISTINCT s.username) as count
                FROM students s
                LEFT JOIN student_profiles sp ON s.username = sp.username
                JOIN activity_enrollments ae ON s.username = ae.username
                JOIN activity_catalogue ac ON ae.activity_code = ac.code
                WHERE ac.category IN (${categoryPlaceholders})
                GROUP BY COALESCE(sp.level, 'Explorer')
                ORDER BY count DESC
            `, [...assigned_categories]),

            pool.execute(`
                SELECT
                    SUM(t.credits) as total_credits,
                    COUNT(DISTINCT t.username) as students_with_credits,
                    AVG(t.credits) as avg_per_transaction
                FROM sdc_transactions t
                JOIN activity_enrollments ae ON t.username = ae.username
                JOIN activity_catalogue ac ON ae.activity_code = ac.code
                WHERE ac.category IN (${categoryPlaceholders})
            `, [...assigned_categories]),

            pool.execute(`
                SELECT
                    COUNT(*) as total_issued,
                    COUNT(DISTINCT b.username) as students_with_badges,
                    COUNT(DISTINCT b.badge_id) as unique_badges
                FROM student_badges b
                JOIN activity_enrollments ae ON b.username = ae.username
                JOIN activity_catalogue ac ON ae.activity_code = ac.code
                WHERE ac.category IN (${categoryPlaceholders})
            `, [...assigned_categories]),

            // Top performers by points
            pool.execute(`
                SELECT s.username, s.name, SUM(t.credits) as total_points,
                       COALESCE(sp.level, 'Explorer') as level
                FROM students s
                JOIN sdc_transactions t ON s.username = t.username
                JOIN activity_enrollments ae ON s.username = ae.username
                JOIN activity_catalogue ac ON ae.activity_code = ac.code
                LEFT JOIN student_profiles sp ON s.username = sp.username
                WHERE ac.category IN (${categoryPlaceholders})
                GROUP BY s.username, s.name, sp.level
                ORDER BY total_points DESC
                LIMIT 5
            `, [...assigned_categories]),

            // Recent badge recognitions
            pool.execute(`
                SELECT b.username, s.name, bd.name as badge_name, bd.icon, b.issued_on
                FROM student_badges b
                JOIN badge_definitions bd ON b.badge_id = bd.id
                JOIN students s ON b.username = s.username
                JOIN activity_enrollments ae ON b.username = ae.username
                JOIN activity_catalogue ac ON ae.activity_code = ac.code
                WHERE ac.category IN (${categoryPlaceholders})
                ORDER BY b.issued_on DESC
                LIMIT 5
            `, [...assigned_categories]),
        ]);

        const sdcStats = (sdcTotalResult[0] as any[])[0] || {};
        const badgeStats = (badgesResult[0] as any[])[0] || {};

        return NextResponse.json({
            totalClubStudents,
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
            topPerformers: topPerformersResult[0] as any[],
            recentRecognitions: recentRecognitionsResult[0] as any[],
        });
    } catch (error: any) {
        console.error('Lead stats error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
