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
    await addColumnIfMissing('activity_catalogue', 'poster_url', 'VARCHAR(500) DEFAULT NULL');

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

let _notificationsDone = false;

/**
 * The `notifications` table was never created by any migration -- every
 * route that reads/writes it (admin send, student list, mark-as-read)
 * assumed it already existed. Sending a notification threw ER_NO_SUCH_TABLE
 * (500); the student GET route happened to catch that specific error and
 * fell back to an empty list, which is what made it look like notifications
 * were silently vanishing/never marking as read, rather than surfacing the
 * real "table doesn't exist" cause.
 */
export async function ensureNotificationsTable() {
    if (_notificationsDone) return;
    await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id         BIGINT AUTO_INCREMENT PRIMARY KEY,
            username   VARCHAR(10) NOT NULL,
            type       VARCHAR(20) NOT NULL DEFAULT 'system',
            title      VARCHAR(200) NOT NULL,
            message    TEXT NOT NULL,
            is_read    TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_username (username)
        )
    `);
    _notificationsDone = true;
}

let _activityReportsDone = false;

/**
 * One draft/generated row per activity a lead has started a KL SAC activity
 * report for. The PDF itself is generated client-side (jsPDF, matching the
 * existing badge/certificate export pattern in credentialExport.ts) and
 * never stored server-side -- this table only holds the form data and
 * uploaded image URLs (poster, permission letter, gallery, attendance
 * sheets) needed to regenerate it.
 */
export async function ensureActivityReportsTable() {
    if (_activityReportsDone) return;
    await pool.query(`
        CREATE TABLE IF NOT EXISTS activity_reports (
            id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
            activity_code         VARCHAR(50) NOT NULL,
            club_id               VARCHAR(20) NOT NULL,
            submitted_by          VARCHAR(10) NOT NULL,
            faculty_name          VARCHAR(200) DEFAULT NULL,
            faculty_id            VARCHAR(50) DEFAULT NULL,
            student_lead_name     VARCHAR(200) DEFAULT NULL,
            student_lead_id       VARCHAR(50) DEFAULT NULL,
            academic_year         VARCHAR(20) DEFAULT NULL,
            time_slot             VARCHAR(100) DEFAULT NULL,
            venue                 VARCHAR(255) DEFAULT NULL,
            students_participated INT DEFAULT NULL,
            poster_url            VARCHAR(500) DEFAULT NULL,
            permission_letter_url VARCHAR(500) DEFAULT NULL,
            overview              TEXT,
            objectives            TEXT,
            proceedings           TEXT,
            key_highlights        TEXT,
            learning_outcomes     TEXT,
            conclusion            TEXT,
            gallery               JSON,
            attendance_sheets     JSON,
            status                VARCHAR(20) NOT NULL DEFAULT 'draft',
            generated_at          TIMESTAMP NULL DEFAULT NULL,
            created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_activity_report (activity_code)
        )
    `);
    _activityReportsDone = true;
}

let _iqacDone = false;

export async function ensureIqacTables() {
    if (_iqacDone) return;

    await pool.query(`
        CREATE TABLE IF NOT EXISTS iqac_activities (
            id            BIGINT AUTO_INCREMENT PRIMARY KEY,
            activity_code VARCHAR(50) NOT NULL UNIQUE,
            title         VARCHAR(200) NOT NULL,
            activity_date DATE NOT NULL,
            start_time    TIME NOT NULL,
            end_time      TIME NOT NULL,
            venue         VARCHAR(255) NOT NULL,
            created_by    VARCHAR(100) NOT NULL,
            created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS iqac_activity_reports (
            id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
            activity_code         VARCHAR(50) NOT NULL UNIQUE,
            submitted_by          VARCHAR(10) NOT NULL,
            organizing_entity     VARCHAR(200) DEFAULT 'SAC (Student Activity Center)',
            director_name         VARCHAR(200) DEFAULT 'Er. P Sai Vijay Pisni',
            director_title        VARCHAR(200) DEFAULT 'Director-SAC',
            faculty_name          VARCHAR(200) DEFAULT '',
            faculty_id            VARCHAR(50) DEFAULT NULL,
            faculty_title         VARCHAR(200) DEFAULT 'Faculty Mentor',
            student_lead_name     VARCHAR(200) DEFAULT NULL,
            academic_year         VARCHAR(20) DEFAULT NULL,
            time_slot             VARCHAR(100) DEFAULT NULL,
            venue                 VARCHAR(255) DEFAULT NULL,
            students_participated INT DEFAULT NULL,
            poster_url            VARCHAR(500) DEFAULT NULL,
            permission_letter_url VARCHAR(500) DEFAULT NULL,
            overview              TEXT,
            objectives            TEXT,
            proceedings           TEXT,
            key_highlights        TEXT,
            learning_outcomes     TEXT,
            conclusion            TEXT,
            gallery               JSON,
            attendance_sheets     JSON,
            status                VARCHAR(20) NOT NULL DEFAULT 'draft',
            generated_at          TIMESTAMP NULL DEFAULT NULL,
            created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    _iqacDone = true;
}

let _roadmapCacheDone = false;

/**
 * career_roadmap_cache stores each student's generated roadmap plus how many
 * times they've generated one. Students get exactly 1 generation by default;
 * generation_count tracks usage and extra_allowed is how many additional
 * generations an admin has granted via the CR Access page (see
 * /dashboard/admin/dev/cr-access) -- allowed total = 1 + extra_allowed.
 */
export async function ensureCareerRoadmapCacheTable() {
    if (_roadmapCacheDone) return;
    await pool.query(`
        CREATE TABLE IF NOT EXISTS career_roadmap_cache (
            id               INT AUTO_INCREMENT PRIMARY KEY,
            username         VARCHAR(100) NOT NULL UNIQUE,
            roadmap_result   LONGTEXT     NOT NULL,
            generation_count INT          NOT NULL DEFAULT 0,
            extra_allowed    INT          NOT NULL DEFAULT 0,
            generated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
    // Installs that predate the usage-limit feature already have this table
    // without these columns.
    await addColumnIfMissing('career_roadmap_cache', 'generation_count', 'INT NOT NULL DEFAULT 0');
    await addColumnIfMissing('career_roadmap_cache', 'extra_allowed', 'INT NOT NULL DEFAULT 0');
    _roadmapCacheDone = true;
}

let _assignmentSubmissionStatusDone = false;

/**
 * activity_assignment_submissions (per-task file uploads on the student
 * Tasks tab) originally had no review workflow at all -- a lead/admin had no
 * way to approve or reject a task submission. These columns add that,
 * mirroring the status/reason shape already used by internal_submissions.
 */
export async function ensureAssignmentSubmissionStatusColumns() {
    if (_assignmentSubmissionStatusDone) return;
    await addColumnIfMissing('activity_assignment_submissions', 'status', "VARCHAR(20) NOT NULL DEFAULT 'pending'");
    await addColumnIfMissing('activity_assignment_submissions', 'reason', 'TEXT DEFAULT NULL');
    await addColumnIfMissing('activity_assignment_submissions', 'reviewed_by', 'VARCHAR(10) DEFAULT NULL');
    await addColumnIfMissing('activity_assignment_submissions', 'reviewed_at', 'TIMESTAMP NULL DEFAULT NULL');
    _assignmentSubmissionStatusDone = true;
}

/**
 * The set of columns that actually exist on a table, read from
 * INFORMATION_SCHEMA.
 *
 * Activity editing has broken twice now because the form submitted a field
 * whose column was missing in production (journey_level, then the new
 * schedule columns), and mysql2 fails the whole UPDATE on the first unknown
 * column. Callers use this to drop unknown fields instead of 500ing, so a
 * schema that's behind the code degrades to "that one field didn't save"
 * rather than "nothing saves at all".
 *
 * Cached per process, with an explicit bust so a caller can re-read after
 * running a migration.
 */
const _columnCache = new Map<string, Set<string>>();

export async function getTableColumns(table: string): Promise<Set<string>> {
    const cached = _columnCache.get(table);
    if (cached) return cached;
    try {
        const [rows]: any = await pool.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
            [table]
        );
        const set = new Set<string>((rows as any[]).map((r: any) => r.COLUMN_NAME));
        _columnCache.set(table, set);
        return set;
    } catch {
        // If introspection itself fails, return an empty set and let callers
        // treat that as "unknown — don't filter", rather than blocking writes.
        return new Set<string>();
    }
}

export function bustTableColumnCache(table: string) {
    _columnCache.delete(table);
}

let _aiUsageLogDone = false;

/**
 * One row per successful AI call, so token spend is attributable per
 * student and per feature (see the AI Logs admin page at
 * /dashboard/admin/dev/ai-logs). "feature" values: 'career_roadmap',
 * 'role_matches', 'role_fit' -- the first two Career Dashboard panels plus
 * the separate Career Roadmap questionnaire, the only 3 callGroqJSON call
 * sites in the app.
 */
export async function ensureAiUsageLogTable() {
    if (_aiUsageLogDone) return;
    await pool.query(`
        CREATE TABLE IF NOT EXISTS ai_usage_log (
            id                BIGINT AUTO_INCREMENT PRIMARY KEY,
            username          VARCHAR(10)  NOT NULL,
            feature           VARCHAR(30)  NOT NULL,
            provider          VARCHAR(20)  NOT NULL,
            model             VARCHAR(80)  DEFAULT NULL,
            prompt_tokens     INT          NOT NULL DEFAULT 0,
            completion_tokens INT          NOT NULL DEFAULT 0,
            total_tokens      INT          NOT NULL DEFAULT 0,
            created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_username (username),
            INDEX idx_feature (feature)
        )
    `);
    _aiUsageLogDone = true;
}

/** Non-fatal: a logging failure should never break the student-facing AI call it's logging. */
export async function logAiUsage(entry: {
    username: string;
    feature: 'career_roadmap' | 'role_matches' | 'role_fit';
    provider: string;
    model: string | null;
    usage: { promptTokens: number; completionTokens: number; totalTokens: number } | null;
}) {
    try {
        await ensureAiUsageLogTable();
        await pool.execute(
            `INSERT INTO ai_usage_log (username, feature, provider, model, prompt_tokens, completion_tokens, total_tokens)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                entry.username,
                entry.feature,
                entry.provider,
                entry.model,
                entry.usage?.promptTokens || 0,
                entry.usage?.completionTokens || 0,
                entry.usage?.totalTokens || 0,
            ]
        );
    } catch (err) {
        console.error('AI usage log insert failed (non-fatal):', err);
    }
}
