import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../dashboard/admin/auth-helper';

export async function POST(request: Request) {
    const auth = await verifyAdminToken(request);
    if (!auth.success) return auth.response;

    const migrations = [
        `ALTER TABLE student_profiles ADD COLUMN is_public TINYINT(1) NOT NULL DEFAULT 0`,
        `ALTER TABLE passport_achievements ADD COLUMN icon VARCHAR(10) DEFAULT NULL`,
    ];

    const results: { sql: string; status: string; error?: string }[] = [];
    for (const sql of migrations) {
        try {
            await pool.execute(sql);
            results.push({ sql, status: 'applied' });
        } catch (err: any) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                results.push({ sql, status: 'already exists (skipped)' });
            } else {
                results.push({ sql, status: 'error', error: err.message });
            }
        }
    }

    return NextResponse.json({ message: 'Migration complete', results });
}
