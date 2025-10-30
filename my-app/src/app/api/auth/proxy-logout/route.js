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
        if (!payload || !payload.isProxy || !payload.proxyAdminUsername) {
            return new Response(JSON.stringify({ error: "Not in proxy session" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Get admin user details
        const db = await pool.getConnection();
        const [adminUser] = await db.query('SELECT * FROM users WHERE username = ?', [payload.proxyAdminUsername]);

        if (!adminUser || adminUser.length === 0) {
            return new Response(JSON.stringify({ error: "Admin user not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        const admin = adminUser[0];
        await db.release();

        // Generate new token for admin
        const adminToken = await generateToken({
            username: admin.username,
            name: admin.name,
            role: admin.role
        });

        // Set admin token in cookie (replacing proxy token)
        cookieStore.set("tck", adminToken, {
            httpOnly: true,
            samesite: 'lax',
            maxage: 45 * 60 // 45 minutes
        });

        return new Response(JSON.stringify({
            ok: true,
            message: "Successfully returned to admin session",
            user: {
                username: admin.username,
                name: admin.name,
                role: admin.role
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
