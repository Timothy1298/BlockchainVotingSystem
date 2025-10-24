import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Clock, 
  Shield,
  Copy,
  Download,
  ExternalLink,
  Search,
  BarChart3,
  Lock,
  Globe,
  RefreshCw,
  Info,
  Hash,
  Calendar,
  User,
  Vote,
  Link2,
  ExternalLinkIcon
} from 'lucide-react';
import VoterDashboardLayout from './VoteDashboardLayout';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';
import { useGlobalUI } from '../../components/common';
import { notificationsAPI } from '../../services/api/api';
import API from '../../services/api/api';

const VoterVerifiability = () => {
  const { user } = useAuth();
  const { selectedAccount, isConnected } = useMetaMaskContext();
  const { showLoader, hideLoader, showToast } = useGlobalUI();

  // State management
  const [voteHistory, setVoteHistory] = useState([]);
  const [verificationResults, setVerificationResults] = useState({});
  const [auditTrails, setAuditTrails] = useState([]);
  const [searchHash, setSearchHash] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Load voter data
  useEffect(() => {
    if (selectedAccount) {
      loadVoterData();
    }
  }, [selectedAccount]);

  const loadVoterData = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoader('Loading vote history...');

      // History from server (if available); fallback empty
      const histRes = await API.get('/votes/history').catch(()=>null);
      setVoteHistory(histRes?.data?.data || histRes?.data || []);

      // Audit trail from server (if available); fallback empty
      const auditRes = await API.get('/votes/audit').catch(()=>null);
      setAuditTrails(auditRes?.data?.data || auditRes?.data || []);

    } catch (error) {
      setError('Failed to load voter data');
      showToast('Failed to load voter data', 'error');
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // Verify vote hash
  const verifyVoteHash = async (hash) => {
    if (!hash.trim()) {
      showToast('Please enter a vote hash', 'error');
      return;
    }

    try {
      setVerifying(true);
      showLoader('Verifying vote...');
      const response = await API.get('/votes/verify-receipt', { params: { hash } });
      const data = response?.data?.data || response?.data || {};
      setVerificationStatus(data);
      
      if (data.isValid) {
        showToast('Vote verified successfully!', 'success');
      } else {
        showToast('Vote not found or invalid', 'error');
      }
    } catch (error) {
      setVerificationStatus({ isValid: false, error: error.message });
      showToast('Verification failed', 'error');
    } finally {
      setVerifying(false);
      hideLoader();
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  // Download receipt
  const downloadReceipt = (vote) => {
    const receiptData = {
      voterId: selectedAccount,
      electionId: vote.electionId,
      voteHash: vote.voteHash,
      timestamp: vote.timestamp,
      electionTitle: vote.electionTitle
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-receipt-${vote.voteHash.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Receipt downloaded', 'success');
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'invalid': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <VoterDashboardLayout currentTab="verifiability">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading verification data...</p>
          </div>
        </div>
      </VoterDashboardLayout>
    );
  }

  return (
    <VoterDashboardLayout currentTab="verifiability">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">My Vote & Audit</h2>
              <p className="text-purple-100">
                Verify your votes and view your participation history
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-8 h-8 text-purple-300" />
            </div>
          </div>
        </div>

        {/* Vote Status Tracker */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Vote Status Tracker
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  user ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <div>
                  <p className="text-sm text-gray-400">Registration</p>
                  <p className="text-white font-medium">
                    {user ? 'Registered' : 'Not Registered'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  voteHistory.length > 0 ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <div>
                  <p className="text-sm text-gray-400">Vote Cast</p>
                  <p className="text-white font-medium">
                    {voteHistory.length > 0 ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  voteHistory.length > 0 ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <div>
                  <p className="text-sm text-gray-400">Vote Counted</p>
                  <p className="text-white font-medium">
                    {voteHistory.length > 0 ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Verifiability Tool */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-green-400" />
            Vote Verification Tool
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter Vote Hash/Receipt
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchHash}
                  onChange={(e) => setSearchHash(e.target.value)}
                  placeholder="Enter your vote hash or receipt..."
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => verifyVoteHash(searchHash)}
                  disabled={verifying || !searchHash.trim()}
                  className={`px-6 py-3 rounded-lg text-white transition-colors flex items-center gap-2 ${
                    verifying || !searchHash.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {verifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Verify
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Verification Result */}
            {verificationStatus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  verificationStatus.isValid
                    ? 'bg-green-600/20 border-green-600/50'
                    : 'bg-red-600/20 border-red-600/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {verificationStatus.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      verificationStatus.isValid ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {verificationStatus.isValid ? 'Vote Verified' : 'Verification Failed'}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      verificationStatus.isValid ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {verificationStatus.isValid
                        ? 'Your vote has been found and recorded on the blockchain.'
                        : verificationStatus.error || 'The vote hash could not be verified.'
                      }
                    </p>
                    {verificationStatus.isValid && verificationStatus.details && (
                      <div className="mt-2 text-sm text-green-300">
                        <p>Election: {verificationStatus.details.electionTitle}</p>
                        <p>Timestamp: {formatTimestamp(verificationStatus.details.timestamp)}</p>
                        <p>Block: {verificationStatus.details.blockNumber}</p>
                        {verificationStatus.details.transactionHash && (
                          <div className="mt-2 flex items-center gap-2">
                            <span>Transaction Hash:</span>
                            <code className="bg-gray-800 px-2 py-1 rounded text-xs font-mono">
                              {verificationStatus.details.transactionHash.substring(0, 20)}...
                            </code>
                            <button
                              onClick={() => window.open(`https://etherscan.io/tx/${verificationStatus.details.transactionHash}`, '_blank')}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              title="View on Etherscan"
                            >
                              <ExternalLinkIcon className="w-3 h-3" />
                              View
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Vote History */}
        {voteHistory.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Your Vote History
            </h3>
            
            <div className="space-y-4">
              {voteHistory.map((vote) => (
                <motion.div
                  key={vote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">{vote.electionTitle}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(vote.status)}`}>
                          <CheckCircle className="w-3 h-3" />
                          {vote.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        Voted on: {formatTimestamp(vote.timestamp)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          <span>Hash: {vote.voteHash.slice(0, 16)}...</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Lock className="w-4 h-4" />
                          <span>Encrypted & Recorded</span>
                        </div>
                        {vote.transactionHash && (
                          <div className="flex items-center gap-1">
                            <Link2 className="w-4 h-4" />
                            <button
                              onClick={() => window.open(`https://etherscan.io/tx/${vote.transactionHash}`, '_blank')}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              title="View transaction on Etherscan"
                            >
                              <ExternalLinkIcon className="w-3 h-3" />
                              View TX
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => copyToClipboard(vote.voteHash)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                        title="Copy hash"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadReceipt(vote)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                        title="Download receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => verifyVoteHash(vote.voteHash)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Election Final Tally Audit */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            Election Final Tally Audit
          </h3>
          
          <div className="space-y-4">
            {voteHistory.map((vote) => (
              <div key={vote.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-2">{vote.electionTitle}</h4>
                    <p className="text-gray-400 text-sm mb-2">
                      Final results and blockchain verification
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Ended: {formatTimestamp(vote.electionEndDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Vote className="w-4 h-4" />
                        <span>{vote.totalVotes || 0} total votes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      View Results
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Blockchain
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voter Participation Log */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Participation Log
          </h3>
          
          <div className="space-y-3">
            {auditTrails.map((log) => (
              <div key={log.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'login' ? 'bg-green-400' :
                      log.type === 'vote' ? 'bg-blue-400' :
                      log.type === 'verification' ? 'bg-purple-400' :
                      'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="text-white text-sm font-medium">{log.action}</p>
                      <p className="text-gray-400 text-xs">{log.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">{formatTimestamp(log.timestamp)}</p>
                    <p className="text-gray-500 text-xs">{log.ipAddress}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Information */}
        <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">Vote Verification & Privacy</p>
              <ul className="space-y-1 text-xs">
                <li>• Your vote hash confirms your vote was recorded without revealing your choices</li>
                <li>• All votes are encrypted and stored on the blockchain for transparency</li>
                <li>• You can verify your vote anytime using the hash provided</li>
                <li>• Your identity is protected while ensuring vote integrity</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <h4 className="text-red-200 font-medium">Error Loading Data</h4>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <button
                  onClick={loadVoterData}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VoterDashboardLayout>
  );
};

export default VoterVerifiability;
