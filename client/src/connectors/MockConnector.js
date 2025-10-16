// Lightweight mock connector for tests and CI.
// Implements a minimal subset of the wagmi connector shape.
import { EventEmitter } from 'events';

export default function createMockConnector({ defaultAccount = '0x0000000000000000000000000000000000000001', defaultChainId = 1 } = {}) {
  const emitter = new EventEmitter();
  let connected = false;
  let account = defaultAccount;
  let chainId = defaultChainId;

  // Minimal provider implementing request({ method, params }) to satisfy dapps that
  // call window.ethereum.request
  const provider = {
    isMock: true,
    request: async ({ method, params }) => {
      switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return [account];
        case 'eth_chainId':
          return `0x${chainId.toString(16)}`;
        case 'personal_sign':
        case 'eth_sign':
          // return a fake signature (not cryptographically valid) but consistent
          return `0xMOCKSIG${Buffer.from(String(params || '')).toString('hex')}`;
        case 'eth_sendTransaction':
          // return a fake tx hash
          return '0x' + 'a'.repeat(64);
        default:
          console.warn('Mock provider received unknown method', method, params);
          return null;
      }
    },
    on: (ev, handler) => emitter.on(ev, handler),
    removeListener: (ev, handler) => emitter.off(ev, handler),
  };

  // Minimal mock signer to satisfy code that expects a signer object
  const signer = {
    getAddress: async () => account,
    signMessage: async (msg) => `0xMOCKSIG${Buffer.from(String(msg || '')).toString('hex')}`,
    // provide a small marker so callers can detect mock signer if needed
    _isMockSigner: true,
  };

  return {
    id: 'mock',
    name: 'Mock Wallet',
    ready: true,
    connect: async () => {
      connected = true;
      // expose provider on window for dapps that check window.ethereum
      try { window.ethereum = provider; } catch (e) { /* ignore in test env */ }
      emitter.emit('connect', { account, chain: { id: chainId } });
      return { account, chain: { id: chainId }, provider, signer };
    },
    disconnect: async () => {
      connected = false;
      try { if (window.ethereum && window.ethereum.isMock) delete window.ethereum; } catch (e) {}
      emitter.emit('disconnect');
      return {};
    },
    getAccount: async () => account,
    getChainId: async () => chainId,
    // wagmi connectors sometimes call getProvider()/getSigner()
    // Provide these to match the expected minimal connector shape.
    getProvider: async () => provider,
    getSigner: async () => signer,
      // Some wagmi flows call isAuthorized() to check if the connector has an active
      // session. Provide a minimal implementation returning the connected state.
      isAuthorized: async () => connected,
    isConnected: () => connected,
    on: (event, handler) => emitter.on(event, handler),
    off: (event, handler) => emitter.off(event, handler),
    // simulate switching chain in tests
    switchChain: async (newChainId) => {
      chainId = newChainId;
      emitter.emit('chainChanged', { id: chainId });
      return { id: chainId };
    },
    provider,
  };
}
