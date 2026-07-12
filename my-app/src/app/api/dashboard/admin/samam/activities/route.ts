import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') return null;
    return decoded;
}

export async function GET(request: Request) {
    try {
        if (!await checkAdmin()) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const domain = searchParams.get('domain') || '';
        const search = searchParams.get('search') || '';

        const conditions: string[] = [];
        const params: any[] = [];

        if (domain) { conditions.push('a.domain = ?'); params.push(domain); }
        if (search) { conditions.push('a.title LIKE ?'); params.push(`%${search}%`); }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const [rows] = await pool.execute(`
            SELECT a.id, a.title, a.description, a.domain, a.activity_type,
                   a.sdc_credits as points, a.max_participants, a.is_active,
                   a.created_at,
                   COUNT(DISTINCT t.username) as participant_count
            FROM student_activities a
            LEFT JOIN sdc_transactions t ON t.activity_id = a.id
            ${where}
            GROUP BY a.id
            ORDER BY a.created_at DESC
        `, params);

        return NextResponse.json({ activities: rows });

    } catch (error: any) {
        console.error('Activities list error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { title, description, domain, activity_type, points, max_participants } = await request.json();

        if (!title || !domain || !points) {
            return NextResponse.json({ message: 'Title, domain and points are required' }, { status: 400 });
        }

        const [result] = await pool.execute(`
            INSERT INTO student_activities (title, description, domain, activity_type, sdc_credits, max_participants, is_active, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, NOW())
        `, [title, description || '', domain, activity_type || 'event', points, max_participants || null, admin.username || 'admin']);

        const insertId = (result as any).insertId;
        return NextResponse.json({ success: true, id: insertId, message: 'Activity created successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('Create activity error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
