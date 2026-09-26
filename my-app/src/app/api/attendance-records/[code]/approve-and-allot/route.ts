import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import crypto from 'crypto';

const DOMAIN_STYLE: Record<string, { color: string; bg: string }> = {
    TEC: { color: '#2563EB', bg: '#EFF6FF' },
    LCH: { color: '#7C3AED', bg: '#F5F3FF' },
    ESO: { color: '#059669', bg: '#ECFDF5' },
    IIE: { color: '#D97706', bg: '#FFFBEB' },
    HWB: { color: '#DC2626', bg: '#FEF2F2' },
};

export async function POST(request: Request, context: any) {
  try {
    const { code } = await context.params;
    const auth = await requireAuth(['admin', 'faculty', 'council']);
    if (auth.response) return auth.response;
    const adminUser = auth.user;

    const { notes = 'Approved and Allotted' } = await request.json();

    // 1. Approve attendance
    await pool.execute(
      `UPDATE attendance_submissions
       SET status = 'verified', verified_by = ?, verified_at = NOW(), faculty_notes = ?
       WHERE activity_code = ?`,
      [adminUser.username as string, notes, code]
    );

    await pool.execute(
      `UPDATE activity_enrollments
       SET status = 'completed'
       WHERE activity_code = ? AND status IN ('registered', 'active', 'ongoing')`,
      [code]
    );

    await pool.execute(
      `UPDATE activity_catalogue
       SET status = 'completed', registration_open = 0
       WHERE code = ?`,
      [code]
    );

    // 2. Fetch Activity details and present students
    const [activityRows]: any = await pool.execute(
      `SELECT * FROM activity_catalogue WHERE code = ?`, [code]
    );
    if (activityRows.length === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }
    const activity = activityRows[0];
    const sdcCredits = activity.sdc_credits || 0;

    const [studentRows]: any = await pool.execute(
      `SELECT username FROM activity_enrollments WHERE activity_code = ? AND attendance_marked = 1`, [code]
    );
    const presentStudents = studentRows.map((r: any) => r.username);

    if (presentStudents.length === 0) {
      return NextResponse.json({ success: true, message: 'Approved successfully. No present students to allot.' });
    }

    // 3. Ensure Badge exists
    let badgeId = activity.badge_id;
    if (!badgeId) {
        const badgeCode = `B-${activity.code}`;
        const badgeName = `${activity.title} Badge`;
        const style = DOMAIN_STYLE[activity.domain] || DOMAIN_STYLE.TEC;

        const [existing]: any = await pool.execute(
            'SELECT id FROM badge_definitions WHERE code = ? OR name = ? LIMIT 1',
            [badgeCode, badgeName]
        );

        if (existing.length > 0) {
            badgeId = existing[0].id;
        } else {
            const [res]: any = await pool.execute(
                `INSERT INTO badge_definitions
                    (code, name, description, icon, domain, rarity, color, bg_color,
                     type, target_value, metric, requirement, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activity', 1, 'activity_completion', ?, 1)`,
                [
                    badgeCode, badgeName,
                    `Awarded for participating in ${activity.title}`,
                    '🏆', activity.domain || 'TEC', 'Common',
                    style.color, style.bg,
                    `Complete ${activity.code}`,
                ]
            );
            badgeId = (res as any).insertId;
        }
        await pool.execute('UPDATE activity_catalogue SET badge_id = ? WHERE id = ?', [badgeId, activity.id]);
    }

    // 4. Allot points, badges, certificates
    for (const username of presentStudents) {
        // Points
        if (sdcCredits > 0) {
            await pool.execute(
                `INSERT INTO sdc_transactions (username, credits, domain, category, description, granted_by, granted_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [username, sdcCredits, activity.domain ?? null, `Activity: ${activity.code}`, `Completed ${activity.title}`, adminUser.username]
            );
        }

        // Badge
        if (badgeId) {
            const verificationId = crypto.randomBytes(8).toString('hex').toUpperCase();
            const shareUrl = `https://sacactivities.kluniversity.in/badges/verify/${verificationId}`;
            await pool.execute(
                `INSERT IGNORE INTO student_badges (username, badge_id, verification_id, share_url, earned_from, issued_on)
                 VALUES (?, ?, ?, ?, ?, CURDATE())`,
                [username, badgeId, verificationId, shareUrl, `Participating in "${activity.title}"`]
            );
        }

        // Certificate
        const certVerId = crypto.randomBytes(8).toString('hex').toUpperCase();
        await pool.execute(
            `INSERT INTO student_certificates
                (username, activity_code, activity_title, domain, credits, verification_id, issued_by, issued_by_name, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'issued')
             ON DUPLICATE KEY UPDATE status = 'issued'`,
            [
                username, activity.code, activity.title, activity.domain ?? null,
                sdcCredits, certVerId, adminUser.username, 'Admin'
            ]
        );
    }

    return NextResponse.json({
        success: true,
        message: `Approved and allotted successfully for ${presentStudents.length} students.`
    });
  } catch (error: any) {
    console.error('Approve and Allot error:', error);
    return NextResponse.json({ error: safeMessage(error, 'Failed to process allotment') }, { status: 500 });
  }
}
