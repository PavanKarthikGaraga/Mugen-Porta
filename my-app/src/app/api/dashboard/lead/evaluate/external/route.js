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
            'SELECT id FROM student_external_marks WHERE username = ?',
            [studentUsername]
        );

        const marksData = {
            frm: parseInt(evaluationData.frm) || 0,
            fyt_m: parseFloat(evaluationData.fyt_m) || 0,
            flk_m: parseFloat(evaluationData.flk_m) || 0
        };

        // Get internal marks total
        const [internalMarks] = await pool.execute(
            'SELECT total FROM student_internal_marks WHERE username = ?',
            [studentUsername]
        );

        const internalTotal = internalMarks.length > 0 ? internalMarks[0].total : 0;

        // Calculate total external marks
        const total = marksData.frm + marksData.fyt_m + marksData.flk_m;
        const finalTotal = internalTotal + total;

        if (existingMarks.length > 0) {
            // Update existing marks
            await pool.execute(
                `UPDATE student_external_marks SET
                    frm = ?, fyt_m = ?, flk_m = ?, total = ?
                WHERE username = ?`,
                [marksData.frm, marksData.fyt_m, marksData.flk_m, total, studentUsername]
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
