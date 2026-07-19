import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'developer' && decoded.role !== 'dev')) return null;
    return decoded;
}

export async function POST(request: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { username } = await request.json();

        if (!username) {
            return NextResponse.json({ message: 'Username is required' }, { status: 400 });
        }

        await pool.execute(`
            UPDATE ai_mentor_limits
            SET banned_until = NULL, violation_level = 0
            WHERE username = ?
        `, [username]);

        return NextResponse.json({ message: 'User unlocked successfully' });
    } catch (error: any) {
        console.error('Unlock User Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
