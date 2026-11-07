/**
 * Simple fixed-window rate limiter keyed by client IP (+ optional route label).
 */
export function createRateLimiter({ windowMs, max }) {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const buckets = new Map()

  function prune(now) {
    for (const [key, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(key)
    }
  }

  return function check(key) {
    const now = Date.now()
    if (buckets.size > 5_000) prune(now)

    const existing = buckets.get(key)
    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return { allowed: true, remaining: max - 1 }
    }

    if (existing.count >= max) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      }
    }

    existing.count += 1
    return { allowed: true, remaining: max - existing.count }
  }
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress ?? 'unknown'
}
