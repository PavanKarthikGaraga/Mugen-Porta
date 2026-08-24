import pool from '@/lib/db';
import { NextResponse } from 'next/server';

function parseJson(val: any): any {
    if (!val) return [];
    if (typeof val !== 'string') return val;
    try { return JSON.parse(val); } catch { return []; }
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// GET /api/public/activities/upcoming
// No auth required — intended for the main SAC website.
// Returns activities where registration_open = 1 AND activity_date, start_time,
// and venue are all set. Always fresh — no caching layer.
export async function GET() {
    try {
        const [rows]: any = await pool.execute(`
            SELECT
                ac.code,
                ac.title,
                ac.description,
                ac.domain,
                ac.category,
                ac.difficulty,
                ac.sdc_credits,
                ac.max_seats,
                ac.activity_date,
                ac.start_time,
                ac.end_time,
                ac.venue,
                ac.registration_open,
                ac.outcomes,
                ac.learning_outcomes,
                ac.competencies,
                ac.ga,
                ac.sdgs
            FROM activity_catalogue ac
            WHERE ac.registration_open = 1
              AND ac.activity_date IS NOT NULL
              AND ac.start_time IS NOT NULL
              AND ac.venue IS NOT NULL
              AND ac.venue != ''
            ORDER BY ac.activity_date ASC, ac.start_time ASC, ac.code ASC
        `);

        const activities = (rows as any[]).map(r => ({
            code:             r.code,
            title:            r.title,
            description:      r.description,
            domain:           r.domain,
            category:         r.category,
            difficulty:       r.difficulty,
            sdc_credits:      r.sdc_credits,
            max_seats:        r.max_seats,
            activity_date:    r.activity_date,
            start_time:       r.start_time,
            end_time:         r.end_time,
            venue:            r.venue,
            registration_open: r.registration_open === 1 || r.registration_open === true,
            outcomes:         parseJson(r.outcomes),
            learning_outcomes: parseJson(r.learning_outcomes),
            competencies:     parseJson(r.competencies),
            ga:               parseJson(r.ga),
            sdgs:             parseJson(r.sdgs),
        }));

        return NextResponse.json({ success: true, total: activities.length, activities }, { headers: CORS_HEADERS });
    } catch (error: any) {
        console.error('Public upcoming activities error:', error);
        return NextResponse.json({ error: 'Failed to fetch upcoming activities' }, { status: 500, headers: CORS_HEADERS });
    }
}
