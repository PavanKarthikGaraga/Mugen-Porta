require('dotenv').config();
const mysql = require('mysql2/promise');
async function run() {
  const pool = mysql.createPool(process.env.DATABASE_URL);
  const [rows] = await pool.query('SELECT * FROM clubs WHERE id = "DEP13"');
  console.log(rows);
  process.exit();
}
run();
