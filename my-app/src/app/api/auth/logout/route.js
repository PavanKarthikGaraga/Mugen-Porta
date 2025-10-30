import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        // Use NextResponse to properly handle cookie clearing
        const response = new Response(JSON.stringify({
            ok: true,
            message: "Successfully logged out"
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

        // Clear the cookie by setting it to expire
        response.headers.set('Set-Cookie',
            'tck=; HttpOnly; Secure; SameSite=lax; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        );

        return response;

    } catch (error) {
        console.error("Logout error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
