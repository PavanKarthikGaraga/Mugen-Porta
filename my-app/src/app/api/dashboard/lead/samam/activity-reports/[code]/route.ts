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

    let assigned_categories: string[] = [];
    try {
        const [rows]: any = await pool.execute('SELECT assigned_categories FROM leads WHERE username = ?', [decoded.username as string]);
        if (rows[0]?.assigned_categories) {
            try {
                assigned_categories = typeof rows[0].assigned_categories === 'string'
                    ? JSON.parse(rows[0].assigned_categories)
                    : rows[0].assigned_categories;
            } catch {}
        }
    } catch (e: any) {
        // Column may not exist yet on old schemas — treat as no categories.
        if (e.code !== 'ER_BAD_FIELD_ERROR' && !e.message?.includes('assigned_categories')) throw e;
    }

    return { decoded, assigned_categories };
}

const parseJson = (val: any, fallback: any) => {
    if (!val) return fallback;
    if (typeof val !== 'string') return val;
    try { return JSON.parse(val); } catch { return fallback; }
};

/** Which of the lead's clubs actually organizes this activity, resolved via
 * club_activity_mappings, with an assigned_categories fallback for legacy
 * category-scoped leads. Unlike a parent-club fallback, an activity with
 * neither a mapping nor a matching category is DENIED — otherwise any lead
 * could read/forge the report of any activity in the catalogue. */
async function resolveOrganizingClub(clubIds: string[], assignedCategories: string[], activityCode: string) {
    const [actRows]: any = await pool.execute(
        `SELECT category, clubId FROM activity_catalogue WHERE code = ? LIMIT 1`,
        [activityCode]
    );
    if (!actRows[0]) return null;
    const category = actRows[0].category;
    const legacyClubId = actRows[0].clubId;

    if (clubIds.length > 0) {
        const placeholders = clubIds.map(() => '?').join(',');

        // ── Priority 1: Check club_category_mappings ──
        try {
            const [catMapRows]: any = await pool.execute(
                `SELECT c.id, c.name, c.domain FROM club_category_mappings ccm
                 JOIN clubs c ON c.id = ccm.club_id
                 WHERE ccm.category = ? AND ccm.club_id IN (${placeholders}) LIMIT 1`,
                [category, ...clubIds]
            );
            if (catMapRows[0]) return { id: catMapRows[0].id, name: catMapRows[0].name, domain: catMapRows[0].domain };
        } catch { /* table may not exist yet */ }

        // ── Priority 2: Check club_activity_mappings ──
        const [rows]: any = await pool.execute(
            `SELECT c.id, c.name, c.domain FROM club_activity_mappings cam
             JOIN clubs c ON c.id = cam.club_id
             WHERE cam.activity_code = ? AND cam.club_id IN (${placeholders}) LIMIT 1`,
            [activityCode, ...clubIds]
        );
        if (rows[0]) return { id: rows[0].id, name: rows[0].name, domain: rows[0].domain };
    }

    // ── Priority 3: Check legacy assignedCategories ──
    if (assignedCategories && Array.isArray(assignedCategories) && assignedCategories.length > 0 && assignedCategories.includes(category)) {
        if (legacyClubId) {
            const [fallback]: any = await pool.execute('SELECT id, name, domain FROM clubs WHERE id = ? LIMIT 1', [legacyClubId]);
            return fallback[0] ? { id: fallback[0].id, name: fallback[0].name, domain: fallback[0].domain } : null;
        }
    }

    return null;
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

        const clubIds = await getLeadClubIds(lead.decoded.username as string);
        const club = await resolveOrganizingClub(clubIds, lead.assigned_categories, code);
        if (!club) {
            return NextResponse.json({ message: 'Activity is not assigned to your club' }, { status: 403 });
        }

        const [cseMappings]: any = await pool.execute(
            `SELECT 1 FROM club_group_mappings 
             WHERE club_id = ? AND group_name IN ('CSE-1 Department', 'CSE-2 Department', 'CSE-3 Department', 'CSE-4 Department')`,
            [club.id]
        );
        const isCse = cseMappings.length > 0;

        const [leadRows]: any = await pool.execute('SELECT name, username FROM leads WHERE username = ?', [lead.decoded.username as string]);

        const [reportRows]: any = await pool.execute('SELECT * FROM activity_reports WHERE activity_code = ?', [code]);
        const report = reportRows[0] || null;

        return NextResponse.json({
            success: true,
            activity,
            club: { ...club, isCse },
            studentLead: leadRows[0] ? { name: leadRows[0].name, id: leadRows[0].username } : null,
            report: report ? {
                ...report,
                gallery: parseJson(report.gallery, []),
                attendance_sheets: parseJson(report.attendance_sheets, []),
            } : null,
        });

    } catch (error: any) {
        console.error('Activity report GET error:', error);
        return NextResponse.json({ message: error.message || 'Something went wrong', stack: error.stack }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
    try {
        const lead = await getLead();
        if (!lead) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await ensureActivityReportsTable();
        const { code } = await params;

        const clubIds = await getLeadClubIds(lead.decoded.username as string);
        const club = await resolveOrganizingClub(clubIds, lead.assigned_categories, code);
        if (!club) {
            return NextResponse.json({ message: 'Activity is not assigned to your club' }, { status: 403 });
        }

        const body = await request.json();
        const {
            hodName, hodDesignation,
            facultyName, facultyId, studentLeadName, studentLeadId, academicYear,
            timeSlot, venue, studentsParticipated, posterUrl, permissionLetterUrl,
            overview, objectives, proceedings, keyHighlights, learningOutcomes, conclusion,
            gallery, attendanceSheets, markGenerated,
        } = body;

        await pool.execute(`
            INSERT INTO activity_reports (
                activity_code, club_id, submitted_by, hod_name, hod_designation, faculty_name, faculty_id,
                student_lead_name, student_lead_id, academic_year, time_slot, venue,
                students_participated, poster_url, permission_letter_url,
                overview, objectives, proceedings, key_highlights, learning_outcomes, conclusion,
                gallery, attendance_sheets, status, generated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                hod_name = VALUES(hod_name),
                hod_designation = VALUES(hod_designation),
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
            code, club.id, lead.decoded.username, hodName || null, hodDesignation || null, facultyName || null, facultyId || null,
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
