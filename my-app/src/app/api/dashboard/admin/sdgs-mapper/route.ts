import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';

export async function GET() {
    const auth = await requireAuth(['admin', 'analytics']);
    if (auth.response) return auth.response;

    try {
        const [rows]: any = await pool.execute(`
            SELECT
                ac.code,
                ac.title,
                ac.domain,
                ac.category,
                ac.activity_date,
                ac.venue,
                ac.sdgs,
                COUNT(ae.username)                                              AS total_enrolled,
                SUM(CASE WHEN ae.attendance_percentage > 0 THEN 1 ELSE 0 END)  AS students_present,
                MAX(ae.enrolled_at)                                             AS locked_at,
                ar.status                                                       AS report_status,
                ar.generated_at                                                 AS report_generated_at
            FROM activity_catalogue ac
            JOIN activity_enrollments ae
                ON ae.activity_code = ac.code AND ae.attendance_marked = TRUE
            LEFT JOIN activity_reports ar ON ar.activity_code = ac.code
            GROUP BY ac.code, ac.title, ac.domain, ac.category, ac.activity_date, ac.venue, ac.sdgs, ar.status, ar.generated_at
            ORDER BY ac.domain ASC,
                     COALESCE(ac.activity_date, '9999-12-31') DESC,
                     ac.code ASC
        `);

        // Parse sdgs from string to array
        const activities = rows.map((row: any) => ({
            ...row,
            sdgs: typeof row.sdgs === 'string' ? JSON.parse(row.sdgs || '[]') : (row.sdgs || [])
        }));

        return NextResponse.json({ activities });
    } catch (error: any) {
        console.error('SDGs Mapper error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch' }, { status: 500 });
    }
}
