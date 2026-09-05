import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { safeMessage } from '@/lib/apiSecurity';
import { checkIssuer, loadPermittedActivity } from '@/lib/samamActivityAuth';

export const dynamic = 'force-dynamic';

const MAX_BULK = 500;
// Sanity cap on a single award so a forged/buggy request can't inflate a
// student's total with absurd amounts (e.g. credits: 1000000). Legitimate
// per-activity awards are far below this.
const MAX_CREDITS_PER_AWARD = 1000;

/**
 * Bulk SAMAM points award for a single activity — admin/council/faculty/lead
 * select an activity, then award points to some or all of its (typically
 * present/completed) enrolled students in one action. Scope is enforced by
 * the same rules as certificate issuance; see @/lib/samamActivityAuth.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const issuer = await checkIssuer();
        if (!issuer) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const activity = await loadPermittedActivity(issuer, id);
        if (!activity) {
            return NextResponse.json({ message: 'Activity not found or not in your scope' }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));
        const requested: string[] = Array.isArray(body?.usernames)
            ? body.usernames.filter((u: any) => typeof u === 'string').slice(0, MAX_BULK)
            : [];
        if (requested.length === 0) {
            return NextResponse.json({ message: 'Select at least one student' }, { status: 400 });
        }

        const credits = Number(body?.credits);
        if (!Number.isFinite(credits) || credits <= 0) {
            return NextResponse.json({ message: 'Enter a valid points amount' }, { status: 400 });
        }
        if (credits > MAX_CREDITS_PER_AWARD) {
            return NextResponse.json(
                { message: `Points amount exceeds the maximum of ${MAX_CREDITS_PER_AWARD} per award` },
                { status: 400 }
            );
        }
        const reason = typeof body?.reason === 'string' && body.reason.trim()
            ? body.reason.trim()
            : `Completed "${activity.title}"`;

        // Verify every requested username is a real, enrolled student before
        // writing anything — the client's selection is never trusted.
        const placeholders = requested.map(() => '?').join(',');
        const [enrolledRows]: any = await pool.execute(
            `SELECT username FROM activity_enrollments WHERE activity_code = ? AND username IN (${placeholders})`,
            [id, ...requested]
        );
        const enrolled: string[] = enrolledRows.map((r: any) => r.username);
        const skipped = requested.filter((u) => !enrolled.includes(u));

        if (enrolled.length === 0) {
            return NextResponse.json(
                { success: false, message: 'None of the selected students are enrolled in this activity', awarded: 0, skipped: skipped.length },
                { status: 400 }
            );
        }

        for (const username of enrolled) {
            await pool.execute(
                `INSERT INTO sdc_transactions (username, credits, domain, category, description, granted_by, granted_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [username, credits, activity.domain ?? null, `Activity: ${activity.code}`, reason, issuer.decoded.username]
            );
        }

        return NextResponse.json({
            success: true,
            awarded: enrolled.length,
            skipped: skipped.length,
            message: `Awarded ${credits} point${credits === 1 ? '' : 's'} to ${enrolled.length} student${enrolled.length === 1 ? '' : 's'}.`,
        });
    } catch (error: any) {
        console.error('Bulk points award error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Could not award points') }, { status: 500 });
    }
}

// DELETE — revoke points previously awarded via this activity for the given
// students. sdc_transactions is an append-only ledger with no separate
// running total anywhere (every total is SUM(credits) at query time), so
// deleting the matching row(s) is sufficient — there's nothing else to fix
// up. Only rows granted BY THE CURRENT ISSUER are removed, so a lead can't
// erase points an admin/faculty awarded for the same activity; rows awarded
// by someone else are left untouched.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const issuer = await checkIssuer();
        if (!issuer) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const activity = await loadPermittedActivity(issuer, id);
        if (!activity) {
            return NextResponse.json({ message: 'Activity not found or not in your scope' }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));
        const requested: string[] = Array.isArray(body?.usernames)
            ? body.usernames.filter((u: any) => typeof u === 'string').slice(0, MAX_BULK)
            : [];
        if (requested.length === 0) {
            return NextResponse.json({ message: 'Select at least one student' }, { status: 400 });
        }

        const placeholders = requested.map(() => '?').join(',');
        const [result]: any = await pool.execute(
            `DELETE FROM sdc_transactions WHERE category = ? AND granted_by = ? AND username IN (${placeholders})`,
            [`Activity: ${activity.code}`, issuer.decoded.username, ...requested]
        );

        return NextResponse.json({
            success: true,
            revoked: result.affectedRows,
            message: `Revoked points from ${requested.length} student${requested.length === 1 ? '' : 's'}.`,
        });
    } catch (error: any) {
        console.error('Points revoke error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Could not revoke points') }, { status: 500 });
    }
}
