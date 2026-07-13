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
      ALTER TABLE student_profiles 
      ADD COLUMN skills JSON DEFAULT NULL,
      ADD COLUMN banner_url VARCHAR(500) DEFAULT NULL,
      ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL;
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
