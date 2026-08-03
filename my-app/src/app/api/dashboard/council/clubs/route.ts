import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiSecurity';
import { getCouncilDomains } from '@/lib/councilScope';

// Clubs across every domain this council user is assigned to, each still
// carrying its own `domain` column so the frontend can group them
// domain-wise rather than showing one flat list.
export async function GET() {
    const auth = await requireAuth(['council']);
    if (auth.response) return auth.response;
    const username = auth.user.username as string;

    try {
        const domains = await getCouncilDomains(username);
        if (domains.length === 0) return NextResponse.json({ error: 'Council profile not found' }, { status: 404 });

        const placeholders = domains.map(() => '?').join(',');
        const [clubs]: any = await pool.execute(
            `SELECT * FROM clubs WHERE domain IN (${placeholders}) ORDER BY domain, name`, domains
        );
        return NextResponse.json({ clubs, domains });
    } catch (error: any) {
        console.error('Council clubs error:', error);
        return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
    }
}
