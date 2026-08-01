import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

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

// GET /api/dashboard/admin/samam-access
// ?type=log          → audit log (last 100 entries)
// ?clubId=TEC01      → students in that club
// (no params)        → all clubs grouped by domain
export async function GET(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const type   = searchParams.get('type');
    const clubId = searchParams.get('clubId');

    try {
        if (type === 'log') {
            await ensureAuditTable();
            const [logs]: any = await pool.execute(`
                SELECT id, username, student_name, club_id, action, changed_by, changed_at
                FROM samam_access_log
                ORDER BY changed_at DESC
                LIMIT 100
            `);
            return NextResponse.json({ success: true, logs: logs as any[] });
        }

        await ensureSamamAccessColumn();

        if (!clubId) {
            const [clubs]: any = await pool.execute(
                `SELECT id, name, domain FROM clubs ORDER BY domain ASC, name ASC`
            );
            return NextResponse.json({ success: true, clubs: clubs as any[] });
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
export async function POST(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

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
