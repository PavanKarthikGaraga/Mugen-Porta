import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdminToken } from '../../auth-helper';

export async function POST(request, { params }) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const { username } = params;
        const body = await request.json();
        const { name, email, phoneNumber, year, branch, clubId, assignedClubs } = body;

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Get current user role
            const [userResult] = await connection.execute(
                'SELECT role FROM users WHERE username = ?',
                [username]
            );

            if (userResult.length === 0) {
                await connection.rollback();
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            const role = userResult[0].role;

            // Update users table
            await connection.execute(
                'UPDATE users SET name = ?, email = ? WHERE username = ?',
                [name, email, username]
            );

            // Update role-specific table
            if (role === 'lead') {
                await connection.execute(
                    'UPDATE leads SET name = ?, email = ?, phoneNumber = ?, year = ?, branch = ?, clubId = ? WHERE username = ?',
                    [name, email, phoneNumber, year, branch, clubId, username]
                );
            } else if (role === 'faculty') {
                await connection.execute(
                    'UPDATE faculty SET name = ?, email = ?, phoneNumber = ?, year = ?, branch = ?, assignedClubs = ? WHERE username = ?',
                    [name, email, phoneNumber, year, branch, JSON.stringify(assignedClubs), username]
                );
            }

            await connection.commit();

            return NextResponse.json({
                success: true,
                message: 'User updated successfully'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
