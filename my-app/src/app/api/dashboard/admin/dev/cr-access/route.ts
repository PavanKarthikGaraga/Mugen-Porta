import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyDevAccess } from '../../auth-helper';
import { ensureCareerRoadmapCacheTable } from '@/lib/dbMigrate';

const DEMO_ACCOUNTS = new Set(['2400000000']);

// GET /api/dashboard/admin/dev/cr-access?username=XXXX — look up a student's
// career roadmap generation usage by ID number.
export async function GET(request: Request) {
    const auth = await verifyDevAccess(request);
    if (!auth.success) return auth.response;

    const url = new URL(request.url);
    const username = (url.searchParams.get('username') || '').trim();
    if (!username) return NextResponse.json({ error: 'A student ID number is required' }, { status: 400 });

    const [studentRows]: any = await pool.execute(
        `SELECT username, name, branch, student_year, program FROM students WHERE username = ? LIMIT 1`,
        [username]
    );
    if (!studentRows.length) return NextResponse.json({ error: 'No student found with that ID number' }, { status: 404 });
    const student = studentRows[0];

    const isDemo = DEMO_ACCOUNTS.has(username);
    if (isDemo) {
        return NextResponse.json({
            success: true,
            student,
            isDemo: true,
            generationCount: 0,
            extraAllowed: 0,
            allowed: null,
            remaining: null,
        });
    }

    await ensureCareerRoadmapCacheTable();
    const [cacheRows]: any = await pool.execute(
        `SELECT generation_count, extra_allowed, generated_at FROM career_roadmap_cache WHERE username = ?`,
        [username]
    );
    const cache = cacheRows[0] || { generation_count: 0, extra_allowed: 0, generated_at: null };
    const generationCount = Number(cache.generation_count || 0);
    const extraAllowed = Number(cache.extra_allowed || 0);
    const allowed = 1 + extraAllowed;

    return NextResponse.json({
        success: true,
        student,
        isDemo: false,
        generationCount,
        extraAllowed,
        allowed,
        remaining: Math.max(0, allowed - generationCount),
        lastGeneratedAt: cache.generated_at,
    });
}

// POST /api/dashboard/admin/dev/cr-access — grant one additional re-analyze
// generation to a student. { username }
export async function POST(request: Request) {
    const auth = await verifyDevAccess(request);
    if (!auth.success) return auth.response;

    const body = await request.json().catch(() => ({}));
    const username = String(body.username || '').trim();
    if (!username) return NextResponse.json({ error: 'A student ID number is required' }, { status: 400 });

    if (DEMO_ACCOUNTS.has(username)) {
        return NextResponse.json({ error: 'The demo account already has unlimited access' }, { status: 400 });
    }

    const [studentRows]: any = await pool.execute(
        `SELECT username FROM students WHERE username = ? LIMIT 1`,
        [username]
    );
    if (!studentRows.length) return NextResponse.json({ error: 'No student found with that ID number' }, { status: 404 });

    await ensureCareerRoadmapCacheTable();
    // Placeholder roadmap_result ('') covers a student who hasn't generated
    // yet but was granted access anyway -- the student GET route already
    // treats an unparseable roadmap_result as "not generated".
    await pool.execute(`
        INSERT INTO career_roadmap_cache (username, roadmap_result, generation_count, extra_allowed)
        VALUES (?, '', 0, 1)
        ON DUPLICATE KEY UPDATE extra_allowed = extra_allowed + 1
    `, [username]);

    const [cacheRows]: any = await pool.execute(
        `SELECT generation_count, extra_allowed FROM career_roadmap_cache WHERE username = ?`,
        [username]
    );
    const generationCount = Number(cacheRows[0]?.generation_count || 0);
    const extraAllowed = Number(cacheRows[0]?.extra_allowed || 0);

    return NextResponse.json({
        success: true,
        message: `Re-analyze access granted to ${username}`,
        generationCount,
        extraAllowed,
        allowed: 1 + extraAllowed,
        remaining: Math.max(0, 1 + extraAllowed - generationCount),
    });
}
