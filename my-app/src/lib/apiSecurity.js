import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Central server-side auth/session helpers used across API routes.
 *
 * These utilities intentionally centralize the "read cookie -> verify JWT ->
 * check role" pattern that used to be duplicated (and sometimes skipped) in
 * individual route handlers, so every route gets the same, correct behavior.
 */

/**
 * Reads the `tck` cookie and verifies it.
 * @returns {Promise<null | Record<string, any>>} decoded JWT payload, or null if missing/invalid.
 */
export async function getSessionUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tck')?.value;
    if (!token) return null;
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.username || !decoded.role) return null;
    return decoded;
}

/**
 * Reads and verifies the session, additionally enforcing that the user's role
 * is included in `allowedRoles`.
 * @param {string[]} allowedRoles
 * @returns {Promise<null | Record<string, any>>}
 */
export async function getAuthorizedUser(allowedRoles) {
    const user = await getSessionUser();
    if (!user) return null;
    if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return null;
    }
    return user;
}

export function unauthorizedResponse(message = 'Unauthorized') {
    return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
    return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * requireAuth is the standard guard for route handlers.
 * Usage:
 *   const auth = await requireAuth(['admin', 'faculty']);
 *   if (auth.response) return auth.response;
 *   const user = auth.user;
 */
export async function requireAuth(allowedRoles) {
    const user = await getSessionUser();
    if (!user) {
        return { user: null, response: unauthorizedResponse('Authentication required') };
    }
    if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return { user: null, response: forbiddenResponse('You do not have permission to access this resource') };
    }
    return { user, response: null };
}

/**
 * IDOR guard: ensures the authenticated user is either the resource owner
 * (matching :username in the URL) or has an elevated role allowed to view
 * other users' data (admin/faculty/lead by default).
 */
export function canAccessUsername(sessionUser, targetUsername, elevatedRoles = ['admin', 'faculty']) {
    if (!sessionUser) return false;
    if (sessionUser.username === targetUsername) return true;
    return elevatedRoles.includes(sessionUser.role);
}

/**
 * Returns a client-safe error message. Full error is expected to already be
 * logged via console.error by the caller. In production, generic messages
 * only -- never leak error.message/stack, DB error codes, or SQL text.
 */
export function safeMessage(error, fallback = 'Something went wrong. Please try again later.') {
    if (process.env.NODE_ENV !== 'production') {
        return (error && error.message) ? `${fallback} (${error.message})` : fallback;
    }
    return fallback;
}

/**
 * Clamp a pagination-style integer param to a safe numeric range, preventing
 * NaN / negative / unbounded values from reaching raw SQL (e.g. LIMIT/OFFSET).
 */
export function clampInt(value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = min } = {}) {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}
