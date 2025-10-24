import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
    try {
        // Verify JWT token from cookie
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Authentication required' },
                { status: 401 }
            );
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { message: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        // Check if user is admin
        if (decoded.role !== 'admin') {
            return NextResponse.json(
                { message: 'Access denied. Admin role required.' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const domain = searchParams.get('domain');
        const year = searchParams.get('year');
        const branch = searchParams.get('branch');
        const dateRange = searchParams.get('dateRange');

        let whereConditions = [];
        let params = [];

        // Build WHERE conditions based on filters
        if (domain) {
            whereConditions.push('s.selectedDomain = ?');
            params.push(domain);
        }

        if (year) {
            whereConditions.push('s.year = ?');
            params.push(year);
        }

        if (branch) {
            whereConditions.push('s.branch LIKE ?');
            params.push(`%${branch}%`);
        }

        if (dateRange) {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
            whereConditions.push('s.created_at >= ?');
            params.push(daysAgo.toISOString().slice(0, 19).replace('T', ' '));
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total students count
        const [totalStudentsResult] = await pool.execute(
            `SELECT COUNT(*) as count FROM students s ${whereClause}`,
            params
        );

        // Get active projects count
        const [activeProjectsResult] = await pool.execute(
            `SELECT COUNT(DISTINCT p.id) as count
             FROM projects p
             LEFT JOIN students s ON p.id = s.projectId
             ${whereClause.replace('s.', 's.')}`,
            params
        );

        // Get total clubs count
        const [totalClubsResult] = await pool.execute(
            'SELECT COUNT(*) as count FROM clubs'
        );

        // Get recent registrations count
        let recentWhereClause = '';
        let recentParams = [];

        if (dateRange) {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
            recentWhereClause = 'WHERE created_at >= ?';
            recentParams = [daysAgo.toISOString().slice(0, 19).replace('T', ' ')];
        }

        const [recentRegistrationsResult] = await pool.execute(
            `SELECT COUNT(*) as count FROM students s ${recentWhereClause}`,
            recentParams
        );

        // Get total registrations (all time)
        const [totalRegistrationsResult] = await pool.execute(
            'SELECT COUNT(*) as count FROM students'
        );

        const stats = {
            totalStudents: totalStudentsResult[0].count,
            activeProjects: activeProjectsResult[0].count,
            totalClubs: totalClubsResult[0].count,
            recentRegistrations: recentRegistrationsResult[0].count,
            totalRegistrations: totalRegistrationsResult[0].count
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to fetch dashboard stats',
            details: error.message
        }, { status: 500 });
    }
}
