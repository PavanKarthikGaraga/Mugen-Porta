import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { ensureActivityReportsTable } from '@/lib/dbMigrate';

function parseJson(val: any): any {
    if (!val) return [];
    if (typeof val !== 'string') return val;
    try { return JSON.parse(val); } catch { return []; }
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// GET /api/public/activities/completed
// No auth required — intended for the main SAC website.
// Returns activities where at least one enrollment has status = 'completed',
// plus the full activity_reports row for those that have a report.
// Deliberately excludes attendance percentages, enrollment counts, and
// per-student data — only basic details, schedule/venue, and report content.
export async function GET() {
    try {
        await ensureActivityReportsTable();

        const [rows]: any = await pool.execute(`
            SELECT
                ac.code,
                ac.title,
                ac.description,
                ac.domain,
                ac.category,
                ac.difficulty,
                ac.sdc_credits,
                ac.activity_date,
                ac.start_time,
                ac.end_time,
                ac.venue,
                ac.poster_url     AS main_poster_url,
                ar.id             AS report_id,
                ar.status         AS report_status,
                ar.generated_at   AS report_generated_at,
                ar.overview,
                ar.objectives,
                ar.proceedings,
                ar.key_highlights,
                ar.learning_outcomes AS report_learning_outcomes,
                ar.conclusion,
                ar.gallery,
                ar.attendance_sheets,
                ar.poster_url     AS report_poster_url,
                ar.permission_letter_url
            FROM activity_catalogue ac
            LEFT JOIN activity_reports ar ON ar.activity_code = ac.code
            WHERE EXISTS (
                SELECT 1 FROM activity_enrollments ae
                WHERE ae.activity_code = ac.code AND ae.status = 'completed'
            )
            ORDER BY ac.activity_date DESC, ac.code ASC
        `);

        const activities = (rows as any[]).map(r => {
            const report = r.report_id ? {
                status:               r.report_status,
                generated_at:         r.report_generated_at,
                overview:             r.overview,
                objectives:           r.objectives,
                proceedings:          r.proceedings,
                key_highlights:       r.key_highlights,
                learning_outcomes:    r.report_learning_outcomes,
                conclusion:           r.conclusion,
                gallery:              parseJson(r.gallery),
                attendance_sheets:    parseJson(r.attendance_sheets),
                poster_url:           r.report_poster_url,
                permission_letter_url: r.permission_letter_url,
            } : null;

            return {
                code:           r.code,
                title:          r.title,
                description:    r.description,
                domain:         r.domain,
                category:       r.category,
                difficulty:     r.difficulty,
                sdc_credits:    r.sdc_credits,
                activity_date:  r.activity_date,
                start_time:     r.start_time,
                end_time:       r.end_time,
                venue:          r.venue,
                poster_url:     r.report_poster_url || r.main_poster_url || null,
                report,
            };
        });

        return NextResponse.json({ success: true, total: activities.length, activities }, { headers: CORS_HEADERS });
    } catch (error: any) {
        console.error('Public completed activities error:', error);
        return NextResponse.json({ error: 'Failed to fetch completed activities' }, { status: 500, headers: CORS_HEADERS });
    }
}
