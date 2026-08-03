import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { getCouncilScope } from '@/lib/councilScope';

async function ensureSamamAccessColumn() {
    try {
        await pool.execute(
            `ALTER TABLE students ADD COLUMN samam_access TINYINT(1) NOT NULL DEFAULT 0`
        );
    } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
}

async function ensureAuditTable() {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS samam_access_log (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(20) NOT NULL,
                student_name VARCHAR(100),
                club_id VARCHAR(20),
                action ENUM('granted','revoked') NOT NULL,
                changed_by VARCHAR(50) NOT NULL,
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch {}
}

// For council: the club IDs across all of their assigned domains, or null
// if the caller is not council (i.e. admin, unrestricted).
async function getCouncilClubScope(auth: any): Promise<string[] | null> {
    return getCouncilScope(auth.user.role, auth.user.username);
}

// GET /api/dashboard/admin/samam-access
// ?type=log          → audit log (last 100 entries)
// ?clubId=TEC01      → students in that club
// ?search=<query>    → students by registration ID or name, regardless of
//                       club — 1st years defer club selection until their
//                       Career Roadmap is generated, so they have no clubId
//                       to find them by until then
// (no params)        → all clubs grouped by domain
//
// Council callers are scoped to their assigned domain automatically: the
// clubs list is filtered to that domain, a clubId outside it is rejected,
// search results are filtered to clubs in that domain (so a council member
// never sees another domain's or an unclubbed student), and the audit log
// only shows entries for clubs in that domain.
export async function GET(request: Request) {
    const auth = await requireAuth(['admin', 'council']);
    if (auth.response) return auth.response;

    const scope = await getCouncilClubScope(auth); // null for admin, string[] for council

    const { searchParams } = new URL(request.url);
    const type   = searchParams.get('type');
    const clubId = searchParams.get('clubId');
    const search = searchParams.get('search');

    try {
        if (type === 'log') {
            await ensureAuditTable();
            let logs: any[];
            if (scope) {
                if (scope.length === 0) return NextResponse.json({ success: true, logs: [] });
                const ph = scope.map(() => '?').join(',');
                [logs] = await pool.execute(`
                    SELECT id, username, student_name, club_id, action, changed_by, changed_at
                    FROM samam_access_log
                    WHERE club_id IN (${ph})
                    ORDER BY changed_at DESC
                    LIMIT 100
                `, scope) as any;
            } else {
                [logs] = await pool.execute(`
                    SELECT id, username, student_name, club_id, action, changed_by, changed_at
                    FROM samam_access_log
                    ORDER BY changed_at DESC
                    LIMIT 100
                `) as any;
            }
            return NextResponse.json({ success: true, logs });
        }

        await ensureSamamAccessColumn();

        if (search) {
            if (scope && scope.length === 0) return NextResponse.json({ success: true, students: [] });
            const like = `%${search.trim()}%`;
            const scopeClause = scope ? `AND s.clubId IN (${scope.map(() => '?').join(',')})` : '';
            const [students]: any = await pool.execute(
                `SELECT s.username, s.name, s.branch, s.year, s.clubId, c.name AS clubName,
                        COALESCE(s.samam_access, 0) as samam_access
                 FROM students s
                 LEFT JOIN clubs c ON s.clubId = c.id
                 WHERE (s.username LIKE ? OR s.name LIKE ?) ${scopeClause}
                 ORDER BY s.name ASC
                 LIMIT 30`,
                scope ? [like, like, ...scope] : [like, like]
            );
            return NextResponse.json({ success: true, students: students as any[] });
        }

        if (!clubId) {
            const [clubs]: any = scope
                ? scope.length > 0
                    ? await pool.execute(`SELECT id, name, domain FROM clubs WHERE id IN (${scope.map(() => '?').join(',')}) ORDER BY name ASC`, scope)
                    : [[]]
                : await pool.execute(`SELECT id, name, domain FROM clubs ORDER BY domain ASC, name ASC`);
            return NextResponse.json({ success: true, clubs: clubs as any[] });
        }

        if (scope && !scope.includes(clubId)) {
            return NextResponse.json({ success: false, error: 'Club is not in your domain' }, { status: 403 });
        }

        const [students]: any = await pool.execute(
            `SELECT username, name, branch, year, COALESCE(samam_access, 0) as samam_access
             FROM students
             WHERE clubId = ?
             ORDER BY name ASC`,
            [clubId]
        );
        return NextResponse.json({ success: true, students: students as any[] });
    } catch (error: any) {
        console.error('SAMAM access GET error:', error);
        return NextResponse.json({ success: false, error: safeMessage(error) }, { status: 500 });
    }
}

// POST /api/dashboard/admin/samam-access
// Body: { usernames: string[], access: 1 | 0 }
//
// Council callers may only grant/revoke students whose club falls within
// their assigned domain -- any username outside that scope is rejected.
export async function POST(request: Request) {
    const auth = await requireAuth(['admin', 'council']);
    if (auth.response) return auth.response;

    const scope = await getCouncilClubScope(auth); // null for admin, string[] for council

    try {
        await ensureSamamAccessColumn();
        await ensureAuditTable();

        const body = await request.json().catch(() => ({}));
        const { usernames, access } = body;

        if (!Array.isArray(usernames) || usernames.length === 0) {
            return NextResponse.json({ success: false, error: 'No students selected' }, { status: 400 });
        }

        const accessValue = access === 0 ? 0 : 1;
        const action: 'granted' | 'revoked' = accessValue === 1 ? 'granted' : 'revoked';
        const placeholders = usernames.map(() => '?').join(', ');

        if (scope) {
            if (scope.length === 0) {
                return NextResponse.json({ success: false, error: 'No clubs in your domain' }, { status: 403 });
            }
            const [ownerRows]: any = await pool.execute(
                `SELECT username, clubId FROM students WHERE username IN (${placeholders})`,
                usernames
            );
            const outOfScope = (ownerRows as any[]).some((s: any) => !scope.includes(s.clubId));
            if (outOfScope) {
                return NextResponse.json({ success: false, error: 'One or more students are outside your domain' }, { status: 403 });
            }
        }

        const [result]: any = await pool.execute(
            `UPDATE students SET samam_access = ? WHERE username IN (${placeholders})`,
            [accessValue, ...usernames]
        );

        // Write audit log
        try {
            const [studentRows]: any = await pool.execute(
                `SELECT username, name, clubId FROM students WHERE username IN (${placeholders})`,
                usernames
            );
            if ((studentRows as any[]).length > 0) {
                const logPh = (studentRows as any[]).map(() => '(?, ?, ?, ?, ?)').join(', ');
                const flat  = (studentRows as any[]).flatMap((s: any) => [
                    s.username, s.name, s.clubId, action, auth.user.username as string,
                ]);
                await pool.execute(
                    `INSERT INTO samam_access_log (username, student_name, club_id, action, changed_by) VALUES ${logPh}`,
                    flat
                );
            }
        } catch (logErr) {
            console.error('Audit log write failed (non-fatal):', logErr);
        }

        return NextResponse.json({
            success: true,
            updated: (result as any).affectedRows,
            action,
        });
    } catch (error: any) {
        console.error('SAMAM access POST error:', error);
        return NextResponse.json({ success: false, error: safeMessage(error) }, { status: 500 });
    }
}
