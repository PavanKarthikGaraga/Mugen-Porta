import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { getLeadClubIds } from '@/lib/leadScope';
import { ensureActivityReportsTable } from '@/lib/dbMigrate';

async function getLead() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;

    let assigned_categories: string[] = [];
    try {
        const [rows]: any = await pool.execute('SELECT assigned_categories FROM leads WHERE username = ?', [decoded.username as string]);
        if (rows[0]?.assigned_categories) {
            assigned_categories = typeof rows[0].assigned_categories === 'string'
                ? JSON.parse(rows[0].assigned_categories)
                : rows[0].assigned_categories;
        }
    } catch { /* column may not exist on older DB */ }

    const clubIds = await getLeadClubIds(decoded.username as string);
    return { decoded, clubIds, assigned_categories };
}

// Every activity this lead can see in their regular Activities tab (same
// club_activity_mappings-first, assigned_categories-fallback resolution as
// src/app/api/dashboard/lead/samam/activities/route.ts), alongside whatever
// activity_reports row exists for it -- this is the list the "Activity
// Reports" page renders with a "Generate Report" action per row.
export async function GET() {
    try {
        const lead = await getLead();
        if (!lead) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await ensureActivityReportsTable();

        const conditions: string[] = [];
        const params: any[] = [];

        let usedMappings = false;
        if (lead.clubIds.length > 0) {
            try {
                const [mapRows]: any = await pool.execute(
                    `SELECT activity_code FROM club_activity_mappings WHERE club_id IN (${lead.clubIds.map(() => '?').join(',')})`,
                    lead.clubIds
                );
                if (mapRows.length > 0) {
                    const codes: string[] = (mapRows as any[]).map((r: any) => r.activity_code);
                    conditions.push(`ac.code IN (${codes.map(() => '?').join(',')})`);
                    params.push(...codes);
                    usedMappings = true;
                }
            } catch { /* table may not exist yet */ }
        }

        if (!usedMappings) {
            if (lead.assigned_categories.length > 0) {
                conditions.push(`ac.category IN (${lead.assigned_categories.map(() => '?').join(',')})`);
                params.push(...lead.assigned_categories);
            } else {
                return NextResponse.json({ success: true, activities: [] });
            }
        }

        const [rows] = await pool.execute(`
            SELECT ac.code, ac.title, ac.domain, ac.category, ac.activity_date, ac.venue,
                   ac.start_time, ac.end_time, ac.faculty_name,
                   (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = ac.code) as enrolledCount,
                   ar.status as report_status, ar.generated_at
            FROM activity_catalogue ac
            LEFT JOIN activity_reports ar ON ar.activity_code = ac.code
            WHERE ${conditions.join(' AND ')}
            ORDER BY ac.code ASC
        `, params);

        return NextResponse.json({ success: true, activities: rows });

    } catch (error: any) {
        console.error('Activity reports list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
