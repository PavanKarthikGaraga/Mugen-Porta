import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdminToken } from '../../auth-helper';

export async function POST(request) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const body = await request.json();
        const { username, clubId } = body;

        // Validate required fields
        if (!username || !clubId) {
            return NextResponse.json(
                { error: 'Username and clubId are required' },
                { status: 400 }
            );
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Check if student exists and get their details
            const [studentResult] = await connection.execute(
                'SELECT name, email, phoneNumber, year, branch, clubId FROM students WHERE username = ?',
                [username]
            );

            if (studentResult.length === 0) {
                await connection.rollback();
                return NextResponse.json(
                    { error: 'Student not found' },
                    { status: 404 }
                );
            }

            const studentData = studentResult[0];

            // Check if user already exists and what their current role is
            const [userResult] = await connection.execute(
                'SELECT role FROM users WHERE username = ?',
                [username]
            );

            if (userResult.length > 0) {
                const currentRole = userResult[0].role;

                if (currentRole === 'lead') {
                    await connection.rollback();
                    return NextResponse.json(
                        { error: 'User is already a lead' },
                        { status: 409 }
                    );
                } else if (currentRole !== 'student') {
                    await connection.rollback();
                    return NextResponse.json(
                        { error: 'Only students can be promoted to leads' },
                        { status: 400 }
                    );
                }

                // Update user role to lead
                await connection.execute(
                    'UPDATE users SET role = ? WHERE username = ?',
                    ['lead', username]
                );
            } else {
                await connection.rollback();
                return NextResponse.json(
                    { error: 'User account not found. Please ensure the student has registered.' },
                    { status: 404 }
                );
            }

            // Check if lead record already exists
            const [existingLead] = await connection.execute(
                'SELECT id FROM leads WHERE username = ?',
                [username]
            );

            if (existingLead.length > 0) {
                // Update existing lead record with all student details
                await connection.execute(
                    'UPDATE leads SET name = ?, email = ?, phoneNumber = ?, year = ?, branch = ?, clubId = ? WHERE username = ?',
                    [studentData.name, studentData.email, studentData.phoneNumber, studentData.year, studentData.branch, clubId, username]
                );
            } else {
                // Insert new lead record with all student details
                const leadQuery = `
                    INSERT INTO leads (username, name, email, phoneNumber, year, branch, clubId)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                await connection.execute(leadQuery, [
                    username,
                    studentData.name,
                    studentData.email,
                    studentData.phoneNumber,
                    studentData.year,
                    studentData.branch,
                    clubId
                ]);
            }

            await connection.commit();

            return NextResponse.json({
                success: true,
                message: 'Student successfully promoted to lead'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error promoting student to lead:', error);

        // Handle duplicate entry errors
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                { error: 'Lead record already exists for this student' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to promote student to lead' },
            { status: 500 }
        );
    }
}
