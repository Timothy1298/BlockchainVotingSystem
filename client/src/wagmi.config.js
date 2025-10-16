// wagmi.config.js
import { http, createConfig } from 'wagmi'
import { mainnet, polygon, bsc } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// ✅ Create a Wagmi configuration instance
export const config = createConfig({
  chains: [mainnet, polygon, bsc],
  connectors: [
    injected(), // MetaMask, Brave, Coinbase, etc.
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
  ssr: false, // Disable SSR if you're using Vite/React client-side only
})
