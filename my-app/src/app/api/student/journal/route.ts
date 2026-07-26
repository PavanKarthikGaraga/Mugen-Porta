import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage, clampInt } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

// Reflection journal entries. Every query is scoped to the logged-in
// student's own username — no username is ever accepted from the caller, and
// updates/deletes additionally match on username so one student can never
// reach another's entry by guessing an id.

const MAX_CONTENT = 20000;
const MAX_PROMPT = 500;
const MAX_ACTIVITY_CODE = 50;
const MAX_ACTIVITY_NAME = 255;
const MAX_TAGS = 12;
const MAX_TAG_LEN = 40;

const MOODS = new Set(['energised', 'reflective', 'challenged', 'growing', 'excited', 'calm']);

let tableReady = false;
async function ensureTable() {
    if (tableReady) return;
    await pool.query(`
        CREATE TABLE IF NOT EXISTS student_journal_entries (
            \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
            \`username\` VARCHAR(10) NOT NULL,
            \`activity_code\` VARCHAR(50) DEFAULT NULL,
            \`activity_name\` VARCHAR(255) DEFAULT NULL,
            \`mood\` VARCHAR(32) DEFAULT NULL,
            \`prompt\` TEXT,
            \`content\` MEDIUMTEXT NOT NULL,
            \`tags\` JSON DEFAULT NULL,
            \`word_count\` INT DEFAULT 0,
            \`faculty_feedback\` TEXT,
            \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_journal_user (\`username\`, \`created_at\`)
        )
    `);
    tableReady = true;
}

function safeJsonArray(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch {
            return [];
        }
    }
    return [];
}

function countWords(text: string) {
    return text.split(/\s+/).filter(Boolean).length;
}

// Normalises and validates a client payload. Returns either the cleaned
// fields or a human-readable error to hand straight back to the student.
function parseBody(body: any): { error: string } | { value: any } {
    const content = typeof body?.content === 'string' ? body.content.trim() : '';
    if (!content) return { error: 'Please write something before saving.' };
    if (content.length > MAX_CONTENT) {
        return { error: `Reflections are limited to ${MAX_CONTENT.toLocaleString()} characters.` };
    }

    const mood = typeof body?.mood === 'string' && MOODS.has(body.mood) ? body.mood : null;

    const tags = Array.from(
        new Set(
            safeJsonArray(body?.tags)
                .map((t) => t.trim())
                .filter(Boolean)
                .map((t) => t.slice(0, MAX_TAG_LEN))
        )
    ).slice(0, MAX_TAGS);

    return {
        value: {
            activity_code: typeof body?.activityCode === 'string' && body.activityCode.trim()
                ? body.activityCode.trim().slice(0, MAX_ACTIVITY_CODE) : null,
            activity_name: typeof body?.activityName === 'string' && body.activityName.trim()
                ? body.activityName.trim().slice(0, MAX_ACTIVITY_NAME) : null,
            mood,
            prompt: typeof body?.prompt === 'string' ? body.prompt.trim().slice(0, MAX_PROMPT) : null,
            content,
            tags: JSON.stringify(tags),
            word_count: countWords(content),
        },
    };
}

function shapeRow(row: any) {
    return {
        id: row.id,
        activityCode: row.activity_code,
        activityName: row.activity_name || 'General Reflection',
        mood: row.mood,
        prompt: row.prompt,
        content: row.content,
        tags: safeJsonArray(row.tags),
        wordCount: row.word_count || 0,
        facultyFeedback: row.faculty_feedback || null,
        date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null,
        updatedAt: row.updated_at,
    };
}

// GET /api/student/journal — the student's own entries, newest first.
export async function GET(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureTable();

        const { searchParams } = new URL(request.url);
        const limit = clampInt(searchParams.get('limit'), { min: 1, max: 200, fallback: 100 });

        const [rows]: any = await pool.execute(
            `SELECT id, activity_code, activity_name, mood, \`prompt\`, content, tags,
                    word_count, faculty_feedback, created_at, updated_at
             FROM student_journal_entries
             WHERE username = ?
             ORDER BY created_at DESC, id DESC
             LIMIT ${limit}`,
            [auth.user.username]
        );

        return NextResponse.json({ success: true, entries: rows.map(shapeRow) });
    } catch (error: any) {
        console.error('Journal GET error:', error);
        return NextResponse.json(
            { success: false, error: safeMessage(error, 'Could not load your reflections.') },
            { status: 500 }
        );
    }
}

// POST /api/student/journal — create a new entry.
export async function POST(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureTable();

        const body = await request.json().catch(() => ({}));
        const parsed = parseBody(body);
        if ('error' in parsed) {
            return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
        }
        const v = parsed.value;

        const [result]: any = await pool.execute(
            `INSERT INTO student_journal_entries
                (username, activity_code, activity_name, mood, \`prompt\`, content, tags, word_count)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [auth.user.username, v.activity_code, v.activity_name, v.mood, v.prompt, v.content, v.tags, v.word_count]
        );

        const [rows]: any = await pool.execute(
            `SELECT id, activity_code, activity_name, mood, \`prompt\`, content, tags,
                    word_count, faculty_feedback, created_at, updated_at
             FROM student_journal_entries WHERE id = ? AND username = ?`,
            [result.insertId, auth.user.username]
        );

        return NextResponse.json({ success: true, entry: rows[0] ? shapeRow(rows[0]) : null }, { status: 201 });
    } catch (error: any) {
        console.error('Journal POST error:', error);
        return NextResponse.json(
            { success: false, error: safeMessage(error, 'Could not save your reflection.') },
            { status: 500 }
        );
    }
}

// PUT /api/student/journal — update one of the student's own entries.
export async function PUT(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureTable();

        const body = await request.json().catch(() => ({}));
        const id = clampInt(body?.id, { min: 0, fallback: 0 });
        if (!id) return NextResponse.json({ success: false, error: 'Entry id is required' }, { status: 400 });

        const parsed = parseBody(body);
        if ('error' in parsed) {
            return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
        }
        const v = parsed.value;

        // The username predicate is what enforces ownership.
        const [result]: any = await pool.execute(
            `UPDATE student_journal_entries
             SET activity_code = ?, activity_name = ?, mood = ?, \`prompt\` = ?,
                 content = ?, tags = ?, word_count = ?
             WHERE id = ? AND username = ?`,
            [v.activity_code, v.activity_name, v.mood, v.prompt, v.content, v.tags, v.word_count, id, auth.user.username]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: 'Reflection not found' }, { status: 404 });
        }

        const [rows]: any = await pool.execute(
            `SELECT id, activity_code, activity_name, mood, \`prompt\`, content, tags,
                    word_count, faculty_feedback, created_at, updated_at
             FROM student_journal_entries WHERE id = ? AND username = ?`,
            [id, auth.user.username]
        );

        return NextResponse.json({ success: true, entry: rows[0] ? shapeRow(rows[0]) : null });
    } catch (error: any) {
        console.error('Journal PUT error:', error);
        return NextResponse.json(
            { success: false, error: safeMessage(error, 'Could not update your reflection.') },
            { status: 500 }
        );
    }
}

// DELETE /api/student/journal?id=123 — delete one of the student's own entries.
export async function DELETE(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureTable();

        const { searchParams } = new URL(request.url);
        const id = clampInt(searchParams.get('id'), { min: 0, fallback: 0 });
        if (!id) return NextResponse.json({ success: false, error: 'Entry id is required' }, { status: 400 });

        const [result]: any = await pool.execute(
            `DELETE FROM student_journal_entries WHERE id = ? AND username = ?`,
            [id, auth.user.username]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, error: 'Reflection not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Journal DELETE error:', error);
        return NextResponse.json(
            { success: false, error: safeMessage(error, 'Could not delete your reflection.') },
            { status: 500 }
        );
    }
}
