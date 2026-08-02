import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { safeMessage } from '@/lib/apiSecurity';
import { checkIssuer, loadPermittedActivity } from '@/lib/samamActivityAuth';

/**
 * Enrolled students for one activity — list, export and remove a
 * registration.
 *
 * Originally lead-only. Now shared by admin, faculty, council and lead via
 * the standard activity scoping (admin/faculty unrestricted; council scoped
 * to their domain's clubs; lead to their own club), so admins get the same
 * pre-attendance roster view rather than a lead-only feature.
 */
async function getAccess(activityCode: string) {
    const issuer = await checkIssuer();
    if (!issuer) return null;
    const activity = await loadPermittedActivity(issuer, activityCode);
    if (!activity) return null;
    return { issuer, activity };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const access = await getAccess(id);
        if (!access) {
            return NextResponse.json({ error: 'Not authorized to view this activity' }, { status: 403 });
        }
        const { activity } = access;

        // NOTE: activity_enrollments stores the enrolment state in `status`,
        // not `enrollment_status` — selecting the latter 500s the request.
        const [students]: any = await pool.execute(`
            SELECT
                ae.username      AS student_id,
                s.name,
                s.email,
                s.phoneNumber,
                s.gender,
                s.branch,
                s.year,
                s.selectedDomain,
                s.residenceType,
                s.hostelName,
                s.busRoute,
                c.name           AS clubName,
                ae.status        AS enrollment_status,
                ae.enrolled_at
            FROM activity_enrollments ae
            JOIN students s ON ae.username = s.username
            LEFT JOIN clubs c ON s.clubId = c.id
            WHERE ae.activity_code = ?
            ORDER BY s.name ASC
        `, [id]);

        return NextResponse.json({
            success: true,
            activity: { code: activity.code, title: activity.title },
            students,
            total: (students as any[]).length,
        });
    } catch (error: any) {
        console.error('Enrolled students error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch enrolled students') }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const url = new URL(request.url);
        const studentId = url.searchParams.get("studentId");

        if (!studentId) {
            return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
        }

        const access = await getAccess(id);
        if (!access) {
            return NextResponse.json({ error: 'Not authorized to manage this activity' }, { status: 403 });
        }

        const [result]: any = await pool.execute(
            'DELETE FROM activity_enrollments WHERE activity_code = ? AND username = ?',
            [id, studentId]
        );

        if (result.affectedRows === 0) {
             return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Student registration removed successfully' });
    } catch (error: any) {
        console.error('Delete student enrollment error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to remove student') }, { status: 500 });
    }
}
