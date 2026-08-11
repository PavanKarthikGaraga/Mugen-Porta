import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyDevAccess } from '../../auth-helper';
import { ensureAiUsageLogTable } from '@/lib/dbMigrate';

// GET /api/dashboard/admin/dev/ai-logs?search=<name or ID> — per-student
// token usage across the two AI feature areas: Career Dashboard
// (role_matches + role_fit) and Career Roadmap.
export async function GET(request: Request) {
    const auth = await verifyDevAccess(request);
    if (!auth.success) return auth.response;

    await ensureAiUsageLogTable();

    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').trim();

    const params: any[] = [];
    let where = '';
    if (search) {
        where = 'WHERE s.username LIKE ? OR s.name LIKE ?';
        params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(
        `SELECT
            s.username, s.name, s.branch,
            SUM(CASE WHEN a.feature IN ('role_matches', 'role_fit') THEN a.total_tokens ELSE 0 END) AS dashboardTokens,
            SUM(CASE WHEN a.feature = 'career_roadmap' THEN a.total_tokens ELSE 0 END) AS roadmapTokens,
            COUNT(*) AS totalCalls,
            MAX(a.created_at) AS lastUsed
         FROM ai_usage_log a
         JOIN students s ON s.username = a.username
         ${where}
         GROUP BY s.username, s.name, s.branch
         ORDER BY (SUM(a.total_tokens)) DESC`,
        params
    );

    const [[totals]]: any = await pool.execute(
        `SELECT
            COALESCE(SUM(CASE WHEN feature IN ('role_matches', 'role_fit') THEN total_tokens ELSE 0 END), 0) AS totalDashboardTokens,
            COALESCE(SUM(CASE WHEN feature = 'career_roadmap' THEN total_tokens ELSE 0 END), 0) AS totalRoadmapTokens,
            COUNT(DISTINCT username) AS studentsUsed
         FROM ai_usage_log`
    );

    return NextResponse.json({ success: true, students: rows, totals });
}
