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

        // Get faculty profile data
        const [profileResult] = await pool.execute(
            'SELECT * FROM faculty WHERE username = ?',
            [payload.username]
        );

        if (profileResult.length === 0) {
            return NextResponse.json(
                { error: 'Faculty profile not found' },
                { status: 404 }
            );
        }

        const profile = profileResult[0];

        return NextResponse.json({
            user: profile
        });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to fetch faculty profile',
            details: error.message
        }, { status: 500 });
    }
}

export async function PUT(request) {
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

        const body = await request.json();
        const { name, email, phoneNumber } = body;

        // Validate required fields
        if (!name || !email || !phoneNumber) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Update users table
            await connection.execute(
                'UPDATE users SET name = ?, email = ? WHERE username = ?',
                [name, email, payload.username]
            );

            // Update faculty table
            await connection.execute(
                'UPDATE faculty SET name = ?, email = ?, phoneNumber = ? WHERE username = ?',
                [name, email, phoneNumber, payload.username]
            );

            await connection.commit();

            return NextResponse.json({
                success: true,
                message: 'Profile updated successfully'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to update faculty profile',
            details: error.message
        }, { status: 500 });
    }
}
