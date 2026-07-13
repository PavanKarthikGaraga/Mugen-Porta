import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;
        if (!username) return NextResponse.json({ message: "Username is required" }, { status: 400 });

        // 1. Fetch earned badges
        const [earnedRows] = await pool.execute(`
            SELECT 
                sb.id as student_badge_id, sb.verification_id, sb.share_url, sb.earned_from, sb.issued_on,
                bd.id as badge_id, bd.code, bd.name, bd.icon, bd.domain, bd.rarity, 
                bd.color, bd.bg_color, bd.description, bd.competencies
            FROM student_badges sb
            JOIN badge_definitions bd ON sb.badge_id = bd.id
            WHERE sb.username = ?
            ORDER BY sb.issued_on DESC
        `, [username]) as any[];

        const earnedBadges = earnedRows.map(row => ({
            id: row.student_badge_id,
            code: row.code,
            name: row.name,
            icon: row.icon || '🏅',
            domain: row.domain,
            rarity: row.rarity,
            color: row.color,
            bg: row.bg_color,
            issuedOn: new Date(row.issued_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            earnedFrom: row.earned_from,
            competencies: typeof row.competencies === 'string' ? JSON.parse(row.competencies) : row.competencies,
            description: row.description,
            verificationId: row.verification_id,
            shareUrl: row.share_url
        }));

        // Get array of earned badge IDs to filter out of the locked list
        const earnedBadgeIds = earnedRows.map(row => row.badge_id);
        let lockedBadges = [];

        // 2. Fetch locked badges (badges not earned yet)
        if (earnedBadgeIds.length > 0) {
            const placeholders = earnedBadgeIds.map(() => '?').join(',');
            const [lockedRows] = await pool.execute(`
                SELECT id, code, name, icon, rarity, requirement 
                FROM badge_definitions 
                WHERE is_active = 1 AND id NOT IN (${placeholders})
            `, earnedBadgeIds) as any[];
            lockedBadges = lockedRows;
        } else {
            const [lockedRows] = await pool.execute(`
                SELECT id, code, name, icon, rarity, requirement 
                FROM badge_definitions 
                WHERE is_active = 1
            `) as any[];
            lockedBadges = lockedRows;
        }

        const formattedLockedBadges = lockedBadges.map(row => ({
            id: row.id,
            name: row.name,
            icon: row.icon || '🔒',
            rarity: row.rarity,
            requirement: row.requirement || `Complete requirements for ${row.name}`
        }));

        return NextResponse.json({
            earned: earnedBadges,
            locked: formattedLockedBadges
        });

    } catch (error: any) {
        console.error('Database error fetching badges:', error);
        return NextResponse.json({ error: 'Failed to fetch badges', details: error.message }, { status: 500 });
    }
}
