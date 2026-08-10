import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { ensureNotificationsTable } from '@/lib/dbMigrate';

async function getFacultyClubs(username: string): Promise<string[]> {
  const [rows]: any = await pool.execute(
    'SELECT assignedClubs FROM faculty WHERE username = ?',
    [username]
  );
  if (!rows.length) return [];
  const raw = rows[0].assignedClubs;
  if (!raw) return [];
  const parsed = Array.isArray(raw) ? raw : JSON.parse(raw);
  return parsed.filter(Boolean).map(String);
}

function taskTitle(assignments: any, assignmentId: string): string {
  let list: any[] = [];
  try {
    list = typeof assignments === 'string' ? JSON.parse(assignments) : (assignments || []);
  } catch { /* ignore malformed JSON */ }
  return list.find((a: any) => String(a?.id) === String(assignmentId))?.title || `Task ${assignmentId}`;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(['faculty']);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const { status, reason } = await req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }
    if (status === 'rejected' && !reason) {
      return NextResponse.json({ message: "A reason is required to reject a submission" }, { status: 400 });
    }

    const clubIds = await getFacultyClubs(auth.user.username as string);
    if (clubIds.length === 0) return NextResponse.json({ message: 'No club assigned' }, { status: 403 });
    const clubPlaceholders = clubIds.map(() => '?').join(',');

    const [subRows]: any = await pool.execute(
      `SELECT s.username, s.assignment_id, s.activity_code, a.title as activity_title, a.assignments
       FROM activity_assignment_submissions s
       JOIN activity_catalogue a ON s.activity_code = a.code
       WHERE s.id = ? AND EXISTS (
         SELECT 1 FROM club_activity_mappings m
         WHERE m.activity_code = a.code AND m.club_id IN (${clubPlaceholders})
       )`,
      [id, ...clubIds]
    );
    if (!subRows.length) return NextResponse.json({ message: "Submission not found or not assigned to you" }, { status: 404 });
    const sub = subRows[0];

    await pool.execute(
      `UPDATE activity_assignment_submissions SET status = ?, reason = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [status, reason || null, auth.user.username, id]
    );

    await ensureNotificationsTable();
    const task = taskTitle(sub.assignments, sub.assignment_id);
    const title = status === 'approved' ? "Task Approved" : "Task Rejected";
    const message = status === 'approved'
      ? `Your submission for "${task}" in ${sub.activity_title} has been approved by faculty.`
      : `Your submission for "${task}" in ${sub.activity_title} was rejected by faculty. Reason: ${reason}. You can resubmit.`;
    await pool.execute(
      `INSERT INTO notifications (username, type, title, message) VALUES (?, ?, ?, ?)`,
      [sub.username, status === 'approved' ? 'success' : 'alert', title, message]
    );

    return NextResponse.json({ success: true, message: `Submission ${status === 'approved' ? 'approved' : 'rejected'} successfully` });
  } catch (error: any) {
    console.error("Faculty submission review error:", error);
    return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
  }
}
