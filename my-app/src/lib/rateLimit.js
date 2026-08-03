import { NextResponse } from 'next/server';
import Redis from 'ioredis';

/**
 * Redis-backed rate limiter for brute-force / abuse protection on sensitive
 * endpoints (login, register, password reset, career-AI calls).
 *
 * Backed by Redis (rather than an in-process Map) so the count is shared
 * across every PM2 cluster worker -- required once the app runs as more
 * than one Node process, otherwise each worker would enforce its own
 * separate limit and the effective ceiling would silently multiply by the
 * worker count.
 *
 * Identity defaults to client IP, which is what you want for unauthenticated
 * endpoints (login, register, password reset) where the caller has no
 * account yet and brute force is the threat.
 *
 * For AUTHENTICATED endpoints, pass `key: <username>` instead. Campus users
 * share a NAT gateway, so hundreds of distinct students present the same
 * public IP -- IP keying would let the first few consume the whole bucket
 * and lock everyone else out. Per-username keying still stops one account
 * from spamming, without penalising students for sharing a network.
 */

const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});

// A connection blip must never crash the process -- ioredis throws on an
// unhandled 'error' event, and this module runs on the request path for
// login, so an uncaught error here would take the whole app down with it.
redis.on('error', (err) => {
    console.error('[rateLimit] Redis connection error:', err.message);
});

// Atomically increments the bucket and sets its expiry only on the first
// increment of a window, so concurrent requests can't race past the limit
// and the window doesn't keep sliding forward under sustained load.
const INCR_AND_EXPIRE = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return {current, ttl}
`;

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
 * @returns {Promise<{ limited: boolean, response: Response | null, remaining: number }>}
 */
export async function checkRateLimit(request, bucketName, options = {}) {
    const { limit = 10, windowMs = 60 * 1000, key: identity } = options;
    const key = `ratelimit:${bucketName}:${identity || getClientIp(request)}`;

    let count;
    let ttl;
    try {
        [count, ttl] = await redis.eval(INCR_AND_EXPIRE, 1, key, windowMs);
    } catch (err) {
        // Redis is unreachable. Failing open keeps the site usable during a
        // Redis outage -- brute-force protection is defense-in-depth here,
        // not the only thing standing between an attacker and an account
        // (passwords are still bcrypt-hashed and checked), so availability
        // wins over strict enforcement in this specific failure mode.
        console.error('[rateLimit] Redis eval failed, failing open:', err.message);
        return { limited: false, remaining: limit, response: null };
    }

    if (count > limit) {
        const retryAfterSec = Math.max(1, Math.ceil(ttl / 1000));
        return {
            limited: true,
            remaining: 0,
            response: NextResponse.json(
                { message: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
            )
        };
    }

    return { limited: false, remaining: limit - count, response: null };
}

/**
 * Records a failed attempt for progressive lockout scenarios (used in
 * addition to checkRateLimit for login, to slow down credential stuffing
 * even within the base rate limit window).
 */
export async function recordFailedAttempt(request, bucketName, options = {}) {
    return checkRateLimit(request, `${bucketName}:fail`, options);
}
