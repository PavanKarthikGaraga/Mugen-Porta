import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';

// Public, unauthenticated endpoint -- consumed cross-origin by the main SAC
// website. Only ever return aggregate counts here, never per-student rows
// (name/email/phone/username etc.), since this response is world-readable.
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
    // No cookie/session on a public cross-origin endpoint -- rate limit by
    // IP the same way the unauthenticated auth endpoints do, so it can't be
    // hammered/scraped without limit.
    const rateLimit = await checkRateLimit(request, 'public-stats', { limit: 60, windowMs: 60 * 1000 });
    if (rateLimit.limited) return rateLimit.response;

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

        // Get clubs by domain
        const [clubsByDomain] = await pool.execute(`
            SELECT domain, COUNT(*) as count
            FROM clubs
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

        // Per-club registration counts. LEFT JOIN so a club with zero
        // registrations still appears (as 0) rather than being omitted.
        const [clubWise] = await pool.execute(`
            SELECT c.id as clubId, c.name as clubName, c.domain, c.memberLimit,
                   COUNT(s.id) as registrations
            FROM clubs c
            LEFT JOIN students s ON s.clubId = c.id
            GROUP BY c.id, c.name, c.domain, c.memberLimit
            ORDER BY c.domain, registrations DESC
        `);

        const stats = {
            overview: {
                totalStudents: totalStudents[0].count,
                totalClubs: totalClubs[0].count
            },
            studentsByDomain: studentsByDomain,
            studentsByYear: studentsByYear,
            clubsByDomain: clubsByDomain,
            genderDistribution: genderStats,
            topStates: stateStats,
            clubWiseRegistrations: clubWise,
        };

        return NextResponse.json(
            { success: true, data: stats, generatedAt: new Date().toISOString() },
            {
                headers: {
                    ...CORS_HEADERS,
                    // Registration counts don't need to be real-time for an
                    // external site -- cache briefly to absorb repeated polling.
                    'Cache-Control': 'public, max-age=60, s-maxage=60',
                },
            }
        );

    } catch (error) {
        console.error('Error fetching public stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
