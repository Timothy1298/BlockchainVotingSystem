import React, { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Copy, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';
import { useVotingContext } from '../../contexts/voters/VotingContext';
import { useGlobalUI } from '../../components/common';

const MetaMaskAccounts = memo(() => {
  const { 
    selectedAccount, 
    isConnected, 
    connectMetaMask, 
    getFormattedAccounts,
    loading: metaMaskLoading,
    error: metaMaskError 
  } = useMetaMaskContext();
  
  const { getVoterVotingStatus } = useVotingContext();
  const { showSuccess, showError } = useGlobalUI();
  
  const [formattedAccounts, setFormattedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load formatted accounts when connected
  useEffect(() => {
    const loadAccounts = async () => {
      if (isConnected) {
        setLoading(true);
        try {
          const accounts = await getFormattedAccounts();
          setFormattedAccounts(accounts);
        } catch (error) {
          console.error('Error loading accounts:', error);
          showError('Failed to load MetaMask accounts');
        } finally {
          setLoading(false);
        }
      }
    };

    loadAccounts();
  }, [isConnected, getFormattedAccounts, showError]);

  const copyToClipboard = (text, name) => {
    navigator.clipboard.writeText(text);
    showSuccess(`Copied ${name} address`);
  };

  const handleConnect = async () => {
    try {
      await connectMetaMask();
    } catch (error) {
      showError(error.message || 'Failed to connect to MetaMask');
    }
  };

  const getVotingStatus = (accountAddress) => {
    return getVoterVotingStatus(accountAddress);
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Blockchain Accounts</h3>
        </div>
        
        <div className="text-center py-8">
          <ExternalLink className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-400 mb-2">Connect MetaMask</h4>
          <p className="text-gray-500 mb-6">
            Connect your MetaMask wallet to use blockchain accounts for voting
          </p>
          
          <button
            onClick={handleConnect}
            disabled={metaMaskLoading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors mx-auto"
          >
            {metaMaskLoading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Connect MetaMask
              </>
            )}
          </button>
          
          {metaMaskError && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {metaMaskError}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Blockchain Accounts</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-gray-600 rounded w-24"></div>
                <div className="h-3 bg-gray-600 rounded w-16"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-6 bg-gray-600 rounded"></div>
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Hash className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Blockchain Accounts</h3>
        <div className="flex items-center gap-1 ml-auto">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm">Connected</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formattedAccounts.map((account, index) => {
          const votingStatus = getVotingStatus(account.address);
          const votedSeats = Object.keys(votingStatus);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium text-sm">{account.name}</h4>
                <span className="text-green-400 text-xs font-medium">{account.balance}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={account.address}
                  readOnly
                  className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs text-gray-300 font-mono"
                  aria-label={`${account.name} address`}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyToClipboard(account.address, account.name)}
                  className="p-1 text-purple-400 hover:text-purple-300 hover:bg-purple-600/20 rounded transition-colors"
                  title="Copy address"
                  aria-label={`Copy ${account.name} address`}
                >
                  <Copy className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Voting Status */}
              <div className="text-xs">
                {votedSeats.length > 0 ? (
                  <div className="text-green-400">
                    <div className="font-medium mb-1">Voted in {votedSeats.length} seat(s):</div>
                    {votedSeats.map(seat => (
                      <div key={seat} className="text-green-300">
                        • {seat}: {votingStatus[seat].candidateName}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400">No votes cast yet</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-blue-600/20 border border-blue-600/50 rounded-lg">
        <p className="text-blue-300 text-sm">
          💡 <strong>Tip:</strong> Use these blockchain accounts as voter IDs. Click the copy button to copy any address for voting.
        </p>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          View Voting Status For:
        </label>
        <select
          value={selectedAccount}
          onChange={(e) => {
            // This would be handled by parent component
          }}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          aria-label="Select account to view voting status"
        >
          <option value="">Select a voter to view their voting status</option>
          {formattedAccounts.map((account, index) => (
            <option key={index} value={account.address}>
              {account.name} - {account.balance}
            </option>
          ))}
        </select>
        <p className="text-gray-400 text-xs mt-1">
          Select a voter to see which candidates they can vote for and which seats they've already voted in.
        </p>
      </div>
    </div>
  );
});

MetaMaskAccounts.displayName = 'MetaMaskAccounts';

export default MetaMaskAccounts;
