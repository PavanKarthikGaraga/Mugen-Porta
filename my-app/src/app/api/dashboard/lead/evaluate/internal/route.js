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

        const { studentUsername, day, action, reason } = await request.json();

        // Validate input
        if (!studentUsername || !day || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (day < 1 || day > 6) {
            return NextResponse.json(
                { error: 'Invalid day. Must be between 1 and 6.' },
                { status: 400 }
            );
        }

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be "approve" or "reject".' },
                { status: 400 }
            );
        }

        if (action === 'reject' && !reason) {
            return NextResponse.json(
                { error: 'Reason is required for rejection.' },
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

        // Check if the submission exists for this day
        const [existingSubmission] = await pool.execute(
            'SELECT id, status FROM internal_submissions WHERE username = ? AND num = ?',
            [studentUsername, day]
        );

        if (existingSubmission.length === 0) {
            return NextResponse.json(
                { error: 'No submission found for this day.' },
                { status: 404 }
            );
        }

        const currentStatus = existingSubmission[0].status;
        if (currentStatus !== 'S' && currentStatus !== 'N') {
            return NextResponse.json(
                { error: 'This submission has already been evaluated.' },
                { status: 400 }
            );
        }

        // Update the submission status
        const newStatus = action === 'approve' ? 'A' : 'R';
        const updateReason = action === 'reject' ? reason : null;

        await pool.execute(
            'UPDATE internal_submissions SET status = ?, reason = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ? AND num = ?',
            [newStatus, updateReason, studentUsername, day]
        );

        // Calculate new total internal marks (10 marks per approved day)
        const [allSubmissions] = await pool.execute(
            'SELECT num, status FROM internal_submissions WHERE username = ?',
            [studentUsername]
        );

        const totalInternalMarks = allSubmissions
            .filter(sub => sub.status === 'A')
            .length * 10;

        // Update external marks table with the new internal total
        const [existingExternalMarks] = await pool.execute(
            'SELECT id FROM student_external_marks WHERE username = ?',
            [studentUsername]
        );

        if (existingExternalMarks.length > 0) {
            // Update internal total in external marks
            await pool.execute(
                'UPDATE student_external_marks SET internal = ? WHERE username = ?',
                [totalInternalMarks, studentUsername]
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
                const externalTotal = totalInternalMarks + frm + fyt_m + flk_m;
                await pool.execute(
                    'UPDATE student_external_marks SET total = ? WHERE username = ?',
                    [externalTotal, studentUsername]
                );
            }
        } else {
            // Create external marks record with just internal total
            await pool.execute(
                'INSERT INTO student_external_marks (username, internal, total) VALUES (?, ?, ?)',
                [studentUsername, totalInternalMarks, totalInternalMarks]
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
