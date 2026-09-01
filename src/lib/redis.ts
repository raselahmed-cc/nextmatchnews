import { Redis } from '@upstash/redis'

// Constructed lazily (not via Redis.fromEnv(), which throws immediately if
// the env vars are missing) so the app works with no Redis configured at
// all — every helper below falls back to calling the live fetcher directly.
// This is the "reasonable fallback when Redis is unavailable" behavior
// CLAUDE.md §8 requires, and Upstash Redis is disposable cache infrastructure
// only — never the source of truth for anything written here.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

export const isRedisConfigured = Boolean(redisUrl && redisToken)

const redis = isRedisConfigured ? new Redis({ url: redisUrl!, token: redisToken! }) : null

/**
 * Returns the cached value for `key` if present, otherwise calls `fetcher`,
 * caches the result for `ttlSeconds`, and returns it. Every cache entry has
 * an intentional TTL — never store something here without one. Falls back to
 * calling `fetcher` directly (no caching) if Redis isn't configured or a
 * Redis call fails, so a cache outage degrades performance, not correctness.
 */
export const getOrSetCache = async <T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> => {
  if (!redis) return fetcher()

  try {
    const cached = await redis.get<T>(key)
    if (cached !== null && cached !== undefined) {
      return cached
    }
  } catch (error) {
    console.error(`[redis] read failed for key "${key}", falling back to live fetch:`, error)
    return fetcher()
  }

  const fresh = await fetcher()

  try {
    await redis.set(key, fresh, { ex: ttlSeconds })
  } catch (error) {
    console.error(`[redis] write failed for key "${key}":`, error)
  }

  return fresh
}

/**
 * Tracks a provider's daily request quota so a bug (or an unexpectedly busy
 * day) can't silently burn through a free-tier API limit — see CLAUDE.md
 * §10. Returns true if the request is allowed. With no Redis configured
 * there's nowhere to track usage, so it allows the request but warns loudly
 * rather than blocking sports data entirely over a missing cache.
 */
export const checkAndIncrementQuota = async (
  provider: string,
  dailyLimit: number,
): Promise<boolean> => {
  if (!redis) {
    console.warn(`[redis] no Redis configured — cannot track "${provider}" quota; allowing request.`)
    return true
  }

  const today = new Date().toISOString().slice(0, 10)
  const key = `quota:${provider}:${today}`

  try {
    const count = await redis.incr(key)
    if (count === 1) {
      // First request of the day for this provider — expire the counter
      // well after midnight UTC so it resets on its own.
      await redis.expire(key, 60 * 60 * 25)
    }

    if (count > dailyLimit) {
      console.warn(`[redis] daily quota exceeded for "${provider}": ${count}/${dailyLimit}`)
      return false
    }

    return true
  } catch (error) {
    console.error(`[redis] quota check failed for "${provider}", allowing request:`, error)
    return true
  }
}

/**
 * Fire-and-forget click counter for /go/[slug] affiliate redirects — CLAUDE.md
 * §41 wants affiliate-click attribution without collecting personal data, so
 * this only ever increments a per-provider-per-day counter, nothing tied to
 * a visitor. A no-op with no Redis configured, since a redirect must never
 * fail or slow down over a missing cache.
 */
export const trackAffiliateClick = async (providerSlug: string): Promise<void> => {
  if (!redis) return

  const today = new Date().toISOString().slice(0, 10)
  const key = `affiliate-clicks:${providerSlug}:${today}`

  try {
    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, 60 * 60 * 24 * 32)
    }
  } catch (error) {
    console.error(`[redis] click tracking failed for "${providerSlug}":`, error)
  }
}
