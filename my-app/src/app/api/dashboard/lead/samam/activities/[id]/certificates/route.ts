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
                sc.verification_id, sc.issued_on, sc.issued_by_name
            FROM activity_enrollments ae
            JOIN students s ON ae.username = s.username
            LEFT JOIN student_certificates sc
                ON sc.username = ae.username AND sc.activity_code = ae.activity_code
            WHERE ae.activity_code = ?
            ORDER BY s.name ASC
        `, [id]);

        // The badge mapped to this activity, if any. Surfacing it lets the
        // Activity Awards UI offer it directly instead of making the user
        // hunt for it in the full badge catalogue.
        let mappedBadge: any = null;
        if (activity.badge_id) {
            try {
                const [badgeRows]: any = await pool.execute(
                    'SELECT id, name, icon, domain, rarity FROM badge_definitions WHERE id = ? LIMIT 1',
                    [activity.badge_id]
                );
                if (badgeRows.length > 0) mappedBadge = badgeRows[0];
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
            // INSERT IGNORE keeps re-issuing idempotent: a student who already
            // has a certificate for this activity keeps their original id.
            const [result]: any = await pool.execute(
                `INSERT IGNORE INTO student_certificates
                    (username, activity_code, activity_title, domain, credits, verification_id, issued_by, issued_by_name)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
