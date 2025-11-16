import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, AlertTriangle, User, Copy, ExternalLink } from 'lucide-react';
import { useVotingContext } from '../../contexts/voters/VotingContext';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';
import { useGlobalUI } from '../../components/common';
import blockchainVotingService from '../../services/blockchain/votingService';

const VotingModal = ({ isOpen, onClose, selectedCandidate, candidates = [], elections = [], onVoteSuccess }) => {
  const { castVote, loading: votingLoading, error: votingError, setError } = useVotingContext();
  const { 
    selectedAccount, 
    connectMetaMask, 
    isConnected,
    loading: metaMaskLoading 
  } = useMetaMaskContext();
  const { showSuccess, showError, showToast } = useGlobalUI();
  
  const [voteData, setVoteData] = useState({
    electionId: '',
    candidateId: '',
    voterId: '',
    voteWeight: 1
  });
  const [votingSteps, setVotingSteps] = useState({
    walletConnected: false,
    eligibilityChecked: false,
    votedStatusChecked: false,
    ballotLoaded: false
  });
  const [voteReceipt, setVoteReceipt] = useState(null);
  

  // Initialize vote data when candidate changes
  useEffect(() => {
    if (selectedCandidate) {
      setVoteData({
        electionId: selectedCandidate.electionId,
        candidateId: selectedCandidate.id,
        voterId: selectedAccount || '',
        voteWeight: 1 // Always 1 vote per candidate
      });
    }
  }, [selectedCandidate, selectedAccount]);



  const handleVote = async (e) => {
    e.preventDefault();

    try {
      // Steps 1-10: Complete blockchain voting flow
      const voteResult = await blockchainVotingService.completeVotingFlow(
        voteData.electionId, 
        voteData.candidateId
      );
      
      if (voteResult.success) {
        setVoteReceipt({
          transactionHash: voteResult.transactionHash,
          blockNumber: voteResult.blockNumber,
          gasUsed: voteResult.gasUsed,
          election: voteResult.election,
          candidates: voteResult.candidates,
          walletAddress: voteResult.walletAddress
        });
        
        showToast('Vote successfully cast on blockchain!', 'success');
        onVoteSuccess && onVoteSuccess(); // Call the callback to refresh data
        onClose();
      } else {
        throw new Error(voteResult.error || 'Failed to cast vote on blockchain');
      }
    } catch (error) {
      showToast(error.message || 'Failed to cast vote on blockchain', 'error');
    }
  };


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Address copied to clipboard', 'success');
  };


  if (!isOpen || !selectedCandidate) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
          role="dialog"
          aria-labelledby="voting-modal-title"
          aria-describedby="voting-modal-description"
        >
          {/* Vote Confirmation */}
          <div className="flex items-center gap-2 mb-4">
            <Vote className="w-5 h-5 text-blue-300" />
            <h3 id="voting-modal-title" className="text-lg font-semibold text-white">
              Cast Your Vote
            </h3>
          </div>

          <div id="voting-modal-description" className="mb-4 p-4 bg-gray-700 rounded-lg">
            <h4 className="text-white font-medium mb-2">{selectedCandidate.name}</h4>
            <p className="text-gray-400 text-sm">{selectedCandidate.party || 'Independent'}</p>
            <p className="text-blue-400 text-sm">{selectedCandidate.seat}</p>
            <p className="text-gray-500 text-xs mt-1">{selectedCandidate.electionTitle}</p>
            {isConnected && selectedAccount && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <p className="text-blue-300 text-xs">Voter: {selectedAccount.slice(0, 6)}...{selectedAccount.slice(-4)}</p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Voter Account
            </label>
            
            {!isConnected ? (
              <div className="space-y-3">
                <button
                  onClick={connectMetaMask}
                  disabled={metaMaskLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {metaMaskLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Connect MetaMask
                    </>
                  )}
                </button>
                <p className="text-gray-400 text-xs text-center">
                  Connect your MetaMask wallet to vote
                </p>
              </div>
            ) : (
              <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2 text-blue-300">
                  <ExternalLink className="w-4 h-4" />
                  <span className="font-medium">MetaMask Connected</span>
                </div>
                <p className="text-gray-300 text-sm mt-1">
                  Account: {selectedAccount ? `${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}` : 'Unknown'}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  You can vote for one candidate per seat
                </p>
              </div>
            )}
          </div>

          <div className="mb-4 p-3 bg-gray-800/60 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Voting Restriction</span>
            </div>
            <p className="text-gray-300 text-xs mt-1">
              You can only vote for one candidate per seat. Vote weight is always 1.
            </p>
          </div>

          {votingError && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {votingError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleVote}
              disabled={votingLoading || !isConnected}
              className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {votingLoading ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Voting...
                </>
              ) : (
                <>
                  <Vote className="w-4 h-4" />
                  Cast Vote
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VotingModal;
