import { NextRequest, NextResponse } from 'next/server'
import Arweave from 'arweave'

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
})

export async function POST(req: NextRequest) {
  const arweaveKey = process.env.ARWEAVE_KEY
  if (!arweaveKey) {
    return NextResponse.json({ error: 'ARWEAVE_KEY not configured' }, { status: 500 })
  }

  let key: object
  try {
    key = JSON.parse(Buffer.from(arweaveKey, 'base64').toString('utf-8'))
  } catch {
    return NextResponse.json({ error: 'Invalid ARWEAVE_KEY format' }, { status: 500 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const jsonBody = formData.get('json') as string | null

  // Handle JSON metadata upload
  if (jsonBody) {
    const buffer = Buffer.from(jsonBody, 'utf-8')
    const tx = await arweave.createTransaction({ data: buffer }, key)
    tx.addTag('Content-Type', 'application/json')
    await arweave.transactions.sign(tx, key)
    const res = await arweave.transactions.post(tx)
    if (res.status !== 200 && res.status !== 202) {
      return NextResponse.json({ error: 'Arweave upload failed', status: res.status }, { status: 500 })
    }
    return NextResponse.json({ uri: `ar://${tx.id}` })
  }

  // Handle binary file upload
  if (!file) {
    return NextResponse.json({ error: 'No file or json provided' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)
  const tx = await arweave.createTransaction({ data }, key)
  tx.addTag('Content-Type', file.type || 'application/octet-stream')
  await arweave.transactions.sign(tx, key)
  const res = await arweave.transactions.post(tx)

  if (res.status !== 200 && res.status !== 202) {
    return NextResponse.json({ error: 'Arweave upload failed', status: res.status }, { status: 500 })
  }

  return NextResponse.json({ uri: `ar://${tx.id}` })
}
