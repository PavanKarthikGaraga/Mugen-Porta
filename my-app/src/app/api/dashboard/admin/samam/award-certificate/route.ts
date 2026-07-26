import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import {
    ensureCertificatesTable, newCertificateVerificationId, certificateVerifyUrl,
} from '@/lib/certificateVerification';

export const dynamic = 'force-dynamic';

/**
 * Manual certificate issuance from the admin dashboard.
 *
 * This is the deliberate override path: normally a lead issues certificates
 * only to students whose enrollment is marked completed. An admin can issue
 * directly for a chosen activity, so the response reports the student's actual
 * enrollment state and the caller surfaces it — an admin should be able to see
 * that they are issuing to someone who never enrolled, rather than doing it
 * blindly.
 */

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded: any = await verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'faculty')) return null;
    return decoded;
}

// GET /api/dashboard/admin/samam/award-certificate?username=...&code=...
// Reports whether a certificate already exists and the enrollment state,
// so the admin form can warn before issuing.
export async function GET(request: Request) {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        await ensureCertificatesTable();
        const { searchParams } = new URL(request.url);
        const username = (searchParams.get('username') || '').trim();
        const code = (searchParams.get('code') || '').trim();
        if (!username || !code) {
            return NextResponse.json({ message: 'username and code are required' }, { status: 400 });
        }

        const [certRows]: any = await pool.execute(
            `SELECT verification_id, issued_on FROM student_certificates
             WHERE username = ? AND activity_code = ? LIMIT 1`,
            [username, code]
        );
        const [enrollRows]: any = await pool.execute(
            `SELECT status FROM activity_enrollments WHERE username = ? AND activity_code = ? LIMIT 1`,
            [username, code]
        );

        return NextResponse.json({
            success: true,
            existing: certRows[0]
                ? { verificationId: certRows[0].verification_id, issuedOn: certRows[0].issued_on }
                : null,
            enrollmentStatus: enrollRows[0]?.status || null,
        });
    } catch (error: any) {
        console.error('Award-certificate lookup error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Could not check certificate status') }, { status: 500 });
    }
}

// POST — issue a certificate for a student + activity.
export async function POST(request: Request) {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        await ensureCertificatesTable();

        const body = await request.json().catch(() => ({}));
        const username = typeof body?.username === 'string' ? body.username.trim() : '';
        const code = typeof body?.activityCode === 'string' ? body.activityCode.trim() : '';

        if (!username || !code) {
            return NextResponse.json({ message: 'Student and activity are required' }, { status: 400 });
        }

        const [students]: any = await pool.execute(
            `SELECT username, name FROM students WHERE username = ? LIMIT 1`, [username]
        );
        if (students.length === 0) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        const [acts]: any = await pool.execute(
            `SELECT code, title, category, sdc_credits FROM activity_catalogue WHERE code = ? LIMIT 1`, [code]
        );
        if (acts.length === 0) {
            return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
        }
        const activity = acts[0];

        // Already issued? Return the existing credential rather than creating a
        // second one — a student should never hold two certificates for the
        // same activity.
        const [existing]: any = await pool.execute(
            `SELECT verification_id FROM student_certificates
             WHERE username = ? AND activity_code = ? LIMIT 1`,
            [username, code]
        );
        if (existing.length > 0) {
            return NextResponse.json({
                success: true,
                alreadyIssued: true,
                verificationId: existing[0].verification_id,
                verifyUrl: certificateVerifyUrl(existing[0].verification_id),
                message: `${students[0].name} already holds a certificate for this activity.`,
            });
        }

        const verificationId = newCertificateVerificationId();
        await pool.execute(
            `INSERT INTO student_certificates
                (username, activity_code, activity_title, domain, credits, verification_id, issued_by, issued_by_name)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username, activity.code, activity.title, activity.category,
                activity.sdc_credits ?? null, verificationId,
                admin.username, admin.name || admin.username,
            ]
        );

        return NextResponse.json({
            success: true,
            alreadyIssued: false,
            verificationId,
            verifyUrl: certificateVerifyUrl(verificationId),
            message: `Certificate issued to ${students[0].name} for "${activity.title}".`,
        });
    } catch (error: any) {
        console.error('Award-certificate error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Could not issue the certificate') }, { status: 500 });
    }
}
