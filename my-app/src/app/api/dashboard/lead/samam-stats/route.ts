import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function getLeadClubData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;

    // Get club info and assigned categories
    const [leadResult]: any = await pool.execute(
        'SELECT l.clubId, c.name as clubName, l.assigned_categories FROM leads l LEFT JOIN clubs c ON l.clubId = c.id WHERE l.username = ?',
        [decoded.username as string]
    );

    if (leadResult.length > 0) {
        let assigned_categories = [];
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

        // If no categories assigned, return empty stats
        if (!assigned_categories || assigned_categories.length === 0) {
             return NextResponse.json({
                levelBreakdown: [],
                sdcStats: { totalCredits: 0, studentsWithCredits: 0, avgPerTransaction: "0.0" },
                badgeStats: { totalIssued: 0, studentsWithBadges: 0, uniqueBadges: 0 }
            });
        }

        const categoryPlaceholders = assigned_categories.map(() => '?').join(',');

        const [
            levelBreakdownResult,
            sdcTotalResult,
            badgesResult
        ] = await Promise.all([
            // 1. Students per SAMAM level in these categories (based on activity enrollments)
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

            // 2. Total SAMAM Points distributed for activities in these categories
            // sdc_transactions doesn't directly link to activity_code in current schema easily, 
            // but we can just filter by domain/pack if they match category, or we fetch stats of students enrolled.
            // A more accurate approach for lead: Total credits earned from these categories (if domain matches category)
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

            // 3. Badges overview for students in these categories
            pool.execute(`
                SELECT
                    COUNT(*) as total_issued,
                    COUNT(DISTINCT b.username) as students_with_badges,
                    COUNT(DISTINCT b.badge_id) as unique_badges
                FROM student_badges b
                JOIN activity_enrollments ae ON b.username = ae.username
                JOIN activity_catalogue ac ON ae.activity_code = ac.code
                WHERE ac.category IN (${categoryPlaceholders})
            `, [...assigned_categories])
        ]);

        const sdcStats = (sdcTotalResult[0] as any[])[0] || {};
        const badgeStats = (badgesResult[0] as any[])[0] || {};

        return NextResponse.json({
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
            }
        });
    } catch (error: any) {
        console.error('Lead stats error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
