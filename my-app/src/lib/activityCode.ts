/**
 * activity_code is stored as a plain string (no real foreign key) in
 * activity_enrollments, club_activity_mappings, activity_assignment_submissions,
 * and activity_reports — confirmed while manually fixing orphaned rows after
 * ad-hoc code changes. Renaming an activity's code without touching these
 * leaves every one of those rows silently pointing at a code that no longer
 * exists. sdc_transactions also tags points awarded through the bulk
 * points-award flow with category = 'Activity: <code>', which needs the
 * same rename to keep "points allotted per activity" queries correct.
 *
 * Call this on the same transactional connection as the activity_catalogue
 * UPDATE, after it succeeds, before commit.
 */
export async function cascadeActivityCodeChange(connection: any, oldCode: string, newCode: string) {
    await connection.execute('UPDATE activity_enrollments SET activity_code = ? WHERE activity_code = ?', [newCode, oldCode]);
    await connection.execute('UPDATE club_activity_mappings SET activity_code = ? WHERE activity_code = ?', [newCode, oldCode]);
    await connection.execute('UPDATE activity_assignment_submissions SET activity_code = ? WHERE activity_code = ?', [newCode, oldCode]);
    try {
        await connection.execute('UPDATE activity_reports SET activity_code = ? WHERE activity_code = ?', [newCode, oldCode]);
    } catch { /* table may not exist in every environment yet */ }
    try {
        await connection.execute(
            'UPDATE sdc_transactions SET category = ? WHERE category = ?',
            [`Activity: ${newCode}`, `Activity: ${oldCode}`]
        );
    } catch { /* best-effort, non-critical */ }
}
