import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    let query = `SELECT * FROM activity_catalogue`;
    const params: any[] = [];

    if (domain && domain !== 'all') {
      query += ` WHERE domain = ?`;
      params.push(domain);
    }
    
    query += ` ORDER BY id ASC`;

    const [rows]: any = await pool.query(query, params);

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
    }));

    return NextResponse.json({ success: true, data: activities });
  } catch (error: any) {
    console.error("GET Activities Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
