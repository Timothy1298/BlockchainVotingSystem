import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import createMockConnector from './connectors/MockConnector';

// Optional mock connector for CI/E2E to avoid external WalletConnect calls.
// The mock connector is a lightweight shim that matches the shape expected by
// the app (it does not perform real signing). Enable with VITE_ENABLE_MOCK_WALLET=true
const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
const ENABLE_MOCK_WALLET = import.meta.env.VITE_ENABLE_MOCK_WALLET === 'true';

const connectors = [injected()];

if (ENABLE_MOCK_WALLET) {
  const mockConnector = createMockConnector({ defaultAccount: '0x0000000000000000000000000000000000000001', defaultChainId: mainnet.id });
  // Wagmi expects connector entries to be connector factory functions (connectorFn)
  // so wrap our mock instance in a function that returns it when called.
  connectors.push(() => mockConnector);
}

if (WALLET_CONNECT_PROJECT_ID) {
  connectors.push(walletConnect({ projectId: WALLET_CONNECT_PROJECT_ID }));
} else {
  // When project id is not provided, avoid initializing WalletConnect which
  // would attempt to fetch remote config and cause 403/400 errors in browser.
  console.warn('VITE_WALLETCONNECT_PROJECT_ID not set — WalletConnect disabled');
}

export const __ENABLE_MOCK_WALLET = ENABLE_MOCK_WALLET;

export const config = createConfig({
  autoConnect: true,
  connectors,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});