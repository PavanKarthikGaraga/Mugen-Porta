import pool from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req) {
    // Brute-force protection is metered on two dimensions.
    //
    // Per IP the ceiling is deliberately high: an entire campus shares one NAT
    // address, so a full cohort signing in at the start of a session is normal
    // traffic, not an attack. This dimension exists only to stop a single host
    // hammering many different accounts.
    const ipLimit = checkRateLimit(req, 'login-ip', { limit: 100, windowMs: 60 * 1000 });
    if (ipLimit.limited) return ipLimit.response;

    let db;
    try {
        const body = await req.json().catch(() => null);
        const username = typeof body?.username === 'string' ? body.username.trim() : '';
        const password = typeof body?.password === 'string' ? body.password : '';

        if (!username || !password || username.length > 100 || password.length > 200) {
            return new Response(JSON.stringify({ error: "Username and password are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        // Per account the ceiling is tight. Ten attempts per 15 minutes is
        // ample for a real student (who needs one or two) while reducing
        // password guessing against any single account to ~960 tries a day.
        // Keyed on the lowercased username so case variation can't be used to
        // mint fresh buckets. A bucket is created for whatever string is
        // submitted, so a 429 here reveals nothing about whether that account
        // actually exists -- the enumeration guarantee below still holds.
        const userLimit = checkRateLimit(req, 'login-user', {
            limit: 10,
            windowMs: 15 * 60 * 1000,
            key: username.toLowerCase(),
        });
        if (userLimit.limited) return userLimit.response;

        db = await pool.getConnection();

        const [existingUser] = await db.query('select * from users where username=?', [username]);

        // Use an identical, generic response for "user not found" and
        // "wrong password" so the endpoint can't be used to enumerate
        // valid usernames.
        const genericError = () => new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401, headers: { "Content-Type": "application/json" } });

        if (!existingUser || existingUser.length === 0) {
            return genericError();
        }

        const user = existingUser[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return genericError();
        }

        const tck = await generateToken({ username: user.username, name: user.name, role: user.role });

        const cookiesStore = await cookies();

        cookiesStore.set("tck", tck, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
        });

        return new Response(JSON.stringify({
            ok: true,
            message: "User successfully Logged In",
            user: {
                username: user.username,
                name: user.name,
                role: user.role
            },
        }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.error("Login error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    } finally {
        if (db)
            await db.release();
    }
}
