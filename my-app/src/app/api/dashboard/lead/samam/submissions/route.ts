import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { safeMessage } from '@/lib/apiSecurity';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tck")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "lead") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let leadResult: any[] = [];
    try {
        const [rows]: any = await pool.execute('SELECT clubId, assigned_categories FROM leads WHERE username = ?', [decoded.username as string]);
        leadResult = rows;
    } catch (e: any) {
        if (e.code === 'ER_BAD_FIELD_ERROR' || e.message?.includes('assigned_categories')) {
            const [rows]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [decoded.username as string]);
            leadResult = rows;
        } else {
            throw e;
        }
    }
    if (leadResult.length === 0) return NextResponse.json({ message: 'No club assigned' }, { status: 403 });
    
    let assigned_categories: string[] = [];
    if (leadResult[0].assigned_categories) {
        try {
            assigned_categories = typeof leadResult[0].assigned_categories === 'string' 
                ? JSON.parse(leadResult[0].assigned_categories) 
                : leadResult[0].assigned_categories;
        } catch(e) {}
    }

    if (!assigned_categories || assigned_categories.length === 0) {
        return NextResponse.json({ success: true, submissions: [], total: 0 });
    }

    const categoryPlaceholders = assigned_categories.map(() => '?').join(',');

    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'S';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = `
      SELECT i.*, s.name, s.branch, s.year, a.title as activity_title, a.domain
      FROM internal_submissions i
      JOIN students s ON i.username = s.username
      JOIN activity_catalogue a ON i.activity_code = a.code
      WHERE i.status = ? AND a.category IN (${categoryPlaceholders})
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const params: any[] = [status, ...assigned_categories, limit, offset];

    const [rows] = await pool.execute(query, params);
    
    const [countRows] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM internal_submissions i
      JOIN students s ON i.username = s.username
      JOIN activity_catalogue a ON i.activity_code = a.code
      WHERE i.status = ? AND a.category IN (${categoryPlaceholders})
    `, [status, ...assigned_categories]);
    
    const total = (countRows as any)[0].count;

    return NextResponse.json({ success: true, submissions: rows, total });
  } catch (error: any) {
    console.error("Lead Submissions GET error:", error);
    return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
  }
}
