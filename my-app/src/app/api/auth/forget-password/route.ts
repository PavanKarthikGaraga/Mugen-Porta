import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
    // Prevent this endpoint being used to spam a user's inbox with reset emails.
    const rateLimit = checkRateLimit(req, 'forget-password', { limit: 5, windowMs: 5 * 60 * 1000 });
    if (rateLimit.limited) return rateLimit.response;

    let db;
    try {
        const { email } = await req.json();

        if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                { message: "A valid email is required" },
                { status: 400 }
            );
        }

        db = await pool.getConnection();

        // Check if user exists
        const [existingUser] = await db.query('SELECT id, username, name FROM users WHERE email = ?', [email]);

        if (!existingUser || existingUser.length === 0) {
            // Don't reveal if email exists or not for security
            return NextResponse.json(
                { message: "If an account with this email exists, a password reset link has been sent." },
                { status: 200 }
            );
        }

        const user = existingUser[0];

        // Generate JWT token for password reset (expires in 1 hour)
        const TCK = process.env.TCK;
        if (!TCK) {
            throw new Error("TCK is not defined in environment variables");
        }

        const tck = new TextEncoder().encode(TCK);
        const resetToken = await new SignJWT({
            userId: user.id,
            email: email,
            type: 'password_reset'
        })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime('1h')
        .sign(tck);

        // Create reset link (always the canonical production domain, never localhost)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sacactivities.kluniversity.in';
        const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

        // Send email
        const emailResult = await sendPasswordResetEmail(email, user.name, resetLink);

        if (emailResult.success) {
            return NextResponse.json(
                { message: "Password reset link sent to your email" },
                { status: 200 }
            );
        } else {
            console.error('Email sending failed:', emailResult.error);
            return NextResponse.json(
                { message: "Failed to send reset email. Please try again." },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Forget password error:', error);
        return NextResponse.json(
            { message: "Internal server error. Please try again later." },
            { status: 500 }
        );
    } finally {
        if (db) await db.release();
    }
}
