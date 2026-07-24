import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tck")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "lead") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const [leadResult]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [decoded.username as string]);
    if (leadResult.length === 0 || !leadResult[0].clubId) return NextResponse.json({ message: 'No club assigned' }, { status: 403 });
    const clubId = leadResult[0].clubId;

    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'S';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = `
      SELECT i.*, s.name, s.branch, s.year 
      FROM internal_submissions i
      JOIN students s ON i.username = s.username
      WHERE i.status = ? AND s.clubId = ?
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const params: any[] = [status, clubId, limit, offset];

    const [rows] = await pool.execute(query, params);
    
    const [countRows] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM internal_submissions i
      JOIN students s ON i.username = s.username
      WHERE i.status = ? AND s.clubId = ?
    `, [status, clubId]);
    
    const total = (countRows as any)[0].count;

    return NextResponse.json({ success: true, submissions: rows, total });
  } catch (error: any) {
    console.error("Lead Submissions GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
