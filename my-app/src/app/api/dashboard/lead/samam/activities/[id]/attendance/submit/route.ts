import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

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
    const [rows]: any = await pool.execute(
      'SELECT l.clubId, c.name as clubName FROM leads l LEFT JOIN clubs c ON l.clubId = c.id WHERE l.username = ?',
      [decoded.username as string]
    );
    if (rows.length === 0) return null;
    return { decoded, clubId: rows[0].clubId, clubName: rows[0].clubName || '' };
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTable();
    const lead = await checkLead();
    if (!lead) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const [rows]: any = await pool.execute(
      'SELECT * FROM attendance_submissions WHERE activity_code = ? AND club_id = ?',
      [id, lead.clubId]
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
    `, [id, lead.clubId, lead.clubName, actTitle, lead.decoded.username]);

    return NextResponse.json({ success: true, message: 'Attendance submitted for faculty verification' });
  } catch (error: any) {
    console.error('Submit attendance error:', error);
    return NextResponse.json({ error: safeMessage(error, 'Failed to submit attendance for verification') }, { status: 500 });
  }
}
