import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tck')?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded) return null;
  return decoded;
}

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const user = await getUser();
    const role     = user.role     as string;
    const username = user.username as string;
    if (!['lead', 'faculty', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;

    // Verify the requesting user has access to this session
    const [subRows]: any = await pool.execute(
      'SELECT * FROM attendance_submissions WHERE activity_code = ?',
      [code]
    );
    if (subRows.length === 0) {
      return NextResponse.json({ error: 'Attendance session not found' }, { status: 404 });
    }
    const sub = subRows[0];

    if (role === 'lead') {
      const [leadRows]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [username]);
      if (leadRows.length === 0 || leadRows[0].clubId !== sub.club_id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (role === 'faculty') {
      const [facRows]: any = await pool.execute('SELECT assignedClubs FROM faculty WHERE username = ?', [username]);
      let clubs: string[] = [];
      try {
        clubs = Array.isArray(facRows[0]?.assignedClubs)
          ? facRows[0].assignedClubs
          : JSON.parse(facRows[0]?.assignedClubs ?? '[]');
      } catch { clubs = []; }
      if (!clubs.includes(sub.club_id)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }
    // admin: no further check

    const [students]: any = await pool.execute(`
      SELECT ae.username, s.name, ae.attendance_percentage, ae.attendance_marked
      FROM activity_enrollments ae
      JOIN students s ON ae.username = s.username
      WHERE ae.activity_code = ?
      ORDER BY s.name ASC
    `, [code]);

    return NextResponse.json({
      students,
      activity: { code: sub.activity_code, title: sub.activity_title },
    });
  } catch (error: any) {
    return NextResponse.json({ error: safeMessage(error, 'Failed to fetch student attendance') }, { status: 500 });
  }
}
