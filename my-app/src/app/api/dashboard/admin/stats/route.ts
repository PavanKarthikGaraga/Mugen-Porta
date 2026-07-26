import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
    try {
        // ── Auth ──────────────────────────────────────────────────────────────
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        }

        if (decoded.role !== 'admin') {
            return NextResponse.json({ message: 'Access denied. Admin role required.' }, { status: 403 });
        }

        // ── Filters ───────────────────────────────────────────────────────────
        const { searchParams } = new URL(request.url);
        const domain    = searchParams.get('domain');
        const year      = searchParams.get('year');
        const branch    = searchParams.get('branch');
        const dateRange = searchParams.get('dateRange');

        const whereConditions: string[] = [];
        const params: (string | number)[] = [];

        if (domain)                    { whereConditions.push('s.selectedDomain = ?'); params.push(domain); }
        if (year)                      { whereConditions.push('s.year = ?');            params.push(year);   }
        if (branch && branch !== 'all'){ whereConditions.push('s.branch = ?');          params.push(branch); }

        if (dateRange && dateRange !== 'all') {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
            whereConditions.push('s.created_at >= ?');
            params.push(daysAgo.toISOString().slice(0, 19).replace('T', ' '));
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // ── Parallel queries ──────────────────────────────────────────────────
        const [
            totalStudentsResult,
            totalClubsResult,
            totalRegistrationsResult,
            recentRegistrationsResult,
            submissionStatsResult,
            yearBreakdownResult,
            genderBreakdownResult,
            residenceBreakdownResult,
            topBranchesResult,
            recentTrendResult,
        ] = await Promise.all([
            // 1. Total students (filtered)
            pool.execute(`SELECT COUNT(*) as count FROM students s ${whereClause}`, params),

            // 2. Total clubs with members (filtered)
            pool.execute(
                `SELECT COUNT(DISTINCT c.id) as count
                 FROM clubs c
                 INNER JOIN students s ON c.id = s.clubId
                 ${whereClause}`,
                params
            ),

            // 3. Total registrations (all time, unfiltered)
            pool.execute('SELECT COUNT(*) as count FROM students'),

            // 4. Recent registrations — last 7 days, respects filters
            pool.execute(
                `SELECT COUNT(*) as count FROM students s
                 WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                 ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''}`,
                params
            ),

            // 5. Internal submission status breakdown (filtered via student join)
            pool.execute(
                `SELECT
                    SUM(CASE WHEN iss.status = 'A' THEN 1 ELSE 0 END) AS approved,
                    SUM(CASE WHEN iss.status = 'R' THEN 1 ELSE 0 END) AS rejected,
                    SUM(CASE WHEN iss.status = 'S' THEN 1 ELSE 0 END) AS pending,
                    SUM(CASE WHEN iss.status = 'N' THEN 1 ELSE 0 END) AS not_submitted,
                    COUNT(*) AS total
                 FROM internal_submissions iss
                 INNER JOIN students s ON iss.username = s.username
                 ${whereClause}`,
                params
            ),

            // 6. Year breakdown
            pool.execute(
                `SELECT s.year, COUNT(*) as count FROM students s ${whereClause} GROUP BY s.year ORDER BY s.year`,
                params
            ),

            // 7. Gender breakdown
            pool.execute(
                `SELECT s.gender, COUNT(*) as count FROM students s ${whereClause} GROUP BY s.gender`,
                params
            ),

            // 8. Hostel vs Day Scholar
            pool.execute(
                `SELECT s.residenceType, COUNT(*) as count FROM students s ${whereClause} GROUP BY s.residenceType`,
                params
            ),

            // 9. Top 5 branches by student count
            pool.execute(
                `SELECT s.branch, COUNT(*) as count FROM students s ${whereClause} GROUP BY s.branch ORDER BY count DESC LIMIT 5`,
                params
            ),

            // 10. Daily registrations — last 7 days (always unfiltered for trend)
            pool.execute(
                `SELECT DATE(created_at) as date, COUNT(*) as count
                 FROM students
                 WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                 GROUP BY DATE(created_at)
                 ORDER BY date ASC`
            ),
        ]);

        // ── Shape response ────────────────────────────────────────────────────
        const subStats = (submissionStatsResult[0] as any[])[0] || {};

        return NextResponse.json({
            totalStudents:       (totalStudentsResult[0] as any[])[0].count,
            totalClubs:          (totalClubsResult[0] as any[])[0].count,
            totalRegistrations:  (totalRegistrationsResult[0] as any[])[0].count,
            recentRegistrations: (recentRegistrationsResult[0] as any[])[0].count,

            submissionStats: {
                approved:     Number(subStats.approved     ?? 0),
                rejected:     Number(subStats.rejected     ?? 0),
                pending:      Number(subStats.pending       ?? 0),
                not_submitted:Number(subStats.not_submitted ?? 0),
                total:        Number(subStats.total         ?? 0),
            },

            yearBreakdown:      yearBreakdownResult[0] as any[],
            genderBreakdown:    genderBreakdownResult[0] as any[],
            residenceBreakdown: residenceBreakdownResult[0] as any[],
            topBranches:        topBranchesResult[0] as any[],
            recentTrend:        recentTrendResult[0] as any[],
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats', details: (error as any).message },
            { status: 500 }
        );
    }
}
