import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';

/**
 * Creates one badge per activity in the catalogue that doesn't already have
 * one, and maps it back via activity_catalogue.badge_id.
 *
 * Nothing in the codebase ever created `badge_definitions` or the
 * `activity_catalogue.badge_id` column -- both were provisioned by hand at
 * some point, so on any environment where that never happened this route
 * died on "Unknown column 'badge_id'" and surfaced only a generic "Badge
 * setup failed". It now provisions everything it depends on before writing.
 */

// Visual defaults per domain, matching the palette used across the badge UI.
const DOMAIN_STYLE: Record<string, { color: string; bg: string }> = {
    TEC: { color: '#2563EB', bg: '#EFF6FF' },
    LCH: { color: '#7C3AED', bg: '#F5F3FF' },
    ESO: { color: '#059669', bg: '#ECFDF5' },
    IIE: { color: '#D97706', bg: '#FFFBEB' },
    HWB: { color: '#DC2626', bg: '#FEF2F2' },
};

async function addColumnIfMissing(table: string, ddl: string) {
    try {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
    } catch (e: any) {
        // Already present is the expected steady state; anything else is real.
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
}

async function ensureSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS badge_definitions (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            code          VARCHAR(64)  NOT NULL,
            name          VARCHAR(190) NOT NULL,
            description   TEXT         DEFAULT NULL,
            icon          VARCHAR(16)  DEFAULT '🏆',
            domain        VARCHAR(10)  DEFAULT 'TEC',
            rarity        VARCHAR(20)  DEFAULT 'Common',
            color         VARCHAR(20)  DEFAULT '#2563EB',
            bg_color      VARCHAR(20)  DEFAULT '#EFF6FF',
            requirement   VARCHAR(255) DEFAULT NULL,
            type          ENUM('activity','milestone') DEFAULT 'activity',
            target_value  INT          DEFAULT 1,
            metric        VARCHAR(50)  DEFAULT 'completion',
            is_active     TINYINT(1)   NOT NULL DEFAULT 1,
            created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_badge_code (code)
        )
    `);

    // Older installs predate these columns.
    await addColumnIfMissing('badge_definitions', "type ENUM('activity','milestone') DEFAULT 'activity'");
    await addColumnIfMissing('badge_definitions', 'target_value INT DEFAULT 1');
    await addColumnIfMissing('badge_definitions', "metric VARCHAR(50) DEFAULT 'completion'");
    await addColumnIfMissing('badge_definitions', 'is_active TINYINT(1) NOT NULL DEFAULT 1');

    // The mapping column this whole route exists to populate.
    await addColumnIfMissing('activity_catalogue', 'badge_id INT DEFAULT NULL');
}

export async function POST(request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    const logs: string[] = [];
    const failures: string[] = [];

    try {
        await ensureSchema();

        const [activities]: any = await pool.query(
            'SELECT id, code, title, domain FROM activity_catalogue'
        );
        if (!activities || activities.length === 0) {
            return NextResponse.json({ success: true, message: 'No activities found in the catalogue.', logs, failures });
        }

        let created = 0;
        let mapped = 0;

        for (const activity of activities) {
            // One bad row (e.g. an over-long title) must not abort the whole run.
            try {
                const badgeCode = `B-${activity.code}`;
                const badgeName = `${activity.title} Badge`;
                const style = DOMAIN_STYLE[activity.domain] || DOMAIN_STYLE.TEC;

                // Match on code OR name: code is the unique key, but older rows
                // were only ever matched by name. Checking just one of them let
                // the INSERT hit a duplicate-key error on the other.
                const [existing]: any = await pool.query(
                    'SELECT id FROM badge_definitions WHERE code = ? OR name = ? LIMIT 1',
                    [badgeCode, badgeName]
                );

                let badgeId: number | null = null;

                if (existing.length > 0) {
                    badgeId = existing[0].id;
                    await pool.query(
                        `UPDATE badge_definitions
                         SET type = 'activity', target_value = 1, metric = 'activity_completion', is_active = 1
                         WHERE id = ?`,
                        [badgeId]
                    );
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
                    created++;
                    logs.push(`Created badge for ${activity.code} — ${activity.title}`);
                }

                if (badgeId) {
                    await pool.query('UPDATE activity_catalogue SET badge_id = ? WHERE id = ?', [badgeId, activity.id]);
                    mapped++;
                }
            } catch (rowErr: any) {
                failures.push(`${activity.code}: ${rowErr.message}`);
            }
        }

        const message = created > 0
            ? `Created ${created} badge${created === 1 ? '' : 's'} and mapped ${mapped} activit${mapped === 1 ? 'y' : 'ies'}.`
            : `No new badges needed — all ${activities.length} activities already have one (${mapped} mapping${mapped === 1 ? '' : 's'} refreshed).`;

        return NextResponse.json({ success: true, message, logs, failures });
    } catch (error: any) {
        console.error('Badge setup error:', error);
        // This endpoint is admin-gated and exists specifically to diagnose and
        // repair schema drift, so the real error is returned rather than a
        // generic string -- a bare "Badge setup failed" is undebuggable.
        return NextResponse.json(
            { success: false, error: `Badge setup failed: ${error.message}`, logs, failures },
            { status: 500 }
        );
    }
}
