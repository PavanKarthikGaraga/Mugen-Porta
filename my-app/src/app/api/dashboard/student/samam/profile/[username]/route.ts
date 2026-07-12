import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;

        if (!username) {
            return NextResponse.json({ message: "Username is required" }, { status: 400 });
        }

        // Fetch student base data + SAMAM extended profile
        const [studentData] = await pool.execute(
            `SELECT
                s.username, s.name, s.email, s.branch, s.year, s.gender, s.residenceType,
                sp.tagline, sp.about, sp.linkedin_url, sp.github_url, sp.portfolio_url, sp.resume_url,
                sp.level, sp.level_progress, sp.next_level, sp.career_choice, sp.cgpa, sp.graduation_year,
                c.name as clubName
             FROM students s
             LEFT JOIN student_profiles sp ON s.username = sp.username
             LEFT JOIN clubs c ON s.clubId = c.id
             WHERE s.username = ?`,
            [username]
        ) as any[];

        if (studentData.length === 0) {
            return NextResponse.json({ message: "Student not found" }, { status: 404 });
        }

        const student = studentData[0];

        // Format response, providing fallbacks if sp was null
        return NextResponse.json({
            username: student.username,
            name: student.name,
            email: student.email,
            branch: student.branch,
            year: student.year,
            clubName: student.clubName,
            samam: {
                tagline: student.tagline || 'Student at KL University',
                about: student.about || '',
                links: {
                    linkedin: student.linkedin_url || '',
                    github: student.github_url || '',
                    portfolio: student.portfolio_url || '',
                    resume: student.resume_url || ''
                },
                level: student.level || 'Explorer',
                levelProgress: student.level_progress || 0,
                nextLevel: student.next_level || 'Foundation',
                careerChoice: student.career_choice || '',
                cgpa: student.cgpa || 0,
                graduationYear: student.graduation_year || ''
            }
        });

    } catch (error: any) {
        console.error('Database error fetching SAMAM profile:', error);
        return NextResponse.json({ error: 'Failed to fetch SAMAM profile', details: error.message }, { status: 500 });
    }
}
