import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'faculty')) return null;
    return decoded;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!await checkAdmin()) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params; // id is the activity code
        
        const [rows] = await pool.execute(`
            SELECT ae.id, ae.username, s.name, ae.attendance_percentage, ae.attendance_marked
            FROM activity_enrollments ae
            JOIN students s ON ae.username = s.username
            WHERE ae.activity_code = ?
            ORDER BY s.name ASC
        `, [id]);

        return NextResponse.json({ success: true, students: rows });

    } catch (error: any) {
        console.error('Fetch attendance error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await checkAdmin();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        const { absentees } = await request.json(); // Array of usernames

        // Once attendance has been marked/locked for this activity, only an
        // admin may make further changes -- faculty can mark it the first
        // time, but not re-edit it afterward.
        const [lockRows]: any = await pool.execute(
            'SELECT 1 FROM activity_enrollments WHERE activity_code = ? AND attendance_marked = TRUE LIMIT 1',
            [id]
        );
        if ((lockRows as any[]).length > 0 && user.role !== 'admin') {
            return NextResponse.json({ message: 'Attendance is locked. Only an admin can make further changes.' }, { status: 403 });
        }

        // Mark everyone in the activity as attendance_marked = TRUE
        // If username in absentees, set attendance_percentage = 0, else 100
        const absenteesPlaceholders = absentees.length > 0 ? absentees.map(() => '?').join(',') : "''";
        
        let query = `
            UPDATE activity_enrollments 
            SET 
                attendance_marked = TRUE,
                attendance_percentage = CASE 
                    WHEN username IN (${absenteesPlaceholders}) THEN 0
                    ELSE 100
                END
            WHERE activity_code = ?
        `;
        
        let queryParams = [...absentees, id];

        await pool.execute(query, queryParams);

        return NextResponse.json({ success: true, message: 'Attendance saved successfully' });

    } catch (error: any) {
        console.error('Save attendance error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
