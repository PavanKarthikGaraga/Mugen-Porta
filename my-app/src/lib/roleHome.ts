// Single source of truth for "where does this role land after login".
// Used by middleware (edge runtime) and the login page, so keep it free of
// Node-only imports.

const ROLE_HOME: Record<string, string> = {
    admin: '/dashboard/admin',
    analytics: '/dashboard/admin',
    transport: '/dashboard/admin/transport',
    lead: '/dashboard/lead',
    faculty: '/dashboard/faculty',
    council: '/dashboard/council',
    student: '/dashboard/student',
};

export function roleHome(role: unknown): string {
    const key = typeof role === 'string' ? role.toLowerCase() : '';
    return ROLE_HOME[key] ?? '/dashboard/student';
}

// Dashboard path prefixes each role may open. The middleware sends a user who
// opens someone else's area back to their own home.
const ROLE_AREAS: Record<string, string[]> = {
    admin: ['/dashboard/admin', '/dashboard/analytics'],
    analytics: ['/dashboard/admin', '/dashboard/analytics'],
    transport: ['/dashboard/admin'],
    lead: ['/dashboard/lead'],
    faculty: ['/dashboard/faculty'],
    council: ['/dashboard/council'],
    student: ['/dashboard/student'],
};

export function canOpenPath(role: unknown, pathname: string): boolean {
    const key = typeof role === 'string' ? role.toLowerCase() : '';
    const areas = ROLE_AREAS[key] ?? [];
    return areas.some(a => pathname === a || pathname.startsWith(a + '/'));
}

/**
 * Validates a `?next=` value from the login URL. Only same-site dashboard
 * paths the role may open are accepted, so it can't be used as an open
 * redirect.
 */
export function safeNextPath(next: string | null | undefined, role: unknown): string | null {
    if (!next || typeof next !== 'string') return null;
    if (!next.startsWith('/dashboard') || next.startsWith('//') || next.includes('\\')) return null;
    const pathOnly = next.split(/[?#]/)[0];
    return canOpenPath(role, pathOnly) ? next : null;
}
