import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { safeMessage } from '@/lib/apiSecurity';
import { getCouncilScope } from '@/lib/councilScope';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || !['admin', 'faculty', 'council'].includes(decoded.role as string)) return null;
    return decoded;
}

// For council: the club IDs across all of their assigned domains, or null
// if the caller is not council (admin/faculty remain unrestricted).
async function getCouncilClubScope(decoded: any): Promise<string[] | null> {
    return getCouncilScope(decoded.role, decoded.username);
}

export async function GET() {
    try {
        if (!await checkAdmin()) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const [badges] = await pool.execute(`
            SELECT id, code, name, icon, domain, rarity, color, bg_color, description, requirement
            FROM badge_definitions WHERE is_active = 1
            ORDER BY rarity, name
        `);

        return NextResponse.json({ badges });

    } catch (error: any) {
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { username, badge_id, reason } = await request.json();

        if (!username || !badge_id) {
            return NextResponse.json({ message: 'Username and badge_id are required' }, { status: 400 });
        }

        // Check student exists
        const [studentRows] = await pool.execute('SELECT username, name, clubId FROM students WHERE username = ?', [username]) as any[];
        if ((studentRows as any[]).length === 0) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        const scope = await getCouncilClubScope(admin);
        if (scope && !scope.includes((studentRows as any[])[0].clubId)) {
            return NextResponse.json({ message: 'This student is outside your domain' }, { status: 403 });
        }

        // Check badge exists
        const [badgeRows] = await pool.execute('SELECT id, name FROM badge_definitions WHERE id = ?', [badge_id]) as any[];
        if ((badgeRows as any[]).length === 0) {
            return NextResponse.json({ message: 'Badge not found' }, { status: 404 });
        }

        // Generate cryptographically unique verification ID
        const crypto = await import('crypto');
        const verificationId = `SAMAM-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
        const appUrl = 'https://sacactivities.kluniversity.in';
        const shareUrl = `${appUrl}/badges/verify/${verificationId}`;

        // Store a recipient-facing reason, never the awarding admin's
        // username (that's an internal detail, not something that should
        // show up on a public credential as "Awarded by admin: 24...").
        const badgeName: string = (badgeRows as any[])[0].name;
        const recognitionText = (reason && reason.trim())
            ? reason.trim()
            : `Participating in "${badgeName}"`;

        // Never block an award. If the student already holds this badge it is
        // replaced with a freshly issued one (new verification ID and date)
        // instead of failing with a 409. If the recognition text is too long for
        // the column (long activity title), retry with progressively shorter
        // text rather than failing.
        const shorten = (t: string, max: number) => t.length > max ? `${t.slice(0, Math.max(0, max - 1)).trimEnd()}…` : t;
        const reasonAttempts = Array.from(new Set([
            recognitionText,
            shorten(recognitionText, 250),
            shorten(recognitionText, 120),
            shorten(`Participating in "${badgeName}"`, 80),
        ]));

        const conn = await pool.getConnection();
        let replaced = false;
        let storedReason = recognitionText;
        try {
            await conn.beginTransaction();

            const [deleted]: any = await conn.execute(
                'DELETE FROM student_badges WHERE username = ? AND badge_id = ?',
                [username, badge_id]
            );
            replaced = deleted.affectedRows > 0;

            let inserted = false;
            let lastErr: any = null;
            for (const text of reasonAttempts) {
                try {
                    await conn.execute(`
                        INSERT INTO student_badges (username, badge_id, earned_from, verification_id, share_url, issued_on)
                        VALUES (?, ?, ?, ?, ?, NOW())
                    `, [username, badge_id, text, verificationId, shareUrl]);
                    storedReason = text;
                    inserted = true;
                    break;
                } catch (e: any) {
                    lastErr = e;
                    // Only a too-long value is worth retrying with shorter text.
                    if (e?.code !== 'ER_DATA_TOO_LONG' && e?.errno !== 1406) throw e;
                }
            }
            if (!inserted) throw lastErr;

            await conn.commit();
        } catch (txErr) {
            try { await conn.rollback(); } catch { /* ignore */ }
            throw txErr;
        } finally {
            conn.release();
        }

        const { logUserAction } = require('@/lib/apiSecurity');
        await logUserAction(
            admin as any, 
            `Awarded badge "${(badgeRows as any[])[0].name}" to ${username}`, 
            'POST', 
            '/api/dashboard/admin/samam/award-badge', 
            { student: username, badgeId: badge_id, reason: storedReason, replaced }
        );

        return NextResponse.json({
            success: true,
            message: replaced
                ? `Badge "${badgeName}" re-issued to ${(studentRows as any[])[0].name}`
                : `Badge "${badgeName}" awarded to ${(studentRows as any[])[0].name}`,
            replaced,
            verificationId,
            shareUrl,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Award badge error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Something went wrong. Please try again later.') }, { status: 500 });
    }
}

// DELETE — revoke a previously awarded badge.
//
// student_badges has no activity_code column and no status column — its
// only uniqueness is (username, badge_id), so this removes the badge
// regardless of which activity (or other route) originally awarded it.
// That's the best this schema can do; the caller (Activity Awards) should
// make that clear rather than implying it only undoes this activity's award.
export async function DELETE(request: Request) {
    try {
        const admin = await checkAdmin();
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { username, badge_id } = await request.json();
        if (!username || !badge_id) {
            return NextResponse.json({ message: 'Username and badge_id are required' }, { status: 400 });
        }

        const [studentRows] = await pool.execute('SELECT username, name, clubId FROM students WHERE username = ?', [username]) as any[];
        if ((studentRows as any[]).length === 0) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        const scope = await getCouncilClubScope(admin);
        if (scope && !scope.includes((studentRows as any[])[0].clubId)) {
            return NextResponse.json({ message: 'This student is outside your domain' }, { status: 403 });
        }

        const [result]: any = await pool.execute(
            'DELETE FROM student_badges WHERE username = ? AND badge_id = ?',
            [username, badge_id]
        );
        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Student does not have this badge' }, { status: 404 });
        }

        const { logUserAction } = require('@/lib/apiSecurity');
        await logUserAction(
            admin as any, 
            `Revoked badge ${badge_id} from ${username}`, 
            'DELETE', 
            '/api/dashboard/admin/samam/award-badge', 
            { student: username, badgeId: badge_id }
        );

        return NextResponse.json({ success: true, message: `Badge revoked from ${(studentRows as any[])[0].name}` });
    } catch (error: any) {
        console.error('Revoke badge error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Could not revoke badge') }, { status: 500 });
    }
}
