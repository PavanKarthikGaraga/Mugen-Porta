import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { ensureNotificationsTable } from '@/lib/dbMigrate';

async function getStudentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'student') return null;
    return decoded;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getStudentUser();
        if (!user || !user.username) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params;

        await ensureNotificationsTable();

        const [result]: any = await pool.execute(`
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = ? AND username = ?
        `, [id, user.username] as any[]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Notification marked as read' });

    } catch (error: any) {
        console.error('Mark notification read error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
