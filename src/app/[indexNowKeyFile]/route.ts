import { NextResponse } from 'next/server'

// IndexNow verifies key ownership by fetching https://{host}/{key}.txt before
// accepting pings — see src/lib/indexNow.ts. This only ever matches that one
// exact filename; every other single-segment path falls through to Next's
// normal 404 exactly as it did before this route existed (this directory
// only intercepts paths with no matching static route, and no other
// top-level route in this app is a bare, unprefixed single segment).
export async function GET(_request: Request, { params }: { params: Promise<{ indexNowKeyFile: string }> }) {
  const { indexNowKeyFile } = await params
  const key = process.env.INDEXNOW_KEY

  if (!key || indexNowKeyFile !== `${key}.txt`) {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(key, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
