import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function checkLead() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;
    
    // verify the lead's club
    const [leadResult]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [decoded.username as string]);
    if (leadResult.length === 0 || !leadResult[0].clubId) return null;
    
    return { decoded, clubId: leadResult[0].clubId };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const lead = await checkLead();
        if (!lead) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params; // id is the activity code
        
        // Ensure that the activity belongs to students in their club (we can just fetch students in their club enrolled in this activity)
        const [rows] = await pool.execute(`
            SELECT ae.id, ae.username, s.name, ae.attendance_percentage, ae.attendance_marked
            FROM activity_enrollments ae
            JOIN students s ON ae.username = s.username
            WHERE ae.activity_code = ? AND s.clubId = ?
            ORDER BY s.name ASC
        `, [id, lead.clubId]);

        return NextResponse.json({ success: true, students: rows });

    } catch (error: any) {
        console.error('Fetch attendance error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const lead = await checkLead();
        if (!lead) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        const { absentees } = await request.json(); // Array of usernames

        // We only want to update enrollments for students in this lead's club!
        // So we update where activity_code = ? and username IN (select username from students where clubId = ?)
        
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
            AND username IN (SELECT username FROM students WHERE clubId = ?)
        `;
        
        let queryParams = [...absentees, id, lead.clubId];

        await pool.execute(query, queryParams);

        return NextResponse.json({ success: true, message: 'Attendance saved successfully' });

    } catch (error: any) {
        console.error('Save attendance error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
