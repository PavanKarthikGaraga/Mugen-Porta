import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function POST(req) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json(
                { message: "Token is required" },
                { status: 400 }
            );
        }

        // Verify the JWT token
        try {
            const TCK = process.env.TCK;
            if (!TCK) {
                throw new Error("TCK is not defined in environment variables");
            }

            const tck = new TextEncoder().encode(TCK);
            const { payload: decoded } = await jwtVerify(token, tck);

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

            return NextResponse.json(
                {
                    message: "Token is valid",
                    userId: decoded.userId,
                    email: decoded.email
                },
                { status: 200 }
            );

        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);

            if (jwtError.name === 'JWTExpired') {
                return NextResponse.json(
                    { message: "Token has expired. Please request a new password reset." },
                    { status: 400 }
                );
            } else {
                return NextResponse.json(
                    { message: "Invalid or expired token" },
                    { status: 400 }
                );
            }
        }

    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
