import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { resolveLevel } from '@/lib/samamLevels';
import {
    categoriseCompetency, categoryMeta, normaliseCompetency, displayCompetencyName,
} from '@/lib/competencyCategories';

export const dynamic = 'force-dynamic';

const DOMAIN_MAP: Record<string, { label: string; color: string }> = {
    TEC: { label: 'Technical',                color: '#2563EB' },
    LCH: { label: 'Liberal Arts, Culture and Heritage',      color: '#7C3AED' },
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
        // Target is the next level's threshold, derived from the canonical
        // ladder — it used to be a hardcoded 350, which contradicted the
        // "next level: Foundation (500)" shown right beside it.
        const resolved = resolveLevel(totalCredits);
        const sdc = {
            total: totalCredits,
            target: resolved.nextLevelAt ?? totalCredits,
            byDomain,
        };

        // level_progress / next_level in student_profiles are never
        // recalculated when points are awarded, so they read 0 / stale for
        // everyone. Derive both from the actual point total instead.
        profile.samam.level = resolved.level;
        profile.samam.nextLevel = resolved.nextLevel ?? resolved.level;
        profile.samam.levelProgress = resolved.levelProgress;

        // ── Derive competency evidence from completed work ────────────────────
        // student_competencies only ever holds admin-recorded scores, so a
        // student who earned competencies purely by completing activities and
        // badges showed 0 across the board here — while the dedicated
        // Competencies page (which derives them) showed the real figure.
        // Mirror that derivation so both agree.
        const derivedCounts = new Map<string, { activities: number; badges: number }>();
        const bump = (raw: any, kind: 'activities' | 'badges') => {
            const key = normaliseCompetency(raw);
            if (!key) return;
            if (!derivedCounts.has(key)) derivedCounts.set(key, { activities: 0, badges: 0 });
            derivedCounts.get(key)![kind]++;
        };
        const asArray = (v: any): any[] => {
            if (!v) return [];
            if (Array.isArray(v)) return v;
            try { const p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch { return []; }
        };

        try {
            const [actComp]: any = await pool.execute(
                `SELECT ac.competencies
                 FROM activity_enrollments ae
                 JOIN activity_catalogue ac ON ae.activity_code = ac.code
                 WHERE ae.username = ? AND ae.status = 'completed'`,
                [username]
            );
            for (const r of actComp) for (const c of asArray(r.competencies)) bump(c, 'activities');
        } catch { /* optional */ }

        try {
            const [badgeComp]: any = await pool.execute(
                `SELECT bd.competencies
                 FROM student_badges sb
                 JOIN badge_definitions bd ON sb.badge_id = bd.id
                 WHERE sb.username = ?`,
                [username]
            );
            for (const r of badgeComp) for (const c of asArray(r.competencies)) bump(c, 'badges');
        } catch { /* optional */ }

        // Same curve as the Competencies page: 1 activity ≈ 18%, badges +15%.
        const deriveScore = (activities: number, badges: number) => {
            if (activities === 0 && badges === 0) return 0;
            const act = Math.round((1 - Math.pow(0.82, activities)) * 100);
            return Math.max(0, Math.min(100, act + badges * 15));
        };

        // ── Build competencies (grouped by category) ─────────────────────────
        const compRaw = compRows[0] as any[];
        const catMap = new Map<string, { id: string; title: string; color: string; competencies: any[] }>();
        const seenNames = new Set<string>();
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
            // An admin-recorded score wins; otherwise fall back to what the
            // student's completed activities and badges imply.
            const recorded = Number(r.score ?? 0);
            const norm = normaliseCompetency(r.name);
            const d = derivedCounts.get(norm);
            const score = recorded > 0
                ? recorded
                : (d ? deriveScore(d.activities, d.badges) : 0);

            seenNames.add(norm);
            catMap.get(catKey)!.competencies.push({
                id: r.id,
                name: r.name,
                score,
                level: r.level ?? 'Explorer',
                color: r.color ?? '#6B7280',
                isOpportunity: false,
            });
        }

        // Activities and badges store competencies as free text ("Safety
        // awareness skills"), not as rows in competency_definitions. Anything
        // earned that way had no matching definition row above, so it never
        // appeared — and where competency_definitions is empty or absent
        // entirely, the overview showed nothing at all no matter how many
        // activities were completed. Fold those in here.
        for (const [norm, counts] of derivedCounts) {
            if (seenNames.has(norm)) continue;
            const score = deriveScore(counts.activities, counts.badges);
            if (score <= 0) continue;

            const catId = categoriseCompetency(norm);
            const meta = categoryMeta(catId);
            if (!catMap.has(catId)) {
                catMap.set(catId, { id: catId, title: meta.title, color: meta.color, competencies: [] });
            }
            catMap.get(catId)!.competencies.push({
                id: `derived:${norm}`,
                name: displayCompetencyName(norm),
                score,
                level: score >= 80 ? 'Leader' : score >= 55 ? 'Practitioner' : score >= 30 ? 'Foundation' : 'Explorer',
                color: meta.color,
                isOpportunity: false,
            });
        }

        // Strongest first within each category.
        for (const cat of catMap.values()) {
            cat.competencies.sort((a: any, b: any) => b.score - a.score);
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
