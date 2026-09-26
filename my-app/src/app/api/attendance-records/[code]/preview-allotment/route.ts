import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';

export async function GET(request: Request, context: any) {
  try {
    const { code } = await context.params;
    const auth = await requireAuth(['admin', 'faculty', 'council']);
    if (auth.response) return auth.response;

    const [activityRows]: any = await pool.execute(
      `SELECT ac.code, ac.title, ac.sdc_credits, ac.badge_id, ac.domain, ac.category, bd.name as badge_name,
              (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = ac.code AND ae.attendance_marked = 1) as present_count
       FROM activity_catalogue ac
       LEFT JOIN badge_definitions bd ON ac.badge_id = bd.id
       WHERE ac.code = ?`,
      [code]
    );

    if (activityRows.length === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const activity = activityRows[0];

    return NextResponse.json({
      success: true,
      points: activity.sdc_credits || 0,
      badgeName: activity.badge_name || `Generated Badge: ${activity.title}`,
      willGenerateBadge: !activity.badge_id || !activity.badge_name,
      certificateReady: true,
      studentsCount: activity.present_count || 0
    });
  } catch (error: any) {
    console.error('Preview allotment error:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}
