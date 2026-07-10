import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const clubId = searchParams.get('clubId');

        if (!clubId) {
            return NextResponse.json(
                { error: 'Club ID is required' },
                { status: 400 }
            );
        }

        // Get total students in the club
        const [totalStudentsResult] = await pool.execute(
            'SELECT COUNT(*) as count FROM students WHERE clubId = ?',
            [clubId]
        );

        // Get recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [recentRegistrationsResult] = await pool.execute(
            'SELECT COUNT(*) as count FROM students WHERE clubId = ? AND created_at >= ?',
            [clubId, thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ')]
        );

        // Get year-wise count
        const [yearWiseResult] = await pool.execute(
            'SELECT year, COUNT(*) as count FROM students WHERE clubId = ? GROUP BY year ORDER BY year',
            [clubId]
        );

        // Get domain-wise count
        const [domainWiseResult] = await pool.execute(
            'SELECT selectedDomain, COUNT(*) as count FROM students WHERE clubId = ? GROUP BY selectedDomain ORDER BY count DESC',
            [clubId]
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
            error: 'Failed to fetch lead dashboard stats',
            details: error.message
        }, { status: 500 });
    }
}
