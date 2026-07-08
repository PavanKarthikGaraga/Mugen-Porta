const mysql = require('mysql2/promise');
async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    const [rows] = await pool.query('SELECT id, name, domain FROM clubs');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
}
run();
