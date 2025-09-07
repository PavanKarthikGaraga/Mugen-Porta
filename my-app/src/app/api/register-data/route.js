import pool from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * Registration Data API - Read Only
 * 
 * This endpoint provides all data needed for the registration process:
 * - Clubs with their details
 * - Projects with their details
 * - Domain mappings
 */


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const clubId = searchParams.get('clubId');
        const projectId = searchParams.get('projectId');
        
        // If specific club or project member count is requested
        if (clubId) {
            // Get current member count and club limit
            const [memberResult] = await pool.execute(
                "SELECT COUNT(*) as memberCount FROM students WHERE clubId = ?",
                [clubId]
            );

            const [clubResult] = await pool.execute(
                "SELECT memberLimit FROM clubs WHERE id = ?",
                [clubId]
            );

            const currentMembers = memberResult[0].memberCount;
            const memberLimit = clubResult[0]?.memberLimit || 50; // Default to 50 if not found

            return NextResponse.json({
                currentMembers,
                memberLimit,
                availableSpots: memberLimit - currentMembers
            });
        }
        
        if (projectId) {
            // Get the current member count for the project
            const [result] = await pool.execute(
                'SELECT COUNT(*) as memberCount FROM students WHERE projectId = ?',
                [projectId]
            );

            return NextResponse.json({
                success: true,
                projectId: projectId,
                memberCount: result[0].memberCount
            });
        }
        
        // Default: Return all registration data
        
        // Fetch clubs
        const [clubs] = await pool.execute('SELECT * FROM clubs ORDER BY id');

        // Get member counts for all clubs
        const clubIds = clubs.map(c => c.id);
        let clubMemberCounts = {};

        if (clubIds.length > 0) {
            const placeholders = clubIds.map(() => '?').join(',');
            const [memberCounts] = await pool.execute(
                `SELECT clubId, COUNT(*) as memberCount
                 FROM students
                 WHERE clubId IN (${placeholders})
                 GROUP BY clubId`,
                clubIds
            );

            // Convert to object for easy lookup
            clubMemberCounts = memberCounts.reduce((acc, count) => {
                acc[count.clubId] = count.memberCount;
                return acc;
            }, {});
        }

        // Return clubs with member counts and availability status
        const enhancedClubs = clubs.map(club => {
            const memberCount = clubMemberCounts[club.id] || 0;
            const isFull = memberCount >= club.memberLimit;

            return {
                ...club,
                memberCount: memberCount,
                isFull: isFull,
                availableSpots: Math.max(0, club.memberLimit - memberCount)
            };
        });
        
        // Fetch projects with club information
        const [projects] = await pool.execute(`
            SELECT p.*, c.name as clubName
            FROM projects p
            LEFT JOIN clubs c ON p.clubId = c.id
            ORDER BY p.id
        `);

        // Get member counts for all projects
        const projectIds = projects.map(p => p.id);
        let projectMemberCounts = {};

        if (projectIds.length > 0) {
            const placeholders = projectIds.map(() => '?').join(',');
            const [memberCounts] = await pool.execute(
                `SELECT projectId, COUNT(*) as memberCount
                 FROM students
                 WHERE projectId IN (${placeholders})
                 GROUP BY projectId`,
                projectIds
            );

            // Convert to object for easy lookup
            projectMemberCounts = memberCounts.reduce((acc, count) => {
                acc[count.projectId] = count.memberCount;
                return acc;
            }, {});
        }

        // Return projects with member counts and availability status
        const enhancedProjects = projects.map(project => {
            const memberCount = projectMemberCounts[project.id] || 0;
            const isTecProject = project.domain === 'TEC';
            const isFull = isTecProject && memberCount >= 2;

            return {
                ...project,
                images: [],
                hasImages: false,
                memberCount: memberCount,
                isFull: isFull,
                maxMembers: isTecProject ? 2 : null,
                availableSpots: isTecProject ? Math.max(0, 2 - memberCount) : null
            };
        });
        
        // Domain categories for reference
        const domains = [
            { id: "TEC", name: "Technical", description: "Technology and Engineering projects" },
            { id: "LCH", name: "Literary, Cultural & Heritage", description: "Arts, Literature and Cultural preservation" },
            { id: "ESO", name: "Extension & Social Outreach", description: "Community service and social initiatives" },
            { id: "IIE", name: "Innovation, Incubation & Entrepreneurship", description: "Startup and Innovation projects" },
            { id: "HWB", name: "Health & Well-being", description: "Health, fitness and wellness programs" },
            { id: "Rural", name: "Rural Mission", description: "Rural development and community projects" }
        ];
        
        const registrationData = {
            clubs: enhancedClubs,
            projects: enhancedProjects,
            domains: domains,
            metadata: {
                clubsCount: enhancedClubs.length,
                projectsCount: enhancedProjects.length,
                timestamp: new Date().toISOString()
            }
        };
        
        const response = NextResponse.json(registrationData);
        
        // Add security headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        
        return response;
        
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch registration data',
            details: error.message 
        }, { status: 500 });
    }
}

// Explicitly block write operations
export async function POST() {
    return NextResponse.json({ 
        error: 'Method not allowed. This is a read-only endpoint for registration data.' 
    }, { status: 405 });
}

export async function PUT() {
    return NextResponse.json({ 
        error: 'Method not allowed. This is a read-only endpoint for registration data.' 
    }, { status: 405 });
}

export async function DELETE() {
    return NextResponse.json({ 
        error: 'Method not allowed. This is a read-only endpoint for registration data.' 
    }, { status: 405 });
}
