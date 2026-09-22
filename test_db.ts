import * as fs from 'fs';
import * as path from 'path';

const envLocal = fs.readFileSync(path.join(__dirname, 'my-app', '.env'), 'utf8');
envLocal.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        process.env[match[1]] = match[2];
    }
});

import pool from './my-app/src/lib/db';

async function test() {
    try {
        const [rows] = await pool.query('SELECT 1 as val');
        console.log("DB connection OK:", rows);

        // Let's test the migration manually
        try {
            await pool.query(`ALTER TABLE activity_reports ADD COLUMN report_pdf_url VARCHAR(500) DEFAULT NULL`);
            console.log("Added report_pdf_url to activity_reports");
        } catch(e: any) {
            console.log("Error adding to activity_reports:", e.code, e.message);
        }

        try {
            await pool.query(`ALTER TABLE iqac_activity_reports ADD COLUMN report_pdf_url VARCHAR(500) DEFAULT NULL`);
            console.log("Added report_pdf_url to iqac_activity_reports");
        } catch(e: any) {
            console.log("Error adding to iqac_activity_reports:", e.code, e.message);
        }

    } catch(e: any) {
        console.error("Failed:", e);
    }
    process.exit(0);
}
test();
