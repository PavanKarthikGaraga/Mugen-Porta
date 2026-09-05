import { getCouncilDomains } from '@/lib/councilScope';
import { getFacultyClubIds } from '@/lib/facultyScope';
import { getLeadClubIds } from '@/lib/leadScope';
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
    if (!decoded || !['admin', 'faculty', 'council', 'lead'].includes(decoded.role as string)) return null;
    return decoded;
}

export async function GET(request: Request) {
    try {
        const user = await checkAdmin();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await ensureActivityReportsTable();

        const url = new URL(request.url);
        const activityCode = url.searchParams.get('activity');

        let domainCondition = '';
        const queryParams: any[] = [];

        if (user.role === 'council') {
            const councilDomains = await getCouncilDomains(user.username as string);
            
            if (councilDomains.length === 0) {
                return NextResponse.json(activityCode ? { message: 'Unauthorized domain' } : { success: true, activities: [] }, { status: activityCode ? 403 : 200 });
            }
            domainCondition = ` AND ac.domain IN (${councilDomains.map(() => '?').join(',')})`;
            queryParams.push(...councilDomains);
        } else if (user.role === 'faculty') {
            const facultyClubs = await getFacultyClubIds(user.username as string);
            if (facultyClubs.length === 0) {
                return NextResponse.json(activityCode ? { message: 'Unauthorized domain' } : { success: true, activities: [] }, { status: activityCode ? 403 : 200 });
            }
            const placeholders = facultyClubs.map(() => '?').join(',');
            domainCondition = ` AND ac.code IN (SELECT activity_code FROM club_activity_mappings WHERE club_id IN (${placeholders}))`;
            queryParams.push(...facultyClubs);
        } else if (user.role === 'lead') {
            const leadClubs = await getLeadClubIds(user.username as string);
            if (leadClubs.length === 0) {
                return NextResponse.json(activityCode ? { message: 'Unauthorized domain' } : { success: true, activities: [] }, { status: activityCode ? 403 : 200 });
            }
            const placeholders = leadClubs.map(() => '?').join(',');
            domainCondition = ` AND ac.code IN (SELECT activity_code FROM club_activity_mappings WHERE club_id IN (${placeholders}))`;
            queryParams.push(...leadClubs);
        }

        if (activityCode) {
            const [actRows]: any = await pool.execute(
                `SELECT ac.code, ac.title, ac.domain, ac.category, ac.activity_date, ac.venue, ac.faculty_name,
                        c.name as club_name
                 FROM activity_catalogue ac
                 LEFT JOIN club_activity_mappings m ON m.activity_code = ac.code
                 LEFT JOIN clubs c ON c.id = m.club_id
                 WHERE ac.code = ?${domainCondition}
                 LIMIT 1`,
                [activityCode, ...queryParams]
            );
            if (!actRows.length) return NextResponse.json({ message: 'Activity not found or unauthorized' }, { status: 404 });

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
            )${domainCondition}
            ORDER BY ac.domain ASC, ac.activity_date DESC, ac.created_at DESC
        `, queryParams);

        return NextResponse.json({ success: true, activities: rows });
    } catch (error: any) {
        console.error('Completed activities list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
