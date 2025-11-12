import React from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { config } from './wagmi'
import './index.css'

// Context providers
import { AuthProvider } from './contexts/auth/AuthContext'
import { UIProvider } from './contexts/ui/UIContext'
import { CandidatesProvider } from './contexts/candidates/CandidatesContext'
import { VotingProvider } from './contexts/voters/VotingContext'
import { VoterRegistrationProvider } from './contexts/voters/VoterRegistrationContext'
import WalletProvider from './contexts/blockchain/WalletContext'
import { MetaMaskProvider } from './contexts/blockchain'
import { GlobalUIProvider } from './components/common/GlobalUI'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found: #root')
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
  },
});

createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
          <GlobalUIProvider>
          <AuthProvider>
            <UIProvider>
            <CandidatesProvider>
              <VotingProvider>
                <VoterRegistrationProvider>
                  <MetaMaskProvider>
                    <WalletProvider>
                      <App />
                    </WalletProvider>
                  </MetaMaskProvider>
                </VoterRegistrationProvider>
              </VotingProvider>
            </CandidatesProvider>
          </UIProvider>
        </AuthProvider>
        </GlobalUIProvider>
      </WagmiConfig>
    </QueryClientProvider>
  </React.StrictMode>
)
