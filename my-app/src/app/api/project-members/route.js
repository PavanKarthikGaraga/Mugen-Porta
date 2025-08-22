import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        // Get the current member count for the project
        const [result] = await pool.execute(
            'SELECT COUNT(*) as memberCount FROM students WHERE projectId = ?',
            [projectId]
        );

        return NextResponse.json({
            success: true,
            projectId: projectId,
            memberCount: result[0].memberCount
        });

    } catch (error) {
        console.error('Error fetching project member count:', error);
        return NextResponse.json(
            { error: 'Failed to fetch project member count' },
            { status: 500 }
        );
    }
}
