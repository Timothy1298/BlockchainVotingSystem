import { ethers } from 'ethers';
import API from '../api/api';

/**
 * Blockchain Voting Service - Implements the 10-step voting flow
 * 
 * Phase 1: Pre-Vote Validation (Steps 1-4)
 * Phase 2: Casting the Vote (Steps 5-10)
 */

class BlockchainVotingService {
  constructor() {
    this.contractAddress = null;
    this.contract = null;
    this.provider = null;
    this.signer = null;
  }

  /**
   * Step 1: Connect Wallet
   * Voter clicks "Connect" on the DApp
   * Origin: Browser (Client JS) -> Destination: MetaMask
   * Data Location: Browser Local Storage (MetaMask stores encrypted private key)
   */
  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in MetaMask.');
      }

      // Initialize provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      return {
        success: true,
        walletAddress: accounts[0],
        accounts: accounts
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request.');
      }
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  /**
   * Step 2: Identity Check (KYC)
   * Client sends wallet address to backend for eligibility verification
   * Origin: Client JS -> Destination: Central Server/DB
   * Data Location: Central Database (DB)
   */
  async checkVoterEligibility(walletAddress) {
    try {
      const response = await API.get(`/voter-auth/check-wallet/${walletAddress}`);
      const user = response.data.data?.user || null;
      const isRegistered = response.data.data?.isRegistered || false;
      const kycStatus = user?.kycStatus || 'pending';
      
      // User is eligible if they are registered AND have verified KYC status
      const isEligible = isRegistered && (kycStatus === 'verified');
      
      console.log('Eligibility check:', {
        walletAddress,
        isRegistered,
        kycStatus,
        isEligible,
        user: user?.email
      });
      
      return {
        success: true,
        isEligible: isEligible,
        user: user,
        kycStatus: kycStatus
      };
    } catch (error) {
      console.error('Eligibility check failed:', error);
      return {
        success: false,
        isEligible: false,
        error: error.message
      };
    }
  }

  /**
   * Step 3: Voted Status Check
   * Client queries the Smart Contract to check if voter has already voted
   * Origin: Client JS (Web3) -> Destination: Ganache Node
   * Data Location: Smart Contract State (voters[wallet_address] mapping)
   */
  async checkVotedStatus(electionId, walletAddress) {
    try {
      // First, check if this election has a chainElectionId (smart contract mapping)
      const electionResponse = await API.get(`/elections/${electionId}`);
      const election = electionResponse.data.data || electionResponse.data;
      
      if (!election.chainElectionId) {
        console.log('Election not mapped to smart contract, checking database vote status instead');
        // If election is not mapped to smart contract, check database instead
        const voteResponse = await API.get(`/votes/hasVoted?electionId=${electionId}`);
        const voteData = voteResponse.data.data || voteResponse.data;
        
        return {
          success: true,
          hasVoted: voteData.hasVoted || false,
          canVote: !(voteData.hasVoted || false),
          source: 'database'
        };
      }
      
      await this.initializeContract();
      
      const hasVoted = await this.contract.hasVotedIn(election.chainElectionId, walletAddress);
      
      return {
        success: true,
        hasVoted: hasVoted,
        canVote: !hasVoted,
        source: 'blockchain'
      };
    } catch (error) {
      console.error('Voted status check failed:', error);
      
      // Fallback: try to check database if blockchain check fails
      try {
        console.log('Blockchain check failed, falling back to database check');
        const voteResponse = await API.get(`/votes/hasVoted?electionId=${electionId}`);
        const voteData = voteResponse.data.data || voteResponse.data;
        
        return {
          success: true,
          hasVoted: voteData.hasVoted || false,
          canVote: !(voteData.hasVoted || false),
          source: 'database_fallback'
        };
      } catch (fallbackError) {
        console.error('Database fallback also failed:', fallbackError);
        return {
          success: false,
          hasVoted: false,
          canVote: false,
          error: error.message
        };
      }
    }
  }

  /**
   * Step 4: Load Ballot
   * If eligible and not yet voted, load the ballot from smart contract
   * Origin: Client JS -> Destination: Smart Contract
   * Data Location: Smart Contract State (candidates and election data)
   */
  async loadBallot(electionId) {
    try {
      await this.initializeContract();
      
      // Get election details
      const election = await this.contract.getElection(electionId);
      
      // Get all candidates
      const candidates = [];
      for (let i = 1; i <= election.candidatesCount; i++) {
        const candidate = await this.contract.getCandidate(electionId, i);
        candidates.push({
          id: candidate.id.toString(),
          name: candidate.name,
          voteCount: candidate.voteCount.toString()
        });
      }

      return {
        success: true,
        election: {
          id: election.id.toString(),
          title: election.title,
          description: election.description,
          startsAt: election.startsAt.toString(),
          endsAt: election.endsAt.toString(),
          candidatesCount: election.candidatesCount.toString(),
          votingEnabled: election.votingEnabled,
          totalVotes: election.totalVotes.toString()
        },
        candidates: candidates
      };
    } catch (error) {
      console.error('Load ballot failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Step 5: Initiate Vote
   * Voter selects candidate and clicks "Submit"
   * Origin: Browser (Client JS) -> Destination: Smart Contract
   * Data Location: Smart Contract (castVote function call)
   */
  async initiateVote(electionId, candidateId) {
    try {
      await this.initializeContract();
      
      // Validate inputs
      if (!electionId || !candidateId) {
        throw new Error('Election ID and Candidate ID are required');
      }

      // Check if voter is registered for this election
      const isRegistered = await this.contract.isVoterRegistered(electionId, await this.signer.getAddress());
      if (!isRegistered) {
        throw new Error('Voter is not registered for this election');
      }

      return {
        success: true,
        readyToVote: true,
        electionId: electionId,
        candidateId: candidateId
      };
    } catch (error) {
      console.error('Vote initiation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Step 6: Sign Transaction
   * MetaMask intercepts the function call and signs it
   * Origin: MetaMask -> Destination: Ganache Node
   * Data Location: MetaMask (Private Key signs transaction packet)
   */
  /**
   * Step 7: Transaction Broadcast
   * MetaMask sends signed transaction to network
   * Origin: MetaMask -> Destination: Ganache CLI (Local Node)
   * Data Location: Ganache Mempool (pending transactions)
   */
  /**
   * Step 8: Block Creation
   * Ganache validates and creates new block
   * Origin: Ganache Node -> Destination: The Blockchain (Ledger)
   * Data Location: Block Data (cryptographically linked blocks)
   */
  /**
   * Step 9: State Update
   * Smart Contract executes internal logic
   * Origin: Smart Contract -> Destination: Smart Contract State
   * Data Location: Smart Contract State (vote counts and voter status)
   */
  /**
   * Step 10: Receipt Generation
   * Smart Contract returns transaction result
   * Origin: Ganache Node -> Destination: Client JS
   * Data Location: Transaction Hash (cryptographic receipt)
   */
  async castVote(electionId, candidateId) {
    try {
      await this.initializeContract();
      
      // Steps 5-10: Complete voting process
      console.log('Step 5: Initiating vote...');
      const initiation = await this.initiateVote(electionId, candidateId);
      if (!initiation.success) {
        throw new Error(initiation.error);
      }

      console.log('Step 6-7: Signing and broadcasting transaction...');
      // MetaMask will handle signing and broadcasting (Steps 6-7)
      const tx = await this.contract.castVote(electionId, candidateId);
      
      console.log('Step 8-9: Waiting for block confirmation and state update...');
      // Wait for transaction to be mined (Steps 8-9)
      const receipt = await tx.wait();
      
      console.log('Step 10: Receipt generated');
      // Step 10: Return transaction receipt
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        receipt: receipt,
        message: 'Vote cast successfully on blockchain'
      };
    } catch (error) {
      console.error('Vote casting failed:', error);
      
      // Handle specific contract errors
      if (error.message.includes('Already voted')) {
        throw new Error('You have already voted in this election');
      } else if (error.message.includes('Voter not registered')) {
        throw new Error('You are not registered to vote in this election');
      } else if (error.message.includes('Voting is not enabled')) {
        throw new Error('Voting is not currently enabled for this election');
      } else if (error.message.includes('Election has not started')) {
        throw new Error('This election has not started yet');
      } else if (error.message.includes('Election has ended')) {
        throw new Error('This election has ended');
      } else if (error.message.includes('Invalid candidate')) {
        throw new Error('Invalid candidate selected');
      }
      
      throw new Error(`Vote casting failed: ${error.message}`);
    }
  }

  /**
   * Initialize contract connection
   */
  async initializeContract() {
    if (!this.provider || !this.signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    if (!this.contractAddress) {
      // Get contract address from server
      try {
        const response = await API.get('/config');
        this.contractAddress = response.data.data?.votingContractAddress || 
                              import.meta.env.VITE_VOTING_CONTRACT_ADDRESS;
      } catch (error) {
        this.contractAddress = import.meta.env.VITE_VOTING_CONTRACT_ADDRESS;
      }
    }

    if (!this.contractAddress) {
      throw new Error('Voting contract address not configured');
    }

    if (!this.contract) {
      // Contract ABI for SimpleVoting contract
      const abi = [
        'function castVote(uint256 _electionId, uint256 _candidateId) external',
        'function hasVotedIn(uint256 _electionId, address _voter) external view returns (bool)',
        'function isVoterRegistered(uint256 _electionId, address _voter) external view returns (bool)',
        'function getElection(uint256 _electionId) external view returns (uint256 id, string memory title, string memory description, uint256 startsAt, uint256 endsAt, uint256 candidatesCount, bool votingEnabled, uint256 totalVotes)',
        'function getCandidate(uint256 _electionId, uint256 _candidateId) external view returns (uint256 id, string memory name, uint256 voteCount)'
      ];

      this.contract = new ethers.Contract(this.contractAddress, abi, this.signer);
    }
  }

  /**
   * Complete voting flow (Steps 1-10)
   */
  async completeVotingFlow(electionId, candidateId) {
    try {
      // Step 1: Connect Wallet
      console.log('Step 1: Connecting wallet...');
      const walletResult = await this.connectWallet();
      if (!walletResult.success) {
        throw new Error('Failed to connect wallet');
      }

      const walletAddress = walletResult.walletAddress;

      // Step 2: Identity Check (KYC)
      console.log('Step 2: Checking voter eligibility...');
      const eligibility = await this.checkVoterEligibility(walletAddress);
      if (!eligibility.success || !eligibility.isEligible) {
        throw new Error('Voter is not eligible to vote');
      }

      // Step 3: Voted Status Check
      console.log('Step 3: Checking if already voted...');
      const votedStatus = await this.checkVotedStatus(electionId, walletAddress);
      if (!votedStatus.success || votedStatus.hasVoted) {
        throw new Error('Voter has already voted in this election');
      }

      // Step 4: Load Ballot
      console.log('Step 4: Loading ballot...');
      const ballot = await this.loadBallot(electionId);
      if (!ballot.success) {
        throw new Error('Failed to load ballot');
      }

      // Steps 5-10: Cast Vote
      console.log('Steps 5-10: Casting vote...');
      const voteResult = await this.castVote(electionId, candidateId);

      return {
        success: true,
        walletAddress: walletAddress,
        election: ballot.election,
        candidates: ballot.candidates,
        transactionHash: voteResult.transactionHash,
        blockNumber: voteResult.blockNumber,
        gasUsed: voteResult.gasUsed,
        receipt: voteResult.receipt,
        message: 'Vote successfully cast on blockchain'
      };
    } catch (error) {
      console.error('Complete voting flow failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current wallet address
   */
  async getCurrentWalletAddress() {
    if (!this.signer) {
      return null;
    }
    return await this.signer.getAddress();
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected() {
    return this.provider !== null && this.signer !== null;
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = null;
  }
}

// Export singleton instance
export const blockchainVotingService = new BlockchainVotingService();
export default blockchainVotingService;
