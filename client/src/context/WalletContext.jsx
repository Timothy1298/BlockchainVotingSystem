import React, { createContext, useEffect, useState } from 'react';
import { initWeb3 } from '../services/web3';

export const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(localStorage.getItem('connected_wallet') || null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    const hydrate = async () => {
      if (!address) return;
      try {
        const { provider: p, signer: s } = await initWeb3({ requestAccounts: false });
        setProvider(p);
        setSigner(s);
      } catch (e) {
        console.error('wallet hydrate failed', e);
      }
    };
    hydrate();

    const onWallet = (e) => {
      const addr = e?.detail?.address || localStorage.getItem('connected_wallet');
      setAddress(addr);
    };
    window.addEventListener('walletConnected', onWallet);
    return () => window.removeEventListener('walletConnected', onWallet);
  }, [address]);

  return (
    <WalletContext.Provider value={{ address, provider, signer, setAddress, setProvider, setSigner }}>
      {children}
    </WalletContext.Provider>
  );
};
