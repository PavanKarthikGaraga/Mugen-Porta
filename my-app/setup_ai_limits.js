const mysql = require('mysql2/promise');
require('dotenv').config({ path: '/Users/nischalsingana/DEV/Mugen-Porta/my-app/.env' });

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mugen_porta'
    });

    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ai_mentor_limits (
                username VARCHAR(100) PRIMARY KEY,
                request_count INT DEFAULT 0,
                last_request_time DATETIME,
                banned_until DATETIME NULL,
                violation_level INT DEFAULT 0
            );
        `);
        console.log("Table ai_mentor_limits created successfully.");
    } catch (error) {
        console.error("Error creating table:", error);
    } finally {
        await connection.end();
    }
}

setup();
