import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import pool from '@/lib/db';

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

        const { career, readinessScore, gapCompetencies, roadmap } = await request.json();
        
        if (!career) {
            return NextResponse.json({ message: 'Career is required' }, { status: 400 });
        }

        const systemPrompt = `
You are the SAMAM AI Career Advisor for KL University. You act as an expert, concise, and highly strategic career mentor.

Here is the context of the student you are advising:
Name: ${student.username}
Target Career: ${career}
Current Readiness Score: ${readinessScore}%
Skill Gaps: ${JSON.stringify(gapCompetencies)}
Current Learning Roadmap: ${JSON.stringify(roadmap)}

Guidelines:
1. Provide a highly personalized, deeply strategic 3-paragraph analysis of their specific skill gaps.
2. Do not hallucinate or give generic advice. Mention their specific gaps (e.g., if they are missing 'System Design', talk about how to improve it).
3. Suggest 3 concrete, actionable steps they can take *this month* to increase their readiness score.
4. Keep the tone professional, encouraging, and highly specific to the ${career} role. Do not use emojis unless absolutely necessary.
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
                error: 'No GROQ API keys are set.'
            }, { status: 500 });
        }

        const randomKey = GROQ_KEYS[Math.floor(Math.random() * GROQ_KEYS.length)];

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${randomKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Please provide my personalized career analysis for the ${career} role.` }
                ],
                temperature: 0.6,
                max_tokens: 800
            })
        });

        if (!groqResponse.ok) {
            const error = await groqResponse.json();
            throw new Error(error.error?.message || 'Failed to fetch from Groq');
        }

        const data = await groqResponse.json();
        return NextResponse.json({ 
            analysis: data.choices[0].message.content 
        });

    } catch (error: any) {
        console.error('AI Career Analysis Error:', error);
        return NextResponse.json({ 
            error: 'Failed to generate AI analysis. Please try again later.' 
        }, { status: 500 });
    }
}
