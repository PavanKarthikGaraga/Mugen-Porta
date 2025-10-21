import { NextResponse } from 'next/server';
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            );
        }

        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        if (payload.role !== 'lead') {
            return NextResponse.json(
                { error: 'Access denied. Leads only.' },
                { status: 403 }
            );
        }

        const { studentUsername, evaluationData } = await request.json();

        // Validate input
        if (!studentUsername || !evaluationData) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if marks record exists for the student
        const [existingMarks] = await pool.execute(
            'SELECT id FROM student_internal_marks WHERE username = ?',
            [studentUsername]
        );

        const marksData = {
            m1: parseInt(evaluationData.m1) || 0,
            m2: parseInt(evaluationData.m2) || 0,
            m3: parseInt(evaluationData.m3) || 0,
            m4: parseInt(evaluationData.m4) || 0,
            m5: parseInt(evaluationData.m5) || 0,
            m6: parseInt(evaluationData.m6) || 0,
            m7: parseInt(evaluationData.m7) || 0,
            yt_m: parseFloat(evaluationData.yt_m) || 0,
            lk_m: parseFloat(evaluationData.lk_m) || 0
        };

        // Calculate total
        const total = marksData.m1 + marksData.m2 + marksData.m3 + marksData.m4 +
                     marksData.m5 + marksData.m6 + marksData.m7 +
                     marksData.yt_m + marksData.lk_m;

        if (existingMarks.length > 0) {
            // Update existing marks
            await pool.execute(
                `UPDATE student_internal_marks SET
                    m1 = ?, m2 = ?, m3 = ?, m4 = ?, m5 = ?, m6 = ?, m7 = ?,
                    yt_m = ?, lk_m = ?, total = ?, evaluated_by = ?
                WHERE username = ?`,
                [
                    marksData.m1, marksData.m2, marksData.m3, marksData.m4,
                    marksData.m5, marksData.m6, marksData.m7,
                    marksData.yt_m, marksData.lk_m, total, payload.username, studentUsername
                ]
            );
        } else {
            // Insert new marks record
            await pool.execute(
                `INSERT INTO student_internal_marks
                    (username, m1, m2, m3, m4, m5, m6, m7, yt_m, lk_m, total, evaluated_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    studentUsername,
                    marksData.m1, marksData.m2, marksData.m3, marksData.m4,
                    marksData.m5, marksData.m6, marksData.m7,
                    marksData.yt_m, marksData.lk_m, total, payload.username
                ]
            );
        }

        // Also update the external marks table with the internal total
        const [existingExternalMarks] = await pool.execute(
            'SELECT id FROM student_external_marks WHERE username = ?',
            [studentUsername]
        );

        if (existingExternalMarks.length > 0) {
            // Update internal total in external marks
            await pool.execute(
                'UPDATE student_external_marks SET internal = ? WHERE username = ?',
                [total, studentUsername]
            );

            // Recalculate total external marks
            const [externalMarks] = await pool.execute(
                'SELECT frm, fyt_m, flk_m FROM student_external_marks WHERE username = ?',
                [studentUsername]
            );

            if (externalMarks.length > 0) {
                const external = externalMarks[0];
                const externalTotal = total + (external.frm || 0) + (external.fyt_m || 0) + (external.flk_m || 0);
                await pool.execute(
                    'UPDATE student_external_marks SET total = ? WHERE username = ?',
                    [externalTotal, studentUsername]
                );
            }
        } else {
            // Create external marks record with just internal total
            await pool.execute(
                'INSERT INTO student_external_marks (username, internal, total) VALUES (?, ?, ?)',
                [studentUsername, total, total]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Evaluation submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting evaluation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
