import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { getLeadClubIds } from '@/lib/leadScope';
import { ensureActivityReportsTable } from '@/lib/dbMigrate';

async function getLead() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;
    return decoded;
}

const parseJson = (val: any, fallback: any) => {
    if (!val) return fallback;
    if (typeof val !== 'string') return val;
    try { return JSON.parse(val); } catch { return fallback; }
};

/** Which of the lead's clubs actually organizes this activity, resolved via
 * club_activity_mappings (falls back to the lead's parent club if there's no
 * explicit mapping, e.g. a legacy assigned_categories-only activity). */
async function resolveOrganizingClub(clubIds: string[], activityCode: string) {
    if (clubIds.length === 0) return null;
    const placeholders = clubIds.map(() => '?').join(',');
    const [rows]: any = await pool.execute(
        `SELECT c.id, c.name FROM club_activity_mappings cam
         JOIN clubs c ON c.id = cam.club_id
         WHERE cam.activity_code = ? AND cam.club_id IN (${placeholders}) LIMIT 1`,
        [activityCode, ...clubIds]
    );
    if (rows[0]) return { id: rows[0].id, name: rows[0].name };

    const [fallback]: any = await pool.execute('SELECT id, name FROM clubs WHERE id = ? LIMIT 1', [clubIds[0]]);
    return fallback[0] ? { id: fallback[0].id, name: fallback[0].name } : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
    try {
        const lead = await getLead();
        if (!lead) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await ensureActivityReportsTable();
        const { code } = await params;

        const [actRows]: any = await pool.execute(
            'SELECT code, title, domain, category, activity_date, start_time, end_time, venue FROM activity_catalogue WHERE code = ?',
            [code]
        );
        if (actRows.length === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }
        const activity = actRows[0];

        const clubIds = await getLeadClubIds(lead.username as string);
        const club = await resolveOrganizingClub(clubIds, code);
        if (!club) {
            return NextResponse.json({ message: 'Activity is not assigned to your club' }, { status: 403 });
        }

        const [leadRows]: any = await pool.execute('SELECT name, username FROM leads WHERE username = ?', [lead.username as string]);

        const [reportRows]: any = await pool.execute('SELECT * FROM activity_reports WHERE activity_code = ?', [code]);
        const report = reportRows[0] || null;

        return NextResponse.json({
            success: true,
            activity,
            club,
            studentLead: leadRows[0] ? { name: leadRows[0].name, id: leadRows[0].username } : null,
            report: report ? {
                ...report,
                gallery: parseJson(report.gallery, []),
                attendance_sheets: parseJson(report.attendance_sheets, []),
            } : null,
        });

    } catch (error: any) {
        console.error('Activity report GET error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
    try {
        const lead = await getLead();
        if (!lead) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await ensureActivityReportsTable();
        const { code } = await params;

        const clubIds = await getLeadClubIds(lead.username as string);
        const club = await resolveOrganizingClub(clubIds, code);
        if (!club) {
            return NextResponse.json({ message: 'Activity is not assigned to your club' }, { status: 403 });
        }

        const body = await request.json();
        const {
            facultyName, facultyId, studentLeadName, studentLeadId, academicYear,
            timeSlot, venue, studentsParticipated, posterUrl, permissionLetterUrl,
            overview, objectives, proceedings, keyHighlights, learningOutcomes, conclusion,
            gallery, attendanceSheets, markGenerated,
        } = body;

        await pool.execute(`
            INSERT INTO activity_reports (
                activity_code, club_id, submitted_by, faculty_name, faculty_id,
                student_lead_name, student_lead_id, academic_year, time_slot, venue,
                students_participated, poster_url, permission_letter_url,
                overview, objectives, proceedings, key_highlights, learning_outcomes, conclusion,
                gallery, attendance_sheets, status, generated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                faculty_name = VALUES(faculty_name),
                faculty_id = VALUES(faculty_id),
                student_lead_name = VALUES(student_lead_name),
                student_lead_id = VALUES(student_lead_id),
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
                status = VALUES(status),
                generated_at = VALUES(generated_at)
        `, [
            code, club.id, lead.username, facultyName || null, facultyId || null,
            studentLeadName || null, studentLeadId || null, academicYear || null, timeSlot || null, venue || null,
            studentsParticipated || null, posterUrl || null, permissionLetterUrl || null,
            overview || null, objectives || null, proceedings || null, keyHighlights || null, learningOutcomes || null, conclusion || null,
            JSON.stringify(gallery || []), JSON.stringify(attendanceSheets || []),
            markGenerated ? 'generated' : 'draft', markGenerated ? new Date() : null,
        ]);

        return NextResponse.json({ success: true, message: 'Report saved' });

    } catch (error: any) {
        console.error('Activity report POST error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
