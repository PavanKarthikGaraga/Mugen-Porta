import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { ACTIVITIES } from '@/app/Data/activities-mock';

const PACK_EMOJI_MAP: Record<string, string> = {
  "Artificial Intelligence": "🧠",
  "Blockchain & Web3": "⛓️",
  "Cloud Computing & DevOps": "☁️",
  "Cybersecurity & Digital Trust": "🛡️",
  "Data Science & Analytics": "📊",
  "Internet of Things (IoT)": "🔌",
  "AgriTech": "🌾",
  "Biotechnology": "🧬",
  "SpaceTech": "🚀",
  "Robotics & Automation": "🤖",
  "FinTech": "💰",
  "Smart Cities": "🏙️",
  "EdTech": "📚",
  "Technology Policy": "⚖️"
};

const LEVEL_RARITY_MAP: Record<string, string> = {
  "explorer": "Common",
  "foundation": "Common",
  "practitioner": "Rare",
  "leader": "Epic",
  "fellow": "Legendary"
};

export async function GET() {
  try {
    let logs = [];
    
    // Add missing schema columns if they don't exist (Production fix)
    try {
      await pool.query("ALTER TABLE badge_definitions ADD COLUMN type ENUM('activity', 'milestone') DEFAULT 'activity'");
      logs.push("Added 'type' column");
    } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

    try {
      await pool.query("ALTER TABLE badge_definitions ADD COLUMN target_value INT DEFAULT 1");
      logs.push("Added 'target_value' column");
    } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

    try {
      await pool.query("ALTER TABLE badge_definitions ADD COLUMN metric VARCHAR(50) DEFAULT 'completion'");
      logs.push("Added 'metric' column");
    } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

    try {
      await pool.query("ALTER TABLE badge_definitions ADD COLUMN rarity VARCHAR(50) DEFAULT 'Common'");
      logs.push("Added 'rarity' column");
    } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

    try {
      await pool.query("ALTER TABLE badge_definitions ADD COLUMN requirement TEXT");
      logs.push("Added 'requirement' column");
    } catch (e: any) { if (e.code !== 'ER_DUP_FIELDNAME') console.log(e.message); }

    // We won't delete rows, we will just upsert them
    // await pool.query("DELETE FROM badge_definitions WHERE type = 'activity'");
    
    // Reset badge_id in catalogue
    await pool.query("UPDATE activity_catalogue SET badge_id = NULL");

    for (const activity of ACTIVITIES) {
      const badgeCode = 'B-' + activity.code;
      const badgeName = activity.badge || (activity.name + ' Badge');
      const icon = PACK_EMOJI_MAP[activity.pack] || '🏆';
      const rarity = LEVEL_RARITY_MAP[activity.level] || 'Common';
      const description = `Awarded for completing the ${activity.name} pathway.`;
      const requirement = `Complete ${activity.code}`;

      // Upsert into badge_definitions
      await pool.query(
        `INSERT INTO badge_definitions (code, name, description, icon, domain, type, rarity, target_value, metric, requirement) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name), description = VALUES(description), icon = VALUES(icon), domain = VALUES(domain), 
         type = VALUES(type), rarity = VALUES(rarity), requirement = VALUES(requirement)`,
        [badgeCode, badgeName, description, icon, activity.domain || 'TEC', 'activity', rarity, 1, 'activity_completion', requirement]
      );
      
      // Get the ID of the UPSERTED row
      const [existing]: any = await pool.query('SELECT id FROM badge_definitions WHERE code = ?', [badgeCode]);
      const badgeId = existing[0].id;
      
      // Update activity_catalogue
      await pool.query('UPDATE activity_catalogue SET badge_id = ? WHERE code = ?', [badgeId, activity.code]);
      
      logs.push(`Linked ${badgeName} to ${activity.code}`);
    }

    return NextResponse.json({ success: true, message: `Successfully seeded and linked ${ACTIVITIES.length} badges.`, logs });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
