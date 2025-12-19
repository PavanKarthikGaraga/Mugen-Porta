import pool from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function POST(req) {
    let db;
    try {
        // Verify lead token first
        const cookieStore = await cookies();
        const token = cookieStore.get('tck')?.value;

        if (!token) {
            return new Response(JSON.stringify({ error: "Authentication required" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const leadPayload = await verifyToken(token);
        if (!leadPayload || leadPayload.role !== 'lead') {
            return new Response(JSON.stringify({ error: "Lead access required" }), {
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Check if the lead has student data (they should, since leads are also students)
        db = await pool.getConnection();
        const [studentData] = await db.query(
            'SELECT s.*, u.email FROM students s JOIN users u ON s.username = u.username WHERE s.username = ?',
            [leadPayload.username]
        );

        if (!studentData || studentData.length === 0) {
            return new Response(JSON.stringify({ error: "Student profile not found for this lead" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        const student = studentData[0];

        // Generate proxy token with lead info and student role
        const proxyToken = await generateToken({
            username: student.username,
            name: student.name,
            role: 'student', // Change role to student for accessing student dashboard
            proxyLeadUsername: leadPayload.username, // Track who is proxying
            proxyLeadName: leadPayload.name,
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
            message: `Successfully accessed student dashboard as ${student.name}`,
            user: {
                username: student.username,
                name: student.name,
                role: 'student'
            },
            isProxy: true,
            proxyLead: {
                username: leadPayload.username,
                name: leadPayload.name
            }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Lead proxy login error:", error);
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