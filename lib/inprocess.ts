export const INPROCESS_API = 'https://inprocess.world/api'
export const CHAIN_ID = 8453 // Base mainnet

export interface SalesConfig {
  type: 'fixedPrice' | 'erc20Mint'
  pricePerToken: string
  saleStart: string
  saleEnd: string
  currency?: string
}

export interface Moment {
  collectionAddress: string
  tokenId: string
  uri: string
  default_admin: string
  admins: string[]
  createdAt: string
  updatedAt: string
  metadata?: {
    name?: string
    description?: string
    image?: string
    animation_url?: string
    content?: { mime?: string; uri?: string }
  }
}

export interface TimelineResponse {
  moments: Moment[]
  pagination: { page: number; limit: number; totalPages: number }
  status: string
}

export interface CreateMomentPayload {
  contract: {
    address?: string
    name?: string
    uri?: string
  }
  token: {
    tokenMetadataURI: string
    createReferral: string
    salesConfig: SalesConfig
    mintToCreatorCount: number
    payoutRecipient?: string
    maxSupply?: number
  }
  account: string
}

export interface CreateMomentResponse {
  contractAddress: string
  tokenId: string
  hash: string
  chainId: number
}

export interface CollectPayload {
  moment: {
    collectionAddress: string
    tokenId: string
    chainId?: number
  }
  amount: number
  comment?: string
}

export interface CollectResponse {
  hash: string
  chainId: number
}

/** Convert ar:// or ipfs:// URIs to fetchable HTTPS URLs */
export function resolveUri(uri: string): string {
  if (!uri) return ''
  if (uri.startsWith('ar://')) {
    return `https://arweave.net/${uri.slice(5)}`
  }
  if (uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`
  }
  return uri
}

/** Fetch timeline moments, optionally filtered by collection */
export async function fetchTimeline(params: {
  collection?: string
  page?: number
  limit?: number
}): Promise<TimelineResponse> {
  const url = new URL(`${INPROCESS_API}/timeline`)
  if (params.collection) url.searchParams.set('collection', params.collection)
  if (params.page) url.searchParams.set('page', String(params.page))
  url.searchParams.set('limit', String(params.limit ?? 20))
  url.searchParams.set('chain_id', String(CHAIN_ID))

  const res = await fetch(url.toString(), { next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`Timeline fetch failed: ${res.status}`)
  return res.json()
}

/** Fetch metadata from an Arweave/IPFS URI */
export async function fetchMetadata(uri: string): Promise<Moment['metadata']> {
  try {
    const url = resolveUri(uri)
    if (!url) return {}
    const res = await fetch(url)
    if (!res.ok) return {}
    return res.json()
  } catch {
    return {}
  }
}

/** Shorten an Ethereum address for display */
export function shortAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
