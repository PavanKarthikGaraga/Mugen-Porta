import pool from './my-app/src/lib/db';
async function run() {
    try {
        await pool.query(`ALTER TABLE activity_reports ADD COLUMN report_pdf_url VARCHAR(500) DEFAULT NULL`);
        console.log("Added report_pdf_url to activity_reports");
    } catch(e: any) { console.log(e.message); }
    try {
        await pool.query(`ALTER TABLE iqac_activity_reports ADD COLUMN report_pdf_url VARCHAR(500) DEFAULT NULL`);
        console.log("Added report_pdf_url to iqac_activity_reports");
    } catch(e: any) { console.log(e.message); }
    process.exit(0);
}
run();
