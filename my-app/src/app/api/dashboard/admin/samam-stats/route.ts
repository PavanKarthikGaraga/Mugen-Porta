import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;
        if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        if (decoded.role !== 'admin') return NextResponse.json({ message: 'Admin role required' }, { status: 403 });

        const [
            levelBreakdownResult,
            sdcTotalResult,
            badgesResult,
            topSdcStudentsResult,
            domainSdcResult,
            recentBadgesResult,
            competencyResult,
        ] = await Promise.all([
            // 1. Students per SAMAM level
            pool.execute(`
                SELECT COALESCE(sp.level, 'Explorer') as level, COUNT(*) as count
                FROM students s
                LEFT JOIN student_profiles sp ON s.username = sp.username
                GROUP BY COALESCE(sp.level, 'Explorer')
                ORDER BY count DESC
            `),

            // 2. Total SDC credits distributed
            pool.execute(`
                SELECT
                    SUM(credits) as total_credits,
                    COUNT(DISTINCT username) as students_with_credits,
                    AVG(credits) as avg_per_transaction
                FROM sdc_transactions
            `),

            // 3. Badges overview
            pool.execute(`
                SELECT
                    COUNT(*) as total_issued,
                    COUNT(DISTINCT username) as students_with_badges,
                    COUNT(DISTINCT badge_id) as unique_badges
                FROM student_badges
            `),

            // 4. Top 5 students by SDC credits
            pool.execute(`
                SELECT s.username, s.name, s.branch, COALESCE(SUM(t.credits), 0) as total_credits
                FROM students s
                LEFT JOIN sdc_transactions t ON s.username = t.username
                GROUP BY s.username, s.name, s.branch
                ORDER BY total_credits DESC
                LIMIT 5
            `),

            // 5. SDC by domain
            pool.execute(`
                SELECT domain, SUM(credits) as total_credits, COUNT(*) as transaction_count
                FROM sdc_transactions
                GROUP BY domain
                ORDER BY total_credits DESC
            `),

            // 6. Recently issued badges (last 7 days)
            pool.execute(`
                SELECT sb.username, s.name, bd.name as badge_name, bd.rarity, sb.issued_on
                FROM student_badges sb
                JOIN badge_definitions bd ON sb.badge_id = bd.id
                JOIN students s ON sb.username = s.username
                WHERE sb.issued_on >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                ORDER BY sb.issued_on DESC
                LIMIT 10
            `),

            // 7. Competency coverage (how many students have at least one competency score)
            pool.execute(`
                SELECT COUNT(DISTINCT username) as students_with_competencies
                FROM student_competencies
                WHERE score > 0
            `),
        ]);

        const sdcStats = (sdcTotalResult[0] as any[])[0] || {};
        const badgeStats = (badgesResult[0] as any[])[0] || {};
        const compStats = (competencyResult[0] as any[])[0] || {};

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
        return NextResponse.json({ error: 'Failed to fetch SAMAM stats', details: error.message }, { status: 500 });
    }
}
