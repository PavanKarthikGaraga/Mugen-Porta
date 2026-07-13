import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function checkAdmin(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'faculty')) return null;
    return decoded;
}

export async function GET(request: Request) {
    try {
        if (!await checkAdmin(request)) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const level = searchParams.get('level') || '';
        const year = searchParams.get('year') || '';
        const branch = searchParams.get('branch') || '';
        const offset = (page - 1) * limit;

        const conditions: string[] = [];
        const params: any[] = [];

        if (search) {
            conditions.push('(s.name LIKE ? OR s.username LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        if (level) { conditions.push('COALESCE(sp.level, "Explorer") = ?'); params.push(level); }
        if (year) { conditions.push('s.year = ?'); params.push(year); }
        if (branch) { conditions.push('s.branch = ?'); params.push(branch); }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const [students] = await pool.execute(`
            SELECT
                s.username, s.name, s.branch, s.year, s.email,
                COALESCE(sp.level, 'Explorer') as level,
                COALESCE(sp.level_progress, 0) as level_progress,
                COALESCE(SUM(t.credits), 0) as total_points,
                COUNT(DISTINCT sb.id) as badge_count,
                MAX(t.granted_at) as last_activity
            FROM students s
            LEFT JOIN student_profiles sp ON s.username = sp.username
            LEFT JOIN sdc_transactions t ON s.username = t.username
            LEFT JOIN student_badges sb ON s.username = sb.username
            ${where}
            GROUP BY s.username, s.name, s.branch, s.year, s.email, sp.level, sp.level_progress
            ORDER BY total_points DESC
            LIMIT ${limit} OFFSET ${offset}
        `, params) as any[];

        const [countResult] = await pool.execute(`
            SELECT COUNT(DISTINCT s.username) as total
            FROM students s
            LEFT JOIN student_profiles sp ON s.username = sp.username
            ${where}
        `, params) as any[];

        return NextResponse.json({
            students,
            total: (countResult as any[])[0]?.total || 0,
            page,
            limit
        });

    } catch (error: any) {
        console.error('SAMAM students list error:', error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
