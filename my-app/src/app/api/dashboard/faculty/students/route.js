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
            return NextResponse.json({
                success: true,
                data: {
                    students: [],
                    pagination: {
                        page: 1,
                        limit: 50,
                        total: 0,
                        pages: 0
                    }
                }
            });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const search = searchParams.get('search')?.trim() || '';
        const year = searchParams.get('year')?.trim() || '';
        const category = searchParams.get('category')?.trim() || '';
        const clubId = searchParams.get('clubId')?.trim() || '';

        const offset = (page - 1) * limit;

        try {
            let whereConditions = [`s.clubId IN (${assignedClubs.map(() => '?').join(',')})`];
            let queryParams = [...assignedClubs];

            // Add specific club filter if provided
            if (clubId && assignedClubs.includes(clubId)) {
                whereConditions = ['s.clubId = ?'];
                queryParams = [clubId];
            }

            // Build search conditions
            if (search && search.length > 0) {
                whereConditions.push('(s.name LIKE ? OR s.email LIKE ? OR s.username LIKE ?)');
                queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            if (year && year.length > 0) {
                whereConditions.push('s.year = ?');
                queryParams.push(year);
            }

            if (category && category.length > 0) {
                whereConditions.push('s.selectedDomain = ?');
                queryParams.push(category);
            }

            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM students s ${whereClause}`;

            const [countResult] = await pool.execute(countQuery, queryParams);
            const total = countResult[0].total;

            // Get students data
            const studentsQuery = `
                SELECT
                    s.id,
                    s.username,
                    s.name,
                    s.year,
                    s.branch,
                    s.phoneNumber,
                    s.selectedDomain,
                    s.clubId,
                    c.name as clubName,
                    s.created_at
                FROM students s
                LEFT JOIN clubs c ON s.clubId = c.id
                ${whereClause}
                ORDER BY s.created_at DESC
                LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
            `;

            const [students] = await pool.execute(studentsQuery, queryParams);

            return NextResponse.json({
                success: true,
                data: {
                    students,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching students:', error);
            return NextResponse.json(
                { error: 'Failed to fetch students' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to fetch faculty students',
            details: error.message
        }, { status: 500 });
    }
}
