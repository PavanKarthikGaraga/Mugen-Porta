import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { verifyAdminToken } from '../../auth-helper';

const VALID_DOMAINS = ['TEC', 'LCH', 'IIE', 'HWB', 'ESO'];

// Idempotent, matching the sibling create route's ensureCouncilTable — a
// council row edited before that route ever ran (e.g. this endpoint hit
// first) still needs assignedDomains to exist.
async function ensureCouncilDomainsColumn() {
    try {
        await pool.query(`ALTER TABLE council ADD COLUMN assignedDomains JSON NULL`);
    } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
}

export async function POST(request, { params }) {
    // Verify admin token
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const { username } = params;
        const body = await request.json();
        const { name, email, phoneNumber, year, branch, clubId, assignedClubs, assignedDomains, password } = body;

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        // A blank password field means "leave it as-is" — only touch it when
        // the admin actually typed a new one.
        const newPassword = typeof password === 'string' && password.trim().length > 0 ? password.trim() : null;
        if (newPassword && newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const domainList: string[] = Array.isArray(assignedDomains)
            ? assignedDomains.filter((d: any) => typeof d === 'string' && VALID_DOMAINS.includes(d))
            : [];

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

            if (role === 'council' && domainList.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: 'At least one domain must be assigned for council' }, { status: 400 });
            }

            // Update users table — name/email for everyone; password only
            // when a new one was actually supplied. Council has no name/email
            // of its own (they're synthesized at creation — see admin/users/
            // route.ts), so this just leaves those columns as they are for
            // council when the request doesn't include them.
            if (newPassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 12);
                await connection.execute(
                    'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), password = ?, plainPassword = ? WHERE username = ?',
                    [name || null, email || null, hashedPassword, newPassword, username]
                );
            } else {
                await connection.execute(
                    'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE username = ?',
                    [name || null, email || null, username]
                );
            }

            // Update role-specific table
            if (role === 'lead') {
                await connection.execute(
                    'UPDATE leads SET name = ?, email = ?, phoneNumber = ?, year = ?, branch = ?, clubId = ? WHERE username = ?',
                    [name, email, phoneNumber, year, branch, clubId, username]
                );
            } else if (role === 'faculty') {
                // faculty has no year/branch columns (that's students/leads only)
                await connection.execute(
                    'UPDATE faculty SET name = ?, email = ?, phoneNumber = ?, assignedClubs = ? WHERE username = ?',
                    [name, email, phoneNumber, JSON.stringify(assignedClubs), username]
                );
            } else if (role === 'council') {
                await ensureCouncilDomainsColumn();
                await connection.execute(
                    'UPDATE council SET assignedDomain = ?, assignedDomains = ? WHERE username = ?',
                    [domainList[0], JSON.stringify(domainList), username]
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
