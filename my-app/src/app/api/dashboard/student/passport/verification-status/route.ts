import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS passport_verification_requests (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(10)  NOT NULL UNIQUE,
    status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    submitted_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reviewed_by   VARCHAR(10)  DEFAULT NULL,
    reviewed_at   TIMESTAMP    DEFAULT NULL,
    reviewer_notes TEXT        DEFAULT NULL
  )
`;

async function ensureTable() {
    try { await pool.execute(CREATE_TABLE); } catch {}
}

export async function GET() {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureTable();
        const username = auth.user.username as string;
        const [rows]: any = await pool.execute(
            'SELECT status, submitted_at, reviewed_at, reviewer_notes FROM passport_verification_requests WHERE username = ?',
            [username]
        );
        if (rows.length === 0) {
            return NextResponse.json({ status: 'none' });
        }
        const r = rows[0];
        return NextResponse.json({
            status: r.status,
            submittedAt: r.submitted_at,
            reviewedAt: r.reviewed_at,
            reviewerNotes: r.reviewer_notes,
        });
    } catch (error: any) {
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch verification status') }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureTable();
        const username = auth.user.username as string;
        const body = await request.json().catch(() => ({}));
        const action = body?.action ?? 'submit';

        if (action === 'reset') {
            // Student edited passport after approval — revoke verification and force private
            await pool.execute('DELETE FROM passport_verification_requests WHERE username = ?', [username]);
            // Force passport private
            try {
                await pool.execute('UPDATE student_profiles SET is_public = 0 WHERE username = ?', [username]);
            } catch {}
            return NextResponse.json({ success: true, message: 'Verification revoked. Re-submit after ensuring all data is accurate.' });
        }

        // Submit for verification
        // Check if already pending
        const [existing]: any = await pool.execute(
            'SELECT status FROM passport_verification_requests WHERE username = ?',
            [username]
        );
        if (existing.length > 0 && existing[0].status === 'pending') {
            return NextResponse.json({ error: 'Your passport is already awaiting verification.' }, { status: 400 });
        }

        await pool.execute(
            `INSERT INTO passport_verification_requests (username, status)
             VALUES (?, 'pending')
             ON DUPLICATE KEY UPDATE status = 'pending', submitted_at = CURRENT_TIMESTAMP, reviewed_by = NULL, reviewed_at = NULL, reviewer_notes = NULL`,
            [username]
        );

        return NextResponse.json({ success: true, message: 'Passport submitted for verification. You will be notified once reviewed.' });
    } catch (error: any) {
        return NextResponse.json({ error: safeMessage(error, 'Failed to process verification request') }, { status: 500 });
    }
}
