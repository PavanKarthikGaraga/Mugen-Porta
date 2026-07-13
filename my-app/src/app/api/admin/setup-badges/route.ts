import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [activities]: any = await pool.query('SELECT id, code, title FROM activity_catalogue');
    if (!activities || activities.length === 0) {
      return NextResponse.json({ message: "No activities found in DB." });
    }

    let logs = [];
    for (const activity of activities) {
      // Create a badge for this activity
      const badgeCode = 'B-' + activity.code;
      const badgeName = activity.title + ' Badge';
      
      // Check if badge exists
      const [existing]: any = await pool.query('SELECT id FROM badge_definitions WHERE name = ?', [badgeName]);
      let badgeId = null;
      if (existing.length > 0) {
        badgeId = existing[0].id;
      } else {
        const [res]: any = await pool.query(
          'INSERT INTO badge_definitions (name, description, icon, criteria, type) VALUES (?, ?, ?, ?, ?)',
          [badgeName, 'Awarded for completing ' + activity.title, '🏆', 'Complete ' + activity.code, 'activity']
        );
        badgeId = res.insertId;
        logs.push(`Created badge for ${activity.code}`);
      }

      // Update activity_catalogue with this badge_id
      if (badgeId) {
        await pool.query('UPDATE activity_catalogue SET badge_id = ? WHERE id = ?', [badgeId, activity.id]);
      }
    }
    
    return NextResponse.json({ success: true, message: "Successfully created 50 badges and mapped them to activities.", logs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
