import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    let db;
    try {
        const { token, password, confirmPassword } = await req.json();

        if (!token || !password || !confirmPassword) {
            return NextResponse.json(
                { message: "Token, password, and confirm password are required" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { message: "Passwords do not match" },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        if (!/[A-Z]/.test(password)) {
            return NextResponse.json(
                { message: "Password must contain at least one uppercase letter" },
                { status: 400 }
            );
        }

        if (!/[a-z]/.test(password)) {
            return NextResponse.json(
                { message: "Password must contain at least one lowercase letter" },
                { status: 400 }
            );
        }

        if (!/\d/.test(password)) {
            return NextResponse.json(
                { message: "Password must contain at least one number" },
                { status: 400 }
            );
        }

        // Verify the JWT token
        let decoded;
        try {
            const TCK = process.env.TCK;
            if (!TCK) {
                throw new Error("TCK is not defined in environment variables");
            }

            const tck = new TextEncoder().encode(TCK);
            const { payload } = await jwtVerify(token, tck);
            decoded = payload;

            // Check if token is for password reset
            if (decoded.type !== 'password_reset') {
                return NextResponse.json(
                    { message: "Invalid token type" },
                    { status: 400 }
                );
            }

            // Check if token is expired
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp < now) {
                return NextResponse.json(
                    { message: "Token has expired" },
                    { status: 400 }
                );
            }

        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);

            if (jwtError.name === 'JWTExpired') {
                return NextResponse.json(
                    { message: "Token has expired. Please request a new password reset." },
                    { status: 400 }
                );
            } else {
                return NextResponse.json(
                    { message: "Invalid token" },
                    { status: 400 }
                );
            }
        }

        db = await pool.getConnection();

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update the user's password
        const [updateResult] = await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, decoded.userId]
        );

        if (updateResult.affectedRows === 0) {
            return NextResponse.json(
                { message: "User not found or password update failed" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { message: "Internal server error. Please try again later." },
            { status: 500 }
        );
    } finally {
        if (db) await db.release();
    }
}
