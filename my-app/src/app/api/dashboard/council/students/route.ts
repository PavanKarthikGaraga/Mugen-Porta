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
        const exportAll = searchParams.get('all') === 'true';
        const search = searchParams.get('search') || '';
        const year = searchParams.get('year') || '';
        const domainFilter = searchParams.get('domain') || '';
        const clubId = searchParams.get('clubId') || '';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = exportAll ? 100000 : Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
        const offset = exportAll ? 0 : (page - 1) * limit;

        if (domainFilter && !domains.includes(domainFilter)) {
            return NextResponse.json({ error: 'Domain not assigned to you' }, { status: 403 });
        }
        // Students list can be filtered domain-wise then club-wise: pick a
        // domain first to narrow which clubs are offered, or leave it
        // unset to see every club across all assigned domains.
        const scopedDomains = domainFilter ? [domainFilter] : domains;

        const domainPh = scopedDomains.map(() => '?').join(',');
        const [clubRows]: any = await pool.execute(`SELECT id FROM clubs WHERE domain IN (${domainPh})`, scopedDomains);
        const allClubIds = (clubRows as any[]).map((c: any) => c.id as string);
        if (!allClubIds.length) return NextResponse.json({ students: [], total: 0, pages: 0, page });

        if (clubId && !allClubIds.includes(clubId)) {
            return NextResponse.json({ error: 'Club not in your domain' }, { status: 403 });
        }

        const clubsToQuery = clubId ? [clubId] : allClubIds;
        const ph = clubsToQuery.map(() => '?').join(',');

        const conditions: string[] = [`s.clubId IN (${ph})`];
        const params: any[] = [...clubsToQuery];

        if (search) { conditions.push('(s.name LIKE ? OR s.username LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
        if (year) { conditions.push('s.year = ?'); params.push(year); }

        const where = conditions.join(' AND ');

        const [[{ total }]]: any = await pool.execute(
            `SELECT COUNT(*) as total FROM students s WHERE ${where}`, params
        );
        const [students]: any = await pool.execute(
            `SELECT s.username, s.name, s.email, s.gender, s.year, s.branch, s.phoneNumber,
                    s.residenceType, s.hostelName, s.busRoute, s.clubId, c.name as clubName, c.domain as clubDomain
             FROM students s LEFT JOIN clubs c ON s.clubId = c.id
             WHERE ${where} ORDER BY s.name ASC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return NextResponse.json({ students, total: Number(total), pages: Math.ceil(Number(total) / limit), page, domains });
    } catch (error: any) {
        console.error('Council students error:', error);
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }
}
