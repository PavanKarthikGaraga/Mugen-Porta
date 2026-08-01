import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function getReviewer() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tck')?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded) return null;
  const role = decoded.role as string;
  if (role !== 'admin' && role !== 'faculty') return null;
  return decoded;
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const reviewer = await getReviewer();
    if (!reviewer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await params;

    const [subRows]: any = await pool.execute(
      'SELECT id, club_id, status FROM attendance_submissions WHERE activity_code = ?',
      [code]
    );
    if ((subRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Attendance submission not found' }, { status: 404 });
    }
    const sub = (subRows as any[])[0];

    if (reviewer.role === 'faculty') {
      const [facRows]: any = await pool.execute('SELECT assignedClubs FROM faculty WHERE username = ?', [reviewer.username as string]);
      let clubs: string[] = [];
      try {
        clubs = Array.isArray(facRows[0]?.assignedClubs)
          ? facRows[0].assignedClubs
          : JSON.parse(facRows[0]?.assignedClubs ?? '[]');
      } catch { clubs = []; }
      if (!clubs.includes(sub.club_id)) {
        return NextResponse.json({ error: 'You are not assigned to this club' }, { status: 403 });
      }
    }

    const body = await request.json().catch(() => ({}));
    const status: string = body?.status;
    const notes: string | null = typeof body?.notes === 'string' && body.notes.trim() ? body.notes.trim() : null;

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be "verified" or "rejected"' }, { status: 400 });
    }

    await pool.execute(
      `UPDATE attendance_submissions
       SET status = ?, verified_by = ?, verified_at = NOW(), faculty_notes = ?
       WHERE activity_code = ?`,
      [status, reviewer.username as string, notes, code]
    );

    // When approved: mark enrolled+attending students as completed
    if (status === 'verified') {
      await pool.execute(
        `UPDATE activity_enrollments
         SET status = 'completed'
         WHERE activity_code = ? AND attendance_percentage = 100 AND status = 'active'`,
        [code]
      );
    }

    return NextResponse.json({ success: true, message: `Attendance ${status} successfully` });
  } catch (error: any) {
    console.error('Attendance review error:', error);
    return NextResponse.json({ error: safeMessage(error, 'Failed to update attendance status') }, { status: 500 });
  }
}
