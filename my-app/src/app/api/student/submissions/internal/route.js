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
                'SELECT assignedClubs FROM faculty WHERE username = ?',
                [payload.username]
            );

            if (facultyResult.length > 0 && facultyResult[0].assignedClubs) {
                const assignedClubs = facultyResult[0].assignedClubs.split(',').map(id => id.trim());

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

        // Fetch internal submissions for the requested student (6 days)
        const [submissions] = await pool.execute(
            'SELECT day, report, linkedin, youtube, status, reason FROM internal_submissions WHERE username = ? ORDER BY day',
            [accessUsername]
        );

        // Convert to the format expected by frontend
        const formattedSubmissions = [];
        const submissionsByDay = {};

        // Initialize all 6 days
        for (let day = 1; day <= 6; day++) {
            submissionsByDay[day] = {
                day,
                report: null,
                linkedin: null,
                youtube: null,
                status: null,
                reason: null
            };
        }

        // Populate with existing data
        submissions.forEach(sub => {
            if (sub.day >= 1 && sub.day <= 6) {
                submissionsByDay[sub.day] = {
                    day: sub.day,
                    report: sub.report,
                    linkedin: sub.linkedin,
                    youtube: sub.youtube,
                    status: sub.status,
                    reason: sub.reason
                };
            }
        });

        // Calculate total marks (5 for report + 2.5 for linkedin + 2.5 for youtube = 10 per day)
        let totalMarks = 0;
        for (let day = 1; day <= 6; day++) {
            const daySubmission = submissionsByDay[day];
            if (daySubmission.status === 'A') { // Only count approved submissions
                totalMarks += 10; // Each approved submission is worth 10 marks
            }
        }

        // Format submissions for frontend compatibility (maintain old structure for UI compatibility)
        for (let day = 1; day <= 6; day++) {
            const daySubmission = submissionsByDay[day];

            // Add report for this day
            formattedSubmissions.push({
                submission_type: 'report',
                day_number: day,
                submission_url: daySubmission.report,
                status: daySubmission.status,
                reason: daySubmission.reason,
                evaluated: daySubmission.status === 'A' || daySubmission.status === 'R'
            });

            // Add LinkedIn link for this day
            formattedSubmissions.push({
                submission_type: 'linkedin_link',
                day_number: day,
                submission_url: daySubmission.linkedin,
                status: daySubmission.status,
                reason: daySubmission.reason,
                evaluated: daySubmission.status === 'A' || daySubmission.status === 'R'
            });

            // Add YouTube link for this day
            formattedSubmissions.push({
                submission_type: 'youtube_link',
                day_number: day,
                submission_url: daySubmission.youtube,
                status: daySubmission.status,
                reason: daySubmission.reason,
                evaluated: daySubmission.status === 'A' || daySubmission.status === 'R'
            });
        }

        return NextResponse.json({
            success: true,
            submissions: formattedSubmissions,
            totalMarks: totalMarks,
            submissionsByDay: Object.values(submissionsByDay)
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

        const { day, reportUrl, linkedinUrl, youtubeUrl } = await request.json();

        // Validate input
        if (!day || day < 1 || day > 6) {
            return NextResponse.json(
                { error: 'Invalid day. Must be between 1 and 6.' },
                { status: 400 }
            );
        }

        if (!reportUrl || !linkedinUrl || !youtubeUrl) {
            return NextResponse.json(
                { error: 'All three URLs (report, LinkedIn, YouTube) are required for submission.' },
                { status: 400 }
            );
        }

        // Check if this day already has a submission
        const [existingSubmission] = await pool.execute(
            'SELECT id, status FROM internal_submissions WHERE username = ? AND day = ?',
            [payload.username, day]
        );

        if (existingSubmission.length > 0) {
            const submission = existingSubmission[0];
            if (submission.status === 'A' || submission.status === 'S') {
                return NextResponse.json(
                    { error: 'This day has already been submitted and cannot be edited.' },
                    { status: 400 }
                );
            }
            // Update existing record
            await pool.execute(
                'UPDATE internal_submissions SET report = ?, linkedin = ?, youtube = ?, status = "S", updated_at = CURRENT_TIMESTAMP WHERE username = ? AND day = ?',
                [reportUrl, linkedinUrl, youtubeUrl, payload.username, day]
            );
        } else {
            // Insert new record
            await pool.execute(
                'INSERT INTO internal_submissions (username, day, report, linkedin, youtube, status) VALUES (?, ?, ?, ?, ?, "S")',
                [payload.username, day, reportUrl, linkedinUrl, youtubeUrl]
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

export async function PUT(request) {
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

        const { day, reportUrl, linkedinUrl, youtubeUrl } = await request.json();

        // Validate input
        if (!day || day < 1 || day > 6) {
            return NextResponse.json(
                { error: 'Invalid day. Must be between 1 and 6.' },
                { status: 400 }
            );
        }

        // If URLs are provided, this is a resubmit with new URLs
        if (reportUrl !== undefined && linkedinUrl !== undefined && youtubeUrl !== undefined) {
            // Check if this day has a rejected submission that can be resubmitted
            const [existingSubmission] = await pool.execute(
                'SELECT id, status FROM internal_submissions WHERE username = ? AND day = ?',
                [payload.username, day]
            );

            if (existingSubmission.length === 0) {
                return NextResponse.json(
                    { error: 'No submission found for this day.' },
                    { status: 404 }
                );
            }

            const submission = existingSubmission[0];
            if (submission.status !== 'R') {
                return NextResponse.json(
                    { error: 'Only rejected submissions can be resubmitted.' },
                    { status: 400 }
                );
            }

            // Update the submission with new URLs and set status to 'N'
            await pool.execute(
                'UPDATE internal_submissions SET report = ?, linkedin = ?, youtube = ?, status = "N", reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE username = ? AND day = ?',
                [reportUrl, linkedinUrl, youtubeUrl, payload.username, day]
            );

            return NextResponse.json({
                success: true,
                message: 'Submission resubmitted successfully'
            });
        } else {
            // If no URLs provided, this is the initial resubmit action (clear and enable editing)
            // Check if this day has a rejected submission
            const [existingSubmission] = await pool.execute(
                'SELECT id, status FROM internal_submissions WHERE username = ? AND day = ?',
                [payload.username, day]
            );

            if (existingSubmission.length === 0) {
                return NextResponse.json(
                    { error: 'No submission found for this day.' },
                    { status: 404 }
                );
            }

            const submission = existingSubmission[0];
            if (submission.status !== 'R') {
                return NextResponse.json(
                    { error: 'Only rejected submissions can be resubmitted.' },
                    { status: 400 }
                );
            }

            // For now, just return success - the frontend will handle clearing locally
            return NextResponse.json({
                success: true,
                message: 'Resubmit mode enabled'
            });
        }

    } catch (error) {
        console.error('Error resubmitting internal submission:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
