import { getCouncilDomains } from '@/lib/councilScope';
import { getFacultyClubIds } from '@/lib/facultyScope';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema } from '@/lib/dbMigrate';

import { getLeadClubIds } from '@/lib/leadScope';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token) as { role: string; username: string } | null;
    if (!decoded || !['admin', 'faculty', 'council', 'lead'].includes(decoded.role)) return null;
    return decoded;
}

export async function GET(request: Request) {
    try {
        const user = await checkAdmin();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // The SELECT below reads the schedule/registration columns.
        await ensureActivitySchema();

        const { searchParams } = new URL(request.url);
        const domainParam = searchParams.get('domain') || '';
        const search = searchParams.get('search') || '';

        const conditions: string[] = [];
        const params: any[] = [];

        if (user.role === 'council') {
            const councilDomains = await getCouncilDomains(user.username);
            
            if (councilDomains.length === 0) {
                return NextResponse.json({ activities: [] });
            }

            if (domainParam && councilDomains.includes(domainParam)) {
                conditions.push('domain = ?');
                params.push(domainParam);
            } else {
                conditions.push(`domain IN (${councilDomains.map(() => '?').join(',')})`);
                params.push(...councilDomains);
            }
        } else if (user.role === 'faculty') {
            const facultyClubs = await getFacultyClubIds(user.username);
            if (facultyClubs.length === 0) {
                return NextResponse.json({ activities: [] });
            }
            const clubPlaceholders = facultyClubs.map(() => '?').join(',');
            // Get all activities mapped to these clubs
            conditions.push(`code IN (SELECT activity_code FROM club_activity_mappings WHERE club_id IN (${clubPlaceholders}))`);
            params.push(...facultyClubs);
            
            if (domainParam) {
                conditions.push('domain = ?');
                params.push(domainParam);
            }
        } else if (user.role === 'lead') {
            const leadClubs = await getLeadClubIds(user.username);
            if (leadClubs.length === 0) {
                return NextResponse.json({ activities: [] });
            }
            const clubPlaceholders = leadClubs.map(() => '?').join(',');
            conditions.push(`code IN (SELECT activity_code FROM club_activity_mappings WHERE club_id IN (${clubPlaceholders}))`);
            params.push(...leadClubs);
            
            if (domainParam) {
                conditions.push('domain = ?');
                params.push(domainParam);
            }
        } else if (domainParam) {
            conditions.push('domain = ?');
            params.push(domainParam);
        }

        if (search) { conditions.push('title LIKE ?'); params.push(`%${search}%`); }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Query activity_catalogue
        const [rows] = await pool.execute(`
            SELECT id, code, title, description, domain, category,
                   sdc_credits as points, max_seats as max_participants, status,
                   difficulty, activity_pack, faculty_name, sdgs, hours,
                   activity_date, start_time, end_time, venue, registration_open,
                   approval_status, rejection_note,
                   created_at, poster_url,
                   (SELECT COUNT(*) FROM activity_enrollments ar WHERE ar.activity_code = activity_catalogue.code) as enrolledCount,
                   (SELECT 1 FROM activity_enrollments ae WHERE ae.activity_code = activity_catalogue.code AND ae.attendance_marked = TRUE LIMIT 1) as attendance_locked,
                   (SELECT 1 FROM activity_reports rep WHERE rep.activity_code = activity_catalogue.code LIMIT 1) as report_generated
            FROM activity_catalogue
            ${where}
            ORDER BY domain ASC, category ASC, code ASC
        `, params);

        return NextResponse.json({ activities: rows });

    } catch (error: any) {
        console.error('Activities list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await checkAdmin();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const {
            code, title, description, domain, category, points, max_participants, status,
            difficulty, activity_pack, faculty_name, sdgs, hours,
            purpose, learning_outcomes, competencies, graduate_attributes, resources, assignments, timeline,
            activity_date, start_time, end_time, venue, registration_open
        } = body;

        if (!title || !domain || !points || !code) {
            return NextResponse.json({ message: 'Code, title, domain and points are required' }, { status: 400 });
        }

        if (user.role === 'council') {
            const councilDomains = await getCouncilDomains(user.username);
            if (!councilDomains.includes(domain)) {
                return NextResponse.json({ message: 'Unauthorized domain' }, { status: 403 });
            }
        } else if (user.role === 'faculty' || user.role === 'lead') {
            // For creation, we don't strictly enforce domain here if they are a lead/faculty since their activity will be mapped to their club later.
            // But they can only manage activities mapped to their clubs. (The mapping is done in another step/API or auto-mapped if needed).
        }

        await ensureActivitySchema();

        const safeJson = (val: any) => val ? JSON.stringify(val) : null;
        // MySQL rejects '' for DATE/TIME columns in strict mode.
        const blankToNull = (val: any) => (val === '' || val === undefined ? null : val);

        const [result] = await pool.execute(`
            INSERT INTO activity_catalogue
            (code, title, description, domain, category, sdc_credits, max_seats, status,
             difficulty, activity_pack, faculty_name, sdgs, hours,
             purpose, learning_outcomes, competencies, graduate_attributes, resources, assignments, timeline,
             activity_date, start_time, end_time, venue, registration_open,
             created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            code, title, description || '', domain, category || 'event', points, max_participants || null, status || 'upcoming',
            difficulty || 'Beginner', activity_pack || null, faculty_name || null,
            safeJson(sdgs), hours || 0.0,
            purpose || null, safeJson(learning_outcomes), safeJson(competencies), safeJson(graduate_attributes),
            safeJson(resources), safeJson(assignments), safeJson(timeline),
            blankToNull(activity_date), blankToNull(start_time), blankToNull(end_time),
            venue || null, registration_open === undefined ? 1 : Number(registration_open),
            user.username || 'admin'
        ]);

        const insertId = (result as any).insertId;
        return NextResponse.json({ success: true, id: insertId, message: 'Activity created successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('Create activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    // Basic implementation of PUT for completeness, extracting id from body or URL could be better, but assuming body here.
    return NextResponse.json({ error: "Use PUT on specific activity ID route" }, { status: 400 });
}
