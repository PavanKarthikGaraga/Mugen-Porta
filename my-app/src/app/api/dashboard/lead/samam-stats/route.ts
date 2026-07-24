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

    // Get club info
    const [leadResult]: any = await pool.execute(
        'SELECT l.clubId, c.name as clubName FROM leads l LEFT JOIN clubs c ON l.clubId = c.id WHERE l.username = ?',
        [decoded.username as string]
    );

    if (leadResult.length > 0 && leadResult[0].clubId) {
        return { decoded, clubId: leadResult[0].clubId, clubName: leadResult[0].clubName };
    }
    return null;
}

export async function GET(request: Request) {
    try {
        const leadData = await getLeadClubData();
        if (!leadData) return NextResponse.json({ message: 'Authentication required or not a lead' }, { status: 401 });
        const { clubId } = leadData;

        const [
            levelBreakdownResult,
            sdcTotalResult,
            badgesResult
        ] = await Promise.all([
            // 1. Students per SAMAM level in this club
            pool.execute(`
                SELECT COALESCE(sp.level, 'Explorer') as level, COUNT(*) as count
                FROM students s
                LEFT JOIN student_profiles sp ON s.username = sp.username
                WHERE s.clubId = ?
                GROUP BY COALESCE(sp.level, 'Explorer')
                ORDER BY count DESC
            `, [clubId]),

            // 2. Total SAMAM Points distributed to this club's students
            pool.execute(`
                SELECT
                    SUM(t.credits) as total_credits,
                    COUNT(DISTINCT t.username) as students_with_credits,
                    AVG(t.credits) as avg_per_transaction
                FROM sdc_transactions t
                JOIN students s ON t.username = s.username
                WHERE s.clubId = ?
            `, [clubId]),

            // 3. Badges overview for this club's students
            pool.execute(`
                SELECT
                    COUNT(*) as total_issued,
                    COUNT(DISTINCT b.username) as students_with_badges,
                    COUNT(DISTINCT b.badge_id) as unique_badges
                FROM student_badges b
                JOIN students s ON b.username = s.username
                WHERE s.clubId = ?
            `, [clubId])
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
