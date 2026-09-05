import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { getLeadClubIds } from '@/lib/leadScope';

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS attendance_submissions (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    activity_code VARCHAR(50)  NOT NULL,
    club_id       VARCHAR(20)  NOT NULL,
    club_name     VARCHAR(100) NOT NULL DEFAULT '',
    activity_title VARCHAR(200) NOT NULL DEFAULT '',
    lead_username VARCHAR(10)  NOT NULL,
    submitted_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status        ENUM('pending','verified','rejected') DEFAULT 'pending',
    scanned_copy_url VARCHAR(500) DEFAULT NULL,
    verified_by   VARCHAR(10)  DEFAULT NULL,
    verified_at   TIMESTAMP    DEFAULT NULL,
    faculty_notes TEXT         DEFAULT NULL,
    UNIQUE KEY uq_activity (activity_code)
  )
`;

async function ensureTable() {
  await pool.execute(CREATE_TABLE);
}

async function checkLead() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tck')?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded || decoded.role !== 'lead') return null;
  try {
    const clubIds = await getLeadClubIds(decoded.username as string);
    if (clubIds.length === 0) return null;

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
      // Column may not exist on old schemas — treat as no categories.
      if (e.code !== 'ER_BAD_FIELD_ERROR' && !e.message?.includes('assigned_categories')) throw e;
    }

    return { decoded, clubIds, assigned_categories };
  } catch {
    return null;
  }
}

// One attendance_submissions row per activity, attributed to whichever of
// the lead's clubs actually owns it (via club_activity_mappings) -- not
// blindly the lead's parent club, since a multi-club lead may be submitting
// for an activity that belongs to a TEC child club. When no explicit mapping
// exists, legacy category-scoped leads fall back to their parent club ONLY if
// the activity's category is in their assigned_categories; otherwise the
// activity is not theirs to submit and null is returned (deny by default —
// without this, any lead could submit/forge a verification request for any
// activity code in the catalogue).
async function resolveSubmissionClub(clubIds: string[], assignedCategories: string[], activityCode: string) {
  const placeholders = clubIds.map(() => '?').join(',');
  const [mapRows]: any = await pool.execute(
    `SELECT club_id FROM club_activity_mappings WHERE activity_code = ? AND club_id IN (${placeholders}) LIMIT 1`,
    [activityCode, ...clubIds]
  );
  let clubId: string | null = mapRows[0]?.club_id ?? null;

  if (!clubId && assignedCategories.length > 0) {
    const catPlaceholders = assignedCategories.map(() => '?').join(',');
    const [actRows]: any = await pool.execute(
      `SELECT category FROM activity_catalogue WHERE code = ? AND category IN (${catPlaceholders}) LIMIT 1`,
      [activityCode, ...assignedCategories]
    );
    if (actRows[0]) clubId = clubIds[0]; // legacy path: attribute to parent club
  }

  if (!clubId) return null;
  const [clubRows]: any = await pool.execute('SELECT name FROM clubs WHERE id = ?', [clubId]);
  return { clubId, clubName: clubRows[0]?.name || '' };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTable();
    const lead = await checkLead();
    if (!lead) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const placeholders = lead.clubIds.map(() => '?').join(',');
    const [rows]: any = await pool.execute(
      `SELECT * FROM attendance_submissions WHERE activity_code = ? AND club_id IN (${placeholders})`,
      [id, ...lead.clubIds]
    );
    return NextResponse.json({ submission: rows[0] ?? null });
  } catch (error: any) {
    return NextResponse.json({ error: safeMessage(error, 'Failed to fetch submission status') }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTable();
    const lead = await checkLead();
    if (!lead) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    // Confirm attendance has been marked
    const [check]: any = await pool.execute(
      'SELECT COUNT(*) as marked FROM activity_enrollments WHERE activity_code = ? AND attendance_marked = 1',
      [id]
    );
    if (!check[0].marked || check[0].marked === 0) {
      return NextResponse.json({ error: 'Attendance has not been marked yet. Mark and lock attendance first.' }, { status: 400 });
    }

    // Get activity title
    const [actInfo]: any = await pool.execute(
      'SELECT code, title FROM activity_catalogue WHERE code = ?',
      [id]
    );
    const actTitle = actInfo[0]?.title ?? id;
    const submissionClub = await resolveSubmissionClub(lead.clubIds, lead.assigned_categories, id);
    if (!submissionClub) {
      return NextResponse.json({ error: 'Activity is not assigned to your club' }, { status: 403 });
    }
    const { clubId, clubName } = submissionClub;

    await pool.execute(`
      INSERT INTO attendance_submissions (activity_code, club_id, club_name, activity_title, lead_username, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
      ON DUPLICATE KEY UPDATE
        status = 'pending',
        submitted_at = CURRENT_TIMESTAMP,
        faculty_notes = NULL,
        verified_by = NULL,
        verified_at = NULL,
        scanned_copy_url = NULL
    `, [id, clubId, clubName, actTitle, lead.decoded.username]);

    return NextResponse.json({ success: true, message: 'Attendance submitted for faculty verification' });
  } catch (error: any) {
    console.error('Submit attendance error:', error);
    return NextResponse.json({ error: safeMessage(error, 'Failed to submit attendance for verification') }, { status: 500 });
  }
}
