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
            // Check if marks record exists for the student
            const [existingRecordCheck] = await connection.execute(
                'SELECT id FROM student_internal_marks WHERE username = ?',
                [studentUsername]
            );

            // Get existing marks to preserve them during partial updates
            let existingMarksData = {
                m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0,
                yt_m: 0, lk_m: 0, total: 0
            };

            if (existingRecordCheck.length > 0) {
                const [currentMarks] = await connection.execute(
                    'SELECT m1, m2, m3, m4, m5, m6, m7, yt_m, lk_m, total FROM student_internal_marks WHERE username = ?',
                    [studentUsername]
                );
                if (currentMarks.length > 0) {
                    // Ensure all values are numbers, not strings from database
                    existingMarksData = {
                        m1: parseInt(currentMarks[0].m1) || 0,
                        m2: parseInt(currentMarks[0].m2) || 0,
                        m3: parseInt(currentMarks[0].m3) || 0,
                        m4: parseInt(currentMarks[0].m4) || 0,
                        m5: parseInt(currentMarks[0].m5) || 0,
                        m6: parseInt(currentMarks[0].m6) || 0,
                        m7: parseInt(currentMarks[0].m7) || 0,
                        yt_m: parseFloat(currentMarks[0].yt_m) || 0,
                        lk_m: parseFloat(currentMarks[0].lk_m) || 0,
                        total: parseFloat(currentMarks[0].total) || 0
                    };
                }
            }

            // Merge existing marks with new evaluation data (only update provided fields)
            const marksData = {
                m1: evaluationData.hasOwnProperty('m1') && evaluationData.m1 !== '' ? parseInt(evaluationData.m1) : existingMarksData.m1,
                m2: evaluationData.hasOwnProperty('m2') && evaluationData.m2 !== '' ? parseInt(evaluationData.m2) : existingMarksData.m2,
                m3: evaluationData.hasOwnProperty('m3') && evaluationData.m3 !== '' ? parseInt(evaluationData.m3) : existingMarksData.m3,
                m4: evaluationData.hasOwnProperty('m4') && evaluationData.m4 !== '' ? parseInt(evaluationData.m4) : existingMarksData.m4,
                m5: evaluationData.hasOwnProperty('m5') && evaluationData.m5 !== '' ? parseInt(evaluationData.m5) : existingMarksData.m5,
                m6: evaluationData.hasOwnProperty('m6') && evaluationData.m6 !== '' ? parseInt(evaluationData.m6) : existingMarksData.m6,
                m7: evaluationData.hasOwnProperty('m7') && evaluationData.m7 !== '' ? parseInt(evaluationData.m7) : existingMarksData.m7,
                yt_m: evaluationData.hasOwnProperty('yt_m') && evaluationData.yt_m !== '' ? parseFloat(evaluationData.yt_m) : existingMarksData.yt_m,
                lk_m: evaluationData.hasOwnProperty('lk_m') && evaluationData.lk_m !== '' ? parseFloat(evaluationData.lk_m) : existingMarksData.lk_m
            };

            // Calculate total
            const total = marksData.m1 + marksData.m2 + marksData.m3 + marksData.m4 +
                         marksData.m5 + marksData.m6 + marksData.m7 +
                         marksData.yt_m + marksData.lk_m;

            if (existingRecordCheck.length > 0) {
                // Update existing record
                await connection.execute(
                    `UPDATE student_internal_marks
                     SET m1 = ?, m2 = ?, m3 = ?, m4 = ?, m5 = ?, m6 = ?, m7 = ?, yt_m = ?, lk_m = ?, total = ?, evaluated_by = ?
                     WHERE username = ?`,
                    [marksData.m1, marksData.m2, marksData.m3, marksData.m4, marksData.m5, marksData.m6, marksData.m7, marksData.yt_m, marksData.lk_m, total, adminUsername, studentUsername]
                );
            } else {
                // Insert new record
                await connection.execute(
                    `INSERT INTO student_internal_marks (username, m1, m2, m3, m4, m5, m6, m7, yt_m, lk_m, total, evaluated_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [studentUsername, marksData.m1, marksData.m2, marksData.m3, marksData.m4, marksData.m5, marksData.m6, marksData.m7, marksData.yt_m, marksData.lk_m, total, adminUsername]
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
