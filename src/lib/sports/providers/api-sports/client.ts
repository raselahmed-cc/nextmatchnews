import { checkAndIncrementQuota, getOrSetCache } from '@/lib/redis'

// Shared low-level client for the api-sports.io platform, which hosts
// separate per-sport APIs (Football, American Football, Rugby, Formula 1,
// ...) under one account. Each host is billed/quota'd independently (see
// getDailyLimit) even though they share the same account, auth header, and
// response envelope — only the host and sport-specific fields inside
// `response[]` differ, handled per-sport by the adapter layer
// (src/lib/sports/adapters/), not here.
//
// Confirmed live for football/nfl/formula1/rugby against this account's own
// api-sports.io dashboard signup (not RapidAPI, which uses different
// headers/hosts).

const API_SPORTS_HOSTS = {
  football: 'https://v3.football.api-sports.io',
  nfl: 'https://v1.american-football.api-sports.io',
  rugby: 'https://v1.rugby.api-sports.io',
  formula1: 'https://v1.formula-1.api-sports.io',
  basketball: 'https://v1.basketball.api-sports.io',
} as const

export type ApiSportsSport = keyof typeof API_SPORTS_HOSTS

// Fallback only — used if the account's real limit can't be read (see
// getDailyLimit below). Confirmed live against the free plan's own /status
// response.
const DEFAULT_DAILY_LIMIT = 100

const REQUEST_TIMEOUT_MS = 10_000
const MAX_RETRIES = 2
const STATUS_CACHE_TTL_SECONDS = 60 * 60 * 6

// The stable, platform-wide response envelope every api-sports.io endpoint
// uses (documented and consistent across all of their sport APIs) — not to
// be confused with the sport-specific shape of each item inside `response`,
// which is deliberately left as `unknown` here for the adapter layer to
// parse once real responses have been inspected.
type ApiSportsEnvelope = {
  get: string
  parameters: Record<string, unknown>
  errors: unknown[] | Record<string, string>
  results: number
  paging?: { current: number; total: number }
  response: unknown[]
}

class ApiSportsError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiSportsError'
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const hasApiErrors = (errors: ApiSportsEnvelope['errors']): boolean =>
  Array.isArray(errors) ? errors.length > 0 : Object.keys(errors).length > 0

/**
 * Reads the account's real daily request limit straight from api-sports.io's
 * own /status endpoint, cached for a few hours. This is what makes the free
 * → paid upgrade "automatic": the quota ceiling in checkAndIncrementQuota
 * comes from the account's actual plan, not a constant we'd otherwise have
 * to remember to bump by hand after upgrading.
 */
const getDailyLimit = async (sport: ApiSportsSport): Promise<number> =>
  getOrSetCache(`api-sports:status:${sport}`, STATUS_CACHE_TTL_SECONDS, async () => {
    const apiKey = process.env.SPORTS_API_KEY
    if (!apiKey) return DEFAULT_DAILY_LIMIT

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      try {
        const response = await fetch(`${API_SPORTS_HOSTS[sport]}/status`, {
          headers: { 'x-apisports-key': apiKey },
          signal: controller.signal,
        })
        if (!response.ok) return DEFAULT_DAILY_LIMIT

        const envelope = (await response.json()) as {
          response?: { requests?: { limit_day?: number } }
        }
        return envelope.response?.requests?.limit_day ?? DEFAULT_DAILY_LIMIT
      } finally {
        clearTimeout(timeout)
      }
    } catch {
      return DEFAULT_DAILY_LIMIT
    }
  })

/**
 * Fetches one endpoint from the given api-sports.io sport API, with request
 * timeout, retry-with-backoff on transient failures, Redis-backed daily
 * quota enforcement, and optional response caching. Returns the raw
 * `response[]` array from the envelope — parsing that into our normalized
 * types is the adapter layer's job, not this one.
 */
export const apiSportsFetch = async (
  sport: ApiSportsSport,
  endpoint: string,
  params: Record<string, string> = {},
  options: { cacheKey?: string; ttlSeconds?: number; dailyLimit?: number } = {},
): Promise<unknown[]> => {
  const fetchLive = async (): Promise<unknown[]> => {
    const apiKey = process.env.SPORTS_API_KEY
    if (!apiKey) {
      throw new ApiSportsError('SPORTS_API_KEY is not configured.')
    }

    const dailyLimit = options.dailyLimit ?? (await getDailyLimit(sport))
    const allowed = await checkAndIncrementQuota(`api-sports-${sport}`, dailyLimit)
    if (!allowed) {
      throw new ApiSportsError(`Daily quota exhausted for api-sports.io (${sport}).`)
    }

    const url = new URL(`${API_SPORTS_HOSTS[sport]}/${endpoint.replace(/^\//, '')}`)
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }

    let lastError: unknown

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      try {
        const response = await fetch(url, {
          headers: { 'x-apisports-key': apiKey },
          signal: controller.signal,
        })

        if (!response.ok) {
          // Retry on transient server-side/rate-limit errors; fail fast on
          // anything else (bad request, auth failure, etc. won't fix itself).
          if ((response.status >= 500 || response.status === 429) && attempt < MAX_RETRIES) {
            lastError = new ApiSportsError(`HTTP ${response.status}`, response.status)
            await sleep(2 ** attempt * 500)
            continue
          }
          throw new ApiSportsError(`api-sports.io request failed: HTTP ${response.status}`, response.status)
        }

        const envelope = (await response.json()) as ApiSportsEnvelope

        if (hasApiErrors(envelope.errors)) {
          throw new ApiSportsError(`api-sports.io reported errors: ${JSON.stringify(envelope.errors)}`)
        }

        return envelope.response
      } catch (error) {
        lastError = error
        if (error instanceof ApiSportsError) throw error
        if (attempt < MAX_RETRIES) {
          await sleep(2 ** attempt * 500)
          continue
        }
      } finally {
        clearTimeout(timeout)
      }
    }

    throw lastError instanceof Error ? lastError : new ApiSportsError('api-sports.io request failed.')
  }

  if (options.cacheKey && options.ttlSeconds) {
    return getOrSetCache(options.cacheKey, options.ttlSeconds, fetchLive)
  }

  return fetchLive()
}
