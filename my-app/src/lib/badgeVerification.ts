import pool from '@/lib/db';

const VERIFY_ORIGIN = 'https://sacactivities.kluniversity.in';

// Demo badges used for showcase/marketing links - not real DB rows.
const DEMO_BADGES: Record<string, any> = {
    'v-demo-hwb-ma': { code: 'B-HWB-MA', name: 'Mindful Achiever', icon: '🧘', domain: 'HWB', rarity: 'Epic', color: '#DC2626', bg: '#FEF2F2', comp: ['Mindfulness', 'Emotional Regulation', 'Resilience'], desc: 'Awarded for consistently demonstrating mindfulness practices, supporting peers, and maintaining a balanced approach to academic and personal challenges.' },
    'v-demo-eso-ym': { code: 'B-ESO-YM', name: 'Young Mentor', icon: '🤝', domain: 'ESO', rarity: 'Rare', color: '#059669', bg: '#ECFDF5', comp: ['Leadership', 'Communication', 'Empathy', 'Guidance'], desc: 'Recognized for outstanding peer-to-peer mentoring, guiding fellow students in academic and co-curricular activities, and fostering a supportive community.' },
    'v-demo-eso-ew': { code: 'B-ESO-EW', name: 'Eco Warrior', icon: '🌍', domain: 'ESO', rarity: 'Epic', color: '#059669', bg: '#ECFDF5', comp: ['Sustainability', 'Environmental Awareness', 'Project Management'], desc: 'Awarded for significant contributions to campus sustainability, leading environmental campaigns, and promoting eco-friendly practices.' },
    'v-demo-hwb-mha': { code: 'B-HWB-MHA', name: 'Mental Health Ally', icon: '🧠', domain: 'HWB', rarity: 'Legendary', color: '#DC2626', bg: '#FEF2F2', comp: ['Advocacy', 'Active Listening', 'Mental Health First Aid'], desc: 'Honored for exceptional advocacy for mental health awareness, organizing support workshops, and actively contributing to a stigma-free campus environment.' },
};

// A badge's `earned_from` column sometimes contains an internal note like
// "Awarded by admin: 2400030188" (the admin's own username, not anything
// meaningful to the recipient/viewer). Never surface that verbatim -
// fall back to something presentable instead.
export function presentableRecognition(earnedFrom: string | null | undefined, requirement: string | null | undefined, badgeName: string) {
    const raw = (earnedFrom || '').trim();
    if (raw && !/^awarded by (admin|faculty|lead)\s*:/i.test(raw)) {
        return raw;
    }
    if (requirement && requirement.trim()) return requirement.trim();
    return `Recognized for outstanding achievement in "${badgeName}"`;
}

export type BadgeVerificationResult =
    | { valid: true; badge: any; recipient: any; issuer: any }
    | { valid: false; message: string };

/**
 * Looks up a badge verification record directly from the database.
 * Used by both the API route and the verify page's server component, so
 * the page never has to make a slow self-referential HTTP call to its own
 * API during SSR (that round-trip was the main cause of the verify page
 * taking a long time to load).
 */
export async function getBadgeVerification(verificationId: string): Promise<BadgeVerificationResult> {
    if (!verificationId || typeof verificationId !== 'string' || verificationId.length > 100) {
        return { valid: false, message: 'Verification ID is required' };
    }

    if (DEMO_BADGES[verificationId]) {
        const db = DEMO_BADGES[verificationId];
        return {
            valid: true,
            badge: {
                id: 900,
                verificationId,
                shareUrl: `${VERIFY_ORIGIN}/badges/verify/${verificationId}`,
                issuedOn: 'Jul 14, 2026',
                earnedFrom: 'SAMAM Program Milestones',
                awardedBy: 'SAMAM Administration',
                code: db.code,
                name: db.name,
                icon: db.icon,
                domain: db.domain,
                rarity: db.rarity,
                color: db.color,
                bgColor: db.bg,
                description: db.desc,
                competencies: db.comp,
                requirement: 'Successfully fulfilled all criteria for this milestone.',
            },
            recipient: {
                username: '2400000000',
                name: 'Demo Student',
                branch: 'CSE',
                year: '3rd',
                institution: 'KL University',
            },
            issuer: {
                name: 'SAMAM Activity Management Program',
                institution: 'KL University',
                website: VERIFY_ORIGIN,
            },
        };
    }

    const [rows] = await pool.execute(`
        SELECT
            sb.id            AS student_badge_id,
            sb.username,
            sb.verification_id,
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
        return { valid: false, message: 'Badge not found or verification ID is invalid' };
    }

    const row = rows[0];
    const competencies = typeof row.competencies === 'string'
        ? JSON.parse(row.competencies)
        : (row.competencies || []);

    return {
        valid: true,
        badge: {
            id: row.student_badge_id,
            verificationId: row.verification_id,
            // Always derived from verificationId + the canonical production
            // domain, never trusted from a raw DB `share_url` column.
            shareUrl: `${VERIFY_ORIGIN}/badges/verify/${row.verification_id}`,
            issuedOn: row.issued_on,
            earnedFrom: presentableRecognition(row.earned_from, row.requirement, row.badge_name),
            awardedBy: row.awarded_by,
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
            website: VERIFY_ORIGIN,
        },
    };
}
