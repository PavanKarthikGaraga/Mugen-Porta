import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdminToken } from '../auth-helper';
import bcrypt from 'bcrypt';

export async function GET(request) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'all';

    try {
        let query, params;

        if (role === 'all') {
            // Get all non-student users
            query = `
                SELECT u.id, u.username, u.name, u.email, u.role, u.created_at,
                       s.phoneNumber, s.year, s.branch, l.clubId, c.name as clubName,
                       f.phoneNumber as fPhoneNumber, f.year as fYear, f.branch as fBranch, f.assignedClubs
                FROM users u
                LEFT JOIN students s ON u.username = s.username AND u.role = 'lead'
                LEFT JOIN leads l ON u.username = l.username AND u.role = 'lead'
                LEFT JOIN faculty f ON u.username = f.username AND u.role = 'faculty'
                LEFT JOIN clubs c ON l.clubId = c.id
                WHERE u.role IN ('admin', 'lead', 'faculty')
                ORDER BY u.created_at DESC
            `;
            params = [];
        } else {
            // Get users by specific role
            query = `
                SELECT u.id, u.username, u.name, u.email, u.role, u.created_at,
                       s.phoneNumber, s.year, s.branch, l.clubId, c.name as clubName,
                       f.phoneNumber as fPhoneNumber, f.year as fYear, f.branch as fBranch, f.assignedClubs
                FROM users u
                LEFT JOIN students s ON u.username = s.username AND u.role = 'lead'
                LEFT JOIN leads l ON u.username = l.username AND u.role = 'lead'
                LEFT JOIN faculty f ON u.username = f.username AND u.role = 'faculty'
                LEFT JOIN clubs c ON l.clubId = c.id
                WHERE u.role = ?
                ORDER BY u.created_at DESC
            `;
            params = [role];
        }

        const [users] = await pool.execute(query, params);

        // Get clubs list for dropdowns
        const [clubs] = await pool.execute('SELECT id, name FROM clubs ORDER BY name');

        return NextResponse.json({
            success: true,
            data: {
                users,
                clubs
            }
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const body = await request.json();
        const { role, username, name, email, phoneNumber, year, branch, clubId, assignedClubs } = body;

        // Validate required fields
        if (!role || !username || !name || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Additional validation for leads and faculty
        if (role === 'lead') {
            if (!clubId) {
                return NextResponse.json(
                    { error: 'Club assignment is required for leads' },
                    { status: 400 }
                );
            }
        } else if (role === 'faculty') {
            if (!phoneNumber || !year || !branch) {
                return NextResponse.json(
                    { error: 'Phone number, year, and branch are required for faculty' },
                    { status: 400 }
                );
            }
            if (!assignedClubs || assignedClubs.length === 0) {
                return NextResponse.json(
                    { error: 'Club assignments are required for faculty' },
                    { status: 400 }
                );
            }
        }

        // Generate default password: username + last 4 digits of phone number
        let defaultPassword = username;
        if (phoneNumber && phoneNumber.length >= 4) {
            defaultPassword += phoneNumber.slice(-4);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            if (role === 'lead') {
                // For leads, check if student exists and update their role
                const [existingStudent] = await connection.execute(
                    'SELECT name, email, phoneNumber, year, branch FROM students WHERE username = ?',
                    [username]
                );

                if (existingStudent.length === 0) {
                    await connection.rollback();
                    return NextResponse.json(
                        { error: 'Student not found. Leads must be assigned from existing students.' },
                        { status: 404 }
                    );
                }

                const studentData = existingStudent[0];

                // Update user role to lead
                await connection.execute(
                    'UPDATE users SET role = ? WHERE username = ?',
                    ['lead', username]
                );

                // Create lead record with all student details
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

            } else {
                // For faculty and admin, create new user
                // Insert into users table
                const userQuery = `
                    INSERT INTO users (username, name, email, password, role)
                    VALUES (?, ?, ?, ?, ?)
                `;
                await connection.execute(userQuery, [username, name, email, hashedPassword, role]);

                // Insert into specific role table
                if (role === 'faculty') {
                    const facultyQuery = `
                        INSERT INTO faculty (username, name, email, phoneNumber, year, branch, assignedClubs)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `;
                    await connection.execute(facultyQuery, [username, name, email, phoneNumber, year, branch, JSON.stringify(assignedClubs)]);
                }
            }

            await connection.commit();

            return NextResponse.json({
                success: true,
                message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
                defaultPassword
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error creating user:', error);

        // Handle duplicate entry errors
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                { error: 'Username or email already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create user' },
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
        const username = searchParams.get('username');

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
            // Get user role before deletion
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

            // Delete from all related tables first (due to foreign key constraints)
            // Delete from submission and marks tables first (they reference users)
            await connection.execute('DELETE FROM internal_submissions WHERE username = ?', [username]);
            await connection.execute('DELETE FROM student_external_submissions WHERE username = ?', [username]);
            // For marks table, we need to handle both username and evaluated_by references
            await connection.execute('DELETE FROM student_external_marks WHERE username = ? OR evaluated_by = ?', [username, username]);
            await connection.execute('DELETE FROM email_queue WHERE username = ?', [username]);

            // Delete from role-specific tables
            if (role === 'lead') {
                // Delete from leads table first
                await connection.execute('DELETE FROM leads WHERE username = ?', [username]);
                // Also delete from students table since leads were originally students
                await connection.execute('DELETE FROM students WHERE username = ?', [username]);
            } else if (role === 'faculty') {
                await connection.execute('DELETE FROM faculty WHERE username = ?', [username]);
            } else if (role === 'student') {
                await connection.execute('DELETE FROM students WHERE username = ?', [username]);
            }

            // Delete from users table
            await connection.execute('DELETE FROM users WHERE username = ?', [username]);

            await connection.commit();

            return NextResponse.json({
                success: true,
                message: 'User deleted successfully'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
