import { getCouncilDomains } from '@/lib/councilScope';
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
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'faculty' && decoded.role !== 'council')) return null;
    return decoded;
}

async function isAuthorizedForActivity(user: any, activityCode: string): Promise<boolean> {
    if (user.role !== 'council') return true;
    const councilDomains = await getCouncilDomains(user.username);
    
    if (councilDomains.length === 0) return false;
    
    const [rows] = await pool.execute('SELECT domain FROM activity_catalogue WHERE code = ?', [activityCode]);
    if ((rows as any[]).length === 0) return true; // Let 404 handle it
    
    return councilDomains.includes((rows as any[])[0].domain);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await checkAdmin();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const { id } = await params;
        
        if (!await isAuthorizedForActivity(user, id)) {
            return NextResponse.json({ message: 'Unauthorized domain' }, { status: 403 });
        }

        const [rows] = await pool.execute(`
            SELECT * FROM activity_catalogue WHERE code = ?
        `, [id]);

        if ((rows as any[]).length === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        const activity = (rows as any[])[0];
        // Parse JSON fields
        ['sdgs', 'learning_outcomes', 'competencies', 'graduate_attributes', 'resources', 'assignments', 'timeline'].forEach(field => {
            if (activity[field] && typeof activity[field] === 'string') {
                try { activity[field] = JSON.parse(activity[field]); } catch(e) {}
            }
        });

        return NextResponse.json(activity);
    } catch (error: any) {
        console.error('Get activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await checkAdmin();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        
        if (!await isAuthorizedForActivity(user, id)) {
            return NextResponse.json({ message: 'Unauthorized domain' }, { status: 403 });
        }

        const body = await request.json();
        const {
            code, title, description, domain, category, points, max_participants, status,
            difficulty, activity_pack, faculty_name, sdgs, hours,
            purpose, learning_outcomes, competencies, graduate_attributes, resources, assignments, timeline
        } = body;
        
        if (user.role === 'council') {
            const councilDomains = await getCouncilDomains(user.username);
            if (!councilDomains.includes(domain)) {
                return NextResponse.json({ message: 'Unauthorized domain modification' }, { status: 403 });
            }
        }

        const safeJson = (val: any) => val != null ? JSON.stringify(val) : null;

        const [result] = await pool.execute(`
            UPDATE activity_catalogue
            SET code = ?, title = ?, description = ?, domain = ?, category = ?,
                sdc_credits = ?, max_seats = ?, status = ?,
                difficulty = ?, activity_pack = ?,
                faculty_name = ?, sdgs = ?, hours = ?,
                purpose = ?, learning_outcomes = ?, competencies = ?,
                graduate_attributes = ?, resources = ?, assignments = ?, timeline = ?
            WHERE code = ?
        `, [
            code, title, description, domain, category,
            points, max_participants, status,
            difficulty, activity_pack,
            faculty_name, safeJson(sdgs), hours,
            purpose, safeJson(learning_outcomes), safeJson(competencies),
            safeJson(graduate_attributes), safeJson(resources), safeJson(assignments), safeJson(timeline),
            id
        ]);

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Activity updated' });

    } catch (error: any) {
        console.error('Update activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await checkAdmin();
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        
        if (!await isAuthorizedForActivity(user, id)) {
            return NextResponse.json({ message: 'Unauthorized domain' }, { status: 403 });
        }

        const [result] = await pool.execute('DELETE FROM activity_catalogue WHERE code = ?', [id]);

        if ((result as any).affectedRows === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Activity deleted' });

    } catch (error: any) {
        console.error('Delete activity error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}
