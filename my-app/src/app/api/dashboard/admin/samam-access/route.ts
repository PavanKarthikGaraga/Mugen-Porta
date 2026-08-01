import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

async function ensureSamamAccessColumn() {
    try {
        await pool.execute(
            `ALTER TABLE students ADD COLUMN samam_access TINYINT(1) NOT NULL DEFAULT 0`
        );
    } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
}

// GET /api/dashboard/admin/samam-access
// ?clubId=TEC01  → students in that club
// (no params)    → all clubs grouped by domain
export async function GET(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    try {
        await ensureSamamAccessColumn();

        if (!clubId) {
            const [clubs]: any = await pool.execute(
                `SELECT id, name, domain FROM clubs ORDER BY domain ASC, name ASC`
            );
            return NextResponse.json({ success: true, clubs: clubs as any[] });
        }

        const [students]: any = await pool.execute(
            `SELECT username, name, branch, year, COALESCE(samam_access, 0) as samam_access
             FROM students
             WHERE clubId = ?
             ORDER BY name ASC`,
            [clubId]
        );
        return NextResponse.json({ success: true, students: students as any[] });
    } catch (error: any) {
        console.error('SAMAM access GET error:', error);
        return NextResponse.json({ success: false, error: safeMessage(error) }, { status: 500 });
    }
}

// POST /api/dashboard/admin/samam-access
// Body: { usernames: string[], access: 1 | 0 }
export async function POST(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        await ensureSamamAccessColumn();

        const body = await request.json().catch(() => ({}));
        const { usernames, access } = body;

        if (!Array.isArray(usernames) || usernames.length === 0) {
            return NextResponse.json({ success: false, error: 'No students selected' }, { status: 400 });
        }

        const accessValue = access === 0 ? 0 : 1;
        const placeholders = usernames.map(() => '?').join(', ');

        const [result]: any = await pool.execute(
            `UPDATE students SET samam_access = ? WHERE username IN (${placeholders})`,
            [accessValue, ...usernames]
        );

        return NextResponse.json({
            success: true,
            updated: (result as any).affectedRows,
            action: accessValue === 1 ? 'unlocked' : 'locked',
        });
    } catch (error: any) {
        console.error('SAMAM access POST error:', error);
        return NextResponse.json({ success: false, error: safeMessage(error) }, { status: 500 });
    }
}
