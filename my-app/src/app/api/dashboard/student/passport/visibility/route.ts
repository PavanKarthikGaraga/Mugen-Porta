import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { is_public } = await request.json();
        const username = decoded.username as string;

        await pool.execute(
            `INSERT INTO student_profiles (username, is_public)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE is_public = VALUES(is_public)`,
            [username, is_public ? 1 : 0]
        );

        return NextResponse.json({ success: true, is_public: !!is_public });
    } catch (error: any) {
        console.error('Passport visibility error:', error);
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return NextResponse.json(
                { error: 'Run the passport migration first: POST /api/setup-db/passport-migration' },
                { status: 503 }
            );
        }
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
