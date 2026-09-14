import { ensureCareerRoadmapCacheTable } from './src/lib/dbMigrate';

async function run() {
    try {
        await ensureCareerRoadmapCacheTable();
        console.log("Success");
    } catch(e) {
        console.error("Error:");
        console.error(e);
    }
    process.exit(0);
}

run();
