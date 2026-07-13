import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ACTIVITIES } from '@/app/Data/activities-mock';

export async function POST() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let inserted = 0;

    for (const activity of ACTIVITIES) {
      const {
        code, name, description, domain, pack, sdc_credits, maxEnrollment, enrolledCount,
        outcomes, timeline, resources, assignments, competencies, career, sdgs, ga,
        facultyFeedback, reflection, purpose, difficulty, level
      } = activity;

      // Make sure we have fallbacks for required strings to avoid MySQL strict mode errors
      const safeDescription = description || "No description provided.";
      
      const query = `
        INSERT INTO activity_catalogue (
          code, title, description, domain, category, sdc_credits, max_seats, 
          enrolledCount, outcomes, timeline, resources, assignments, 
          competencies, career, sdgs, ga, facultyFeedback, reflection, purpose, difficulty, level, status, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW()
        )
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          domain = VALUES(domain),
          category = VALUES(category),
          sdc_credits = VALUES(sdc_credits),
          max_seats = VALUES(max_seats),
          enrolledCount = VALUES(enrolledCount),
          outcomes = VALUES(outcomes),
          timeline = VALUES(timeline),
          resources = VALUES(resources),
          assignments = VALUES(assignments),
          competencies = VALUES(competencies),
          career = VALUES(career),
          sdgs = VALUES(sdgs),
          ga = VALUES(ga),
          facultyFeedback = VALUES(facultyFeedback),
          reflection = VALUES(reflection),
          purpose = VALUES(purpose),
          difficulty = VALUES(difficulty),
          level = VALUES(level)
      `;

      await connection.query(query, [
        code,
        name,
        safeDescription,
        domain || 'TEC',
        pack || 'General',
        sdc_credits || activity.credits || 0,
        maxEnrollment || 0,
        enrolledCount || 0,
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
      
      inserted++;
    }

    await connection.commit();
    return NextResponse.json({ success: true, message: `Successfully seeded ${inserted} activities.` });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("Database Seeding Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
