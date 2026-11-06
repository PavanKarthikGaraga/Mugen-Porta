import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';
import { ensureActivityReportsTable } from '@/lib/dbMigrate';

export async function GET() {
    const auth = await requireAuth(['admin', 'analytics']);
    if (auth.response) return auth.response;

    try {
        await ensureActivityReportsTable();
        // An activity is "completed" when the lead has locked attendance —
        // i.e. at least one enrollment row has attendance_marked = TRUE.
        // We join only those rows so the aggregates cover exactly the locked set.
        const [rows]: any = await pool.execute(`
            SELECT
                ac.code,
                ac.title,
                ac.domain,
                ac.category,
                ac.activity_date,
                ac.venue,
                COUNT(ae.username)                                              AS total_enrolled,
                SUM(CASE WHEN ae.attendance_percentage > 0 THEN 1 ELSE 0 END)  AS students_present,
                MAX(ae.enrolled_at)                                             AS locked_at,
                ar.status                                                       AS report_status,
                ar.generated_at                                                 AS report_generated_at
            FROM activity_catalogue ac
            JOIN activity_enrollments ae
                ON ae.activity_code = ac.code AND ae.attendance_marked = TRUE
            LEFT JOIN activity_reports ar ON ar.activity_code = ac.code
            GROUP BY ac.code, ac.title, ac.domain, ac.category, ac.activity_date, ac.venue, ar.status, ar.generated_at
            ORDER BY ac.domain ASC,
                     COALESCE(ac.activity_date, '9999-12-31') DESC,
                     ac.code ASC
        `);

        const activities = rows as any[];

        // Attach the organizing club(s) to each activity. An activity can be
        // mapped to more than one club, so this is a separate lookup (joining it
        // into the query above would multiply the enrollment counts).
        const clubsByActivity: Record<string, { id: string; name: string }[]> = {};
        try {
            const codes = activities.map(a => a.code);
            if (codes.length > 0) {
                const placeholders = codes.map(() => '?').join(',');
                const [mapRows]: any = await pool.execute(
                    `SELECT m.activity_code, c.id AS club_id, c.name AS club_name
                     FROM club_activity_mappings m
                     JOIN clubs c ON c.id = m.club_id
                     WHERE m.activity_code IN (${placeholders})
                     ORDER BY c.name ASC`,
                    codes
                );
                for (const r of mapRows as any[]) {
                    (clubsByActivity[r.activity_code] ||= []).push({ id: String(r.club_id), name: r.club_name });
                }
            }
        } catch (e) {
            console.warn('Completed activities: could not load club mappings', e);
        }

        // Group by domain for the frontend
        const byDomain: Record<string, any[]> = {};
        for (const row of activities) {
            const d = row.domain || 'Unknown';
            if (!byDomain[d]) byDomain[d] = [];
            byDomain[d].push({
                code:            row.code,
                title:           row.title,
                domain:          row.domain,
                category:        row.category,
                activity_date:   row.activity_date,
                venue:           row.venue,
                total_enrolled:  Number(row.total_enrolled),
                students_present: Number(row.students_present),
                locked_at:       row.locked_at,
                report_status:   row.report_status,
                report_generated_at: row.report_generated_at,
                clubs:           clubsByActivity[row.code] ?? [],
            });
        }

        const domainSummary = Object.entries(byDomain).map(([domain, acts]) => ({
            domain,
            count:           acts.length,
            students_present: acts.reduce((s, a) => s + a.students_present, 0),
            total_enrolled:   acts.reduce((s, a) => s + a.total_enrolled,   0),
        }));

        return NextResponse.json({
            total: activities.length,
            byDomain,
            domainSummary,
        });
    } catch (error: any) {
        console.error('Completed activities error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch' }, { status: 500 });
    }
}
