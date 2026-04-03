import { NextRequest, NextResponse } from 'next/server'

const INPROCESS_API = 'https://inprocess.world/api'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const collection = searchParams.get('collection') ?? process.env.NEXT_PUBLIC_PLATFORM_COLLECTION
  const page = searchParams.get('page') ?? '1'
  const limit = searchParams.get('limit') ?? '20'

  const url = new URL(`${INPROCESS_API}/timeline`)
  if (collection) url.searchParams.set('collection', collection)
  url.searchParams.set('page', page)
  url.searchParams.set('limit', limit)
  url.searchParams.set('chain_id', '8453')

  const res = await fetch(url.toString(), { next: { revalidate: 30 } })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
