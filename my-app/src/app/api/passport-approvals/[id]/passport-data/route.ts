import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';

async function getUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded) return null;
    return decoded;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const role = user.role as string;
        const reviewerUsername = user.username as string;

        if (!['admin', 'faculty', 'lead'].includes(role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const [reqRows]: any = await pool.execute(
            `SELECT pvr.username, pvr.status, pvr.submitted_at, s.clubId
             FROM passport_verification_requests pvr
             JOIN students s ON pvr.username = s.username
             WHERE pvr.id = ?`,
            [id]
        );
        if (reqRows.length === 0) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        const req = reqRows[0];

        // Role-based access
        if (role === 'faculty') {
            const [facRows]: any = await pool.execute('SELECT assignedClubs FROM faculty WHERE username = ?', [reviewerUsername]);
            let clubs: string[] = [];
            try {
                clubs = Array.isArray(facRows[0]?.assignedClubs)
                    ? facRows[0].assignedClubs
                    : JSON.parse(facRows[0]?.assignedClubs ?? '[]');
            } catch { clubs = []; }
            if (!clubs.includes(req.clubId)) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
            }
        } else if (role === 'lead') {
            const [leadRows]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [reviewerUsername]);
            if (leadRows.length === 0 || leadRows[0].clubId !== req.clubId) {
                return NextResponse.json({ error: 'Access denied' }, { status: 403 });
            }
        }

        const studentUsername = req.username;

        // Fetch full profile
        const [profiles]: any = await pool.execute(`
            SELECT sp.*, s.name, s.branch, s.year AS student_year, s.email, s.selectedDomain
            FROM student_profiles sp
            LEFT JOIN students s ON sp.username = s.username
            WHERE sp.username = ?
        `, [studentUsername]);
        const profile = profiles[0] ?? null;

        // Fetch projects, internships, research, leadership, community, achievements
        const [[projects], [internships], [research], [leadership], [community], [achievements]]: any[] = await Promise.all([
            pool.execute('SELECT * FROM student_projects WHERE username = ? ORDER BY created_at DESC', [studentUsername]),
            pool.execute('SELECT * FROM student_internships WHERE username = ? ORDER BY created_at DESC', [studentUsername]),
            pool.execute('SELECT * FROM student_research WHERE username = ? ORDER BY created_at DESC', [studentUsername]),
            pool.execute('SELECT * FROM student_leadership WHERE username = ? ORDER BY created_at DESC', [studentUsername]),
            pool.execute('SELECT * FROM student_community WHERE username = ? ORDER BY created_at DESC', [studentUsername]),
            pool.execute('SELECT * FROM student_achievements WHERE username = ? ORDER BY created_at DESC', [studentUsername]),
        ]);

        return NextResponse.json({ profile, projects, internships, research, leadership, community, achievements });
    } catch (error: any) {
        console.error('Passport data error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch passport data') }, { status: 500 });
    }
}
