import { requireAuth } from '@/lib/apiSecurity';

// Kept as a POST-only, admin-gated stub (was previously an unauthenticated
// GET route under /api/admin/, which both violates the "state-changing
// routes shouldn't be GET" rule and had no access control at all).
export async function POST(request) {
    const auth = await requireAuth(['admin']);
    if (auth.response) return auth.response;

    return new Response("OK", { status: 200 });
}
