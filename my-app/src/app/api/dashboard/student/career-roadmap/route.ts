import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';
import { callGroqJSON, GroqConfigError } from '@/lib/groq';
import { ensureCareerRoadmapCacheTable } from '@/lib/dbMigrate';

export const dynamic = 'force-dynamic';

const DEMO_ACCOUNTS = new Set(['2400000000']);

export async function GET(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;
    const username = auth.user.username as string;
    const isDemo = DEMO_ACCOUNTS.has(username);

    try {
        await ensureCareerRoadmapCacheTable();
        const [rows]: any = await pool.execute(
            'SELECT roadmap_result, generated_at, generation_count, extra_allowed FROM career_roadmap_cache WHERE username = ?',
            [username]
        );
        if ((rows as any[]).length === 0) {
            return NextResponse.json({ cached: false, remaining: isDemo ? null : 1 });
        }

        const { roadmap_result, generated_at, generation_count, extra_allowed } = (rows as any[])[0];
        const remaining = isDemo ? null : Math.max(0, 1 + Number(extra_allowed || 0) - Number(generation_count || 0));

        let roadmap = null;
        try { roadmap = JSON.parse(roadmap_result); } catch { /* not generated yet, only a granted-access placeholder row */ }

        return NextResponse.json({
            cached: !!roadmap,
            roadmap,
            generatedAt: generated_at,
            remaining,
        });
    } catch {
        return NextResponse.json({ cached: false });
    }
}

const SYSTEM_PROMPT = `You are the SAMAM Career Intelligence System at KL University's Student Activity Center (SAC).
A student has completed a comprehensive 20-question career assessment covering personality, learning style, Gardner's Multiple Intelligence, Bloom's Taxonomy, Myers-Briggs (MBTI) type, CliftonStrengths themes, and career vision. Analyse ALL inputs deeply and generate an accurate, highly personalised career roadmap with psychological profiling.

Return ONLY a single valid JSON object — no markdown fences, no extra text — with ALL fields populated. Do NOT leave any array empty or any string blank. FIELD ORDER MATTERS: generate the fields in EXACTLY the order listed below, top to bottom — the first fields in this schema are the most important and must always be complete, so generate them first and keep every array at its full required count even if you must be more concise in the later, supplementary fields to stay within budget. Schema:
{
  "headline": string,
  "overview": string,
  "primaryDomain": string,
  "careerDirection": string,
  "motivationalMessage": string,
  "personalityTraits": string[],
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
  "goalRoadmap": [
    { "stage": string, "timeframe": string, "focus": string, "topics": string[], "skills": string[], "goals": string[], "samamTip": string }
  ],
  "personalityProfile": {
    "type": "Introvert"|"Extrovert"|"Ambivert",
    "leadershipPotential": string,
    "communicationStyle": string,
    "decisionMakingStyle": string,
    "stressManagementPattern": string,
    "motivationType": string
  },
  "mbti": {
    "type": string,
    "dichotomies": {
      "EI": { "leaning": "E"|"I", "score": number },
      "SN": { "leaning": "S"|"N", "score": number },
      "TF": { "leaning": "T"|"F", "score": number },
      "JP": { "leaning": "J"|"P", "score": number }
    },
    "description": string,
    "workStyleStrengths": string[],
    "growthAreas": string[]
  },
  "cliftonStrengths": {
    "topThemes": [
      { "theme": string, "domain": "Executing"|"Influencing"|"Relationship Building"|"Strategic Thinking", "description": string }
    ]
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
  "entrepreneurPaths": [
    { "area": string, "description": string, "ideas": string[] }
  ],
  "researchAreas": [
    { "area": string, "description": string, "subfields": string[] }
  ],
  "socialImpactOpportunities": string[],
  "topUniversities": [
    { "name": string, "country": string, "program": string, "ranking": string, "highlights": string }
  ]
}

ANALYSIS RULES — read carefully and apply every rule:

PERSONALITY PROFILE (derive from happiness, stressResponse, personalityType, teamRole, careerMotivation):
- type: Use personalityType answer directly (Introvert/Extrovert/Ambivert)
- leadershipPotential: "High" if team leader role + competitive activities + leadership motivation; "Medium" if planner/organizer; "Low" if technical/supporter preference
- communicationStyle: infer from personalityType + interestsActivities + campusActivities (e.g. "Collaborative & Expressive", "Reserved but Precise", "Assertive & Persuasive")
- decisionMakingStyle: infer from stressResponse + bloomsLevel (e.g. "Analytical & Methodical", "Intuitive & Fast", "Consultative")
- stressManagementPattern: infer directly from stressResponse answer (e.g. "Social Processor — talks through stress with others", "Reflective Introvert — withdraws and self-processes")
- motivationType: infer from happiness + careerMotivation (e.g. "Impact-Driven", "Achievement-Oriented", "Financially Motivated", "Passion-Led")

MYERS-BRIGGS (MBTI) TYPE (derive from personalityType, happiness, stressResponse, learningStyle, bloomsLevel, careerValues, teamRole):
- EI: "E" if personalityType = Extrovert (or Ambivert leaning social) + team-leader/social activities; "I" if personalityType = Introvert or reflective/solo activities preferred. score (50-100) = strength of the leaning, not a slice of 100
- SN: "S" (Sensing) if learningStyle is practical/hands-on and bloomsLevel favours Remember/Understand/Apply; "N" (Intuition) if learningStyle is conceptual/experimental and bloomsLevel favours Analyze/Evaluate/Create
- TF: "T" (Thinking) if stressResponse/bloomsLevel show logical, analytical, objective decisions; "F" (Feeling) if stressResponse/careerValues show values-driven, people-centered, empathetic decisions
- JP: "J" (Judging) if teamRole/bloomsLevel show planner/organizer/structured preference; "P" (Perceiving) if teamRole/bloomsLevel show spontaneous/flexible/adaptable preference
- type: the 4 leaning letters combined into the real MBTI code (e.g. "INFJ", "ESTP")
- description: 3-4 sentences on what this type means for how they work, learn, and lead — reference their specific answers, not generic MBTI copy
- workStyleStrengths: 3-4 strengths typical of this type, tailored to their academic field
- growthAreas: 2-3 areas this type commonly needs to develop, framed constructively (never negative/judgemental)

CLIFTONSTRENGTHS (GALLUP) — pick EXACTLY 5 themes from this official list of 34 (do NOT invent theme names outside it), ordered strongest match first:
- Strategic Thinking domain: Analytical, Context, Futuristic, Ideation, Input, Intellection, Learner, Strategic
- Relationship Building domain: Adaptability, Connectedness, Developer, Empathy, Harmony, Includer, Individualization, Positivity, Relator
- Influencing domain: Activator, Command, Communication, Competition, Maximizer, Self-Assurance, Significance, Woo
- Executing domain: Achiever, Arranger, Belief, Consistency, Deliberative, Discipline, Focus, Responsibility, Restorative
Map themes to signals across ALL answers (interestsActivities, teamRole, bloomsLevel, skillsImproving, campusActivities, careerMotivation) — pick the 5 that best fit their combined profile, not a generic default set. Each theme's "domain" must be its real domain from the list above. description = 2-3 sentences personalised to how this theme shows up in their answers and how it helps their specific career direction.

BLOOM'S TAXONOMY (bloomsLevel is already a direct 1:1 choice of Bloom's level — its 6 options ARE Remember/Understand/Apply/Analyze/Evaluate/Create):
- dominantLevel: use the bloomsLevel answer directly
- description: 2-3 sentences on what this level means for their learning and career approach, cross-referenced with learningStyle for nuance
- scores: assign % scores (0-100) to all 6 levels — the chosen level scores highest (70-100), adjacent levels score moderately (30-60) based on how learningStyle nuances it, distant levels score low (0-20). Scores should add up to approximately 300-400 total across all 6 (each level is independent, not a slice of 100%)

GARDNER'S INTELLIGENCE (derive STRICTLY from interestsActivities):
Gardner scoring guide — map each selected activity to an intelligence:
- Linguistic: Writing / Reading books, Learning new languages
- Logical-Mathematical: Solving puzzles / problems, Mathematics / Coding, Research
- Spatial: Drawing / Design, Photography / Filmmaking
- Musical: Music / Singing
- Bodily-Kinesthetic: Dance / Sports, Building hardware / Electronics
- Interpersonal: Leadership / Organizing events, Teaching / Public speaking, Helping people
- Intrapersonal: Meditation / Self-reflection
- Naturalistic: Gardening / Nature / Wildlife
Score each 0-100 based on how many selected activities map to it (count matches, normalize to 0-100). primary = highest score. secondary = second highest.

CAREER ALIGNMENT:
- careerPaths: exactly 3, ordered by relevanceScore descending. Derive from fiveYearCareer, postGradPlan, careerValues, orgAttraction. Must be field-specific — NOT generic engineering unless student is in engineering.
- relevanceScore: calculate based on how many of their answers point to this path (use 0-100)

BLOOM'S + GARDNER CROSS-ANALYSIS for careerPaths and projectIdeas:
- If dominant Bloom's = Create/Evaluate + dominant Gardner = Logical/Spatial → strong tech/engineering career signal
- If dominant Bloom's = Apply/Analyze + dominant Gardner = Interpersonal/Linguistic → strong management/law/communication signal
- If dominant Gardner = Musical/Bodily-Kinesthetic → creative/performing arts signal
- Use this cross-analysis to make project ideas more accurate

STANDARD RULES:
- headline: concise role identity (e.g. "Full-Stack Developer & AI Enthusiast", "Corporate Lawyer", "UX Designer", "Clinical Researcher")
- overview: 3-4 sentences referencing their specific answers — mention their personality type, MBTI type, Gardner primary intelligence, and career direction. Very specific, not generic.
- primaryDomain: exactly one of TEC / LCH / ESO / HWB / IIE
- careerDirection: 2-4 word summary (e.g. "Industry Placement", "Research & PhD", "Creative Practice")
- personalityTraits: 4-6 professional traits derived from the full 20-question analysis
- goalRoadmap: 3-5 STAGES (not fixed years) that plot a path from where they are now to their stated goal (fiveYearCareer, postGradPlan). Name each stage for what happens in it (e.g. "Foundation", "Core Skill Building", "Specialization & Projects", "Placement Prep" for a job-bound student; "Coursework & Fundamentals", "Research Focus Area", "Publications", "Thesis & Defense" for a research/PhD-bound student) — do NOT default to generic "Year 1..4" labels. timeframe = a realistic relative duration from their current stage (e.g. "Months 1-6", "Semester 3-4", "Final Year") sized to how much time they actually have left (academicStage), not assumed to be 4 years. Each stage: topics = 3-5 subject areas to study, skills = 3-5 concrete skills to build, goals = 3-4 measurable milestones, samamTip = 1 relevant SAC club/activity type
- skillsToLearn: 5-7 skills, highly specific to their field and Gardner/Bloom's profile
- topMNCs: EXACTLY 6 real companies; role = specific job title; INR package = "₹X–Y LPA"; USD = "$XK–YK/yr". Use real market data. Field-appropriate (hospitals for medicine, law firms for law, etc.)
- clubRecommendations: the array MUST contain EXACTLY 3 objects, never 1 or 2 — pick 3 distinct clubs from the provided clubs list only, using their exact names. Reason must link to their Gardner/personality profile.
- socialImpactOpportunities: 3-4 actionable ways using their specific strengths
- motivationalMessage: 2-3 sentences, cite their specific personality type and primary intelligence
- researchAreas: 3-4 areas, field-specific; subfields 3-5 each
- projectIdeas: each of software/hardware/management arrays MUST contain EXACTLY 4 objects — never leave any of the 3 arrays empty. Software = digital/app/AI/web. Hardware = physical/IoT/lab/electronics. Management = business plan/case study/campaign/strategy. Adapt for non-engineering (law student hardware = moot court setup; design student software = portfolio platform). Real tools only.
- entrepreneurPaths: 4 areas; description 2 sentences; ideas = 3-4 concrete business concepts
- topUniversities: 5-7 universities; mix Indian (IISc, NID, IIM, NLSIU, AIIMS) and global (MIT, Stanford, Harvard, LSE, NUS); field-appropriate
- personalDevelopmentPlan: 6 areas each with 3-4 actionable, specific recommendations. Must account for their stress management pattern, personality type, and Gardner intelligence. Communication = specific to their intro/extrovert type. Leadership = based on their current team role. Networking = actionable for their field and location. Wellbeing = matched to their stressResponse answer. TimeManagement = matched to their learning style. EmotionalResilience = based on their careerConfidence score and motivation type.
- Do NOT invent club names. Only use clubs from the provided list.
- CRITICAL: Respect every student's actual academic discipline at all times.`;


export async function POST(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    const username = auth.user.username as string;
    const isDemo = DEMO_ACCOUNTS.has(username);

    try {
        const body = await request.json().catch(() => ({}));
        const { answers } = body;

        if (!answers || typeof answers !== 'object' || Object.keys(answers).length < 3) {
            return NextResponse.json({ error: 'Please complete the questionnaire before generating your roadmap.' }, { status: 400 });
        }

        await ensureCareerRoadmapCacheTable();

        // Students get exactly 1 generation; an admin can grant more via the
        // CR Access page (extra_allowed). The demo account is unmetered.
        if (!isDemo) {
            const [usageRows]: any = await pool.execute(
                'SELECT generation_count, extra_allowed FROM career_roadmap_cache WHERE username = ?',
                [username]
            );
            const usage = (usageRows as any[])[0];
            const generationCount = Number(usage?.generation_count || 0);
            const extraAllowed = Number(usage?.extra_allowed || 0);
            if (generationCount >= 1 + extraAllowed) {
                return NextResponse.json({
                    error: 'You have already generated your career roadmap. Ask an admin to grant re-analyze access for another try.',
                }, { status: 403 });
            }
        }

        // Fetch student info
        const [studentRows]: any = await pool.execute(
            `SELECT name, branch, student_year, program FROM students WHERE username = ? LIMIT 1`,
            [username]
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
            // Without an explicit cap some providers fall back to a small
            // internal default rather than the model's real max, which was
            // silently truncating this large schema (empty projects, only 1
            // club, missing goalRoadmap) — the schema also grew since 7000
            // was last measured (added mbti + cliftonStrengths + goalRoadmap).
            maxTokens: 9500,
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
            mbti: (() => {
                const m = result.mbti || {};
                const LEAN: Record<string, [string, string]> = { EI: ['E', 'I'], SN: ['S', 'N'], TF: ['T', 'F'], JP: ['J', 'P'] };
                const dichotomies: Record<string, { leaning: string; score: number }> = {};
                for (const key of ['EI', 'SN', 'TF', 'JP']) {
                    const [a, b] = LEAN[key];
                    const dd = m.dichotomies?.[key] || {};
                    dichotomies[key] = {
                        leaning: [a, b].includes(dd.leaning) ? dd.leaning : a,
                        score: Math.min(100, Math.max(50, Number(dd.score) || 50)),
                    };
                }
                const derivedType = dichotomies.EI.leaning + dichotomies.SN.leaning + dichotomies.TF.leaning + dichotomies.JP.leaning;
                return {
                    type: /^[EI][SN][TF][JP]$/.test(m.type) ? m.type : derivedType,
                    dichotomies,
                    description: sanitizeStr(m.description, 400),
                    workStyleStrengths: Array.isArray(m.workStyleStrengths)
                        ? m.workStyleStrengths.slice(0, 4).map((s: any) => sanitizeStr(s, 100))
                        : [],
                    growthAreas: Array.isArray(m.growthAreas)
                        ? m.growthAreas.slice(0, 3).map((s: any) => sanitizeStr(s, 150))
                        : [],
                };
            })(),
            cliftonStrengths: (() => {
                const VALID_THEMES = new Set([
                    'Achiever', 'Activator', 'Adaptability', 'Analytical', 'Arranger', 'Belief', 'Command', 'Communication',
                    'Competition', 'Connectedness', 'Consistency', 'Context', 'Deliberative', 'Developer', 'Discipline',
                    'Empathy', 'Focus', 'Futuristic', 'Harmony', 'Ideation', 'Includer', 'Individualization', 'Input',
                    'Intellection', 'Learner', 'Maximizer', 'Positivity', 'Relator', 'Responsibility', 'Restorative',
                    'Self-Assurance', 'Significance', 'Strategic', 'Woo',
                ]);
                const VALID_DOMAINS = ['Executing', 'Influencing', 'Relationship Building', 'Strategic Thinking'];
                const cs = result.cliftonStrengths || {};
                const topThemes = Array.isArray(cs.topThemes)
                    ? cs.topThemes.slice(0, 5).map((t: any) => ({
                        theme: VALID_THEMES.has(t.theme) ? t.theme : 'Learner',
                        domain: VALID_DOMAINS.includes(t.domain) ? t.domain : 'Strategic Thinking',
                        description: sanitizeStr(t.description, 250),
                    }))
                    : [];
                return { topThemes };
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
            goalRoadmap: Array.isArray(result.goalRoadmap)
                ? result.goalRoadmap.slice(0, 6).map((s: any) => ({
                    stage: String(s.stage || '').slice(0, 60),
                    timeframe: String(s.timeframe || '').slice(0, 40),
                    focus: String(s.focus || '').slice(0, 80),
                    topics: Array.isArray(s.topics) ? s.topics.slice(0, 5).map((t: any) => String(t).slice(0, 80)) : [],
                    skills: Array.isArray(s.skills) ? s.skills.slice(0, 5).map((sk: any) => String(sk).slice(0, 80)) : [],
                    goals: Array.isArray(s.goals) ? s.goals.slice(0, 4).map((g: any) => String(g).slice(0, 150)) : [],
                    samamTip: String(s.samamTip || '').slice(0, 200),
                }))
                : [],
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

        // Save to cache (upsert — overwrites on retake) and count this generation
        // against the student's allowance (skipped for the unmetered demo account).
        try {
            await pool.execute(`
                INSERT INTO career_roadmap_cache (username, roadmap_result, generation_count)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE roadmap_result = VALUES(roadmap_result), generated_at = CURRENT_TIMESTAMP,
                    generation_count = generation_count + ?
            `, [username, JSON.stringify(roadmap), isDemo ? 0 : 1, isDemo ? 0 : 1]);
        } catch (cacheErr) {
            console.error('Roadmap cache save error:', cacheErr);
        }

        const [postUsageRows]: any = isDemo ? [[]] : await pool.execute(
            'SELECT generation_count, extra_allowed FROM career_roadmap_cache WHERE username = ?',
            [username]
        ).catch(() => [[]]);
        const postUsage = (postUsageRows as any[])[0];
        const remaining = isDemo ? null : Math.max(0, 1 + Number(postUsage?.extra_allowed || 0) - Number(postUsage?.generation_count || 0));

        return NextResponse.json({ success: true, roadmap, student: { name: student.name, branch: student.branch, year: student.student_year }, remaining });
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
