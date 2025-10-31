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

        // Check if lead has access to students in their club
        const [leadResult] = await pool.execute(
            'SELECT clubId FROM leads WHERE username = ?',
            [payload.username]
        );

        if (leadResult.length === 0 || !leadResult[0].clubId) {
            return NextResponse.json(
                { error: 'No club assigned to this lead' },
                { status: 403 }
            );
        }

        const leadClubId = leadResult[0].clubId;

        const { studentUsername, evaluationData } = await request.json();

        // Validate input
        if (!studentUsername || !evaluationData) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify student is in lead's club
        const [studentResult] = await pool.execute(
            'SELECT clubId FROM students WHERE username = ?',
            [studentUsername]
        );

        if (studentResult.length === 0) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        if (studentResult[0].clubId !== leadClubId) {
            return NextResponse.json(
                { error: 'Access denied. Student not in your club.' },
                { status: 403 }
            );
        }

        // Check if marks record exists for the student
        const [existingRecordCheck] = await pool.execute(
            'SELECT id FROM student_internal_marks WHERE username = ?',
            [studentUsername]
        );

        // Get existing marks to preserve them during partial updates
        let existingMarksData = {
            m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0,
            yt_m: 0, lk_m: 0, total: 0
        };

        if (existingRecordCheck.length > 0) {
            const [currentMarks] = await pool.execute(
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
                const frm = parseFloat(external.frm) || 0;
                const fyt_m = parseFloat(external.fyt_m) || 0;
                const flk_m = parseFloat(external.flk_m) || 0;
                const externalTotal = total + frm + fyt_m + flk_m;
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
