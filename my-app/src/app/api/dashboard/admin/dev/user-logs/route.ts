import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage, clampInt } from '@/lib/apiSecurity';
import { ensureUserLogsTable } from '@/lib/dbMigrate';

export async function GET(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        await ensureUserLogsTable();

        const { searchParams } = new URL(request.url);
        const page = clampInt(searchParams.get('page'), { min: 1, fallback: 1 });
        const limit = clampInt(searchParams.get('limit'), { min: 1, max: 100, fallback: 50 });
        const offset = (page - 1) * limit;

        const role = searchParams.get('role');
        const username = searchParams.get('username');

        let query = `SELECT * FROM user_logs WHERE 1=1`;
        let params: any[] = [];

        if (role && role !== 'all') {
            query += ` AND role = ?`;
            params.push(role);
        }

        if (username) {
            query += ` AND username LIKE ?`;
            params.push(`%${username}%`);
        }

        // Count total
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countRows]: any = await pool.execute(countQuery, params);
        const total = countRows[0].total;

        // Fetch paginated
        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit.toString(), offset.toString());

        const [rows]: any = await pool.execute(query, params);

        return NextResponse.json({
            success: true,
            logs: rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error('Fetch user logs error:', error);
        return NextResponse.json({ success: false, error: safeMessage(error) }, { status: 500 });
    }
}
