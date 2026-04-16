/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent the Turbo SDK from being bundled server-side — load as external
  serverExternalPackages: ['@ardrive/turbo-sdk'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'arweave.net' },
      { protocol: 'https', hostname: '*.arweave.net' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: '*.ipfs.io' },
      { protocol: 'https', hostname: 'ipfs.decentralized-content.com' },
    ],
  },
}

export default nextConfig
