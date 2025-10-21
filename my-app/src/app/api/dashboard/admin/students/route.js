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

        // Check if user is admin
        if (decoded.role !== 'admin') {
            return NextResponse.json(
                { message: 'Access denied. Admin role required.' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role') || 'student';

        // Get all students who have internal submissions (for reports evaluation)
        const [studentsResult] = await connection.execute(
            `SELECT DISTINCT s.id, s.username, s.name, s.year, s.branch, s.clubId, c.name as club_name
             FROM students s
             INNER JOIN student_internal_submissions sis ON s.username = sis.username
             INNER JOIN clubs c ON s.clubId = c.id
             ORDER BY s.name ASC`
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
        console.error('Error fetching admin students:', error);
        return handleApiError(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}