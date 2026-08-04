import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { getCouncilClubIds } from '@/lib/councilScope';
import { getLeadClubIds } from '@/lib/leadScope';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded) return null;
    return decoded;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const role = user.role as string;
        const reviewerUsername = user.username as string;

        if (!['admin', 'faculty', 'lead', 'council'].includes(role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Fetch the request
        const [reqRows]: any = await pool.execute(
            `SELECT pvr.*, s.clubId FROM passport_verification_requests pvr
             JOIN students s ON pvr.username = s.username
             WHERE pvr.id = ?`,
            [id]
        );
        if (reqRows.length === 0) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }
        const req = reqRows[0];

        // Role-based access check
        if (role === 'faculty') {
            const [facRows]: any = await pool.execute('SELECT assignedClubs FROM faculty WHERE username = ?', [reviewerUsername]);
            let clubs: string[] = [];
            try {
                clubs = Array.isArray(facRows[0]?.assignedClubs)
                    ? facRows[0].assignedClubs
                    : JSON.parse(facRows[0]?.assignedClubs ?? '[]');
            } catch { clubs = []; }
            if (!clubs.includes(req.clubId)) {
                return NextResponse.json({ error: 'Access denied: student not in your assigned clubs' }, { status: 403 });
            }
        } else if (role === 'council') {
            const clubIds = await getCouncilClubIds(reviewerUsername);
            if (!clubIds.includes(req.clubId)) {
                return NextResponse.json({ error: 'Access denied: student not in your domain' }, { status: 403 });
            }
        } else if (role === 'lead') {
            const clubIds = await getLeadClubIds(reviewerUsername);
            if (!clubIds.includes(req.clubId)) {
                return NextResponse.json({ error: 'Access denied: student not in your club' }, { status: 403 });
            }
        }

        const body = await request.json().catch(() => ({}));
        const { status, notes } = body;

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Status must be "approved" or "rejected"' }, { status: 400 });
        }

        await pool.execute(
            `UPDATE passport_verification_requests
             SET status = ?, reviewed_by = ?, reviewed_at = NOW(), reviewer_notes = ?
             WHERE id = ?`,
            [status, reviewerUsername, notes ?? null, id]
        );

        return NextResponse.json({ success: true, message: `Passport ${status} successfully` });
    } catch (error: any) {
        console.error('Passport review error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to process review') }, { status: 500 });
    }
}
