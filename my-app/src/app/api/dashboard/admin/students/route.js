import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getConnection } from '@/lib/db';
import { handleApiError } from '@/lib/apiErrorHandler';

export async function GET(request) {
    let connection;

    try {
        connection = await getConnection();

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
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const search = searchParams.get('search')?.trim() || '';
        const domain = searchParams.get('domain')?.trim() || '';
        const year = searchParams.get('year')?.trim() || '';
        const branch = searchParams.get('branch')?.trim() || '';
        const dateRange = searchParams.get('dateRange')?.trim() || '';
        const residenceType = searchParams.get('residenceType')?.trim() || '';
        const clubId = searchParams.get('clubId')?.trim() || '';

        const offset = (page - 1) * limit;

        // Build WHERE conditions
        let whereConditions = [];
        let queryParams = [];

        if (search && search.length > 0) {
            whereConditions.push('(s.name LIKE ? OR s.username LIKE ? OR s.email LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (domain && domain.length > 0 && domain !== 'all') {
            whereConditions.push('s.selectedDomain = ?');
            queryParams.push(domain);
        }

        if (year && year.length > 0 && year !== 'all') {
            whereConditions.push('s.year = ?');
            queryParams.push(year);
        }

        if (branch && branch.length > 0) {
            whereConditions.push('s.branch LIKE ?');
            queryParams.push(`%${branch}%`);
        }

        if (dateRange && dateRange.length > 0 && dateRange !== 'all') {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
            whereConditions.push('s.created_at >= ?');
            queryParams.push(daysAgo.toISOString().slice(0, 19).replace('T', ' '));
        }

        if (residenceType && residenceType.length > 0) {
            whereConditions.push('s.residenceType = ?');
            queryParams.push(residenceType);
        }

        if (clubId && clubId.length > 0) {
            whereConditions.push('s.clubId = ?');
            queryParams.push(clubId);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM students s ${whereClause}`;
        const [countResult] = await connection.execute(countQuery, queryParams);
        const total = countResult[0].total;
        const pages = Math.ceil(total / limit);

        // Get students data with proper field mapping
        const studentsQuery = `
            SELECT
                s.id,
                s.username,
                s.name,
                s.gender,
                s.year,
                s.phoneNumber,
                s.residenceType,
                s.hostelName,
                s.selectedDomain,
                s.projectId,
                c.name as clubName,
                s.state,
                s.district
            FROM students s
            LEFT JOIN clubs c ON s.clubId = c.id
            ${whereClause}
            ORDER BY s.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const [studentsResult] = await connection.execute(studentsQuery, queryParams);

        // Get stats by domain (with filters applied)
        const statsQuery = `
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN selectedDomain = 'TEC' THEN 1 ELSE 0 END) as tec,
                SUM(CASE WHEN selectedDomain = 'LCH' THEN 1 ELSE 0 END) as lch,
                SUM(CASE WHEN selectedDomain = 'ESO' THEN 1 ELSE 0 END) as eso,
                SUM(CASE WHEN selectedDomain = 'IIE' THEN 1 ELSE 0 END) as iie,
                SUM(CASE WHEN selectedDomain = 'HWB' THEN 1 ELSE 0 END) as hwb,
                SUM(CASE WHEN selectedDomain = 'Rural' OR ruralCategory IS NOT NULL THEN 1 ELSE 0 END) as rural
            FROM students s
            ${whereClause}
        `;

        const [statsResult] = await connection.execute(statsQuery, queryParams);
        const stats = statsResult[0];

        // Get club stats (with filters applied)
        const clubStatsQuery = `
            SELECT
                c.name as clubName,
                c.id as clubId,
                COUNT(s.username) as memberCount
            FROM clubs c
            LEFT JOIN students s ON c.id = s.clubId
            ${whereClause.replace('s.', 's.')}
            GROUP BY c.id, c.name
            ORDER BY memberCount DESC
        `;

        const [clubStatsResult] = await connection.execute(clubStatsQuery, queryParams);

        return NextResponse.json({
            success: true,
            data: {
                students: studentsResult,
                stats,
                clubStats: clubStatsResult,
                pagination: {
                    page,
                    limit,
                    total,
                    pages
                }
            }
        });

    } catch (error) {
        console.error('Error fetching admin students:', error);
        return handleApiError(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}