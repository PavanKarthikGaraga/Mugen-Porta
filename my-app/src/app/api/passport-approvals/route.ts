import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded) return null;
    return decoded;
}

export async function GET(request: Request) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const role = user.role as string;
        const username = user.username as string;

        if (!['admin', 'faculty', 'lead', 'council'].includes(role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let rows: any[];

        if (role === 'admin') {
            const [result]: any = await pool.execute(`
                SELECT pvr.*, s.name AS student_name, s.branch, s.year, s.clubId, c.name AS club_name
                FROM passport_verification_requests pvr
                JOIN students s ON pvr.username = s.username
                LEFT JOIN clubs c ON s.clubId = c.id
                ORDER BY pvr.submitted_at DESC
            `);
            rows = result;
        } else if (role === 'faculty') {
            const [facRows]: any = await pool.execute('SELECT assignedClubs FROM faculty WHERE username = ?', [username]);
            if (facRows.length === 0) return NextResponse.json({ requests: [] });
            let clubs: string[] = [];
            try {
                clubs = Array.isArray(facRows[0].assignedClubs)
                    ? facRows[0].assignedClubs
                    : JSON.parse(facRows[0].assignedClubs ?? '[]');
            } catch { clubs = []; }
            if (clubs.length === 0) return NextResponse.json({ requests: [] });

            const ph = clubs.map(() => '?').join(',');
            const [result]: any = await pool.execute(`
                SELECT pvr.*, s.name AS student_name, s.branch, s.year, s.clubId, c.name AS club_name
                FROM passport_verification_requests pvr
                JOIN students s ON pvr.username = s.username
                LEFT JOIN clubs c ON s.clubId = c.id
                WHERE s.clubId IN (${ph})
                ORDER BY pvr.submitted_at DESC
            `, clubs);
            rows = result;
        } else if (role === 'council') {
            const [cRows]: any = await pool.execute('SELECT assignedDomain FROM council WHERE username = ?', [username]);
            if (cRows.length === 0) return NextResponse.json({ requests: [] });
            const domain = cRows[0].assignedDomain;
            const [clubRows]: any = await pool.execute('SELECT id FROM clubs WHERE domain = ?', [domain]);
            const clubIds: string[] = (clubRows as any[]).map((c: any) => c.id as string);
            if (clubIds.length === 0) return NextResponse.json({ requests: [] });
            const ph = clubIds.map(() => '?').join(',');
            const [result]: any = await pool.execute(`
                SELECT pvr.*, s.name AS student_name, s.branch, s.year, s.clubId, c.name AS club_name
                FROM passport_verification_requests pvr
                JOIN students s ON pvr.username = s.username
                LEFT JOIN clubs c ON s.clubId = c.id
                WHERE s.clubId IN (${ph})
                ORDER BY pvr.submitted_at DESC
            `, clubIds);
            rows = result;
        } else {
            // lead
            const [leadRows]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [username]);
            if (leadRows.length === 0) return NextResponse.json({ requests: [] });
            const clubId = leadRows[0].clubId;

            const [result]: any = await pool.execute(`
                SELECT pvr.*, s.name AS student_name, s.branch, s.year, s.clubId, c.name AS club_name
                FROM passport_verification_requests pvr
                JOIN students s ON pvr.username = s.username
                LEFT JOIN clubs c ON s.clubId = c.id
                WHERE s.clubId = ?
                ORDER BY pvr.submitted_at DESC
            `, [clubId]);
            rows = result;
        }

        return NextResponse.json({ requests: rows });
    } catch (error: any) {
        console.error('Passport approvals list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch passport approvals') }, { status: 500 });
    }
}
