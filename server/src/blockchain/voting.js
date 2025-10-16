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
    path.join(__dirname, '..', '..', 'artifacts', 'contracts', 'Voting.sol', 'Voting.json'),
    path.join(__dirname, '..', '..', 'blockchain', 'build', 'contracts', 'Voting.json'),
    path.join(__dirname, '..', '..', 'blockchain', 'build', 'Voting.json'),
  ];

  let votingContract = null;

  try {
    const found = candidatePaths.find((p) => fs.existsSync(p));
    if (!found) throw new Error(`Voting artifact not found in expected locations: ${candidatePaths.join(', ')}`);

    const VotingArtifact = require(found);

    const rpc = process.env.BLOCKCHAIN_RPC || 'http://127.0.0.1:8545';
    const provider = new ethers.JsonRpcProvider(rpc);
    const signer = provider.getSigner ? provider.getSigner() : provider;

    const contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('VOTING_CONTRACT_ADDRESS environment variable is not set. Deploy the contract and set this value.');
    }

    const contract = new ethers.Contract(contractAddress, VotingArtifact.abi || VotingArtifact.abi, signer);

    votingContract = {
      createElection: async (title, description, startsAt, endsAt) => {
        const tx = await contract.createElection(title, description, startsAt || 0, endsAt || 0);
        return tx;
      },
      addCandidate: async (electionId, name, seat) => {
        const tx = await contract.addCandidate(electionId, name, seat || '');
        return tx;
      },
      vote: async (electionId, candidateId, opts = {}) => {
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
    votingContract = {
      candidatesCount: async () => { throw new Error(msg); },
      getCandidate: async () => { throw new Error(msg); },
      vote: async () => { throw new Error(msg); },
    };
  }

  module.exports = votingContract;
}
