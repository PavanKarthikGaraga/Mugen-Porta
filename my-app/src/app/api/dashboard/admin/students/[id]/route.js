import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdminToken } from '../../auth-helper';

export async function GET(request, { params }) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    const { id } = await params;

    try {
        const query = `
            SELECT 
                s.*,
                c.name as clubName,
                c.description as clubDescription,
                u.role as userRole
            FROM students s
            LEFT JOIN clubs c ON s.clubId = c.id
            LEFT JOIN users u ON s.username = u.username
            WHERE s.id = ?
        `;

        const [students] = await pool.execute(query, [id]);

        if (students.length === 0) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: students[0]
        });

    } catch (error) {
        console.error('Error fetching student:', error);
        return NextResponse.json(
            { error: 'Failed to fetch student details' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const {
            name,
            email,
            branch,
            gender,
            cluster,
            year,
            phoneNumber,
            residenceType,
            hostelName,
            busRoute,
            country,
            state,
            district,
            pincode,
            selectedDomain,
            socialInternshipId,
            projectId,
            clubId
        } = body;

        // First check if student exists
        const [existingStudent] = await pool.execute(
            'SELECT id FROM students WHERE id = ?',
            [id]
        );

        if (existingStudent.length === 0) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Update student
        const updateQuery = `
            UPDATE students 
            SET 
                name = ?,
                email = ?,
                branch = ?,
                gender = ?,
                cluster = ?,
                year = ?,
                phoneNumber = ?,
                residenceType = ?,
                hostelName = ?,
                busRoute = ?,
                country = ?,
                state = ?,
                district = ?,
                pincode = ?,
                selectedDomain = ?,
                socialInternshipId = ?,
                clubId = ?
            WHERE id = ?
        `;

        await pool.execute(updateQuery, [
            name,
            email,
            branch,
            gender,
            cluster,
            year,
            phoneNumber,
            residenceType,
            hostelName || 'N/A',
            busRoute,
            country || 'IN',
            state,
            district,
            pincode,
            selectedDomain,
            socialInternshipId,
            clubId,
            id
        ]);

        // Also update the users table
        await pool.execute(
            'UPDATE users SET name = ?, email = ? WHERE username = (SELECT username FROM students WHERE id = ?)',
            [name, email, id]
        );

        return NextResponse.json({
            success: true,
            message: 'Student updated successfully'
        });

    } catch (error) {
        console.error('Error updating student:', error);
        return NextResponse.json(
            { error: 'Failed to update student' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    const { id } = await params;

    try {
        // First check if student exists
        const [existingStudent] = await pool.execute(
            'SELECT username FROM students WHERE id = ?',
            [id]
        );

        if (existingStudent.length === 0) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        const username = existingStudent[0].username;

        // Delete student (this will cascade delete due to foreign key constraints)
        await pool.execute('DELETE FROM students WHERE id = ?', [id]);
        
        // Also delete from users table
        await pool.execute('DELETE FROM users WHERE username = ?', [username]);

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
