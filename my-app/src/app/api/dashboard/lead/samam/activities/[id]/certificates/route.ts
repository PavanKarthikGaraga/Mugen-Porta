import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import {
    ensureCertificatesTable, newCertificateVerificationId,
} from '@/lib/certificateVerification';

export const dynamic = 'force-dynamic';

/**
 * Certificate issuance for a single activity.
 *
 * Certificates are never generated automatically: a lead (or faculty/admin)
 * explicitly issues them for students whose enrollment is marked completed.
 * Leads are additionally restricted to activities inside their own assigned
 * categories, matching the existing attendance route's authorisation model.
 */

const MAX_BULK = 500;

async function checkIssuer() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded: any = await verifyToken(token);
    if (!decoded) return null;

    // Faculty and admins may issue for any activity.
    if (decoded.role === 'faculty' || decoded.role === 'admin') {
        return { decoded, unrestricted: true, assigned_categories: [] as string[] };
    }
    if (decoded.role !== 'lead') return null;

    let leadRows: any[] = [];
    try {
        const [rows]: any = await pool.execute(
            'SELECT clubId, assigned_categories FROM leads WHERE username = ?', [decoded.username]
        );
        leadRows = rows;
    } catch (e: any) {
        if (e.code === 'ER_BAD_FIELD_ERROR' || e.message?.includes('assigned_categories')) {
            const [rows]: any = await pool.execute('SELECT clubId FROM leads WHERE username = ?', [decoded.username]);
            leadRows = rows;
        } else throw e;
    }
    if (leadRows.length === 0) return null;

    let assigned_categories: string[] = [];
    if (leadRows[0].assigned_categories) {
        try {
            assigned_categories = typeof leadRows[0].assigned_categories === 'string'
                ? JSON.parse(leadRows[0].assigned_categories)
                : leadRows[0].assigned_categories;
        } catch { /* treat as none */ }
    }
    return { decoded, unrestricted: false, assigned_categories };
}

// Confirms the caller is allowed to act on this activity and returns it.
async function loadPermittedActivity(issuer: any, code: string) {
    if (issuer.unrestricted) {
        const [rows]: any = await pool.execute(
            'SELECT code, title, category, sdc_credits FROM activity_catalogue WHERE code = ? LIMIT 1', [code]
        );
        return rows[0] || null;
    }
    if (!issuer.assigned_categories || issuer.assigned_categories.length === 0) return null;
    const placeholders = issuer.assigned_categories.map(() => '?').join(',');
    const [rows]: any = await pool.execute(
        `SELECT code, title, category, sdc_credits FROM activity_catalogue
         WHERE code = ? AND category IN (${placeholders}) LIMIT 1`,
        [code, ...issuer.assigned_categories]
    );
    return rows[0] || null;
}

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

        return NextResponse.json({
            success: true,
            activity: { code: activity.code, title: activity.title, domain: activity.category, credits: activity.sdc_credits },
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

        const issuerName = issuer.decoded.name || issuer.decoded.username;
        let issued = 0;

        for (const username of eligible) {
            // INSERT IGNORE keeps re-issuing idempotent: a student who already
            // has a certificate for this activity keeps their original id.
            const [result]: any = await pool.execute(
                `INSERT IGNORE INTO student_certificates
                    (username, activity_code, activity_title, domain, credits, verification_id, issued_by, issued_by_name)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    username, activity.code, activity.title, activity.category,
                    activity.sdc_credits ?? null, newCertificateVerificationId(),
                    issuer.decoded.username, issuerName,
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
