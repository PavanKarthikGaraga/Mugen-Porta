import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const query = `
      SELECT ac.*, ae.status as enrollment_status, ae.enrolled_at,
             (SELECT COUNT(*) FROM activity_enrollments ar WHERE ar.activity_code = ac.code) as real_enrolled_count 
      FROM activity_enrollments ae
      JOIN activity_catalogue ac ON ae.activity_code = ac.code
      WHERE ae.username = ?
      ORDER BY ae.enrolled_at DESC
    `;

    const [rows]: any = await pool.query(query, [decoded.username]);

    // Parse JSON columns back to objects for the frontend
    const now = new Date();

    const activities = rows.map((row: any) => {
      let isPastAndLocked = false;
      if (row.is_attendance_locked) {
        try {
          const dateStr = row.activity_date instanceof Date 
            ? row.activity_date.toISOString().split('T')[0] 
            : String(row.activity_date).split('T')[0];
          const activityEndTime = new Date(`${dateStr}T${row.end_time}`);
          if (now > activityEndTime) {
            isPastAndLocked = true;
          }
        } catch (e) {
          console.error("Error parsing date:", e);
        }
      }

      const isEffectivelyCompleted = row.enrollment_status === 'completed' || isPastAndLocked;

      return {
        ...row,
        outcomes: row.outcomes || [],
        timeline: row.timeline || [],
        resources: row.resources || [],
        assignments: row.assignments || [],
        competencies: row.competencies || [],
        career: row.career || [],
        sdgs: row.sdgs || [],
        ga: row.ga || [],
        enrolledCount: row.real_enrolled_count || 0,
        isEnrolled: true,
        // Map frontend fields expected by My Activities
        name: row.title,
        credits: row.sdc_credits,
        credits_earned: row.enrollment_status === 'completed' ? row.sdc_credits : 0,
        isEffectivelyCompleted
      };
    });

    // Group activities for the MyActivities tab logic
    const grouped = {
      ongoing: activities.filter((a: any) => !a.isEffectivelyCompleted && ['registered', 'active', 'ongoing', 'pending_review'].includes(a.enrollment_status)),
      completed: activities.filter((a: any) => a.isEffectivelyCompleted),
    };

    return NextResponse.json({ success: true, data: grouped });
  } catch (error: any) {
    console.error("GET Student Activities Error:", error);
    return NextResponse.json({ success: false, error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
  }
}
