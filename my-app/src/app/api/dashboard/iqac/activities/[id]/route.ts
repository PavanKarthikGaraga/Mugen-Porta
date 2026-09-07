import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function checkIqacUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.username !== 'iqac') return null;
    return decoded;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const user = await checkIqacUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const id = params.id;
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const user = await checkIqacUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const id = params.id;

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
