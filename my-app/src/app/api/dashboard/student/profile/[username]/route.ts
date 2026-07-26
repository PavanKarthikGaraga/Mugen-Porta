import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(request, { params }) {
    try {
        const token = request.cookies.get('tck')?.value;
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }
        const caller = await verifyToken(token);
        if (!caller) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const { username } = await params;

        if (!username) {
            return NextResponse.json(
                { message: "Username is required" },
                { status: 400 }
            );
        }

        // Fetch student profile data
        const [studentData] = await pool.execute(
            `SELECT
                s.username,
                s.clubId,
                s.name,
                s.email,
                s.branch,
                s.gender,
                s.cluster,
                s.year,
                s.phoneNumber,
                s.residenceType,
                s.hostelName,
                s.busRoute,
                s.country,
                s.state,
                s.district,
                s.pincode,
                s.selectedDomain,
                s.pathway,
                s.careerChoice,
                s.created_at,
                c.name as clubName
             FROM students s
             LEFT JOIN clubs c ON s.clubId = c.id
             WHERE s.username = ?`,
            [username]
        );

        if (studentData.length === 0) {
            return NextResponse.json(
                { message: "Student not found" },
                { status: 404 }
            );
        }

        const student = studentData[0];

        return NextResponse.json(student);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to fetch student profile',
            details: error.message
        }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const token = request.cookies.get('tck')?.value;
        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }
        const caller = await verifyToken(token);
        if (!caller) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const { username } = await params;
        const { careerChoice } = await request.json();

        // Only the student themselves or an admin may update the career choice
        if (caller.username !== username && caller.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (!username || !careerChoice) {
            return NextResponse.json(
                { message: "Username and careerChoice are required" },
                { status: 400 }
            );
        }

        const [result] = await pool.execute(
            'UPDATE students SET careerChoice = ? WHERE username = ?',
            [careerChoice, username]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { message: "Student not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Career choice updated successfully" });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to update student profile',
            details: error.message
        }, { status: 500 });
    }
}
