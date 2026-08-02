import { NextResponse } from 'next/server';

/**
 * Lightweight in-memory rate limiter for brute-force / abuse protection on
 * sensitive endpoints (login, register, password reset).
 *
 * This is a single-process, fixed-window limiter keyed by a bucket name plus
 * an identity. Identity defaults to client IP, which is what you want for
 * unauthenticated endpoints (login, register, password reset) where the
 * caller has no account yet and brute force is the threat.
 *
 * For AUTHENTICATED endpoints, pass `key: <username>` instead. Campus users
 * share a NAT gateway, so hundreds of distinct students present the same
 * public IP -- IP keying would let the first few consume the whole bucket
 * and lock everyone else out. Per-username keying still stops one account
 * from spamming, without penalising students for sharing a network.
 *
 * It is intentionally dependency-free (no Redis) so it works out of the box;
 * if the app is ever scaled to multiple Node processes, swap the in-memory
 * Map below for a shared store (e.g. Redis/ioredis, already a dependency).
 */

const buckets = new Map();

// Periodically clear out stale entries so the Map doesn't grow forever.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();

function sweep(now) {
    if (now - lastSweep < SWEEP_INTERVAL_MS) return;
    lastSweep = now;
    for (const [key, entry] of buckets.entries()) {
        if (now > entry.resetAt) buckets.delete(key);
    }
}

function getClientIp(request) {
    const headers = request.headers;
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = headers.get('x-real-ip');
    if (realIp) return realIp;
    return 'unknown';
}

/**
 * @param {Request} request
 * @param {string} bucketName - logical name for the endpoint, e.g. 'login'
 * @param {{ limit?: number, windowMs?: number, key?: string }} options
 *   key - identity to meter on. Omit for IP-based limiting (unauthenticated
 *   endpoints); pass a username for authenticated ones so users behind a
 *   shared NAT are not lumped into one bucket.
 * @returns {{ limited: boolean, response: Response | null, remaining: number }}
 */
export function checkRateLimit(request, bucketName, options = {}) {
    const { limit = 10, windowMs = 60 * 1000, key: identity } = options;
    const now = Date.now();
    sweep(now);

    const key = `${bucketName}:${identity || getClientIp(request)}`;

    let entry = buckets.get(key);
    if (!entry || now > entry.resetAt) {
        entry = { count: 0, resetAt: now + windowMs };
        buckets.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > limit) {
        const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
        return {
            limited: true,
            remaining: 0,
            response: NextResponse.json(
                { message: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
            )
        };
    }

    return { limited: false, remaining: limit - entry.count, response: null };
}

/**
 * Records a failed attempt for progressive lockout scenarios (used in
 * addition to checkRateLimit for login, to slow down credential stuffing
 * even within the base rate limit window).
 */
export function recordFailedAttempt(request, bucketName, options = {}) {
    return checkRateLimit(request, `${bucketName}:fail`, options);
}
