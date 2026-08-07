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

const SYSTEM_PROMPT = `You are the SAMAM Career Intelligence System at KL University's Student Activity Center (SAC).
A student has completed a comprehensive 24-question career assessment covering personality, learning style, Gardner's Multiple Intelligence, Bloom's Taxonomy, and career vision. Analyse ALL inputs deeply and generate an accurate, highly personalised career roadmap with psychological profiling.

Return ONLY a single valid JSON object — no markdown fences, no extra text — with ALL fields populated. Do NOT leave any array empty or any string blank. Schema:
{
  "headline": string,
  "overview": string,
  "primaryDomain": string,
  "careerDirection": string,
  "motivationalMessage": string,
  "personalityTraits": string[],
  "personalityProfile": {
    "type": "Introvert"|"Extrovert"|"Ambivert",
    "leadershipPotential": string,
    "communicationStyle": string,
    "decisionMakingStyle": string,
    "stressManagementPattern": string,
    "motivationType": string
  },
  "bloomsLevel": {
    "dominantLevel": "Remember"|"Understand"|"Apply"|"Analyze"|"Evaluate"|"Create",
    "description": string,
    "scores": { "Remember": number, "Understand": number, "Apply": number, "Analyze": number, "Evaluate": number, "Create": number }
  },
  "gardnerIntelligence": {
    "primary": string,
    "secondary": string,
    "scores": { "Linguistic": number, "Logical-Mathematical": number, "Spatial": number, "Musical": number, "Bodily-Kinesthetic": number, "Interpersonal": number, "Intrapersonal": number, "Naturalistic": number }
  },
  "personalDevelopmentPlan": {
    "communication": string,
    "leadership": string,
    "networking": string,
    "wellbeing": string,
    "timeManagement": string,
    "emotionalResilience": string
  },
  "careerPaths": [
    { "title": string, "description": string, "relevanceScore": number, "timeToReach": string }
  ],
  "clubRecommendations": [
    { "clubName": string, "reason": string, "domain": string }
  ],
  "skillsToLearn": [
    { "skill": string, "priority": "High"|"Medium"|"Low", "timeframe": string }
  ],
  "topMNCs": [
    { "company": string, "role": string, "avgPackageINR": string, "avgPackageUSD": string }
  ],
  "projectIdeas": {
    "software": [
      { "title": string, "description": string, "difficulty": "Beginner"|"Intermediate"|"Advanced", "tools": string[], "impact": string }
    ],
    "hardware": [
      { "title": string, "description": string, "difficulty": "Beginner"|"Intermediate"|"Advanced", "tools": string[], "impact": string }
    ],
    "management": [
      { "title": string, "description": string, "difficulty": "Beginner"|"Intermediate"|"Advanced", "tools": string[], "impact": string }
    ]
  },
  "entrepreneurPaths": [
    { "area": string, "description": string, "ideas": string[] }
  ],
  "researchAreas": [
    { "area": string, "description": string, "subfields": string[] }
  ],
  "yearwiseRoadmap": {
    "year1": { "focus": string, "goals": string[], "skills": string[], "samamTip": string },
    "year2": { "focus": string, "goals": string[], "skills": string[], "samamTip": string },
    "year3": { "focus": string, "goals": string[], "skills": string[], "samamTip": string },
    "year4": { "focus": string, "goals": string[], "skills": string[], "samamTip": string }
  },
  "socialImpactOpportunities": string[],
  "topUniversities": [
    { "name": string, "country": string, "program": string, "ranking": string, "highlights": string }
  ]
}

ANALYSIS RULES — read carefully and apply every rule:

PERSONALITY PROFILE (derive from Q6 happiness, Q7 stress response, Q8 personality type, Q20 team role, Q11 career motivation):
- type: Use Q8 answer directly (Introvert/Extrovert/Ambivert)
- leadershipPotential: "High" if team leader role + competitive activities + leadership motivation; "Medium" if planner/organizer; "Low" if technical/supporter preference
- communicationStyle: infer from Q8 type + Q5 free time + Q19 campus activities (e.g. "Collaborative & Expressive", "Reserved but Precise", "Assertive & Persuasive")
- decisionMakingStyle: infer from Q7 stress + Q15 problem approach (e.g. "Analytical & Methodical", "Intuitive & Fast", "Consultative")
- stressManagementPattern: infer directly from Q7 answer (e.g. "Social Processor — talks through stress with others", "Reflective Introvert — withdraws and self-processes")
- motivationType: infer from Q6 + Q11 (e.g. "Impact-Driven", "Achievement-Oriented", "Financially Motivated", "Passion-Led")

BLOOM'S TAXONOMY (derive from Q13 learning style, Q14 learning preference, Q15 problem approach, Q16 self-statement):
- dominantLevel: the Bloom's level that most accurately matches all 4 learning-style answers combined
- description: 2-3 sentences on what this level means for their learning and career approach
- scores: assign % scores (0-100) to all 6 levels based on the pattern of their answers. Higher earlier levels (Remember, Understand) score high if they prefer memorizing/understanding. Higher levels (Analyze, Evaluate, Create) score high if they prefer design/experiment. Scores should add up to approximately 300-400 total across all 6 (each level is independent, not a slice of 100%)

GARDNER'S INTELLIGENCE (derive STRICTLY from Q4 activities enjoyed, Q5 free time, Q17 exciting activities):
Gardner scoring guide — map each activity to an intelligence:
- Linguistic: Writing stories, Learning languages, Reading books, Writing content, Making videos
- Logical-Mathematical: Solving puzzles, Mathematics, Coding, Solving problems, Research
- Spatial: Drawing, Photography, Designing things, Graphic design
- Musical: Playing instrument, Singing, Listening to music, Music
- Bodily-Kinesthetic: Dancing, Sports, Building hardware, Building machines, Cooking
- Interpersonal: Teaching, Team leadership, Public speaking, Helping people, Organizing events, Meeting friends, Speaking
- Intrapersonal: Meditation, Self-reflection/Journaling, Stay alone/Reflect, Write thoughts
- Naturalistic: Gardening, Wildlife, Gardening/Nature, Appreciating nature
Score each 0-100 based on how many activities map to it (count matches, normalize to 0-100). primary = highest score. secondary = second highest.

CAREER ALIGNMENT:
- careerPaths: exactly 3, ordered by relevanceScore descending. Derive from Q10 (5-year goal), Q21 (post-grad plan), Q12 (career values), Q23 (org attraction). Must be field-specific — NOT generic engineering unless student is in engineering.
- relevanceScore: calculate based on how many of their answers point to this path (use 0-100)

BLOOM'S + GARDNER CROSS-ANALYSIS for careerPaths and projectIdeas:
- If dominant Bloom's = Create/Evaluate + dominant Gardner = Logical/Spatial → strong tech/engineering career signal
- If dominant Bloom's = Apply/Analyze + dominant Gardner = Interpersonal/Linguistic → strong management/law/communication signal
- If dominant Gardner = Musical/Bodily-Kinesthetic → creative/performing arts signal
- Use this cross-analysis to make project ideas more accurate

STANDARD RULES:
- headline: concise role identity (e.g. "Full-Stack Developer & AI Enthusiast", "Corporate Lawyer", "UX Designer", "Clinical Researcher")
- overview: 3-4 sentences referencing their specific answers — mention their personality type, Gardner primary intelligence, and career direction. Very specific, not generic.
- primaryDomain: exactly one of TEC / LCH / ESO / HWB / IIE
- careerDirection: 2-4 word summary (e.g. "Industry Placement", "Research & PhD", "Creative Practice")
- personalityTraits: 4-6 professional traits derived from the full 24-question analysis
- yearwiseRoadmap: 3-4 goals and skills per year; samamTip references specific SAC club types; adapt for PG students
- skillsToLearn: 5-7 skills, highly specific to their field and Gardner/Bloom's profile
- topMNCs: EXACTLY 6 real companies; role = specific job title; INR package = "₹X–Y LPA"; USD = "$XK–YK/yr". Use real market data. Field-appropriate (hospitals for medicine, law firms for law, etc.)
- clubRecommendations: EXACTLY 3 from provided clubs list only — exact names. Reason must link to their Gardner/personality profile.
- socialImpactOpportunities: 3-4 actionable ways using their specific strengths
- motivationalMessage: 2-3 sentences, cite their specific personality type and primary intelligence
- researchAreas: 3-4 areas, field-specific; subfields 3-5 each
- projectIdeas: EXACTLY 4 per category. Software = digital/app/AI/web. Hardware = physical/IoT/lab/electronics. Management = business plan/case study/campaign/strategy. Adapt for non-engineering (law student hardware = moot court setup; design student software = portfolio platform). Real tools only.
- entrepreneurPaths: 4 areas; description 2 sentences; ideas = 3-4 concrete business concepts
- topUniversities: 5-7 universities; mix Indian (IISc, NID, IIM, NLSIU, AIIMS) and global (MIT, Stanford, Harvard, LSE, NUS); field-appropriate
- personalDevelopmentPlan: 6 areas each with 3-4 actionable, specific recommendations. Must account for their stress management pattern, personality type, and Gardner intelligence. Communication = specific to their intro/extrovert type. Leadership = based on their current team role. Networking = actionable for their field and location. Wellbeing = matched to their stress coping Q7. TimeManagement = matched to their learning style. EmotionalResilience = based on their confidence score and motivation type.
- Do NOT invent club names. Only use clubs from the provided list.
- CRITICAL: Respect every student's actual academic discipline at all times.`;


export async function POST(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    const DEMO_ACCOUNTS = new Set(['2400000000']);
    const isDemo = DEMO_ACCOUNTS.has(auth.user.username as string);

    // Metered per student, not per IP: a whole campus shares one public IP,
    // so IP keying would cap the entire university at 5 roadmaps an hour.
    // Demo account bypasses the rate limit entirely.
    if (!isDemo) {
        const rl = await checkRateLimit(request, 'career-roadmap', {
            limit: 5,
            windowMs: 60 * 60 * 1000,
            key: auth.user.username as string,
        });
        if (rl.limited) return rl.response;
    }

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
            temperature: 0.6,
            maxTokens: 7000,
        });

        if (!result || !result.headline || !result.careerPaths) {
            throw new Error('AI returned an incomplete roadmap — please try again');
        }

        // Sanitize
        const sanitizeStr = (v: any, max = 300) => String(v || '').slice(0, max);
        const roadmap = {
            headline: sanitizeStr(result.headline, 100),
            overview: sanitizeStr(result.overview, 800),
            primaryDomain: sanitizeStr(result.primaryDomain || 'TEC', 5),
            careerDirection: sanitizeStr(result.careerDirection, 60),
            personalityTraits: Array.isArray(result.personalityTraits)
                ? result.personalityTraits.slice(0, 6).map((t: any) => sanitizeStr(t, 60))
                : [],
            personalityProfile: (() => {
                const pp = result.personalityProfile || {};
                return {
                    type: ['Introvert', 'Extrovert', 'Ambivert'].includes(pp.type) ? pp.type : 'Ambivert',
                    leadershipPotential: sanitizeStr(pp.leadershipPotential, 100),
                    communicationStyle:  sanitizeStr(pp.communicationStyle, 150),
                    decisionMakingStyle: sanitizeStr(pp.decisionMakingStyle, 150),
                    stressManagementPattern: sanitizeStr(pp.stressManagementPattern, 200),
                    motivationType: sanitizeStr(pp.motivationType, 100),
                };
            })(),
            bloomsLevel: (() => {
                const bl = result.bloomsLevel || {};
                const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
                const scores: Record<string, number> = {};
                for (const lvl of BLOOM_LEVELS) {
                    scores[lvl] = Math.min(100, Math.max(0, Number(bl.scores?.[lvl]) || 0));
                }
                return {
                    dominantLevel: BLOOM_LEVELS.includes(bl.dominantLevel) ? bl.dominantLevel : 'Apply',
                    description: sanitizeStr(bl.description, 300),
                    scores,
                };
            })(),
            gardnerIntelligence: (() => {
                const gi = result.gardnerIntelligence || {};
                const GARDNER_TYPES = ['Linguistic', 'Logical-Mathematical', 'Spatial', 'Musical', 'Bodily-Kinesthetic', 'Interpersonal', 'Intrapersonal', 'Naturalistic'];
                const scores: Record<string, number> = {};
                for (const t of GARDNER_TYPES) {
                    scores[t] = Math.min(100, Math.max(0, Number(gi.scores?.[t]) || 0));
                }
                return {
                    primary: sanitizeStr(gi.primary, 50),
                    secondary: sanitizeStr(gi.secondary, 50),
                    scores,
                };
            })(),
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
            topMNCs: Array.isArray(result.topMNCs)
                ? result.topMNCs.slice(0, 6).map((c: any) => ({
                    company: String(c.company || '').slice(0, 80),
                    role: String(c.role || '').slice(0, 80),
                    avgPackageINR: String(c.avgPackageINR || '').slice(0, 30),
                    avgPackageUSD: String(c.avgPackageUSD || '').slice(0, 30),
                }))
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
            projectIdeas: (() => {
                const sanitizeIdeas = (arr: any[]) =>
                    (Array.isArray(arr) ? arr : []).slice(0, 4).map((p: any) => ({
                        title: String(p.title || '').slice(0, 120),
                        description: String(p.description || '').slice(0, 300),
                        difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(p.difficulty) ? p.difficulty : 'Intermediate',
                        tools: Array.isArray(p.tools) ? p.tools.slice(0, 6).map((t: any) => String(t).slice(0, 40)) : [],
                        impact: String(p.impact || '').slice(0, 200),
                    }));
                const pi = result.projectIdeas || {};
                return {
                    software: sanitizeIdeas(pi.software),
                    hardware: sanitizeIdeas(pi.hardware),
                    management: sanitizeIdeas(pi.management),
                };
            })(),
            entrepreneurPaths: Array.isArray(result.entrepreneurPaths)
                ? result.entrepreneurPaths.slice(0, 4).map((e: any) => ({
                    area: String(e.area || '').slice(0, 80),
                    description: String(e.description || '').slice(0, 400),
                    ideas: Array.isArray(e.ideas) ? e.ideas.slice(0, 4).map((i: any) => String(i).slice(0, 200)) : [],
                }))
                : [],
            topUniversities: Array.isArray(result.topUniversities)
                ? result.topUniversities.slice(0, 7).map((u: any) => ({
                    name: sanitizeStr(u.name, 100),
                    country: sanitizeStr(u.country, 50),
                    program: sanitizeStr(u.program, 100),
                    ranking: sanitizeStr(u.ranking, 50),
                    highlights: sanitizeStr(u.highlights, 200),
                }))
                : [],
            personalDevelopmentPlan: (() => {
                const pdp = result.personalDevelopmentPlan || {};
                return {
                    communication:       sanitizeStr(pdp.communication, 400),
                    leadership:          sanitizeStr(pdp.leadership, 400),
                    networking:          sanitizeStr(pdp.networking, 400),
                    wellbeing:           sanitizeStr(pdp.wellbeing, 400),
                    timeManagement:      sanitizeStr(pdp.timeManagement, 400),
                    emotionalResilience: sanitizeStr(pdp.emotionalResilience, 400),
                };
            })(),
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
        console.error('Career roadmap error:', error);
        const errMsg: string = error?.message || String(error);
        if (error instanceof GroqConfigError || errMsg.includes('All AI providers failed') || errMsg.includes('No OpenRouter keys')) {
            // For demo account surface the full provider error chain so the issue can be diagnosed
            const displayMsg = isDemo ? `AI unavailable — ${errMsg}` : 'AI service is unavailable. Please contact admin.';
            return NextResponse.json({ error: displayMsg }, { status: 503 });
        }
        // Expose full error to demo account so issues can be diagnosed
        const displayMsg = isDemo ? errMsg : safeMessage(error);
        return NextResponse.json({ error: displayMsg }, { status: 500 });
    }
}
