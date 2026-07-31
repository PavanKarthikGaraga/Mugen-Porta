import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { checkRateLimit } from '@/lib/rateLimit';
import { getStudentCareerContext } from '@/lib/careerContext';
import { callGroqJSON, GroqConfigError } from '@/lib/groq';

export const dynamic = 'force-dynamic';

const MAX_ROLE_LEN = 100;

const CREATE_CACHE_TABLE = `
  CREATE TABLE IF NOT EXISTS career_role_fit_cache (
    username            VARCHAR(10)  NOT NULL,
    role_name           VARCHAR(100) NOT NULL,
    result              JSON         NOT NULL,
    competency_fingerprint BIGINT    NOT NULL DEFAULT 0,
    generated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (username, role_name)
  )
`;

const SYSTEM_PROMPT = `You are the SAMAM AI Career Advisor for KL SAC (Student Activity Center) at KL University.
A student has told you a specific role or position they are interested in. Using their real profile —
academic info, competency scores, completed activities, and "Excellence Passport" (projects, internships,
research, leadership, community service, achievements) — assess how well they currently fit that exact
role, and give them a concrete plan to close the gap.

Rules:
- matchPercentage (0-100) must be realistic and grounded strictly in the evidence given, not flattering.
- verdict must be exactly one of: "Strong Fit", "Good Fit", "Developing Fit", "Early Stage".
- summary: 2-3 sentences, specific to this student and this role, citing real evidence from their profile.
- strengths: 3-5 specific things about them that support this role.
- gaps: 3-5 specific things missing or weak for this role.
- improvementPlan: 3-5 concrete, actionable steps (each with "action" and a one-line "why"), ordered by
  priority. Reference general SAMAM activity domains, competency categories, or skill-building actions —
  do not invent specific activity codes or course names that were not given to you.
- timeframeMonths: a rough realistic estimate (integer) for how long a focused effort would take to become
  a strong candidate for this role.
- Do not hallucinate credentials, activities, or skills the student does not have.
- Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
{"role":string,"matchPercentage":number,"verdict":string,"summary":string,"strengths":string[],"gaps":string[],"improvementPlan":[{"action":string,"why":string}],"timeframeMonths":number}`;

async function ensureTable() {
    try { await pool.execute(CREATE_CACHE_TABLE); } catch {}
}

async function getFingerprint(username: string): Promise<number> {
    try {
        const [rows]: any = await pool.execute(
            'SELECT COALESCE(SUM(score), 0) AS fp FROM student_competencies WHERE username = ?',
            [username]
        );
        return Number(rows[0]?.fp ?? 0);
    } catch {
        return 0;
    }
}

export async function POST(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    const rl = checkRateLimit(request, 'career-role-fit', { limit: 8, windowMs: 10 * 60 * 1000 });
    if (rl.limited) return rl.response;

    try {
        await ensureTable();

        const body = await request.json().catch(() => ({}));
        const role = typeof body?.role === 'string' ? body.role.trim() : '';

        if (!role) {
            return NextResponse.json({ error: 'Please enter a role to analyze' }, { status: 400 });
        }
        if (role.length > MAX_ROLE_LEN) {
            return NextResponse.json({ error: `Role must be under ${MAX_ROLE_LEN} characters` }, { status: 400 });
        }

        const username = auth.user.username as string;
        const [currentFp] = await Promise.all([getFingerprint(username)]);

        // Check cache for this (username, role, fingerprint)
        try {
            const [cached]: any = await pool.execute(
                'SELECT result, competency_fingerprint, generated_at FROM career_role_fit_cache WHERE username = ? AND role_name = ?',
                [username, role.toLowerCase()]
            );
            if (cached.length > 0 && Number(cached[0].competency_fingerprint) === currentFp) {
                const analysis = typeof cached[0].result === 'string'
                    ? JSON.parse(cached[0].result)
                    : cached[0].result;
                return NextResponse.json({ success: true, analysis, generatedAt: cached[0].generated_at, fromCache: true });
            }
        } catch {}

        const context = await getStudentCareerContext(username);
        const userPrompt = `Here is the student's profile:\n\n${context.contextText}\n\nTarget role I'm interested in: "${role}"\n\nAnalyze how well I currently fit this specific role and what I should improve to get there.`;

        const result = await callGroqJSON({ systemPrompt: SYSTEM_PROMPT, userPrompt, temperature: 0.5, maxTokens: 1500 });

        if (!result || typeof result.matchPercentage !== 'number') {
            throw new Error('AI returned an unusable fit analysis');
        }

        const ALLOWED_VERDICTS = new Set(['Strong Fit', 'Good Fit', 'Developing Fit', 'Early Stage']);

        const analysis = {
            role,
            matchPercentage: Math.max(0, Math.min(100, Math.round(result.matchPercentage))),
            verdict: ALLOWED_VERDICTS.has(result.verdict) ? result.verdict : 'Developing Fit',
            summary: typeof result.summary === 'string' ? result.summary.slice(0, 800) : '',
            strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 6).map((s: any) => String(s).slice(0, 200)) : [],
            gaps: Array.isArray(result.gaps) ? result.gaps.slice(0, 6).map((s: any) => String(s).slice(0, 200)) : [],
            improvementPlan: Array.isArray(result.improvementPlan)
                ? result.improvementPlan.slice(0, 6).map((s: any) => ({
                      action: typeof s?.action === 'string' ? s.action.slice(0, 200) : '',
                      why: typeof s?.why === 'string' ? s.why.slice(0, 200) : '',
                  })).filter((s: any) => s.action)
                : [],
            timeframeMonths: Number.isFinite(result.timeframeMonths) ? Math.max(0, Math.round(result.timeframeMonths)) : null,
        };

        const generatedAt = new Date().toISOString();

        // Store in cache
        try {
            await pool.execute(
                `INSERT INTO career_role_fit_cache (username, role_name, result, competency_fingerprint)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   result = VALUES(result),
                   competency_fingerprint = VALUES(competency_fingerprint),
                   generated_at = CURRENT_TIMESTAMP`,
                [username, role.toLowerCase(), JSON.stringify(analysis), currentFp]
            );
        } catch {}

        return NextResponse.json({ success: true, analysis, generatedAt, fromCache: false });
    } catch (error: any) {
        console.error('Career role-fit error:', error);
        if (error instanceof GroqConfigError) {
            return NextResponse.json({ error: 'AI analysis is not configured yet. Please contact the administrator.' }, { status: 503 });
        }
        return NextResponse.json(
            { error: safeMessage(error, 'Could not analyze this role right now. Please try again in a moment.') },
            { status: 502 }
        );
    }
}
