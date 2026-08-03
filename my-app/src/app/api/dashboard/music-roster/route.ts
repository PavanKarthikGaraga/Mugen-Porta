import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

const MUSIC_CLUB_ID = 'LCH03';

export async function GET(request: Request) {
    const auth = await requireAuth(['lead', 'faculty', 'admin']);
    if (auth.response) return auth.response;

    const user = auth.user;

    try {
        // ── Verify caller is mapped to LCH03 ─────────────────────────────────
        if (user.role === 'lead') {
            const [rows]: any = await pool.execute(
                `SELECT clubId FROM leads WHERE username = ? LIMIT 1`,
                [user.username]
            );
            if (!rows || rows.length === 0 || rows[0].clubId !== MUSIC_CLUB_ID) {
                return NextResponse.json(
                    { error: 'You are not mapped to the Music Club (LCH03).' },
                    { status: 403 }
                );
            }
        } else if (user.role === 'faculty') {
            const [rows]: any = await pool.execute(
                `SELECT assignedClubs FROM faculty WHERE username = ? LIMIT 1`,
                [user.username]
            );
            if (!rows || rows.length === 0) {
                return NextResponse.json({ error: 'Faculty record not found.' }, { status: 403 });
            }
            let assigned: string[] = [];
            try {
                const val = rows[0].assignedClubs;
                if (!val) {
                    assigned = [];
                } else if (Array.isArray(val)) {
                    assigned = val;
                } else {
                    try {
                        assigned = JSON.parse(val);
                        if (!Array.isArray(assigned)) assigned = [val];
                    } catch {
                        assigned = [val];
                    }
                }
            } catch { assigned = []; }
            if (!Array.isArray(assigned) || !assigned.includes(MUSIC_CLUB_ID)) {
                return NextResponse.json(
                    { error: 'You are not assigned to the Music Club (LCH03).' },
                    { status: 403 }
                );
            }
        }
        // admin passes through unconditionally

        // ── Fetch all LCH03 students with their preferences ───────────────────
        const [students]: any = await pool.execute(
            `SELECT
                s.username,
                s.name,
                s.branch,
                s.year,
                s.gender,
                p.preference_type,
                p.instrument,
                p.other_instrument,
                p.submitted_at,
                p.updated_at
             FROM students s
             LEFT JOIN music_club_preferences p ON p.username = s.username
             WHERE s.clubId = ?
             ORDER BY s.name ASC`,
            [MUSIC_CLUB_ID]
        );

        const list = (students as any[]).map((r: any) => ({
            username: r.username,
            name: r.name,
            branch: r.branch,
            year: r.year,
            gender: r.gender,
            submitted: !!r.preference_type,
            preferenceType: r.preference_type ?? null,
            instrument: r.instrument ?? null,
            otherInstrument: r.other_instrument ?? null,
            submittedAt: r.submitted_at ?? null,
            updatedAt: r.updated_at ?? null,
        }));

        // ── Stats ─────────────────────────────────────────────────────────────
        const total = list.length;
        const submitted = list.filter((r) => r.submitted).length;
        const notSubmitted = total - submitted;
        const vocalsCount = list.filter((r) => r.preferenceType === 'vocals').length;
        const instrumentsCount = list.filter((r) => r.preferenceType === 'instruments').length;

        const instrumentBreakdown: Record<string, number> = {};
        for (const r of list) {
            if (r.preferenceType !== 'instruments') continue;
            const label = r.instrument === 'other' ? (r.otherInstrument || 'Other') : (r.instrument || 'Unknown');
            instrumentBreakdown[label] = (instrumentBreakdown[label] || 0) + 1;
        }

        return NextResponse.json({
            students: list,
            stats: {
                total,
                submitted,
                notSubmitted,
                vocalsCount,
                instrumentsCount,
                instrumentBreakdown,
            },
        });
    } catch (error: any) {
        console.error('Music roster GET error:', error);
        return NextResponse.json({ error: safeMessage(error) }, { status: 500 });
    }
}
