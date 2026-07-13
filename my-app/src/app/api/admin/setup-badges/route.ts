import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Add schema columns if they don't exist
    try {
      await pool.query("ALTER TABLE badge_definitions ADD COLUMN type ENUM('activity', 'milestone') DEFAULT 'activity'");
    } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
    try {
      await pool.query("ALTER TABLE badge_definitions ADD COLUMN target_value INT DEFAULT 1");
    } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }
    try {
      await pool.query("ALTER TABLE badge_definitions ADD COLUMN metric VARCHAR(50) DEFAULT 'completion'");
    } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

    const [activities]: any = await pool.query('SELECT id, code, title, domain FROM activity_catalogue');
    if (!activities || activities.length === 0) {
      return NextResponse.json({ message: "No activities found in DB." });
    }

    let logs = [];

    // 2. Clear old mock data if needed? We won't delete so we don't break existing earned badges, just insert/update
    
    // 3. Seed 50 Activity Badges
    for (const activity of activities) {
      const badgeCode = 'B-' + activity.code;
      const badgeName = activity.title + ' Badge';
      
      const [existing]: any = await pool.query('SELECT id FROM badge_definitions WHERE name = ?', [badgeName]);
      let badgeId = null;
      if (existing.length > 0) {
        badgeId = existing[0].id;
        // Update type and target
        await pool.query('UPDATE badge_definitions SET type = "activity", target_value = 1, metric = "activity_completion" WHERE id = ?', [badgeId]);
      } else {
        const [res]: any = await pool.query(
          'INSERT INTO badge_definitions (code, name, description, icon, domain, type, target_value, metric, requirement) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [badgeCode, badgeName, 'Awarded for completing ' + activity.title, '🏆', activity.domain || 'TEC', 'activity', 1, 'activity_completion', 'Complete ' + activity.code]
        );
        badgeId = res.insertId;
        logs.push(`Created activity badge for ${activity.code}`);
      }

      if (badgeId) {
        await pool.query('UPDATE activity_catalogue SET badge_id = ? WHERE id = ?', [badgeId, activity.id]);
      }
    }

    // 4. Seed 10 Milestone Badges
    const milestones = [
      { code: 'M-1', name: 'Rookie', desc: 'Complete 1 activity.', icon: '🌱', rarity: 'Common', target: 1, metric: 'activities_completed' },
      { code: 'M-2', name: 'Explorer', desc: 'Complete 5 activities.', icon: '🧭', rarity: 'Rare', target: 5, metric: 'activities_completed' },
      { code: 'M-3', name: 'Achiever', desc: 'Complete 10 activities.', icon: '🏅', rarity: 'Epic', target: 10, metric: 'activities_completed' },
      { code: 'M-4', name: 'SAMAM Scholar', desc: 'Earn 50 SAMAM points.', icon: '⭐', rarity: 'Rare', target: 50, metric: 'samam_points' },
      { code: 'M-5', name: 'SAMAM Master', desc: 'Earn 100 SAMAM points.', icon: '🌟', rarity: 'Epic', target: 100, metric: 'samam_points' },
      { code: 'M-6', name: 'Domain Expert: TEC', desc: 'Complete 3 TEC activities.', icon: '💻', rarity: 'Rare', target: 3, metric: 'domain_tec' },
      { code: 'M-7', name: 'Domain Expert: LCH', desc: 'Complete 3 LCH activities.', icon: '🗣️', rarity: 'Rare', target: 3, metric: 'domain_lch' },
      { code: 'M-8', name: 'Domain Expert: ESO', desc: 'Complete 3 ESO activities.', icon: '🌍', rarity: 'Rare', target: 3, metric: 'domain_eso' },
      { code: 'M-9', name: 'Domain Expert: IIE', desc: 'Complete 3 IIE activities.', icon: '💡', rarity: 'Rare', target: 3, metric: 'domain_iie' },
      { code: 'M-10', name: 'Domain Expert: HWB', desc: 'Complete 3 HWB activities.', icon: '🏃', rarity: 'Rare', target: 3, metric: 'domain_hwb' },
    ];

    for (const m of milestones) {
      const [existing]: any = await pool.query('SELECT id FROM badge_definitions WHERE code = ?', [m.code]);
      if (existing.length > 0) {
        await pool.query(
          'UPDATE badge_definitions SET type="milestone", target_value=?, metric=? WHERE id=?',
          [m.target, m.metric, existing[0].id]
        );
      } else {
        await pool.query(
          'INSERT INTO badge_definitions (code, name, description, icon, domain, rarity, type, target_value, metric, requirement) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [m.code, m.name, m.desc, m.icon, 'TEC', m.rarity, 'milestone', m.target, m.metric, m.desc]
        );
        logs.push(`Created milestone badge ${m.name}`);
      }
    }

    return NextResponse.json({ success: true, message: "Successfully seeded 50 activity badges and 10 milestones.", logs });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
