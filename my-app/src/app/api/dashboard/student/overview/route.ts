import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

const DOMAIN_MAP: Record<string, { label: string; color: string }> = {
    TEC: { label: 'Technical',                color: '#2563EB' },
    LCH: { label: 'Literary & Cultural',      color: '#7C3AED' },
    ESO: { label: 'Extension & Outreach',     color: '#059669' },
    IIE: { label: 'Innovation',               color: '#D97706' },
    HWB: { label: 'Health & Well-being',      color: '#DC2626' },
};

export async function GET() {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    const username = auth.user.username as string;

    try {
        // Run profile + SDC concurrently; badges/competencies have optional tables so handled separately
        const [profileRows, domainRows] = await Promise.all([
            // 1. Profile + level info
            pool.execute(
                `SELECT s.username, s.name, s.email, s.branch, s.year,
                        sp.level, sp.level_progress, sp.next_level, sp.avatar_url,
                        c.name AS clubName
                 FROM students s
                 LEFT JOIN student_profiles sp ON s.username = sp.username
                 LEFT JOIN clubs c ON s.clubId = c.id
                 WHERE s.username = ?`,
                [username]
            ),
            // 2. SDC domain totals only (skip history/semester for overview)
            pool.execute(
                `SELECT domain, SUM(credits) AS total_credits
                 FROM sdc_transactions
                 WHERE username = ?
                 GROUP BY domain`,
                [username]
            ),
        ]) as [any, any];

        // 3. Competency scores — competency tables may not exist yet in all envs
        let compRows: any = [[]];
        try {
            compRows = await pool.execute(
                `SELECT cd.id, cd.name, cd.category_id, cd.category_name, cd.color,
                        COALESCE(sc.score, 0) AS score,
                        COALESCE(sc.level, 'Explorer') AS level
                 FROM competency_definitions cd
                 LEFT JOIN student_competencies sc
                   ON cd.id = sc.competency_id AND sc.username = ?
                 WHERE cd.is_active = 1
                 ORDER BY cd.category_id, cd.sort_order`,
                [username]
            );
        } catch { /* tables not yet migrated */ }

        // 4. Recent earned badges — badge_definitions may not exist yet in all envs
        let badgeRows: any = [[]];
        try {
            badgeRows = await pool.execute(
                `SELECT sb.id, bd.code, bd.name, bd.icon, bd.domain, bd.color, bd.bg_color
                 FROM student_badges sb
                 JOIN badge_definitions bd ON sb.badge_id = bd.id
                 WHERE sb.username = ?
                 ORDER BY sb.issued_on DESC
                 LIMIT 6`,
                [username]
            );
        } catch { /* tables not yet migrated */ }

        // ── Build profile ────────────────────────────────────────────────────
        const p = (profileRows[0] as any[])[0] ?? {};
        const profile = {
            username: p.username ?? username,
            name: p.name ?? '',
            email: p.email ?? '',
            branch: p.branch ?? '',
            year: p.year ?? '',
            clubName: p.clubName ?? '',
            samam: {
                level: p.level ?? 'Explorer',
                levelProgress: p.level_progress ?? 0,
                nextLevel: p.next_level ?? 'Foundation',
                avatarUrl: p.avatar_url ?? '',
            },
        };

        // ── Build SDC ────────────────────────────────────────────────────────
        const SDC_TARGET = 350;
        let totalCredits = 0;
        const domainRaw = domainRows[0] as any[];
        domainRaw.forEach((r: any) => { totalCredits += Number(r.total_credits ?? 0); });
        const byDomain = domainRaw.map((r: any) => {
            const credits = Number(r.total_credits ?? 0);
            const key = String(r.domain ?? '').toUpperCase();
            return {
                domain: DOMAIN_MAP[key]?.label ?? r.domain,
                credits,
                color: DOMAIN_MAP[key]?.color ?? '#9ca3af',
                pct: totalCredits > 0 ? Math.round((credits / totalCredits) * 100) : 0,
            };
        });
        const sdc = { total: totalCredits, target: SDC_TARGET, byDomain };

        // ── Build competencies (grouped by category) ─────────────────────────
        const compRaw = compRows[0] as any[];
        const catMap = new Map<string, { id: string; title: string; color: string; competencies: any[] }>();
        for (const r of compRaw) {
            const catKey = String(r.category_id ?? r.category_name ?? 'other');
            if (!catMap.has(catKey)) {
                catMap.set(catKey, {
                    id: catKey,
                    title: r.category_name ?? catKey,
                    color: r.color ?? '#6B7280',
                    competencies: [],
                });
            }
            catMap.get(catKey)!.competencies.push({
                id: r.id,
                name: r.name,
                score: Number(r.score ?? 0),
                level: r.level ?? 'Explorer',
                color: r.color ?? '#6B7280',
                isOpportunity: false,
            });
        }
        const competencies = Array.from(catMap.values());

        // ── Build badges ─────────────────────────────────────────────────────
        const earned = (badgeRows[0] as any[]).map((r: any) => ({
            id: r.id,
            code: r.code,
            name: r.name,
            icon: r.icon ?? null,
            domain: r.domain ?? null,
            color: r.color ?? null,
            bg_color: r.bg_color ?? null,
        }));

        return NextResponse.json({ profile, sdc, competencies, badges: { earned } });
    } catch (error: any) {
        console.error('Student overview error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to load dashboard') }, { status: 500 });
    }
}
