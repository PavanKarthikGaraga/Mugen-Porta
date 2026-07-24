import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function getLeadClubData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'lead') return null;

    // Get club name
    const [leadResult]: any = await pool.execute(
        'SELECT l.clubId, c.name as clubName FROM leads l LEFT JOIN clubs c ON l.clubId = c.id WHERE l.username = ?',
        [decoded.username as string]
    );

    if (leadResult.length > 0 && leadResult[0].clubName) {
        return { decoded, clubName: leadResult[0].clubName };
    }
    return null;
}

export async function GET(request: Request) {
    try {
        const leadData = await getLeadClubData();
        if (!leadData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const { clubName } = leadData;

        const conditions: string[] = ['category LIKE ?'];
        const params: any[] = [`%${clubName}%`];

        if (search) { 
            conditions.push('(title LIKE ? OR code LIKE ?)'); 
            params.push(`%${search}%`, `%${search}%`); 
        }

        const where = `WHERE ${conditions.join(' AND ')}`;

        const [rows] = await pool.execute(`
            SELECT id, code, title, description, domain, category,
                   sdc_credits as points, max_seats as max_participants, status,
                   difficulty, journey_level, activity_pack, faculty_name, sdgs, hours,
                   created_at
            FROM activity_catalogue
            ${where}
            ORDER BY created_at DESC
        `, params);

        return NextResponse.json({ activities: rows });

    } catch (error: any) {
        console.error('Activities list error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
