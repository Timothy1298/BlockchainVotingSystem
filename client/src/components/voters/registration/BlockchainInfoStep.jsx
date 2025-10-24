import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  RefreshCw,
  Shield,
  Info
} from 'lucide-react';
import { useVoterRegistration } from '../../../contexts/voters/VoterRegistrationContext';
import { useMetaMaskContext } from '../../../contexts/blockchain/MetaMaskContext';

const BlockchainInfoStep = ({ onNext, onPrevious }) => {
  const { 
    registrationData, 
    updateBlockchainInfo, 
    setError, 
    setSuccess, 
    clearMessages,
    api
  } = useVoterRegistration();

  const { 
    selectedAccount, 
    connectMetaMask, 
    isConnected, 
    loading: metaMaskLoading,
    accounts,
    switchAccount
  } = useMetaMaskContext();

  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState(null);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState(registrationData.blockchainInfo.walletAddress);

  // Check eligibility when wallet address changes
  useEffect(() => {
    if (selectedWalletAddress && selectedWalletAddress !== registrationData.blockchainInfo.walletAddress) {
      checkEligibility();
    }
  }, [selectedWalletAddress]);

  // Update blockchain info when MetaMask connection changes
  useEffect(() => {
    if (isConnected && selectedAccount) {
      setSelectedWalletAddress(selectedAccount);
      updateBlockchainInfo({
        walletAddress: selectedAccount,
        walletType: 'MetaMask',
        isConnected: true
      });
    }
  }, [isConnected, selectedAccount, updateBlockchainInfo]);

  // Check voter eligibility
  const checkEligibility = async () => {
    if (!selectedWalletAddress) return;

    try {
      setIsCheckingEligibility(true);
      clearMessages();

      const eligibility = await api.checkEligibility(selectedWalletAddress);
      setEligibilityStatus(eligibility);

      if (eligibility.isEligible) {
        setSuccess('Wallet address is eligible for voter registration!');
      } else {
        setError(eligibility.reason || 'This wallet address is not eligible for voter registration');
      }
    } catch (error) {
      setError('Failed to check eligibility. Please try again.');
      setEligibilityStatus(null);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      clearMessages();
      await connectMetaMask();
    } catch (error) {
      setError('Failed to connect MetaMask. Please make sure MetaMask is installed and unlocked.');
    }
  };

  // Handle account switch
  const handleAccountSwitch = (account) => {
    setSelectedWalletAddress(account);
    updateBlockchainInfo({
      walletAddress: account,
      walletType: 'MetaMask',
      isConnected: true
    });
  };

  // Copy wallet address to clipboard
  const copyToClipboard = (address) => {
    navigator.clipboard.writeText(address);
    setSuccess('Wallet address copied to clipboard!');
  };

  // Handle next step
  const handleNext = () => {
    if (!selectedWalletAddress) {
      setError('Please connect your wallet or enter a wallet address');
      return;
    }

    if (eligibilityStatus && !eligibilityStatus.isEligible) {
      setError('This wallet address is not eligible for voter registration');
      return;
    }

    updateBlockchainInfo({
      walletAddress: selectedWalletAddress,
      walletType: 'MetaMask',
      isConnected: isConnected
    });

    clearMessages();
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
          <Wallet className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Blockchain Wallet Connection</h2>
        <p className="text-gray-600">Connect your MetaMask wallet for secure voter registration</p>
      </div>

      {/* Wallet Connection Section */}
      <div className="space-y-6">
        {!isConnected ? (
          /* Connect Wallet */
          <div className="text-center py-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your MetaMask Wallet</h3>
              <p className="text-gray-600 mb-6">
                Connect your MetaMask wallet to proceed with voter registration. 
                Your wallet address will be used to verify your identity on the blockchain.
              </p>
              
              <button
                onClick={handleConnectWallet}
                disabled={metaMaskLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
              >
                {metaMaskLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Connect MetaMask
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Connected Wallet Info */
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Wallet Connected Successfully</h3>
                  <p className="text-green-700 text-sm">Your MetaMask wallet is connected and ready</p>
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connected Wallet Address
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm font-mono">
                  {selectedAccount ? `${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}` : 'No address'}
                </code>
                <button
                  onClick={() => copyToClipboard(selectedAccount)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Multiple Accounts */}
            {accounts && accounts.length > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Select Account</h4>
                <div className="space-y-2">
                  {accounts.map((account, index) => (
                    <button
                      key={account}
                      onClick={() => handleAccountSwitch(account)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedWalletAddress === account
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm">
                            {`${account.slice(0, 6)}...${account.slice(-4)}`}
                          </p>
                          <p className="text-xs text-gray-500">Account {index + 1}</p>
                        </div>
                        {selectedWalletAddress === account && (
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility Check */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Eligibility Status</h4>
                <button
                  onClick={checkEligibility}
                  disabled={isCheckingEligibility || !selectedWalletAddress}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                  title="Check eligibility"
                >
                  <RefreshCw className={`w-4 h-4 ${isCheckingEligibility ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {isCheckingEligibility ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Checking eligibility...</span>
                </div>
              ) : eligibilityStatus ? (
                <div className={`flex items-center gap-2 ${
                  eligibilityStatus.isEligible ? 'text-green-600' : 'text-red-600'
                }`}>
                  {eligibilityStatus.isEligible ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {eligibilityStatus.isEligible ? 'Eligible for registration' : 'Not eligible'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <Info className="w-4 h-4" />
                  <span className="text-sm">Click refresh to check eligibility</span>
                </div>
              )}

              {eligibilityStatus && !eligibilityStatus.isEligible && (
                <p className="text-red-600 text-sm mt-2">
                  {eligibilityStatus.reason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Security Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Security & Privacy</p>
              <ul className="space-y-1 text-xs">
                <li>• Your wallet address is used only for voter verification</li>
                <li>• We never request your private keys or seed phrases</li>
                <li>• All transactions are recorded on the blockchain for transparency</li>
                <li>• Your personal data is encrypted and stored securely</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Manual Wallet Address Entry (Fallback) */}
        {!isConnected && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alternative: Manual Entry</h3>
            <p className="text-gray-600 mb-4">
              If you cannot connect MetaMask, you can manually enter your wallet address:
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={selectedWalletAddress}
                  onChange={(e) => setSelectedWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>
              
              <button
                onClick={checkEligibility}
                disabled={!selectedWalletAddress || isCheckingEligibility}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Check Eligibility
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={!selectedWalletAddress || (eligibilityStatus && !eligibilityStatus.isEligible)}
          className={`px-6 py-3 rounded-lg text-white transition-colors flex items-center gap-2 ${
            selectedWalletAddress && (!eligibilityStatus || eligibilityStatus.isEligible)
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default BlockchainInfoStep;
