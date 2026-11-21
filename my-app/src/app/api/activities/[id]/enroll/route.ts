import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { awardBadge } from '@/lib/badgeHelper';
import { safeMessage } from '@/lib/apiSecurity';

async function getStudentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'student') return null;
    return decoded;
}

// GET /api/activities/[id]/enroll — check if current student is enrolled
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getStudentUser();
        if (!user) return NextResponse.json({ enrolled: false, message: 'Not authenticated' }, { status: 401 });

        const { id } = await params;

        const [rows] = await pool.execute(
            `SELECT id, status, attendance_percentage FROM activity_enrollments WHERE activity_code = ? AND username = ?`,
            [id, user.username] as string[]
        ) as any[];

        if (rows.length > 0) {
            const [subRows] = await pool.execute(
                `SELECT status FROM attendance_submissions WHERE activity_code = ? ORDER BY submitted_at DESC LIMIT 1`,
                [id]
            ) as any[];
            // No submission row at all means the lead hasn't taken/submitted
            // attendance yet -- distinct from a row that exists and is still
            // 'pending' faculty verification. Collapsing both into the same
            // null previously made the student UI show "Pending Approval"
            // even when nothing had been submitted.
            const attendanceStatus = subRows.length > 0 ? subRows[0].status : 'not_submitted';
            return NextResponse.json({
                enrolled: true,
                status: rows[0].status,
                attendanceStatus,
                userAttendance: attendanceStatus === 'verified' ? (rows[0].attendance_percentage || 0) : null
            });
        }
        return NextResponse.json({ enrolled: false });

    } catch (error: any) {
        // If table doesn't exist yet return not enrolled gracefully
        if (error.code === 'ER_NO_SUCH_TABLE') return NextResponse.json({ enrolled: false });
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

function isCompletedOrPast(a: any): boolean {
    if (a.status === 'completed' || a.approval_status === 'completed' || Number(a.is_attendance_locked) === 1) return true;
    if (!a.activity_date) return false;
    const d = a.activity_date instanceof Date ? new Date(a.activity_date) : new Date(String(a.activity_date).slice(0, 10) + 'T00:00:00');
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
}

// POST /api/activities/[id]/enroll — enroll student
export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getStudentUser();
        if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

        const { id } = await params;

        // Fetch activity to check seats and the registration gate
        // SELECT * because older databases may lack some of the optional
        // status/date columns checked below.
        const [actRows] = await pool.execute(
            `SELECT ac.*,
                    (SELECT 1 FROM activity_enrollments ae WHERE ae.activity_code = ac.code AND ae.attendance_marked = TRUE LIMIT 1) AS is_attendance_locked
             FROM activity_catalogue ac WHERE ac.code = ? OR ac.id = ? LIMIT 1`,
            [id, id]
        ) as any[];

        if (!actRows?.length) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        const activity = actRows[0];
        const activityCode = activity.code;

        // Enforce the gate server-side: the catalogue already hides closed
        // activities, but a stale page or a direct API call must not be able
        // to slip an enrolment through.
        if (Number(activity.registration_open ?? 1) !== 1) {
            return NextResponse.json({ message: 'Registration is closed for this activity' }, { status: 409 });
        }
        // Completed / past-dated activities are hidden from the catalogue, but
        // an old link to the activity page still offered "Enroll".
        if (isCompletedOrPast(activity)) {
            return NextResponse.json({ message: 'This activity has already taken place' }, { status: 409 });
        }

        // Check already enrolled
        const [existing] = await pool.execute(
            `SELECT id FROM activity_enrollments WHERE activity_code = ? AND username = ?`,
            [activityCode, user.username] as string[]
        ) as any[];

        if ((existing as any[]).length > 0) {
            return NextResponse.json({ message: 'Already enrolled in this activity' }, { status: 409 });
        }

        // Check seats available
        const [countRows] = await pool.execute(
            `SELECT COUNT(*) as cnt FROM activity_enrollments WHERE activity_code = ?`,
            [activityCode] as string[]
        ) as any[];

        const enrolled = (countRows as any[])[0]?.cnt || 0;
        if (activity.max_seats > 0 && enrolled >= activity.max_seats) {
            return NextResponse.json({ message: 'This activity is full' }, { status: 409 });
        }

        // Enroll. A double-click can race past the "already enrolled" check
        // above; the unique key then rejects the second insert.
        try {
            await pool.execute(
                `INSERT INTO activity_enrollments (activity_code, username, status, enrolled_at) VALUES (?, ?, 'active', NOW())`,
                [activityCode, user.username] as string[]
            );
        } catch (e: any) {
            if (e?.code === 'ER_DUP_ENTRY') {
                return NextResponse.json({ message: 'Already enrolled in this activity' }, { status: 409 });
            }
            throw e;
        }

        // Milestone Badges Logic
        const newEnrolledCount = enrolled + 1; 

        // Let's get the user's total enrollments (across all activities) to award milestone badges
        const [totalEnrollRows] = await pool.execute(
            `SELECT COUNT(*) as total FROM activity_enrollments WHERE username = ?`,
            [user.username as string] as string[]
        ) as any[];

        const totalEnrolled = totalEnrollRows[0].total;

        let badgesAwarded: string[] = [];

        if (totalEnrolled === 1) {
            const awarded = await awardBadge(user.username as string, 'BDG-MILE-001', 'First Activity Enrollment');
            if (awarded) badgesAwarded.push('First Step');
        } else if (totalEnrolled === 3) {
            const awarded = await awardBadge(user.username as string, 'BDG-MILE-002', '3 Activities Enrollment');
            if (awarded) badgesAwarded.push('Active Learner');
        } else if (totalEnrolled === 5) {
            const awarded = await awardBadge(user.username as string, 'BDG-MILE-003', '5 Activities Enrollment');
            if (awarded) badgesAwarded.push('Power User');
        }

        let msg = `Successfully enrolled in "${activity.title}".`;
        if (badgesAwarded.length > 0) {
            msg += ` You also earned a new badge: ${badgesAwarded.join(', ')}!`;
        }

        return NextResponse.json({
            success: true,
            message: msg
        }, { status: 201 });

    } catch (error: any) {
        console.error('Enroll error:', error);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return NextResponse.json({
                message: 'Enrollment table not set up yet. Please run the SQL setup.',
                sql: `CREATE TABLE IF NOT EXISTS activity_enrollments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  activity_code VARCHAR(50) NOT NULL,
  username VARCHAR(10) NOT NULL,
  status ENUM('active','completed','dropped') DEFAULT 'active',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attendance_percentage INT DEFAULT 0,
  attendance_marked BOOLEAN DEFAULT FALSE,
  UNIQUE KEY uq_enroll (activity_code, username),
  FOREIGN KEY (username) REFERENCES students(username) ON DELETE CASCADE
);`
            }, { status: 500 });
        }
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

// DELETE /api/activities/[id]/enroll — unenroll
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getStudentUser();
        if (!user) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

        const { id } = await params;

        // Once attendance is recorded (or the enrolment is completed) the
        // row backs certificates, points and reports — don't let a student
        // delete it.
        const [rows] = await pool.execute(
            `SELECT status, attendance_marked FROM activity_enrollments WHERE activity_code = ? AND username = ? LIMIT 1`,
            [id, user.username] as string[]
        ) as any[];
        const row = (rows as any[])[0];
        if (!row) {
            return NextResponse.json({ message: 'You are not enrolled in this activity' }, { status: 404 });
        }
        if (row.status === 'completed' || Number(row.attendance_marked) === 1) {
            return NextResponse.json({ message: 'Attendance has already been recorded for this activity, so you can no longer unenroll.' }, { status: 409 });
        }

        await pool.execute(
            `DELETE FROM activity_enrollments WHERE activity_code = ? AND username = ?`,
            [id, user.username] as string[]
        );
        return NextResponse.json({ success: true, message: 'Unenrolled successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
