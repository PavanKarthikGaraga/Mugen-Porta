import { NextResponse } from 'next/server';

// This debug endpoint used to dump raw database credentials
// (DB_HOST/DB_USER/DB_PASSWORD/DB_NAME) to any unauthenticated caller - a
// critical secret-exposure vulnerability. It served no legitimate
// production purpose and is now disabled outright rather than gated,
// since there is never a safe reason to expose these values over HTTP.
export async function GET() {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
