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

        // Begin transaction
        await connection.beginTransaction();

        try {
            // Check if the submission exists for this day
            const [existingSubmission] = await connection.execute(
                'SELECT id, status FROM internal_submissions WHERE username = ? AND num = ?',
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
                'UPDATE internal_submissions SET status = ?, reason = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ? AND num = ?',
                [newStatus, updateReason, studentUsername, day]
            );

            // Calculate new total internal marks (10 marks per approved day)
            const [allSubmissions] = await connection.execute(
                'SELECT num, status FROM internal_submissions WHERE username = ?',
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
        console.error('Error submitting admin internal evaluation:', error);
        return handleApiError(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
