import { NextResponse } from 'next/server'
import { syncBasketballCompetition, type BasketballSyncResult } from '@/lib/sports/sync/basketball'
import { syncF1Season, type F1SyncResult } from '@/lib/sports/sync/f1'
import { syncFootballCompetition, type FootballSyncResult } from '@/lib/sports/sync/football'
import { syncNFLCompetition, type NFLSyncResult } from '@/lib/sports/sync/nfl'
import { syncRugbyCompetition, type RugbySyncResult } from '@/lib/sports/sync/rugby'

export const dynamic = 'force-dynamic'

// Premier League — the one football competition wired up and verified so
// far. Add more league ids here once they've been checked against real
// api-sports.io responses (see src/lib/sports/adapters/football.ts).
const PREMIER_LEAGUE_ID = '39'
// Both NFL and NCAA Football live on the american-football host, league ids
// 1 and 2 respectively — confirmed live (league 2 -> { name: "NCAA" }).
const NFL_LEAGUE_ID = '1'
const NCAA_LEAGUE_ID = '2'
// Six Nations — the one rugby competition wired up and verified so far.
const SIX_NATIONS_LEAGUE_ID = '51'
// NBA — the one basketball competition wired up and verified so far.
const NBA_LEAGUE_ID = '12'

type SyncOutcome<T> = { ok: true; result: T } | { ok: false; error: string }

// Every call below omits `season`, so each resolves to whatever
// api-sports.io itself currently flags as the current season for that
// league — see the comment on syncFootballCompetition/syncNFLCompetition.
// On the free plan that season is outside the 2022-2024 window it allows,
// so this fails with a clear "plan" error; the exact same request starts
// succeeding the moment the account is upgraded, with no code change here.
const runSync = async <T>(fn: () => Promise<T>): Promise<SyncOutcome<T>> => {
  try {
    return { ok: true, result: await fn() }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Triggers a full sync of every wired-up sports competition. Intended to be
 * called by a scheduler (cron) once the app is deployed and reachable, or
 * on demand for now. Protected by SYNC_TRIGGER_SECRET since it spends real
 * api-sports.io daily quota — never leave that unset in production.
 *
 * NOTE: this re-upserts the *entire* season's fixtures/games on every call,
 * not just what changed. Fine for a few-times-a-day cron; too slow/wasteful
 * for tight live-score polling (e.g. every 60s) — that would need a
 * follow-up using api-sports.io's date/live-filtered endpoints instead of
 * the full-season one used here.
 */
const SPORT_KEYS = ['football', 'nfl', 'ncaa', 'rugby', 'f1', 'nba'] as const
type SportKey = (typeof SPORT_KEYS)[number]

// Optional ?only=nfl,ncaa restricts a run to specific sports — useful for
// backfilling/testing one sport without spending api-sports.io quota on the
// other five every time. Omitting it keeps the previous full-sync behavior.
const parseOnly = (request: Request): Set<SportKey> | null => {
  const raw = new URL(request.url).searchParams.get('only')
  if (!raw) return null
  const requested = raw.split(',').map((s) => s.trim().toLowerCase())
  const valid = requested.filter((s): s is SportKey => (SPORT_KEYS as readonly string[]).includes(s))
  return valid.length > 0 ? new Set(valid) : null
}

const handleSyncRequest = async (request: Request): Promise<NextResponse> => {
  const secret = process.env.SYNC_TRIGGER_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'SYNC_TRIGGER_SECRET is not configured.' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const only = parseOnly(request)
  const wants = (key: SportKey) => !only || only.has(key)
  const skipped: SyncOutcome<never> = { ok: true, result: undefined as never }

  const [football, nfl, ncaa, rugby, f1, nba] = await Promise.all([
    wants('football') ? runSync<FootballSyncResult>(() => syncFootballCompetition(PREMIER_LEAGUE_ID)) : skipped,
    wants('nfl') ? runSync<NFLSyncResult>(() => syncNFLCompetition('nfl', 'NFL', NFL_LEAGUE_ID)) : skipped,
    wants('ncaa')
      ? runSync<NFLSyncResult>(() => syncNFLCompetition('ncaa-football', 'NCAA Football', NCAA_LEAGUE_ID))
      : skipped,
    wants('rugby') ? runSync<RugbySyncResult>(() => syncRugbyCompetition(SIX_NATIONS_LEAGUE_ID)) : skipped,
    wants('f1') ? runSync<F1SyncResult>(() => syncF1Season()) : skipped,
    wants('nba') ? runSync<BasketballSyncResult>(() => syncBasketballCompetition(NBA_LEAGUE_ID)) : skipped,
  ])

  const ok = football.ok && nfl.ok && ncaa.ok && rugby.ok && f1.ok && nba.ok
  return NextResponse.json({ football, nfl, ncaa, rugby, f1, nba }, { status: ok ? 200 : 207 })
}

// Accept both GET and POST — different cron/scheduler providers default to
// different methods (e.g. Vercel Cron only sends GET), and this endpoint is
// intentionally not tied to a specific one yet.
export const GET = handleSyncRequest
export const POST = handleSyncRequest
