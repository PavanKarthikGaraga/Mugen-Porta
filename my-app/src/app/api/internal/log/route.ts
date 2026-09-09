import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ensureUserLogsTable } from '@/lib/dbMigrate';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, role, action, method, url, details } = body;

        // Basic validation
        if (!username || !role || !action || !method || !url) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await ensureUserLogsTable();

        await pool.execute(
            `INSERT INTO user_logs (username, role, action, method, url, details)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                username, 
                role, 
                action, 
                method, 
                url, 
                details ? JSON.stringify(details) : null
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to log user action:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
