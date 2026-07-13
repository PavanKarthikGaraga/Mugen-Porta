const mysql = require('mysql2/promise');
async function test() {
  const pool = mysql.createPool({ user: 'root', password: 'Nsingana@1', database: 'samam_db' });
  try {
    const [rows] = await pool.query('SELECT code, title FROM activity_catalogue LIMIT 1');
    console.log(rows);
  } catch(e) { console.error(e); }
  pool.end();
}
test();
