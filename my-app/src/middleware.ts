import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';
import { roleHome, canOpenPath } from './lib/roleHome';

// Methods that change data. Reads (GET/HEAD/OPTIONS) are not written to the
// audit log: every dashboard poll used to add a "mutation" row and a DB write.
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function toLogin(request) {
    const url = new URL('/auth/login', request.url);
    const { pathname, search } = request.nextUrl;
    if (pathname !== '/dashboard') url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
}

export async function middleware(request, event) {
    const pathname = request.nextUrl.pathname;

    // --- API audit logging (mutations only) ---
    if (pathname.startsWith('/api/')) {
        if (
            MUTATING_METHODS.has(request.method) &&
            !pathname.startsWith('/api/internal/log') &&
            !pathname.startsWith('/api/auth/')
        ) {
            const token = request.cookies.get('tck')?.value;
            if (token) {
                // Fire and forget. The log route re-verifies this cookie and
                // takes the username/role from it, never from the body.
                event.waitUntil(
                    fetch(new URL('/api/internal/log', request.url), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Cookie: `tck=${token}` },
                        body: JSON.stringify({
                            action: `API Mutation: ${pathname}`,
                            method: request.method,
                            url: pathname,
                        }),
                    }).catch(() => {})
                );
            }
        }
        return NextResponse.next();
    }

    // Logged-in users opening /auth/* go straight to their dashboard.
    if (pathname.startsWith('/auth/')) {
        const token = request.cookies.get('tck')?.value;
        if (token) {
            const payload = await verifyToken(token);
            if (payload) {
                return NextResponse.redirect(new URL(roleHome(payload.role), request.url));
            }
        }
        return NextResponse.next();
    }

    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
        const token = request.cookies.get('tck')?.value;
        if (!token) return toLogin(request);

        const payload = await verifyToken(token);
        if (!payload) return toLogin(request);

        // Bare /dashboard has no page of its own.
        if (pathname === '/dashboard') {
            return NextResponse.redirect(new URL(roleHome(payload.role), request.url));
        }

        // Someone else's area -> back to your own home. (Previously this
        // redirected to `/dashboard/${role}`, which 404s for transport.)
        if (!canOpenPath(payload.role, pathname)) {
            return NextResponse.redirect(new URL(roleHome(payload.role), request.url));
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard', '/dashboard/:path*', '/auth/:path*', '/api/:path*']
};
