import { getCouncilDomains } from '@/lib/councilScope';
import { getFacultyClubIds } from '@/lib/facultyScope';
import { getLeadClubIds } from '@/lib/leadScope';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema } from '@/lib/dbMigrate';

async function checkAdminOrFaculty() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token) as { role: string; username: string } | null;
    if (!decoded || !['admin', 'faculty', 'council', 'lead'].includes(decoded.role)) return null;
    return decoded;
}

async function isAuthorizedForActivity(user: any, activityCode: string): Promise<boolean> {
    if (user.role === 'council') {
        const councilDomains = await getCouncilDomains(user.username);
        if (councilDomains.length === 0) return false;
        const [rows] = await pool.execute('SELECT domain FROM activity_catalogue WHERE code = ?', [activityCode]);
        if ((rows as any[]).length === 0) return true;
        return councilDomains.includes((rows as any[])[0].domain);
    } else if (user.role === 'faculty') {
        const facultyClubs = await getFacultyClubIds(user.username);
        if (facultyClubs.length === 0) return false;
        const placeholders = facultyClubs.map(() => '?').join(',');
        const [rows] = await pool.execute(`SELECT 1 FROM club_activity_mappings WHERE activity_code = ? AND club_id IN (${placeholders})`, [activityCode, ...facultyClubs]);
        return (rows as any[]).length > 0;
    } else if (user.role === 'lead') {
        const leadClubs = await getLeadClubIds(user.username);
        if (leadClubs.length === 0) return false;
        const placeholders = leadClubs.map(() => '?').join(',');
        const [rows] = await pool.execute(`SELECT 1 FROM club_activity_mappings WHERE activity_code = ? AND club_id IN (${placeholders})`, [activityCode, ...leadClubs]);
        return (rows as any[]).length > 0;
    }
    return true; // admin
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await checkAdminOrFaculty();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        
        if (!await isAuthorizedForActivity(user, id)) {
            return NextResponse.json({ message: 'Unauthorized domain' }, { status: 403 });
        }

        const body = await request.json();
        const { action, note } = body;

        if (action !== 'approve' && action !== 'reject') {
            return NextResponse.json({ message: 'Invalid action. Must be approve or reject' }, { status: 400 });
        }

        await ensureActivitySchema();

        const [checkRows] = await pool.execute('SELECT code FROM activity_catalogue WHERE code = ?', [id]);
        if ((checkRows as any[]).length === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        const newStatus = action === 'approve' ? 'active' : 'rejected';
        const rejectionNote = action === 'reject' ? (note || 'Rejected by reviewer') : null;

        const [result] = await pool.execute(
            `UPDATE activity_catalogue SET approval_status = ?, rejection_note = ? WHERE code = ?`,
            [newStatus, rejectionNote, id]
        );

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: 'Failed to update activity' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: `Activity ${action}d successfully` });

    } catch (error: any) {
        console.error('Approve activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
