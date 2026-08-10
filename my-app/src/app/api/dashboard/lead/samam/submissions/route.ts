import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { safeMessage } from '@/lib/apiSecurity';
import { getLeadClubIds } from '@/lib/leadScope';
import { ensureAssignmentSubmissionStatusColumns } from '@/lib/dbMigrate';

function taskTitleMap(assignments: any): Record<string, string> {
  let list: any[] = [];
  try {
    list = typeof assignments === 'string' ? JSON.parse(assignments) : (assignments || []);
  } catch { /* ignore malformed JSON */ }
  const map: Record<string, string> = {};
  for (const a of list) if (a?.id != null) map[String(a.id)] = a.title || `Task ${a.id}`;
  return map;
}

// GET /api/dashboard/lead/samam/submissions — same shape as the admin route,
// scoped to activities mapped to the lead's club(s) via club_activity_mappings.
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tck")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "lead") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const clubIds = await getLeadClubIds(decoded.username as string);
    if (clubIds.length === 0) return NextResponse.json({ success: true, activities: [] });

    await ensureAssignmentSubmissionStatusColumns();
    const clubPlaceholders = clubIds.map(() => '?').join(',');

    const url = new URL(req.url);
    const activityCode = url.searchParams.get('activity');

    if (activityCode) {
      const [mapRows]: any = await pool.execute(
        `SELECT 1 FROM club_activity_mappings WHERE activity_code = ? AND club_id IN (${clubPlaceholders})`,
        [activityCode, ...clubIds]
      );
      if (!mapRows.length) return NextResponse.json({ message: 'Activity not assigned to you' }, { status: 403 });

      const [actRows]: any = await pool.execute(
        `SELECT code, title, assignments FROM activity_catalogue WHERE code = ?`,
        [activityCode]
      );
      if (!actRows.length) return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
      const titles = taskTitleMap(actRows[0].assignments);

      const [subRows]: any = await pool.execute(`
        SELECT s.id, s.assignment_id, s.username, s.file_url, s.file_name, s.submitted_at,
               s.status, s.reason, st.name, st.branch, st.year
        FROM activity_assignment_submissions s
        JOIN students st ON s.username = st.username
        WHERE s.activity_code = ?
        ORDER BY s.submitted_at DESC
      `, [activityCode]);

      const submissions = (subRows as any[]).map(r => ({
        ...r,
        task_title: titles[String(r.assignment_id)] || `Task ${r.assignment_id}`,
      }));

      return NextResponse.json({
        success: true,
        activity: { code: actRows[0].code, title: actRows[0].title },
        submissions,
      });
    }

    const [rows] = await pool.execute(`
      SELECT a.code, a.title, a.domain,
             COUNT(s.id) as total,
             SUM(CASE WHEN s.status = 'pending' THEN 1 ELSE 0 END) as pending,
             SUM(CASE WHEN s.status = 'approved' THEN 1 ELSE 0 END) as approved,
             SUM(CASE WHEN s.status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM activity_assignment_submissions s
      JOIN activity_catalogue a ON s.activity_code = a.code
      WHERE EXISTS (
        SELECT 1 FROM club_activity_mappings m
        WHERE m.activity_code = a.code AND m.club_id IN (${clubPlaceholders})
      )
      GROUP BY a.code, a.title, a.domain
      ORDER BY pending DESC, total DESC
    `, clubIds);

    return NextResponse.json({ success: true, activities: rows });
  } catch (error: any) {
    console.error("Lead Submissions GET error:", error);
    return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
  }
}
