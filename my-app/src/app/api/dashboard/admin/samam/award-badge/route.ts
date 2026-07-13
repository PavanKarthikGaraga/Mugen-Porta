import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'faculty')) return null;
    return decoded;
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
        return NextResponse.json({ error: error.message }, { status: 500 });
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
        const [studentRows] = await pool.execute('SELECT username, name FROM students WHERE username = ?', [username]) as any[];
        if ((studentRows as any[]).length === 0) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        // Check badge exists
        const [badgeRows] = await pool.execute('SELECT id, name FROM badge_definitions WHERE id = ?', [badge_id]) as any[];
        if ((badgeRows as any[]).length === 0) {
            return NextResponse.json({ message: 'Badge not found' }, { status: 404 });
        }

        // Check if already awarded
        const [existing] = await pool.execute(
            'SELECT id FROM student_badges WHERE username = ? AND badge_id = ?',
            [username, badge_id]
        ) as any[];
        if ((existing as any[]).length > 0) {
            return NextResponse.json({ message: 'Student already has this badge' }, { status: 409 });
        }

        // Generate cryptographically unique verification ID
        const crypto = await import('crypto');
        const verificationId = `SAMAM-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const shareUrl = `${appUrl}/verify/${verificationId}`;

        await pool.execute(`
            INSERT INTO student_badges (username, badge_id, earned_from, verification_id, share_url, issued_on)
            VALUES (?, ?, ?, ?, ?, NOW())
        `, [username, badge_id, reason || `Awarded by admin: ${admin.username}`, verificationId, shareUrl]);

        return NextResponse.json({
            success: true,
            message: `Badge "${(badgeRows as any[])[0].name}" awarded to ${(studentRows as any[])[0].name}`,
            verificationId,
            shareUrl,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Award badge error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
