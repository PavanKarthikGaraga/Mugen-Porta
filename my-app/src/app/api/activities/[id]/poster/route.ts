import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema } from '@/lib/dbMigrate';
import { getLeadClubIds } from '@/lib/leadScope';
import { getCouncilDomains } from '@/lib/councilScope';

async function checkAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded: any = await verifyToken(token);
    if (!decoded || !['admin', 'faculty', 'council', 'lead'].includes(decoded.role)) return null;
    return decoded;
}

async function isAuthorizedForActivity(user: any, activityCode: string): Promise<boolean> {
    // Admin and faculty have full access to all activities
    if (user.role === 'admin' || user.role === 'faculty') return true;

    if (user.role === 'council') {
        // Council can edit activities in their assigned domains OR ones they submitted
        const [actRows] = await pool.execute(
            'SELECT domain, submitted_by FROM activity_catalogue WHERE code = ?',
            [activityCode]
        );
        if ((actRows as any[]).length > 0 && (actRows as any[])[0].submitted_by === user.username) {
            return true;
        }

        // Look up council's assigned domains from DB (not from JWT — they're not in the token)
        const councilDomains = await getCouncilDomains(user.username);
        if (councilDomains.length === 0) return false;
        if ((actRows as any[]).length === 0) return true; // let 404 handle it

        return councilDomains.includes((actRows as any[])[0].domain);
    }

    if (user.role === 'lead') {
        // Lead can edit activities they submitted OR that belong to their club mapping
        const [actRows] = await pool.execute(
            'SELECT submitted_by FROM activity_catalogue WHERE code = ?',
            [activityCode]
        );
        if ((actRows as any[]).length > 0 && (actRows as any[])[0].submitted_by === user.username) {
            return true;
        }

        // Look up lead's club IDs from DB (not from JWT — they're not in the token)
        const leadClubs = await getLeadClubIds(user.username);
        if (leadClubs.length === 0) return false;

        const [rows] = await pool.execute(`
            SELECT 1 FROM club_activity_mappings 
            WHERE activity_code = ? AND club_id IN (${leadClubs.map(() => '?').join(',')})
        `, [activityCode, ...leadClubs]);

        return (rows as any[]).length > 0;
    }

    return false;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await checkAuth();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        
        if (!await isAuthorizedForActivity(user, id)) {
            return NextResponse.json({ message: 'Unauthorized to modify this activity' }, { status: 403 });
        }

        const body = await request.json();
        const { poster_url } = body;

        if (poster_url === undefined) {
            return NextResponse.json({ message: 'poster_url is required' }, { status: 400 });
        }

        await ensureActivitySchema();

        const [result] = await pool.execute(`
            UPDATE activity_catalogue
            SET poster_url = ?
            WHERE code = ?
        `, [poster_url || null, id]);

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Activity poster updated successfully', poster_url });
    } catch (error: any) {
        console.error('Update activity poster error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
