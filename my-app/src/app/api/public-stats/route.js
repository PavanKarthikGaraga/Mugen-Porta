import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        // Get total students count
        const [totalStudents] = await pool.execute(
            'SELECT COUNT(*) as count FROM students'
        );

        // Get students by domain
        const [studentsByDomain] = await pool.execute(`
            SELECT selectedDomain, COUNT(*) as count
            FROM students
            GROUP BY selectedDomain
            ORDER BY count DESC
        `);

        // Get students by year
        const [studentsByYear] = await pool.execute(`
            SELECT year, COUNT(*) as count
            FROM students
            GROUP BY year
            ORDER BY year
        `);

        // Get total clubs count
        const [totalClubs] = await pool.execute(
            'SELECT COUNT(*) as count FROM clubs'
        );

        // Get total projects count
        const [totalProjects] = await pool.execute(
            'SELECT COUNT(*) as count FROM projects'
        );

        // Get clubs by domain
        const [clubsByDomain] = await pool.execute(`
            SELECT domain, COUNT(*) as count
            FROM clubs
            GROUP BY domain
            ORDER BY count DESC
        `);

        // Get active projects count
        const [activeProjects] = await pool.execute(
            'SELECT COUNT(*) as count FROM projects WHERE status = "active"'
        );

        // Get projects by domain
        const [projectsByDomain] = await pool.execute(`
            SELECT domain, COUNT(*) as count
            FROM projects
            WHERE status = 'active'
            GROUP BY domain
            ORDER BY count DESC
        `);

        // Get gender distribution
        const [genderStats] = await pool.execute(`
            SELECT gender, COUNT(*) as count
            FROM students
            GROUP BY gender
            ORDER BY count DESC
        `);

        // Get state-wise distribution (top 10)
        const [stateStats] = await pool.execute(`
            SELECT state, COUNT(*) as count
            FROM students
            GROUP BY state
            ORDER BY count DESC
            LIMIT 10
        `);

        const stats = {
            overview: {
                totalStudents: totalStudents[0].count,
                totalClubs: totalClubs[0].count,
                totalProjects: totalProjects[0].count,
                activeProjects: activeProjects[0].count
            },
            studentsByDomain: studentsByDomain,
            studentsByYear: studentsByYear,
            clubsByDomain: clubsByDomain,
            projectsByDomain: projectsByDomain,
            genderDistribution: genderStats,
            topStates: stateStats
        };

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching public stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
