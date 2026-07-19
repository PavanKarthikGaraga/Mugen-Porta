import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    // Dev access (or admin)
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'developer' && decoded.role !== 'dev')) return null;
    return decoded;
}

export async function GET() {
    try {
        const admin = await checkAdmin();
        if (!admin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const [rows] = await pool.execute(`
            SELECT username, request_count, last_request_time, banned_until, violation_level
            FROM ai_mentor_limits
            WHERE banned_until IS NOT NULL AND banned_until > NOW()
            ORDER BY banned_until DESC
        `);

        return NextResponse.json({ bannedUsers: rows });
    } catch (error: any) {
        console.error('Fetch Bans Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
