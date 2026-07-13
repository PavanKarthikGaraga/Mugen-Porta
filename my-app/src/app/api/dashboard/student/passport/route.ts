import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function checkStudent() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'student') return null;
    return decoded;
}

export async function GET(request: Request) {
    try {
        const student = await checkStudent();
        if (!student) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const username = student.username;

        // Fetch basic profile and real name
        const [profiles] = await pool.execute(`
            SELECT sp.*, s.name 
            FROM student_profiles sp 
            LEFT JOIN students s ON sp.username = s.username 
            WHERE sp.username = ?
        `, [username] as string[]);
        const profile = (profiles as any)[0] || { username };

        if (!profile.name) {
            const [studentRows] = await pool.execute('SELECT name FROM students WHERE username = ?', [username] as string[]);
            profile.name = (studentRows as any)[0]?.name || username;
        }

        // Fetch other sections
        const [projects] = await pool.execute('SELECT * FROM passport_projects WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username] as string[]);
        const [internships] = await pool.execute('SELECT * FROM passport_internships WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username] as string[]);
        const [research] = await pool.execute('SELECT * FROM passport_research WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username] as string[]);
        const [leadership] = await pool.execute('SELECT * FROM passport_leadership WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username] as string[]);
        const [community] = await pool.execute('SELECT * FROM passport_community WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username] as string[]);
        const [achievements] = await pool.execute('SELECT * FROM passport_achievements WHERE username = ? ORDER BY sort_order ASC, created_at DESC', [username] as string[]);

        return NextResponse.json({
            profile: {
                ...profile,
                skills: profile.skills ? JSON.parse(profile.skills) : [],
            },
            projects,
            internships: (internships as any).map((i: any) => ({ ...i, skills: i.skills ? JSON.parse(i.skills) : [] })),
            research: (research as any).map((r: any) => ({ ...r, co_authors: r.co_authors ? JSON.parse(r.co_authors) : [] })),
            leadership,
            community,
            achievements,
            timeline: profile.timeline ? JSON.parse(profile.timeline) : []
        });

    } catch (error: any) {
        console.error('Passport GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const student = await checkStudent();
        if (!student) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const username = student.username;

        const body = await request.json();
        const { profile, projects, internships, research, leadership, community, achievements, timeline } = body;

        const conn = await pool.getConnection();
        await conn.beginTransaction();

        try {
            // 1. Update Profile & Timeline
            if (profile || timeline !== undefined) {
                const sp_profile = profile || {};
                const skillsJson = sp_profile.skills ? JSON.stringify(sp_profile.skills) : null;
                const timelineJson = timeline !== undefined ? JSON.stringify(timeline) : null;
                
                await conn.execute(`
                    INSERT INTO student_profiles (username, tagline, about, linkedin_url, github_url, portfolio_url, cgpa, graduation_year, skills, banner_url, avatar_url, timeline)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        tagline = VALUES(tagline), about = VALUES(about), linkedin_url = VALUES(linkedin_url),
                        github_url = VALUES(github_url), portfolio_url = VALUES(portfolio_url), cgpa = VALUES(cgpa),
                        graduation_year = VALUES(graduation_year), skills = VALUES(skills),
                        banner_url = VALUES(banner_url), avatar_url = VALUES(avatar_url), timeline = COALESCE(VALUES(timeline), timeline)
                `, [
                    username, sp_profile.tagline || null, sp_profile.about || null, sp_profile.linkedin_url || null,
                    sp_profile.github_url || null, sp_profile.portfolio_url || null, sp_profile.cgpa || null,
                    sp_profile.graduation_year || null, skillsJson, sp_profile.banner_url || null, sp_profile.avatar_url || null, timelineJson
                ] as string[]);
            }

            // A helper to sync arrays: delete existing and insert new
            const syncTable = async (tableName: string, items: any[], insertQuery: string, mapFn: (item: any, idx: number) => any[]) => {
                await conn.execute(`DELETE FROM ${tableName} WHERE username = ?`, [username] as string[]);
                for (let i = 0; i < items.length; i++) {
                    await conn.execute(insertQuery, mapFn(items[i], i));
                }
            };

            // 2. Projects
            if (projects) {
                await syncTable('passport_projects', projects, 
                    'INSERT INTO passport_projects (username, name, description, tech_stack, github_url, demo_url, project_year, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    (p, i) => [username, p.name, p.description, JSON.stringify(p.tech_stack || []), p.github_url, p.demo_url, p.project_year, p.status || 'ongoing', i]
                );
            }

            // 3. Internships
            if (internships) {
                await syncTable('passport_internships', internships,
                    'INSERT INTO passport_internships (username, company, role, duration, location, description, skills, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    (p, i) => [username, p.company, p.role, p.duration, p.location, p.description, JSON.stringify(p.skills || []), i]
                );
            }

            // 4. Research
            if (research) {
                await syncTable('passport_research', research,
                    'INSERT INTO passport_research (username, title, journal, publication_year, co_authors, status, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    (r, i) => [username, r.title, r.journal, r.publication_year, JSON.stringify(r.co_authors || []), r.status || 'under_review', i]
                );
            }

            // 5. Leadership
            if (leadership) {
                await syncTable('passport_leadership', leadership,
                    'INSERT INTO passport_leadership (username, role, organisation, period, impact, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
                    (l, i) => [username, l.role, l.organisation, l.period, l.impact, i]
                );
            }

            // 6. Community
            if (community) {
                await syncTable('passport_community', community,
                    'INSERT INTO passport_community (username, activity, hours_spent, impact, sort_order) VALUES (?, ?, ?, ?, ?)',
                    (c, i) => [username, c.activity, c.hours_spent || 0, c.impact, i]
                );
            }

            // 7. Achievements
            if (achievements) {
                await syncTable('passport_achievements', achievements,
                    'INSERT INTO passport_achievements (username, title, organisation, achievement_year, sort_order) VALUES (?, ?, ?, ?, ?)',
                    (a, i) => [username, a.title, a.organisation, a.achievement_year, i]
                );
            }

            await conn.commit();
            conn.release();

            return NextResponse.json({ success: true, message: 'Passport updated successfully' });

        } catch (err: any) {
            await conn.rollback();
            conn.release();
            throw err;
        }

    } catch (error: any) {
        console.error('Passport PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
