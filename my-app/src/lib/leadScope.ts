import pool from '@/lib/db';

/**
 * Leads normally manage a single "parent" club (leads.clubId). An admin can 
 * additionally map them to "child" clubs — other clubs they also manage across 
 * any domain — stored as a JSON array in leads.childClubIds, added alongside 
 * the original clubId column (kept, not replaced, so everything that only ever 
 * knew about one club per lead keeps working).
 *
 * Every place that used to do
 *   SELECT clubId FROM leads WHERE username = ?
 * and then scope a query to that single club should use getLeadClubIds()
 * instead, so a lead's access always reflects their parent club plus
 * whatever child clubs they've been mapped to, with one implementation to
 * update instead of a few dozen copies.
 */

export async function ensureLeadChildClubsColumn() {
    try {
        await pool.query(`ALTER TABLE leads ADD COLUMN childClubIds JSON NULL`);
    } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
}

export async function getLeadClubIds(username: string): Promise<string[]> {
    const [rows]: any = await pool.execute(
        'SELECT clubId, childClubIds FROM leads WHERE username = ?',
        [username]
    );
    if (!rows.length) return [];
    const row = rows[0];

    const ids = new Set<string>();
    if (row.clubId != null) ids.add(String(row.clubId));

    if (row.childClubIds) {
        try {
            const parsed = typeof row.childClubIds === 'string'
                ? JSON.parse(row.childClubIds)
                : row.childClubIds;
            if (Array.isArray(parsed)) {
                for (const id of parsed) {
                    if (id != null && id !== '') ids.add(String(id));
                }
            }
        } catch { /* malformed JSON — fall back to just the parent club */ }
    }

    return Array.from(ids);
}

/**
 * For leads: their parent + child club IDs. For everyone else (admin/
 * faculty/council): null, meaning unrestricted — matches the
 * getCouncilScope() convention in councilScope.ts.
 */
export async function getLeadScope(role: string, username: string): Promise<string[] | null> {
    if (role !== 'lead') return null;
    return getLeadClubIds(username);
}
