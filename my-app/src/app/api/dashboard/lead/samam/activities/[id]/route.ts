import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function getLeadClubData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;

    let leadResult: any[] = [];
    try {
        const [rows]: any = await pool.execute(
            'SELECT l.clubId, l.assigned_categories FROM leads l WHERE l.username = ?',
            [decoded.username as string]
        );
        leadResult = rows;
    } catch (e: any) {
        if (e.code === 'ER_BAD_FIELD_ERROR' || e.message?.includes('assigned_categories')) {
            const [rows]: any = await pool.execute(
                'SELECT l.clubId FROM leads l WHERE l.username = ?',
                [decoded.username as string]
            );
            leadResult = rows;
        } else {
            throw e;
        }
    }

    if (leadResult.length > 0) {
        let assigned_categories: string[] = [];
        if (leadResult[0].assigned_categories) {
            try {
                assigned_categories = typeof leadResult[0].assigned_categories === 'string' 
                    ? JSON.parse(leadResult[0].assigned_categories) 
                    : leadResult[0].assigned_categories;
            } catch(e) {}
        }
        return { decoded, clubId: leadResult[0].clubId, assigned_categories };
    }
    return null;
}

async function isAuthorized(leadData: any, activityCode: string, activityCategory: string): Promise<boolean> {
    // Check club_activity_mappings first (new system)
    if (leadData.clubId) {
        const [mapRows]: any = await pool.execute(
            'SELECT 1 FROM club_activity_mappings WHERE club_id = ? AND activity_code = ?',
            [leadData.clubId, activityCode]
        );
        if ((mapRows as any[]).length > 0) return true;

        // If mappings exist for this club but activity isn't in them — deny
        const [anyMaps]: any = await pool.execute(
            'SELECT 1 FROM club_activity_mappings WHERE club_id = ? LIMIT 1',
            [leadData.clubId]
        );
        if ((anyMaps as any[]).length > 0) return false;
    }
    // Fall back to assigned_categories (legacy)
    return !!(leadData.assigned_categories?.includes(activityCategory));
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const leadData = await getLeadClubData();
        if (!leadData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        const [rows] = await pool.execute(`
            SELECT * FROM activity_catalogue WHERE code = ? OR id = ?
        `, [id, id]);

        if ((rows as any[]).length === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        const activity = (rows as any[])[0];

        if (!await isAuthorized(leadData, activity.code, activity.category)) {
            return NextResponse.json({ message: 'Unauthorized to view this activity' }, { status: 403 });
        }

        // Parse JSON fields
        ['sdgs', 'learning_outcomes', 'competencies', 'graduate_attributes', 'resources', 'assignments', 'timeline'].forEach(field => {
            if (activity[field] && typeof activity[field] === 'string') {
                try { activity[field] = JSON.parse(activity[field]); } catch(e) {}
            }
        });

        return NextResponse.json(activity);
    } catch (error: any) {
        console.error('Get activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const leadData = await getLeadClubData();
        if (!leadData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        const { 
            code, title, description, domain, category, points, max_participants, status,
            difficulty, journey_level, activity_pack, faculty_name, sdgs, hours,
            purpose, learning_outcomes, competencies, graduate_attributes, resources, assignments, timeline
        } = body;

        const [checkRows] = await pool.execute('SELECT category, code FROM activity_catalogue WHERE code = ? OR id = ?', [id, id]);
        if ((checkRows as any[]).length === 0) return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        const { category: originalCategory, code: activityCode } = (checkRows as any[])[0];

        if (!await isAuthorized(leadData, activityCode, originalCategory)) {
            return NextResponse.json({ message: 'You are not authorized to edit this activity' }, { status: 403 });
        }

        const safeJson = (val: any) => val ? JSON.stringify(val) : null;

        const [result] = await pool.execute(`
            UPDATE activity_catalogue
            SET code = ?, title = ?, description = ?, domain = ?, category = ?,
                sdc_credits = ?, max_seats = ?, status = ?,
                difficulty = ?, journey_level = ?, activity_pack = ?, 
                faculty_name = ?, sdgs = ?, hours = ?,
                purpose = ?, learning_outcomes = ?, competencies = ?,
                graduate_attributes = ?, resources = ?, assignments = ?, timeline = ?
            WHERE code = ? OR id = ?
        `, [
            code, title, description, domain, category, 
            points, max_participants, status,
            difficulty, journey_level, activity_pack, 
            faculty_name, safeJson(sdgs), hours, 
            purpose, safeJson(learning_outcomes), safeJson(competencies), 
            safeJson(graduate_attributes), safeJson(resources), safeJson(assignments), safeJson(timeline),
            id, id
        ]);

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Activity updated' });

    } catch (error: any) {
        console.error('Update activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const leadData = await getLeadClubData();
        if (!leadData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        const [checkRows] = await pool.execute('SELECT category, code FROM activity_catalogue WHERE code = ? OR id = ?', [id, id]);
        if ((checkRows as any[]).length === 0) return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        const { category: originalCategory, code: activityCode } = (checkRows as any[])[0];

        if (!await isAuthorized(leadData, activityCode, originalCategory)) {
            return NextResponse.json({ message: 'You are not authorized to delete this activity' }, { status: 403 });
        }

        const [result] = await pool.execute('DELETE FROM activity_catalogue WHERE code = ? OR id = ?', [id, id]);

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Activity deleted' });

    } catch (error: any) {
        console.error('Delete activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
