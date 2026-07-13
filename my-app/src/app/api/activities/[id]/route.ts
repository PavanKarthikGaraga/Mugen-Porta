import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // We try querying by 'code' first since the frontend uses code (e.g. 'TECH-AI-001') in the URL
    const [rows]: any = await pool.query(
      `SELECT ac.*, bd.name as badgeName, bd.icon as badgeIcon,
              (SELECT COUNT(*) FROM activity_registrations ar WHERE ar.catalogue_id = ac.id) as real_enrolled_count
       FROM activity_catalogue ac 
       LEFT JOIN badge_definitions bd ON ac.badge_id = bd.id 
       WHERE ac.code = ? OR ac.id = ? LIMIT 1`, 
      [id, id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Activity not found' }, { status: 404 });
    }

    const row = rows[0];
    const safeParse = (val: any) => {
      if (!val) return [];
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return []; }
      }
      return val;
    };

    const getNationalMission = (domain: string, category: string) => {
      const cat = category || '';
      if (domain === 'TEC' && (cat.includes('AI') || cat.includes('Cyber'))) return 'Digital India';
      if (domain === 'IIE') return 'Make in India';
      if (domain === 'ESO') return 'Swachh Bharat';
      if (domain === 'HWB') return 'Fit India';
      if (domain === 'LCH') return 'Ek Bharat Shreshtha Bharat';
      if (cat.includes('Agriculture')) return 'National Mission for Sustainable Agriculture';
      return 'Skill India';
    };

    const activity = {
      ...row,
      nationalMission: row.national_mission || getNationalMission(row.domain, row.category),
      badge: row.badgeName ? `${row.badgeIcon} ${row.badgeName}` : 'No Badge Assigned',
      outcomes: safeParse(row.outcomes),
      timeline: safeParse(row.timeline),
      resources: safeParse(row.resources),
      assignments: safeParse(row.assignments),
      competencies: safeParse(row.competencies),
      career: safeParse(row.career),
      sdgs: safeParse(row.sdgs),
      ga: safeParse(row.ga),
      enrolledCount: row.real_enrolled_count || 0,
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
