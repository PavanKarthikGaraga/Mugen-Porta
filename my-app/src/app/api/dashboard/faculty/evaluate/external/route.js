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
        const cookieStore = cookies();
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
        const { studentUsername, evaluationData } = await request.json();

        if (!studentUsername || !evaluationData) {
            return NextResponse.json(
                { message: 'Student username and evaluation data are required' },
                { status: 400 }
            );
        }

        // Check if faculty has access to this student's club
        const [facultyResult] = await connection.execute(
            'SELECT assigned_clubs FROM faculty WHERE username = ?',
            [facultyUsername]
        );

        if (facultyResult.length === 0) {
            return NextResponse.json(
                { message: 'Faculty not found' },
                { status: 404 }
            );
        }

        const assignedClubsJson = facultyResult[0].assigned_clubs;
        if (!assignedClubsJson) {
            return NextResponse.json(
                { message: 'No assigned clubs found for faculty' },
                { status: 403 }
            );
        }

        // Parse assigned clubs JSON
        let assignedClubs;
        try {
            assignedClubs = JSON.parse(assignedClubsJson);
        } catch (error) {
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
                    [internalTotal, frm, fyt_m, flk_m, externalTotal, facultyUsername, studentUsername]
                );
            } else {
                // Insert new record
                await connection.execute(
                    `INSERT INTO student_external_marks (username, internal, frm, fyt_m, flk_m, total, evaluated_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [studentUsername, internalTotal, frm, fyt_m, flk_m, externalTotal, facultyUsername]
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
        console.error('Error submitting faculty external evaluation:', error);
        return handleApiError(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
