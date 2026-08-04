import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { getLeadClubIds } from '@/lib/leadScope';

async function getLead() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tck')?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded || decoded.role !== 'lead') return null;
  const clubIds = await getLeadClubIds(decoded.username as string);
  if (clubIds.length === 0) return null;
  return { decoded, clubIds };
}

// Read-only detail for a lead's own submission. There is no POST here — a
// lead never verifies or rejects their own attendance submission, only
// admin/faculty/council may (see attendance/[submissionId] in those roles).
export async function GET(_request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  try {
    const lead = await getLead();
    if (!lead) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { submissionId } = await params;
    const [subRows]: any = await pool.execute(
      'SELECT * FROM attendance_submissions WHERE id = ?',
      [submissionId]
    );
    if (subRows.length === 0) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

    const sub = subRows[0];
    if (!lead.clubIds.includes(sub.club_id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

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
