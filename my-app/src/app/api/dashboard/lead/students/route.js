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
        if (!payload || payload.role !== 'lead') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get lead's club ID
        const [leadResult] = await pool.execute(
            'SELECT clubId FROM leads WHERE username = ?',
            [payload.username]
        );

        if (leadResult.length === 0 || !leadResult[0].clubId) {
            return NextResponse.json(
                { error: 'No club assigned to this lead' },
                { status: 403 }
            );
        }

        const clubId = leadResult[0].clubId;

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const search = searchParams.get('search')?.trim() || '';
        const year = searchParams.get('year')?.trim() || '';
        const category = searchParams.get('category')?.trim() || '';

        const offset = (page - 1) * limit;

        try {
            let whereConditions = ['s.clubId = ?'];
            let queryParams = [clubId];

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
                    s.created_at
                FROM students s
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
            error: 'Failed to fetch lead students',
            details: error.message
        }, { status: 500 });
    }
}
