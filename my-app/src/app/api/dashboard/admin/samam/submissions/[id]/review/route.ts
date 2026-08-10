import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { safeMessage } from '@/lib/apiSecurity';
import { ensureNotificationsTable } from '@/lib/dbMigrate';

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tck")?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded || (decoded.role !== "admin" && decoded.role !== "superadmin")) return null;
  return decoded;
}

function taskTitle(assignments: any, assignmentId: string): string {
  let list: any[] = [];
  try {
    list = typeof assignments === 'string' ? JSON.parse(assignments) : (assignments || []);
  } catch { /* ignore malformed JSON */ }
  return list.find((a: any) => String(a?.id) === String(assignmentId))?.title || `Task ${assignmentId}`;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status, reason } = await req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }
    if (status === 'rejected' && !reason) {
      return NextResponse.json({ message: "A reason is required to reject a submission" }, { status: 400 });
    }

    const [subRows]: any = await pool.execute(
      `SELECT s.username, s.assignment_id, s.activity_code, a.title as activity_title, a.assignments
       FROM activity_assignment_submissions s
       JOIN activity_catalogue a ON s.activity_code = a.code
       WHERE s.id = ?`,
      [id]
    );
    if (!subRows.length) return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    const sub = subRows[0];

    await pool.execute(
      `UPDATE activity_assignment_submissions SET status = ?, reason = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [status, reason || null, admin.username, id]
    );

    await ensureNotificationsTable();
    const task = taskTitle(sub.assignments, sub.assignment_id);
    const title = status === 'approved' ? "Task Approved" : "Task Rejected";
    const message = status === 'approved'
      ? `Your submission for "${task}" in ${sub.activity_title} has been approved.`
      : `Your submission for "${task}" in ${sub.activity_title} was rejected. Reason: ${reason}. You can resubmit.`;
    await pool.execute(
      `INSERT INTO notifications (username, type, title, message) VALUES (?, ?, ?, ?)`,
      [sub.username, status === 'approved' ? 'success' : 'alert', title, message]
    );

    return NextResponse.json({ success: true, message: `Submission ${status === 'approved' ? 'approved' : 'rejected'} successfully` });
  } catch (error: any) {
    console.error("Submission review error:", error);
    return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
  }
}
