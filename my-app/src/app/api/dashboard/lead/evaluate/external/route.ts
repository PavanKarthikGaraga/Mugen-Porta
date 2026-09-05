import { NextResponse } from 'next/server';
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { getLeadClubIds } from '@/lib/leadScope';

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

        // Check if lead has access to students in their club(s)
        const leadClubIds = await getLeadClubIds(payload.username as string);

        if (leadClubIds.length === 0) {
            return NextResponse.json(
                { error: 'No club assigned to this lead' },
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

        // Verify student is in lead's club
        const [studentResult] = await pool.execute<RowDataPacket[]>(
            'SELECT clubId FROM students WHERE username = ?',
            [studentUsername]
        );

        if (studentResult.length === 0) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        if (!leadClubIds.includes(studentResult[0].clubId)) {
            return NextResponse.json(
                { error: 'Access denied. Student not in your club.' },
                { status: 403 }
            );
        }

        // Check if marks record exists for the student
        const [existingMarks] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM student_external_marks WHERE username = ?',
            [studentUsername]
        );

        const marksData = {
            frm: parseFloat(evaluationData.frm) || 0,
            fyt_m: parseFloat(evaluationData.fyt_m) || 0,
            flk_m: parseFloat(evaluationData.flk_m) || 0
        };

        // Get internal marks total
        const [internalMarks] = await pool.execute<RowDataPacket[]>(
            'SELECT total FROM student_internal_marks WHERE username = ?',
            [studentUsername]
        );

        const internalTotal = internalMarks.length > 0 ? internalMarks[0].total : 0;

        // Calculate total external marks
        const total = marksData.frm + marksData.fyt_m + marksData.flk_m;
        const finalTotal = internalTotal + total;

        if (existingMarks.length > 0) {
            // Update existing marks (total combines internal + external so
            // re-evaluation never drops the internal component)
            await pool.execute(
                `UPDATE student_external_marks SET
                    frm = ?, fyt_m = ?, flk_m = ?, total = ?
                WHERE username = ?`,
                [marksData.frm, marksData.fyt_m, marksData.flk_m, finalTotal, studentUsername]
            );
        } else {
            // Insert new marks record
            await pool.execute(
                `INSERT INTO student_external_marks
                    (username, internal, frm, fyt_m, flk_m, total, evaluated_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [studentUsername, internalTotal, marksData.frm, marksData.fyt_m, marksData.flk_m, total, payload.username]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Final evaluation submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting final evaluation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
