import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdminToken } from '../auth-helper';

export async function GET(request) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const search = searchParams.get('search')?.trim() || '';
    const domain = searchParams.get('domain')?.trim() || '';
    const year = searchParams.get('year')?.trim() || '';
    const residenceType = searchParams.get('residenceType')?.trim() || '';
    const clubId = searchParams.get('clubId')?.trim() || '';

    const offset = (page - 1) * limit;

    try {
        let whereConditions = [];
        let queryParams = [];

        // Build search conditions - only add if values are not empty
        if (search && search.length > 0) {
            whereConditions.push('(s.name LIKE ? OR s.email LIKE ? OR s.username LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (domain && domain.length > 0) {
            whereConditions.push('s.selectedDomain = ?');
            queryParams.push(domain);
        }

        if (year && year.length > 0) {
            whereConditions.push('s.year = ?');
            queryParams.push(year);
        }

        if (residenceType && residenceType.length > 0) {
            whereConditions.push('s.residenceType = ?');
            queryParams.push(residenceType);
        }

        if (clubId && clubId.length > 0) {
            whereConditions.push('c.name = ?');
            queryParams.push(clubId);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM students s 
            ${whereClause}
        `;
        
        const [countResult] = await pool.execute(countQuery, queryParams);
        const total = countResult[0].total;

        // Get students data with joins
        const studentsQuery = `
            SELECT 
                s.id,
                s.username,
                s.name,
                s.gender,
                s.cluster,
                s.year,
                s.phoneNumber,
                s.residenceType,
                s.hostelName,
                s.busRoute,
                s.country,
                s.state,
                s.district,
                s.pincode,
                s.selectedDomain,
                s.socialInternshipId,
                s.created_at,
                s.projectId,
                s.clubId,
                p.name as projectName,
                c.name as clubName
            FROM students s
            LEFT JOIN projects p ON s.projectId = p.id
            LEFT JOIN clubs c ON s.clubId = c.id
            ${whereClause}
            ORDER BY s.created_at DESC
            LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;

        const [students] = await pool.execute(studentsQuery, queryParams);

        // Get statistics
        const statsQuery = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN selectedDomain = 'TEC' THEN 1 END) as tec,
                COUNT(CASE WHEN selectedDomain = 'LCH' THEN 1 END) as lch,
                COUNT(CASE WHEN selectedDomain = 'ESO' THEN 1 END) as eso,
                COUNT(CASE WHEN selectedDomain = 'IIE' THEN 1 END) as iie,
                COUNT(CASE WHEN selectedDomain = 'HWB' THEN 1 END) as hwb,
                COUNT(CASE WHEN selectedDomain = 'Rural' THEN 1 END) as rural
            FROM students
        `;

        const [stats] = await pool.execute(statsQuery);

        // Get club statistics
        const clubStatsQuery = `
            SELECT 
                c.name as clubName,
                COUNT(s.id) as memberCount
            FROM clubs c
            LEFT JOIN students s ON c.id = s.clubId
            GROUP BY c.id, c.name
            ORDER BY memberCount DESC
        `;

        const [clubStats] = await pool.execute(clubStatsQuery);

        return NextResponse.json({
            success: true,
            data: {
                students,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                stats: stats[0],
                clubStats
            }
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { error: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('id');

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            );
        }

        // First check if student exists
        const [existingStudent] = await pool.execute(
            'SELECT id FROM students WHERE id = ?',
            [studentId]
        );

        if (existingStudent.length === 0) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Delete student (this will also delete from users table due to foreign key)
        await pool.execute('DELETE FROM students WHERE id = ?', [studentId]);

        return NextResponse.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting student:', error);
        return NextResponse.json(
            { error: 'Failed to delete student' },
            { status: 500 }
        );
    }
}