import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
    try {
        // Verify token and get user info
        const token = request.cookies.get('tck')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            );
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'faculty') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get faculty's assigned clubs
        const [facultyResult] = await pool.execute(
            'SELECT assignedClubs FROM faculty WHERE username = ?',
            [payload.username]
        );

        if (facultyResult.length === 0) {
            return NextResponse.json(
                { error: 'Faculty profile not found' },
                { status: 404 }
            );
        }

        const assignedClubsData = facultyResult[0].assignedClubs;
        const assignedClubs = assignedClubsData ? (Array.isArray(assignedClubsData) ? assignedClubsData : JSON.parse(assignedClubsData)) : [];

        if (assignedClubs.length === 0) {
            return NextResponse.json([]);
        }

        // Create placeholders for IN clause
        const placeholders = assignedClubs.map(() => '?').join(',');

        // Get only the assigned clubs
        const [clubsResult] = await pool.execute(
            `SELECT * FROM clubs WHERE id IN (${placeholders}) ORDER BY name`,
            assignedClubs
        );

        return NextResponse.json(clubsResult);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to fetch faculty clubs',
            details: error.message
        }, { status: 500 });
    }
}
