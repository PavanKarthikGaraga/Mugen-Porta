import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { callGroqJSON, GroqConfigError } from '@/lib/groq';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

async function ensureRoadmapCacheTable() {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS career_roadmap_cache (
            id           INT AUTO_INCREMENT PRIMARY KEY,
            username     VARCHAR(100) NOT NULL UNIQUE,
            roadmap_result LONGTEXT   NOT NULL,
            generated_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}

export async function GET(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    try {
        await ensureRoadmapCacheTable();
        const [rows]: any = await pool.execute(
            'SELECT roadmap_result, generated_at FROM career_roadmap_cache WHERE username = ?',
            [auth.user.username as string]
        );
        if ((rows as any[]).length === 0) return NextResponse.json({ cached: false });

        const { roadmap_result, generated_at } = (rows as any[])[0];
        return NextResponse.json({ cached: true, roadmap: JSON.parse(roadmap_result), generatedAt: generated_at });
    } catch {
        return NextResponse.json({ cached: false });
    }
}

const SYSTEM_PROMPT = `You are the SAMAM Career Advisor at KL University's Student Activity Center (SAC).
A student from any UG or PG discipline has answered a career interest questionnaire. Using their answers and academic background, generate a comprehensive, highly personalised career roadmap appropriate for their specific field — not just engineering.

Return ONLY a single valid JSON object — no markdown fences, no extra text — matching exactly this shape:
{
  "headline": string,
  "overview": string,
  "primaryDomain": string,
  "careerDirection": string,
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
  "motivationalMessage": string,
  "researchAreas": [
    { "area": string, "description": string, "subfields": string[] }
  ],
  "engineeringProjectIdeas": [
    { "title": string, "description": string, "difficulty": "Beginner"|"Intermediate"|"Advanced", "tools": string[], "impact": string }
  ],
  "topUniversities": [
    { "name": string, "country": string, "program": string, "ranking": string, "highlights": string }
  ]
}

Rules:
- headline: concise professional role identity suited to their field (e.g. "Product Designer & UX Researcher", "Corporate Lawyer", "Data Scientist", "Public Health Specialist", "Research Scholar in Biochemistry")
- overview: 2-3 sentences tailored to this student's specific answers, academic discipline, and declared career direction
- primaryDomain: exactly one of TEC / LCH / ESO / HWB / IIE based on their interests and discipline
- careerDirection: 2-4 word summary of their primary post-graduation goal (e.g. "Industry Placement", "Research & PhD", "Creative Practice", "Professional Practice")
- personalityTraits: 4-6 short professional traits inferred from their answers (e.g. "Analytical Thinker", "Creative Problem Solver", "Empathetic Communicator")
- careerPaths: exactly 3, ordered by relevanceScore descending (0-100), specific to their discipline and declared direction — NOT generic engineering paths unless the student is in engineering
- yearwiseRoadmap: year1..year4 goals/skills arrays must have 3-4 items each; samamTip is one sentence about which SAC club type to join that year; adapt to PG students where year1/year2 map to their PG timeline
- skillsToLearn: 5-7 skills with realistic timeframes, relevant to their actual field (e.g. legal research for law, clinical skills for medicine, design tools for design students)
- topCompanies: 6-8 real organisations/companies/institutions that actively hire for these specific career paths — for law include firms, for medicine include hospitals, for design include studios
- clubRecommendations: EXACTLY 3 clubs, chosen ONLY from the provided clubs list — use the exact club names given
- socialImpactOpportunities: 3-4 concrete, actionable ways to create social impact using their specific strengths and field
- motivationalMessage: 2-3 sentences, aspirational, specific to their interests, discipline, and goals
- researchAreas: 3-4 active research or emerging areas relevant to the student's discipline and career direction; subfields should be 3-5 specific sub-topics
- engineeringProjectIdeas: 3-4 practical hands-on projects or portfolio pieces this student can build during their studies — for non-engineering students this means writing portfolios, case studies, research papers, design projects, legal moot court cases, clinical case studies, business plans, art installations, etc. (NOT necessarily software projects); tools must be real and specific; impact is one sentence on real-world value
- topUniversities: 5-7 globally or nationally reputed universities for Masters/PhD/professional programmes matching student interests; include both global (Harvard, LSE, MIT, NUS, Parsons, etc.) and Indian (IISc, NLSIU, AIIMS, NID, IIM, etc.) options as appropriate to the field; ranking like "#3 in Law (QS 2024)"
- Do not invent club names. Do not use clubs not in the provided list.
- IMPORTANT: All recommendations must respect the student's actual academic discipline. A law student gets legal career paths; a design student gets creative career paths; a commerce student gets finance/business paths. Never force engineering-centric advice on non-engineering students.`;

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

        // Prefer academic field from questionnaire over DB branch (which may be engineering-specific)
        const declaredField = answers.academicField || student.branch || 'Not specified';
        const declaredStage = answers.academicStage || `Year ${student.student_year || 1}`;

        const userPrompt = `Student Profile:
- Name: ${student.name || 'Student'}
- Academic Field / Discipline: ${declaredField}
- Programme: ${student.program || 'Undergraduate'}
- Academic Stage: ${declaredStage}

Questionnaire Answers:
${answersText}

Available SAC Clubs (use ONLY these names in clubRecommendations):
${clubsList || 'No clubs data available'}

Generate a personalized career roadmap for this student that is specifically tailored to their academic field and career direction — not a generic engineering roadmap.`;

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
            careerDirection: String(result.careerDirection || '').slice(0, 60),
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
            researchAreas: Array.isArray(result.researchAreas)
                ? result.researchAreas.slice(0, 4).map((r: any) => ({
                    area: String(r.area || '').slice(0, 100),
                    description: String(r.description || '').slice(0, 300),
                    subfields: Array.isArray(r.subfields) ? r.subfields.slice(0, 5).map((s: any) => String(s).slice(0, 60)) : [],
                }))
                : [],
            engineeringProjectIdeas: Array.isArray(result.engineeringProjectIdeas)
                ? result.engineeringProjectIdeas.slice(0, 4).map((p: any) => ({
                    title: String(p.title || '').slice(0, 120),
                    description: String(p.description || '').slice(0, 300),
                    difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(p.difficulty) ? p.difficulty : 'Intermediate',
                    tools: Array.isArray(p.tools) ? p.tools.slice(0, 6).map((t: any) => String(t).slice(0, 40)) : [],
                    impact: String(p.impact || '').slice(0, 200),
                }))
                : [],
            topUniversities: Array.isArray(result.topUniversities)
                ? result.topUniversities.slice(0, 7).map((u: any) => ({
                    name: String(u.name || '').slice(0, 100),
                    country: String(u.country || '').slice(0, 50),
                    program: String(u.program || '').slice(0, 100),
                    ranking: String(u.ranking || '').slice(0, 50),
                    highlights: String(u.highlights || '').slice(0, 200),
                }))
                : [],
        };

        // Save to cache (upsert — overwrites on retake)
        try {
            await ensureRoadmapCacheTable();
            await pool.execute(`
                INSERT INTO career_roadmap_cache (username, roadmap_result)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE roadmap_result = VALUES(roadmap_result), generated_at = CURRENT_TIMESTAMP
            `, [auth.user.username as string, JSON.stringify(roadmap)]);
        } catch (cacheErr) {
            console.error('Roadmap cache save error:', cacheErr);
        }

        return NextResponse.json({ success: true, roadmap, student: { name: student.name, branch: student.branch, year: student.student_year } });
    } catch (error: any) {
        if (error instanceof GroqConfigError) {
            return NextResponse.json({ error: 'AI service is not configured. Please contact admin.' }, { status: 503 });
        }
        console.error('Career roadmap error:', error);
        return NextResponse.json({ error: safeMessage(error) }, { status: 500 });
    }
}
