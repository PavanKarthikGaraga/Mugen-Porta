import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
    try {
        // Verify JWT token from cookie
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            );
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'lead') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get lead's club ID
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

        const clubId = leadResult[0].clubId;

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const search = searchParams.get('search')?.trim() || '';
        const year = searchParams.get('year')?.trim() || '';
        const category = searchParams.get('category')?.trim() || '';

        const offset = (page - 1) * limit;

        try {
            let whereConditions = ['s.clubId = ?'];
            let queryParams = [clubId];

            // Build search conditions
            if (search && search.length > 0) {
                whereConditions.push('(s.name LIKE ? OR s.email LIKE ? OR s.username LIKE ?)');
                queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            if (year && year.length > 0) {
                whereConditions.push('s.year = ?');
                queryParams.push(year);
            }

            if (category && category.length > 0) {
                whereConditions.push('s.selectedDomain = ?');
                queryParams.push(category);
            }

            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM students s ${whereClause}`;

            const [countResult] = await pool.execute(countQuery, queryParams);
            const total = countResult[0].total;

            // Get students data with submissions
            const studentsQuery = `
                SELECT
                    s.id,
                    s.username,
                    s.name,
                    s.year,
                    s.branch,
                    s.phoneNumber,
                    s.selectedDomain,
                    s.created_at,
                    -- External submissions
                    ses.fr as final_report, ses.fyt_l as final_youtube, ses.flk_l as final_linkedin,
                    -- External marks
                    sem.internal as internal_marks, sem.frm as final_report_marks, sem.fyt_m as final_youtube_marks,
                    sem.flk_m as final_linkedin_marks, sem.total as external_total,
                    sem.evaluated_by as evaluated_by
                FROM students s
                LEFT JOIN student_external_submissions ses ON s.username = ses.username
                LEFT JOIN student_external_marks sem ON s.username = sem.username
                ${whereClause}
                ORDER BY s.created_at DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;

            const [studentsResult] = await pool.execute(studentsQuery, queryParams);

            // Get usernames for internal submissions query
            const usernames = studentsResult.map(student => student.username);

            // Fetch internal submissions for all students in this batch
            let internalSubmissions = [];
            if (usernames.length > 0) {
                const placeholders = usernames.map(() => '?').join(',');
                const [internalResults] = await pool.execute(
                    `SELECT username, day, report, linkedin, youtube, status, reason
                     FROM internal_submissions
                     WHERE username IN (${placeholders})
                     ORDER BY username, day`,
                    usernames
                );
                internalSubmissions = internalResults;
            }

            // Group internal submissions by username
            const submissionsByUsername = {};
            internalSubmissions.forEach(sub => {
                if (!submissionsByUsername[sub.username]) {
                    submissionsByUsername[sub.username] = [];
                }
                submissionsByUsername[sub.username].push(sub);
            });

            // Transform the data to match the expected format
            const transformedStudents = studentsResult.map(student => {
                const studentInternalSubs = submissionsByUsername[student.username] || [];

                // Format internal submissions for compatibility
                const submissions = [];
                studentInternalSubs.forEach(sub => {
                    // Add report for this day
                    submissions.push({
                        submission_type: 'report',
                        day_number: sub.day,
                        submission_url: sub.report,
                        status: sub.status,
                        reason: sub.reason,
                        evaluated: sub.status === 'A' || sub.status === 'R'
                    });
                    // Add LinkedIn for this day
                    submissions.push({
                        submission_type: 'linkedin_link',
                        day_number: sub.day,
                        submission_url: sub.linkedin,
                        status: sub.status,
                        reason: sub.reason,
                        evaluated: sub.status === 'A' || sub.status === 'R'
                    });
                    // Add YouTube for this day
                    submissions.push({
                        submission_type: 'youtube_link',
                        day_number: sub.day,
                        submission_url: sub.youtube,
                        status: sub.status,
                        reason: sub.reason,
                        evaluated: sub.status === 'A' || sub.status === 'R'
                    });
                });

                return {
                    ...student,
                    submissions: submissions,
                    // Format external submission
                    finalSubmission: student.final_report || student.final_youtube || student.final_linkedin ? {
                        final_report_url: student.final_report,
                        presentation_youtube_url: student.final_youtube,
                        presentation_linkedin_url: student.final_linkedin,
                        frm: student.final_report_marks,
                        fyt_m: student.final_youtube_marks,
                        flk_m: student.final_linkedin_marks,
                        total: student.external_total,
                        evaluated: student.external_total > 0
                    } : null
                };
            });

            return NextResponse.json({
                success: true,
                data: {
                    students: transformedStudents,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching students:', error);
            return NextResponse.json(
                { error: 'Failed to fetch students' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to fetch lead students',
            details: error.message
        }, { status: 500 });
    }
}
