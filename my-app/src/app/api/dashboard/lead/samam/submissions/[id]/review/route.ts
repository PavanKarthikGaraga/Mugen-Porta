import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tck")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "lead") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status, reason } = await req.json();

    if (!['A', 'R'].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // Verify submission belongs to a student in lead's club
    const [leadResult]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [decoded.username as string]);
    if (leadResult.length === 0 || !leadResult[0].clubId) return NextResponse.json({ message: 'No club assigned' }, { status: 403 });
    const clubId = leadResult[0].clubId;

    const [subRows] = await pool.execute(`
        SELECT i.username, i.num 
        FROM internal_submissions i
        JOIN students s ON i.username = s.username
        WHERE i.id = ? AND s.clubId = ?
    `, [id, clubId]);

    if (!(subRows as any[])[0]) {
      return NextResponse.json({ message: "Submission not found or not in your club" }, { status: 404 });
    }
    const { username, num } = (subRows as any[])[0];

    // Update
    await pool.execute(
      `UPDATE internal_submissions SET status = ?, reason = ? WHERE id = ?`,
      [status, reason || null, id]
    );

    const title = status === 'A' ? "Submission Approved" : "Submission Rejected";
    const type = status === 'A' ? "success" : "alert";
    const message = status === 'A' 
      ? `Your submission #${num} has been approved by your club lead.` 
      : `Your submission #${num} was rejected by your club lead. Reason: ${reason || 'No reason provided'}`;

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
