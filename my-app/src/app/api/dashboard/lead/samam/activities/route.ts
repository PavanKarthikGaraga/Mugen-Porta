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

    // First try with assigned_categories column (may not exist on older DB)
    let leadResult: any[] = [];
    try {
        const [rows]: any = await pool.execute(
            'SELECT l.clubId, c.name as clubName, l.assigned_categories FROM leads l LEFT JOIN clubs c ON l.clubId = c.id WHERE l.username = ?',
            [decoded.username as string]
        );
        leadResult = rows;
    } catch (e: any) {
        // If assigned_categories column doesn't exist yet, fall back without it
        if (e.code === 'ER_BAD_FIELD_ERROR' || e.message?.includes('assigned_categories')) {
            const [rows]: any = await pool.execute(
                'SELECT l.clubId, c.name as clubName FROM leads l LEFT JOIN clubs c ON l.clubId = c.id WHERE l.username = ?',
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
        return { decoded, clubId: leadResult[0].clubId, clubName: leadResult[0].clubName, assigned_categories };
    }
    return null;
}

export async function GET(request: Request) {
    try {
        const leadData = await getLeadClubData();
        if (!leadData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const { assigned_categories } = leadData;

        const conditions: string[] = [];
        const params: any[] = [];

        if (assigned_categories && assigned_categories.length > 0) {
            // Filter by assigned categories
            const categoryPlaceholders = assigned_categories.map(() => '?').join(',');
            conditions.push(`category IN (${categoryPlaceholders})`);
            params.push(...assigned_categories);
        } else if (leadData.clubId) {
            // Fallback: no assigned_categories yet, show activities by clubId domain if applicable
            // (show all activities so the dashboard isn't blank)
        }
        // else show nothing — both not set

        if (search) {
            conditions.push('(title LIKE ? OR code LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        // If neither assigned_categories nor fallback, return empty
        if (assigned_categories.length === 0 && conditions.length === 0) {
            return NextResponse.json({ activities: [], assigned_categories: [] });
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const [rows] = await pool.execute(`
            SELECT id, code, title, description, domain, category,
                   sdc_credits as points, max_seats as max_participants, status,
                   difficulty, journey_level, activity_pack, faculty_name, sdgs, hours,
                   approval_status, submitted_by, created_at
            FROM activity_catalogue
            ${where}
            ORDER BY created_at DESC
        `, params);

        return NextResponse.json({ activities: rows, assigned_categories });

    } catch (error: any) {
        console.error('Activities list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const leadData = await getLeadClubData();
        if (!leadData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const {
            code, title, description, domain, category, points, max_participants, status,
            difficulty, journey_level, activity_pack, faculty_name, sdgs, hours,
            purpose, learning_outcomes, competencies, graduate_attributes, resources, assignments, timeline
        } = body;

        if (!title || !domain || !points || !code || !category) {
            return NextResponse.json({ message: 'Code, title, domain, category, and points are required' }, { status: 400 });
        }

        if (leadData.assigned_categories && leadData.assigned_categories.length > 0 && !leadData.assigned_categories.includes(category)) {
            return NextResponse.json({ message: 'You can only create activities in your assigned categories' }, { status: 403 });
        }

        const safeJson = (val: any) => val ? JSON.stringify(val) : null;

        const [result] = await pool.execute(`
            INSERT INTO activity_catalogue
            (code, title, description, domain, category, sdc_credits, max_seats, status,
             difficulty, journey_level, activity_pack, faculty_name, sdgs, hours,
             purpose, learning_outcomes, competencies, graduate_attributes, resources, assignments, timeline,
             created_by, submitted_by, approval_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', NOW())
        `, [
            code, title, description || '', domain, category, points, max_participants || null, status || 'upcoming',
            difficulty || 'Beginner', journey_level || 'Explorer', activity_pack || null, faculty_name || null,
            safeJson(sdgs), hours || 0.0,
            purpose || null, safeJson(learning_outcomes), safeJson(competencies), safeJson(graduate_attributes),
            safeJson(resources), safeJson(assignments), safeJson(timeline),
            leadData.decoded.username || 'lead', leadData.decoded.username || 'lead'
        ]);

        const insertId = (result as any).insertId;
        return NextResponse.json({ success: true, id: insertId, message: 'Activity created successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('Create activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
