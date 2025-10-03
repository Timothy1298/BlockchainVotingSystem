import API from './api';
import { ethers } from 'ethers';

// Try to initialize a browser wallet connection (MetaMask)
// Note: project uses ethers v6 where BrowserProvider replaces Web3Provider.
export const initWeb3 = async ({ requestAccounts = false } = {}) => {
  if (typeof window === 'undefined') return { provider: null };

  if (!window.ethereum) return { provider: null };

  // ethers v6 exposes BrowserProvider instead of providers.Web3Provider
  // fall back to providers.Web3Provider if running with an older API
  const BrowserProvider = ethers.BrowserProvider || (ethers.providers && ethers.providers.Web3Provider);
  if (!BrowserProvider) {
    // unexpected ethers build; return defensive shape
    return { provider: null };
  }

  const provider = new BrowserProvider(window.ethereum);
  try {
    if (requestAccounts) {
      // request accounts only when caller explicitly wants to connect
      if (window.ethereum.request) await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    // ethers v6 (and some environments) may make getSigner return a Promise
    // while older APIs return a Signer synchronously. Handle both cases so
    // callers always receive a usable Signer object (or null).
    let signer = null;
    if (provider.getSigner) {
      const maybeSigner = provider.getSigner();
      signer = (maybeSigner && typeof maybeSigner.then === 'function') ? await maybeSigner : maybeSigner;
    }
    return { provider, signer, web3: provider };
  } catch (err) {
    // User denied access or other error
    return { provider };
  }
};

// Fetch candidates from backend API (server may proxy to chain or mock)
export const getCandidates = async () => {
  const res = await API.get('/votes/candidates');
  return res.data;
};

// Cast a vote via backend API (backend will forward to chain or mock)
export const voteForCandidate = async (id) => {
  const res = await API.post('/votes/vote', { candidateId: id });
  return res.data;
};

// Attempt to send a vote transaction from the user's injected wallet (ethers v6)
// Falls back to throwing if wallet/contract not available — callers should fallback to server API.
export const sendVoteOnChain = async (electionId, candidateId) => {
  const { provider, signer } = await initWeb3({ requestAccounts: true });
  if (!signer) throw new Error('No wallet signer available');

  // Try to obtain the contract address from the server to avoid requiring a client-side env var
  let address = null;
  try {
    const cfg = await fetch('/api/config').then(r => r.json()).catch(() => null);
    address = cfg?.votingContractAddress || import.meta.env.VITE_VOTING_CONTRACT_ADDRESS || window?.VITE_VOTING_CONTRACT_ADDRESS;
  } catch (err) {
    address = import.meta.env.VITE_VOTING_CONTRACT_ADDRESS || window?.VITE_VOTING_CONTRACT_ADDRESS;
  }
  if (!address) throw new Error('VOTING_CONTRACT_ADDRESS is not set (server returned none and no client env var)');

  // Minimal ABI supporting single-election and multi-election vote signatures
  const abi = [
    'function vote(uint256)',
    'function vote(uint256,uint256)'
  ];

  const contract = new ethers.Contract(address, abi, signer);

  // Prefer the 2-arg vote(electionId, candidateId) if present
  try {
    const sig = 'vote(uint256,uint256)';
    // will throw if function not present in the interface
    contract.interface.getFunction(sig);
    const tx = await contract[sig](electionId, candidateId);
    await tx.wait();
    return tx;
  } catch (err) {
    // Try single-arg vote(candidateId)
    try {
      const sig1 = 'vote(uint256)';
      contract.interface.getFunction(sig1);
      const tx = await contract[sig1](candidateId);
      await tx.wait();
      return tx;
    } catch (err2) {
      throw new Error('Contract does not expose a compatible vote function');
    }
  }
};

// Best-effort: notify server of a client-signed tx so server can sync DB (if available)
export const postTxReceipt = async ({ txHash, electionId, candidateId, voterId }) => {
  try {
    await fetch('/api/tx/receipt', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txHash, electionId, candidateId, voterId })
    });
  } catch (err) {
    // ignore errors; server-side sync is best-effort
  }
};
