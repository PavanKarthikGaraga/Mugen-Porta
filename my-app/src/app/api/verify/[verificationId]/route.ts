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

        // Demo badge interceptor
        const demoMap: Record<string, any> = {
            'v-demo-hwb-ma': { code: 'B-HWB-MA', name: 'Mindful Achiever', icon: '🧘', domain: 'HWB', rarity: 'Epic', color: '#DC2626', bg: '#FEF2F2', comp: ['Mindfulness', 'Emotional Regulation', 'Resilience'], desc: 'Awarded for consistently demonstrating mindfulness practices, supporting peers, and maintaining a balanced approach to academic and personal challenges.' },
            'v-demo-eso-ym': { code: 'B-ESO-YM', name: 'Young Mentor', icon: '🤝', domain: 'ESO', rarity: 'Rare', color: '#059669', bg: '#ECFDF5', comp: ['Leadership', 'Communication', 'Empathy', 'Guidance'], desc: 'Recognized for outstanding peer-to-peer mentoring, guiding fellow students in academic and co-curricular activities, and fostering a supportive community.' },
            'v-demo-eso-ew': { code: 'B-ESO-EW', name: 'Eco Warrior', icon: '🌍', domain: 'ESO', rarity: 'Epic', color: '#059669', bg: '#ECFDF5', comp: ['Sustainability', 'Environmental Awareness', 'Project Management'], desc: 'Awarded for significant contributions to campus sustainability, leading environmental campaigns, and promoting eco-friendly practices.' },
            'v-demo-hwb-mha': { code: 'B-HWB-MHA', name: 'Mental Health Ally', icon: '🧠', domain: 'HWB', rarity: 'Legendary', color: '#DC2626', bg: '#FEF2F2', comp: ['Advocacy', 'Active Listening', 'Mental Health First Aid'], desc: 'Honored for exceptional advocacy for mental health awareness, organizing support workshops, and actively contributing to a stigma-free campus environment.' }
        };

        if (demoMap[verificationId]) {
            const db = demoMap[verificationId];
            return NextResponse.json({
                valid: true,
                badge: {
                    id: 900,
                    verificationId,
                    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${verificationId}`,
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
                    requirement: 'Successfully fulfilled all criteria for this milestone.'
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
                    website: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                },
            });
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
