import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

const DEMO_ACCOUNTS = new Set(['2400000000']);

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;
        if (!token) return NextResponse.json({ enabled: false }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ enabled: false }, { status: 401 });

        // Demo account always has full access
        if (DEMO_ACCOUNTS.has(decoded.username as string)) {
            return NextResponse.json({ enabled: true });
        }

        try {
            const [rows]: any = await pool.execute(
                `SELECT career_roadmap_enabled FROM controls WHERE id = 1`
            );
            const enabled = rows[0]?.career_roadmap_enabled ?? 1;
            return NextResponse.json({ enabled: Boolean(enabled) });
        } catch {
            // If column doesn't exist yet, default to enabled
            return NextResponse.json({ enabled: true });
        }
    } catch {
        return NextResponse.json({ enabled: true });
    }
}
