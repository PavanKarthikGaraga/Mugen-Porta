import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getLeadClubIds } from '@/lib/leadScope';

export async function GET() {
    try {
        // Auth: get clubId from JWT — no longer a client-supplied param
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'lead') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Lead's parent club plus any TEC child clubs they've been mapped to.
        const clubIds = await getLeadClubIds(payload.username as string);
        if (clubIds.length === 0) {
            return NextResponse.json({ error: 'No club assigned' }, { status: 403 });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const placeholders = clubIds.map(() => '?').join(',');

        // Run all queries in parallel
        const [[totalRes], [recentRes], [yearRes], [residenceRes], [clubRes]]: any[] = await Promise.all([
            pool.execute(`SELECT COUNT(*) as count FROM students WHERE clubId IN (${placeholders})`, clubIds),
            pool.execute(`SELECT COUNT(*) as count FROM students WHERE clubId IN (${placeholders}) AND created_at >= ?`, [...clubIds, thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ')]),
            pool.execute(`SELECT year, COUNT(*) as count FROM students WHERE clubId IN (${placeholders}) GROUP BY year ORDER BY year`, clubIds),
            pool.execute(`SELECT residenceType, COUNT(*) as count FROM students WHERE clubId IN (${placeholders}) GROUP BY residenceType`, clubIds),
            // Per-club breakdown — lets a multi-club lead see how their
            // students split across their parent club and any TEC child
            // clubs, instead of only ever seeing one combined total.
            pool.execute(`
                SELECT s.clubId, c.name as clubName, COUNT(*) as count
                FROM students s
                LEFT JOIN clubs c ON s.clubId = c.id
                WHERE s.clubId IN (${placeholders})
                GROUP BY s.clubId, c.name
                ORDER BY count DESC
            `, clubIds),
        ]);

        const yearWiseCount: Record<string, number> = {};
        (yearRes as any[]).forEach(row => { yearWiseCount[row.year] = row.count; });

        const residenceWiseCount: Record<string, number> = { Hostel: 0, 'Day Scholar': 0 };
        (residenceRes as any[]).forEach(row => { if (row.residenceType) residenceWiseCount[row.residenceType] = row.count; });

        const clubWiseCount = (clubRes as any[]).map(row => ({
            clubId: row.clubId, clubName: row.clubName || row.clubId, count: row.count,
        }));

        return NextResponse.json({
            totalStudents: (totalRes as any[])[0].count,
            recentRegistrations: (recentRes as any[])[0].count,
            yearWiseCount,
            residenceWiseCount,
            clubWiseCount,
        });
    } catch (error) {
        console.error('Lead stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch lead dashboard stats' }, { status: 500 });
    }
}
