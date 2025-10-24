import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Vote, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Clock, 
  Shield,
  Eye,
  EyeOff,
  FileText,
  Camera,
  Lock,
  ExternalLink,
  RefreshCw,
  Info,
  Globe,
  Contrast,
  Volume2,
  VolumeX,
  Copy
} from 'lucide-react';
import VoterDashboardLayout from './VoteDashboardLayout';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';
import { useGlobalUI } from '../../components/common';
import { electionsAPI } from '../../services/api/api';
import { blockchainVotingService } from '../../services/blockchain/votingService';

const VoterBallot = () => {
  const { user } = useAuth();
  const { selectedAccount, isConnected } = useMetaMaskContext();
  const { showLoader, hideLoader, showToast } = useGlobalUI();

  // State management
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selections, setSelections] = useState({});
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Election, 2: Vote, 3: Review, 4: Confirm
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [votingSteps, setVotingSteps] = useState({
    walletConnected: false,
    eligibilityChecked: false,
    votedStatusChecked: false,
    ballotLoaded: false
  });
  const [voteReceipt, setVoteReceipt] = useState(null);

  // Accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    language: 'en',
    highContrast: false,
    textToSpeech: false,
    fontSize: 'medium'
  });

  // Load elections data
  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoader('Loading elections...');

      const response = await electionsAPI.list();
      const electionsData = response.data || response;
      
      console.log('Elections API Response:', response);
      console.log('Elections Data:', electionsData);

      // Filter only active elections
      const now = new Date();
      const activeElections = electionsData.filter(election => {
        const startDate = new Date(election.startsAt || election.startDate);
        const endDate = new Date(election.endsAt || election.endDate);
        return now >= startDate && now <= endDate;
      });

      console.log('Active Elections:', activeElections);
      setElections(activeElections);
    } catch (error) {
      console.error('Error loading elections:', error);
      setError(`Failed to load elections: ${error.message}`);
      showToast(`Failed to load elections: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // Load candidates for selected election using blockchain
  const loadCandidates = async (electionId) => {
    try {
      showLoader('Loading ballot from blockchain...');
      
      // Step 4: Load Ballot from smart contract
      const ballotResult = await blockchainVotingService.loadBallot(electionId);
      
      if (ballotResult.success) {
        setCandidates(ballotResult.candidates);
        setVotingSteps(prev => ({ ...prev, ballotLoaded: true }));
        showToast('Ballot loaded from blockchain', 'success');
      } else {
        throw new Error(ballotResult.error || 'Failed to load ballot from blockchain');
      }
    } catch (error) {
      setError('Failed to load candidates from blockchain');
      showToast('Failed to load candidates from blockchain', 'error');
    } finally {
      hideLoader();
    }
  };

  // Handle election selection with blockchain validation
  const handleElectionSelect = async (election) => {
    try {
      setSelectedElection(election);
      setError(null);
      
      // Reset voting steps
      setVotingSteps({
        walletConnected: false,
        eligibilityChecked: false,
        votedStatusChecked: false,
        ballotLoaded: false
      });

      // Step 1: Connect Wallet
      showLoader('Connecting wallet...');
      const walletResult = await blockchainVotingService.connectWallet();
      if (!walletResult.success) {
        throw new Error('Failed to connect wallet');
      }
      setVotingSteps(prev => ({ ...prev, walletConnected: true }));

      // Step 2: Identity Check (KYC)
      showLoader('Checking voter eligibility...');
      const eligibility = await blockchainVotingService.checkVoterEligibility(walletResult.walletAddress);
      if (!eligibility.success || !eligibility.isEligible) {
        throw new Error('You are not eligible to vote in this election');
      }
      setVotingSteps(prev => ({ ...prev, eligibilityChecked: true }));

      // Step 3: Voted Status Check
      showLoader('Checking if you have already voted...');
      const votedStatus = await blockchainVotingService.checkVotedStatus(election._id, walletResult.walletAddress);
      if (!votedStatus.success || votedStatus.hasVoted) {
        throw new Error('You have already voted in this election');
      }
      setVotingSteps(prev => ({ ...prev, votedStatusChecked: true }));

      // Step 4: Load Ballot
      await loadCandidates(election._id);
      setCurrentStep(2);
      
    } catch (error) {
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      hideLoader();
    }
  };

  // Handle candidate selection
  const handleCandidateSelect = (seat, candidateId) => {
    setSelections(prev => ({
      ...prev,
      [seat]: candidateId
    }));
  };

  // Handle abstain selection
  const handleAbstain = (seat) => {
    setSelections(prev => ({
      ...prev,
      [seat]: 'abstain'
    }));
  };

  // Check if all seats have selections
  const isAllSeatsSelected = () => {
    if (!selectedElection) return false;
    const requiredSeats = selectedElection.seats || [];
    return requiredSeats.every(seat => selections[seat]);
  };

  // Handle review step
  const handleReview = () => {
    if (isAllSeatsSelected()) {
      setCurrentStep(3);
    } else {
      showToast('Please make selections for all positions', 'error');
    }
  };

  // Handle vote submission using blockchain
  const handleSubmitVote = async () => {
    try {
      setVotingInProgress(true);
      showLoader('Casting your vote on blockchain...');

      // Get the first selected candidate (for single-seat elections)
      const firstSelection = Object.values(selections).find(selection => selection !== 'abstain');
      if (!firstSelection) {
        throw new Error('Please select a candidate to vote for');
      }

      // Steps 5-10: Complete blockchain voting flow
      const voteResult = await blockchainVotingService.completeVotingFlow(
        selectedElection._id, 
        firstSelection
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
        setCurrentStep(4);
      } else {
        throw new Error(voteResult.error || 'Failed to cast vote on blockchain');
      }
    } catch (error) {
      setError(error.message || 'Failed to cast vote on blockchain');
      showToast(error.message, 'error');
    } finally {
      setVotingInProgress(false);
      hideLoader();
    }
  };

  // Reset ballot
  const resetBallot = () => {
    setSelectedElection(null);
    setCandidates([]);
    setSelections({});
    setCurrentStep(1);
    setError(null);
    setVotingSteps({
      walletConnected: false,
      eligibilityChecked: false,
      votedStatusChecked: false,
      ballotLoaded: false
    });
    setVoteReceipt(null);
  };

  // Get candidate by ID
  const getCandidateById = (candidateId) => {
    return candidates.find(c => c.id === candidateId);
  };

  // Get candidates by seat
  const getCandidatesBySeat = (seat) => {
    return candidates.filter(c => c.seat === seat);
  };

  // Get unique seats
  const getUniqueSeats = () => {
    return [...new Set(candidates.map(c => c.seat))];
  };

  if (loading) {
    return (
      <VoterDashboardLayout currentTab="ballot">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading ballot...</p>
          </div>
        </div>
      </VoterDashboardLayout>
    );
  }

  return (
    <VoterDashboardLayout currentTab="ballot">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Cast Your Vote</h2>
              <p className="text-green-100">
                {currentStep === 1 && 'Select an election to vote in'}
                {currentStep === 2 && 'Make your selections for each position'}
                {currentStep === 3 && 'Review your selections before submitting'}
                {currentStep === 4 && 'Your vote has been submitted successfully'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Vote className="w-8 h-8 text-green-300" />
            </div>
          </div>
        </div>

        {/* Accessibility Options */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Accessibility Options
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <select
                value={accessibilitySettings.language}
                onChange={(e) => setAccessibilitySettings(prev => ({ ...prev, language: e.target.value }))}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            
            <button
              onClick={() => setAccessibilitySettings(prev => ({ ...prev, highContrast: !prev.highContrast }))}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                accessibilitySettings.highContrast 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Contrast className="w-4 h-4" />
              High Contrast
            </button>
            
            <button
              onClick={() => setAccessibilitySettings(prev => ({ ...prev, textToSpeech: !prev.textToSpeech }))}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                accessibilitySettings.textToSpeech 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {accessibilitySettings.textToSpeech ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Text to Speech
            </button>
            
            <select
              value={accessibilitySettings.fontSize}
              onChange={(e) => setAccessibilitySettings(prev => ({ ...prev, fontSize: e.target.value }))}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        {/* Step 1: Select Election */}
        {currentStep === 1 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Vote className="w-5 h-5 text-blue-400" />
              Select Election
            </h3>
            
            {elections.length === 0 ? (
              <div className="text-center py-12">
                <Vote className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Active Elections</h3>
                <p className="text-gray-500">
                  There are currently no active elections available for voting.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {elections.map((election) => (
                  <motion.div
                    key={election._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => handleElectionSelect(election)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-2">{election.title}</h4>
                        <p className="text-gray-300 text-sm mb-2">{election.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Ends: {new Date(election.endsAt || election.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{election.candidates?.length || 0} candidates</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                          <Vote className="w-4 h-4" />
                          Vote Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Vote */}
        {currentStep === 2 && selectedElection && (
          <div className="space-y-6">
            {/* Voting Progress Indicator */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Blockchain Voting Progress
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-3 rounded-lg border ${votingSteps.walletConnected ? 'bg-green-600/20 border-green-500' : 'bg-gray-700 border-gray-600'}`}>
                  <div className="flex items-center gap-2">
                    {votingSteps.walletConnected ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm text-white">Wallet Connected</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${votingSteps.eligibilityChecked ? 'bg-green-600/20 border-green-500' : 'bg-gray-700 border-gray-600'}`}>
                  <div className="flex items-center gap-2">
                    {votingSteps.eligibilityChecked ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm text-white">Eligibility Verified</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${votingSteps.votedStatusChecked ? 'bg-green-600/20 border-green-500' : 'bg-gray-700 border-gray-600'}`}>
                  <div className="flex items-center gap-2">
                    {votingSteps.votedStatusChecked ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm text-white">Vote Status Checked</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${votingSteps.ballotLoaded ? 'bg-green-600/20 border-green-500' : 'bg-gray-700 border-gray-600'}`}>
                  <div className="flex items-center gap-2">
                    {votingSteps.ballotLoaded ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm text-white">Ballot Loaded</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Election Info */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedElection.title}</h3>
                  <p className="text-gray-400 text-sm">{selectedElection.description}</p>
                </div>
                <button
                  onClick={resetBallot}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Change Election
                </button>
              </div>
            </div>

            {/* Ballot */}
            <div className="space-y-6">
              {getUniqueSeats().map((seat) => (
                <div key={seat} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    {seat}
                  </h4>
                  
                  <div className="space-y-3">
                    {getCandidatesBySeat(seat).map((candidate) => (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selections[seat] === candidate.id
                            ? 'bg-blue-600/20 border-blue-500'
                            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => handleCandidateSelect(seat, candidate.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selections[seat] === candidate.id
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-400'
                          }`}>
                            {selections[seat] === candidate.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h5 className="text-white font-medium">{candidate.name}</h5>
                            <p className="text-gray-400 text-sm">{candidate.party || 'Independent'}</p>
                            {candidate.bio && (
                              <p className="text-gray-300 text-sm mt-1">{candidate.bio}</p>
                            )}
                          </div>
                          
                          {selections[seat] === candidate.id && (
                            <CheckCircle className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Abstain Option */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selections[seat] === 'abstain'
                          ? 'bg-yellow-600/20 border-yellow-500'
                          : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleAbstain(seat)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selections[seat] === 'abstain'
                            ? 'bg-yellow-600 border-yellow-600'
                            : 'border-gray-400'
                        }`}>
                          {selections[seat] === 'abstain' && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h5 className="text-white font-medium">Abstain</h5>
                          <p className="text-gray-400 text-sm">I choose not to vote for this position</p>
                        </div>
                        
                        {selections[seat] === 'abstain' && (
                          <CheckCircle className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={resetBallot}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Elections
              </button>
              
              <button
                onClick={handleReview}
                disabled={!isAllSeatsSelected()}
                className={`px-6 py-3 rounded-lg text-white transition-colors flex items-center gap-2 ${
                  isAllSeatsSelected()
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <Eye className="w-4 h-4" />
                Review Selections
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && selectedElection && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Review Your Selections
              </h3>
              
              <div className="space-y-4">
                {Object.entries(selections).map(([seat, selection]) => (
                  <div key={seat} className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">{seat}</h4>
                    {selection === 'abstain' ? (
                      <p className="text-yellow-400">Abstain</p>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {getCandidateById(selection)?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {getCandidateById(selection)?.name || 'Unknown'}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {getCandidateById(selection)?.party || 'Independent'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium mb-1">Important Security Notice</p>
                  <p>
                    Once you submit your vote, it cannot be changed. Your vote will be encrypted and recorded on the blockchain for transparency and security.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Voting
              </button>
              
              <button
                onClick={handleSubmitVote}
                disabled={votingInProgress || !isConnected}
                className={`px-6 py-3 rounded-lg text-white transition-colors flex items-center gap-2 ${
                  votingInProgress || !isConnected
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {votingInProgress ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Submit Vote
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && voteReceipt && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Vote Successfully Cast on Blockchain!</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Your vote has been recorded and encrypted on the blockchain. The transaction is immutable and verifiable.
              </p>
            </div>

            {/* Transaction Receipt */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Blockchain Transaction Receipt
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Transaction Hash</h4>
                    <div className="flex items-center gap-2">
                      <code className="text-green-400 text-sm font-mono break-all">
                        {voteReceipt.transactionHash}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(voteReceipt.transactionHash);
                          showToast('Transaction hash copied to clipboard', 'success');
                        }}
                        className="p-1 hover:bg-gray-600 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Block Number</h4>
                    <p className="text-blue-400 text-sm font-mono">{voteReceipt.blockNumber}</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Gas Used</h4>
                    <p className="text-yellow-400 text-sm font-mono">{voteReceipt.gasUsed}</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Wallet Address</h4>
                    <p className="text-purple-400 text-sm font-mono">{voteReceipt.walletAddress}</p>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Election Details</h4>
                  <p className="text-gray-300 text-sm">
                    <strong>Election:</strong> {voteReceipt.election?.title || selectedElection?.title}<br/>
                    <strong>Candidate:</strong> {getCandidateById(Object.values(selections).find(s => s !== 'abstain'))?.name || 'Unknown'}<br/>
                    <strong>Timestamp:</strong> {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-200">
                  <p className="font-medium mb-1">Blockchain Security Confirmed</p>
                  <p>
                    Your vote is now permanently recorded on the blockchain. The transaction hash above serves as your cryptographic receipt. 
                    You can use this hash to verify your vote at any time.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <button
                onClick={resetBallot}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vote in Another Election
              </button>
              
              <p className="text-gray-500 text-sm">
                Save your transaction hash for future verification
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <h4 className="text-red-200 font-medium">Voting Error</h4>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VoterDashboardLayout>
  );
};

export default VoterBallot;
