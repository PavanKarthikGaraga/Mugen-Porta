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
        if (!payload || payload.role !== 'faculty') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        if (type !== 'Hostel' && type !== 'Day Scholar') {
            return NextResponse.json({ error: 'type must be "Hostel" or "Day Scholar"' }, { status: 400 });
        }

        const [facRows]: any = await pool.execute(
            'SELECT assignedClubs FROM faculty WHERE username = ?',
            [payload.username as string]
        );
        if (facRows.length === 0) return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });

        let assignedClubs: string[] = [];
        try {
            assignedClubs = Array.isArray(facRows[0].assignedClubs)
                ? facRows[0].assignedClubs
                : JSON.parse(facRows[0].assignedClubs ?? '[]');
        } catch { assignedClubs = []; }

        if (assignedClubs.length === 0) return NextResponse.json({ students: [] });

        const ph = assignedClubs.map(() => '?').join(',');
        const [students]: any = await pool.execute(
            `SELECT s.username, s.name, s.year, s.branch, s.residenceType, s.hostelName, s.busRoute, c.name AS clubName
             FROM students s
             LEFT JOIN clubs c ON s.clubId = c.id
             WHERE s.clubId IN (${ph}) AND s.residenceType = ?
             ORDER BY s.name ASC`,
            [...assignedClubs, type]
        );

        return NextResponse.json({ students });
    } catch (error: any) {
        console.error('Faculty residence-list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch residence list') }, { status: 500 });
    }
}
