import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getConnection } from '@/lib/db';
import { handleApiError } from '@/lib/handleApiError';

export async function GET(request) {
    let connection;

    try {
        connection = await getConnection();

        // Verify JWT token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Authorization token required' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
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

        const assignedClubs = facultyResult[0].assigned_clubs;
        if (!assignedClubs) {
            return NextResponse.json({
                success: true,
                data: {
                    students: [],
                    pagination: { page: 1, limit: 50, total: 0, pages: 0 }
                }
            });
        }

        // Parse assigned clubs (assuming it's a comma-separated string)
        const clubIds = assignedClubs.split(',').map(id => id.trim());

        // Build WHERE clause for clubs
        const placeholders = clubIds.map(() => '?').join(',');
        const whereClause = `WHERE s.clubId IN (${placeholders})`;

        // Get students from assigned clubs who have internal submissions
        const [studentsResult] = await connection.execute(
            `SELECT DISTINCT s.id, s.username, s.name, s.year, s.branch, s.clubId, c.name as club_name
             FROM students s
             INNER JOIN student_internal_submissions sis ON s.username = sis.username
             INNER JOIN clubs c ON s.clubId = c.id
             ${whereClause}
             ORDER BY s.name ASC`,
            clubIds
        );

        return NextResponse.json({
            success: true,
            data: {
                students: studentsResult,
                pagination: {
                    page: 1,
                    limit: studentsResult.length,
                    total: studentsResult.length,
                    pages: 1
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