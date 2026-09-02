import { getServerSideURL } from '@/lib/seo'

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

// IndexNow (indexnow.org) — a real, working "notify search engines the
// instant something publishes" protocol, jointly run by Microsoft Bing and
// Yandex and also honored by Naver, Seznam.cz, and Yep. It does NOT cover
// Google: Google publicly declined to join IndexNow and retired its old
// sitemap-ping endpoint in 2023, and the Google Indexing API is officially
// scoped to JobPosting/BroadcastEvent pages only — using it for articles is
// unsupported and doesn't reliably speed up indexing. For Google specifically,
// the real levers are a fresh, accurate sitemap (already dynamic — see
// src/app/sitemap.ts) so it's discovered on Google's own crawl schedule, and
// Search Console's manual "Request Indexing" (no public API for regular
// content, so it can't be triggered from here).
//
// Silently no-ops if INDEXNOW_KEY isn't configured, and never throws — a
// failed ping must never break a publish. See src/app/[indexNowKeyFile]/route.ts
// for the key-verification file IndexNow checks before accepting pings.
export const notifyIndexNow = async (urls: string[]): Promise<void> => {
  const key = process.env.INDEXNOW_KEY
  if (!key || urls.length === 0) return

  const baseUrl = getServerSideURL()
  let host: string
  try {
    host = new URL(baseUrl).hostname
  } catch {
    return
  }

  // Only real, publicly reachable hosts can be verified by IndexNow — skip
  // during local development rather than sending doomed requests.
  if (host === 'localhost' || host === '127.0.0.1') return

  try {
    await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${baseUrl}/${key}.txt`,
        urlList: urls,
      }),
    })
  } catch (error) {
    console.error('[indexnow] notify failed:', error)
  }
}
