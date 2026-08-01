import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';

export async function GET() {
    const auth = await requireAuth(['council']);
    if (auth.response) return auth.response;
    const username = auth.user.username as string;

    try {
        const [rows]: any = await pool.execute(
            `SELECT u.username, u.name, u.email, u.created_at, c.assignedDomain
             FROM users u JOIN council c ON u.username = c.username
             WHERE u.username = ?`, [username]
        );
        if (!rows.length) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        return NextResponse.json({ user: rows[0] });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
