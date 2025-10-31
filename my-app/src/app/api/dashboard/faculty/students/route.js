import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getConnection } from '@/lib/db';

export async function GET(request) {
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

        // Get faculty's assigned clubs
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
            return NextResponse.json({
                success: true,
                data: {
                    students: [],
                    pagination: { page: 1, limit: 50, total: 0, pages: 0 }
                }
            });
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
            return NextResponse.json({
                success: true,
                data: {
                    students: [],
                    pagination: { page: 1, limit: 50, total: 0, pages: 0 }
                }
            });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const search = searchParams.get('search')?.trim() || '';
        const year = searchParams.get('year')?.trim() || '';
        const category = searchParams.get('category')?.trim() || '';

        const offset = (page - 1) * limit;

        // Build WHERE conditions
        let whereConditions = [`s.clubId IN (${assignedClubs.map(() => '?').join(',')})`];
        let queryParams = [...assignedClubs];

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
        const [countResult] = await connection.execute(countQuery, queryParams);
        const total = countResult[0].total;
        const pages = Math.ceil(total / limit);

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
                s.clubId,
                c.name as clubName,
                -- Internal submissions
                sis.r1, sis.r2, sis.r3, sis.r4, sis.r5, sis.r6, sis.r7,
                sis.yt_l as youtube_link, sis.lk_l as linkedin_link,
                -- Internal marks
                sim.m1, sim.m2, sim.m3, sim.m4, sim.m5, sim.m6, sim.m7,
                sim.yt_m as youtube_marks, sim.lk_m as linkedin_marks,
                sim.total as internal_total,
                -- External submissions
                ses.fr as final_report, ses.fyt_l as final_youtube, ses.flk_l as final_linkedin,
                -- External marks
                sem.frm as final_report_marks, sem.fyt_m as final_youtube_marks,
                sem.flk_m as final_linkedin_marks, sem.total as external_total,
                sem.evaluated_by as evaluated_by
            FROM students s
            LEFT JOIN clubs c ON s.clubId = c.id
            LEFT JOIN student_internal_submissions sis ON s.username = sis.username
            LEFT JOIN student_internal_marks sim ON s.username = sim.username
            LEFT JOIN student_external_submissions ses ON s.username = ses.username
            LEFT JOIN student_external_marks sem ON s.username = sem.username
            ${whereClause}
            ORDER BY s.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const [studentsResult] = await connection.execute(studentsQuery, queryParams);

        // Transform the data to match the expected format
        const transformedStudents = studentsResult.map(student => ({
            ...student,
            // Format internal submissions
            submissions: [
                // Report submissions
                ...(student.r1 ? [{ submission_type: 'report', report_number: 1, submission_url: student.r1, marks: student.m1, evaluated: student.m1 > 0 }] : []),
                ...(student.r2 ? [{ submission_type: 'report', report_number: 2, submission_url: student.r2, marks: student.m2, evaluated: student.m2 > 0 }] : []),
                ...(student.r3 ? [{ submission_type: 'report', report_number: 3, submission_url: student.r3, marks: student.m3, evaluated: student.m3 > 0 }] : []),
                ...(student.r4 ? [{ submission_type: 'report', report_number: 4, submission_url: student.r4, marks: student.m4, evaluated: student.m4 > 0 }] : []),
                ...(student.r5 ? [{ submission_type: 'report', report_number: 5, submission_url: student.r5, marks: student.m5, evaluated: student.m5 > 0 }] : []),
                ...(student.r6 ? [{ submission_type: 'report', report_number: 6, submission_url: student.r6, marks: student.m6, evaluated: student.m6 > 0 }] : []),
                ...(student.r7 ? [{ submission_type: 'report', report_number: 7, submission_url: student.r7, marks: student.m7, evaluated: student.m7 > 0 }] : []),
                // Social media submissions
                ...(student.youtube_link ? [{ submission_type: 'youtube_link', submission_url: student.youtube_link, marks: student.youtube_marks, evaluated: student.youtube_marks > 0 }] : []),
                ...(student.linkedin_link ? [{ submission_type: 'linkedin_link', submission_url: student.linkedin_link, marks: student.linkedin_marks, evaluated: student.linkedin_marks > 0 }] : []),
            ],
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
        }));

        return NextResponse.json({
            success: true,
            data: {
                students: transformedStudents,
                pagination: {
                    page,
                    limit,
                    total,
                    pages
                }
            }
        });

    } catch (error) {
        console.error('Error fetching faculty students:', error);
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