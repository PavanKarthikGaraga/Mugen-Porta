import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rateLimit';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        // Get token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify token and get user info
        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const { currentPassword, newPassword } = await request.json();

        // Validate input
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        // Validate new password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return NextResponse.json(
                { error: 'New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character' },
                { status: 400 }
            );
        }

        // Check if new password is different from current
        if (currentPassword === newPassword) {
            return NextResponse.json(
                { error: 'New password must be different from current password' },
                { status: 400 }
            );
        }

        // Get current user data
        const [userRows] = await pool.execute<RowDataPacket[]>(
            'SELECT password FROM users WHERE username = ?',
            [payload.username] as any[]
        );

        if (userRows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = userRows[0];

        // Brute-force protection, mirroring the login route: a generous
        // per-IP ceiling (the campus shares one NAT address) plus a tight
        // per-account ceiling keyed on the username, checked before the
        // bcrypt compare so password guessing against a valid session is
        // throttled the same way as login attempts.
        const ipLimit = await checkRateLimit(request, 'change-password-ip', { limit: 100, windowMs: 60 * 1000 });
        if (ipLimit.limited) return ipLimit.response;

        const userLimit = await checkRateLimit(request, 'change-password-user', {
            limit: 10,
            windowMs: 15 * 60 * 1000,
            key: String(payload.username).toLowerCase(),
        });
        if (userLimit.limited) return userLimit.response;

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        // Hash new password with 12 rounds
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password in database
        await pool.execute(
            'UPDATE users SET password = ? WHERE username = ?',
            [hashedNewPassword, payload.username] as any[]
        );

        return NextResponse.json({
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
