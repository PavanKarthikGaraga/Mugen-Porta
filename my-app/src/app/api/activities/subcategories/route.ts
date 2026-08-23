import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/apiSecurity';

// GET /api/activities/subcategories?domain=TEC
//
// The Add Activity form used to offer a hardcoded, curated list of
// sub-categories per domain (AI & ML, Cybersecurity & Digital Trust, ...)
// that had drifted completely out of sync with what clubs actually use in
// practice (e.g. TEC's real activities are grouped under "CyberSecurity Club
// Activities", "WebApps Club Activities", "ZeroOne Code Club Activities" --
// none of which were in that list), so new activities had nowhere correct
// to attach and admins had to hand-edit the code afterward. This derives
// the real groupings straight from activity_catalogue: every distinct
// (category, code-prefix) pairing already in use for the domain, with a
// count so the most-used ones (i.e. the real clubs) sort first.
export async function GET(request: Request) {
    const auth = await requireAuth(['admin', 'lead', 'faculty', 'council']);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    if (!domain) return NextResponse.json({ error: 'domain required' }, { status: 400 });

    // Splitting on the last hyphen assumed every series numbers like
    // "TECH-ZOC-02" (pure digits after the final hyphen). That broke for
    // series like "ADV-A01".."ADV-A20", where the letter is glued directly
    // to the number with no hyphen -- it read "ADV" as the prefix and lost
    // the "A", so new activities got "ADV-001" instead of continuing at
    // "ADV-A21". Deriving the prefix from wherever the trailing digit run
    // actually starts (REGEXP_SUBSTR) handles both conventions correctly,
    // whatever separator (or none) precedes the number.
    const [rows]: any = await pool.execute(
        `SELECT
            category,
            SUBSTRING(code, 1, CHAR_LENGTH(code) - CHAR_LENGTH(REGEXP_SUBSTR(code, '[0-9]+$'))) AS code_prefix,
            COUNT(*) AS activity_count
         FROM activity_catalogue
         WHERE domain = ? AND category IS NOT NULL AND category != '' AND code REGEXP '[0-9]+$'
         GROUP BY category, code_prefix
         ORDER BY activity_count DESC, category ASC`,
        [domain]
    );

    return NextResponse.json({ subcategories: rows });
}
