import { useState, useEffect, useCallback } from 'react';

export const useMetaMask = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  }, []);

  // Connect to MetaMask
  const connectMetaMask = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAccounts(accounts);
        setSelectedAccount(accounts[0]);
        setIsConnected(true);
        return true;
      } else {
        setError('No accounts found. Please create an account in MetaMask.');
        return false;
      }
    } catch (err) {
      if (err.code === 4001) {
        setError('User rejected the connection request.');
      } else {
        setError('Failed to connect to MetaMask: ' + err.message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [isMetaMaskInstalled]);

  // Get account balance
  const getAccountBalance = useCallback(async (account) => {
    if (!isMetaMaskInstalled()) return '0 ETH';

    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account, 'latest']
      });

      // Convert from wei to ETH
      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
      return `${balanceInEth} ETH`;
    } catch (err) {
      console.error('Error getting balance:', err);
      return '0 ETH';
    }
  }, [isMetaMaskInstalled]);

  // Get formatted accounts with balances
  const getFormattedAccounts = useCallback(async () => {
    if (!isConnected || accounts.length === 0) return [];

    const formattedAccounts = await Promise.all(
      accounts.map(async (account, index) => {
        const balance = await getAccountBalance(account);
        return {
          address: account,
          balance,
          name: `Account ${index + 1}`,
          shortAddress: `${account.slice(0, 6)}...${account.slice(-4)}`
        };
      })
    );

    return formattedAccounts;
  }, [accounts, isConnected, getAccountBalance]);

  // Switch account
  const switchAccount = useCallback((accountAddress) => {
    if (accounts.includes(accountAddress)) {
      setSelectedAccount(accountAddress);
    }
  }, [accounts]);

  // Disconnect
  const disconnect = useCallback(() => {
    setAccounts([]);
    setSelectedAccount('');
    setIsConnected(false);
    setError(null);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (newAccounts) => {
      if (newAccounts.length === 0) {
        disconnect();
      } else {
        setAccounts(newAccounts);
        if (!newAccounts.includes(selectedAccount)) {
          setSelectedAccount(newAccounts[0]);
        }
      }
    };

    const handleChainChanged = () => {
      // Reload the page when chain changes
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isMetaMaskInstalled, selectedAccount, disconnect]);

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts.length > 0) {
          setAccounts(accounts);
          setSelectedAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (err) {
        console.error('Error checking MetaMask connection:', err);
      }
    };

    checkConnection();
  }, [isMetaMaskInstalled]);

  return {
    accounts,
    selectedAccount,
    isConnected,
    loading,
    error,
    isMetaMaskInstalled,
    connectMetaMask,
    getAccountBalance,
    getFormattedAccounts,
    switchAccount,
    disconnect,
    setError
  };
};
