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

// GET /api/activities/[id]/discussion
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getStudentUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params;

        const [rows] = await pool.execute(`
            SELECT d.id, d.message, d.created_at, s.name as user
            FROM activity_discussions d
            JOIN students s ON d.username = s.username
            WHERE d.activity_code = ?
            ORDER BY d.created_at ASC
        `, [id]);

        // Format for frontend
        const messages = (rows as any[]).map(row => {
            const date = new Date(row.created_at);
            // Simple time formatter, you might want to use a relative time library like date-fns on the frontend
            const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
                id: row.id,
                user: row.user,
                time: timeStr,
                message: row.message
            };
        });

        return NextResponse.json({ success: true, messages });

    } catch (error: any) {
        console.error('Fetch discussions error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/activities/[id]/discussion
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getStudentUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        const { message } = await request.json();

        if (!message || message.trim() === '') {
            return NextResponse.json({ message: 'Message cannot be empty' }, { status: 400 });
        }

        await pool.execute(`
            INSERT INTO activity_discussions (activity_code, username, message)
            VALUES (?, ?, ?)
        `, [id, user.username, message]);

        return NextResponse.json({ success: true, message: 'Posted successfully' });

    } catch (error: any) {
        console.error('Post discussion error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
