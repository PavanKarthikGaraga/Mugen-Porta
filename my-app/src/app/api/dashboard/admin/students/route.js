import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getConnection } from '@/lib/db';
import { handleApiError } from '@/lib/apiErrorHandler';

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

        // Check if user is admin
        if (decoded.role !== 'admin') {
            return NextResponse.json(
                { message: 'Access denied. Admin role required.' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const all = searchParams.get('all') === 'true'; // For reports evaluation - return all students
        const search = searchParams.get('search')?.trim() || '';
        const domain = searchParams.get('domain')?.trim() || '';
        const year = searchParams.get('year')?.trim() || '';
        const branch = searchParams.get('branch')?.trim() || '';
        const dateRange = searchParams.get('dateRange')?.trim() || '';
        const residenceType = searchParams.get('residenceType')?.trim() || '';
        const clubId = searchParams.get('clubId')?.trim() || '';
        const username = searchParams.get('username')?.trim() || '';

        const offset = all ? 0 : (page - 1) * limit;
        const actualLimit = all ? 10000 : limit; // Large limit for "all" case

        // Handle single student fetch by username
        if (username) {
            const studentQuery = `
                SELECT
                    s.id,
                    s.username,
                    s.name,
                    s.email,
                    s.branch,
                    s.year,
                    s.phoneNumber,
                    s.clubId,
                    c.name as clubName,
                    s.selectedDomain
                FROM students s
                LEFT JOIN clubs c ON s.clubId = c.id
                WHERE s.username = ?
            `;

            const [studentResult] = await connection.execute(studentQuery, [username]);

            if (studentResult.length === 0) {
                return NextResponse.json({
                    success: true,
                    data: {
                        student: null
                    }
                });
            }

            return NextResponse.json({
                success: true,
                data: {
                    student: studentResult[0]
                }
            });
        }

        // Build WHERE conditions
        let whereConditions = [];
        let queryParams = [];

        if (search && search.length > 0) {
            whereConditions.push('(s.name LIKE ? OR s.username LIKE ? OR s.email LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (domain && domain.length > 0 && domain !== 'all') {
            whereConditions.push('s.selectedDomain = ?');
            queryParams.push(domain);
        }

        if (year && year.length > 0 && year !== 'all') {
            whereConditions.push('s.year = ?');
            queryParams.push(year);
        }

        if (branch && branch.length > 0 && branch !== 'all') {
            whereConditions.push('s.branch = ?');
            queryParams.push(branch);
        }

        if (dateRange && dateRange.length > 0 && dateRange !== 'all') {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
            whereConditions.push('s.created_at >= ?');
            queryParams.push(daysAgo.toISOString().slice(0, 19).replace('T', ' '));
        }

        if (residenceType && residenceType.length > 0) {
            whereConditions.push('s.residenceType = ?');
            queryParams.push(residenceType);
        }

        if (clubId && clubId.length > 0) {
            whereConditions.push('s.clubId = ?');
            queryParams.push(clubId);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM students s ${whereClause}`;
        const [countResult] = await connection.execute(countQuery, queryParams);
        const total = countResult[0].total;
        const pages = Math.ceil(total / limit);

        // Get students data with proper field mapping
        const studentsQuery = `
            SELECT
                s.id,
                s.username,
                s.name,
                s.gender,
                s.year,
                s.phoneNumber,
                s.residenceType,
                s.hostelName,
                s.selectedDomain,
                s.clubId,
                c.name as clubName,
                s.state,
                s.district,
                -- External submissions
                ses.fr as final_report, ses.fyt_l as final_youtube, ses.flk_l as final_linkedin,
                -- External marks
                sem.internal as internal_marks, sem.frm as final_report_marks, sem.fyt_m as final_youtube_marks,
                sem.flk_m as final_linkedin_marks, sem.total as external_total,
                sem.evaluated_by as evaluated_by
            FROM students s
            LEFT JOIN clubs c ON s.clubId = c.id
            LEFT JOIN student_external_submissions ses ON s.username = ses.username
            LEFT JOIN student_external_marks sem ON s.username = sem.username
            ${whereClause}
            ORDER BY s.created_at DESC
            LIMIT ${actualLimit} OFFSET ${offset}
        `;

        const [studentsResult] = await connection.execute(studentsQuery, queryParams);

        // Get usernames for internal submissions query
        const usernames = studentsResult.map(student => student.username);

        // Fetch internal submissions for all students in this batch
        let internalSubmissions = [];
        if (usernames.length > 0) {
            const placeholders = usernames.map(() => '?').join(',');
            const [internalResults] = await connection.execute(
                `SELECT username, num, report, linkedin, youtube, status, reason
                 FROM internal_submissions
                 WHERE username IN (${placeholders})
                 ORDER BY username, num`,
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
                    day_number: sub.num,
                    submission_url: sub.report,
                    status: sub.status,
                    reason: sub.reason,
                    evaluated: sub.status === 'A' || sub.status === 'R'
                });
                // Add LinkedIn for this day
                submissions.push({
                    submission_type: 'linkedin_link',
                    day_number: sub.num,
                    submission_url: sub.linkedin,
                    status: sub.status,
                    reason: sub.reason,
                    evaluated: sub.status === 'A' || sub.status === 'R'
                });
                // Add YouTube for this day
                submissions.push({
                    submission_type: 'youtube_link',
                    day_number: sub.num,
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

        // Get stats by domain (with filters applied)
        const statsQuery = `
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN selectedDomain = 'TEC' THEN 1 ELSE 0 END) as tec,
                SUM(CASE WHEN selectedDomain = 'LCH' THEN 1 ELSE 0 END) as lch,
                SUM(CASE WHEN selectedDomain = 'ESO' THEN 1 ELSE 0 END) as eso,
                SUM(CASE WHEN selectedDomain = 'IIE' THEN 1 ELSE 0 END) as iie,
                SUM(CASE WHEN selectedDomain = 'HWB' THEN 1 ELSE 0 END) as hwb
            FROM students s
            ${whereClause}
        `;

        const [statsResult] = await connection.execute(statsQuery, queryParams);
        const stats = statsResult[0];

        // Get club stats (with filters applied)
        const clubStatsQuery = `
            SELECT
                c.name as clubName,
                c.id as clubId,
                COUNT(s.username) as memberCount
            FROM clubs c
            LEFT JOIN students s ON c.id = s.clubId
            ${whereClause.replace('s.', 's.')}
            GROUP BY c.id, c.name
            ORDER BY memberCount DESC
        `;

        const [clubStatsResult] = await connection.execute(clubStatsQuery, queryParams);

        return NextResponse.json({
            success: true,
            data: {
                students: transformedStudents,
                stats,
                clubStats: clubStatsResult,
                pagination: all ? null : {
                    page,
                    limit,
                    total,
                    pages
                }
            }
        });

    } catch (error) {
        console.error('Error fetching admin students:', error);
        return handleApiError(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}