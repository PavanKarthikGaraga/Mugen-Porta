import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getConnection } from '@/lib/db';

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

        // Check if user is faculty
        if (decoded.role !== 'faculty') {
            return NextResponse.json(
                { message: 'Access denied. Faculty role required.' },
                { status: 403 }
            );
        }

        const facultyUsername = decoded.username;
        const { studentUsername, day, action, reason } = await request.json();

        if (!studentUsername || !day || !action) {
            return NextResponse.json(
                { message: 'Student username, day, and action are required' },
                { status: 400 }
            );
        }

        if (day < 1 || day > 6) {
            return NextResponse.json(
                { message: 'Invalid day. Must be between 1 and 6.' },
                { status: 400 }
            );
        }

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { message: 'Invalid action. Must be "approve" or "reject".' },
                { status: 400 }
            );
        }

        if (action === 'reject' && !reason) {
            return NextResponse.json(
                { message: 'Reason is required for rejection.' },
                { status: 400 }
            );
        }

        // Check if faculty has access to this student's club
        const [facultyResult] = await connection.execute(
            'SELECT assignedClubs FROM faculty WHERE username = ?',
            [facultyUsername]
        );

        if (facultyResult.length === 0) {
            return NextResponse.json(
                { message: 'Faculty not found' },
                { status: 404 }
            );
        }

        const assignedClubsJson = facultyResult[0].assignedClubs;
        if (!assignedClubsJson) {
            return NextResponse.json(
                { message: 'No assigned clubs found for faculty' },
                { status: 403 }
            );
        }

        // Parse assigned clubs (handle both JSON string and array formats)
        let assignedClubs;
        try {
            if (Array.isArray(assignedClubsJson)) {
                // Already an array
                assignedClubs = assignedClubsJson;
            } else if (typeof assignedClubsJson === 'string') {
                // JSON string that needs parsing
                assignedClubs = JSON.parse(assignedClubsJson);
            } else {
                // Default to empty array
                assignedClubs = [];
            }
        } catch (error) {
            console.error('Error parsing assigned clubs for faculty:', facultyUsername, 'Raw value:', assignedClubsJson, 'Type:', typeof assignedClubsJson);
            return NextResponse.json(
                { message: 'Invalid assigned clubs format' },
                { status: 500 }
            );
        }

        if (!Array.isArray(assignedClubs) || assignedClubs.length === 0) {
            return NextResponse.json(
                { message: 'No assigned clubs found for faculty' },
                { status: 403 }
            );
        }

        // Get student's club
        const [studentResult] = await connection.execute(
            'SELECT clubId FROM students WHERE username = ?',
            [studentUsername]
        );

        if (studentResult.length === 0) {
            return NextResponse.json(
                { message: 'Student not found' },
                { status: 404 }
            );
        }

        const studentClubId = studentResult[0].clubId;

        if (!assignedClubs.includes(studentClubId.toString())) {
            return NextResponse.json(
                { message: 'Access denied. Student not in assigned clubs.' },
                { status: 403 }
            );
        }

        // Begin transaction
        await connection.beginTransaction();

        try {
            // Check if the submission exists for this day
            const [existingSubmission] = await connection.execute(
                'SELECT id, status FROM internal_submissions WHERE username = ? AND day = ?',
                [studentUsername, day]
            );

            if (existingSubmission.length === 0) {
                return NextResponse.json(
                    { message: 'No submission found for this day.' },
                    { status: 404 }
                );
            }

            const currentStatus = existingSubmission[0].status;
            if (currentStatus !== 'S' && currentStatus !== 'N') {
                return NextResponse.json(
                    { message: 'This submission has already been evaluated.' },
                    { status: 400 }
                );
            }

            // Update the submission status
            const newStatus = action === 'approve' ? 'A' : 'R';
            const updateReason = action === 'reject' ? reason : null;

            await connection.execute(
                'UPDATE internal_submissions SET status = ?, reason = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ? AND day = ?',
                [newStatus, updateReason, studentUsername, day]
            );

            // Calculate new total internal marks (10 marks per approved day)
            const [allSubmissions] = await connection.execute(
                'SELECT day, status FROM internal_submissions WHERE username = ?',
                [studentUsername]
            );

            const totalInternalMarks = allSubmissions
                .filter(sub => sub.status === 'A')
                .length * 10;

            // Update external marks table with the new internal total
            const [existingExternalMarks] = await connection.execute(
                'SELECT id FROM student_external_marks WHERE username = ?',
                [studentUsername]
            );

            if (existingExternalMarks.length > 0) {
                // Update internal total in external marks
                await connection.execute(
                    'UPDATE student_external_marks SET internal = ? WHERE username = ?',
                    [totalInternalMarks, studentUsername]
                );

                // Recalculate total external marks
                const [externalMarks] = await connection.execute(
                    'SELECT frm, fyt_m, flk_m FROM student_external_marks WHERE username = ?',
                    [studentUsername]
                );

                if (externalMarks.length > 0) {
                    const external = externalMarks[0];
                    const frm = parseFloat(external.frm) || 0;
                    const fyt_m = parseFloat(external.fyt_m) || 0;
                    const flk_m = parseFloat(external.flk_m) || 0;
                    const externalTotal = totalInternalMarks + frm + fyt_m + flk_m;
                    await connection.execute(
                        'UPDATE student_external_marks SET total = ? WHERE username = ?',
                        [externalTotal, studentUsername]
                    );
                }
            } else {
                // Create external marks record with just internal total
                await connection.execute(
                    'INSERT INTO student_external_marks (username, internal, total) VALUES (?, ?, ?)',
                    [studentUsername, totalInternalMarks, totalInternalMarks]
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
        console.error('Error submitting faculty internal evaluation:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
