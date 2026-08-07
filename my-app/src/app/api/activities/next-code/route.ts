import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/apiSecurity';

export async function GET(request: Request) {
    const auth = await requireAuth(['admin', 'lead', 'faculty', 'council']);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix');
    if (!prefix) return NextResponse.json({ error: 'prefix required' }, { status: 400 });

    const [rows]: any = await pool.execute(
        `SELECT code FROM activity_catalogue WHERE code LIKE ? ORDER BY code DESC LIMIT 50`,
        [`${prefix}-%`]
    );

    let maxNum = 0;
    for (const row of rows as { code: string }[]) {
        const parts = row.code.split('-');
        const num = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
    }

    const nextNum = String(maxNum + 1).padStart(3, '0');
    return NextResponse.json({ code: `${prefix}-${nextNum}` });
}
