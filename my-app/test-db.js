const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mugen_porta',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        const [rows] = await pool.query('SELECT username, campus, clubId, selectedDomain FROM students ORDER BY created_at DESC LIMIT 10');
        console.log("Students:", rows);
    } catch(e) {
        console.error(e);
    }
    pool.end();
}
run();
