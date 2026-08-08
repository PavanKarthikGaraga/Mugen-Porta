import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';

async function resolveCouncilDomains(username: string): Promise<string[]> {
    let row: any = null;

    // Try modern multi-domain column first.
    try {
        const [rows]: any = await pool.execute(
            'SELECT assignedDomains, assignedDomain FROM council WHERE username = ?',
            [username]
        );
        if ((rows as any[]).length) row = (rows as any[])[0];
    } catch (e: any) {
        if (e.code !== 'ER_BAD_FIELD_ERROR') throw e;
        // Column missing — add it, then fall back to the single-domain column.
        try { await pool.query('ALTER TABLE council ADD COLUMN assignedDomains JSON NULL'); } catch {}
        try {
            const [rows]: any = await pool.execute(
                'SELECT assignedDomain FROM council WHERE username = ?', [username]
            );
            if ((rows as any[]).length) row = (rows as any[])[0];
        } catch {}
    }

    if (!row) return [];

    if (row.assignedDomains) {
        try {
            const parsed = typeof row.assignedDomains === 'string'
                ? JSON.parse(row.assignedDomains) : row.assignedDomains;
            if (Array.isArray(parsed)) {
                const valid = parsed.filter((d: any) => typeof d === 'string' && d);
                if (valid.length) return valid;
            }
        } catch {}
    }

    return row.assignedDomain ? [row.assignedDomain] : [];
}

export async function GET(request: Request) {
    const auth = await requireAuth(['council']);
    if (auth.response) return auth.response;
    const username = auth.user.username as string;

    try {
        const domains = await resolveCouncilDomains(username);
        if (!domains.length) {
            return NextResponse.json({ error: 'No domains assigned to your account' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const exportAll    = searchParams.get('all') === 'true';
        const search       = searchParams.get('search')   || '';
        const year         = searchParams.get('year')     || '';
        const domainFilter = searchParams.get('domain')   || '';
        const clubId       = searchParams.get('clubId')   || '';
        const page         = Math.max(1, parseInt(searchParams.get('page')  || '1'));
        const limit        = exportAll ? 100000 : Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
        const offset       = exportAll ? 0 : (page - 1) * limit;

        if (domainFilter && !domains.includes(domainFilter)) {
            return NextResponse.json({ error: 'Domain not assigned to you' }, { status: 403 });
        }

        const scopedDomains = domainFilter ? [domainFilter] : domains;
        const domainPh      = scopedDomains.map(() => '?').join(',');

        // Validate optional club filter.
        if (clubId) {
            const [clubRows]: any = await pool.execute(
                `SELECT id FROM clubs WHERE id = ? AND domain IN (${domainPh})`,
                [clubId, ...scopedDomains]
            );
            if (!(clubRows as any[]).length) {
                return NextResponse.json({ error: 'Club not in your domain' }, { status: 403 });
            }
        }

        // Build WHERE conditions and params (domain scoping added below).
        const conditions: string[] = [];
        const params: any[]        = [];

        if (clubId) { conditions.push('s.clubId = ?');                              params.push(clubId); }
        if (search)  { conditions.push('(s.name LIKE ? OR s.username LIKE ?)');     params.push(`%${search}%`, `%${search}%`); }
        if (year)    { conditions.push('s.year = ?');                                params.push(year); }

        // Scope by domain.  Try selectedDomain (populated at registration) and
        // fall back to club membership if the column doesn't exist in this DB.
        async function buildWithDomain(useDomainCol: boolean) {
            const domainCond = useDomainCol
                ? `s.selectedDomain IN (${domainPh})`
                : `s.clubId IN (SELECT id FROM clubs WHERE domain IN (${domainPh}))`;

            const fullConditions = [domainCond, ...conditions];
            const fullParams     = [...scopedDomains, ...params];
            const where          = fullConditions.join(' AND ');

            const [[{ total }]]: any = await pool.execute(
                `SELECT COUNT(*) as total FROM students s WHERE ${where}`,
                fullParams
            );

            // LIMIT / OFFSET interpolated as integers — avoids the
            // "Incorrect arguments to mysqld_stmt_execute" error that some
            // MySQL versions throw when LIMIT/OFFSET are bound parameters.
            const [students]: any = await pool.execute(
                `SELECT s.username, s.name, s.email, s.gender, s.year, s.branch,
                        s.phoneNumber, s.residenceType, s.hostelName, s.busRoute,
                        s.clubId, c.name AS clubName, c.domain AS clubDomain
                 FROM students s
                 LEFT JOIN clubs c ON s.clubId = c.id
                 WHERE ${where}
                 ORDER BY s.name ASC
                 LIMIT ${limit} OFFSET ${offset}`,
                fullParams
            );

            return { students, total: Number(total) };
        }

        let result: { students: any[]; total: number };
        try {
            result = await buildWithDomain(true);
        } catch (e: any) {
            if (e.code === 'ER_BAD_FIELD_ERROR') {
                result = await buildWithDomain(false);
            } else {
                throw e;
            }
        }

        return NextResponse.json({
            students: result.students,
            total:    result.total,
            pages:    Math.ceil(result.total / limit),
            page,
            domains,
        });

    } catch (error: any) {
        console.error('Council students error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch students' },
            { status: 500 }
        );
    }
}
