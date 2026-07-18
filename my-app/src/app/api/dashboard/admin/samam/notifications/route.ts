import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("tck")?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  if (!decoded || (decoded.role !== "admin" && decoded.role !== "superadmin")) return null;
  return decoded;
}

export async function POST(req: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { title, message, type, target } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ message: "Title and message are required" }, { status: 400 });
    }

    // Determine target users
    let usersToNotify: any[] = [];
    if (target === "all") {
      const [rows] = await pool.execute(`SELECT username FROM users WHERE role = 'student'`);
      usersToNotify = rows as any[];
    } else {
      // In a real scenario, you could have target = "3rd_year", etc.
      // For now, if it's a specific username:
      usersToNotify = [{ username: target }];
    }

    if (usersToNotify.length === 0) {
      return NextResponse.json({ message: "No target users found" }, { status: 404 });
    }

    // Insert notifications
    // Note: for a very large userbase, a bulk insert or a background job is better
    // For this MVP, we will use a loop with a transaction or just simple inserts
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const u of usersToNotify) {
        await connection.execute(
          `INSERT INTO notifications (username, type, title, message) VALUES (?, ?, ?, ?)`,
          [u.username, type || 'system', title, message]
        );
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return NextResponse.json({ success: true, message: `Notification sent to ${usersToNotify.length} student(s).` });
  } catch (error: any) {
    console.error("Notifications POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
