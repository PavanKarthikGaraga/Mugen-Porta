import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

export async function GET(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');

        let targetDate;
        if (dateParam) {
            targetDate = dateParam;
        } else {
            // Default to today
            const today = new Date();
            targetDate = today.toISOString().split('T')[0];
        }

        const query = `
            SELECT DISTINCT
                s.username AS student_id,
                s.name AS student_name,
                c.name AS club_name,
                s.district AS city,
                s.busRoute AS city_bus_route
            FROM 
                students s
            JOIN 
                activity_enrollments ae ON s.username = ae.username
            JOIN 
                activity_catalogue ac ON ae.activity_code = ac.code
            LEFT JOIN 
                clubs c ON s.clubId = c.id
            WHERE 
                s.residenceType = 'Day Scholar'
                AND s.busRoute IS NOT NULL
                AND s.busRoute != 'Own Transport'
                AND DATE(ac.activity_date) = ?
            ORDER BY 
                s.district, s.busRoute, s.name
        `;

        const [rows]: any = await pool.query(query, [targetDate]);

        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error("GET Transport Details Error:", error);
        return NextResponse.json(
            { success: false, error: safeMessage(error, 'Something went wrong. Please try again later.') },
            { status: 500 }
        );
    }
}
