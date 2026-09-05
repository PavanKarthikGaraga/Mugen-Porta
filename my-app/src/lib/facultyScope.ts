import pool from '@/lib/db';

export async function getFacultyClubIds(username: string): Promise<string[]> {
    let rows: any[];
    try {
        const [r]: any = await pool.execute(
            'SELECT assignedClubs FROM faculty WHERE username = ?',
            [username]
        );
        rows = r;
    } catch (e: any) {
        throw e;
    }

    if (!rows.length) return [];
    const row = rows[0];

    if (row.assignedClubs) {
        try {
            const parsed = typeof row.assignedClubs === 'string'
                ? JSON.parse(row.assignedClubs)
                : row.assignedClubs;
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter((c: any) => typeof c === 'string' && c);
            }
        } catch { /* ignore */ }
    }

    return [];
}
