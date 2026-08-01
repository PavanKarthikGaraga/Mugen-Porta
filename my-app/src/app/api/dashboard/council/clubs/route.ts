import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';

export async function GET() {
    const auth = await requireAuth(['council']);
    if (auth.response) return auth.response;
    const username = auth.user.username as string;

    try {
        const [rows]: any = await pool.execute(
            'SELECT assignedDomain FROM council WHERE username = ?', [username]
        );
        if (!rows.length) return NextResponse.json({ error: 'Council profile not found' }, { status: 404 });
        const domain = rows[0].assignedDomain as string;

        const [clubs]: any = await pool.execute(
            'SELECT * FROM clubs WHERE domain = ? ORDER BY name', [domain]
        );
        return NextResponse.json({ clubs, domain });
    } catch (error: any) {
        console.error('Council clubs error:', error);
        return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
    }
}
