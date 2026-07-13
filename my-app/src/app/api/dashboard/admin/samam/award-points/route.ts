import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'faculty')) return null;
    return decoded;
}

export async function POST(request: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { username, points, domain, reason, category } = await request.json();

        if (!username || !points || !domain || !reason) {
            return NextResponse.json({ message: 'Username, points, domain and reason are required' }, { status: 400 });
        }

        // Check student exists
        const [studentRows] = await pool.execute('SELECT username, name FROM students WHERE username = ?', [username]) as any[];
        if ((studentRows as any[]).length === 0) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        // Insert SDC transaction
        await pool.execute(`
            INSERT INTO sdc_transactions (username, credits, domain, category, description, granted_by, granted_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [username, points, domain.toUpperCase(), category || 'admin_award', reason, admin.username || 'admin']);

        // Update student profile total (if student_profiles table tracks it)
        // The level will be recomputed from sum — no need to update here

        return NextResponse.json({
            success: true,
            message: `Successfully awarded ${points} SAMAM Points to ${(studentRows as any[])[0].name}`
        });

    } catch (error: any) {
        console.error('Award points error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
