import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { ensureIqacTables } from '@/lib/dbMigrate';

export const dynamic = 'force-dynamic';

const parseJson = (val: any, fallback: any) => {
    if (!val) return fallback;
    if (typeof val !== 'string') return val;
    try { return JSON.parse(val); } catch { return fallback; }
};

/**
 * Read-only view of the IQAC workspace for the admin dashboard.
 *
 * Reads ONLY iqac_activities / iqac_activity_reports (the tables the IQAC
 * user maintains) -- never activity_catalogue / activity_reports.
 *
 *   GET /api/dashboard/admin/iqac            -> list of activities with report status
 *   GET /api/dashboard/admin/iqac?code=XYZ   -> one activity + its full report
 *                                               (used to rebuild the PDF when no stored PDF exists)
 */
export async function GET(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        await ensureIqacTables();
        const code = new URL(request.url).searchParams.get('code');

        if (code) {
            const [actRows]: any = await pool.execute(
                `SELECT id, activity_code, title,
                        DATE_FORMAT(activity_date, '%Y-%m-%d') AS activity_date,
                        start_time, end_time, venue
                 FROM iqac_activities WHERE activity_code = ? LIMIT 1`,
                [code]
            );
            if (actRows.length === 0) {
                return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
            }
            const [repRows]: any = await pool.execute(
                'SELECT * FROM iqac_activity_reports WHERE activity_code = ? LIMIT 1',
                [code]
            );
            const r = repRows[0] || null;
            return NextResponse.json({
                activity: actRows[0],
                report: r ? {
                    ...r,
                    gallery: parseJson(r.gallery, []),
                    attendance_sheets: parseJson(r.attendance_sheets, []),
                } : null,
            });
        }

        const [rows]: any = await pool.execute(`
            SELECT
                a.activity_code,
                a.title,
                DATE_FORMAT(a.activity_date, '%Y-%m-%d') AS activity_date,
                r.status       AS report_status,
                r.report_pdf_url
            FROM iqac_activities a
            LEFT JOIN iqac_activity_reports r ON r.activity_code = a.activity_code
            ORDER BY a.activity_date ASC, a.activity_code ASC
        `);

        return NextResponse.json({ activities: rows });
    } catch (error: any) {
        console.error('Admin IQAC list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to load IQAC activities.') }, { status: 500 });
    }
}
