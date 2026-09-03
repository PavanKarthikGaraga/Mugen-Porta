import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema } from '@/lib/dbMigrate';

async function checkAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded: any = await verifyToken(token);
    if (!decoded || !['admin', 'faculty', 'council', 'lead'].includes(decoded.role)) return null;
    return decoded;
}

async function isAuthorizedForActivity(user: any, activityCode: string): Promise<boolean> {
    if (user.role === 'admin' || user.role === 'faculty') return true;

    if (user.role === 'council') {
        const [actRows] = await pool.execute('SELECT domain, submitted_by FROM activity_catalogue WHERE code = ?', [activityCode]);
        if ((actRows as any[]).length > 0 && (actRows as any[])[0].submitted_by === user.username) {
            return true;
        }

        const councilDomains = Array.isArray(user.assignedDomains) && user.assignedDomains.length > 0
            ? user.assignedDomains : (user.assignedDomain ? [user.assignedDomain] : []);
        if (councilDomains.length === 0) return false;
        
        if ((actRows as any[]).length === 0) return true;
        
        return councilDomains.includes((actRows as any[])[0].domain);
    }

    if (user.role === 'lead') {
        const [actRows] = await pool.execute('SELECT submitted_by FROM activity_catalogue WHERE code = ?', [activityCode]);
        if ((actRows as any[]).length > 0 && (actRows as any[])[0].submitted_by === user.username) {
            return true;
        }

        const leadClubs = Array.isArray(user.assignedClubs) && user.assignedClubs.length > 0
            ? user.assignedClubs : (user.assignedClub ? [user.assignedClub] : []);
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
