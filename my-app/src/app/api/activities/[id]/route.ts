import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

// Columns callers are allowed to modify via PUT. Anything not in this list
// (e.g. `id`, `code`, `badge_id`, `created_at`) is silently ignored, so a
// caller can never use this endpoint to repoint a badge or forge an id via
// mass assignment, even though the endpoint is admin-gated.
const EDITABLE_ACTIVITY_FIELDS = new Set([
    'title', 'description', 'domain', 'category', 'purpose', 'difficulty', 'level',
    'sdc_credits', 'max_seats', 'maxEnrollment', 'outcomes', 'learning_outcomes', 'timeline', 'resources', 'assignments',
    'competencies', 'career', 'sdgs', 'ga', 'facultyFeedback', 'reflection',
    'national_mission', 'pack', 'status', 'journey_level', 'activity_pack', 'faculty_name', 'hours', 'graduate_attributes'
]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    let rows: any;
    try {
      [rows] = await pool.query(
        `SELECT ac.*, bd.name as badgeName, bd.icon as badgeIcon,
                (SELECT COUNT(*) FROM activity_enrollments ar WHERE ar.activity_code = ac.code) as real_enrolled_count
         FROM activity_catalogue ac
         LEFT JOIN badge_definitions bd ON ac.badge_id = bd.id
         WHERE ac.code = ? LIMIT 1`,
        [id]
      );
    } catch {
      // badge_definitions table may not exist — fall back to simple query
      [rows] = await pool.query(
        `SELECT *,
                (SELECT COUNT(*) FROM activity_enrollments ar WHERE ar.activity_code = code) as real_enrolled_count
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
    const { id } = await params;
    const data = await request.json();

    // The user might send partial updates, so we only update the fields provided.
    // Only columns in the explicit allow-list can be written - this blocks
    // mass-assignment attacks where extra/unexpected JSON keys are used to
    // overwrite columns the caller shouldn't control (e.g. badge_id).
    const fields = [];
    const values = [];

    // Form sends 'outcomes'/'level'; DB columns are 'learning_outcomes'/'journey_level'
    const COLUMN_ALIASES: Record<string, string> = {
      outcomes: 'learning_outcomes',
      learning_outcomes: 'learning_outcomes',
      level: 'journey_level',
    };
    const JSON_FIELDS = new Set(['outcomes', 'learning_outcomes', 'timeline', 'resources', 'assignments', 'competencies', 'graduate_attributes', 'career', 'sdgs', 'ga']);

    const seenColumns = new Set<string>();
    for (const [key, value] of Object.entries(data)) {
      if (!EDITABLE_ACTIVITY_FIELDS.has(key)) continue;

      const col = COLUMN_ALIASES[key] ?? key;
      if (seenColumns.has(col)) continue; // skip duplicate if both 'outcomes' and 'learning_outcomes' sent
      seenColumns.add(col);

      fields.push(`${col} = ?`);
      values.push(JSON_FIELDS.has(key) ? JSON.stringify(value) : value);
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const query = `UPDATE activity_catalogue SET ${fields.join(', ')} WHERE code = ?`;
    values.push(id);

    const [result]: any = await pool.query(query, values);

    return NextResponse.json({ success: true, affectedRows: result.affectedRows });
  } catch (error: any) {
    console.error("PUT Activity Error:", error);
    return NextResponse.json({ success: false, error: safeMessage(error, 'Failed to update activity') }, { status: 500 });
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
