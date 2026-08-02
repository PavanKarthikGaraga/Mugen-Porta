import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
    try {
        // Auth: get clubId from JWT — no longer a client-supplied param
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'lead') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [leadRows]: any = await pool.execute(
            'SELECT clubId FROM leads WHERE username = ?',
            [payload.username]
        );
        if (leadRows.length === 0 || !leadRows[0].clubId) {
            return NextResponse.json({ error: 'No club assigned' }, { status: 403 });
        }
        const clubId = leadRows[0].clubId;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Run all queries in parallel
        const [[totalRes], [recentRes], [yearRes], [residenceRes]]: any[] = await Promise.all([
            pool.execute('SELECT COUNT(*) as count FROM students WHERE clubId = ?', [clubId]),
            pool.execute('SELECT COUNT(*) as count FROM students WHERE clubId = ? AND created_at >= ?', [clubId, thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ')]),
            pool.execute('SELECT year, COUNT(*) as count FROM students WHERE clubId = ? GROUP BY year ORDER BY year', [clubId]),
            pool.execute('SELECT residenceType, COUNT(*) as count FROM students WHERE clubId = ? GROUP BY residenceType', [clubId]),
        ]);

        const yearWiseCount: Record<string, number> = {};
        (yearRes as any[]).forEach(row => { yearWiseCount[row.year] = row.count; });

        const residenceWiseCount: Record<string, number> = { Hostel: 0, 'Day Scholar': 0 };
        (residenceRes as any[]).forEach(row => { if (row.residenceType) residenceWiseCount[row.residenceType] = row.count; });

        return NextResponse.json({
            totalStudents: (totalRes as any[])[0].count,
            recentRegistrations: (recentRes as any[])[0].count,
            yearWiseCount,
            residenceWiseCount,
        });
    } catch (error) {
        console.error('Lead stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch lead dashboard stats' }, { status: 500 });
    }
}
