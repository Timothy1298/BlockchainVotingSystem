import React, { createContext, useContext } from 'react';
import { useMetaMask } from '../../hooks/blockchain';

const MetaMaskContext = createContext();

export const useMetaMaskContext = () => {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error('useMetaMaskContext must be used within a MetaMaskProvider');
  }
  return context;
};

export const MetaMaskProvider = ({ children }) => {
  const metaMaskData = useMetaMask();

  return (
    <MetaMaskContext.Provider value={metaMaskData}>
      {children}
    </MetaMaskContext.Provider>
  );
};
