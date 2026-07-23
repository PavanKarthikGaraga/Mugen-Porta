import pool from '@/lib/db';
import crypto from 'crypto';

/**
 * Automatically awards a badge to a student if they meet the criteria
 * and haven't earned it yet.
 */
export async function awardBadge(username: string, badgeCode: string, earnedFrom: string) {
    try {
        // Find badge ID
        const [badgeRows] = await pool.execute(
            'SELECT id FROM badge_definitions WHERE code = ?',
            [badgeCode]
        ) as any[];

        if (badgeRows.length === 0) return false; // Badge doesn't exist

        const badgeId = badgeRows[0].id;

        // Check if already earned
        const [earnedRows] = await pool.execute(
            'SELECT id FROM student_badges WHERE username = ? AND badge_id = ?',
            [username, badgeId]
        ) as any[];

        if (earnedRows.length > 0) return false; // Already earned

        // Award badge
        const verificationId = crypto.randomBytes(8).toString('hex').toUpperCase();
        const appUrl = 'https://sacactivities.kluniversity.in';
        const shareUrl = `${appUrl}/badges/verify/${verificationId}`;

        await pool.execute(
            `INSERT INTO student_badges (username, badge_id, verification_id, share_url, earned_from, issued_on)
             VALUES (?, ?, ?, ?, ?, CURDATE())`,
            [username, badgeId, verificationId, shareUrl, earnedFrom]
        );

        return true;
    } catch (error) {
        console.error('Error awarding badge:', error);
        return false;
    }
}
