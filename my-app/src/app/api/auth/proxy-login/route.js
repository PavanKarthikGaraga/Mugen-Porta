import pool from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function POST(req) {
    let db;
    try {
        const { targetUsername } = await req.json();

        // Verify admin token first
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;

        if (!token) {
            return new Response(JSON.stringify({ error: "Authentication required" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const adminPayload = await verifyToken(token);
        if (!adminPayload || adminPayload.role !== 'admin') {
            return new Response(JSON.stringify({ error: "Admin access required" }), {
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Check if target user exists
        db = await pool.getConnection();
        const [targetUser] = await db.query('SELECT * FROM users WHERE username = ?', [targetUsername]);

        if (!targetUser || targetUser.length === 0) {
            return new Response(JSON.stringify({ error: "Target user not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        const user = targetUser[0];

        // Generate proxy token with both admin and target user info
        const proxyToken = await generateToken({
            username: user.username,
            name: user.name,
            role: user.role,
            proxyAdminUsername: adminPayload.username, // Track who is proxying
            proxyAdminName: adminPayload.name,
            isProxy: true
        });

        // Set proxy token in cookie
        cookieStore.set("tck", proxyToken, {
            httpOnly: true,
            samesite: 'lax',
            maxage: 45 * 60 // 45 minutes
        });

        return new Response(JSON.stringify({
            ok: true,
            message: `Successfully logged in as ${user.name} (${user.username})`,
            user: {
                username: user.username,
                name: user.name,
                role: user.role
            },
            isProxy: true,
            proxyAdmin: {
                username: adminPayload.username,
                name: adminPayload.name
            }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Proxy login error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    } finally {
        if (db) {
            await db.release();
        }
    }
}
