import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // We try querying by 'code' first since the frontend uses code (e.g. 'TECH-AI-001') in the URL
    const [rows]: any = await pool.query(
      `SELECT * FROM activity_catalogue WHERE code = ? OR id = ? LIMIT 1`, 
      [id, id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
    }

    const row = rows[0];
    const activity = {
      ...row,
      outcomes: row.outcomes || [],
      timeline: row.timeline || [],
      resources: row.resources || [],
      assignments: row.assignments || [],
      competencies: row.competencies || [],
      career: row.career || [],
      sdgs: row.sdgs || [],
      ga: row.ga || [],
    };

    return NextResponse.json({ success: true, data: activity });
  } catch (error: any) {
    console.error("GET Activity Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // The user might send partial updates, so we only update the fields provided
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || key === 'created_at') continue;
      
      fields.push(`${key} = ?`);
      
      // Handle JSON stringification for array/object fields
      if (['outcomes', 'timeline', 'resources', 'assignments', 'competencies', 'career', 'sdgs', 'ga'].includes(key)) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const query = `UPDATE activity_catalogue SET ${fields.join(', ')} WHERE code = ? OR id = ?`;
    values.push(id, id);

    const [result]: any = await pool.query(query, values);

    return NextResponse.json({ success: true, affectedRows: result.affectedRows });
  } catch (error: any) {
    console.error("PUT Activity Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const [result]: any = await pool.query(
      `DELETE FROM activity_catalogue WHERE code = ? OR id = ?`, 
      [id, id]
    );

    return NextResponse.json({ success: true, affectedRows: result.affectedRows });
  } catch (error: any) {
    console.error("DELETE Activity Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
