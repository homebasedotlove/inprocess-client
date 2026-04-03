'use client'

import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  rabbyWallet,
  safeWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Wallets',
      wallets: [injectedWallet, metaMaskWallet, coinbaseWallet, rabbyWallet, safeWallet],
    },
  ],
  {
    appName: 'inprocess client',
    // projectId is required by RainbowKit's types but is only consumed by the
    // WalletConnect connector — which we intentionally exclude above.
    projectId: 'inprocess-client',
  }
)

export const wagmiConfig = createConfig({
  connectors,
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
})
