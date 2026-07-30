import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema } from '@/lib/dbMigrate';

// GET: all clubs + all activities + current mappings
export async function GET() {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        await ensureActivitySchema();
        const [[clubs], [activities], [mappings]] = await Promise.all([
            // Only SAC clubs — exclude departmental clubs
            pool.execute(`SELECT id, name, domain FROM clubs WHERE domain != 'DEPT. CLUBS' ORDER BY domain ASC, name ASC`),
            // All activities except rejected (include pending so new additions are mappable)
            pool.execute(`
                SELECT code, title, domain, category, sdc_credits, difficulty, approval_status
                FROM activity_catalogue
                WHERE approval_status IN ('active', 'pending_approval')
                ORDER BY domain ASC, category ASC, title ASC
            `),
            pool.execute(`SELECT club_id, activity_code FROM club_activity_mappings`),
        ]) as any[];

        return NextResponse.json({ success: true, clubs, activities, mappings });
    } catch (error: any) {
        console.error('Activity mapper GET error:', error);
        return NextResponse.json({ success: false, error: safeMessage(error) }, { status: 500 });
    }
}

// POST: save mappings for a club (replaces existing)
export async function POST(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        // Best-effort migration — table should already exist after first GET
        try { await ensureActivitySchema(); } catch (me) {
            console.warn('ensureActivitySchema skipped in POST:', (me as any)?.message);
        }

        const body = await request.json().catch(() => ({}));
        const { clubId, activityCodes } = body;
        if (!clubId) return NextResponse.json({ success: false, error: 'clubId required' }, { status: 400 });

        const codes: string[] = Array.isArray(activityCodes) ? activityCodes : [];
        const username: string = (auth.user as any)?.username ?? 'admin';

        // Delete existing mappings for this club then re-insert
        await pool.execute(`DELETE FROM club_activity_mappings WHERE club_id = ?`, [clubId]);

        if (codes.length > 0) {
            const placeholders = codes.map(() => '(?, ?, ?)').join(', ');
            const params = codes.flatMap((code: string) => [clubId, code, username]);
            await pool.execute(
                `INSERT INTO club_activity_mappings (club_id, activity_code, created_by) VALUES ${placeholders}`,
                params
            );
        }

        return NextResponse.json({ success: true, mapped: codes.length });
    } catch (error: any) {
        console.error('Activity mapper POST error:', error);
        // Include SQL error code in response body to help diagnose production failures
        return NextResponse.json({
            success: false,
            error: safeMessage(error),
            code: error?.code ?? error?.sqlState ?? 'UNKNOWN',
        }, { status: 500 });
    }
}
