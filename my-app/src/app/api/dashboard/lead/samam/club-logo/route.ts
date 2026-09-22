import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { getLeadClubIds } from '@/lib/leadScope';

async function verifyLead(clubId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;

    const managedClubs = await getLeadClubIds(decoded.username as string);
    if (!managedClubs.includes(clubId)) return null;

    return decoded;
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { clubId, logoUrl } = body;

        if (!clubId) {
            return NextResponse.json({ error: 'Missing clubId' }, { status: 400 });
        }

        const user = await verifyLead(clubId);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized or club not managed by this lead' }, { status: 403 });
        }

        // Add logo_url column if it doesn't exist (safety catch, though user should run ALTER TABLE)
        try {
            await pool.query('ALTER TABLE clubs ADD COLUMN logo_url VARCHAR(255) DEFAULT NULL');
        } catch (e: any) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Failed to add logo_url column:', e.message);
        }

        await pool.execute('UPDATE clubs SET logo_url = ? WHERE id = ?', [logoUrl || null, clubId]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Club logo update error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to update club logo') }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clubId = searchParams.get('clubId');

        if (!clubId) {
            return NextResponse.json({ error: 'Missing clubId' }, { status: 400 });
        }

        const user = await verifyLead(clubId);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized or club not managed by this lead' }, { status: 403 });
        }

        await pool.execute('UPDATE clubs SET logo_url = NULL WHERE id = ?', [clubId]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Club logo delete error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to delete club logo') }, { status: 500 });
    }
}
