import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { ensureActivitySchema } from '@/lib/dbMigrate';

// GET: all pending activities
export async function GET() {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        await ensureActivitySchema();
        const [rows]: any = await pool.execute(`
            SELECT ac.id, ac.code, ac.title, ac.description, ac.domain, ac.category,
                   ac.sdc_credits, ac.max_seats, ac.difficulty, ac.submitted_by,
                   ac.rejection_note, ac.approval_status, ac.created_at,
                   l.name as lead_name,
                   c.name as club_name
            FROM activity_catalogue ac
            LEFT JOIN leads l ON l.username = ac.submitted_by
            LEFT JOIN clubs c ON c.id = l.clubId
            WHERE ac.approval_status IN ('pending_approval', 'rejected')
            ORDER BY ac.created_at DESC
        `);
        return NextResponse.json({ success: true, activities: rows });
    } catch (error: any) {
        console.error('Approvals GET error:', error);
        return NextResponse.json({ success: false, error: safeMessage(error) }, { status: 500 });
    }
}

// PATCH: approve or reject an activity
export async function PATCH(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        const { id, action, rejectionNote } = await request.json();
        if (!id || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ success: false, error: 'id and action (approve|reject) required' }, { status: 400 });
        }

        if (action === 'approve') {
            await pool.execute(
                `UPDATE activity_catalogue SET approval_status = 'active', rejection_note = NULL WHERE id = ?`,
                [id]
            );
        } else {
            await pool.execute(
                `UPDATE activity_catalogue SET approval_status = 'rejected', rejection_note = ? WHERE id = ?`,
                [rejectionNote || 'Not approved', id]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Approvals PATCH error:', error);
        return NextResponse.json({ success: false, error: safeMessage(error) }, { status: 500 });
    }
}

// DELETE: permanently delete a rejected activity
export async function DELETE(request: Request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    try {
        const { id } = await request.json();
        await pool.execute(`DELETE FROM activity_catalogue WHERE id = ? AND approval_status = 'rejected'`, [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: safeMessage(error) }, { status: 500 });
    }
}
