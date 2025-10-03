const votingContract = require("../blockchain/voting");

const Election = require('../models/Election');

exports.getCandidates = async (req, res) => {
  // If electionId provided, fetch candidates for that election (DB) else fall back to global contract
  const { electionId } = req.query;
  try {
    if (process.env.BLOCKCHAIN_MOCK === 'true' || electionId) {
      // DB-backed
      const election = await Election.findById(electionId);
      if (!election) return res.status(404).json({ message: 'Election not found' });
      return res.json(election.candidates.map(c => ({ id: c._id || c.id, name: c.name, votes: c.votes })));
    }

    let candidates = [];
    // try to fetch from on-chain election 1 as fallback
    try {
      const e = await votingContract.getElection(1);
      const ids = e.candidateIds || [];
      for (const cid of ids) {
        const candidate = await votingContract.getCandidate(1, cid);
        candidates.push({ id: candidate.id.toString(), name: candidate.name, votes: candidate.voteCount.toString() });
      }
      return res.json(candidates);
    } catch (err) {
      throw new Error('On-chain multi-election API not available');
    }
  } catch (err) {
    res.status(500).json({ message: "Error fetching candidates", error: err.message });
  }
};

exports.vote = async (req, res) => {
  try {
    const { candidateId, electionId } = req.body;
    if (!candidateId || !electionId) return res.status(400).json({ message: 'candidateId and electionId are required' });

    // Determine voter identifier: prefer authenticated user id, else address or IP
    const voterId = req.user?.id || req.body.voterAddress || (req.headers['x-forwarded-for'] || req.ip || '').toString();

    // If BLOCKCHAIN_MOCK or using DB elections, update Election document
    if (process.env.BLOCKCHAIN_MOCK === 'true' || electionId) {
      const election = await Election.findById(electionId);
      if (!election) return res.status(404).json({ message: 'Election not found' });
      if (election.voters.includes(String(voterId))) return res.status(400).json({ message: 'You have already voted' });

      // increment candidate votes
      const candidate = election.candidates.id ? election.candidates.id(candidateId) : election.candidates.find(c => String(c._id) === String(candidateId) || String(c.id) === String(candidateId));
      if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
      candidate.votes = (candidate.votes || 0) + 1;
      election.voters.push(String(voterId));
      await election.save();
      return res.json({ message: 'Vote cast successfully (db)', electionId });
    }

    // Otherwise, attempt to call the blockchain contract
    const ip = (req.headers['x-forwarded-for'] || req.ip || '').toString();
    let tx;
    try {
      tx = await votingContract.vote(electionId, candidateId, { _voterId: ip });
    } catch (err) {
      if (err.code === 'ALREADY_VOTED') {
        return res.status(400).json({ message: 'You have already voted' });
      }
      throw err;
    }

    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }

    res.json({ message: 'Vote cast successfully', txHash: tx?.hash || null });
  } catch (err) {
    res.status(500).json({ message: "Error voting", error: err.message });
  }
};

exports.hasVoted = async (req, res) => {
  try {
    const { electionId } = req.query;
    if (!electionId) return res.status(400).json({ message: 'electionId is required' });
    const voterId = req.user?.id || req.query.address || (req.headers['x-forwarded-for'] || req.ip || '').toString();
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    const voted = election.voters.includes(String(voterId));
    res.json({ voted });
  } catch (err) {
    res.status(500).json({ message: 'Error checking vote status', error: err.message });
  }
};


exports.addCandidate = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || String(name).trim().length === 0) return res.status(400).json({ message: 'Invalid candidate name' });

    // Some implementations of the contract may require a signer and to send a tx.
    // Our mock returns the candidate directly. Handle both shapes.
    const result = await votingContract.addCandidate(name);

    // If result looks like a tx (has wait), wait for it and then respond with success.
    if (result && typeof result.wait === 'function') {
      await result.wait();
      // no reliable on-chain shape here; return a generic message
      return res.json({ message: 'Candidate added (on-chain)', txHash: result.hash || null });
    }

    // otherwise assume the mock returned the candidate object
    res.json({ message: 'Candidate added', candidate: result });
  } catch (err) {
    res.status(500).json({ message: 'Error adding candidate', error: err.message });
  }
};
