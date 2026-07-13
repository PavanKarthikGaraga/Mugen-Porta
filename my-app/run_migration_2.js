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
      ADD COLUMN outcomes JSON DEFAULT NULL,
      ADD COLUMN timeline JSON DEFAULT NULL,
      ADD COLUMN resources JSON DEFAULT NULL,
      ADD COLUMN assignments JSON DEFAULT NULL,
      ADD COLUMN competencies JSON DEFAULT NULL,
      ADD COLUMN career JSON DEFAULT NULL,
      ADD COLUMN ga JSON DEFAULT NULL,
      ADD COLUMN facultyFeedback TEXT DEFAULT NULL,
      ADD COLUMN reflection TEXT DEFAULT NULL,
      ADD COLUMN purpose TEXT DEFAULT NULL,
      ADD COLUMN level VARCHAR(50) DEFAULT 'explorer',
      ADD COLUMN enrolledCount INT DEFAULT 0;
    `);
    console.log("Migration successful: added JSON and text columns to activity_catalogue");
  } catch(err) {
    console.error("Error running migration:", err);
  } finally {
    await pool.end();
  }
}

main();
