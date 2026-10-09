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
                ac.sdgs,
                ar.status AS report_status
            FROM activity_catalogue ac
            LEFT JOIN activity_reports ar ON ar.activity_code = ac.code
            ORDER BY ac.code ASC
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
