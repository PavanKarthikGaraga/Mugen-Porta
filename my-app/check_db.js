import pool from './src/lib/db.js';

async function run() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
