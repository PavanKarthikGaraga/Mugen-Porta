const mysql = require('mysql2/promise');
const fs = require('fs');

function parseEnv(path) {
  if(!fs.existsSync(path)) return {};
  const content = fs.readFileSync(path, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    if (line.includes('=')) {
      const [k, ...v] = line.split('=');
      env[k.trim()] = v.join('=').trim();
    }
  });
  return env;
}

const env = parseEnv('.env.local');

async function main() {
  const pool = mysql.createPool({
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'mugen_porta'
  });

  try {
    const [result] = await pool.execute(`
      ALTER TABLE activity_catalogue
      ADD COLUMN difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
      ADD COLUMN journey_level ENUM('Explorer', 'Foundation', 'Practitioner', 'Leader', 'Fellow') DEFAULT 'Explorer',
      ADD COLUMN activity_pack VARCHAR(200) DEFAULT NULL,
      ADD COLUMN faculty_name VARCHAR(200) DEFAULT NULL,
      ADD COLUMN sdgs JSON DEFAULT NULL,
      ADD COLUMN hours DECIMAL(5,1) DEFAULT 0.0;
    `);
    console.log("Migration successful");
  } catch(err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Migration already applied.");
    } else {
      console.error("Error running migration:", err);
    }
  } finally {
    await pool.end();
  }
}

main();
