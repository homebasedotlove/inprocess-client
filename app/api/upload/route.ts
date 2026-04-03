import { NextRequest, NextResponse } from 'next/server'
import Arweave from 'arweave'

// Match the init config from the inprocess docs exactly
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false,
})

async function uploadData(data: Buffer | Uint8Array, contentType: string, key: object): Promise<string> {
  const tx = await arweave.createTransaction({ data }, key)
  tx.addTag('Content-Type', contentType)
  await arweave.transactions.sign(tx, key)

  // Use chunked uploader as documented — required for files > ~256 KB
  const uploader = await arweave.transactions.getUploader(tx)
  while (!uploader.isComplete) {
    await uploader.uploadChunk()
  }

  return `ar://${tx.id}`
}

export async function POST(req: NextRequest) {
  const arweaveKey = process.env.ARWEAVE_KEY
  if (!arweaveKey) {
    return NextResponse.json({ error: 'ARWEAVE_KEY not configured' }, { status: 500 })
  }

  let key: object
  try {
    key = JSON.parse(Buffer.from(arweaveKey, 'base64').toString('utf-8'))
  } catch {
    return NextResponse.json({ error: 'Invalid ARWEAVE_KEY format — must be base64-encoded JWK' }, { status: 500 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const jsonBody = formData.get('json') as string | null

  try {
    if (jsonBody) {
      const uri = await uploadData(Buffer.from(jsonBody, 'utf-8'), 'application/json', key)
      return NextResponse.json({ uri })
    }

    if (!file) {
      return NextResponse.json({ error: 'No file or json provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const uri = await uploadData(new Uint8Array(arrayBuffer), file.type || 'application/octet-stream', key)
    return NextResponse.json({ uri })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Arweave upload failed' },
      { status: 500 }
    )
  }
}
