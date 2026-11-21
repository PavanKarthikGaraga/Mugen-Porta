import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ensureUserLogsTable } from '@/lib/dbMigrate';
import { getSessionUser } from '@/lib/apiSecurity';

// Called (fire-and-forget) by middleware for API mutations. The identity comes
// from the verified `tck` cookie the middleware forwards — the request body is
// never trusted for username/role, so this endpoint can't be used to forge
// audit-log entries for other users.
export async function POST(request: Request) {
    try {
        const sessionUser: any = await getSessionUser();
        if (!sessionUser?.username) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const method = String(body?.method || '').slice(0, 10);
        const url = String(body?.url || '').slice(0, 500);
        const action = String(body?.action || `API Mutation: ${url}`).slice(0, 500);
        if (!method || !url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await ensureUserLogsTable();
        await pool.execute(
            `INSERT INTO user_logs (username, role, action, method, url, details)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [sessionUser.username, sessionUser.role || 'unknown', action, method, url, null]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to log user action:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
