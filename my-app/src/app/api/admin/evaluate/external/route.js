import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getConnection } from '@/lib/db';
import { handleApiError } from '@/lib/handleApiError';

export async function POST(request) {
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
            // Get internal marks total
            const [internalMarks] = await connection.execute(
                'SELECT total FROM student_internal_marks WHERE username = ?',
                [studentUsername]
            );

            const internalTotal = internalMarks.length > 0 ? parseFloat(internalMarks[0].total) || 0 : 0;

            // Calculate external marks
            const frm = parseFloat(evaluationData.frm) || 0;
            const fyt_m = parseFloat(evaluationData.fyt_m) || 0;
            const flk_m = parseFloat(evaluationData.flk_m) || 0;
            const externalTotal = frm + fyt_m + flk_m;

            // Check if external marks record exists
            const [existingMarks] = await connection.execute(
                'SELECT id FROM student_external_marks WHERE username = ?',
                [studentUsername]
            );

            if (existingMarks.length > 0) {
                // Update existing record
                await connection.execute(
                    `UPDATE student_external_marks
                     SET internal = ?, frm = ?, fyt_m = ?, flk_m = ?, total = ?, evaluated_by = ?
                     WHERE username = ?`,
                    [internalTotal, frm, fyt_m, flk_m, externalTotal, adminUsername, studentUsername]
                );
            } else {
                // Insert new record
                await connection.execute(
                    `INSERT INTO student_external_marks (username, internal, frm, fyt_m, flk_m, total, evaluated_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [studentUsername, internalTotal, frm, fyt_m, flk_m, externalTotal, adminUsername]
                );
            }

            await connection.commit();

            return NextResponse.json({
                success: true,
                message: 'External evaluation submitted successfully'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error submitting admin external evaluation:', error);
        return handleApiError(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
