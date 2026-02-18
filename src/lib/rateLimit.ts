// Basic in-memory rate limiter for server-side hardening.
// TODO: Replace with Redis for production multi-instance scaling.

interface RateLimitRef {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRef>();

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 60;

export async function rateLimit(key: string, customLimit?: number, customWindow?: number) {
  const now = Date.now();
  const windowToUse = customWindow || WINDOW_MS;
  const limitToUse = customLimit || MAX_REQUESTS;

  let ref = memoryStore.get(key);

  if (!ref || now > ref.resetAt) {
    ref = { count: 0, resetAt: now + windowToUse };
  }

  ref.count += 1;
  memoryStore.set(key, ref);

  if (ref.count > limitToUse) {
    return {
      limited: true,
      retryAfterMs: Math.max(0, ref.resetAt - now),
    };
  }

  return {
    limited: false,
    retryAfterMs: 0,
  };
}
