import mysql from 'mysql2/promise';
import fs from 'fs';

// Parse simple .env manually
const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) acc[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
  return acc;
}, {});

async function main() {
  const pool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: parseInt(env.DB_PORT || '3306'),
  });

  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM activities');
    console.log(`Total activities: ${rows[0].count}`);
  } catch (err) {
    console.error('Error counting activities:', err.message);
  } finally {
    await pool.end();
  }
}

main();
