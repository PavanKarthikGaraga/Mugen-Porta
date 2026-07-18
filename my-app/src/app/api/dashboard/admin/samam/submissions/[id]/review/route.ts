import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tck")?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded || (decoded.role !== "admin" && decoded.role !== "superadmin")) return null;
  return decoded;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status, reason } = await req.json(); // status is 'A' or 'R'

    if (!['A', 'R'].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // First get the username so we can notify them
    const [subRows] = await pool.execute(`SELECT username, num FROM internal_submissions WHERE id = ?`, [id]);
    if (!(subRows as any[])[0]) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }
    const { username, num } = (subRows as any[])[0];

    // Update the submission
    await pool.execute(
      `UPDATE internal_submissions SET status = ?, reason = ? WHERE id = ?`,
      [status, reason || null, id]
    );

    // Create a notification for the student
    const title = status === 'A' ? "Submission Approved" : "Submission Rejected";
    const type = status === 'A' ? "success" : "alert"; // Custom types could be mapped on frontend
    const message = status === 'A' 
      ? `Your submission #${num} has been approved by an admin.` 
      : `Your submission #${num} was rejected. Reason: ${reason || 'No reason provided'}`;

    await pool.execute(
      `INSERT INTO notifications (username, type, title, message) VALUES (?, ?, ?, ?)`,
      [username, type, title, message]
    );

    return NextResponse.json({ success: true, message: `Submission ${status === 'A' ? 'Approved' : 'Rejected'} successfully` });
  } catch (error: any) {
    console.error("Submission review error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
