import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

/**
 * Saved (bookmarked) catalogue activities for the logged-in student.
 *
 * Keyed by activity_code rather than the catalogue's numeric id, matching
 * activity_enrollments and the rest of the activity tables. Every query is
 * scoped to the session's own username — no username is accepted from the
 * caller.
 */

const MAX_CODE_LEN = 50;

let tableReady = false;
async function ensureTable() {
    if (tableReady) return;
    await pool.query(`
        CREATE TABLE IF NOT EXISTS student_bookmarks (
            \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
            \`username\` VARCHAR(10) NOT NULL,
            \`activity_code\` VARCHAR(50) NOT NULL,
            \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_bookmark (\`username\`, \`activity_code\`),
            INDEX idx_bookmark_user (\`username\`)
        )
    `);
    tableReady = true;
}

function readCode(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const code = value.trim();
    if (!code || code.length > MAX_CODE_LEN) return null;
    return code;
}

// GET /api/student/bookmarks — codes the student has saved.
export async function GET() {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureTable();
        const [rows]: any = await pool.execute(
            `SELECT activity_code FROM student_bookmarks WHERE username = ?`,
            [auth.user.username]
        );
        return NextResponse.json({ success: true, codes: rows.map((r: any) => r.activity_code) });
    } catch (error: any) {
        console.error('Bookmarks GET error:', error);
        return NextResponse.json(
            { success: false, error: safeMessage(error, 'Could not load your saved activities') },
            { status: 500 }
        );
    }
}

// POST /api/student/bookmarks — save an activity. Idempotent.
export async function POST(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureTable();
        const body = await request.json().catch(() => ({}));
        const code = readCode(body?.activityCode);
        if (!code) {
            return NextResponse.json({ success: false, error: 'A valid activity code is required' }, { status: 400 });
        }

        // Reject codes that aren't real activities so the table can't collect junk.
        const [exists]: any = await pool.execute(
            `SELECT code FROM activity_catalogue WHERE code = ? LIMIT 1`, [code]
        );
        if (exists.length === 0) {
            return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
        }

        await pool.execute(
            `INSERT IGNORE INTO student_bookmarks (username, activity_code) VALUES (?, ?)`,
            [auth.user.username, code]
        );
        return NextResponse.json({ success: true, bookmarked: true });
    } catch (error: any) {
        console.error('Bookmarks POST error:', error);
        return NextResponse.json(
            { success: false, error: safeMessage(error, 'Could not save this activity') },
            { status: 500 }
        );
    }
}

// DELETE /api/student/bookmarks?code=... — unsave. Idempotent.
export async function DELETE(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureTable();
        const { searchParams } = new URL(request.url);
        const code = readCode(searchParams.get('code'));
        if (!code) {
            return NextResponse.json({ success: false, error: 'A valid activity code is required' }, { status: 400 });
        }

        await pool.execute(
            `DELETE FROM student_bookmarks WHERE username = ? AND activity_code = ?`,
            [auth.user.username, code]
        );
        return NextResponse.json({ success: true, bookmarked: false });
    } catch (error: any) {
        console.error('Bookmarks DELETE error:', error);
        return NextResponse.json(
            { success: false, error: safeMessage(error, 'Could not remove this activity') },
            { status: 500 }
        );
    }
}
