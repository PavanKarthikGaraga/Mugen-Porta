import pool from './src/lib/db';
async function test() {
    const [rows] = await pool.execute('SELECT DISTINCT domain, category FROM activity_catalogue');
    console.log(rows);
    process.exit(0);
}
test();
