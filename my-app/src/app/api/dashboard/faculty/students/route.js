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

        // Check if user is faculty
        if (decoded.role !== 'faculty') {
            return NextResponse.json(
                { message: 'Access denied. Faculty role required.' },
                { status: 403 }
            );
        }

        const facultyUsername = decoded.username;

        // Get faculty's assigned clubs
        const [facultyResult] = await connection.execute(
            'SELECT assigned_clubs FROM faculty WHERE username = ?',
            [facultyUsername]
        );

        if (facultyResult.length === 0) {
            return NextResponse.json(
                { message: 'Faculty not found' },
                { status: 404 }
            );
        }

        const assignedClubsJson = facultyResult[0].assigned_clubs;
        if (!assignedClubsJson) {
            return NextResponse.json({
                success: true,
                data: {
                    students: [],
                    pagination: { page: 1, limit: 50, total: 0, pages: 0 }
                }
            });
        }

        // Parse assigned clubs JSON
        let assignedClubs;
        try {
            assignedClubs = JSON.parse(assignedClubsJson);
        } catch (error) {
            return NextResponse.json(
                { message: 'Invalid assigned clubs format' },
                { status: 500 }
            );
        }

        if (!Array.isArray(assignedClubs) || assignedClubs.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    students: [],
                    pagination: { page: 1, limit: 50, total: 0, pages: 0 }
                }
            });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const search = searchParams.get('search')?.trim() || '';
        const year = searchParams.get('year')?.trim() || '';
        const category = searchParams.get('category')?.trim() || '';

        const offset = (page - 1) * limit;

        // Build WHERE conditions
        let whereConditions = [`s.clubId IN (${assignedClubs.map(() => '?').join(',')})`];
        let queryParams = [...assignedClubs];

        // Build search conditions
        if (search && search.length > 0) {
            whereConditions.push('(s.name LIKE ? OR s.email LIKE ? OR s.username LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (year && year.length > 0) {
            whereConditions.push('s.year = ?');
            queryParams.push(year);
        }

        if (category && category.length > 0) {
            whereConditions.push('s.selectedDomain = ?');
            queryParams.push(category);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM students s ${whereClause}`;
        const [countResult] = await connection.execute(countQuery, queryParams);
        const total = countResult[0].total;
        const pages = Math.ceil(total / limit);

        // Get students data
        const studentsQuery = `
            SELECT
                s.id,
                s.username,
                s.name,
                s.year,
                s.branch,
                s.phoneNumber,
                s.selectedDomain,
                s.clubId,
                c.name as clubName
            FROM students s
            LEFT JOIN clubs c ON s.clubId = c.id
            ${whereClause}
            ORDER BY s.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const [studentsResult] = await connection.execute(studentsQuery, queryParams);

        return NextResponse.json({
            success: true,
            data: {
                students: studentsResult,
                pagination: {
                    page,
                    limit,
                    total,
                    pages
                }
            }
        });

    } catch (error) {
        console.error('Error fetching faculty students:', error);
        return handleApiError(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}