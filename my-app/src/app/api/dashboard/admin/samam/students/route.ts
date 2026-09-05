import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { clampInt, safeMessage } from '@/lib/apiSecurity';
import { getCouncilDomains } from '@/lib/councilScope';
import { getFacultyClubIds } from '@/lib/facultyScope';
import { getLeadClubIds } from '@/lib/leadScope';

async function checkAdmin(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || !['admin', 'faculty', 'council', 'lead'].includes(decoded.role)) return null;
    return decoded;
}

export async function GET(request: Request) {
    try {
        if (!await checkAdmin(request)) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = clampInt(searchParams.get('page'), { min: 1, max: 100000, fallback: 1 });
        const limit = clampInt(searchParams.get('limit'), { min: 1, max: 100, fallback: 20 });
        const search = (searchParams.get('search') || '').slice(0, 100);
        const level = (searchParams.get('level') || '').slice(0, 50);
        const year = (searchParams.get('year') || '').slice(0, 20);
        const branch = (searchParams.get('branch') || '').slice(0, 100);
        const offset = (page - 1) * limit;

        const conditions: string[] = [];
        const params: any[] = [];

        const admin = await checkAdmin(request);
        if (admin && admin.role === 'council') {
            const councilDomains = await getCouncilDomains(admin.username as string);
            if (councilDomains.length > 0) {
                const placeholders = councilDomains.map(() => '?').join(',');
                conditions.push(`s.clubId IN (SELECT id FROM clubs WHERE domain IN (${placeholders}))`);
                params.push(...councilDomains);
            } else {
                // If no domains mapped, return 0 students
                conditions.push('1 = 0');
            }
        } else if (admin && admin.role === 'faculty') {
            const facultyClubs = await getFacultyClubIds(admin.username as string);
            if (facultyClubs.length > 0) {
                const placeholders = facultyClubs.map(() => '?').join(',');
                conditions.push(`s.clubId IN (${placeholders})`);
                params.push(...facultyClubs);
            } else {
                conditions.push('1 = 0');
            }
        } else if (admin && admin.role === 'lead') {
            const leadClubs = await getLeadClubIds(admin.username as string);
            if (leadClubs.length > 0) {
                const placeholders = leadClubs.map(() => '?').join(',');
                conditions.push(`s.clubId IN (${placeholders})`);
                params.push(...leadClubs);
            } else {
                conditions.push('1 = 0');
            }
        }

        if (search) {
            conditions.push('(s.name LIKE ? OR s.username LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        if (level) { conditions.push('COALESCE(sp.level, "Explorer") = ?'); params.push(level); }
        if (year) { conditions.push('s.year = ?'); params.push(year); }
        if (branch) { conditions.push('s.branch = ?'); params.push(branch); }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // sdc_transactions and student_badges were both LEFT JOINed directly
        // to students -- with N transactions and M badges for the same
        // student, that's a fan-out to N*M rows, and SUM(t.credits) then
        // added each transaction's credits once per badge row instead of
        // once total. A student with 2 badges saw exactly double their real
        // points (confirmed: student's own dashboard, which aggregates
        // sdc_transactions alone with no such join, showed the correct
        // total). Pre-aggregating each table in its own subquery before
        // joining keeps every join 1:1 per username, so nothing multiplies.
        const [students] = await pool.execute(`
            SELECT
                s.username, s.name, s.branch, s.year, s.email,
                COALESCE(sp.level, 'Explorer') as level,
                COALESCE(sp.level_progress, 0) as level_progress,
                COALESCE(t.total_points, 0) as total_points,
                COALESCE(sb.badge_count, 0) as badge_count,
                NULLIF(GREATEST(
                    COALESCE(t.last_transaction, '1000-01-01'),
                    COALESCE(sp.updated_at, '1000-01-01')
                ), '1000-01-01') as last_activity
            FROM students s
            LEFT JOIN student_profiles sp ON s.username = sp.username
            LEFT JOIN (
                SELECT username, SUM(credits) as total_points, MAX(granted_at) as last_transaction
                FROM sdc_transactions
                GROUP BY username
            ) t ON s.username = t.username
            LEFT JOIN (
                SELECT username, COUNT(*) as badge_count
                FROM student_badges
                GROUP BY username
            ) sb ON s.username = sb.username
            ${where}
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
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch students') }, { status: 500 });
    }
}
