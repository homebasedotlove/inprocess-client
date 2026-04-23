import { NextRequest, NextResponse } from 'next/server'

const INPROCESS_API = 'https://inprocess.world/api'

export async function POST(req: NextRequest) {
  const apiKey = process.env.INPROCESS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'INPROCESS_API_KEY not configured' }, { status: 500 })
  }

  const body = await req.json()

  // Browser-mimicking headers reduce the chance of Cloudflare flagging this
  // as automated traffic and returning an HTML challenge page.
  const res = await fetch(`${INPROCESS_API}/moment/collect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': apiKey,
      'User-Agent': 'Mozilla/5.0 (compatible; inprocess-client/1.0)',
      'Origin': 'https://inprocess.world',
      'Referer': 'https://inprocess.world/',
    },
    body: JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json(
      { error: `Upstream returned non-JSON response (${res.status}) — possibly blocked by bot protection` },
      { status: 502 }
    )
  }

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
