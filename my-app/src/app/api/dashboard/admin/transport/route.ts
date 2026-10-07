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
            SELECT 
                s.district AS city,
                s.busRoute AS city_bus_route,
                COUNT(DISTINCT s.username) as student_count
            FROM 
                students s
            JOIN 
                activity_enrollments ae ON s.username = ae.username
            JOIN 
                activity_catalogue ac ON ae.activity_code = ac.code
            WHERE 
                s.residenceType = 'Day Scholar'
                AND DATE(ac.activity_date) = ?
            GROUP BY 
                s.district, s.busRoute
            ORDER BY 
                s.district, s.busRoute
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
