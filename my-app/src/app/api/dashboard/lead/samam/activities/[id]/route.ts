import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema, getTableColumns, bustTableColumnCache } from '@/lib/dbMigrate';

// The ActivityEditor form always submits `difficulty` even when the user
// never touches it. This and the other columns below were only ever added
// by a manual, one-off /api/setup-db migration, so on a deployment where
// that was never run, every save fails on "Unknown column" -- unconditionally,
// regardless of activity. Self-heal by running the same idempotent migration
// here.
let columnsEnsured = false;
async function ensureActivityColumns() {
    if (columnsEnsured) return;
    try {
        await pool.query(`
            ALTER TABLE activity_catalogue
            ADD COLUMN IF NOT EXISTS difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
            ADD COLUMN IF NOT EXISTS activity_pack VARCHAR(200) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS faculty_name VARCHAR(200) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS sdgs JSON DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS hours DECIMAL(5,1) DEFAULT 0.0;
        `);
    } catch { /* best-effort; the UPDATE below will surface a real error if this didn't work */ }
    columnsEnsured = true;
}

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
            SELECT * FROM activity_catalogue WHERE code = ?
        `, [id]);

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

// Columns a lead may write via PUT. Mirrors the admin activity editor's
// allow-list (@/app/api/activities/[id]/route.ts) so both endpoints behave
// the same way for the same form.
//
// Journey level is a student-progression concept only (computed from SAMAM
// points earned, see student_profiles.level) -- it is never mapped to or
// stored against individual activities, so 'level'/'journey_level' is
// deliberately not in this list.
const EDITABLE_ACTIVITY_FIELDS = new Set([
    'code', 'title', 'description', 'domain', 'category', 'purpose', 'difficulty',
    'sdc_credits', 'max_seats', 'maxEnrollment', 'outcomes', 'learning_outcomes', 'timeline',
    'resources', 'assignments', 'competencies', 'career', 'sdgs', 'ga', 'facultyFeedback',
    'reflection', 'national_mission', 'pack', 'status', 'activity_pack',
    'faculty_name', 'hours', 'graduate_attributes',
    'activity_date', 'start_time', 'end_time', 'venue', 'registration_open',
]);
const COLUMN_ALIASES: Record<string, string> = {
    outcomes: 'learning_outcomes',
    learning_outcomes: 'learning_outcomes',
};
// Empty strings from the date/time inputs must become NULL, not '' — MySQL
// rejects '' for DATE/TIME columns in strict mode.
const NULLABLE_WHEN_BLANK = new Set(['activity_date', 'start_time', 'end_time']);
const JSON_FIELDS = new Set([
    'outcomes', 'learning_outcomes', 'timeline', 'resources', 'assignments',
    'competencies', 'graduate_attributes', 'career', 'sdgs', 'ga',
]);

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await ensureActivityColumns();
        // Best-effort: a failed migration must not block saving the columns
        // that do exist.
        try {
            await ensureActivitySchema();
            bustTableColumnCache('activity_catalogue');
        } catch (migrateErr) {
            console.error('Activity schema migration failed (continuing):', migrateErr);
        }

        const leadData = await getLeadClubData();
        if (!leadData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const body = await request.json();

        const [checkRows] = await pool.execute('SELECT category, code FROM activity_catalogue WHERE code = ?', [id]);
        if ((checkRows as any[]).length === 0) return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        const { category: originalCategory, code: activityCode } = (checkRows as any[])[0];

        if (!await isAuthorized(leadData, activityCode, originalCategory)) {
            return NextResponse.json({ message: 'You are not authorized to edit this activity' }, { status: 403 });
        }

        // Only write columns the form actually sent -- a field the
        // ActivityEditor form doesn't expose (e.g. status, hours,
        // faculty_name) must never turn into an `undefined` bind parameter,
        // which mysql2 rejects outright and previously surfaced here as a
        // generic 500 on every save.
        const existingColumns = await getTableColumns('activity_catalogue');
        const fields: string[] = [];
        const values: any[] = [];
        const seenColumns = new Set<string>();
        for (const [key, value] of Object.entries(body)) {
            if (!EDITABLE_ACTIVITY_FIELDS.has(key)) continue;
            const col = COLUMN_ALIASES[key] ?? key;
            if (seenColumns.has(col)) continue;
            // Skip anything the table doesn't actually have, so a column
            // missing in this environment can't fail the entire save.
            if (existingColumns.size > 0 && !existingColumns.has(col)) continue;
            seenColumns.add(col);
            fields.push(`${col} = ?`);
            if (JSON_FIELDS.has(key)) {
                values.push(JSON.stringify(value));
            } else if (NULLABLE_WHEN_BLANK.has(key) && (value === '' || value === undefined)) {
                values.push(null);
            } else {
                values.push(value);
            }
        }

        if (fields.length === 0) {
            return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
        }

        // Always require re-approval when a lead edits an activity
        fields.push(`approval_status = 'pending_approval'`);

        values.push(id);
        const [result] = await pool.execute(
            `UPDATE activity_catalogue SET ${fields.join(', ')} WHERE code = ?`,
            values
        );

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Activity updated' });

    } catch (error: any) {
        console.error('Update activity error:', error);
        // Lead-gated editing endpoint: surface the real database error so a
        // failure is actionable instead of a generic string.
        return NextResponse.json(
            { error: `Failed to update activity: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const leadData = await getLeadClubData();
        if (!leadData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        const [checkRows] = await pool.execute('SELECT category, code FROM activity_catalogue WHERE code = ?', [id]);
        if ((checkRows as any[]).length === 0) return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        const { category: originalCategory, code: activityCode } = (checkRows as any[])[0];

        if (!await isAuthorized(leadData, activityCode, originalCategory)) {
            return NextResponse.json({ message: 'You are not authorized to delete this activity' }, { status: 403 });
        }

        const [result] = await pool.execute('DELETE FROM activity_catalogue WHERE code = ?', [id]);

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Activity deleted' });

    } catch (error: any) {
        console.error('Delete activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
