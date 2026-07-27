import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/apiSecurity';

const DOMAIN_NAMES: Record<string, string> = {
    TEC: 'Technology & Engineering',
    LCH: 'Liberal Arts, Culture & Heritage',
    ESO: 'Environment, Sustainability & Outreach',
    IIE: 'Innovation, Industry & Entrepreneurship',
    HWB: 'Health, Wellness & Behaviour',
};

export async function GET() {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;
    const user = auth.user!;

    try {
        // Get student's clubId
        const [studentRows] = await pool.execute(
            `SELECT clubId FROM students WHERE username = ?`,
            [user.username]
        ) as any[];

        const clubId = studentRows[0]?.clubId;
        if (!clubId) {
            return NextResponse.json({ success: true, club: null, lead: null });
        }

        // Get club info
        const [clubRows] = await pool.execute(
            `SELECT id, name, description, domain FROM clubs WHERE id = ?`,
            [clubId]
        ) as any[];

        const club = clubRows[0] || null;
        if (!club) {
            return NextResponse.json({ success: true, club: null, lead: null });
        }

        // Get lead assigned to this club
        const [leadRows] = await pool.execute(
            `SELECT username, name, email, phoneNumber FROM leads WHERE clubId = ? LIMIT 1`,
            [clubId]
        ) as any[];

        const lead = leadRows[0] || null;

        return NextResponse.json({
            success: true,
            club: {
                id: club.id,
                name: club.name,
                description: club.description,
                domain: club.domain,
                domainName: DOMAIN_NAMES[club.domain] || club.domain,
            },
            lead: lead ? {
                name: lead.name,
                idNumber: lead.username,
                email: lead.email,
                phone: lead.phoneNumber,
            } : null,
        });
    } catch (error: any) {
        console.error('Club info error:', error);
        return NextResponse.json({ error: 'Failed to load club info' }, { status: 500 });
    }
}
