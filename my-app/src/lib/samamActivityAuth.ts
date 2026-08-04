import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { getCouncilClubIds } from '@/lib/councilScope';
import { getLeadClubIds } from '@/lib/leadScope';

/**
 * Shared authorization for activity-scoped SAMAM actions (certificates,
 * points, badges): who may act on a given activity, and how their scope is
 * resolved.
 *
 *   admin, faculty — unrestricted, may act on any activity
 *   council        — restricted to activities mapped to a club in any of
 *                     their assigned domains (via club_activity_mappings)
 *   lead           — restricted to activities mapped to their own club, or
 *                     (legacy accounts) their assigned_categories
 */

export interface ActivityIssuer {
    decoded: any;
    unrestricted: boolean;
    clubIds: string[];
    assigned_categories: string[];
}

export async function checkIssuer(): Promise<ActivityIssuer | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded: any = await verifyToken(token);
    if (!decoded) return null;

    if (decoded.role === 'faculty' || decoded.role === 'admin') {
        return { decoded, unrestricted: true, clubIds: [], assigned_categories: [] };
    }

    if (decoded.role === 'council') {
        const clubIds = await getCouncilClubIds(decoded.username);
        return { decoded, unrestricted: false, clubIds, assigned_categories: [] };
    }

    if (decoded.role !== 'lead') return null;

    let leadRows: any[] = [];
    try {
        const [rows]: any = await pool.execute(
            'SELECT clubId, assigned_categories FROM leads WHERE username = ?', [decoded.username]
        );
        leadRows = rows;
    } catch (e: any) {
        if (e.code === 'ER_BAD_FIELD_ERROR' || e.message?.includes('assigned_categories')) {
            const [rows]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [decoded.username]);
            leadRows = rows;
        } else throw e;
    }
    if (leadRows.length === 0) return null;

    let assigned_categories: string[] = [];
    if (leadRows[0].assigned_categories) {
        try {
            assigned_categories = typeof leadRows[0].assigned_categories === 'string'
                ? JSON.parse(leadRows[0].assigned_categories)
                : leadRows[0].assigned_categories;
        } catch { /* treat as none */ }
    }
    // leadRows[0].clubId alone is just the parent club -- getLeadClubIds()
    // resolves parent + any TEC child clubs this lead has been mapped to.
    const clubIds = await getLeadClubIds(decoded.username);
    return {
        decoded, unrestricted: false,
        clubIds,
        assigned_categories,
    };
}

/**
 * Confirms the caller may act on this activity and returns its catalogue row.
 *
 * Leads and council reach activities through an explicit club→activity
 * mapping; leads additionally accept `assigned_categories` for older
 * accounts. Both paths are checked so gating on one alone never locks out an
 * account whose access comes from the other.
 */
export async function loadPermittedActivity(issuer: ActivityIssuer, code: string) {
    const [rows]: any = await pool.execute(
        'SELECT code, title, domain, category, sdc_credits, badge_id FROM activity_catalogue WHERE code = ? LIMIT 1', [code]
    );
    const activity = rows[0];
    if (!activity) return null;

    if (issuer.unrestricted) return activity;

    if (issuer.clubIds.length > 0) {
        const ph = issuer.clubIds.map(() => '?').join(',');
        const [mapRows]: any = await pool.execute(
            `SELECT 1 FROM club_activity_mappings WHERE club_id IN (${ph}) AND activity_code = ?`,
            [...issuer.clubIds, code]
        );
        if ((mapRows as any[]).length > 0) return activity;
    }

    if (issuer.assigned_categories?.length && issuer.assigned_categories.includes(activity.category)) {
        return activity;
    }

    return null;
}
