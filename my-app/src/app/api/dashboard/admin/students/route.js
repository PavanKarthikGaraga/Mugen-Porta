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

        const offset = all ? 0 : (page - 1) * limit;
        const actualLimit = all ? 10000 : limit; // Large limit for "all" case

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
                s.projectId,
                s.clubId,
                c.name as clubName,
                s.state,
                s.district,
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
            LIMIT ${actualLimit} OFFSET ${offset}
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

        // Get stats by domain (with filters applied)
        const statsQuery = `
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN selectedDomain = 'TEC' THEN 1 ELSE 0 END) as tec,
                SUM(CASE WHEN selectedDomain = 'LCH' THEN 1 ELSE 0 END) as lch,
                SUM(CASE WHEN selectedDomain = 'ESO' THEN 1 ELSE 0 END) as eso,
                SUM(CASE WHEN selectedDomain = 'IIE' THEN 1 ELSE 0 END) as iie,
                SUM(CASE WHEN selectedDomain = 'HWB' THEN 1 ELSE 0 END) as hwb,
                SUM(CASE WHEN selectedDomain = 'Rural' OR ruralCategory IS NOT NULL THEN 1 ELSE 0 END) as rural
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