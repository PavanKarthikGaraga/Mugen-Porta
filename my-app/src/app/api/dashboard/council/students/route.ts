import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';

// Resolve the council user's assigned domains with maximum fallback.
// Handles both the modern multi-domain column (assignedDomains JSON) and the
// legacy single-domain column (assignedDomain VARCHAR).  Self-heals the schema
// by adding assignedDomains if it's missing — the same migration that
// ensureCouncilTable() in the admin users route does, but triggered here so
// the students page works even before admin ever visits the users page.
async function resolveCouncilDomains(username: string): Promise<string[]> {
    // Try the modern multi-domain column first.
    let row: any = null;
    try {
        const [rows]: any = await pool.execute(
            'SELECT assignedDomains, assignedDomain FROM council WHERE username = ?',
            [username]
        );
        if ((rows as any[]).length) row = (rows as any[])[0];
    } catch (e: any) {
        if (e.code === 'ER_BAD_FIELD_ERROR') {
            // assignedDomains column missing — add it, then read only assignedDomain.
            try {
                await pool.query('ALTER TABLE council ADD COLUMN assignedDomains JSON NULL');
            } catch (me: any) {
                if (me.code !== 'ER_DUP_FIELDNAME') console.warn('[council] schema migration:', me.message);
            }
            try {
                const [rows]: any = await pool.execute(
                    'SELECT assignedDomain FROM council WHERE username = ?',
                    [username]
                );
                if ((rows as any[]).length) row = (rows as any[])[0];
            } catch { /* no-op — row stays null */ }
        } else {
            throw e;
        }
    }

    if (!row) return [];

    // Modern column first.
    if (row.assignedDomains) {
        try {
            const parsed = typeof row.assignedDomains === 'string'
                ? JSON.parse(row.assignedDomains)
                : row.assignedDomains;
            if (Array.isArray(parsed) && parsed.length) {
                const valid = parsed.filter((d: any) => typeof d === 'string' && d);
                if (valid.length) return valid;
            }
        } catch { /* fall through */ }
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

        // Build the WHERE clause.  We try selectedDomain first (populated on
        // student registration).  If that column doesn't exist in this DB we
        // catch the error and fall back to filtering via the clubs table.
        const conditions: string[] = [];
        const params: any[]        = [];

        // Validate optional club filter.
        if (clubId) {
            const [clubRows]: any = await pool.execute(
                `SELECT id FROM clubs WHERE id = ? AND domain IN (${domainPh})`,
                [clubId, ...scopedDomains]
            );
            if (!(clubRows as any[]).length) {
                return NextResponse.json({ error: 'Club not in your domain' }, { status: 403 });
            }
            conditions.push('s.clubId = ?');
            params.push(clubId);
        }

        if (search) {
            conditions.push('(s.name LIKE ? OR s.username LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        if (year) {
            conditions.push('s.year = ?');
            params.push(year);
        }

        // ── domain scoping ─────────────────────────────────────────────────
        // Try selectedDomain column; fall back to clubId-via-clubs if missing.
        let domainCondition = `s.selectedDomain IN (${domainPh})`;
        let domainParams    = [...scopedDomains];

        // Quick probe: does selectedDomain exist?
        try {
            await pool.execute(
                `SELECT 1 FROM students s WHERE s.selectedDomain IN (${domainPh}) LIMIT 0`,
                scopedDomains
            );
        } catch (probe: any) {
            if (probe.code === 'ER_BAD_FIELD_ERROR') {
                // Fall back: scope by club membership
                domainCondition = `s.clubId IN (SELECT id FROM clubs WHERE domain IN (${domainPh}))`;
                domainParams    = [...scopedDomains];
            } else {
                throw probe;
            }
        }

        conditions.unshift(domainCondition);
        params.unshift(...domainParams);

        const where = conditions.join(' AND ');

        const [[{ total }]]: any = await pool.execute(
            `SELECT COUNT(*) as total FROM students s WHERE ${where}`,
            params
        );

        const [students]: any = await pool.execute(
            `SELECT s.username, s.name, s.email, s.gender, s.year, s.branch,
                    s.phoneNumber, s.residenceType, s.hostelName, s.busRoute,
                    s.clubId, c.name as clubName, c.domain as clubDomain
             FROM students s
             LEFT JOIN clubs c ON s.clubId = c.id
             WHERE ${where}
             ORDER BY s.name ASC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return NextResponse.json({
            students,
            total:   Number(total),
            pages:   Math.ceil(Number(total) / limit),
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
