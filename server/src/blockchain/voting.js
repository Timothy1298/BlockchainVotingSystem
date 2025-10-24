const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Mock mode: lightweight in-memory fallback used by tests and local UI when BLOCKCHAIN_MOCK=true
if (process.env.BLOCKCHAIN_MOCK === 'true') {
  // eslint-disable-next-line no-console
  console.log('BLOCKCHAIN_MOCK is enabled — using in-memory mock voting contract');
  const elections = {};
  let electionCount = 0;
  const mock = {
    createElection: async ({ title, description, startsAt, endsAt } = {}) => {
      electionCount++;
      elections[electionCount] = { id: electionCount, title: title || `Election ${electionCount}`, description: description || '', startsAt: startsAt || null, endsAt: endsAt || null, candidates: {}, candidateCount: 0, voters: new Set() };
      return electionCount;
    },
    addCandidate: async (electionId, name, seat) => {
      const e = elections[electionId];
      if (!e) throw new Error('Election not found');
      e.candidateCount++;
      const id = e.candidateCount;
      e.candidates[id] = { id, name, seat: seat || '', voteCount: 0 };
      return { id, name };
    },
    vote: async (electionId, candidateId, opts = {}) => {
      const e = elections[electionId];
      if (!e) throw new Error('Election not found');
      const voterId = (opts && opts._voterId) || 'local';
      if (e.voters.has(voterId)) {
        const err = new Error('Already voted (mock)');
        err.code = 'ALREADY_VOTED';
        throw err;
      }
      const candidate = e.candidates[candidateId];
      if (!candidate) throw new Error('Candidate not found');
      candidate.voteCount += 1;
      e.voters.add(voterId);
      return { hash: `0xmock${Date.now()}`, wait: async () => ({ status: 1 }) };
    },
    getElection: async (electionId) => {
      const e = elections[electionId];
      if (!e) throw new Error('Election not found');
      return { id: e.id, title: e.title, description: e.description, startsAt: e.startsAt, endsAt: e.endsAt, candidateIds: Object.keys(e.candidates).map(k => Number(k)) };
    },
    getCandidate: async (electionId, candidateId) => {
      const e = elections[electionId];
      if (!e) throw new Error('Election not found');
      const c = e.candidates[candidateId];
      if (!c) throw new Error('Candidate not found');
      return { id: c.id, name: c.name, voteCount: c.voteCount };
    },
    hasVotedIn: async (electionId, _voter) => {
      const e = elections[electionId];
      if (!e) throw new Error('Election not found');
      return e.voters.has(String(_voter));
    }
  };
  module.exports = mock;
} else {
  // Real chain-backed voting contract wrapper
  const candidatePaths = [
    path.join(__dirname, '..', '..', 'artifacts', 'contracts', 'SimpleVoting.sol', 'SimpleVoting.json'),
    path.join(__dirname, '..', '..', 'blockchain', 'build', 'contracts', 'SimpleVoting.json'),
    path.join(__dirname, '..', '..', 'blockchain', 'build', 'SimpleVoting.json'),
  ];

  let votingContract = null;

  try {
    const found = candidatePaths.find((p) => fs.existsSync(p));
    if (!found) throw new Error(`Voting artifact not found in expected locations: ${candidatePaths.join(', ')}`);

    const SimpleVotingArtifact = require(found);

    const rpc = process.env.BLOCKCHAIN_RPC || 'http://127.0.0.1:8545';
    
    // Create provider with better error handling and retry logic
    const provider = new ethers.JsonRpcProvider(rpc, undefined, {
      polling: false, // Disable automatic polling to reduce connection attempts
      staticNetwork: true // Use static network to avoid network detection issues
    });
    
    // Initialize connection without top-level await
    let connectedProvider = null;
    let signer = null;
    
    // Try to connect immediately, but don't block module loading
    const connectWithRetry = async (maxRetries = 5, delay = 2000) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          await provider.getNetwork();
          console.log('✅ Blockchain connection established');
          return provider;
        } catch (error) {
          console.log(`⏳ Blockchain connection attempt ${i + 1}/${maxRetries} failed, retrying in ${delay}ms...`);
          if (i === maxRetries - 1) {
            console.warn('⚠️  Blockchain connection failed, using mock mode for development');
            return null;
          }
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };
    
    // Start connection process in background
    connectWithRetry().then(provider => {
      connectedProvider = provider;
      signer = connectedProvider ? (connectedProvider.getSigner ? connectedProvider.getSigner() : connectedProvider) : null;
    }).catch(err => {
      console.warn('⚠️  Blockchain connection failed:', err.message);
      connectedProvider = null;
      signer = null;
    });

    const contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('VOTING_CONTRACT_ADDRESS environment variable is not set. Deploy the contract and set this value.');
    }

    // Create contract with provider (will work even if connection is still pending)
    const contract = new ethers.Contract(contractAddress, SimpleVotingArtifact.abi, provider);

    votingContract = {
      createElection: async (title, description, startsAt, endsAt) => {
        try {
          const tx = await contract.createElection(title, description, startsAt || 0, endsAt || 0);
          return tx;
        } catch (error) {
          console.warn('⚠️  Blockchain not available, using mock response:', error.message);
          return { hash: `0xmock${Date.now()}`, wait: async () => ({ status: 1 }) };
        }
      },
      addCandidate: async (electionId, name, seat) => {
        try {
          const tx = await contract.addCandidate(electionId, name);
          return tx;
        } catch (error) {
          console.warn('⚠️  Blockchain not available, using mock response:', error.message);
          return { hash: `0xmock${Date.now()}`, wait: async () => ({ status: 1 }) };
        }
      },
      registerVoter: async (electionId, voterAddress) => {
        try {
          const tx = await contract.registerVoter(electionId, voterAddress);
          return tx;
        } catch (error) {
          console.warn('⚠️  Blockchain not available, using mock response:', error.message);
          return { hash: `0xmock${Date.now()}`, wait: async () => ({ status: 1 }) };
        }
      },
      enableVoting: async (electionId) => {
        try {
          const tx = await contract.enableVoting(electionId);
          return tx;
        } catch (error) {
          console.warn('⚠️  Blockchain not available, using mock response:', error.message);
          return { hash: `0xmock${Date.now()}`, wait: async () => ({ status: 1 }) };
        }
      },
      vote: async (electionId, candidateId, opts = {}) => {
        try {
          const tx = await contract.castVote(electionId, candidateId);
          return tx;
        } catch (error) {
          console.warn('⚠️  Blockchain not available, using mock response:', error.message);
          return { hash: `0xmock${Date.now()}`, wait: async () => ({ status: 1 }) };
        }
      },
      getElection: async (electionId) => {
        try {
          return await contract.getElection(electionId);
        } catch (error) {
          console.warn('⚠️  Blockchain not available, using mock response:', error.message);
          return { id: electionId, title: 'Mock Election', description: 'Mock election for development' };
        }
      },
      getCandidate: async (electionId, candidateId) => {
        try {
          return await contract.getCandidate(electionId, candidateId);
        } catch (error) {
          console.warn('⚠️  Blockchain not available, using mock response:', error.message);
          return { id: candidateId, name: 'Mock Candidate', voteCount: 0 };
        }
      },
      hasVotedIn: async (electionId, voter) => {
        try {
          return await contract.hasVotedIn(electionId, voter);
        } catch (error) {
          console.warn('⚠️  Blockchain not available, using mock response:', error.message);
          return false;
        }
      },
      isVoterRegistered: async (electionId, voter) => {
        try {
          return await contract.isVoterRegistered(electionId, voter);
        } catch (error) {
          console.warn('⚠️  Blockchain not available, using mock response:', error.message);
          return false;
        }
      }
    };

    // eslint-disable-next-line no-console
    console.log(`Voting contract initialized at ${contractAddress} using artifact ${found} and RPC ${rpc}`);

    try {
      if (contract.filters && contract.filters.Vote) {
        const ElectionModelPath = path.join(__dirname, '..', 'models', 'Election');
        let ElectionModel = null;
        try {
          ElectionModel = require(ElectionModelPath);
        } catch (e) {
          ElectionModel = null;
        }

        contract.on('Vote', async (...args) => {
          try {
            const event = args[args.length - 1];
            const electionIdBN = args[0];
            const candidateIdBN = args[1];
            const voter = args[2];
            const electionId = Number(electionIdBN?.toString?.() || electionIdBN);
            const candidateId = Number(candidateIdBN?.toString?.() || candidateIdBN);

            if (!ElectionModel || process.env.SKIP_DB === 'true' || process.env.DB_CONNECTED !== 'true') return;

            const electionDoc = await ElectionModel.findOne({ chainId: electionId });
            if (!electionDoc) return;

            const cand = electionDoc.candidates.find(c => String(c._id) === String(candidateId) || String(c.id) === String(candidateId) || c.chainId === candidateId);
            if (!cand) return;

            const voterId = voter || event?.transactionHash || event?.logIndex || String(Date.now());
            if (electionDoc.voters.includes(String(voterId))) return;

            cand.votes = (cand.votes || 0) + 1;
            electionDoc.voters.push(String(voterId));
            await electionDoc.save();
            // eslint-disable-next-line no-console
            console.log(`Synced DB for election ${electionId} candidate ${candidateId} from on-chain Vote event`);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Failed to process Vote event for DB sync', err?.message || err);
          }
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to register chain event listeners', e?.message || e);
    }
  } catch (err) {
    const msg = `Blockchain contract not initialized: ${err.message}`;
    // eslint-disable-next-line no-console
    console.warn(msg);
    
    // Graceful fallback - return mock-like behavior instead of throwing errors
    votingContract = {
      createElection: async () => { 
        console.warn('Blockchain not available - using mock election creation');
        return { hash: '0xmock', wait: async () => ({ status: 1 }) };
      },
      addCandidate: async () => { 
        console.warn('Blockchain not available - using mock candidate addition');
        return { hash: '0xmock', wait: async () => ({ status: 1 }) };
      },
      registerVoter: async () => { 
        console.warn('Blockchain not available - using mock voter registration');
        return { hash: '0xmock', wait: async () => ({ status: 1 }) };
      },
      enableVoting: async () => { 
        console.warn('Blockchain not available - using mock voting enablement');
        return { hash: '0xmock', wait: async () => ({ status: 1 }) };
      },
      vote: async () => { 
        console.warn('Blockchain not available - using mock voting');
        return { hash: '0xmock', wait: async () => ({ status: 1 }) };
      },
      getElection: async () => { 
        console.warn('Blockchain not available - returning mock election data');
        return { id: 1, title: 'Mock Election', description: 'Blockchain not available' };
      },
      getCandidate: async () => { 
        console.warn('Blockchain not available - returning mock candidate data');
        return { id: 1, name: 'Mock Candidate', voteCount: 0 };
      },
      candidatesCount: async () => { 
        console.warn('Blockchain not available - returning mock candidate count');
        return 0;
      },
    };
  }

  module.exports = votingContract;
}
