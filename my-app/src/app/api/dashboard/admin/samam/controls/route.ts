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

export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const [rows] = await pool.execute(`SELECT * FROM controls WHERE id = 1`);
    const controls = (rows as any[])[0] || { registrations_enabled: 1 };

    return NextResponse.json({ success: true, controls });
  } catch (error: any) {
    console.error("Controls GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { registrations_enabled } = await req.json();

    await pool.execute(
      `UPDATE controls SET registrations_enabled = ? WHERE id = 1`,
      [registrations_enabled ? 1 : 0]
    );

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error: any) {
    console.error("Controls POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
