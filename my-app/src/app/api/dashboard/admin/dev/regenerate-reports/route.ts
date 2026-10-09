import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';

export async function GET() {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        const [rows]: any = await pool.execute(`
            SELECT 
                ar.*,
                ac.title as activity_title,
                ac.activity_date,
                ac.venue as activity_venue,
                ac.sdgs,
                c.name as club_name,
                c.domain as club_domain,
                c.logo_url as club_logo_url
            FROM activity_reports ar
            JOIN activity_catalogue ac ON ac.code = ar.activity_code
            LEFT JOIN club_activity_mappings cam ON cam.activity_code = ac.code
            LEFT JOIN clubs c ON c.id = cam.club_id
            WHERE ar.status = 'generated'
            ORDER BY ar.generated_at DESC
        `);

        const reports = rows.map((r: any) => {
            // parse JSON fields
            const parseJson = (val: any) => {
                try { return typeof val === 'string' ? JSON.parse(val) : val || []; } catch { return []; }
            };
            return {
                ...r,
                sdgs: parseJson(r.sdgs),
                gallery: parseJson(r.gallery),
                attendance_sheets: parseJson(r.attendance_sheets)
            };
        });

        return NextResponse.json({ success: true, reports });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        const body = await request.json();
        const { activity_code, report_pdf_url } = body;

        if (!activity_code || !report_pdf_url) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
        }

        await pool.execute(
            `UPDATE activity_reports SET report_pdf_url = ? WHERE activity_code = ?`,
            [report_pdf_url, activity_code]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
