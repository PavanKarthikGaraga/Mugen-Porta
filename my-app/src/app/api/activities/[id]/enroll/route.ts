import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { awardBadge } from '@/lib/badgeHelper';

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
            `SELECT id, status FROM activity_enrollments WHERE activity_code = ? AND username = ?`,
            [id, user.username] as string[]
        ) as any[];

        if (rows.length > 0) {
            return NextResponse.json({ enrolled: true, status: rows[0].status });
        }
        return NextResponse.json({ enrolled: false });

    } catch (error: any) {
        // If table doesn't exist yet return not enrolled gracefully
        if (error.code === 'ER_NO_SUCH_TABLE') return NextResponse.json({ enrolled: false });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
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

        // Fetch activity to check seats
        const [actRows] = await pool.execute(
            `SELECT id, code, title, max_seats FROM activity_catalogue WHERE code = ? OR id = ? LIMIT 1`,
            [id, id]
        ) as any[];

        if (!actRows?.length) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        const activity = actRows[0];
        const activityCode = activity.code;

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

        // Enroll
        await pool.execute(
            `INSERT INTO activity_enrollments (activity_code, username, status, enrolled_at) VALUES (?, ?, 'active', NOW())`,
            [activityCode, user.username] as string[]
        );

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
  UNIQUE KEY uq_enroll (activity_code, username),
  FOREIGN KEY (username) REFERENCES students(username) ON DELETE CASCADE
);`
            }, { status: 500 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
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
        await pool.execute(
            `DELETE FROM activity_enrollments WHERE activity_code = ? AND username = ?`,
            [id, user.username] as string[]
        );
        return NextResponse.json({ success: true, message: 'Unenrolled successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
