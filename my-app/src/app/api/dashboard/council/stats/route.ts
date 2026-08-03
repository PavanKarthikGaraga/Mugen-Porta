import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';
import { getCouncilDomains } from '@/lib/councilScope';

export async function GET(request: Request) {
    const auth = await requireAuth(['council']);
    if (auth.response) return auth.response;
    const username = auth.user.username as string;

    try {
        const domains = await getCouncilDomains(username);
        if (!domains.length) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        const { searchParams } = new URL(request.url);
        const clubId = searchParams.get('clubId');
        const domainFilter = searchParams.get('domain');
        if (domainFilter && !domains.includes(domainFilter)) {
            return NextResponse.json({ error: 'Domain not assigned to you' }, { status: 403 });
        }
        const scopedDomains = domainFilter ? [domainFilter] : domains;

        const domainPh = scopedDomains.map(() => '?').join(',');
        const [clubRows]: any = await pool.execute(
            `SELECT id FROM clubs WHERE domain IN (${domainPh})`, scopedDomains
        );
        const allClubIds = (clubRows as any[]).map((c: any) => c.id);
        if (!allClubIds.length) {
            return NextResponse.json({ totalStudents: 0, recentRegistrations: 0, yearWiseCount: {}, domainWiseCount: {} });
        }

        if (clubId && !allClubIds.includes(clubId)) {
            return NextResponse.json({ error: 'Club not in your domain' }, { status: 403 });
        }

        const clubsToQuery = clubId ? [clubId] : allClubIds;
        const ph = clubsToQuery.map(() => '?').join(',');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoff = thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ');

        const [[{ count: totalStudents }]]: any = await pool.execute(
            `SELECT COUNT(*) as count FROM students WHERE clubId IN (${ph})`, clubsToQuery
        );
        const [[{ count: recentRegistrations }]]: any = await pool.execute(
            `SELECT COUNT(*) as count FROM students WHERE clubId IN (${ph}) AND created_at >= ?`,
            [...clubsToQuery, cutoff]
        );
        const [yearWise]: any = await pool.execute(
            `SELECT year, COUNT(*) as count FROM students WHERE clubId IN (${ph}) GROUP BY year`, clubsToQuery
        );
        const [domainWise]: any = await pool.execute(
            `SELECT selectedDomain, COUNT(*) as count FROM students WHERE clubId IN (${ph}) GROUP BY selectedDomain`, clubsToQuery
        );

        const yearWiseCount: Record<string, number> = {};
        (yearWise as any[]).forEach((r: any) => { yearWiseCount[r.year] = Number(r.count); });
        const domainWiseCount: Record<string, number> = {};
        (domainWise as any[]).forEach((r: any) => { domainWiseCount[r.selectedDomain] = Number(r.count); });

        return NextResponse.json({ totalStudents: Number(totalStudents), recentRegistrations: Number(recentRegistrations), yearWiseCount, domainWiseCount, domains });
    } catch (error: any) {
        console.error('Council stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
