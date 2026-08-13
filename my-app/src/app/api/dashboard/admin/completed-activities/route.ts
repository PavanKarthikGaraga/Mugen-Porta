import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';

export async function GET() {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
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
                MAX(ae.enrolled_at)                                             AS locked_at
            FROM activity_catalogue ac
            JOIN activity_enrollments ae
                ON ae.activity_code = ac.code AND ae.attendance_marked = TRUE
            GROUP BY ac.code, ac.title, ac.domain, ac.category, ac.activity_date, ac.venue
            ORDER BY ac.domain ASC,
                     COALESCE(ac.activity_date, '9999-12-31') DESC,
                     ac.code ASC
        `);

        const activities = rows as any[];

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
