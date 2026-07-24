import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function getLeadClubData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;

    // Get club info and assigned categories
    const [leadResult]: any = await pool.execute(
        'SELECT l.clubId, c.name as clubName, l.assigned_categories FROM leads l LEFT JOIN clubs c ON l.clubId = c.id WHERE l.username = ?',
        [decoded.username as string]
    );

    if (leadResult.length > 0) {
        let assigned_categories = [];
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

        if (!assigned_categories || assigned_categories.length === 0) {
            return NextResponse.json({ activities: [] });
        }

        const categoryPlaceholders = assigned_categories.map(() => '?').join(',');
        const conditions: string[] = [`category IN (${categoryPlaceholders})`];
        const params: any[] = [...assigned_categories];

        if (search) { 
            conditions.push('(title LIKE ? OR code LIKE ?)'); 
            params.push(`%${search}%`, `%${search}%`); 
        }

        const where = `WHERE ${conditions.join(' AND ')}`;

        const [rows] = await pool.execute(`
            SELECT id, code, title, description, domain, category,
                   sdc_credits as points, max_seats as max_participants, status,
                   difficulty, journey_level, activity_pack, faculty_name, sdgs, hours,
                   created_at
            FROM activity_catalogue
            ${where}
            ORDER BY created_at DESC
        `, params);

        return NextResponse.json({ activities: rows, assigned_categories });

    } catch (error: any) {
        console.error('Activities list error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
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

        if (!leadData.assigned_categories || !leadData.assigned_categories.includes(category)) {
            return NextResponse.json({ message: 'You can only create activities in your assigned categories' }, { status: 403 });
        }

        const safeJson = (val: any) => val ? JSON.stringify(val) : null;

        const [result] = await pool.execute(`
            INSERT INTO activity_catalogue 
            (code, title, description, domain, category, sdc_credits, max_seats, status, 
             difficulty, journey_level, activity_pack, faculty_name, sdgs, hours, 
             purpose, learning_outcomes, competencies, graduate_attributes, resources, assignments, timeline,
             created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            code, title, description || '', domain, category, points, max_participants || null, status || 'upcoming',
            difficulty || 'Beginner', journey_level || 'Explorer', activity_pack || null, faculty_name || null, 
            safeJson(sdgs), hours || 0.0,
            purpose || null, safeJson(learning_outcomes), safeJson(competencies), safeJson(graduate_attributes),
            safeJson(resources), safeJson(assignments), safeJson(timeline),
            leadData.decoded.username || 'lead'
        ]);

        const insertId = (result as any).insertId;
        return NextResponse.json({ success: true, id: insertId, message: 'Activity created successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('Create activity error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

