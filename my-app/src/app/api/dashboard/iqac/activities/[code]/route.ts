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
    if (!decoded || decoded.username !== 'iqac') return null;
    return decoded;
}

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
    try {
        const user = await checkIqacUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await ensureIqacTables();
        const { code } = await context.params;

        const [rows] = await pool.execute(`
            SELECT * FROM iqac_activities WHERE activity_code = ?
        `, [code]);

        const activities = rows as any[];
        if (activities.length === 0) {
            return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ activity: activities[0] });
    } catch (error: any) {
        console.error('IQAC Activity get error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong.') }, { status: 500 });
    }
}

export async function PUT(request: Request, context: { params: Promise<{ code: string }> }) {
    try {
        const user = await checkIqacUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { code: id } = await context.params;
        const body = await request.json();
        const { activity_code, title, activity_date, start_time, end_time, venue } = body;

        if (!activity_code || !title || !activity_date || !start_time || !end_time || !venue) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        const [result] = await pool.execute(`
            UPDATE iqac_activities
            SET activity_code = ?, title = ?, activity_date = ?, start_time = ?, end_time = ?, venue = ?
            WHERE id = ?
        `, [activity_code, title, activity_date, start_time, end_time, venue, id]);

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Activity updated successfully' });

    } catch (error: any) {
        console.error('Update IQAC activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to update activity.') }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ code: string }> }) {
    try {
        const user = await checkIqacUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { code: id } = await context.params;

        const [result] = await pool.execute('DELETE FROM iqac_activities WHERE id = ?', [id]);

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Activity deleted successfully' });

    } catch (error: any) {
        console.error('Delete IQAC activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to delete activity.') }, { status: 500 });
    }
}
