import { NextResponse } from "next/server";
import { emailQueue } from "@/lib/emailQueue";
import pool from '@/lib/db';
import { verifyDevAccess } from '../auth-helper';

export async function GET(request) {
    // Verify dev access (admin + specific username)
    const authResult = await verifyDevAccess(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        // Get queue status from memory
        const queueStatus = emailQueue.getStatus();
        
        // Get email queue statistics from database
        const [emailStats] = await pool.execute(`
            SELECT 
                status,
                COUNT(*) as count,
                MIN(created_at) as oldest,
                MAX(created_at) as newest
            FROM email_queue 
            GROUP BY status
        `);

        // Get recent email queue entries
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
                queueStatus,
                emailStats,
                recentEmails,
                dailyStats,
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

// POST method to manually trigger email processing or retry failed emails
export async function POST(request) {
    // Verify dev access (admin + specific username)
    const authResult = await verifyDevAccess(request);
    if (!authResult.success) {
        return authResult.response;
    }

    try {
        const { action, emailIds } = await request.json();

        if (action === 'retry-failed') {
            // Get failed emails and add them back to queue
            const query = emailIds && emailIds.length > 0 
                ? 'SELECT * FROM email_queue WHERE status = "failed" AND id IN (?)' 
                : 'SELECT * FROM email_queue WHERE status = "failed"';
            
            const params = emailIds && emailIds.length > 0 ? [emailIds] : [];
            const [failedEmails] = await pool.execute(query, params);

            // Add failed emails back to queue
            for (const email of failedEmails) {
                emailQueue.add({
                    email: email.email,
                    name: email.name,
                    username: email.username,
                    password: 'temp' // You might need to handle password differently
                });

                // Update status back to pending
                await pool.execute(
                    'UPDATE email_queue SET status = "pending", error_message = NULL WHERE id = ?',
                    [email.id]
                );
            }

            return NextResponse.json({
                success: true,
                message: `${failedEmails.length} failed emails added back to queue`
            });

        } else if (action === 'clear-completed') {
            // Clear sent emails older than 30 days
            const [result] = await pool.execute(`
                DELETE FROM email_queue 
                WHERE status = 'sent' 
                AND sent_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
            `);

            return NextResponse.json({
                success: true,
                message: `${result.affectedRows} completed emails cleared`
            });

        } else {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Error processing email queue action:", error);
        return NextResponse.json(
            { error: "Error processing request" },
            { status: 500 }
        );
    }
}
