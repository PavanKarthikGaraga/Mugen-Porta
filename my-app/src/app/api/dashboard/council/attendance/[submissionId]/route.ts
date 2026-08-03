import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { getCouncilClubIds } from '@/lib/councilScope';

async function getCouncil() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tck')?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded || decoded.role !== 'council') return null;
  const clubIds = await getCouncilClubIds(decoded.username as string);
  return { decoded, clubIds };
}

export async function GET(_request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  try {
    const council = await getCouncil();
    if (!council) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { submissionId } = await params;
    const [subRows]: any = await pool.execute(
      'SELECT * FROM attendance_submissions WHERE id = ?',
      [submissionId]
    );
    if (subRows.length === 0) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

    const sub = subRows[0];
    if (!council.clubIds.includes(sub.club_id)) {
      return NextResponse.json({ error: 'This club is not in your domain' }, { status: 403 });
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

export async function POST(request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  try {
    const council = await getCouncil();
    if (!council) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { submissionId } = await params;
    const [subRows]: any = await pool.execute(
      'SELECT * FROM attendance_submissions WHERE id = ?',
      [submissionId]
    );
    if (subRows.length === 0) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

    const sub = subRows[0];
    if (!council.clubIds.includes(sub.club_id)) {
      return NextResponse.json({ error: 'This club is not in your domain' }, { status: 403 });
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
    `, [status, scannedCopyUrl ?? null, council.decoded.username, notes ?? null, submissionId]);

    // When approved: mark enrolled+attending students as completed
    if (status === 'verified') {
      await pool.execute(
        `UPDATE activity_enrollments
         SET status = 'completed'
         WHERE activity_code = ? AND attendance_percentage = 100 AND status = 'active'`,
        [sub.activity_code]
      );
    }

    return NextResponse.json({ success: true, message: `Attendance ${status} successfully` });
  } catch (error: any) {
    console.error('Council verify error:', error);
    return NextResponse.json({ error: safeMessage(error, 'Failed to verify attendance') }, { status: 500 });
  }
}
