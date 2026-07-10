import pool from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * Registration Data API - Read Only
 *
 * This endpoint provides all data needed for the registration process:
 * - Clubs with their details
 * - Domain mappings
 */


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const clubId = searchParams.get('clubId');

        // If specific club member count is requested
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

        // Domain categories for reference
        const domains = [
            { id: "TEC", name: "Technical", description: "Technology and Engineering activities" },
            { id: "LCH", name: "Literary, Cultural & Heritage", description: "Arts, Literature and Cultural preservation" },
            { id: "ESO", name: "Extension & Social Outreach", description: "Community service and social initiatives" },
            { id: "IIE", name: "Innovation, Incubation & Entrepreneurship", description: "Startup and Innovation activities" },
            { id: "HWB", name: "Health & Well-being", description: "Health, fitness and wellness programs" }
        ];
        
        const registrationData = {
            clubs: enhancedClubs,
            domains: domains,
            metadata: {
                clubsCount: enhancedClubs.length,
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
