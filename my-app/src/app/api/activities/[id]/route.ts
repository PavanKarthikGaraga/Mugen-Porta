import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema, getTableColumns, bustTableColumnCache } from '@/lib/dbMigrate';
import { cascadeActivityCodeChange } from '@/lib/activityCode';

// Columns callers are allowed to modify via PUT. Anything not in this list
// (e.g. `id`, `badge_id`, `created_at`) is silently ignored, so a caller can
// never use this endpoint to repoint a badge or forge an id via mass
// assignment, even though the endpoint is admin-gated.
// Journey level is a student-progression concept only (computed from SAMAM
// points earned, see student_profiles.level) -- it is never mapped to or
// stored against individual activities, so 'level'/'journey_level' is
// deliberately not in this list.
// 'code' IS editable -- see the cascade rename below, which also re-points
// every other table that references it as a plain string.
const EDITABLE_ACTIVITY_FIELDS = new Set([
    'code', 'title', 'description', 'domain', 'category', 'purpose', 'difficulty',
    'sdc_credits', 'max_seats', 'maxEnrollment', 'outcomes', 'learning_outcomes', 'timeline', 'resources', 'assignments',
    'competencies', 'career', 'sdgs', 'ga', 'facultyFeedback', 'reflection',
    'national_mission', 'pack', 'status', 'activity_pack', 'faculty_name', 'hours', 'graduate_attributes',
    'activity_date', 'start_time', 'end_time', 'venue', 'registration_open'
]);

// Empty strings from the date/time inputs must become NULL, not '' — MySQL
// rejects '' for DATE/TIME columns in strict mode.
const NULLABLE_WHEN_BLANK = new Set(['activity_date', 'start_time', 'end_time']);

// The ActivityEditor form always submits `difficulty` even when the user
// never touches it -- it's tracked in form state with a default value from
// mount. This and the other columns below were only ever added by a manual,
// one-off /api/setup-db migration, so on any deployment where that was never
// triggered, saving fails outright on "Unknown column" the moment one is
// included -- which is unconditionally, on every save, regardless of
// activity. Self-heal by running the same idempotent migration here so
// editing never depends on someone having remembered to call setup-db first.
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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    let rows: any;
    try {
      [rows] = await pool.query(
        `SELECT ac.*, bd.name as badgeName, bd.icon as badgeIcon,
                (SELECT COUNT(*) FROM activity_enrollments ar WHERE ar.activity_code = ac.code) as real_enrolled_count,
                (SELECT 1 FROM activity_enrollments ae WHERE ae.activity_code = ac.code AND ae.attendance_marked = TRUE LIMIT 1) as is_attendance_locked
         FROM activity_catalogue ac
         LEFT JOIN badge_definitions bd ON ac.badge_id = bd.id
         WHERE ac.code = ? LIMIT 1`,
        [id]
      );
    } catch {
      // badge_definitions table may not exist — fall back to simple query
      [rows] = await pool.query(
        `SELECT *,
                (SELECT COUNT(*) FROM activity_enrollments ar WHERE ar.activity_code = code) as real_enrolled_count,
                (SELECT 1 FROM activity_enrollments ae WHERE ae.activity_code = code AND ae.attendance_marked = TRUE LIMIT 1) as is_attendance_locked
         FROM activity_catalogue WHERE code = ? LIMIT 1`,
        [id]
      );
    }

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
    }

    const row = rows[0];
    const safeParse = (val: any) => {
      if (!val) return [];
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return []; }
      }
      return val;
    };

    const getNationalMission = (domain: string, category: string) => {
      const cat = category || '';
      if (domain === 'TEC' && (cat.includes('AI') || cat.includes('Cyber'))) return 'Digital India';
      if (domain === 'IIE') return 'Make in India';
      if (domain === 'ESO') return 'Swachh Bharat';
      if (domain === 'HWB') return 'Fit India';
      if (domain === 'LCH') return 'Ek Bharat Shreshtha Bharat';
      if (cat.includes('Agriculture')) return 'National Mission for Sustainable Agriculture';
      return 'Skill India';
    };

    const activity = {
      ...row,
      nationalMission: row.national_mission || getNationalMission(row.domain, row.category),
      badge: row.badgeName ? `${row.badgeIcon} ${row.badgeName}` : 'No Badge Assigned',
      outcomes: safeParse(row.outcomes),
      timeline: safeParse(row.timeline),
      resources: safeParse(row.resources),
      assignments: safeParse(row.assignments),
      competencies: safeParse(row.competencies),
      career: safeParse(row.career),
      sdgs: safeParse(row.sdgs),
      ga: safeParse(row.ga),
      enrolledCount: row.real_enrolled_count || 0,
    };

    return NextResponse.json({ success: true, data: activity });
  } catch (error: any) {
    console.error("GET Activity Error:", error);
    return NextResponse.json({ success: false, error: safeMessage(error, 'Failed to fetch activity') }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(['admin', 'faculty']);
  if (auth.response) return auth.response;

  try {
    await ensureActivityColumns();
    // Migrations are best-effort: if one fails (permissions, unsupported
    // syntax on this MySQL version), the save must still go through for
    // every column that does exist rather than failing outright.
    try {
      await ensureActivitySchema();
      bustTableColumnCache('activity_catalogue');
    } catch (migrateErr) {
      console.error('Activity schema migration failed (continuing):', migrateErr);
    }

    const { id } = await params;
    const data = await request.json();
    const existingColumns = await getTableColumns('activity_catalogue');

    // The user might send partial updates, so we only update the fields provided.
    // Only columns in the explicit allow-list can be written - this blocks
    // mass-assignment attacks where extra/unexpected JSON keys are used to
    // overwrite columns the caller shouldn't control (e.g. badge_id).
    const fields = [];
    const values = [];

    // Form sends 'outcomes'; DB column is 'learning_outcomes'
    const COLUMN_ALIASES: Record<string, string> = {
      outcomes: 'learning_outcomes',
      learning_outcomes: 'learning_outcomes',
    };
    const JSON_FIELDS = new Set(['outcomes', 'learning_outcomes', 'timeline', 'resources', 'assignments', 'competencies', 'graduate_attributes', 'career', 'sdgs', 'ga']);

    const seenColumns = new Set<string>();
    for (const [key, value] of Object.entries(data)) {
      if (!EDITABLE_ACTIVITY_FIELDS.has(key)) continue;

      const col = COLUMN_ALIASES[key] ?? key;
      if (seenColumns.has(col)) continue; // skip duplicate if both 'outcomes' and 'learning_outcomes' sent
      // Skip anything the table doesn't actually have — a column missing in
      // this environment must not fail the entire save.
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
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const newCode = typeof data.code === 'string' ? data.code.trim() : undefined;
    const codeChanged = newCode && newCode !== id;

    if (codeChanged) {
      const [dupRows]: any = await pool.query('SELECT 1 FROM activity_catalogue WHERE code = ?', [newCode]);
      if (dupRows.length > 0) {
        return NextResponse.json({ success: false, error: `Activity code "${newCode}" is already in use` }, { status: 409 });
      }
    }

    const query = `UPDATE activity_catalogue SET ${fields.join(', ')} WHERE code = ?`;
    values.push(id);

    if (!codeChanged) {
      const [result]: any = await pool.query(query, values);
      return NextResponse.json({ success: true, affectedRows: result.affectedRows });
    }

    // Code is changing -- run the update plus every downstream rename in one
    // transaction so a failure partway through can't leave some tables
    // pointing at the old code and others at the new one.
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result]: any = await connection.query(query, values);
      await cascadeActivityCodeChange(connection, id, newCode as string);
      await connection.commit();
      return NextResponse.json({ success: true, affectedRows: result.affectedRows });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error("PUT Activity Error:", error);
    // Admin/faculty-gated editing endpoint: return the real database error.
    // A bare "Failed to update activity" gave nothing to act on and has now
    // hidden two separate schema problems.
    return NextResponse.json(
      { success: false, error: `Failed to update activity: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(['admin']);
  if (auth.response) return auth.response;

  try {
    const { id } = await params;

    const [result]: any = await pool.query(
      `DELETE FROM activity_catalogue WHERE code = ? OR id = ?`,
      [id, id]
    );

    return NextResponse.json({ success: true, affectedRows: result.affectedRows });
  } catch (error: any) {
    console.error("DELETE Activity Error:", error);
    return NextResponse.json({ success: false, error: safeMessage(error, 'Failed to delete activity') }, { status: 500 });
  }
}
