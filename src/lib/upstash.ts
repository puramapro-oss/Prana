import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

/**
 * Graceful Upstash ratelimit. If REST URL/token are missing in env,
 * we fall back to a permissive in-memory limiter so dev/preview don't
 * break and we still get *some* protection against accidental loops.
 */

interface MemoryBucket {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, MemoryBucket>()

function memoryLimiter(windowMs: number, max: number) {
  return async (key: string) => {
    const now = Date.now()
    const bucket = memoryStore.get(key)
    if (!bucket || bucket.resetAt < now) {
      memoryStore.set(key, { count: 1, resetAt: now + windowMs })
      return { success: true, remaining: max - 1, reset: now + windowMs, limit: max }
    }
    if (bucket.count >= max) {
      return { success: false, remaining: 0, reset: bucket.resetAt, limit: max }
    }
    bucket.count++
    return { success: true, remaining: max - bucket.count, reset: bucket.resetAt, limit: max }
  }
}

const hasRedis = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

const redis = hasRedis ? Redis.fromEnv() : null

interface LimiterShape {
  limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number; limit: number }>
}

function makeLimiter(prefix: string, windowSec: number, max: number): LimiterShape {
  if (redis) {
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
      analytics: false,
      prefix: `prana:${prefix}`,
    })
    return { limit: async (key: string) => rl.limit(key) }
  }
  const fn = memoryLimiter(windowSec * 1000, max)
  return { limit: (key: string) => fn(`${prefix}:${key}`) }
}

/** General API rate limit — 30 requests / minute / IP. */
export const apiLimiter = makeLimiter("api", 60, 30)

/** Heavy AI calls — 12 / minute / user (or IP). */
export const aiLimiter = makeLimiter("ai", 60, 12)

/** Pulse check writes — 20 / minute / user. */
export const pulseLimiter = makeLimiter("pulse", 60, 20)

/** Magic button — 30 / 5 minutes / user (gives some headroom while hard quota lives in DB). */
export const magicButtonLimiter = makeLimiter("magic", 300, 30)
