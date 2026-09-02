import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { ensureIqacTables } from '@/lib/dbMigrate';

async function checkIqacUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.username !== 'IQAC') return null;
    return decoded;
}

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
    try {
        const user = await checkIqacUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await ensureIqacTables();
        const { code } = await context.params;

        const [rows] = await pool.execute(`
            SELECT * FROM iqac_activity_reports WHERE activity_code = ?
        `, [code]);

        const reports = rows as any[];
        
        if (reports.length === 0) {
            // Return empty draft
            return NextResponse.json({ report: { activity_code: code, status: 'draft' } });
        }

        return NextResponse.json({ report: reports[0] });
    } catch (error: any) {
        console.error('IQAC Report get error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong.') }, { status: 500 });
    }
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
    try {
        const user = await checkIqacUser();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await ensureIqacTables();
        const { code } = await context.params;
        const data = await request.json();

        const safeJson = (val: any) => val ? JSON.stringify(val) : null;

        const [result] = await pool.execute(`
            INSERT INTO iqac_activity_reports (
                activity_code, submitted_by, organizing_entity,
                director_name, director_title, faculty_name, faculty_title,
                academic_year, time_slot, venue, students_participated,
                poster_url, permission_letter_url,
                overview, objectives, proceedings, key_highlights,
                learning_outcomes, conclusion, gallery, attendance_sheets, status
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            ) ON DUPLICATE KEY UPDATE
                organizing_entity = VALUES(organizing_entity),
                director_name = VALUES(director_name),
                director_title = VALUES(director_title),
                faculty_name = VALUES(faculty_name),
                faculty_title = VALUES(faculty_title),
                academic_year = VALUES(academic_year),
                time_slot = VALUES(time_slot),
                venue = VALUES(venue),
                students_participated = VALUES(students_participated),
                poster_url = VALUES(poster_url),
                permission_letter_url = VALUES(permission_letter_url),
                overview = VALUES(overview),
                objectives = VALUES(objectives),
                proceedings = VALUES(proceedings),
                key_highlights = VALUES(key_highlights),
                learning_outcomes = VALUES(learning_outcomes),
                conclusion = VALUES(conclusion),
                gallery = VALUES(gallery),
                attendance_sheets = VALUES(attendance_sheets),
                status = VALUES(status)
        `, [
            code, user.username, data.organizing_entity || 'SAC (Student Activity Center)',
            data.director_name || 'Er. P Sai Vijay Pisni', data.director_title || 'Director-SAC',
            data.faculty_name || '', data.faculty_title || 'Faculty Mentor',
            data.academic_year || null, data.time_slot || null, data.venue || null,
            data.students_participated || null, data.poster_url || null, data.permission_letter_url || null,
            data.overview || null, data.objectives || null, data.proceedings || null,
            data.key_highlights || null, data.learning_outcomes || null, data.conclusion || null,
            safeJson(data.gallery), safeJson(data.attendance_sheets), data.status || 'draft'
        ]);

        return NextResponse.json({ success: true, message: 'Report saved successfully' });
    } catch (error: any) {
        console.error('Save IQAC report error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to save report.') }, { status: 500 });
    }
}
