import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        const body = await request.json().catch(() => ({}));
        const { activity_code } = body;

        if (!activity_code) {
            return NextResponse.json({ success: false, message: 'Activity code required' }, { status: 400 });
        }

        const adminUsername = auth.user.username;

        let pointsAwarded = 0;
        let certsAwarded = 0;
        let badgesAwarded = 0;

        // 1. Award SAMAM Points
        const [pointsResult]: any = await pool.query(
            `INSERT INTO sdc_transactions (
                username, credits, domain, category, description, granted_by, granted_at
            )
            SELECT 
                ae.username, a.sdc_credits, a.domain, 'Activity Completion', a.title, ?, NOW()
            FROM activity_enrollments ae
            JOIN activity_catalogue a ON ae.activity_code = a.code
            WHERE a.code = ?
              AND (ae.attendance_marked = 1 OR ae.status = 'completed' OR ae.attendance_percentage > 0)
              AND a.sdc_credits > 0
              AND NOT EXISTS (
                  SELECT 1 FROM sdc_transactions st 
                  WHERE st.username = ae.username 
                    AND (st.category = 'Activity Completion' AND st.description = a.title 
                         OR st.category = CONCAT('Activity: ', a.code))
              )`,
            [adminUsername, activity_code]
        );
        pointsAwarded = pointsResult.affectedRows || 0;

        // 2. Issue Certificates
        const [certsResult]: any = await pool.query(
            `INSERT INTO student_certificates (
                username, activity_code, activity_title, domain, credits, 
                verification_id, issued_by, issued_by_name, issued_on
            )
            SELECT 
                ae.username, a.code, a.title, a.domain, a.sdc_credits,
                CONCAT('SAMAM-CERT-', UPPER(SUBSTRING(MD5(CONCAT(ae.username, '-', a.code)), 1, 12))),
                ?, 'DIRECTOR-SAC', NOW()
            FROM activity_enrollments ae
            JOIN activity_catalogue a ON ae.activity_code = a.code
            WHERE a.code = ?
              AND (ae.attendance_marked = 1 OR ae.status = 'completed' OR ae.attendance_percentage > 0)
              AND NOT EXISTS (
                  SELECT 1 FROM student_certificates sc 
                  WHERE sc.username = ae.username AND sc.activity_code = a.code
              )`,
            [adminUsername, activity_code]
        );
        certsAwarded = certsResult.affectedRows || 0;

        // 3. Grant Badges
        const [badgesResult]: any = await pool.query(
            `INSERT INTO student_badges (
                username, badge_id, earned_from, verification_id, share_url, issued_on
            )
            SELECT 
                ae.username, a.badge_id, CONCAT('Participating in "', bd.name, '"'),
                CONCAT('SAMAM-', UPPER(SUBSTRING(MD5(CONCAT(ae.username, '-', a.badge_id)), 1, 16))),
                CONCAT('https://sacactivities.kluniversity.in/badges/verify/SAMAM-', UPPER(SUBSTRING(MD5(CONCAT(ae.username, '-', a.badge_id)), 1, 16))),
                NOW()
            FROM activity_enrollments ae
            JOIN activity_catalogue a ON ae.activity_code = a.code
            JOIN badge_definitions bd ON a.badge_id = bd.id
            WHERE a.code = ?
              AND (ae.attendance_marked = 1 OR ae.status = 'completed' OR ae.attendance_percentage > 0)
              AND a.badge_id IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM student_badges sb 
                  WHERE sb.username = ae.username AND sb.badge_id = a.badge_id
              )`,
            [activity_code]
        );
        badgesAwarded = badgesResult.affectedRows || 0;

        // Also make sure enrollment status is 'completed'
        await pool.query(
            `UPDATE activity_enrollments 
             SET status = 'completed' 
             WHERE activity_code = ? AND (attendance_marked = 1 OR attendance_percentage > 0) AND status != 'completed'`,
            [activity_code]
        );

        return NextResponse.json({ 
            success: true, 
            pointsAwarded, 
            certsAwarded, 
            badgesAwarded 
        });

    } catch (error: any) {
        console.error('Auto-generate execute error:', error);
        return NextResponse.json(
            { success: false, error: safeMessage(error, 'Allotment failed') },
            { status: 500 }
        );
    }
}
