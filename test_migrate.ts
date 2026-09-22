import { ensureActivityReportsTable, ensureActivitySchema, ensureIqacTables } from './my-app/src/lib/dbMigrate';
async function run() {
    try {
        await ensureActivitySchema();
        console.log("ensureActivitySchema ok");
        await ensureActivityReportsTable();
        console.log("ensureActivityReportsTable ok");
        await ensureIqacTables();
        console.log("ensureIqacTables ok");
    } catch(e: any) {
        console.log("Error:", e);
    }
    process.exit(0);
}
run();
