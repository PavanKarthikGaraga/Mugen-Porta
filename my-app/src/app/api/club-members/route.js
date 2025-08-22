import pool  from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const clubId = searchParams.get('clubId');

        if (!clubId) {
            return NextResponse.json(
                { message: "Club ID is required" },
                { status: 400 }
            );
        }

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

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
