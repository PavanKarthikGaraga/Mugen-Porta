import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser, safeMessage } from '@/lib/apiSecurity';

export async function GET(request, { params }) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json({ message: "Authentication required" }, { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Club ID is required" },
                { status: 400 }
            );
        }

        // Fetch club data
        const [clubData] = await pool.execute(
            'SELECT * FROM clubs WHERE id = ?',
            [id]
        );

        if (clubData.length === 0) {
            return NextResponse.json(
                { message: "Club not found" },
                { status: 404 }
            );
        }

        const club = clubData[0];

        // Get member count for this club
        const [memberCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM students WHERE clubId = ?',
            [id]
        );

        const clubWithMemberCount = {
            ...club,
            memberCount: memberCount[0].count,
            availableSpots: Math.max(0, club.memberLimit - memberCount[0].count)
        };

        return NextResponse.json(clubWithMemberCount);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: safeMessage(error, 'Failed to fetch club data')
        }, { status: 500 });
    }
}
