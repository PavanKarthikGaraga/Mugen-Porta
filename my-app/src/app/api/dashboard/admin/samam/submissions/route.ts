import { getCouncilDomains } from '@/lib/councilScope';
import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { safeMessage } from '@/lib/apiSecurity';
import { ensureAssignmentSubmissionStatusColumns } from '@/lib/dbMigrate';

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tck")?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded || (decoded.role !== "admin" && decoded.role !== "superadmin" && decoded.role !== "faculty" && decoded.role !== "council")) return null;
  return decoded;
}

function taskTitleMap(assignments: any): Record<string, string> {
  let list: any[] = [];
  try {
    list = typeof assignments === 'string' ? JSON.parse(assignments) : (assignments || []);
  } catch { /* ignore malformed JSON */ }
  const map: Record<string, string> = {};
  for (const a of list) if (a?.id != null) map[String(a.id)] = a.title || `Task ${a.id}`;
  return map;
}

// GET /api/dashboard/admin/samam/submissions
//   - no `activity` query param: activities that have at least one task
//     submission, with pending/approved/rejected counts, for the "view
//     submissions" drill-down list.
//   - `?activity=<code>`: the individual student submissions for that
//     activity's tasks, ready to approve/reject.
export async function GET(req: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await ensureAssignmentSubmissionStatusColumns();

    const url = new URL(req.url);
    const activityCode = url.searchParams.get('activity');

    let domainCondition = '';
    const queryParams: any[] = [];

    if (admin.role === 'council') {
        const councilDomains = await getCouncilDomains(admin.username);
        
        if (councilDomains.length === 0) {
            return NextResponse.json(activityCode ? { success: true, activity: null, submissions: [] } : { success: true, activities: [] });
        }
        domainCondition = ` AND a.domain IN (${councilDomains.map(() => '?').join(',')})`;
        queryParams.push(...councilDomains);
    }

    if (activityCode) {
      // For specific activity, verify domain if council
      const actQuery = `SELECT code, title, assignments FROM activity_catalogue a WHERE code = ?${domainCondition}`;
      const [actRows]: any = await pool.execute(actQuery, [activityCode, ...queryParams]);
      
      if (!actRows.length) return NextResponse.json({ message: 'Activity not found or unauthorized' }, { status: 404 });
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

    const activitiesQuery = `
      SELECT a.code, a.title, a.domain,
             COUNT(s.id) as total,
             SUM(CASE WHEN s.status = 'pending' THEN 1 ELSE 0 END) as pending,
             SUM(CASE WHEN s.status = 'approved' THEN 1 ELSE 0 END) as approved,
             SUM(CASE WHEN s.status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM activity_assignment_submissions s
      JOIN activity_catalogue a ON s.activity_code = a.code
      WHERE 1=1${domainCondition}
      GROUP BY a.code, a.title, a.domain
      ORDER BY pending DESC, total DESC
    `;

    const [rows] = await pool.execute(activitiesQuery, queryParams);

    return NextResponse.json({ success: true, activities: rows });
  } catch (error: any) {
    console.error("Submissions GET error:", error);
    return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
  }
}
