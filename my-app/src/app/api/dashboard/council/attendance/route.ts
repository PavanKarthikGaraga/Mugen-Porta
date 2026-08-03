import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { getCouncilClubIds } from '@/lib/councilScope';

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

async function getCouncil() {
  const cookieStore = await cookies();
  const token = cookieStore.get('tck')?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded || decoded.role !== 'council') return null;
  const clubIds = await getCouncilClubIds(decoded.username as string);
  return { decoded, clubIds };
}

export async function GET() {
  try {
    await pool.execute(CREATE_TABLE);
    const council = await getCouncil();
    if (!council) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (council.clubIds.length === 0) return NextResponse.json({ submissions: [] });

    const ph = council.clubIds.map(() => '?').join(',');
    const [rows]: any = await pool.execute(`
      SELECT
        ats.*,
        (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = ats.activity_code AND ae.attendance_percentage = 100) AS present_count,
        (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = ats.activity_code AND ae.attendance_percentage = 0)   AS absent_count,
        (SELECT COUNT(*) FROM activity_enrollments ae WHERE ae.activity_code = ats.activity_code)                                    AS total_count
      FROM attendance_submissions ats
      WHERE ats.club_id IN (${ph})
      ORDER BY ats.submitted_at DESC
    `, council.clubIds);

    return NextResponse.json({ submissions: rows });
  } catch (error: any) {
    console.error('Council attendance list error:', error);
    return NextResponse.json({ error: safeMessage(error, 'Failed to fetch attendance submissions') }, { status: 500 });
  }
}
