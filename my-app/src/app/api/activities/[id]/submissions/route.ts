import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

// Files are uploaded via /api/upload (server local storage) before calling this
// route — this route only persists a URL, never raw file bytes.
const MAX_ASSIGNMENT_ID_LEN = 50;

function isAcceptableFileUrl(url: unknown): url is string {
    if (typeof url !== 'string' || url.length === 0 || url.length > 500) return false;
    return url.startsWith('/uploads/') || /^https:\/\//i.test(url);
}

async function ensureTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS activity_assignment_submissions (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            activity_code VARCHAR(50) NOT NULL,
            assignment_id VARCHAR(50) NOT NULL,
            username VARCHAR(10) NOT NULL,
            file_url VARCHAR(500) NOT NULL,
            file_name VARCHAR(255) DEFAULT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_submission (activity_code, assignment_id, username)
        );
    `);
}

// GET /api/activities/[id]/submissions — the logged-in student's own
// submissions for this activity, keyed by assignment id. Never exposes
// other students' submissions (no username/activity is accepted from the
// caller besides the activity code in the URL).
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        const { id } = await params;

        const [actRows]: any = await pool.execute(
            `SELECT code FROM activity_catalogue WHERE code = ? OR id = ? LIMIT 1`,
            [id, id]
        );
        if (!actRows.length) {
            return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
        }
        const activityCode = actRows[0].code;

        const [rows]: any = await pool.execute(
            `SELECT assignment_id, file_url, file_name, submitted_at
             FROM activity_assignment_submissions
             WHERE activity_code = ? AND username = ?`,
            [activityCode, auth.user.username]
        );

        const submissions: Record<string, any> = {};
        for (const row of rows) {
            submissions[row.assignment_id] = {
                fileUrl: row.file_url,
                fileName: row.file_name,
                submittedAt: row.submitted_at,
            };
        }

        return NextResponse.json({ success: true, submissions });
    } catch (error: any) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return NextResponse.json({ success: true, submissions: {} });
        }
        console.error('Fetch submissions error:', error);
        return NextResponse.json({ error: safeMessage(error) }, { status: 500 });
    }
}

// POST /api/activities/[id]/submissions — record an assignment submission.
// Requires the student to be enrolled in the activity (registered), so this
// can never be used to attach a submission to an activity the student never
// joined.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const { assignmentId, fileUrl, fileName } = body || {};

        if (typeof assignmentId !== 'string' || !assignmentId.trim() || assignmentId.length > MAX_ASSIGNMENT_ID_LEN) {
            return NextResponse.json({ success: false, error: 'A valid assignmentId is required' }, { status: 400 });
        }
        if (!isAcceptableFileUrl(fileUrl)) {
            return NextResponse.json({ success: false, error: 'A valid uploaded fileUrl is required' }, { status: 400 });
        }
        const safeFileName = typeof fileName === 'string' ? fileName.slice(0, 255) : null;

        const [actRows]: any = await pool.execute(
            `SELECT code, title FROM activity_catalogue WHERE code = ? OR id = ? LIMIT 1`,
            [id, id]
        );
        if (!actRows.length) {
            return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
        }
        const activityCode = actRows[0].code;

        // Must be registered (enrolled) in this activity to submit work for it.
        const [enrollRows]: any = await pool.execute(
            `SELECT id FROM activity_enrollments WHERE activity_code = ? AND username = ?`,
            [activityCode, auth.user.username]
        );
        if (!enrollRows.length) {
            return NextResponse.json({ success: false, error: 'You must be registered for this activity to submit an assignment' }, { status: 403 });
        }

        await ensureTable();

        await pool.execute(
            `INSERT INTO activity_assignment_submissions (activity_code, assignment_id, username, file_url, file_name, submitted_at)
             VALUES (?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), file_name = VALUES(file_name), updated_at = NOW()`,
            [activityCode, assignmentId, auth.user.username, fileUrl, safeFileName]
        );

        return NextResponse.json({ success: true, message: 'Assignment submitted successfully' });
    } catch (error: any) {
        console.error('Submit assignment error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to submit assignment') }, { status: 500 });
    }
}
