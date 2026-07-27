import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function getStudentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'student') return null;
    return decoded;
}

export async function GET() {
    try {
        const user = await getStudentUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const [rows] = await pool.execute(`
            SELECT id, type, title, message, is_read as 'read', created_at as time
            FROM notifications
            WHERE username = ?
            ORDER BY created_at DESC
        `, [user.username] as any[]);

        // Format dates correctly for the frontend
        const notifications = (rows as any[]).map(row => ({
            ...row,
            read: Boolean(row.read),
            time: new Date(row.time).toLocaleString()
        }));

        return NextResponse.json({ success: true, notifications });

    } catch (error: any) {
        // Table hasn't been created yet — return empty list instead of 500
        if (error?.code === 'ER_NO_SUCH_TABLE') {
            return NextResponse.json({ success: true, notifications: [] });
        }
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
