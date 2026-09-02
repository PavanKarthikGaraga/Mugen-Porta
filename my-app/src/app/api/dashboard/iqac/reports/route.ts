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

export async function GET(request: Request) {
    try {
        const user = await checkIqacUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await ensureIqacTables();

        const [rows] = await pool.execute(`
            SELECT 
                a.id as activity_id, a.activity_code, a.title, a.activity_date,
                r.id as report_id, COALESCE(r.status, 'draft') as status
            FROM iqac_activities a
            LEFT JOIN iqac_activity_reports r ON a.activity_code = r.activity_code
            ORDER BY a.created_at DESC
        `);

        return NextResponse.json({ reports: rows });
    } catch (error: any) {
        console.error('IQAC Reports list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong.') }, { status: 500 });
    }
}
