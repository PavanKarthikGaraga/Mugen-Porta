import pool from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function POST(req) {
    try {
        // Verify current proxy token
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;

        if (!token) {
            return new Response(JSON.stringify({ error: "No active session" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const payload = await verifyToken(token);
        if (!payload || !payload.isProxy) {
            return new Response(JSON.stringify({ error: "Not in proxy session" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Check if it's an admin proxy session or lead proxy session
        let originalUser = null;
        let message = "";

        if (payload.proxyAdminUsername) {
            // Admin proxy session - return to admin
            const db = await pool.getConnection();
            const [adminUser] = await db.query('SELECT * FROM users WHERE username = ?', [payload.proxyAdminUsername]);

            if (!adminUser || adminUser.length === 0) {
                return new Response(JSON.stringify({ error: "Admin user not found" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" }
                });
            }

            originalUser = adminUser[0];
            message = "Successfully returned to admin session";
            await db.release();
        } else if (payload.proxyLeadUsername) {
            // Lead proxy session - return to lead
            const db = await pool.getConnection();
            const [leadUser] = await db.query('SELECT * FROM users WHERE username = ?', [payload.proxyLeadUsername]);

            if (!leadUser || leadUser.length === 0) {
                return new Response(JSON.stringify({ error: "Lead user not found" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" }
                });
            }

            originalUser = leadUser[0];
            message = "Successfully returned to lead session";
            await db.release();
        } else {
            return new Response(JSON.stringify({ error: "Invalid proxy session" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Generate new token for original user (admin or lead)
        const originalToken = await generateToken({
            username: originalUser.username,
            name: originalUser.name,
            role: originalUser.role
        });

        // Set original token in cookie (replacing proxy token)
        cookieStore.set("tck", originalToken, {
            httpOnly: true,
            samesite: 'lax',
            maxage: 45 * 60 // 45 minutes
        });

        return new Response(JSON.stringify({
            ok: true,
            message: message,
            user: {
                username: originalUser.username,
                name: originalUser.name,
                role: originalUser.role
            }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Proxy logout error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
