import { NextResponse } from 'next/server';
import { verifyToken } from "@/lib/jwt";
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function GET(request) {
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

        const { searchParams } = new URL(request.url);
        const requestedUsername = searchParams.get('username') || payload.username;

        // Check authorization
        let authorized = false;
        let accessUsername = payload.username;

        if (payload.role === 'student') {
            // Students can only access their own submissions
            if (requestedUsername !== payload.username) {
                return NextResponse.json(
                    { error: 'Access denied. Students can only access their own submissions.' },
                    { status: 403 }
                );
            }
            authorized = true;
        } else if (payload.role === 'lead') {
            // Leads can access submissions for students in their club
            const [leadResult] = await pool.execute(
                'SELECT clubId FROM leads WHERE username = ?',
                [payload.username]
            );

            if (leadResult.length > 0 && leadResult[0].clubId) {
                // Check if the requested student is in the lead's club
                const [studentResult] = await pool.execute(
                    'SELECT clubId FROM students WHERE username = ?',
                    [requestedUsername]
                );

                if (studentResult.length > 0 && studentResult[0].clubId === leadResult[0].clubId) {
                    authorized = true;
                    accessUsername = requestedUsername;
                }
            }
        } else if (payload.role === 'faculty') {
            // Faculty can access submissions for students in their assigned clubs
            const [facultyResult] = await pool.execute(
                'SELECT assigned_clubs FROM faculty WHERE username = ?',
                [payload.username]
            );

            if (facultyResult.length > 0 && facultyResult[0].assigned_clubs) {
                const assignedClubs = facultyResult[0].assigned_clubs.split(',').map(id => id.trim());

                // Check if the requested student is in one of the faculty's assigned clubs
                const [studentResult] = await pool.execute(
                    'SELECT clubId FROM students WHERE username = ?',
                    [requestedUsername]
                );

                if (studentResult.length > 0 && assignedClubs.includes(studentResult[0].clubId.toString())) {
                    authorized = true;
                    accessUsername = requestedUsername;
                }
            }
        } else if (payload.role === 'admin') {
            // Admins can access all student submissions
            authorized = true;
            accessUsername = requestedUsername;
        }

        if (!authorized) {
            return NextResponse.json(
                { error: 'Access denied. You can only access submissions for students in your club.' },
                { status: 403 }
            );
        }

        // Fetch internal submissions and marks for the requested student
        const [submissions] = await pool.execute(
            'SELECT r1, r2, r3, r4, r5, r6, r7, yt_l, lk_l FROM student_internal_submissions WHERE username = ?',
            [accessUsername]
        );

        const [marks] = await pool.execute(
            'SELECT m1, m2, m3, m4, m5, m6, m7, yt_m, lk_m, total FROM student_internal_marks WHERE username = ?',
            [accessUsername]
        );

        const submissionData = submissions.length > 0 ? submissions[0] : {
            r1: null, r2: null, r3: null, r4: null, r5: null, r6: null, r7: null,
            yt_l: null, lk_l: null
        };

        const marksData = marks.length > 0 ? marks[0] : {
            m1: 0, m2: 0, m3: 0, m4: 0, m5: 0, m6: 0, m7: 0,
            yt_m: 0, lk_m: 0, total: 0
        };

        // Convert to the format expected by frontend
        const formattedSubmissions = [];

        // Add reports
        for (let i = 1; i <= 7; i++) {
            formattedSubmissions.push({
                submission_type: 'report',
                report_number: i,
                submission_url: submissionData[`r${i}`],
                marks: marksData[`m${i}`],
                evaluated: marksData[`m${i}`] > 0
            });
        }

        // Add YouTube link
        formattedSubmissions.push({
            submission_type: 'youtube_link',
            submission_url: submissionData.yt_l,
            marks: marksData.yt_m,
            evaluated: marksData.yt_m > 0
        });

        // Add LinkedIn link
        formattedSubmissions.push({
            submission_type: 'linkedin_link',
            submission_url: submissionData.lk_l,
            marks: marksData.lk_m,
            evaluated: marksData.lk_m > 0
        });

        return NextResponse.json({
            success: true,
            submissions: formattedSubmissions,
            totalMarks: marksData.total
        });

    } catch (error) {
        console.error('Error fetching internal submissions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

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

        if (payload.role !== 'student') {
            return NextResponse.json(
                { error: 'Access denied. Students only.' },
                { status: 403 }
            );
        }

        const { submissionType, reportNumber, url } = await request.json();

        // Validate input
        if (!submissionType || !url) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!['report', 'youtube_link', 'linkedin_link'].includes(submissionType)) {
            return NextResponse.json(
                { error: 'Invalid submission type' },
                { status: 400 }
            );
        }

        if (submissionType === 'report') {
            if (!reportNumber || reportNumber < 1 || reportNumber > 7) {
                return NextResponse.json(
                    { error: 'Invalid report number. Must be between 1 and 7.' },
                    { status: 400 }
                );
            }
        }

        // Check if this specific submission already exists
        let columnName;
        if (submissionType === 'report') {
            columnName = `r${reportNumber}`;
        } else if (submissionType === 'youtube_link') {
            columnName = 'yt_l';
        } else if (submissionType === 'linkedin_link') {
            columnName = 'lk_l';
        }

        // Check if this specific column already has a value
        const [existingSubmission] = await pool.execute(
            `SELECT ${columnName} FROM student_internal_submissions WHERE username = ? AND ${columnName} IS NOT NULL`,
            [payload.username]
        );

        if (existingSubmission.length > 0 && existingSubmission[0][columnName]) {
            return NextResponse.json(
                { error: 'This submission has already been made. You cannot edit or resubmit.' },
                { status: 400 }
            );
        }

        // Check if student has a record in internal_submissions, if not create one
        const [existing] = await pool.execute(
            'SELECT id FROM student_internal_submissions WHERE username = ?',
            [payload.username]
        );

        if (existing.length > 0) {
            // Update existing record
            await pool.execute(
                `UPDATE student_internal_submissions SET ${columnName} = ? WHERE username = ?`,
                [url, payload.username]
            );
        } else {
            // Insert new record
            await pool.execute(
                `INSERT INTO student_internal_submissions (username, ${columnName}) VALUES (?, ?)`,
                [payload.username, url]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Submission saved successfully'
        });

    } catch (error) {
        console.error('Error saving internal submission:', error);

        // Handle specific MySQL errors
        if (error.code === 'ER_DATA_TOO_LONG') {
            return NextResponse.json(
                { error: 'The URL you entered is too long. Please use a shorter URL or a URL shortener service.' },
                { status: 400 }
            );
        }

        if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
            return NextResponse.json(
                { error: 'Invalid data format. Please check your input.' },
                { status: 400 }
            );
        }

        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                { error: 'This submission already exists.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
