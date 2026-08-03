import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

const MUSIC_CLUB_ID = 'LCH03';

const VALID_INSTRUMENTS = ['Keyboard', 'Guitar', 'Violin', 'Drums', 'Veena'];

async function ensureTable() {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS music_club_preferences (
            username         VARCHAR(100) NOT NULL PRIMARY KEY,
            preference_type  ENUM('vocals', 'instruments') NOT NULL,
            instrument       VARCHAR(100) NULL,
            other_instrument VARCHAR(200) NULL,
            submitted_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}

/** Verify this student is in the Music Club */
async function isMusicClubStudent(username: string): Promise<boolean> {
    const [rows]: any = await pool.execute(
        `SELECT clubId FROM students WHERE username = ? LIMIT 1`,
        [username]
    );
    return Array.isArray(rows) && rows.length > 0 && rows[0].clubId === MUSIC_CLUB_ID;
}

// ── GET — fetch current student's saved preference ────────────────────────────

export async function GET(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    const username = auth.user.username as string;

    try {
        const inClub = await isMusicClubStudent(username);
        if (!inClub) {
            return NextResponse.json({ eligible: false, reason: 'You are not enrolled in the Music Club (LCH03).' });
        }

        await ensureTable();

        const [rows]: any = await pool.execute(
            `SELECT preference_type, instrument, other_instrument, submitted_at
             FROM music_club_preferences
             WHERE username = ?`,
            [username]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json({ eligible: true, submitted: false, preference: null });
        }

        const row = rows[0];
        return NextResponse.json({
            eligible: true,
            submitted: true,
            preference: {
                type: row.preference_type,
                instrument: row.instrument,
                otherInstrument: row.other_instrument,
                submittedAt: row.submitted_at,
            },
        });
    } catch (error: any) {
        console.error('Music preference GET error:', error);
        return NextResponse.json({ error: safeMessage(error) }, { status: 500 });
    }
}

// ── POST — save / update preference ──────────────────────────────────────────

export async function POST(request: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;

    const username = auth.user.username as string;

    try {
        const inClub = await isMusicClubStudent(username);
        if (!inClub) {
            return NextResponse.json(
                { error: 'You are not enrolled in the Music Club (LCH03).' },
                { status: 403 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const { type, instrument, otherInstrument } = body;

        if (!type || !['vocals', 'instruments'].includes(type)) {
            return NextResponse.json(
                { error: 'Please select either Vocals or Instruments.' },
                { status: 400 }
            );
        }

        let finalInstrument: string | null = null;
        let finalOther: string | null = null;

        if (type === 'instruments') {
            if (!instrument) {
                return NextResponse.json(
                    { error: 'Please select an instrument.' },
                    { status: 400 }
                );
            }
            if (instrument === 'other') {
                const trimmed = typeof otherInstrument === 'string' ? otherInstrument.trim() : '';
                if (!trimmed || trimmed.length < 2) {
                    return NextResponse.json(
                        { error: 'Please specify your instrument.' },
                        { status: 400 }
                    );
                }
                finalInstrument = 'other';
                finalOther = trimmed.slice(0, 200);
            } else if (VALID_INSTRUMENTS.includes(instrument)) {
                finalInstrument = instrument;
                finalOther = null;
            } else {
                return NextResponse.json({ error: 'Invalid instrument selection.' }, { status: 400 });
            }
        }

        await ensureTable();

        await pool.execute(
            `INSERT INTO music_club_preferences (username, preference_type, instrument, other_instrument)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               preference_type  = VALUES(preference_type),
               instrument       = VALUES(instrument),
               other_instrument = VALUES(other_instrument),
               updated_at       = CURRENT_TIMESTAMP`,
            [username, type, finalInstrument, finalOther]
        );

        return NextResponse.json({
            success: true,
            preference: {
                type,
                instrument: finalInstrument,
                otherInstrument: finalOther,
            },
        });
    } catch (error: any) {
        console.error('Music preference POST error:', error);
        return NextResponse.json({ error: safeMessage(error) }, { status: 500 });
    }
}
