import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

export async function POST(request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ai_mentor_limits (
                username VARCHAR(100) PRIMARY KEY,
                request_count INT DEFAULT 0,
                last_request_time DATETIME,
                banned_until DATETIME NULL,
                violation_level INT DEFAULT 0
            );
        `);
        return NextResponse.json({ message: 'Table ai_mentor_limits created successfully' });
    } catch (error: any) {
        console.error('DB Migration Error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Database migration failed') }, { status: 500 });
    }
}
