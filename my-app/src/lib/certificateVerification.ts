import pool from '@/lib/db';
import crypto from 'crypto';

const VERIFY_ORIGIN = 'https://sacactivities.kluniversity.in';
const ISSUER_INSTITUTION = 'KL SAC (Student Activity Center)';

/**
 * Certificates are issued explicitly by a club lead or faculty member for a
 * completed activity enrollment — completion alone does not produce one.
 * Each carries a unique verification id backing a public verify page.
 */

let tableReady = false;
export async function ensureCertificatesTable() {
    if (tableReady) return;
    await pool.query(`
        CREATE TABLE IF NOT EXISTS student_certificates (
            \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
            \`username\` VARCHAR(10) NOT NULL,
            \`activity_code\` VARCHAR(50) NOT NULL,
            \`activity_title\` VARCHAR(255) DEFAULT NULL,
            \`domain\` VARCHAR(10) DEFAULT NULL,
            \`credits\` INT DEFAULT NULL,
            \`verification_id\` VARCHAR(64) NOT NULL,
            \`issued_by\` VARCHAR(10) DEFAULT NULL,
            \`issued_by_name\` VARCHAR(120) DEFAULT NULL,
            \`status\` VARCHAR(16) NOT NULL DEFAULT 'issued',
            \`issued_on\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_cert_student_activity (\`username\`, \`activity_code\`),
            UNIQUE KEY uq_cert_verification (\`verification_id\`),
            INDEX idx_cert_activity (\`activity_code\`)
        )
    `);
    tableReady = true;
}

export function newCertificateVerificationId() {
    return `SAMAM-CERT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

export function certificateVerifyUrl(verificationId: string) {
    return `${VERIFY_ORIGIN}/certificates/verify/${verificationId}`;
}

export function formatIssuedOn(value: any) {
    const d = value ? new Date(value) : new Date();
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Deliberately a single shape with optional members rather than a
 * discriminated union: this project compiles with `strict: false`, and with
 * strictNullChecks disabled TypeScript will not narrow a union by a boolean
 * discriminant, so `if (!result.valid)` would leave `message` unreachable.
 */
export interface CertificateVerificationResult {
    valid: boolean;
    message?: string;
    certificate?: any;
    recipient?: any;
    issuer?: any;
}

/**
 * Looks a certificate up straight from the database. Used by the public
 * verify page's server component so it never has to make a slow
 * self-referential HTTP call to its own API during SSR — the same problem
 * that made the badge verify page slow.
 */
export async function getCertificateVerification(verificationId: string): Promise<CertificateVerificationResult> {
    if (!verificationId || typeof verificationId !== 'string' || verificationId.length > 64) {
        return { valid: false, message: 'Verification ID is required' };
    }

    try {
        await ensureCertificatesTable();

        const [rows]: any = await pool.execute(`
            SELECT
                sc.id, sc.username, sc.activity_code, sc.activity_title, sc.domain,
                sc.credits, sc.verification_id, sc.issued_by_name, sc.issued_on, sc.status,
                s.name AS student_name, s.branch AS student_branch, s.year AS student_year,
                ac.title AS catalogue_title, ac.category AS catalogue_category
            FROM student_certificates sc
            LEFT JOIN students s ON sc.username = s.username
            LEFT JOIN activity_catalogue ac ON sc.activity_code = ac.code
            WHERE sc.verification_id = ?
            LIMIT 1
        `, [verificationId]);

        if (!rows || rows.length === 0) {
            return { valid: false, message: 'Certificate not found or verification ID is invalid' };
        }

        const row = rows[0];
        if (row.status && row.status !== 'issued') {
            return { valid: false, message: 'This certificate has been revoked and is no longer valid' };
        }

        return {
            valid: true,
            certificate: {
                id: row.id,
                verificationId: row.verification_id,
                shareUrl: certificateVerifyUrl(row.verification_id),
                activityCode: row.activity_code,
                activityTitle: row.activity_title || row.catalogue_title || row.activity_code,
                domain: row.domain || row.catalogue_category || null,
                credits: row.credits,
                issuedOn: formatIssuedOn(row.issued_on),
                // Always shown as the institutional title, never the actual
                // staff member's name, regardless of who issued it or what
                // is stored in issued_by_name.
                issuedByName: 'DIRECTOR-SAC',
            },
            recipient: {
                username: row.username,
                name: row.student_name || 'Student',
                branch: row.student_branch || null,
                year: row.student_year || null,
                institution: ISSUER_INSTITUTION,
            },
            issuer: {
                name: 'SAMAM Activity Management Program',
                institution: ISSUER_INSTITUTION,
                website: VERIFY_ORIGIN,
            },
        };
    } catch (error) {
        console.error('Certificate verification error:', error);
        return { valid: false, message: 'Could not verify this certificate right now' };
    }
}
