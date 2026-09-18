import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

const DOMAIN_STYLE: Record<string, { color: string; bg: string }> = {
    TEC: { color: '#2563EB', bg: '#EFF6FF' },
    LCH: { color: '#7C3AED', bg: '#F5F3FF' },
    ESO: { color: '#059669', bg: '#ECFDF5' },
    IIE: { color: '#D97706', bg: '#FFFBEB' },
    HWB: { color: '#DC2626', bg: '#FEF2F2' },
};

export async function POST(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        const body = await request.json().catch(() => ({}));
        const { activity_code } = body;

        if (!activity_code) {
            return NextResponse.json({ success: false, message: 'Activity code required' }, { status: 400 });
        }

        const [activities]: any = await pool.query(
            'SELECT id, code, title, domain, badge_id FROM activity_catalogue WHERE code = ? LIMIT 1',
            [activity_code]
        );

        if (activities.length === 0) {
            return NextResponse.json({ success: false, message: 'Activity not found.' }, { status: 404 });
        }

        const activity = activities[0];

        if (activity.badge_id) {
            return NextResponse.json({ success: false, message: 'Activity already has a badge assigned.' }, { status: 400 });
        }

        const badgeCode = `B-${activity.code}`;
        const badgeName = `${activity.title} Badge`;
        const style = DOMAIN_STYLE[activity.domain] || DOMAIN_STYLE.TEC;

        // Check if badge exists but wasn't mapped
        const [existing]: any = await pool.query(
            'SELECT id FROM badge_definitions WHERE code = ? OR name = ? LIMIT 1',
            [badgeCode, badgeName]
        );

        let badgeId: number | null = null;

        if (existing.length > 0) {
            badgeId = existing[0].id;
        } else {
            const [res]: any = await pool.query(
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
            badgeId = res.insertId;
        }

        if (badgeId) {
            await pool.query('UPDATE activity_catalogue SET badge_id = ? WHERE id = ?', [badgeId, activity.id]);
        }

        return NextResponse.json({ success: true, message: 'Badge generated and mapped successfully.' });
    } catch (error: any) {
        console.error('Badge generate error:', error);
        return NextResponse.json(
            { success: false, error: safeMessage(error, 'Badge generation failed') },
            { status: 500 }
        );
    }
}
