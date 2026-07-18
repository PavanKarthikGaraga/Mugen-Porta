import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test',
    port: process.env.DB_PORT || 3306
  });
  
  const [rows] = await pool.query('SELECT DISTINCT domain FROM activity_catalogue;');
  console.log(rows);
  process.exit(0);
}
run();
