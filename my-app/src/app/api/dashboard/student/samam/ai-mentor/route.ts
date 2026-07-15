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
You are the SAMAM AI Mentor for KL University. You act as a friendly, concise, and highly encouraging academic and extracurricular advisor.

Here is the context of the student you are talking to:
Name: ${p.name || 'Student'}
Branch & Year: ${p.branch || 'N/A'}, Year ${p.year || 'N/A'}
Career Goal: ${p.career_choice || 'Undecided'}
SAMAM Level: ${p.level || 'Explorer'}
Total SAMAM Points: ${totalPoints}
Domain Breakdown: ${domainStr || 'None'}
Badges Earned: ${badgesCount}
Competency Scores: ${compStr || 'None evaluated yet'}

Guidelines:
1. Always base your recommendations on their actual data (e.g. if they have low Technical points, recommend technical activities).
2. Keep your answers brief (2-4 paragraphs max). Do not output huge walls of text.
3. Be encouraging but professional. Use emojis sparingly.
4. If they ask about points, remind them that points are earned across 5 domains (TEC, LCH, ESO, IIE, HWB).
5. Suggest realistic, university-appropriate activities (clubs, hackathons, workshops, volunteering).
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
