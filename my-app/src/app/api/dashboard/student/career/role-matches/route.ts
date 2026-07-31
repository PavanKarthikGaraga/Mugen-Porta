import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { checkRateLimit } from '@/lib/rateLimit';
import { getStudentCareerContext } from '@/lib/careerContext';
import { callGroqJSON, GroqConfigError } from '@/lib/groq';

export const dynamic = 'force-dynamic';

const CREATE_CACHE_TABLE = `
  CREATE TABLE IF NOT EXISTS career_ai_cache (
    username            VARCHAR(10)  NOT NULL PRIMARY KEY,
    roles_result        JSON         NOT NULL,
    competency_fingerprint BIGINT    NOT NULL DEFAULT 0,
    generated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

const SYSTEM_PROMPT = `You are the SAMAM AI Career Advisor for KL SAC (Student Activity Center) at KL University.
You analyze a student's real profile — their academic info, competency scores, completed activities, and
"Excellence Passport" (projects, internships, research, leadership, community service, achievements) — and
identify which real-world job roles and career paths, across ANY domain (not just their current SAMAM
domain), they are currently best suited for.

Rules:
- Return 5 to 10 roles, spanning multiple relevant domains/fields where the evidence supports it. Do not
  limit yourself to their stated career interest if their skills point elsewhere too.
- matchPercentage must be realistic and differentiated (not everything 85-95%). Base it strictly on the
  evidence given — a student with little demonstrated evidence for a role should score lower for it.
- rationale must cite specific evidence from their profile (named skills, activities, projects, etc.), not
  generic filler.
- keyStrengths and growthAreas must be specific to that student and that role, 2-3 short items each.
- Order the roles by matchPercentage, descending.
- Do not hallucinate credentials, activities, or skills the student does not have.
- Respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
{"roles":[{"role":string,"domain":string,"matchPercentage":number,"rationale":string,"keyStrengths":string[],"growthAreas":string[]}]}`;

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

async function getCached(username: string) {
    try {
        const [rows]: any = await pool.execute(
            'SELECT roles_result, competency_fingerprint, generated_at FROM career_ai_cache WHERE username = ?',
            [username]
        );
        if (rows.length === 0) return null;
        const row = rows[0];
        const roles = typeof row.roles_result === 'string' ? JSON.parse(row.roles_result) : row.roles_result;
        return { roles, fingerprint: Number(row.competency_fingerprint), generatedAt: row.generated_at };
    } catch {
        return null;
    }
}

export async function GET(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureTable();
        const username = auth.user.username as string;
        const [currentFp, cached] = await Promise.all([getFingerprint(username), getCached(username)]);

        if (!cached) {
            return NextResponse.json({ roles: null, generatedAt: null, canRerun: true });
        }

        const canRerun = currentFp !== cached.fingerprint;
        return NextResponse.json({ roles: cached.roles, generatedAt: cached.generatedAt, canRerun });
    } catch (error: any) {
        return NextResponse.json({ error: safeMessage(error, 'Failed to fetch cached analysis') }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    const rl = checkRateLimit(request, 'career-role-matches', { limit: 6, windowMs: 10 * 60 * 1000 });
    if (rl.limited) return rl.response;

    try {
        await ensureTable();
        const username = auth.user.username as string;
        const [currentFp, cached] = await Promise.all([getFingerprint(username), getCached(username)]);

        // Return cached if competency state is unchanged
        if (cached && currentFp === cached.fingerprint) {
            return NextResponse.json({
                success: true,
                roles: cached.roles,
                generatedAt: cached.generatedAt,
                fromCache: true,
                canRerun: false,
            });
        }

        const context = await getStudentCareerContext(username);
        const userPrompt = `Here is the student's profile:\n\n${context.contextText}\n\nBased strictly on this evidence, identify my best-fit career roles across various domains and how strong a match each one is.`;

        const result = await callGroqJSON({ systemPrompt: SYSTEM_PROMPT, userPrompt, temperature: 0.5, maxTokens: 2000 });

        const roles = Array.isArray(result?.roles)
            ? result.roles
                  .filter((r: any) => r && typeof r.role === 'string' && typeof r.matchPercentage === 'number')
                  .map((r: any) => ({
                      role: String(r.role).slice(0, 120),
                      domain: typeof r.domain === 'string' ? r.domain.slice(0, 80) : 'General',
                      matchPercentage: Math.max(0, Math.min(100, Math.round(r.matchPercentage))),
                      rationale: typeof r.rationale === 'string' ? r.rationale.slice(0, 500) : '',
                      keyStrengths: Array.isArray(r.keyStrengths) ? r.keyStrengths.slice(0, 5).map((s: any) => String(s).slice(0, 150)) : [],
                      growthAreas: Array.isArray(r.growthAreas) ? r.growthAreas.slice(0, 5).map((s: any) => String(s).slice(0, 150)) : [],
                  }))
                  .sort((a: any, b: any) => b.matchPercentage - a.matchPercentage)
                  .slice(0, 10)
            : [];

        if (roles.length === 0) throw new Error('AI returned no usable role matches');

        const generatedAt = new Date().toISOString();
        await pool.execute(
            `INSERT INTO career_ai_cache (username, roles_result, competency_fingerprint)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
               roles_result = VALUES(roles_result),
               competency_fingerprint = VALUES(competency_fingerprint),
               generated_at = CURRENT_TIMESTAMP`,
            [username, JSON.stringify(roles), currentFp]
        );

        return NextResponse.json({ success: true, roles, generatedAt, fromCache: false, canRerun: false });
    } catch (error: any) {
        console.error('Career role-matches error:', error);
        if (error instanceof GroqConfigError) {
            return NextResponse.json({ error: 'AI analysis is not configured yet. Please contact the administrator.' }, { status: 503 });
        }
        return NextResponse.json(
            { error: safeMessage(error, 'Could not generate role matches right now. Please try again in a moment.') },
            { status: 502 }
        );
    }
}
