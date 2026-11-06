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

        // Attach the ORGANIZING club to each activity -- the parent club it was
        // created under, not every club it ended up mapped to. Leads can manage
        // child clubs on top of their parent club, and the attendance/auto-fix
        // flows add a club_activity_mappings row for each of those, so one
        // activity can be mapped to a dozen clubs. Showing all of them lists the
        // same activity under every sibling club, which is not wanted here.
        //
        // Resolution order:
        //   1. the creating lead's parent club (leads.clubId via created_by)
        //   2. the earliest club_activity_mappings row (the one written when the
        //      activity was created; later rows are auto-added child clubs)
        const clubsByActivity: Record<string, { id: string; name: string }[]> = {};
        try {
            const codes = activities.map(a => a.code);
            if (codes.length > 0) {
                const placeholders = codes.map(() => '?').join(',');

                // Earliest mapping per activity (lowest id) -> fallback parent.
                const firstMapping: Record<string, { id: string; name: string }> = {};
                const mappedIds: Record<string, Set<string>> = {};
                const [mapRows]: any = await pool.execute(
                    `SELECT m.activity_code, c.id AS club_id, c.name AS club_name
                     FROM club_activity_mappings m
                     JOIN clubs c ON c.id = m.club_id
                     WHERE m.activity_code IN (${placeholders})
                     ORDER BY m.id ASC`,
                    codes
                );
                for (const r of mapRows as any[]) {
                    const club = { id: String(r.club_id), name: r.club_name };
                    if (!firstMapping[r.activity_code]) firstMapping[r.activity_code] = club;
                    (mappedIds[r.activity_code] ||= new Set()).add(club.id);
                }

                // Creating lead's parent club, when the activity was created by a lead.
                const creatorClub: Record<string, { id: string; name: string }> = {};
                try {
                    const [creatorRows]: any = await pool.execute(
                        `SELECT ac.code, c.id AS club_id, c.name AS club_name
                         FROM activity_catalogue ac
                         JOIN leads l ON l.username = ac.created_by
                         JOIN clubs c ON c.id = l.clubId
                         WHERE ac.code IN (${placeholders})`,
                        codes
                    );
                    for (const r of creatorRows as any[]) {
                        creatorClub[r.code] = { id: String(r.club_id), name: r.club_name };
                    }
                } catch (e) {
                    console.warn('Completed activities: could not resolve creating lead clubs', e);
                }

                for (const code of codes) {
                    const mapped = mappedIds[code];
                    const fromCreator = creatorClub[code];
                    // Trust the creator's parent club only when the activity is actually
                    // mapped to it (or has no mappings at all); otherwise the creator was
                    // a lead from a different club and the first mapping is the better answer.
                    const parent = fromCreator && (!mapped || mapped.has(fromCreator.id))
                        ? fromCreator
                        : (firstMapping[code] ?? fromCreator);
                    if (parent) clubsByActivity[code] = [parent];
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
