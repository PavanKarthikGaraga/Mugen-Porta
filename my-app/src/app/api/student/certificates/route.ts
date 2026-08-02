import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { ensureCertificatesTable, formatIssuedOn } from '@/lib/certificateVerification';

export const dynamic = 'force-dynamic';

// GET /api/student/certificates — the logged-in student's issued certificates.
// Scoped to their own username; no username is accepted from the caller.
export async function GET() {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureCertificatesTable();

        const [rows]: any = await pool.execute(`
            SELECT
                sc.id, sc.activity_code, sc.activity_title, sc.domain, sc.credits,
                sc.verification_id, sc.issued_by_name, sc.issued_on,
                s.name AS student_name, s.branch AS student_branch,
                ac.title AS catalogue_title
            FROM student_certificates sc
            LEFT JOIN students s ON sc.username = s.username
            LEFT JOIN activity_catalogue ac ON sc.activity_code = ac.code
            WHERE sc.username = ? AND sc.status = 'issued'
            ORDER BY sc.issued_on DESC
        `, [auth.user.username]);

        return NextResponse.json({
            success: true,
            certificates: rows.map((r: any) => ({
                id: r.id,
                verificationId: r.verification_id,
                activityCode: r.activity_code,
                activityTitle: r.activity_title || r.catalogue_title || r.activity_code,
                domain: r.domain,
                credits: r.credits,
                issuedOn: formatIssuedOn(r.issued_on),
                // Institutional title only, never the issuing staff member's
                // actual name.
                issuedByName: 'DIRECTOR-SAC',
                studentName: r.student_name || auth.user.username,
                studentUsername: auth.user.username,
                branch: r.student_branch || null,
            })),
        });
    } catch (error: any) {
        console.error('Student certificates error:', error);
        return NextResponse.json(
            { success: false, error: safeMessage(error, 'Could not load your certificates') },
            { status: 500 }
        );
    }
}
