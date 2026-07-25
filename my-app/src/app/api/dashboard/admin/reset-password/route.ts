import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

// Fixed reset password requested by the admin team. Deliberately does NOT
// need to satisfy the strength regex used by the self-service change-password
// flow — that regex only applies when a user changes their own password.
const RESET_PASSWORD = 'sac@123';
const SALT_ROUNDS = 12;

// GET /api/dashboard/admin/reset-password?username=... — look up a user by
// username across every role (admin/lead/faculty/student) so the admin can
// confirm who they're about to reset before doing it.
export async function GET(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username')?.trim();

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const [rows]: any = await pool.execute(
            `SELECT id, username, name, email, role, created_at FROM users WHERE username = ? LIMIT 1`,
            [username]
        );

        if (rows.length === 0) {
            return NextResponse.json({ success: true, user: null });
        }

        return NextResponse.json({ success: true, user: rows[0] });
    } catch (error: any) {
        console.error('Reset-password lookup error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to look up user') }, { status: 500 });
    }
}

// POST /api/dashboard/admin/reset-password — resets the given user's
// password to the fixed default. Works across every role.
export async function POST(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        const body = await request.json().catch(() => ({}));
        const username = typeof body?.username === 'string' ? body.username.trim() : '';

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const [rows]: any = await pool.execute(
            `SELECT username, name, role FROM users WHERE username = ? LIMIT 1`,
            [username]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const target = rows[0];
        const hashed = await bcrypt.hash(RESET_PASSWORD, SALT_ROUNDS);

        const [result]: any = await pool.execute(
            `UPDATE users SET password = ? WHERE username = ?`,
            [hashed, username]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Password reset for ${target.name} (${target.username}, ${target.role})`,
        });
    } catch (error: any) {
        console.error('Reset-password error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to reset password') }, { status: 500 });
    }
}
