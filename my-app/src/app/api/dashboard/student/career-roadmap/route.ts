import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { callGroqJSON, GroqConfigError } from '@/lib/groq';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are the SAMAM Career Advisor at KL University's Student Activity Center (SAC).
A student has answered an interest questionnaire. Using their answers AND their branch/program, generate a
comprehensive, personalized career roadmap.

Return ONLY a single valid JSON object — no markdown fences, no extra text — matching exactly this shape:
{
  "headline": string,
  "overview": string,
  "primaryDomain": string,
  "personalityTraits": string[],
  "careerPaths": [
    { "title": string, "description": string, "relevanceScore": number, "timeToReach": string }
  ],
  "yearwiseRoadmap": {
    "year1": { "focus": string, "goals": string[], "skills": string[], "samamTip": string },
    "year2": { "focus": string, "goals": string[], "skills": string[], "samamTip": string },
    "year3": { "focus": string, "goals": string[], "skills": string[], "samamTip": string },
    "year4": { "focus": string, "goals": string[], "skills": string[], "samamTip": string }
  },
  "skillsToLearn": [
    { "skill": string, "priority": "High"|"Medium"|"Low", "timeframe": string }
  ],
  "topCompanies": string[],
  "clubRecommendations": [
    { "clubName": string, "reason": string, "domain": string }
  ],
  "socialImpactOpportunities": string[],
  "motivationalMessage": string
}

Rules:
- headline: concise role identity (e.g. "AI & Data Science Innovator")
- overview: 2-3 sentences tailored to this student's specific answers and branch
- primaryDomain: exactly one of TEC / LCH / ESO / HWB / IIE
- personalityTraits: 4-6 short traits inferred from their answers
- careerPaths: exactly 3, ordered by relevanceScore descending (0-100)
- yearwiseRoadmap: year1..year4 goals/skills arrays must have 3-4 items each; samamTip is one sentence about which SAC club type to join that year
- skillsToLearn: 5-7 skills
- topCompanies: 6-8 real companies that hire for these career paths
- clubRecommendations: EXACTLY 3 clubs, chosen ONLY from the provided clubs list — use the exact club names given
- socialImpactOpportunities: 3-4 concrete ways to create social impact using their strengths
- motivationalMessage: 2-3 sentences, inspiring, specific to their interests
- Do not invent club names. Do not use clubs not in the provided list.`;

export async function POST(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    const rl = checkRateLimit(request, 'career-roadmap', { limit: 5, windowMs: 60 * 60 * 1000 });
    if (rl.limited) return rl.response;

    try {
        const body = await request.json().catch(() => ({}));
        const { answers } = body;

        if (!answers || typeof answers !== 'object' || Object.keys(answers).length < 3) {
            return NextResponse.json({ error: 'Please complete the questionnaire before generating your roadmap.' }, { status: 400 });
        }

        // Fetch student info
        const [studentRows]: any = await pool.execute(
            `SELECT name, branch, student_year, program FROM students WHERE username = ? LIMIT 1`,
            [auth.user.username]
        ).catch(() => [[]]);
        const student = (studentRows as any[])[0] || {};

        // Fetch all SAC clubs (no DEPT. CLUBS)
        const [clubRows]: any = await pool.execute(
            `SELECT name, domain FROM clubs WHERE domain != 'DEPT. CLUBS' ORDER BY domain ASC, name ASC`
        ).catch(() => [[]]);
        const clubsList = (clubRows as any[]).map((c: any) => `${c.name} [${c.domain}]`).join('\n');

        const answersText = Object.entries(answers)
            .map(([q, a]) => `Q: ${q}\nA: ${Array.isArray(a) ? (a as string[]).join(', ') : a}`)
            .join('\n\n');

        const userPrompt = `Student Profile:
- Branch: ${student.branch || 'Engineering'}
- Program: ${student.program || 'B.Tech'}
- Current Year: Year ${student.student_year || 1}

Questionnaire Answers:
${answersText}

Available SAC Clubs (use ONLY these names in clubRecommendations):
${clubsList || 'No clubs data available'}

Generate a personalized 4-year career roadmap for this student.`;

        const result = await callGroqJSON({
            systemPrompt: SYSTEM_PROMPT,
            userPrompt,
            temperature: 0.65,
            maxTokens: 3000,
        });

        if (!result || !result.headline || !result.careerPaths) {
            throw new Error('AI returned an incomplete roadmap — please try again');
        }

        // Sanitize
        const roadmap = {
            headline: String(result.headline || '').slice(0, 100),
            overview: String(result.overview || '').slice(0, 600),
            primaryDomain: String(result.primaryDomain || 'TEC'),
            personalityTraits: Array.isArray(result.personalityTraits)
                ? result.personalityTraits.slice(0, 6).map((t: any) => String(t).slice(0, 60))
                : [],
            careerPaths: Array.isArray(result.careerPaths)
                ? result.careerPaths.slice(0, 3).map((p: any) => ({
                    title: String(p.title || '').slice(0, 80),
                    description: String(p.description || '').slice(0, 300),
                    relevanceScore: Math.min(100, Math.max(0, Number(p.relevanceScore) || 70)),
                    timeToReach: String(p.timeToReach || '3-4 years').slice(0, 30),
                }))
                : [],
            yearwiseRoadmap: (() => {
                const rm: any = {};
                for (const yr of ['year1', 'year2', 'year3', 'year4']) {
                    const y = result.yearwiseRoadmap?.[yr] || {};
                    rm[yr] = {
                        focus: String(y.focus || '').slice(0, 60),
                        goals: Array.isArray(y.goals) ? y.goals.slice(0, 4).map((g: any) => String(g).slice(0, 150)) : [],
                        skills: Array.isArray(y.skills) ? y.skills.slice(0, 4).map((s: any) => String(s).slice(0, 80)) : [],
                        samamTip: String(y.samamTip || '').slice(0, 200),
                    };
                }
                return rm;
            })(),
            skillsToLearn: Array.isArray(result.skillsToLearn)
                ? result.skillsToLearn.slice(0, 7).map((s: any) => ({
                    skill: String(s.skill || '').slice(0, 80),
                    priority: ['High', 'Medium', 'Low'].includes(s.priority) ? s.priority : 'Medium',
                    timeframe: String(s.timeframe || '').slice(0, 40),
                }))
                : [],
            topCompanies: Array.isArray(result.topCompanies)
                ? result.topCompanies.slice(0, 8).map((c: any) => String(c).slice(0, 60))
                : [],
            clubRecommendations: Array.isArray(result.clubRecommendations)
                ? result.clubRecommendations.slice(0, 3).map((c: any) => ({
                    clubName: String(c.clubName || '').slice(0, 100),
                    reason: String(c.reason || '').slice(0, 300),
                    domain: String(c.domain || '').slice(0, 10),
                }))
                : [],
            socialImpactOpportunities: Array.isArray(result.socialImpactOpportunities)
                ? result.socialImpactOpportunities.slice(0, 4).map((s: any) => String(s).slice(0, 200))
                : [],
            motivationalMessage: String(result.motivationalMessage || '').slice(0, 400),
        };

        return NextResponse.json({ success: true, roadmap, student: { name: student.name, branch: student.branch, year: student.student_year } });
    } catch (error: any) {
        if (error instanceof GroqConfigError) {
            return NextResponse.json({ error: 'AI service is not configured. Please contact admin.' }, { status: 503 });
        }
        console.error('Career roadmap error:', error);
        return NextResponse.json({ error: safeMessage(error) }, { status: 500 });
    }
}
