import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
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
                s.*,
                c.name as clubName
             FROM students s
             LEFT JOIN clubs c ON s.clubId = c.id
             WHERE s.username = ?`,
            [username]
        ) as any[];

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
        const { username } = await params;
        const { careerChoice } = await request.json();

        if (!username || !careerChoice) {
            return NextResponse.json(
                { message: "Username and careerChoice are required" },
                { status: 400 }
            );
        }

        const [result] = await pool.execute(
            'UPDATE students SET careerChoice = ? WHERE username = ?',
            [careerChoice, username]
        ) as any;

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
