import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;
        if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

        // Check visibility: must be is_public=1 AND have an approved verification
        let isPublic = false;
        try {
            const [visRows] = await pool.execute(
                'SELECT is_public FROM student_profiles WHERE username = ?',
                [username]
            ) as any[];
            isPublic = !!(visRows as any[])[0]?.is_public;
        } catch (err: any) {
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                return NextResponse.json({ error: 'This passport is private' }, { status: 403 });
            }
            throw err;
        }

        if (!isPublic) {
            return NextResponse.json({ error: 'This passport is private' }, { status: 403 });
        }

        // Even if is_public=1, require an approved verification request
        try {
            const [verRows] = await pool.execute(
                'SELECT status FROM passport_verification_requests WHERE username = ?',
                [username]
            ) as any[];
            const verStatus = (verRows as any[])[0]?.status;
            if (verStatus !== 'approved') {
                return NextResponse.json({ error: 'This passport is pending verification' }, { status: 403 });
            }
        } catch {
            // If table doesn't exist yet, block access — verification required
            return NextResponse.json({ error: 'This passport is pending verification' }, { status: 403 });
        }

        // Fetch profile
        const [profiles] = await pool.execute(`
            SELECT sp.*, s.name, s.branch, s.year as student_year, s.email
            FROM student_profiles sp
            LEFT JOIN students s ON sp.username = s.username
            WHERE sp.username = ?
        `, [username]) as any[];

        const profile = (profiles as any[])[0];
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        if (!profile.name) {
            const [sRows] = await pool.execute('SELECT name FROM students WHERE username = ?', [username]) as any[];
            profile.name = (sRows as any[])[0]?.name || username;
        }

        const safeParse = (val: any) => {
            if (!val) return [];
            if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
            return val;
        };

        // Fetch all sections + stats in parallel
        const [
            [projects], [internships], [research], [leadership], [community], [achievements],
            [sdcRows], [actRows], [badgeRows], [badgeDetails],
        ] = await Promise.all([
            pool.execute('SELECT * FROM passport_projects WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username]),
            pool.execute('SELECT * FROM passport_internships WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username]),
            pool.execute('SELECT * FROM passport_research WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username]),
            pool.execute('SELECT * FROM passport_leadership WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username]),
            pool.execute('SELECT * FROM passport_community WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username]),
            pool.execute('SELECT * FROM passport_achievements WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username]),
            pool.execute('SELECT COALESCE(SUM(credits), 0) as total FROM sdc_transactions WHERE username = ?', [username]),
            pool.execute('SELECT COUNT(*) as count FROM activity_enrollments WHERE username = ?', [username]),
            pool.execute('SELECT COUNT(*) as count FROM student_badges WHERE username = ?', [username]),
            pool.execute(`SELECT bd.name, bd.icon, bd.domain, bd.rarity, bd.color, bd.bg_color, sb.issued_on
                          FROM student_badges sb JOIN badge_definitions bd ON sb.badge_id = bd.id
                          WHERE sb.username = ? ORDER BY sb.issued_on DESC LIMIT 12`, [username]),
        ] as any[]);

        return NextResponse.json({
            profile: { ...profile, skills: safeParse(profile.skills) },
            projects,
            internships: (internships as any[]).map(i => ({ ...i, skills: safeParse(i.skills) })),
            research: (research as any[]).map(r => ({ ...r, co_authors: safeParse(r.co_authors) })),
            leadership,
            community,
            achievements,
            timeline: safeParse(profile.timeline),
            badges: badgeDetails,
            stats: {
                sdc_total: Number((sdcRows as any[])[0]?.total) || 0,
                activities_count: Number((actRows as any[])[0]?.count) || 0,
                badges_count: Number((badgeRows as any[])[0]?.count) || 0,
            },
        });

    } catch (error: any) {
        console.error('Public passport GET error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
