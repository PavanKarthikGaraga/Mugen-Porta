import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'lead') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        if (type !== 'Hostel' && type !== 'Day Scholar') {
            return NextResponse.json({ error: 'type must be "Hostel" or "Day Scholar"' }, { status: 400 });
        }

        const [leadRows]: any = await pool.execute(
            'SELECT clubId FROM leads WHERE username = ?',
            [payload.username as string]
        );
        if (leadRows.length === 0 || !leadRows[0].clubId) {
            return NextResponse.json({ error: 'No club assigned' }, { status: 403 });
        }
        const clubId = leadRows[0].clubId;

        const [students]: any = await pool.execute(
            `SELECT s.username, s.name, s.year, s.branch, s.residenceType, s.hostelName, s.busRoute, c.name AS clubName
             FROM students s
             LEFT JOIN clubs c ON s.clubId = c.id
             WHERE s.clubId = ? AND s.residenceType = ?
             ORDER BY s.name ASC`,
            [clubId, type]
        );

        return NextResponse.json({ students });
    } catch (error: any) {
        console.error('Lead residence-list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch residence list') }, { status: 500 });
    }
}
