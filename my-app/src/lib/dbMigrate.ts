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

    // Table for admin → club → activity mappings
    await pool.query(`
        CREATE TABLE IF NOT EXISTS club_activity_mappings (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            club_id     INT          NOT NULL,
            activity_code VARCHAR(50) NOT NULL,
            created_by  VARCHAR(100) DEFAULT NULL,
            created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_club_activity (club_id, activity_code)
        )
    `);

    _done = true;
}
