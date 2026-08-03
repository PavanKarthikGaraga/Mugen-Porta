import pool from '@/lib/db';

/**
 * Council users can be assigned multiple domains (e.g. TEC + LCH). The
 * canonical list lives in `council.assignedDomains` (a JSON array), added
 * alongside the original `council.assignedDomain` (a single VARCHAR) so
 * existing rows created before multi-domain support keep working — see
 * ensureCouncilTable() in src/app/api/dashboard/admin/users/route.ts, which
 * backfills assignedDomains from assignedDomain for any row missing it.
 *
 * Every place that used to do
 *   SELECT assignedDomain FROM council WHERE username = ?
 *   SELECT id FROM clubs WHERE domain = ?
 * should use getCouncilClubIds()/getCouncilDomains() instead, so a council
 * user's access always reflects however many domains they're assigned,
 * with one implementation to update instead of a dozen copies.
 */

export async function getCouncilDomains(username: string): Promise<string[]> {
    const [rows]: any = await pool.execute(
        'SELECT assignedDomains, assignedDomain FROM council WHERE username = ?',
        [username]
    );
    if (!rows.length) return [];
    const row = rows[0];

    if (row.assignedDomains) {
        try {
            const parsed = typeof row.assignedDomains === 'string'
                ? JSON.parse(row.assignedDomains)
                : row.assignedDomains;
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter((d: any) => typeof d === 'string' && d);
            }
        } catch { /* fall through to the legacy column */ }
    }

    // Legacy single-domain row that hasn't been backfilled yet.
    return row.assignedDomain ? [row.assignedDomain] : [];
}

export async function getCouncilClubIds(username: string): Promise<string[]> {
    const domains = await getCouncilDomains(username);
    if (domains.length === 0) return [];
    const placeholders = domains.map(() => '?').join(',');
    const [rows]: any = await pool.execute(
        `SELECT id FROM clubs WHERE domain IN (${placeholders})`,
        domains
    );
    return (rows as any[]).map((r: any) => r.id as string);
}

/**
 * For council: their assigned domains' club IDs. For everyone else
 * (admin/faculty): null, meaning unrestricted — matches the existing
 * getCouncilClubScope() convention used across the admin SAMAM routes.
 */
export async function getCouncilScope(role: string, username: string): Promise<string[] | null> {
    if (role !== 'council') return null;
    return getCouncilClubIds(username);
}
