import * as fs from 'fs';
import * as path from 'path';

const envLocal = fs.readFileSync(path.join(__dirname, 'my-app', '.env'), 'utf8');
envLocal.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        process.env[match[1]] = match[2];
    }
});

import pool from './my-app/src/lib/db.js';
import { ensureActivitySchema } from './my-app/src/lib/dbMigrate.ts';

async function test() {
    try {
        const [rows] = await pool.query('SELECT 1 as val');
        console.log("DB connection OK");

        await ensureActivitySchema();
        console.log("ensureActivitySchema ran perfectly");

    } catch(e: any) {
        console.error("Failed:", e);
    }
    process.exit(0);
}
test();
