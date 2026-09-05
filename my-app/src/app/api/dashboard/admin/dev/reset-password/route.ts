import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { verifyDevAccess } from '../../auth-helper';
import { safeMessage } from '@/lib/apiSecurity';

// Reset value comes from the DEV_RESET_PASSWORD env var — it must NOT be
// hardcoded here (this file is committed to the repo). Deliberately does NOT
// need to satisfy the strength regex used by the self-service change-password
// flow — that regex only applies when a user changes their own password.
const SALT_ROUNDS = 12;

function getResetPassword(): string | null {
    const value = process.env.DEV_RESET_PASSWORD;
    return value && value.trim().length > 0 ? value : null;
}

// Dev-only: this resets ANY user's password (including other admins), so it
// is gated behind the same DEV_USERNAMES allowlist as the rest of
// /dashboard/admin/dev/*, not just role === 'admin'.

// GET /api/dashboard/admin/dev/reset-password?username=... — look up a user
// by username across every role (admin/lead/faculty/student) so the dev can
// confirm who they're about to reset before doing it.
export async function GET(request: Request) {
    const auth = await verifyDevAccess(request);
    if (!auth.success) return auth.response;

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

// POST /api/dashboard/admin/dev/reset-password — resets the given user's
// password to the fixed default. Works across every role.
export async function POST(request: Request) {
    const auth = await verifyDevAccess(request);
    if (!auth.success) return auth.response;

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
        const resetPassword = getResetPassword();
        if (!resetPassword) {
            console.error('DEV_RESET_PASSWORD env var is not configured');
            return NextResponse.json(
                { error: 'Reset password is not configured on the server (DEV_RESET_PASSWORD)' },
                { status: 500 }
            );
        }
        const hashed = await bcrypt.hash(resetPassword, SALT_ROUNDS);

        const [result]: any = await pool.execute(
            `UPDATE users SET password = ? WHERE username = ?`,
            [hashed, username]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            resetPassword,
            message: `Password reset for ${target.name} (${target.username}, ${target.role})`,
        });
    } catch (error: any) {
        console.error('Reset-password error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to reset password') }, { status: 500 });
    }
}
