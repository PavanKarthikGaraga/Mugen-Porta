import { Metadata } from 'next';
import pool from '@/lib/db';
import BadgeVerifyClient from './BadgeVerifyClient';

// ── Helpers ────────────────────────────────────────────────────────────────
const RARITY_STYLE: Record<string, { ring: string; glow: string; label: string; labelColor: string }> = {
    Legendary: { ring: 'ring-amber-400', glow: 'shadow-amber-300/40', label: 'Legendary', labelColor: '#D97706' },
    Epic:      { ring: 'ring-purple-400', glow: 'shadow-purple-300/40', label: 'Epic', labelColor: '#7C3AED' },
    Rare:      { ring: 'ring-blue-400', glow: 'shadow-blue-300/40', label: 'Rare', labelColor: '#2563EB' },
    Common:    { ring: 'ring-green-400', glow: 'shadow-green-300/40', label: 'Common', labelColor: '#059669' },
};

// ── Static metadata with dynamic OG ───────────────────────────────────────
export async function generateMetadata(
    { params }: { params: Promise<{ verificationId: string }> }
): Promise<Metadata> {
    const { verificationId } = await params;
    try {
        const [rows] = await pool.execute(`
            SELECT bd.name, bd.description, s.name AS student_name
            FROM student_badges sb
            JOIN badge_definitions bd ON sb.badge_id = bd.id
            JOIN students s ON sb.username = s.username
            WHERE sb.verification_id = ?
        `, [verificationId]) as any[];

        if (rows?.length > 0) {
            const r = rows[0];
            const title = `${r.student_name} earned "${r.name}" | SAMAM`;
            const description = `${r.student_name} was awarded the "${r.name}" digital badge by KL University SAMAM. ${r.description || ''}`;
            return {
                title,
                description,
                openGraph: {
                    title,
                    description,
                    type: 'website',
                    siteName: 'SAMAM — KL University',
                },
                twitter: {
                    card: 'summary',
                    title,
                    description,
                },
            };
        }
    } catch {}
    return {
        title: 'Badge Verification | SAMAM',
        description: 'Verify a SAMAM digital badge issued by KL University.',
    };
}

// ── Page ──────────────────────────────────────────────────────────────────
export default async function BadgeVerifyPage(
    { params }: { params: Promise<{ verificationId: string }> }
) {
    const { verificationId } = await params;
    return <BadgeVerifyClient verificationId={verificationId} />;
}
