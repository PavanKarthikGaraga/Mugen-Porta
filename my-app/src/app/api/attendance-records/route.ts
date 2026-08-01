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

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const clubFilter = searchParams.get('clubId');

    let whereClause = '';
    let queryParams: any[] = [];

    const role     = user.role     as string;
    const username = user.username as string;

    if (role === 'lead') {
      // Lead: only see their own club
      const [leadRows]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [username]);
      if (leadRows.length === 0) return NextResponse.json({ records: [] });
      const clubId = leadRows[0].clubId;
      whereClause = 'WHERE ats.club_id = ?';
      queryParams = [clubId];
    } else if (role === 'faculty') {
      const [facRows]: any = await pool.execute('SELECT assignedClubs FROM faculty WHERE username = ?', [username]);
      if (facRows.length === 0) return NextResponse.json({ records: [] });
      let clubs: string[] = [];
      try {
        clubs = Array.isArray(facRows[0].assignedClubs)
          ? facRows[0].assignedClubs
          : JSON.parse(facRows[0].assignedClubs ?? '[]');
      } catch { clubs = []; }
      if (clubs.length === 0) return NextResponse.json({ records: [] });

      if (clubFilter && clubs.includes(clubFilter)) {
        whereClause = 'WHERE ats.club_id = ?';
        queryParams = [clubFilter];
      } else {
        const ph = clubs.map(() => '?').join(',');
        whereClause = `WHERE ats.club_id IN (${ph})`;
        queryParams = clubs;
      }
    } else if (role === 'council') {
      const [councilRows]: any = await pool.execute('SELECT assignedDomain FROM council WHERE username = ?', [username]);
      if (councilRows.length === 0) return NextResponse.json({ records: [] });
      const domain = councilRows[0].assignedDomain as string;
      const [clubRows]: any = await pool.execute('SELECT id FROM clubs WHERE domain = ?', [domain]);
      const clubs = (clubRows as any[]).map((c: any) => c.id as string);
      if (clubs.length === 0) return NextResponse.json({ records: [] });

      if (clubFilter && clubs.includes(clubFilter)) {
        whereClause = 'WHERE ats.club_id = ?';
        queryParams = [clubFilter];
      } else {
        const ph = clubs.map(() => '?').join(',');
        whereClause = `WHERE ats.club_id IN (${ph})`;
        queryParams = clubs;
      }
    } else if (role === 'admin') {
      if (clubFilter) {
        whereClause = 'WHERE ats.club_id = ?';
        queryParams = [clubFilter];
      }
      // else no filter — show all
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // keep username in scope for compiler

    const [rows]: any = await pool.execute(`
      SELECT
        ats.*,
        (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = ats.activity_code AND ae.attendance_percentage = 100) AS present_count,
        (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = ats.activity_code AND ae.attendance_percentage = 0)   AS absent_count,
        (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = ats.activity_code)                                    AS total_count
      FROM attendance_submissions ats
      ${whereClause}
      ORDER BY ats.submitted_at DESC
    `, queryParams);

    return NextResponse.json({ records: rows });
  } catch (error: any) {
    console.error('Attendance records error:', error);
    return NextResponse.json({ error: safeMessage(error, 'Failed to fetch attendance records') }, { status: 500 });
  }
}
