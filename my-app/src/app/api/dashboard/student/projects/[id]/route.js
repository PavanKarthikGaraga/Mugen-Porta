import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Project ID is required" },
                { status: 400 }
            );
        }

        // Fetch project data
        const [projectData] = await pool.execute(
            `SELECT p.*, c.name as clubName
             FROM projects p
             LEFT JOIN clubs c ON p.clubId = c.id
             WHERE p.id = ?`,
            [id]
        );

        if (projectData.length === 0) {
            return NextResponse.json(
                { message: "Project not found" },
                { status: 404 }
            );
        }

        const project = projectData[0];

        // Get member count for this project
        const [memberCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM students WHERE projectId = ?',
            [id]
        );

        const projectWithMemberCount = {
            ...project,
            memberCount: memberCount[0].count,
            maxMembers: null, // Remove max members limit
            availableSpots: null, // Remove available spots calculation
            isFull: false // Remove the full status - projects are never full
        };

        return NextResponse.json(projectWithMemberCount);

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({
            error: 'Failed to fetch project data',
            details: error.message
        }, { status: 500 });
    }
}
