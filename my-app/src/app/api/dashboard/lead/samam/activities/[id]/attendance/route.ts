import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function checkLead() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;
    
    let leadResult: any[] = [];
    try {
        const [rows]: any = await pool.execute('SELECT clubId, assigned_categories FROM leads WHERE username = ?', [decoded.username as string]);
        leadResult = rows;
    } catch (e: any) {
        if (e.code === 'ER_BAD_FIELD_ERROR' || e.message?.includes('assigned_categories')) {
            const [rows]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [decoded.username as string]);
            leadResult = rows;
        } else {
            throw e;
        }
    }
    if (leadResult.length === 0) return null;
    
    let assigned_categories: string[] = [];
    if (leadResult[0].assigned_categories) {
        try {
            assigned_categories = typeof leadResult[0].assigned_categories === 'string' 
                ? JSON.parse(leadResult[0].assigned_categories) 
                : leadResult[0].assigned_categories;
        } catch(e) {}
    }
    
    return { decoded, clubId: leadResult[0].clubId, assigned_categories };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const lead = await checkLead();
        if (!lead) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params; // id is the activity code
        
        if (!lead.assigned_categories || lead.assigned_categories.length === 0) {
            return NextResponse.json({ message: 'No categories assigned' }, { status: 403 });
        }

        const categoryPlaceholders = lead.assigned_categories.map(() => '?').join(',');

        // Ensure the activity belongs to one of their assigned categories
        const [actCheck]: any = await pool.execute(`
            SELECT id, code, title FROM activity_catalogue
            WHERE code = ? AND category IN (${categoryPlaceholders})
        `, [id, ...lead.assigned_categories]);

        if (actCheck.length === 0) {
             return NextResponse.json({ message: 'Activity not found or not in your assigned categories' }, { status: 403 });
        }

        // Fetch ALL students enrolled in this activity
        const [rows] = await pool.execute(`
            SELECT ae.id, ae.username, s.name, ae.attendance_percentage, ae.attendance_marked
            FROM activity_enrollments ae
            JOIN students s ON ae.username = s.username
            WHERE ae.activity_code = ?
            ORDER BY s.name ASC
        `, [id]);

        return NextResponse.json({
            success: true,
            students: rows,
            activity: { code: actCheck[0].code, title: actCheck[0].title },
        });

    } catch (error: any) {
        console.error('Fetch attendance error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const lead = await checkLead();
        if (!lead) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        const { absentees } = await request.json(); // Array of usernames

        if (!lead.assigned_categories || lead.assigned_categories.length === 0) {
            return NextResponse.json({ message: 'No categories assigned' }, { status: 403 });
        }

        const categoryPlaceholders = lead.assigned_categories.map(() => '?').join(',');
        
        const [actCheck]: any = await pool.execute(`
            SELECT id FROM activity_catalogue 
            WHERE code = ? AND category IN (${categoryPlaceholders})
        `, [id, ...lead.assigned_categories]);
        
        if (actCheck.length === 0) {
             return NextResponse.json({ message: 'Activity not found or not in your assigned categories' }, { status: 403 });
        }

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
