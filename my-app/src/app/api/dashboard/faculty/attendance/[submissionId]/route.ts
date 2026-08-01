import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function getFaculty() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tck')?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded || decoded.role !== 'faculty') return null;
  const [rows]: any = await pool.execute('SELECT assignedClubs FROM faculty WHERE username = ?', [decoded.username as string]);
  if (rows.length === 0) return null;
  let clubs: string[] = [];
  try {
    clubs = Array.isArray(rows[0].assignedClubs)
      ? rows[0].assignedClubs
      : JSON.parse(rows[0].assignedClubs ?? '[]');
  } catch { clubs = []; }
  return { decoded, assignedClubs: clubs };
}

export async function GET(request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  try {
    const faculty = await getFaculty();
    if (!faculty) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { submissionId } = await params;
    const [subRows]: any = await pool.execute(
      'SELECT * FROM attendance_submissions WHERE id = ?',
      [submissionId]
    );
    if (subRows.length === 0) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

    const sub = subRows[0];
    if (!faculty.assignedClubs.includes(sub.club_id)) {
      return NextResponse.json({ error: 'You are not assigned to this club' }, { status: 403 });
    }

    // Fetch students with attendance status
    const [students]: any = await pool.execute(`
      SELECT ae.username, s.name, ae.attendance_percentage, ae.attendance_marked
      FROM activity_enrollments ae
      JOIN students s ON ae.username = s.username
      WHERE ae.activity_code = ?
      ORDER BY s.name ASC
    `, [sub.activity_code]);

    return NextResponse.json({ submission: sub, students });
  } catch (error: any) {
    return NextResponse.json({ error: safeMessage(error, 'Failed to fetch attendance detail') }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  try {
    const faculty = await getFaculty();
    if (!faculty) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { submissionId } = await params;
    const [subRows]: any = await pool.execute(
      'SELECT * FROM attendance_submissions WHERE id = ?',
      [submissionId]
    );
    if (subRows.length === 0) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

    const sub = subRows[0];
    if (!faculty.assignedClubs.includes(sub.club_id)) {
      return NextResponse.json({ error: 'You are not assigned to this club' }, { status: 403 });
    }

    const body = await request.json();
    const { status, scannedCopyUrl, notes } = body;

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be "verified" or "rejected".' }, { status: 400 });
    }

    await pool.execute(`
      UPDATE attendance_submissions
      SET status = ?, scanned_copy_url = ?, verified_by = ?, verified_at = NOW(), faculty_notes = ?
      WHERE id = ?
    `, [status, scannedCopyUrl ?? null, faculty.decoded.username, notes ?? null, submissionId]);

    return NextResponse.json({ success: true, message: `Attendance ${status} successfully` });
  } catch (error: any) {
    console.error('Faculty verify error:', error);
    return NextResponse.json({ error: safeMessage(error, 'Failed to verify attendance') }, { status: 500 });
  }
}
