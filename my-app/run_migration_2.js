require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function run() {
    const pool = mysql.createPool(process.env.DATABASE_URL);
    try {
        console.log("Running migration...");
        
        const queries = [
            "ALTER TABLE activity_catalogue ADD COLUMN purpose TEXT",
            "ALTER TABLE activity_catalogue ADD COLUMN learning_outcomes JSON",
            "ALTER TABLE activity_catalogue ADD COLUMN competencies JSON",
            "ALTER TABLE activity_catalogue ADD COLUMN graduate_attributes JSON",
            "ALTER TABLE activity_catalogue ADD COLUMN resources JSON",
            "ALTER TABLE activity_catalogue ADD COLUMN assignments JSON",
            "ALTER TABLE activity_catalogue ADD COLUMN timeline JSON"
        ];

        for (const q of queries) {
            try {
                await pool.execute(q);
                console.log("Success:", q);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log("Column already exists, skipping:", q);
                } else {
                    console.error("Error on:", q, err.message);
                }
            }
        }
        
        console.log("Migration complete!");
    } catch (error) {
        console.error("Connection failed:", error);
    } finally {
        await pool.end();
    }
}
run();
