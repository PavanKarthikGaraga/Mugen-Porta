import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth, safeMessage } from '@/lib/apiSecurity';

/**
 * Lets a 1st-year student choose their club after registration. Registration
 * defers club selection for 1st years (see /api/auth/register), leaving
 * clubId NULL — this is the only route that fills it in, and only once, so
 * a student can't switch clubs by calling it again later.
 */
export async function POST(req: Request) {
    const auth = await requireAuth(['student']);
    if (auth.response) return auth.response;
    const username = auth.user.username as string;

    try {
        const { clubId, domain, pathway } = await req.json();
        if (!clubId || typeof clubId !== 'string') {
            return NextResponse.json({ error: 'Please select a club' }, { status: 400 });
        }

        const [studentRows]: any = await pool.execute(
            'SELECT year, clubId AS currentClubId FROM students WHERE username = ?',
            [username]
        );
        const student = studentRows[0];
        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }
        if (student.year !== '1st') {
            return NextResponse.json({ error: 'Club selection here is only for 1st-year students' }, { status: 403 });
        }
        if (student.currentClubId) {
            return NextResponse.json({ error: 'You have already selected a club' }, { status: 409 });
        }

        const [clubRows]: any = await pool.execute(
            'SELECT id, domain, memberLimit FROM clubs WHERE id = ?',
            [clubId]
        );
        const club = clubRows[0];
        if (!club) {
            return NextResponse.json({ error: 'Invalid club selected' }, { status: 400 });
        }

        const [memberRows]: any = await pool.execute(
            'SELECT COUNT(*) AS count FROM students WHERE clubId = ?',
            [clubId]
        );
        const currentMembers = Number(memberRows[0].count);
        const memberLimit = club.memberLimit || 50;
        if (currentMembers >= memberLimit) {
            return NextResponse.json(
                { error: `This club is full (${currentMembers}/${memberLimit}). Please choose a different club.` },
                { status: 400 }
            );
        }

        if (clubId === 'ESO01' && !pathway) {
            return NextResponse.json({ error: 'Please select a pathway for SVR club' }, { status: 400 });
        }

        const [result]: any = await pool.execute(
            'UPDATE students SET clubId = ?, selectedDomain = ?, pathway = ? WHERE username = ? AND clubId IS NULL',
            [clubId, domain || club.domain, pathway || null, username]
        );
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'You have already selected a club' }, { status: 409 });
        }

        return NextResponse.json({ success: true, message: 'Club confirmed — welcome aboard!' });
    } catch (error: any) {
        console.error('Select club error:', error);
        return NextResponse.json({ error: safeMessage(error, 'Failed to save your club selection') }, { status: 500 });
    }
}
