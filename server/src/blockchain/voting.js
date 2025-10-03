const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// If BLOCKCHAIN_MOCK is set, export a simple in-memory mock contract to allow
// frontend/UI development without a running node or deployed contract.
// The mock enforces a per-requester double-vote check using the requester's IP
// (useful for local UI testing). To enable, set BLOCKCHAIN_MOCK=true in server/.env
if (process.env.BLOCKCHAIN_MOCK === 'true') {
  console.log('BLOCKCHAIN_MOCK is enabled — using in-memory mock voting contract');

  // In-memory state
  // Structure: elections -> candidates, voters per election
  const elections = {};
  let electionCount = 0;

  const mock = {
    createElection: async ({ title, description, startsAt, endsAt } = {}) => {
      electionCount++;
      elections[electionCount] = {
        id: electionCount,
        title: title || `Election ${electionCount}`,
        description: description || '',
        startsAt: startsAt || null,
        endsAt: endsAt || null,
        candidates: {},
        candidateCount: 0,
        voters: new Set(),
      };
      return electionCount;
    },
    addCandidate: async (electionId, name) => {
      const e = elections[electionId];
      if (!e) throw new Error('Election not found');
      e.candidateCount++;
      const id = e.candidateCount;
      e.candidates[id] = { id, name, voteCount: 0 };
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
      return {
        id: e.id,
        title: e.title,
        description: e.description,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        candidateIds: Object.keys(e.candidates).map(k => Number(k)),
      };
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
  return;
}

// Try to load built artifact from a couple of known locations (Hardhat/Truffle layouts)
  const candidatePaths = [
  path.join(__dirname, '..', '..', 'artifacts', 'contracts', 'Voting.sol', 'Voting.json'),
  path.join(__dirname, '..', '..', 'blockchain', 'build', 'contracts', 'Voting.json'),
  path.join(__dirname, '..', '..', 'blockchain', 'build', 'Voting.json'),
];

let votingContract = null;

try {
  const found = candidatePaths.find((p) => fs.existsSync(p));
  if (!found) throw new Error(`Voting artifact not found in expected locations: ${candidatePaths.join(', ')}`);

  const VotingArtifact = require(found);

  // Setup provider + contract (Hardhat default)
  const rpc = process.env.BLOCKCHAIN_RPC || 'http://127.0.0.1:8545';
  const provider = new ethers.providers.JsonRpcProvider(rpc);
    const signer = provider.getSigner ? provider.getSigner() : provider;

    const contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('VOTING_CONTRACT_ADDRESS environment variable is not set. Deploy the contract and set this value.');
    }

    const contract = new ethers.Contract(contractAddress, VotingArtifact.abi || VotingArtifact.abi, signer);

    // Wrap exported API so callers can use both multi-election and candidate ID calls
    votingContract = {
      createElection: async (title, description, startsAt, endsAt) => {
        const tx = await contract.createElection(title, description, startsAt || 0, endsAt || 0);
        return tx;
      },
      addCandidate: async (electionId, name) => {
        const tx = await contract.addCandidate(electionId, name);
        return tx;
      },
      vote: async (electionId, candidateId, opts = {}) => {
        // on-chain vote requires signer to send tx from wallet; opts ignored server-side
        const tx = await contract.vote(electionId, candidateId);
        return tx;
      },
      getElection: async (electionId) => {
        return await contract.getElection(electionId);
      },
      getCandidate: async (electionId, candidateId) => {
        return await contract.getCandidate(electionId, candidateId);
      },
      hasVotedIn: async (electionId, voter) => {
        return await contract.hasVotedIn(electionId, voter);
      }
    };
    console.log(`Voting contract initialized at ${contractAddress} using artifact ${found} and RPC ${rpc}`);
    // Best-effort: listen for Vote events emitted by the contract and update DB
    try {
      // If ABI exposes an event named Vote(uint256 indexed electionId, uint256 indexed candidateId, address voter)
      if (contract.filters && contract.filters.Vote) {
        const ElectionModelPath = path.join(__dirname, '..', 'models', 'Election');
        let ElectionModel = null;
        try {
          ElectionModel = require(ElectionModelPath);
        } catch (e) {
          // model may not be available in some startup flows
          ElectionModel = null;
        }

        contract.on('Vote', async (...args) => {
          try {
            // Typical args: (electionId, candidateId, voter, event)
            const event = args[args.length - 1];
            const electionIdBN = args[0];
            const candidateIdBN = args[1];
            const voter = args[2];
            const electionId = Number(electionIdBN?.toString?.() || electionIdBN);
            const candidateId = Number(candidateIdBN?.toString?.() || candidateIdBN);

            if (!ElectionModel || process.env.SKIP_DB === 'true' || process.env.DB_CONNECTED !== 'true') return;

            // Find local Election doc by chainId (best-effort) or fallback to matching id
            const electionDoc = await ElectionModel.findOne({ chainId: electionId });
            if (!electionDoc) return;

            // Find matching candidate (by stored candidate._id or by mapped chain candidate id)
            const cand = electionDoc.candidates.find(c => String(c._id) === String(candidateId) || String(c.id) === String(candidateId) || c.chainId === candidateId);
            if (!cand) return;

            // Ensure we haven't already recorded this voter
            const voterId = voter || event?.transactionHash || event?.logIndex || String(Date.now());
            if (electionDoc.voters.includes(String(voterId))) return;

            cand.votes = (cand.votes || 0) + 1;
            electionDoc.voters.push(String(voterId));
            await electionDoc.save();
            console.log(`Synced DB for election ${electionId} candidate ${candidateId} from on-chain Vote event`);
          } catch (err) {
            console.warn('Failed to process Vote event for DB sync', err?.message || err);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to register chain event listeners', e?.message || e);
    }
} catch (err) {
  // Export a stub that throws when used — this prevents startup crash and gives clearer runtime errors
  const msg = `Blockchain contract not initialized: ${err.message}`;
  console.warn(msg);

  votingContract = {
    candidatesCount: async () => {
      throw new Error(msg);
    },
    getCandidate: async () => {
      throw new Error(msg);
    },
    vote: async () => {
      throw new Error(msg);
    },
  };
}

module.exports = votingContract;
