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

export async function GET(req: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'S'; // Default to pending (Submitted)
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = `
      SELECT i.*, s.name, s.branch, s.year 
      FROM internal_submissions i
      LEFT JOIN students s ON i.username = s.username
      WHERE i.status = ?
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const params: any[] = [status, limit, offset];

    const [rows] = await pool.execute(query, params);
    
    // Get total count
    const [countRows] = await pool.execute(`SELECT COUNT(*) as count FROM internal_submissions WHERE status = ?`, [status]);
    const total = (countRows as any)[0].count;

    return NextResponse.json({ success: true, submissions: rows, total });
  } catch (error: any) {
    console.error("Submissions GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
