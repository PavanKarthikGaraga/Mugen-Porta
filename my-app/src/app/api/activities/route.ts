import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema } from '@/lib/dbMigrate';

export async function GET(request: Request) {
  try {
    await ensureActivitySchema();
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    const DEMO_ACCOUNTS = new Set(['2400000000']);

    // Resolve the calling student's club so we can filter by mappings
    let studentClubId: number | null = null;
    let hasMappings = false;
    let isStudent = false;
    let isDemoAccount = false;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('tck')?.value;
      if (token) {
        const decoded = await verifyToken(token);
        if (decoded && decoded.role === 'student') {
          isStudent = true;
          if (DEMO_ACCOUNTS.has(decoded.username as string)) {
            isDemoAccount = true;
          } else {
            const [clubRows]: any = await pool.query(
              `SELECT clubId FROM students WHERE username = ?`, [decoded.username]
            );
            const clubId = clubRows[0]?.clubId;
            if (clubId) {
              studentClubId = clubId;
              const [mapCount]: any = await pool.query(
                `SELECT COUNT(*) as cnt FROM club_activity_mappings WHERE club_id = ?`, [clubId]
              );
              hasMappings = (mapCount[0]?.cnt || 0) > 0;
            }
          }
        }
      }
    } catch (e) { /* non-student or table missing — show all */ }

    const conditions: string[] = [`(ac.approval_status IN ('active', 'completed') OR ac.status = 'completed')`];
    const params: any[] = [];

    // Students now see all mapped activities regardless of registration_open status
    // so we removed the `ac.registration_open = 1` filter.

    if (domain && domain !== 'all') {
      conditions.push(`ac.domain = ?`);
      params.push(domain);
    }

    // Demo account sees all activities across all domains — no club/mapper filter
    // Regular students: if club has mappings, restrict to only mapped activities
    if (!isDemoAccount && studentClubId && hasMappings) {
      conditions.push(`EXISTS (
        SELECT 1 FROM club_activity_mappings cam
        WHERE cam.club_id = ? AND cam.activity_code = ac.code
      )`);
      params.push(studentClubId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT ac.*,
             (SELECT COUNT(*) FROM activity_enrollments ar WHERE ar.activity_code = ac.code) as real_enrolled_count
      FROM activity_catalogue ac
      ${where}
      ORDER BY ac.domain ASC, ac.category ASC, ac.code ASC
    `;

    const [rows]: any = await pool.query(query, params);

    let enrolledCodes = new Set<string>();
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('tck')?.value;
      if (token) {
        const decoded = await verifyToken(token);
        if (decoded && decoded.role === 'student') {
          const [enrollments]: any = await pool.query(
            `SELECT activity_code FROM activity_enrollments WHERE username = ?`,
            [decoded.username]
          );
          enrollments.forEach((e: any) => enrolledCodes.add(e.activity_code));
        }
      }
    } catch (e) {
      console.error("Token decode error in activities list:", e);
    }

    // Parse JSON columns back to objects for the frontend
    const activities = rows.map((row: any) => ({
      ...row,
      outcomes: row.outcomes || [],
      timeline: row.timeline || [],
      resources: row.resources || [],
      assignments: row.assignments || [],
      competencies: row.competencies || [],
      career: row.career || [],
      sdgs: row.sdgs || [],
      ga: row.ga || [],
      enrolledCount: row.real_enrolled_count || 0,
      isEnrolled: enrolledCodes.has(row.code)
    }));

    return NextResponse.json({ success: true, data: activities });
  } catch (error: any) {
    console.error("GET Activities Error:", error);
    return NextResponse.json({ success: false, error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(['admin', 'faculty']);
  if (auth.response) return auth.response;

  try {
    const data = await request.json();
    const {
      code, title, description, domain, category, sdc_credits, max_seats,
      outcomes, timeline, resources, assignments, competencies, career,
      sdgs, ga, facultyFeedback, reflection, purpose, difficulty, level
    } = data;

    const query = `
      INSERT INTO activity_catalogue (
        code, title, description, domain, category, sdc_credits, max_seats, 
        outcomes, timeline, resources, assignments, competencies, career, 
        sdgs, ga, facultyFeedback, reflection, purpose, difficulty, level, status, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW()
      )
    `;

    const [result]: any = await pool.query(query, [
      code, title, description || "", domain || 'TEC', category || 'General',
      sdc_credits || 0, max_seats || 50,
      JSON.stringify(outcomes || []),
      JSON.stringify(timeline || []),
      JSON.stringify(resources || []),
      JSON.stringify(assignments || []),
      JSON.stringify(competencies || []),
      JSON.stringify(career || []),
      JSON.stringify(sdgs || []),
      JSON.stringify(ga || []),
      facultyFeedback || null,
      reflection || null,
      purpose || null,
      difficulty || 'Beginner',
      level || 'explorer'
    ]);

    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (error: any) {
    console.error("POST Activity Error:", error);
    return NextResponse.json({ success: false, error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
  }
}
