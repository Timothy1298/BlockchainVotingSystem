import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
// Assuming the following service import is correctly structured in the project
// import { initWeb3 } from '../../services/blockchain';
import { motion } from 'framer-motion';
import { Zap, Copy, LogOut } from 'lucide-react';

// --- MOCK initWeb3 function for component execution ---
// This mock allows the component to run without a real web3 dependency
const mockAddress = '0xAbC3F96328A32D65f242566734d0bC426a84f33b';
const mockNetwork = { name: 'Goerli', chainId: 5 };
const mockSigner = { getAddress: async () => mockAddress };

const initWeb3 = async ({ requestAccounts = false }) => {
    // Simulate MetaMask not installed
    if (typeof window.ethereum === 'undefined') return { provider: null, signer: null };

    // Simulate connection logic
    if (requestAccounts) {
        // Assume connection success
        return { 
            provider: { 
                getNetwork: async () => mockNetwork,
                listAccounts: async () => [mockAddress],
                send: async (method, params) => method === 'eth_accounts' ? [mockAddress] : [],
            }, 
            signer: mockSigner 
        };
    }
    // Simulate non-request check (for checkIfConnected)
    if (localStorage.getItem('wallet_connected')) {
        return { 
            provider: { 
                getNetwork: async () => mockNetwork,
                listAccounts: async () => [mockAddress],
                send: async (method, params) => method === 'eth_accounts' ? [mockAddress] : [],
            }, 
            signer: mockSigner 
        };
    }
    return { provider: null, signer: null };
};
// ---------------------------------------------------------

// Small, lightweight SVG loader (scales with a `size` prop)
const Loader = ({ size = 20, className = 'text-sky-400' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    style={{ width: size, height: size }}
    className={`animate-spin ${className}`}
    fill="none"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
    <path
      d="M22 12a10 10 0 0 1-10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

// Reusable animated button wrapped with framer-motion
const AnimatedButton = ({ children, onClick, disabled = false, className = '' }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      disabled={disabled}
      // Apply dark theme button styling
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-900 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </motion.button>
  );
};

// Helper: shorten an address like 0x1234...abcd
const shorten = (addr = '') => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function WalletConnectCard({ onWalletConnected }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [network, setNetwork] = useState(null);

  // Store connection status in localStorage (mocked for persistence)
  useEffect(() => {
    if (account) {
        localStorage.setItem('wallet_connected', 'true');
    } else {
        localStorage.removeItem('wallet_connected');
    }
  }, [account]);

  useEffect(() => {
    // Basic listeners
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      checkIfConnected();
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAccountsChanged(accounts) {
    if (!accounts || accounts.length === 0) {
      setAccount(null);
      setError(null);
    } else {
      setAccount(accounts[0]);
      setError(null);
    }
  }

  async function handleChainChanged(_chainId) {
    // Simple strategy: re-fetch network details after a chain change
    try {
      const { provider } = await initWeb3({ requestAccounts: false });
      if (!provider) return setNetwork(null);
      const net = await provider.getNetwork();
      setNetwork(net);
      // Optional: force page reload if chain change is critical
      // window.location.reload(); 
    } catch (e) {
      setNetwork(null);
    }
  }

  async function checkIfConnected() {
    if (typeof window.ethereum === 'undefined') return;
    try {
      const { provider, signer } = await initWeb3({ requestAccounts: false });
      if (!provider) return;

      let accounts = [];
      try {
        // Modern approach and fallback
        accounts = (provider.listAccounts) ? await provider.listAccounts() : await provider.send('eth_accounts', []);
      } catch (e) {
        accounts = [];
      }

      if (accounts.length > 0) {
        const connectedAddress = accounts[0];
        setAccount(connectedAddress);
        let net = null;
        try { net = await provider.getNetwork(); } catch (e) { net = null; }
        setNetwork(net);
        if (onWalletConnected) {
          onWalletConnected({ address: connectedAddress, provider, signer, network: net });
        }
      }
    } catch (e) {
      console.error('checkIfConnected error', e);
    }
  }

  async function connectWallet() {
    setError(null);
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask (or another injected wallet) not detected. Please install a web3 wallet.');
      return;
    }

    try {
      setLoading(true);
      const { provider, signer } = await initWeb3({ requestAccounts: true });
      if (!provider || !signer) throw new Error('Connection rejected or failed.');
      
      const address = await signer.getAddress();
      setAccount(address);
      const net = await provider.getNetwork();
      setNetwork(net);
      if (onWalletConnected) onWalletConnected({ address, provider, signer, network: net });
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to connect to wallet');
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    // Clears UI state and localStorage marker
    setAccount(null);
    setNetwork(null);
    setError(null);
  }

  async function copyAddress() {
    try {
      if (!account) return;
      await navigator.clipboard.writeText(account);
    } catch (e) {
      console.warn('clipboard copy failed', e);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-2xl shadow-black/60 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-700 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-sky-400">Web3 Wallet</h2>
            <p className="mt-1 text-sm text-gray-400">Connect securely to sign transactions and participate on-chain.</p>
          </div>
        </div>

        <div className="mt-6">
          {!account ? (
            <AnimatedButton
              onClick={connectWallet}
              disabled={loading}
              // Primary button: Sky blue accent
              className={`w-full bg-sky-600 text-white hover:bg-sky-500 shadow-sky-900/50`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader size={18} />
                  <span className="text-base">Connecting...</span>
                </div>
              ) : (
                <>
                  <Zap className="h-5 w-5 fill-sky-200" />
                  <span>Connect Wallet</span>
                </>
              )}
            </AnimatedButton>
          ) : (
            <div className="flex flex-col gap-5">
                {/* Account Info Row */}
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-700/50 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3">
                        {/* Address Icon/Indicator */}
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-mono shadow-md text-xs">
                            <Zap className="w-4 h-4 fill-emerald-300" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-100">{shorten(account)}</div>
                            <div className="text-xs font-medium text-emerald-400">
                                <span className="inline-block w-2 h-2 mr-1 bg-emerald-500 rounded-full animate-pulse"></span>
                                Connected
                            </div>
                        </div>
                    </div>
                    
                    {/* Network Status Pill */}
                    <div className="text-xs px-3 py-1 rounded-full font-medium bg-sky-600/20 text-sky-300 border border-sky-600/50">
                        {network ? network.name : 'Unknown network'}
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-end gap-3">
                    <AnimatedButton onClick={copyAddress} className="bg-gray-700 text-gray-300 hover:bg-gray-600">
                        <Copy className="w-4 h-4" />
                        Copy Address
                    </AnimatedButton>
                    <AnimatedButton onClick={disconnect} className="bg-red-600 text-white hover:bg-red-500 shadow-red-900/50">
                        <LogOut className="w-4 h-4" />
                        Disconnect
                    </AnimatedButton>
                </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm font-medium text-red-400 p-3 bg-red-900/30 rounded-lg border border-red-700">{error}</p>}

          <div className="mt-5 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500 italic">
              * Using an injected wallet (e.g., MetaMask). Connection state is primarily controlled by the wallet itself.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}