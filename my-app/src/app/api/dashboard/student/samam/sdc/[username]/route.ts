import pool from '@/lib/db';
import { NextResponse } from 'next/server';

const DOMAIN_MAP: Record<string, { label: string, color: string }> = {
    'TEC': { label: 'Technical', color: '#2563EB' },
    'LCH': { label: 'Literary & Cultural', color: '#7C3AED' },
    'ESO': { label: 'Extension & Social Outreach', color: '#059669' },
    'IIE': { label: 'Innovation', color: '#D97706' },
    'HWB': { label: 'Health & Well-being', color: '#DC2626' }
};

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { username } = await params;
        if (!username) return NextResponse.json({ message: "Username is required" }, { status: 400 });

        const sdcData = {
            total: 0,
            target: 350,
            semesterTarget: 80,
            semesterCurrent: 0,
            yearlyData: [],
            byDomain: [],
            history: [],
            monthlyTrend: []
        };

        // 1. Get totals and domain breakdown
        const [domainRows] = await pool.execute(`
            SELECT domain, SUM(credits) as total_credits
            FROM sdc_transactions
            WHERE username = ?
            GROUP BY domain
        `, [username]) as any[];

        let totalCredits = 0;
        const byDomain = [];

        domainRows.forEach(row => {
            const credits = Number(row.total_credits);
            totalCredits += credits;
        });

        domainRows.forEach(row => {
            const credits = Number(row.total_credits);
            const domainKey = row.domain;
            byDomain.push({
                domain: DOMAIN_MAP[domainKey]?.label || domainKey,
                credits: credits,
                color: DOMAIN_MAP[domainKey]?.color || '#9ca3af',
                pct: totalCredits > 0 ? Math.round((credits / totalCredits) * 100) : 0
            });
        });

        sdcData.total = totalCredits;
        sdcData.byDomain = byDomain;

        // 2. Get current semester total
        // We'll approximate current semester as '2025' or whatever the most recent is. 
        // For now, let's just sum where semester = 2 (assuming even semesters are current).
        const [semRows] = await pool.execute(`
            SELECT SUM(credits) as sem_total
            FROM sdc_transactions
            WHERE username = ? AND academic_year = '2024-25' AND semester IN (2, 4, 6, 8)
        `, [username]) as any[];
        
        sdcData.semesterCurrent = semRows[0]?.sem_total ? Number(semRows[0].sem_total) : 0;

        // 3. Get History (Recent activities)
        const [historyRows] = await pool.execute(`
            SELECT t.credits, t.domain, t.category as type, t.granted_at as date,
                   COALESCE(a.title, t.description) as activity
            FROM sdc_transactions t
            LEFT JOIN student_activities a ON t.activity_id = a.id
            WHERE t.username = ?
            ORDER BY t.granted_at DESC
            LIMIT 10
        `, [username]) as any[];

        sdcData.history = historyRows.map(row => ({
            date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            activity: row.activity || 'Unknown Activity',
            credits: row.credits,
            domain: row.domain,
            type: row.type
        }));

        // 4. Monthly Trend (Last 12 months approximation)
        const [monthlyRows] = await pool.execute(`
            SELECT DATE_FORMAT(granted_at, '%b') as month, DATE_FORMAT(granted_at, '%m') as m, SUM(credits) as credits
            FROM sdc_transactions
            WHERE username = ? AND granted_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY month, m
            ORDER BY m
        `, [username]) as any[];

        sdcData.monthlyTrend = monthlyRows.map(row => ({
            month: row.month,
            credits: Number(row.credits)
        }));

        return NextResponse.json(sdcData);

    } catch (error: any) {
        console.error('Database error fetching SDC stats:', error);
        return NextResponse.json({ error: 'Failed to fetch SDC stats', details: error.message }, { status: 500 });
    }
}
