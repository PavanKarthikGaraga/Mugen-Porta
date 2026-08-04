import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema } from '@/lib/dbMigrate';
import { getLeadClubIds } from '@/lib/leadScope';

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
        // clubId/clubName stay as the parent club (for display); clubIds is
        // the full parent + TEC child clubs scope used for actual queries.
        const clubIds = await getLeadClubIds(decoded.username as string);
        return {
            decoded, clubId: leadResult[0].clubId, clubName: leadResult[0].clubName,
            clubIds, assigned_categories,
        };
    }
    return null;
}

export async function GET(request: Request) {
    try {
        const leadData = await getLeadClubData();
        if (!leadData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // The SELECT below reads the schedule/registration columns.
        await ensureActivitySchema();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const { assigned_categories, clubIds } = leadData;

        const conditions: string[] = [];
        const params: any[] = [];

        // Check admin-defined club_activity_mappings first — students see the same set
        let usedMappings = false;
        if (clubIds.length > 0) {
            try {
                const [mapRows]: any = await pool.execute(
                    `SELECT activity_code FROM club_activity_mappings WHERE club_id IN (${clubIds.map(() => '?').join(',')})`,
                    clubIds
                );
                if (mapRows.length > 0) {
                    const codes: string[] = (mapRows as any[]).map((r: any) => r.activity_code);
                    conditions.push(`code IN (${codes.map(() => '?').join(',')})`);
                    params.push(...codes);
                    usedMappings = true;
                }
            } catch { /* table may not exist yet */ }
        }

        // Fall back to per-lead assigned_categories if no admin mappings
        if (!usedMappings) {
            if (assigned_categories && assigned_categories.length > 0) {
                const categoryPlaceholders = assigned_categories.map(() => '?').join(',');
                conditions.push(`category IN (${categoryPlaceholders})`);
                params.push(...assigned_categories);
            } else {
                // Nothing mapped or assigned — return empty so lead knows to contact admin
                return NextResponse.json({ activities: [], assigned_categories });
            }
        }

        if (search) {
            conditions.push('(title LIKE ? OR code LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        const where = `WHERE ${conditions.join(' AND ')}`;

        const [rows] = await pool.execute(`
            SELECT id, code, title, description, domain, category,
                   sdc_credits as points, max_seats as max_participants, status,
                   difficulty, activity_pack, faculty_name, sdgs, hours,
                   activity_date, start_time, end_time, venue, registration_open,
                   approval_status, submitted_by, created_at,
                   (SELECT COUNT(*) FROM activity_enrollments ar WHERE ar.activity_code = activity_catalogue.code) as enrolledCount
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
            difficulty, activity_pack, faculty_name, sdgs, hours,
            purpose, outcomes, competencies, ga, resources, assignments, timeline,
            activity_date, start_time, end_time, venue, registration_open
        } = body;

        if (!title || !domain || !points || !code || !category) {
            return NextResponse.json({ message: 'Code, title, domain, category, and points are required' }, { status: 400 });
        }

        if (leadData.assigned_categories && leadData.assigned_categories.length > 0 && !leadData.assigned_categories.includes(category)) {
            return NextResponse.json({ message: 'You can only create activities in your assigned categories' }, { status: 403 });
        }

        await ensureActivitySchema();

        const safeJson = (val: any) => val ? JSON.stringify(val) : null;
        // MySQL rejects '' for DATE/TIME columns in strict mode.
        const blankToNull = (val: any) => (val === '' || val === undefined ? null : val);

        const [result] = await pool.execute(`
            INSERT INTO activity_catalogue
            (code, title, description, domain, category, sdc_credits, max_seats, status,
             difficulty, activity_pack, faculty_name, sdgs, hours,
             purpose, outcomes, competencies, ga, resources, assignments, timeline,
             activity_date, start_time, end_time, venue, registration_open,
             created_by, submitted_by, approval_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', NOW())
        `, [
            code, title, description || '', domain, category, points, max_participants || null, status || 'upcoming',
            difficulty || 'Beginner', activity_pack || null, faculty_name || null,
            safeJson(sdgs), hours || 0.0,
            purpose || null, safeJson(outcomes), safeJson(competencies), safeJson(ga),
            safeJson(resources), safeJson(assignments), safeJson(timeline),
            blankToNull(activity_date), blankToNull(start_time), blankToNull(end_time),
            venue || null, registration_open === undefined ? 1 : Number(registration_open),
            leadData.decoded.username || 'lead', leadData.decoded.username || 'lead'
        ]);

        const insertId = (result as any).insertId;
        return NextResponse.json({ success: true, id: insertId, message: 'Activity created successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('Create activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
