import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;
        if (!username) return NextResponse.json({ message: "Username is required" }, { status: 400 });

        // 1. Fetch earned badges
        const [earnedRows] = await pool.execute(`
            SELECT 
                sb.id as student_badge_id, sb.verification_id, sb.share_url, sb.earned_from, sb.issued_on,
                bd.id as badge_id, bd.code, bd.name, bd.icon, bd.domain, bd.rarity, 
                bd.color, bd.bg_color, bd.description, bd.competencies
            FROM student_badges sb
            JOIN badge_definitions bd ON sb.badge_id = bd.id
            WHERE sb.username = ?
            ORDER BY sb.issued_on DESC
        `, [username]) as any[];

        const earnedBadges = earnedRows.map((row: any) => ({
            id: row.student_badge_id,
            code: row.code,
            name: row.name,
            icon: row.icon || '🏅',
            domain: row.domain,
            rarity: row.rarity,
            color: row.color,
            bg: row.bg_color,
            issuedOn: new Date(row.issued_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            earnedFrom: row.earned_from,
            competencies: typeof row.competencies === 'string' ? JSON.parse(row.competencies) : row.competencies,
            description: row.description,
            verificationId: row.verification_id,
            shareUrl: row.share_url
        }));

        const earnedBadgeIds = earnedRows.map((row: any) => row.badge_id);
        let lockedRows: any[] = [];

        // 2. Fetch locked badges
        if (earnedBadgeIds.length > 0) {
            const placeholders = earnedBadgeIds.map(() => '?').join(',');
            const [rows] = await pool.execute(`
                SELECT * FROM badge_definitions 
                WHERE is_active = 1 AND id NOT IN (${placeholders})
            `, earnedBadgeIds) as any[];
            lockedRows = rows;
        } else {
            const [rows] = await pool.execute(`SELECT * FROM badge_definitions WHERE is_active = 1`) as any[];
            lockedRows = rows;
        }

        // 3. Pre-compute user stats to calculate progress
        const [statsRows] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM student_activities WHERE username = ? AND status = 'approved') as total_completed,
                (SELECT SUM(credits) FROM sdc_transactions WHERE username = ?) as samam_points,
                (SELECT COUNT(*) FROM student_activities WHERE username = ? AND status = 'approved' AND domain = 'TEC') as tec_completed,
                (SELECT COUNT(*) FROM student_activities WHERE username = ? AND status = 'approved' AND domain = 'LCH') as lch_completed,
                (SELECT COUNT(*) FROM student_activities WHERE username = ? AND status = 'approved' AND domain = 'ESO') as eso_completed,
                (SELECT COUNT(*) FROM student_activities WHERE username = ? AND status = 'approved' AND domain = 'IIE') as iie_completed,
                (SELECT COUNT(*) FROM student_activities WHERE username = ? AND status = 'approved' AND domain = 'HWB') as hwb_completed
        `, [username, username, username, username, username, username, username]) as any[];

        const stats = statsRows[0];
        const samamPoints = stats.samam_points || 0;

        // Fetch enrolled activities for activity badges
        const [enrollRows] = await pool.execute(`
            SELECT catalogue_id FROM activity_registrations WHERE username = ?
        `, [username]) as any[];
        const enrolledCatalogueIds = new Set(enrollRows.map((r: any) => r.catalogue_id));

        // Get catalogue code to id mapping
        const [catRows] = await pool.execute(`SELECT id, code FROM activity_catalogue`) as any[];
        const catMap = new Map();
        for (const row of catRows) {
            catMap.set(row.code, row.id);
        }

        const formattedLockedBadges = lockedRows.map(row => {
            let progress = 0;
            let current = 0;
            const target = row.target_value || 1;
            const metric = row.metric || 'completion';
            const type = row.type || 'activity';

            if (type === 'milestone') {
                if (metric === 'activities_completed') current = stats.total_completed;
                else if (metric === 'samam_points') current = samamPoints;
                else if (metric === 'domain_tec') current = stats.tec_completed;
                else if (metric === 'domain_lch') current = stats.lch_completed;
                else if (metric === 'domain_eso') current = stats.eso_completed;
                else if (metric === 'domain_iie') current = stats.iie_completed;
                else if (metric === 'domain_hwb') current = stats.hwb_completed;
            } else if (type === 'activity') {
                // If enrolled in this activity, 50%
                const activityCode = row.code.replace('B-', '');
                const catalogueId = catMap.get(activityCode);
                if (catalogueId && enrolledCatalogueIds.has(catalogueId)) {
                    current = 1;
                    progress = 50; 
                }
            }

            if (type === 'milestone') {
                progress = Math.min(100, Math.round((current / target) * 100));
            }

            return {
                id: row.id,
                name: row.name,
                icon: row.icon || '🔒',
                rarity: row.rarity,
                type: type,
                requirement: row.requirement || `Complete requirements for ${row.name}`,
                progress: progress,
                currentValue: current,
                targetValue: target,
                metric: metric
            };
        });

        const responsePayload = {
            earned: earnedBadges,
            locked: formattedLockedBadges
        };

        if (username === '2400000000') {
            const demoBadges = [
                {
                    id: 901,
                    code: 'B-HWB-MA',
                    name: 'Mindful Achiever',
                    icon: '🧘',
                    domain: 'HWB',
                    rarity: 'Epic',
                    color: '#DC2626',
                    bg: '#FEF2F2',
                    issuedOn: 'Jul 14, 2026',
                    earnedFrom: 'SAMAM Program Milestones',
                    competencies: ['Mindfulness', 'Emotional Regulation', 'Resilience'],
                    description: 'Awarded for consistently demonstrating mindfulness practices, supporting peers, and maintaining a balanced approach to academic and personal challenges.',
                    verificationId: 'v-demo-hwb-ma',
                    shareUrl: `https://samam.klu.ac.in/verify/v-demo-hwb-ma`
                },
                {
                    id: 902,
                    code: 'B-ESO-YM',
                    name: 'Young Mentor',
                    icon: '🤝',
                    domain: 'ESO',
                    rarity: 'Rare',
                    color: '#059669',
                    bg: '#ECFDF5',
                    issuedOn: 'Jul 14, 2026',
                    earnedFrom: 'SAMAM Program Milestones',
                    competencies: ['Leadership', 'Communication', 'Empathy', 'Guidance'],
                    description: 'Recognized for outstanding peer-to-peer mentoring, guiding fellow students in academic and co-curricular activities, and fostering a supportive community.',
                    verificationId: 'v-demo-eso-ym',
                    shareUrl: `https://samam.klu.ac.in/verify/v-demo-eso-ym`
                },
                {
                    id: 903,
                    code: 'B-ESO-EW',
                    name: 'Eco Warrior',
                    icon: '🌍',
                    domain: 'ESO',
                    rarity: 'Epic',
                    color: '#059669',
                    bg: '#ECFDF5',
                    issuedOn: 'Jul 14, 2026',
                    earnedFrom: 'SAMAM Program Milestones',
                    competencies: ['Sustainability', 'Environmental Awareness', 'Project Management'],
                    description: 'Awarded for significant contributions to campus sustainability, leading environmental campaigns, and promoting eco-friendly practices.',
                    verificationId: 'v-demo-eso-ew',
                    shareUrl: `https://samam.klu.ac.in/verify/v-demo-eso-ew`
                },
                {
                    id: 904,
                    code: 'B-HWB-MHA',
                    name: 'Mental Health Ally',
                    icon: '🧠',
                    domain: 'HWB',
                    rarity: 'Legendary',
                    color: '#DC2626',
                    bg: '#FEF2F2',
                    issuedOn: 'Jul 14, 2026',
                    earnedFrom: 'SAMAM Program Milestones',
                    competencies: ['Advocacy', 'Active Listening', 'Mental Health First Aid'],
                    description: 'Honored for exceptional advocacy for mental health awareness, organizing support workshops, and actively contributing to a stigma-free campus environment.',
                    verificationId: 'v-demo-hwb-mha',
                    shareUrl: `https://samam.klu.ac.in/verify/v-demo-hwb-mha`
                }
            ];
            
            // Check if already in earned, if not push them
            const existingIds = new Set(responsePayload.earned.map((b: any) => b.code));
            demoBadges.forEach(db => {
                if (!existingIds.has(db.code)) {
                    responsePayload.earned.unshift(db);
                }
            });
        }

        return NextResponse.json(responsePayload);

    } catch (error: any) {
        console.error('Database error fetching badges:', error);
        return NextResponse.json({ error: 'Failed to fetch badges', details: error.message }, { status: 500 });
    }
}
