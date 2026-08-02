import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema } from '@/lib/dbMigrate';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'faculty')) return null;
    return decoded;
}

export async function GET(request: Request) {
    try {
        if (!await checkAdmin()) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // The SELECT below reads the schedule/registration columns.
        await ensureActivitySchema();

        const { searchParams } = new URL(request.url);
        const domain = searchParams.get('domain') || '';
        const search = searchParams.get('search') || '';

        const conditions: string[] = [];
        const params: any[] = [];

        if (domain) { conditions.push('domain = ?'); params.push(domain); }
        if (search) { conditions.push('title LIKE ?'); params.push(`%${search}%`); }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Query activity_catalogue
        const [rows] = await pool.execute(`
            SELECT id, code, title, description, domain, category,
                   sdc_credits as points, max_seats as max_participants, status,
                   difficulty, activity_pack, faculty_name, sdgs, hours,
                   activity_date, start_time, end_time, venue, registration_open,
                   created_at,
                   (SELECT COUNT(*) FROM activity_enrollments ar WHERE ar.activity_code = activity_catalogue.code) as enrolledCount
            FROM activity_catalogue
            ${where}
            ORDER BY created_at DESC
        `, params);

        return NextResponse.json({ activities: rows });

    } catch (error: any) {
        console.error('Activities list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

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
            admin.username || 'admin'
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
