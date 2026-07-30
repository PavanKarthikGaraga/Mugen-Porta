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
        const { clubId, activityCodes } = await request.json();
        if (!clubId) return NextResponse.json({ success: false, error: 'clubId required' }, { status: 400 });

        const conn = await (pool as any).getConnection();
        try {
            await conn.beginTransaction();
            // Remove old mappings for this club
            await conn.execute(`DELETE FROM club_activity_mappings WHERE club_id = ?`, [clubId]);
            // Insert new ones
            if (activityCodes && activityCodes.length > 0) {
                const values = activityCodes.map((code: string) => [clubId, code, auth.user.username]);
                await conn.query(
                    `INSERT INTO club_activity_mappings (club_id, activity_code, created_by) VALUES ?`,
                    [values]
                );
            }
            await conn.commit();
        } catch (e) {
            await conn.rollback();
            throw e;
        } finally {
            conn.release();
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Activity mapper POST error:', error);
        return NextResponse.json({ success: false, error: safeMessage(error) }, { status: 500 });
    }
}
