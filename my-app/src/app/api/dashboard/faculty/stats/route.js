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

        const { searchParams } = new URL(request.url);
        const clubId = searchParams.get('clubId');

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

        // If clubId is provided, verify faculty is assigned to it
        if (clubId && !assignedClubs.includes(clubId)) {
            return NextResponse.json(
                { error: 'You are not assigned to this club' },
                { status: 403 }
            );
        }

        // Use provided clubId or all assigned clubs
        const clubsToQuery = clubId ? [clubId] : assignedClubs;

        // Create placeholders for IN clause
        const placeholders = clubsToQuery.map(() => '?').join(',');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get total students across all assigned clubs
        const [totalStudentsResult] = await pool.execute(
            `SELECT COUNT(*) as count FROM students WHERE clubId IN (${placeholders})`,
            clubsToQuery
        );

        // Get recent registrations (last 30 days)
        const [recentRegistrationsResult] = await pool.execute(
            `SELECT COUNT(*) as count FROM students WHERE clubId IN (${placeholders}) AND created_at >= ?`,
            [...clubsToQuery, thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ')]
        );

        // Get year-wise count
        const [yearWiseResult] = await pool.execute(
            `SELECT year, COUNT(*) as count FROM students WHERE clubId IN (${placeholders}) GROUP BY year ORDER BY year`,
            clubsToQuery
        );

        // Get domain-wise count
        const [domainWiseResult] = await pool.execute(
            `SELECT selectedDomain, COUNT(*) as count FROM students WHERE clubId IN (${placeholders}) GROUP BY selectedDomain ORDER BY count DESC`,
            clubsToQuery
        );

        // Convert results to objects
        const yearWiseCount = {};
        yearWiseResult.forEach(row => {
            yearWiseCount[row.year] = row.count;
        });

        const domainWiseCount = {};
        domainWiseResult.forEach(row => {
            domainWiseCount[row.selectedDomain] = row.count;
        });

        const stats = {
            totalStudents: totalStudentsResult[0].count,
            recentRegistrations: recentRegistrationsResult[0].count,
            yearWiseCount,
            domainWiseCount
        };

        return NextResponse.json(stats);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to fetch faculty dashboard stats',
            details: error.message
        }, { status: 500 });
    }
}
