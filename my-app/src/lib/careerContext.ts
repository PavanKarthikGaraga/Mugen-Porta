import pool from '@/lib/db';

/**
 * Aggregates everything we know about a student — profile, competency
 * scores, completed activities, and their "Excellence Passport" (projects,
 * internships, research, leadership, community service, achievements) —
 * into a single object plus a compact text block ready to drop into an AI
 * prompt. Used by both the "top role matches" and "fit for a specific
 * role" career-analysis endpoints so they're always grounded in the same
 * real data, not the student's self-reported claims alone.
 *
 * Every section is fetched defensively (try/catch) so a schema hiccup in
 * one table never breaks the whole analysis — it just falls back to an
 * empty section.
 */

const DOMAIN_LABELS: Record<string, string> = {
    TEC: 'Technology & Emerging Technologies',
    LCH: 'Liberal Arts, Culture and Heritage',
    ESO: 'Extension & Social Outreach',
    IIE: 'Innovation & Entrepreneurship',
    HWB: 'Health & Well-being',
};

function safeJsonArray(val: any): any[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

async function getProfile(username: string) {
    try {
        const [rows]: any = await pool.execute(
            `SELECT name, branch, year, selectedDomain, careerChoice FROM students WHERE username = ?`,
            [username]
        );
        return rows[0] || null;
    } catch {
        return null;
    }
}

async function getCompetencies(username: string) {
    try {
        const [rows]: any = await pool.execute(
            `SELECT cd.id as comp_id, cd.name, cd.category_id, cd.category_name, sc.score, sc.level
             FROM competency_definitions cd
             LEFT JOIN student_competencies sc ON cd.id = sc.competency_id AND sc.username = ?
             WHERE cd.is_active = 1
             ORDER BY cd.category_id, cd.sort_order`,
            [username]
        );

        const categoriesMap: Record<string, { title: string; competencies: { name: string; score: number; level: string }[] }> = {};
        for (const row of rows) {
            if (!categoriesMap[row.category_id]) {
                categoriesMap[row.category_id] = { title: row.category_name, competencies: [] };
            }
            categoriesMap[row.category_id].competencies.push({
                name: row.name,
                score: row.score || 0,
                level: row.level || 'Explorer',
            });
        }
        return Object.values(categoriesMap);
    } catch {
        return [];
    }
}

async function getActivityStats(username: string) {
    try {
        const [countRows]: any = await pool.execute(
            `SELECT domain, COUNT(*) as cnt FROM student_activities WHERE username = ? AND status = 'approved' GROUP BY domain`,
            [username]
        );
        const byDomain: Record<string, number> = {};
        let total = 0;
        for (const row of countRows) {
            byDomain[row.domain] = row.cnt;
            total += row.cnt;
        }

        const [recentRows]: any = await pool.execute(
            `SELECT title, domain FROM student_activities WHERE username = ? AND status = 'approved' ORDER BY id DESC LIMIT 8`,
            [username]
        );

        return { total, byDomain, recent: recentRows.map((r: any) => ({ title: r.title, domain: r.domain })) };
    } catch {
        return { total: 0, byDomain: {}, recent: [] };
    }
}

async function getPassport(username: string) {
    const empty = {
        tagline: null as string | null,
        about: null as string | null,
        cgpa: null as number | null,
        skills: [] as string[],
        projects: [] as string[],
        internships: [] as string[],
        research: [] as string[],
        leadership: [] as string[],
        community: [] as string[],
        achievements: [] as string[],
    };
    try {
        const [profileRows]: any = await pool.execute(
            `SELECT tagline, about, cgpa, skills FROM student_profiles WHERE username = ?`,
            [username]
        );
        const profile = profileRows[0];
        if (profile) {
            empty.tagline = profile.tagline || null;
            empty.about = profile.about || null;
            empty.cgpa = profile.cgpa || null;
            empty.skills = safeJsonArray(profile.skills);
        }

        const [projects]: any = await pool.execute(
            `SELECT name, tech_stack FROM passport_projects WHERE username = ? ORDER BY sort_order ASC LIMIT 6`,
            [username]
        );
        empty.projects = projects.map((p: any) => {
            const tech = safeJsonArray(p.tech_stack);
            return tech.length ? `${p.name} (${tech.join(', ')})` : p.name;
        });

        const [internships]: any = await pool.execute(
            `SELECT company, role FROM passport_internships WHERE username = ? ORDER BY sort_order ASC LIMIT 5`,
            [username]
        );
        empty.internships = internships.map((i: any) => `${i.role} at ${i.company}`);

        const [research]: any = await pool.execute(
            `SELECT title, status FROM passport_research WHERE username = ? ORDER BY sort_order ASC LIMIT 5`,
            [username]
        );
        empty.research = research.map((r: any) => `${r.title} (${r.status})`);

        const [leadership]: any = await pool.execute(
            `SELECT role, organisation FROM passport_leadership WHERE username = ? ORDER BY sort_order ASC LIMIT 5`,
            [username]
        );
        empty.leadership = leadership.map((l: any) => `${l.role} — ${l.organisation}`);

        const [community]: any = await pool.execute(
            `SELECT activity FROM passport_community WHERE username = ? ORDER BY sort_order ASC LIMIT 5`,
            [username]
        );
        empty.community = community.map((c: any) => c.activity);

        const [achievements]: any = await pool.execute(
            `SELECT title, organisation FROM passport_achievements WHERE username = ? ORDER BY sort_order ASC LIMIT 5`,
            [username]
        );
        empty.achievements = achievements.map((a: any) => `${a.title} (${a.organisation})`);
    } catch {
        // fall through with whatever was already populated
    }
    return empty;
}

async function getBadges(username: string) {
    try {
        const [rows]: any = await pool.execute(
            `SELECT bd.name FROM student_badges sb JOIN badge_definitions bd ON sb.badge_id = bd.id
             WHERE sb.username = ? ORDER BY sb.issued_on DESC LIMIT 10`,
            [username]
        );
        return rows.map((r: any) => r.name);
    } catch {
        return [];
    }
}

export interface StudentCareerContext {
    profile: { name: string; branch: string; year: string; selectedDomain: string; careerChoice: string | null } | null;
    competencyCategories: { title: string; competencies: { name: string; score: number; level: string }[] }[];
    activityStats: { total: number; byDomain: Record<string, number>; recent: { title: string; domain: string }[] };
    passport: Awaited<ReturnType<typeof getPassport>>;
    badges: string[];
    contextText: string;
}

export async function getStudentCareerContext(username: string): Promise<StudentCareerContext> {
    const [profile, competencyCategories, activityStats, passport, badges] = await Promise.all([
        getProfile(username),
        getCompetencies(username),
        getActivityStats(username),
        getPassport(username),
        getBadges(username),
    ]);

    const lines: string[] = [];

    if (profile) {
        lines.push(
            `Student: ${profile.name}, ${profile.branch}, Year ${profile.year}. Primary SAMAM domain: ${DOMAIN_LABELS[profile.selectedDomain] || profile.selectedDomain}.`
        );
        if (profile.careerChoice) lines.push(`Stated career interest area: ${profile.careerChoice}.`);
    } else {
        lines.push('Student profile details are not fully available.');
    }

    if (passport.tagline || passport.about) {
        lines.push(`Self-description: ${[passport.tagline, passport.about].filter(Boolean).join(' — ')}`);
    }
    if (passport.cgpa) lines.push(`CGPA: ${passport.cgpa}`);

    if (competencyCategories.length > 0) {
        const compLines = competencyCategories.map((cat) => {
            const scored = cat.competencies.filter((c) => c.score > 0);
            if (scored.length === 0) return null;
            const items = scored
                .sort((a, b) => b.score - a.score)
                .map((c) => `${c.name} ${c.score}% (${c.level})`)
                .join(', ');
            return `  - ${cat.title}: ${items}`;
        }).filter(Boolean);
        if (compLines.length > 0) {
            lines.push('Competency scores by category:');
            lines.push(...(compLines as string[]));
        }
    }

    if (passport.skills.length > 0) lines.push(`Self-listed skills: ${passport.skills.join(', ')}.`);

    if (activityStats.total > 0) {
        const domainBreakdown = Object.entries(activityStats.byDomain)
            .map(([d, c]) => `${DOMAIN_LABELS[d] || d}: ${c}`)
            .join(', ');
        lines.push(`Completed ${activityStats.total} SAMAM activities so far (${domainBreakdown}).`);
        if (activityStats.recent.length > 0) {
            lines.push(`Most recent activities: ${activityStats.recent.map((a) => `"${a.title}" (${a.domain})`).join(', ')}.`);
        }
    } else {
        lines.push('No completed SAMAM activities on record yet.');
    }

    if (passport.projects.length > 0) lines.push(`Projects: ${passport.projects.join('; ')}.`);
    if (passport.internships.length > 0) lines.push(`Internships: ${passport.internships.join('; ')}.`);
    if (passport.research.length > 0) lines.push(`Research: ${passport.research.join('; ')}.`);
    if (passport.leadership.length > 0) lines.push(`Leadership roles: ${passport.leadership.join('; ')}.`);
    if (passport.community.length > 0) lines.push(`Community service: ${passport.community.join('; ')}.`);
    if (passport.achievements.length > 0) lines.push(`Achievements: ${passport.achievements.join('; ')}.`);
    if (badges.length > 0) lines.push(`Digital badges earned: ${badges.join(', ')}.`);

    return {
        profile,
        competencyCategories,
        activityStats,
        passport,
        badges,
        contextText: lines.join('\n'),
    };
}
