import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ verificationId: string }> }
) {
    try {
        const { verificationId } = await params;
        if (!verificationId) {
            return NextResponse.json({ message: 'Verification ID is required' }, { status: 400 });
        }

        const [rows] = await pool.execute(`
            SELECT
                sb.id            AS student_badge_id,
                sb.username,
                sb.verification_id,
                sb.share_url,
                sb.earned_from,
                sb.issued_on,
                sb.awarded_by,
                s.name           AS student_name,
                s.branch         AS student_branch,
                s.year           AS student_year,
                bd.id            AS badge_id,
                bd.code,
                bd.name          AS badge_name,
                bd.icon,
                bd.domain,
                bd.rarity,
                bd.color,
                bd.bg_color,
                bd.description   AS badge_description,
                bd.competencies,
                bd.requirement
            FROM student_badges sb
            LEFT JOIN students       s  ON sb.username  = s.username
            JOIN badge_definitions bd ON sb.badge_id = bd.id
            WHERE sb.verification_id = ?
        `, [verificationId]) as any[];

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Badge not found or verification ID is invalid' }, { status: 404 });
        }

        const row = rows[0];
        const competencies = typeof row.competencies === 'string'
            ? JSON.parse(row.competencies)
            : (row.competencies || []);

        return NextResponse.json({
            valid: true,
            badge: {
                id: row.student_badge_id,
                verificationId: row.verification_id,
                shareUrl: row.share_url,
                issuedOn: row.issued_on,
                earnedFrom: row.earned_from,
                awardedBy: row.awarded_by,
                // Badge definition
                code: row.code,
                name: row.badge_name,
                icon: row.icon,
                domain: row.domain,
                rarity: row.rarity,
                color: row.color,
                bgColor: row.bg_color,
                description: row.badge_description,
                competencies,
                requirement: row.requirement,
            },
            recipient: {
                username: row.username,
                name: row.student_name || 'Student',
                branch: row.student_branch || 'N/A',
                year: row.student_year || 'N/A',
                institution: 'KL University',
            },
            issuer: {
                name: 'SAMAM Activity Management Program',
                institution: 'KL University',
                website: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            },
        });

    } catch (error: any) {
        console.error('Badge verification error:', error);
        return NextResponse.json({ error: 'Verification failed', details: error.message }, { status: 500 });
    }
}
