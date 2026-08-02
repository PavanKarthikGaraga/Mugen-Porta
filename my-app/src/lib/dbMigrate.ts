import pool from './db';

// Module-level flag: migrations only run once per process lifetime
let _done = false;

async function addColumnIfMissing(table: string, column: string, definition: string) {
    try {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e; // already exists → fine
    }
}

export async function ensureActivitySchema() {
    if (_done) return;

    // New columns on activity_catalogue needed for approval workflow
    await addColumnIfMissing('activity_catalogue', 'approval_status', "VARCHAR(20) NOT NULL DEFAULT 'active'");
    await addColumnIfMissing('activity_catalogue', 'submitted_by', 'VARCHAR(100) DEFAULT NULL');
    await addColumnIfMissing('activity_catalogue', 'rejection_note', 'TEXT DEFAULT NULL');

    // Scheduling + venue, shown to students in the catalogue and My Activities.
    await addColumnIfMissing('activity_catalogue', 'activity_date', 'DATE DEFAULT NULL');
    await addColumnIfMissing('activity_catalogue', 'start_time', 'TIME DEFAULT NULL');
    await addColumnIfMissing('activity_catalogue', 'end_time', 'TIME DEFAULT NULL');
    await addColumnIfMissing('activity_catalogue', 'venue', 'VARCHAR(255) DEFAULT NULL');

    // Registration gate. Defaults to open so existing activities keep their
    // current behaviour; when closed, the activity disappears from the
    // student catalogue and enrolment is refused server-side.
    await addColumnIfMissing('activity_catalogue', 'registration_open', 'TINYINT(1) NOT NULL DEFAULT 1');

    // Table for admin → club → activity mappings
    // club_id is VARCHAR because clubs.id is a manually assigned code (not auto-increment INT)
    await pool.query(`
        CREATE TABLE IF NOT EXISTS club_activity_mappings (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            club_id     VARCHAR(100) NOT NULL,
            activity_code VARCHAR(50) NOT NULL,
            created_by  VARCHAR(100) DEFAULT NULL,
            created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_club_activity (club_id, activity_code)
        )
    `);

    // Fix existing tables that were created with INT club_id
    try {
        await pool.query(`ALTER TABLE club_activity_mappings MODIFY COLUMN club_id VARCHAR(100) NOT NULL`);
    } catch (e: any) {
        // Ignore if already correct type or table doesn't exist
    }

    _done = true;
}
