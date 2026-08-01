import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function getLeadData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;

    const [rows]: any = await pool.execute(
        'SELECT clubId FROM leads WHERE username = ?',
        [decoded.username as string]
    );
    if (rows.length === 0) return null;
    return { username: decoded.username as string, clubId: rows[0].clubId };
}

async function canAccessActivity(leadData: any, activityCode: string): Promise<boolean> {
    if (leadData.clubId) {
        const [mapRows]: any = await pool.execute(
            'SELECT 1 FROM club_activity_mappings WHERE club_id = ? AND activity_code = ?',
            [leadData.clubId, activityCode]
        );
        if ((mapRows as any[]).length > 0) return true;

        const [anyMaps]: any = await pool.execute(
            'SELECT 1 FROM club_activity_mappings WHERE club_id = ? LIMIT 1',
            [leadData.clubId]
        );
        if ((anyMaps as any[]).length > 0) return false;
    }
    // Fall back: any activity the lead can see is accessible
    return true;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const leadData = await getLeadData();
        if (!leadData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        // Verify activity exists
        const [actRows]: any = await pool.execute(
            'SELECT code, title FROM activity_catalogue WHERE code = ?',
            [id]
        );
        if ((actRows as any[]).length === 0) {
            return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
        }
        const activity = (actRows as any[])[0];

        if (!await canAccessActivity(leadData, id)) {
            return NextResponse.json({ error: 'Not authorized to view this activity' }, { status: 403 });
        }

        let students: any[];
        try {
            const [rows]: any = await pool.execute(`
                SELECT
                    ae.username      AS student_id,
                    s.name,
                    s.branch,
                    s.year,
                    s.residenceType,
                    s.hostelName,
                    s.busRoute,
                    ae.enrollment_status,
                    ae.enrolled_at
                FROM activity_enrollments ae
                JOIN students s ON ae.username = s.username
                WHERE ae.activity_code = ?
                ORDER BY s.name ASC
            `, [id]);
            students = rows as any[];
        } catch {
            // residenceType/hostelName/busRoute columns may not exist yet
            const [rows]: any = await pool.execute(`
                SELECT
                    ae.username      AS student_id,
                    s.name,
                    s.branch,
                    s.year,
                    NULL AS residenceType,
                    NULL AS hostelName,
                    NULL AS busRoute,
                    ae.enrollment_status,
                    ae.enrolled_at
                FROM activity_enrollments ae
                JOIN students s ON ae.username = s.username
                WHERE ae.activity_code = ?
                ORDER BY s.name ASC
            `, [id]);
            students = rows as any[];
        }

        return NextResponse.json({
            success: true,
            activity: { code: activity.code, title: activity.title },
            students,
            total: (students as any[]).length,
        });
    } catch (error: any) {
        console.error('Enrolled students error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch enrolled students') }, { status: 500 });
    }
}
