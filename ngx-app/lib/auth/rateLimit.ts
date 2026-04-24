/**
 * In-memory rate limiter.
 *
 * Works for single-instance deployments (local dev, small VPS).
 * For multi-instance / serverless (Vercel), upgrade to:
 *   @upstash/ratelimit + @upstash/redis  (free tier available)
 *
 * Usage:
 *   const result = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
 *   if (!result.allowed) return 429;
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Purge expired keys every 5 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, e] of store) {
    if (now > e.resetAt) store.delete(key);
  }
}, 5 * 60_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}
