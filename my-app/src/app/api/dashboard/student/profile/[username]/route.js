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
                s.username,
                s.projectId,
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
                s.selectedCategory,
                s.ruralCategory,
                s.subCategory,
                s.socialInternshipId,
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
