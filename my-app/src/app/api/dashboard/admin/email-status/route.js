import { NextResponse } from "next/server";
import pool from '@/lib/db';
import { verifyDevAccess } from '../auth-helper';

export async function GET(request) {
    // Verify dev access (admin + specific username)
    const authResult = await verifyDevAccess(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        // Get email statistics from database (if any historical data exists)
        const [emailStats] = await pool.execute(`
            SELECT
                status,
                COUNT(*) as count,
                MIN(created_at) as oldest,
                MAX(created_at) as newest
            FROM email_queue
            GROUP BY status
        `);

        // Get recent email entries (for any historical data)
        const [recentEmails] = await pool.execute(`
            SELECT
                id,
                email,
                name,
                username,
                status,
                error_message,
                created_at,
                sent_at
            FROM email_queue
            ORDER BY created_at DESC
            LIMIT 50
        `);

        // Get daily email statistics for the last 7 days
        const [dailyStats] = await pool.execute(`
            SELECT
                DATE(created_at) as date,
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
            FROM email_queue
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        return NextResponse.json({
            success: true,
            data: {
                emailStats,
                recentEmails,
                dailyStats,
                note: "Emails are now sent directly without queuing",
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("Error getting email queue status:", error);
        return NextResponse.json(
            { error: "Error retrieving queue status" },
            { status: 500 }
        );
    }
}

// POST method for email maintenance operations
export async function POST(request) {
    // Verify dev access (admin + specific username)
    const authResult = await verifyDevAccess(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const { action } = await request.json();

        if (action === 'clear-old-logs') {
            // Clear old email logs older than 30 days (keeping historical data)
            const [result] = await pool.execute(`
                DELETE FROM email_queue
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
            `);

            return NextResponse.json({
                success: true,
                message: `${result.affectedRows} old email logs cleared`
            });

        } else {
            return NextResponse.json(
                { error: 'Invalid action. Available: clear-old-logs' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Error processing email maintenance action:", error);
        return NextResponse.json(
            { error: "Error processing request" },
            { status: 500 }
        );
    }
}
