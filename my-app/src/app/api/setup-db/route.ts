import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

export async function POST(request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        await pool.query(`
            ALTER TABLE activity_catalogue
            ADD COLUMN IF NOT EXISTS difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
            ADD COLUMN IF NOT EXISTS journey_level ENUM('Explorer', 'Foundation', 'Practitioner', 'Leader', 'Fellow') DEFAULT 'Explorer',
            ADD COLUMN IF NOT EXISTS activity_pack VARCHAR(200) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS faculty_name VARCHAR(200) DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS sdgs JSON DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS hours DECIMAL(5,1) DEFAULT 0.0;
        `);
        return NextResponse.json({ message: 'Database updated successfully' });
    } catch (error: any) {
        console.error('DB Migration Error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Database migration failed') }, { status: 500 });
    }
}
