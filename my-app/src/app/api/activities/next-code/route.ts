import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/apiSecurity';

export async function GET(request: Request) {
    const auth = await requireAuth(['admin', 'lead', 'faculty', 'council']);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix');
    if (!prefix) return NextResponse.json({ error: 'prefix required' }, { status: 400 });

    // `prefix` already includes whatever separator convention this series
    // actually uses -- e.g. "TECH-ZOC-" (trailing hyphen before the number)
    // or "ADV-A" (letter directly against the number, no hyphen) -- so it's
    // matched and appended to as-is, never with an extra hyphen assumed.
    const [rows]: any = await pool.execute(
        `SELECT code FROM activity_catalogue WHERE code LIKE ? ORDER BY code DESC LIMIT 200`,
        [`${prefix}%`]
    );

    let maxNum = 0;
    let padWidth = 2; // sane default when this is the first activity in a new series
    for (const row of rows as { code: string }[]) {
        if (!row.code.startsWith(prefix)) continue;
        const suffix = row.code.slice(prefix.length);
        // Only trust a suffix that's purely digits -- guards against a
        // different code that happens to share this prefix by coincidence.
        if (!/^\d+$/.test(suffix)) continue;
        const num = parseInt(suffix, 10);
        if (num > maxNum) { maxNum = num; padWidth = suffix.length; }
    }

    const nextNum = String(maxNum + 1).padStart(padWidth, '0');
    return NextResponse.json({ code: `${prefix}${nextNum}` });
}
