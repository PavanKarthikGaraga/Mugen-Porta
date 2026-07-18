import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

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
            time: new Date(row.time).toLocaleString() // Or a relative time formatter if preferred
        }));

        return NextResponse.json({ success: true, notifications });

    } catch (error: any) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
