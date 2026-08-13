import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { ensureActivityReportsTable } from '@/lib/dbMigrate';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'faculty')) return null;
    return decoded;
}

// GET /api/dashboard/admin/samam/completed-activities
//   - no `activity` param: every activity that's actually locked AND
//     verified -- activity_enrollments.attendance_marked=TRUE only means the
//     lead locked it; verification (admin/faculty/council approval via
//     /api/attendance-records/[code]/review) is what sets
//     activity_enrollments.status='completed', which is the real "done"
//     signal this list should gate on. Also totals points awarded per
//     activity: sdc_transactions has no direct activity FK, but the bulk
//     points-award route always writes category = 'Activity: <code>', so
//     that's used as the (best-effort) link -- it won't catch points a
//     student got some other way (e.g. a raw admin award unrelated to any
//     specific activity).
//   - `?activity=<code>`: the full enrollment list for that activity (status
//     + attendance), plus the activity_reports row (if generated) so the
//     client can re-render the same PDF via generateActivityReportPdf
//     without the lead needing to regenerate it.
export async function GET(request: Request) {
    try {
        if (!await checkAdmin()) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await ensureActivityReportsTable();

        const url = new URL(request.url);
        const activityCode = url.searchParams.get('activity');

        if (activityCode) {
            const [actRows]: any = await pool.execute(
                `SELECT ac.code, ac.title, ac.domain, ac.category, ac.activity_date, ac.venue, ac.faculty_name,
                        c.name as club_name
                 FROM activity_catalogue ac
                 LEFT JOIN club_activity_mappings m ON m.activity_code = ac.code
                 LEFT JOIN clubs c ON c.id = m.club_id
                 WHERE ac.code = ?
                 LIMIT 1`,
                [activityCode]
            );
            if (!actRows.length) return NextResponse.json({ message: 'Activity not found' }, { status: 404 });

            const [students]: any = await pool.execute(
                `SELECT ae.username, s.name, s.branch, s.year, ae.attendance_percentage, ae.status,
                        (SELECT COALESCE(SUM(st.credits), 0) FROM sdc_transactions st
                         WHERE st.username = ae.username AND st.category = CONCAT('Activity: ', ae.activity_code)) as pointsAwarded
                 FROM activity_enrollments ae
                 JOIN students s ON s.username = ae.username
                 WHERE ae.activity_code = ?
                 ORDER BY ae.attendance_percentage DESC, s.name ASC`,
                [activityCode]
            );

            const [reportRows]: any = await pool.execute(
                `SELECT * FROM activity_reports WHERE activity_code = ? LIMIT 1`,
                [activityCode]
            );
            const report = reportRows[0] || null;
            if (report) {
                report.gallery = (() => { try { return typeof report.gallery === 'string' ? JSON.parse(report.gallery) : report.gallery || []; } catch { return []; } })();
                report.attendance_sheets = (() => { try { return typeof report.attendance_sheets === 'string' ? JSON.parse(report.attendance_sheets) : report.attendance_sheets || []; } catch { return []; } })();
            }

            return NextResponse.json({
                success: true,
                activity: actRows[0],
                students,
                report,
            });
        }

        const [rows] = await pool.execute(`
            SELECT ac.code, ac.title, ac.domain, ac.category, ac.activity_date, ac.venue,
                   (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = ac.code) as enrolledCount,
                   (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = ac.code AND ae.status = 'completed') as completedCount,
                   (SELECT COALESCE(SUM(st.credits), 0) FROM sdc_transactions st WHERE st.category = CONCAT('Activity: ', ac.code)) as totalPointsAllotted,
                   ar.status as report_status, ar.generated_at
            FROM activity_catalogue ac
            LEFT JOIN activity_reports ar ON ar.activity_code = ac.code
            WHERE EXISTS (
                SELECT 1 FROM activity_enrollments ae2
                WHERE ae2.activity_code = ac.code AND ae2.status = 'completed'
            )
            ORDER BY ac.domain ASC, ac.activity_date DESC, ac.created_at DESC
        `);

        return NextResponse.json({ success: true, activities: rows });
    } catch (error: any) {
        console.error('Completed activities list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
