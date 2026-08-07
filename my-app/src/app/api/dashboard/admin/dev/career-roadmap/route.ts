import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyDevAccess } from '../../auth-helper';

async function ensureColumn() {
    try {
        await pool.execute(
            `ALTER TABLE controls ADD COLUMN career_roadmap_enabled TINYINT(1) NOT NULL DEFAULT 1`
        );
    } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
}

export async function GET(request: Request) {
    const auth = await verifyDevAccess(request);
    if (!auth.success) return auth.response;

    await ensureColumn();
    const [rows]: any = await pool.execute(`SELECT career_roadmap_enabled FROM controls WHERE id = 1`);
    const enabled = rows[0]?.career_roadmap_enabled ?? 1;
    return NextResponse.json({ enabled: Boolean(enabled) });
}

export async function PUT(request: Request) {
    const auth = await verifyDevAccess(request);
    if (!auth.success) return auth.response;

    await ensureColumn();
    const { enabled } = await request.json();
    await pool.execute(`UPDATE controls SET career_roadmap_enabled = ? WHERE id = 1`, [enabled ? 1 : 0]);
    return NextResponse.json({ success: true, enabled: Boolean(enabled) });
}
