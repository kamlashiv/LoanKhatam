/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * Used to protect expensive endpoints (AI extraction, Gmail scan) from abuse
 * and runaway cost. Keyed by an arbitrary string (e.g. a Clerk user id), so a
 * single account cannot flood the upstream OpenAI / Gmail APIs.
 *
 * In-memory only — resets on restart and is per-process. That is acceptable for
 * abuse/cost throttling; it is not a security boundary on its own.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 10000;

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets (only meaningful when not allowed). */
  retryAfter: number;
}

/**
 * Consume one token for `key`. Returns whether the call is allowed and, when
 * blocked, how many seconds until the window resets.
 */
export function consumeRateLimit(
  key: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    if (buckets.size > MAX_TRACKED_KEYS) sweep(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > max) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfter: 0 };
}

/**
 * Express middleware factory that throttles per authenticated user (falling
 * back to client IP for unauthenticated callers). Responds 429 with a
 * Retry-After header when the limit is exceeded.
 */
export function rateLimitPerUser(max: number, windowMs: number) {
  return (req: any, res: any, next: any) => {
    const key = `${req.userId ?? req.ip ?? "anon"}:${req.baseUrl}${req.path}`;
    const result = consumeRateLimit(key, max, windowMs);
    if (!result.allowed) {
      res.setHeader("Retry-After", String(result.retryAfter));
      return res.status(429).json({
        error: "Too many requests — please wait a moment and try again.",
      });
    }
    next();
  };
}
