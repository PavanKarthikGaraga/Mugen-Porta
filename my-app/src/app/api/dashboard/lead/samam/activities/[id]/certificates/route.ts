import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { safeMessage } from '@/lib/apiSecurity';
import {
    ensureCertificatesTable, newCertificateVerificationId,
} from '@/lib/certificateVerification';
import { checkIssuer, loadPermittedActivity } from '@/lib/samamActivityAuth';

export const dynamic = 'force-dynamic';

/**
 * Certificate issuance for a single activity.
 *
 * Certificates are never generated automatically: an admin, council,
 * faculty, or lead explicitly issues them for students whose enrollment is
 * marked completed. Non-admin/faculty issuers are restricted to activities
 * within their own scope — see @/lib/samamActivityAuth.
 */

const MAX_BULK = 500;

// GET — enrolled students for this activity with their completion and
// certificate status, so the lead can see who is eligible.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const issuer = await checkIssuer();
        if (!issuer) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await ensureCertificatesTable();

        const activity = await loadPermittedActivity(issuer, id);
        if (!activity) {
            return NextResponse.json({ message: 'Activity not found or not in your assigned categories' }, { status: 403 });
        }

        const [rows]: any = await pool.execute(`
            SELECT
                ae.username, s.name, ae.status AS enrollment_status,
                ae.attendance_percentage,
                sc.verification_id, sc.issued_on, sc.issued_by_name,
                (SELECT COALESCE(SUM(credits), 0) FROM sdc_transactions st
                 WHERE st.username = ae.username AND st.category = CONCAT('Activity: ', ae.activity_code)) AS points_from_activity
            FROM activity_enrollments ae
            JOIN students s ON ae.username = s.username
            LEFT JOIN student_certificates sc
                ON sc.username = ae.username AND sc.activity_code = ae.activity_code
                AND sc.status = 'issued'
            WHERE ae.activity_code = ?
            ORDER BY s.name ASC
        `, [id]);

        // The badge mapped to this activity, if any. Surfacing it lets the
        // Activity Awards UI offer it directly instead of making the user
        // hunt for it in the full badge catalogue.
        let mappedBadge: any = null;
        const badgeHolders = new Set<string>();
        if (activity.badge_id) {
            try {
                const [badgeRows]: any = await pool.execute(
                    'SELECT id, name, icon, domain, rarity FROM badge_definitions WHERE id = ? LIMIT 1',
                    [activity.badge_id]
                );
                if (badgeRows.length > 0) mappedBadge = badgeRows[0];

                // Who among these students already holds it — its own guarded
                // query, since student_badges may not exist in every env.
                const [holderRows]: any = await pool.execute(
                    'SELECT username FROM student_badges WHERE badge_id = ?',
                    [activity.badge_id]
                );
                for (const h of holderRows) badgeHolders.add(h.username);
            } catch { /* badge table may not exist yet — fall back to the picker */ }
        }

        return NextResponse.json({
            success: true,
            activity: {
                code: activity.code, title: activity.title, domain: activity.domain,
                credits: activity.sdc_credits, badge: mappedBadge,
            },
            students: rows.map((r: any) => ({
                username: r.username,
                name: r.name,
                enrollmentStatus: r.enrollment_status,
                attendance: r.attendance_percentage || 0,
                eligible: r.enrollment_status === 'completed',
                certificate: r.verification_id
                    ? { verificationId: r.verification_id, issuedOn: r.issued_on, issuedByName: r.issued_by_name }
                    : null,
                pointsFromActivity: Number(r.points_from_activity) || 0,
                badgeAwarded: badgeHolders.has(r.username),
            })),
        });
    } catch (error: any) {
        console.error('Certificate list error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Could not load certificate status') }, { status: 500 });
    }
}

// POST — issue certificates for the given usernames.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const issuer = await checkIssuer();
        if (!issuer) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await ensureCertificatesTable();

        const activity = await loadPermittedActivity(issuer, id);
        if (!activity) {
            return NextResponse.json({ message: 'Activity not found or not in your assigned categories' }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));
        const requested: string[] = Array.isArray(body?.usernames)
            ? body.usernames.filter((u: any) => typeof u === 'string').slice(0, MAX_BULK)
            : [];
        if (requested.length === 0) {
            return NextResponse.json({ message: 'Select at least one student' }, { status: 400 });
        }

        // Only students whose enrollment in THIS activity is completed are
        // eligible — the client's list is never trusted.
        const placeholders = requested.map(() => '?').join(',');
        const [eligibleRows]: any = await pool.execute(
            `SELECT username FROM activity_enrollments
             WHERE activity_code = ? AND status = 'completed' AND username IN (${placeholders})`,
            [id, ...requested]
        );
        const eligible = eligibleRows.map((r: any) => r.username);
        const skipped = requested.filter((u) => !eligible.includes(u));

        if (eligible.length === 0) {
            return NextResponse.json(
                { success: false, message: 'None of the selected students have completed this activity', issued: 0, skipped: skipped.length },
                { status: 400 }
            );
        }

        let issued = 0;

        for (const username of eligible) {
            // ON DUPLICATE KEY UPDATE keeps re-issuing idempotent (a student
            // who already has an active certificate keeps their original id
            // and verification_id — only status changes) while also letting a
            // previously revoked certificate be reactivated, which a plain
            // INSERT IGNORE could never do once the unique key row existed.
            const [result]: any = await pool.execute(
                `INSERT INTO student_certificates
                    (username, activity_code, activity_title, domain, credits, verification_id, issued_by, issued_by_name, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'issued')
                 ON DUPLICATE KEY UPDATE status = 'issued'`,
                [
                    username, activity.code, activity.title, activity.domain ?? null,
                    activity.sdc_credits ?? null, newCertificateVerificationId(),
                    // issued_by keeps the real username for internal audit
                    // trail; issued_by_name is the public-facing
                    // institutional title shown on the certificate, never
                    // the individual issuer's actual name.
                    issuer.decoded.username, 'DIRECTOR-SAC',
                ]
            );
            // MySQL reports 1 for a fresh insert, 2 for a reactivated (changed)
            // row, and 0 when a certificate was already active — all three are
            // "this student now has a valid certificate", just for reporting
            // "issued" only counts the ones that changed.
            if (result.affectedRows > 0) issued++;
        }

        return NextResponse.json({
            success: true,
            issued,
            alreadyIssued: eligible.length - issued,
            skipped: skipped.length,
            message: `Issued ${issued} certificate${issued === 1 ? '' : 's'}.`,
        });
    } catch (error: any) {
        console.error('Certificate issue error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Could not issue certificates') }, { status: 500 });
    }
}

// DELETE — revoke previously issued certificates for the given usernames.
// Soft-revoke (status = 'revoked') rather than deleting the row: the public
// verification page already treats any non-'issued' status as invalid (see
// @/lib/certificateVerification), and keeping the row preserves who issued
// it and when for audit purposes, plus lets it be reactivated later via POST.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const issuer = await checkIssuer();
        if (!issuer) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await ensureCertificatesTable();

        const activity = await loadPermittedActivity(issuer, id);
        if (!activity) {
            return NextResponse.json({ message: 'Activity not found or not in your assigned categories' }, { status: 403 });
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
            `UPDATE student_certificates SET status = 'revoked'
             WHERE activity_code = ? AND username IN (${placeholders}) AND status = 'issued'`,
            [id, ...requested]
        );

        return NextResponse.json({
            success: true,
            revoked: result.affectedRows,
            message: `Revoked ${result.affectedRows} certificate${result.affectedRows === 1 ? '' : 's'}.`,
        });
    } catch (error: any) {
        console.error('Certificate revoke error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Could not revoke certificates') }, { status: 500 });
    }
}
