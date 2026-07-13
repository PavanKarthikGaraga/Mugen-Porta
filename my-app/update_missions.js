const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log("Adding national_mission column...");
    await pool.query(`ALTER TABLE activity_catalogue ADD COLUMN IF NOT EXISTS national_mission VARCHAR(100) DEFAULT 'Skill India';`);
    await pool.query(`ALTER TABLE activity_catalogue ADD COLUMN IF NOT EXISTS badge_id VARCHAR(50) DEFAULT NULL;`);

    const [rows] = await pool.query(`SELECT id, code, domain, category FROM activity_catalogue`);
    for (const row of rows) {
      let mission = 'Skill India';
      if (row.domain === 'TEC' && row.category.includes('AI')) mission = 'Digital India';
      if (row.domain === 'TEC' && row.category.includes('Cyber')) mission = 'Digital India';
      if (row.domain === 'IIE') mission = 'Make in India';
      if (row.domain === 'ESO') mission = 'Swachh Bharat';
      if (row.domain === 'HWB') mission = 'Fit India';
      if (row.domain === 'LCH') mission = 'Ek Bharat Shreshtha Bharat';
      
      if (row.category.includes('Agriculture')) mission = 'National Mission for Sustainable Agriculture';

      // Map a badge for this activity based on the badge_definitions we generated
      // Our badge definitions have activity_code = row.code
      await pool.query(`UPDATE activity_catalogue SET national_mission = ?, badge_id = (SELECT code FROM badge_definitions WHERE activity_code = ?) WHERE id = ?`, [mission, row.code, row.id]);
    }
    console.log(`Updated ${rows.length} activities with national missions and badges.`);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
