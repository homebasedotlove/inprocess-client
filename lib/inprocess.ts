import { formatEther } from 'viem'

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

export interface MomentDetail {
  uri: string
  owner: string
  saleConfig: {
    pricePerToken: string
    saleStart: string
    saleEnd: string
    currency?: string
  }
  momentAdmins: string[]
  metadata: {
    name?: string
    description?: string
    image?: string
    animation_url?: string
    content?: { mime?: string; uri?: string }
  }
}

/** Format wei price to a human-readable ETH string (BigInt-safe via viem) */
export function formatPrice(pricePerToken: string): string {
  const wei = BigInt(pricePerToken)
  if (wei === 0n) return 'free'
  const eth = formatEther(wei)
  // Trim trailing zeros: "0.100000…" → "0.1"
  const trimmed = eth.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
  return `${trimmed} ETH`
}

/** Shorten an Ethereum address for display */
export function shortAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
