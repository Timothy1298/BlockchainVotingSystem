import React, { createContext, useEffect, useState } from 'react';
import { initWeb3 } from '../../services/blockchain';

export const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(localStorage.getItem('connected_wallet') || null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(!!localStorage.getItem('connected_wallet'));
  const [isConnecting, setIsConnecting] = useState(false);
  const [ethBalance, setEthBalance] = useState('0');

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const { provider: p, signer: s, address: addr } = await initWeb3({ requestAccounts: true });
      setProvider(p);
      setSigner(s);
      setAddress(addr);
      setIsConnected(true);
      localStorage.setItem('connected_wallet', addr);
      
      // Get balance
      if (p && addr) {
        const balance = await p.getBalance(addr);
        setEthBalance((parseFloat(balance.toString()) / 1e18).toFixed(4));
      }
    } catch (e) {
      console.error('wallet connection failed', e);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setEthBalance('0');
    localStorage.removeItem('connected_wallet');
  };

  useEffect(() => {
    const hydrate = async () => {
      if (!address) return;
      try {
        const { provider: p, signer: s } = await initWeb3({ requestAccounts: false });
        setProvider(p);
        setSigner(s);
        
        // Get balance
        if (p && address) {
          const balance = await p.getBalance(address);
          setEthBalance((parseFloat(balance.toString()) / 1e18).toFixed(4));
        }
      } catch (e) {
        console.error('wallet hydrate failed', e);
      }
    };
    hydrate();

    const onWallet = (e) => {
      const addr = e?.detail?.address || localStorage.getItem('connected_wallet');
      setAddress(addr);
      setIsConnected(!!addr);
    };
    window.addEventListener('walletConnected', onWallet);
    return () => window.removeEventListener('walletConnected', onWallet);
  }, [address]);

  return (
    <WalletContext.Provider value={{ 
      address, 
      provider, 
      signer, 
      isConnected,
      isConnecting,
      ethBalance,
      walletAddress: address,
      connectWallet,
      disconnectWallet,
      setAddress, 
      setProvider, 
      setSigner 
    }}>
      {children}
    </WalletContext.Provider>
  );
};
export default WalletProvider;