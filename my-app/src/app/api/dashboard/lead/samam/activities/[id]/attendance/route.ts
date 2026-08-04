import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { getLeadClubIds } from '@/lib/leadScope';

async function checkLead() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;
    
    let leadResult: any[] = [];
    try {
        const [rows]: any = await pool.execute('SELECT clubId, assigned_categories FROM leads WHERE username = ?', [decoded.username as string]);
        leadResult = rows;
    } catch (e: any) {
        if (e.code === 'ER_BAD_FIELD_ERROR' || e.message?.includes('assigned_categories')) {
            const [rows]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [decoded.username as string]);
            leadResult = rows;
        } else {
            throw e;
        }
    }
    if (leadResult.length === 0) return null;
    
    let assigned_categories: string[] = [];
    if (leadResult[0].assigned_categories) {
        try {
            assigned_categories = typeof leadResult[0].assigned_categories === 'string' 
                ? JSON.parse(leadResult[0].assigned_categories) 
                : leadResult[0].assigned_categories;
        } catch(e) {}
    }
    
    const clubIds = await getLeadClubIds(decoded.username as string);
    return { decoded, clubIds, assigned_categories };
}

/**
 * Resolve the activity a lead is allowed to act on.
 *
 * Leads reach activities two ways: explicit club→activity mappings (how the
 * SAMAM dashboard lists them) and, for older accounts, `assigned_categories`.
 * Gating on categories alone 403s every lead whose access comes from a mapping,
 * so both paths are accepted here.
 *
 * Returns the activity row, or null when the lead may not touch it.
 */
async function resolveAccessibleActivity(lead: any, code: string) {
    const [actRows]: any = await pool.execute(
        'SELECT id, code, title, category FROM activity_catalogue WHERE code = ?',
        [code]
    );
    if ((actRows as any[]).length === 0) return null;
    const activity = (actRows as any[])[0];

    if (lead.clubIds?.length > 0) {
        const placeholders = lead.clubIds.map(() => '?').join(',');
        const [mapRows]: any = await pool.execute(
            `SELECT 1 FROM club_activity_mappings WHERE club_id IN (${placeholders}) AND activity_code = ?`,
            [...lead.clubIds, code]
        );
        if ((mapRows as any[]).length > 0) return activity;
    }

    if (lead.assigned_categories?.length && lead.assigned_categories.includes(activity.category)) {
        return activity;
    }

    return null;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const lead = await checkLead();
        if (!lead) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params; // id is the activity code

        const activity = await resolveAccessibleActivity(lead, id);
        if (!activity) {
            return NextResponse.json({ message: 'Activity not found or not assigned to you' }, { status: 403 });
        }

        // Fetch ALL students enrolled in this activity
        const [rows] = await pool.execute(`
            SELECT ae.id, ae.username, s.name, ae.attendance_percentage, ae.attendance_marked
            FROM activity_enrollments ae
            JOIN students s ON ae.username = s.username
            WHERE ae.activity_code = ?
            ORDER BY s.name ASC
        `, [id]);

        return NextResponse.json({
            success: true,
            students: rows,
            activity: { code: activity.code, title: activity.title },
        });

    } catch (error: any) {
        console.error('Fetch attendance error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const lead = await checkLead();
        if (!lead) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const absentees: string[] = Array.isArray(body.absentees) ? body.absentees : [];

        const activity = await resolveAccessibleActivity(lead, id);
        if (!activity) {
            return NextResponse.json({ message: 'Activity not found or not assigned to you' }, { status: 403 });
        }

        // Once attendance has been marked/locked for this activity, only an
        // admin may make further changes -- a lead can mark it the first
        // time, but not re-edit it afterward (see the admin-side route for
        // the admin-only override).
        const [lockRows]: any = await pool.execute(
            'SELECT 1 FROM activity_enrollments WHERE activity_code = ? AND attendance_marked = TRUE LIMIT 1',
            [id]
        );
        if ((lockRows as any[]).length > 0) {
            return NextResponse.json({ message: 'Attendance is locked. Only an admin can make further changes.' }, { status: 403 });
        }

        const absenteesPlaceholders = absentees.length > 0 ? absentees.map(() => '?').join(',') : "''";
        
        let query = `
            UPDATE activity_enrollments 
            SET 
                attendance_marked = TRUE,
                attendance_percentage = CASE 
                    WHEN username IN (${absenteesPlaceholders}) THEN 0
                    ELSE 100
                END
            WHERE activity_code = ? 
        `;
        
        let queryParams = [...absentees, id];

        await pool.execute(query, queryParams);

        return NextResponse.json({ success: true, message: 'Attendance saved successfully' });

    } catch (error: any) {
        console.error('Save attendance error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
