import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function GET() {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        const query = `
            SELECT 
                ac.code, ac.title, ac.domain, ac.sdc_credits as credits, ac.badge_id,
                (SELECT COUNT(*) FROM activity_enrollments ae 
                 WHERE ae.activity_code = ac.code AND (ae.attendance_percentage > 0 OR ae.status = 'completed')) as total_present,
                
                (SELECT COUNT(*) FROM activity_enrollments ae 
                 WHERE ae.activity_code = ac.code AND (ae.attendance_percentage > 0 OR ae.status = 'completed')
                 AND NOT EXISTS (
                     SELECT 1 FROM sdc_transactions st 
                     WHERE st.username = ae.username 
                     AND (st.category = 'Activity Completion' AND st.description = ac.title OR st.category = CONCAT('Activity: ', ac.code))
                 )) as missing_points,
            
                (SELECT COUNT(*) FROM activity_enrollments ae 
                 WHERE ae.activity_code = ac.code AND (ae.attendance_percentage > 0 OR ae.status = 'completed')
                 AND NOT EXISTS (
                     SELECT 1 FROM student_certificates sc 
                     WHERE sc.username = ae.username AND sc.activity_code = ac.code
                 )) as missing_certs,
            
                (SELECT COUNT(*) FROM activity_enrollments ae 
                 WHERE ae.activity_code = ac.code AND (ae.attendance_percentage > 0 OR ae.status = 'completed')
                 AND NOT EXISTS (
                     SELECT 1 FROM student_badges sb 
                     WHERE sb.username = ae.username AND sb.badge_id = ac.badge_id
                 )) as missing_badges
            
            FROM activity_catalogue ac
            WHERE EXISTS (
                SELECT 1 FROM activity_enrollments ae2 WHERE ae2.activity_code = ac.code AND ae2.attendance_marked = 1
            )
            HAVING missing_points > 0 OR missing_certs > 0 OR (missing_badges > 0 AND badge_id IS NOT NULL) OR badge_id IS NULL
            ORDER BY ac.activity_date DESC;
        `;

        const [rows]: any = await pool.query(query);

        // Convert the string outputs from COUNT(*) to Numbers for the frontend
        const activities = rows.map((r: any) => ({
            code: r.code,
            title: r.title,
            domain: r.domain,
            credits: Number(r.credits) || 0,
            badgeId: r.badge_id,
            totalPresent: Number(r.total_present),
            missingPoints: Number(r.missing_points),
            missingCerts: Number(r.missing_certs),
            missingBadges: Number(r.missing_badges)
        })).filter((a: any) => a.totalPresent > 0);

        return NextResponse.json({ success: true, activities });
    } catch (error: any) {
        console.error('Auto-generate activities fetch error:', error);
        return NextResponse.json({ success: false, error: safeMessage(error, 'Failed to fetch activities') }, { status: 500 });
    }
}
