import { redis } from './redis';

export interface RateLimitResult {
  success:  boolean;
  limit:    number;
  remaining: number;
  resetAt:  number;
}

/**
 * Fixed-window rate limiter backed by Redis (via INCR + EXPIRE) so limits hold
 * across the stateless, multi-instance serverless functions this app runs on
 * — an in-memory counter would reset per instance and not actually limit
 * anything in production. Fails open (allows the request) if Redis is
 * unreachable: an auth outage from a Redis blip is worse than a temporarily
 * unthrottled login. See ADR-004 in docs/03-architecture.md.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const redisKey = `ratelimit:${key}`;
  try {
    const count = await redis.incr(redisKey);
    if (count === 1) await redis.expire(redisKey, windowSeconds);
    const ttl = await redis.ttl(redisKey);

    return {
      success:   count <= limit,
      limit,
      remaining: Math.max(limit - count, 0),
      resetAt:   Date.now() + Math.max(ttl, 0) * 1000,
    };
  } catch (error) {
    console.error('[rateLimit] Redis unavailable, failing open', error);
    return { success: true, limit, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 };
  }
}

// Shared between the web (NextAuth authorize()) and mobile (/api/auth/mobile)
// login paths so brute-forcing one account is throttled the same way regardless
// of which entry point is used.
export const LOGIN_ATTEMPT_LIMIT = 5;
export const LOGIN_WINDOW_SECONDS = 15 * 60;

export function loginRateLimitKey(email: string, ip: string): string {
  return `login:${email.toLowerCase().trim()}:${ip}`;
}

export function getClientIp(headers: Headers | Record<string, any> | undefined): string {
  if (!headers) return 'unknown';
  const get = (name: string): string | undefined =>
    headers instanceof Headers ? headers.get(name) ?? undefined : headers[name] ?? headers[name.toLowerCase()];

  const forwarded = get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const real = get('x-real-ip');
  if (real) return real;

  return 'unknown';
}
