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
            maxMembers: project.domain === 'TEC' ? 2 : null,
            availableSpots: project.domain === 'TEC' ? Math.max(0, 2 - memberCount[0].count) : null,
            isFull: project.domain === 'TEC' && memberCount[0].count >= 2
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
