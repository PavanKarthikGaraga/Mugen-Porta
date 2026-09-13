import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema } from '@/lib/dbMigrate';

/** Ensure club_category_mappings table exists */
async function ensureCategoryMappingsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS club_category_mappings (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            club_id    VARCHAR(100) NOT NULL,
            category   VARCHAR(255) NOT NULL,
            created_by VARCHAR(100) DEFAULT NULL,
            created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_club_category (club_id, category)
        )
    `);
}

// GET: all clubs + all distinct categories + current category mappings per club
export async function GET() {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        await ensureActivitySchema();
        await ensureCategoryMappingsTable();

        const [[clubs], [categories], [categoryMappings]] = await Promise.all([
            // All clubs across all domains
            pool.execute(`SELECT id, name, domain FROM clubs ORDER BY domain ASC, name ASC`),
            // All distinct categories from activities (for mapping UI)
            pool.execute(`
                SELECT DISTINCT domain, category, COUNT(*) as activity_count
                FROM activity_catalogue
                WHERE approval_status IN ('active', 'pending_approval', 'completed')
                  AND category IS NOT NULL AND category != ''
                GROUP BY domain, category
                ORDER BY domain ASC, category ASC
            `),
            // All category mappings
            pool.execute(`SELECT club_id, category FROM club_category_mappings ORDER BY club_id, category`),
        ]) as any[];

        return NextResponse.json({ success: true, clubs, categories, categoryMappings });
    } catch (error: any) {
        console.error('Activity mapper GET error:', error);
        return NextResponse.json({ success: false, error: safeMessage(error) }, { status: 500 });
    }
}

// POST: save category mappings for a club (replaces existing)
export async function POST(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        await ensureCategoryMappingsTable();

        const body = await request.json().catch(() => ({}));
        const { clubId, categories } = body;
        if (!clubId) return NextResponse.json({ success: false, error: 'clubId required' }, { status: 400 });

        const cats: string[] = Array.isArray(categories) ? categories.filter(Boolean) : [];
        const username: string = (auth.user as any)?.username ?? 'admin';

        // Delete existing category mappings for this club, then re-insert
        await pool.execute(`DELETE FROM club_category_mappings WHERE club_id = ?`, [clubId]);

        if (cats.length > 0) {
            const placeholders = cats.map(() => '(?, ?, ?)').join(', ');
            const params = cats.flatMap((cat: string) => [clubId, cat, username]);
            await pool.execute(
                `INSERT INTO club_category_mappings (club_id, category, created_by) VALUES ${placeholders}`,
                params
            );
        }

        return NextResponse.json({ success: true, mapped: cats.length });
    } catch (error: any) {
        console.error('Activity mapper POST error:', error);
        return NextResponse.json({
            success: false,
            error: safeMessage(error),
            code: error?.code ?? error?.sqlState ?? 'UNKNOWN',
        }, { status: 500 });
    }
}
