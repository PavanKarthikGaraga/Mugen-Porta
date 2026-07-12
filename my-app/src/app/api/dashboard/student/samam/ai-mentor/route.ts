import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import pool from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ 
                error: 'GEMINI_API_KEY is not set in the environment variables. Please add it to your .env file to enable the AI Mentor.'
            }, { status: 500 });
        }

        // Initialize model
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            systemInstruction: systemPrompt 
        });

        // Map the chat history to Gemini's format
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));

        const chat = model.startChat({ history });
        const latestMessage = messages[messages.length - 1].text;

        const result = await chat.sendMessage(latestMessage);
        const responseText = result.response.text();

        return NextResponse.json({ text: responseText });

    } catch (error: any) {
        console.error('AI Mentor Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
