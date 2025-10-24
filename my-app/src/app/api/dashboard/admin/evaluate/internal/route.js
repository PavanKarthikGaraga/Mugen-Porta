import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getConnection } from '@/lib/db';
import { handleApiError } from '@/lib/apiErrorHandler';

export async function POST(request) {
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

        const adminUsername = decoded.username;
        const { studentUsername, evaluationData } = await request.json();

        if (!studentUsername || !evaluationData) {
            return NextResponse.json(
                { message: 'Student username and evaluation data are required' },
                { status: 400 }
            );
        }

        // Begin transaction
        await connection.beginTransaction();

        try {
            // Calculate total marks
            const m1 = parseFloat(evaluationData.m1) || 0;
            const m2 = parseFloat(evaluationData.m2) || 0;
            const m3 = parseFloat(evaluationData.m3) || 0;
            const m4 = parseFloat(evaluationData.m4) || 0;
            const m5 = parseFloat(evaluationData.m5) || 0;
            const m6 = parseFloat(evaluationData.m6) || 0;
            const m7 = parseFloat(evaluationData.m7) || 0;
            const yt_m = parseFloat(evaluationData.yt_m) || 0;
            const lk_m = parseFloat(evaluationData.lk_m) || 0;

            const total = m1 + m2 + m3 + m4 + m5 + m6 + m7 + yt_m + lk_m;

            // Check if marks record exists
            const [existingMarks] = await connection.execute(
                'SELECT id FROM student_internal_marks WHERE username = ?',
                [studentUsername]
            );

            if (existingMarks.length > 0) {
                // Update existing record
                await connection.execute(
                    `UPDATE student_internal_marks
                     SET m1 = ?, m2 = ?, m3 = ?, m4 = ?, m5 = ?, m6 = ?, m7 = ?, yt_m = ?, lk_m = ?, total = ?, evaluated_by = ?
                     WHERE username = ?`,
                    [m1, m2, m3, m4, m5, m6, m7, yt_m, lk_m, total, adminUsername, studentUsername]
                );
            } else {
                // Insert new record
                await connection.execute(
                    `INSERT INTO student_internal_marks (username, m1, m2, m3, m4, m5, m6, m7, yt_m, lk_m, total, evaluated_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [studentUsername, m1, m2, m3, m4, m5, m6, m7, yt_m, lk_m, total, adminUsername]
                );
            }

            await connection.commit();

            return NextResponse.json({
                success: true,
                message: 'Internal evaluation submitted successfully'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error submitting admin internal evaluation:', error);
        return handleApiError(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
