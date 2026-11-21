// Sidebar "active" check. Dashboard roots (/dashboard/<role>) match only
// exactly; every other item also stays highlighted on its sub-pages
// (e.g. /dashboard/admin/clubs/12 keeps "Clubs" active), which an exact
// `pathname === href` check missed.
export function isNavActive(pathname: string | null | undefined, href: string): boolean {
    if (!pathname) return false;
    if (pathname === href) return true;
    if (/^\/dashboard\/[^/]+\/?$/.test(href)) return false;
    return pathname.startsWith(href.endsWith('/') ? href : href + '/');
}
