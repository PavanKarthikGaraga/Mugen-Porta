import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Fetch current controls
export async function GET() {
    let db;
    try {
        db = await pool.getConnection();

        // Get controls from database, or return default values if not set
        const [controlsResult] = await db.query(
            'SELECT * FROM controls WHERE id = 1'
        );

        let controls = {
            registrationsEnabled: true // Default value
        };

        if (controlsResult && controlsResult.length > 0) {
            controls = {
                registrationsEnabled: controlsResult[0].registrations_enabled === 1
            };
        }

        return NextResponse.json(controls);

    } catch (error) {
        console.error('Error fetching controls:', error);
        return NextResponse.json(
            { message: "Failed to fetch controls" },
            { status: 500 }
        );
    } finally {
        if (db) await db.release();
    }
}

// PUT - Update controls
export async function PUT(request) {
    let db;
    try {
        const body = await request.json();
        const { registrationsEnabled } = body;

        if (typeof registrationsEnabled !== 'boolean') {
            return NextResponse.json(
                { message: "Invalid data format" },
                { status: 400 }
            );
        }

        db = await pool.getConnection();

        // Insert or update controls
        await db.query(
            `INSERT INTO controls (id, registrations_enabled, updated_at)
             VALUES (1, ?, NOW())
             ON DUPLICATE KEY UPDATE
             registrations_enabled = VALUES(registrations_enabled),
             updated_at = NOW()`,
            [registrationsEnabled ? 1 : 0]
        );

        return NextResponse.json({
            message: "Controls updated successfully",
            registrationsEnabled
        });

    } catch (error) {
        console.error('Error updating controls:', error);
        return NextResponse.json(
            { message: "Failed to update controls" },
            { status: 500 }
        );
    } finally {
        if (db) await db.release();
    }
}
