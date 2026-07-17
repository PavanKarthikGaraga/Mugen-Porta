import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

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
    const activities = rows.map((row: any) => ({
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
    }));

    // Group activities for the MyActivities tab logic
    const grouped = {
      registered: activities.filter((a: any) => a.enrollment_status === 'registered'),
      ongoing: activities.filter((a: any) => a.enrollment_status === 'active' || a.enrollment_status === 'ongoing'),
      completed: activities.filter((a: any) => a.enrollment_status === 'completed'),
      pending_review: activities.filter((a: any) => a.enrollment_status === 'pending_review'),
      certificates: activities.filter((a: any) => a.enrollment_status === 'completed'), // completed usually means cert ready
      archived: activities.filter((a: any) => a.enrollment_status === 'archived'),
    };

    return NextResponse.json({ success: true, data: grouped });
  } catch (error: any) {
    console.error("GET Student Activities Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
