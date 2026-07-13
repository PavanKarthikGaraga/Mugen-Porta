const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'your_db_password', // Wait, maybe it's in the actual .env, not .env.local?
        database: 'mugen_porta'
    });
}
