import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { ensureIqacTables } from '@/lib/dbMigrate';

async function checkIqacUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.username !== 'IQAC') return null;
    return decoded;
}

export async function GET(request: Request) {
    try {
        const user = await checkIqacUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await ensureIqacTables();

        const [rows] = await pool.execute(`
            SELECT id, activity_code, title, activity_date, start_time, end_time, venue, created_at
            FROM iqac_activities
            ORDER BY created_at DESC
        `);

        return NextResponse.json({ activities: rows });
    } catch (error: any) {
        console.error('IQAC Activities list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await checkIqacUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { activity_code, title, activity_date, start_time, end_time, venue } = body;

        if (!activity_code || !title || !activity_date || !start_time || !end_time || !venue) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        await ensureIqacTables();

        const [result] = await pool.execute(`
            INSERT INTO iqac_activities
            (activity_code, title, activity_date, start_time, end_time, venue, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            activity_code, title, activity_date, start_time, end_time, venue, user.username
        ]);

        const insertId = (result as any).insertId;
        return NextResponse.json({ success: true, id: insertId, message: 'Activity created successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('Create IQAC activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to create activity.') }, { status: 500 });
    }
}
