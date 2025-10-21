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

        // Fetch external submission and marks for the requested student
        const [submissions] = await pool.execute(
            'SELECT fr, fyt_l, flk_l FROM student_external_submissions WHERE username = ?',
            [accessUsername]
        );

        const [marks] = await pool.execute(
            'SELECT internal, frm, fyt_m, flk_m, total FROM student_external_marks WHERE username = ?',
            [accessUsername]
        );

        const submissionData = submissions.length > 0 ? submissions[0] : {
            fr: null, fyt_l: null, flk_l: null
        };

        const marksData = marks.length > 0 ? marks[0] : {
            internal: 0, frm: 0, fyt_m: 0, flk_m: 0, total: 0
        };

        return NextResponse.json({
            success: true,
            submission: {
                final_report_url: submissionData.fr,
                presentation_youtube_url: submissionData.fyt_l,
                presentation_linkedin_url: submissionData.flk_l,
                marks: marksData.total,
                internal_marks: marksData.internal,
                evaluated: marksData.total > 0
            }
        });

    } catch (error) {
        console.error('Error fetching external submission:', error);
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

        const { finalReportUrl, presentationYoutubeUrl, presentationLinkedinUrl } = await request.json();

        // Validate input
        if (!finalReportUrl || !presentationYoutubeUrl || !presentationLinkedinUrl) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if student has a record in external_submissions, if not create one
        const [existing] = await pool.execute(
            'SELECT id FROM student_external_submissions WHERE username = ?',
            [payload.username]
        );

        if (existing.length > 0) {
            // Update existing record
            await pool.execute(
                'UPDATE student_external_submissions SET fr = ?, fyt_l = ?, flk_l = ? WHERE username = ?',
                [finalReportUrl, presentationYoutubeUrl, presentationLinkedinUrl, payload.username]
            );
        } else {
            // Insert new record
            await pool.execute(
                'INSERT INTO student_external_submissions (username, fr, fyt_l, flk_l) VALUES (?, ?, ?, ?)',
                [payload.username, finalReportUrl, presentationYoutubeUrl, presentationLinkedinUrl]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Final submission saved successfully'
        });

    } catch (error) {
        console.error('Error saving external submission:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
