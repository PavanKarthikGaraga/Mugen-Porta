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
