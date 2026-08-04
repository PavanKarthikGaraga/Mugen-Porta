import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { getLeadClubIds } from '@/lib/leadScope';

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

        const clubIds = await getLeadClubIds(payload.username as string);
        if (clubIds.length === 0) {
            return NextResponse.json({ error: 'No club assigned' }, { status: 403 });
        }

        const [students]: any = await pool.execute(
            `SELECT s.username, s.name, s.year, s.branch, s.residenceType, s.hostelName, s.busRoute, c.name AS clubName
             FROM students s
             LEFT JOIN clubs c ON s.clubId = c.id
             WHERE s.clubId IN (${clubIds.map(() => '?').join(',')}) AND s.residenceType = ?
             ORDER BY s.name ASC`,
            [...clubIds, type]
        );

        return NextResponse.json({ students });
    } catch (error: any) {
        console.error('Lead residence-list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch residence list') }, { status: 500 });
    }
}
