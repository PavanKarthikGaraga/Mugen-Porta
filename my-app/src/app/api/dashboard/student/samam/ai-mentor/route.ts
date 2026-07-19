import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import pool from '@/lib/db';
// Using Groq API with fallback

async function checkStudent() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'student') return null;
    return decoded;
}

export async function POST(request: Request) {
    try {
        const student = await checkStudent();
        if (!student) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Parse incoming messages
        const { messages } = await request.json();
        
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ message: 'Valid messages array is required' }, { status: 400 });
        }

        // Rate Limiting Logic Start
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS ai_mentor_limits (
                username VARCHAR(100) PRIMARY KEY,
                request_count INT DEFAULT 0,
                last_request_time DATETIME,
                banned_until DATETIME NULL,
                violation_level INT DEFAULT 0
            );
        `);

        const [limitRows] = await pool.execute(
            'SELECT * FROM ai_mentor_limits WHERE username = ?',
            [student.username]
        ) as any[];

        const limitRecord = limitRows[0];
        const now = new Date();

        if (limitRecord) {
            if (limitRecord.banned_until && new Date(limitRecord.banned_until) > now) {
                return NextResponse.json({ 
                    error: `You have been temporarily banned from using the AI Mentor due to spamming. Your ban will be lifted on ${new Date(limitRecord.banned_until).toLocaleString()}.` 
                }, { status: 429 });
            }

            const lastReq = new Date(limitRecord.last_request_time);
            const diffSeconds = (now.getTime() - lastReq.getTime()) / 1000;

            if (diffSeconds < 60) {
                const newCount = limitRecord.request_count + 1;
                if (newCount > 5) {
                    const newViolation = limitRecord.violation_level + 1;
                    if (newViolation >= 3) {
                        const banDate = new Date();
                        banDate.setDate(banDate.getDate() + 3);
                        await pool.execute(
                            'UPDATE ai_mentor_limits SET request_count = ?, last_request_time = ?, banned_until = ?, violation_level = ? WHERE username = ?',
                            [newCount, now, banDate, newViolation, student.username]
                        );
                        return NextResponse.json({ 
                            error: 'You have been banned for 3 days for continuously spamming the AI Mentor.' 
                        }, { status: 429 });
                    } else {
                        await pool.execute(
                            'UPDATE ai_mentor_limits SET request_count = ?, last_request_time = ?, violation_level = ? WHERE username = ?',
                            [newCount, now, newViolation, student.username]
                        );
                        return NextResponse.json({ 
                            error: 'You are sending too many messages too quickly. Please wait a minute.' 
                        }, { status: 429 });
                    }
                } else {
                    await pool.execute(
                        'UPDATE ai_mentor_limits SET request_count = ?, last_request_time = ? WHERE username = ?',
                        [newCount, now, student.username]
                    );
                }
            } else {
                await pool.execute(
                    'UPDATE ai_mentor_limits SET request_count = 1, last_request_time = ? WHERE username = ?',
                    [now, student.username]
                );
            }
        } else {
            await pool.execute(
                'INSERT INTO ai_mentor_limits (username, request_count, last_request_time, violation_level) VALUES (?, 1, ?, 0)',
                [student.username, now]
            );
        }
        // Rate Limiting Logic End

        // Fetch student context from DB
        const [profileRows, sdcRows, competencyRows, badgeRows] = await Promise.all([
            pool.execute(`
                SELECT s.name, s.branch, s.year, sp.level, sp.level_progress, sp.career_choice
                FROM students s
                LEFT JOIN student_profiles sp ON s.username = sp.username
                WHERE s.username = ?
            `, [student.username as string]),
            pool.execute(`
                SELECT domain, SUM(credits) as total
                FROM sdc_transactions
                WHERE username = ?
                GROUP BY domain
            `, [student.username as string]),
            pool.execute(`
                SELECT cd.name, sc.score 
                FROM student_competencies sc
                JOIN competency_definitions cd ON sc.competency_id = cd.id
                WHERE sc.username = ?
            `, [student.username as string]),
            pool.execute(`
                SELECT COUNT(id) as count FROM student_badges WHERE username = ?
            `, [student.username as string])
        ]) as any[];

        const p = (profileRows[0] as any[])[0] || {};
        const sdcData = sdcRows[0] as any[];
        const compsData = competencyRows[0] as any[];
        const badgesCount = (badgeRows[0] as any[])[0]?.count || 0;

        const totalPoints = sdcData.reduce((sum: number, r: any) => sum + Number(r.total), 0);
        const domainStr = sdcData.map((r: any) => `${r.domain}: ${r.total} pts`).join(', ');
        const compStr = compsData.map((c: any) => `${c.name}: ${c.score}/10`).join(', ');

        const systemPrompt = `
You are the SAMAM AI Mentor for KL University. You act as an expert, professional, and highly strategic academic advisor.

Here is the context of the student you are talking to:
Name: ${p.name || 'Student'}
Branch & Year: ${p.branch || 'N/A'}, Year ${p.year || 'N/A'}
Career Goal: ${p.career_choice || 'Undecided'}
SAMAM Level: ${p.level || 'Explorer'}
Total SAMAM Points: ${totalPoints}
Domain Breakdown: ${domainStr || 'None'}
Badges Earned: ${badgesCount}
Competency Scores: ${compStr || 'None evaluated yet'}

The SAMAM Activity Catalog is categorized into 5 domains:
1. Technology & Engineering (TEC): Technical skills, coding, hackathons, engineering clubs.
2. Life Skills & Character (LCH): Soft skills, leadership, outdoor survival, ethics.
3. Extension & Social Outreach (ESO): Community service, volunteering, social impact.
4. Innovation & Entrepreneurship (IIE): Startups, business planning, design thinking.
5. Health & Well-being (HWB): Sports, yoga, mental health, fitness.

Guidelines:
1. Base your recommendations STRICTLY on their actual data and competencies.
2. If they need to build specific skills, explicitly tell them which of the 5 SAMAM domains they should look at in the Activity Catalog.
3. Keep your answers brief, actionable, and extremely professional (2-3 paragraphs). Do NOT use emojis.
4. Act as a senior career mentor, not a chatbot. Direct them to explore specific types of activities in the catalog that map to their weaknesses.
`;

        const GROQ_KEYS = [
            process.env.GROQ_KEY_1,
            process.env.GROQ_KEY_2,
            process.env.GROQ_KEY_3,
            process.env.GROQ_KEY_4,
            process.env.GROQ_KEY_5,
            process.env.GROQ_KEY_6,
            process.env.GROQ_KEY_7,
            process.env.GROQ_KEY_8,
            process.env.GROQ_KEY_9,
        ].filter(Boolean) as string[];

        if (GROQ_KEYS.length === 0) {
            return NextResponse.json({ 
                error: 'No GROQ API keys are set in the environment variables. Please add GROQ_KEY_1 to GROQ_KEY_9 to your .env file to enable the AI Mentor.'
            }, { status: 500 });
        }

        const groqMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.text
            }))
        ];

        let responseText = '';
        let success = false;

        for (let i = 0; i < GROQ_KEYS.length; i++) {
            const key = GROQ_KEYS[i];
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: groqMessages,
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    responseText = data.choices[0].message.content;
                    success = true;
                    break;
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.warn(`Groq API key ${i + 1} failed:`, response.status, errorData);
                }
            } catch (error) {
                console.warn(`Groq request with key ${i + 1} failed:`, error);
            }
        }

        if (!success) {
            return NextResponse.json({ error: 'All AI models are currently overloaded or unavailable. Please try again later.' }, { status: 500 });
        }

        return NextResponse.json({ text: responseText });

    } catch (error: any) {
        console.error('AI Mentor Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
