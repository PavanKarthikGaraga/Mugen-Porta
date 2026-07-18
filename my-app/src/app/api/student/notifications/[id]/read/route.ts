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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getStudentUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params;

        await pool.execute(`
            UPDATE notifications 
            SET is_read = TRUE 
            WHERE id = ? AND username = ?
        `, [id, user.username] as any[]);

        return NextResponse.json({ success: true, message: 'Notification marked as read' });

    } catch (error: any) {
        console.error('Mark notification read error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
