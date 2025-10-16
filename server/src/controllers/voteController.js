const votingContract = require("../blockchain/voting");
const Election = require('../models/Election');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getCandidates = async (req, res) => {
  // If electionId provided, fetch candidates for that election (DB) else fall back to global contract
  const { electionId } = req.query;
  try {
    if (process.env.BLOCKCHAIN_MOCK === 'true' || electionId) {
      // DB-backed
      const election = await Election.findById(electionId);
      if (!election) return res.error(404, 'Election not found');

      // Ensure the 'seat' property is returned for frontend logic
      const payload = election.candidates.map(c => ({ id: c._id || c.id, name: c.name, votes: c.votes, seat: c.seat }));
      return res.success(payload);
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
      return res.success(candidates);
    } catch (err) {
      throw new Error('On-chain multi-election API not available');
    }
  } catch (err) {
    logger.error('Error fetching candidates: %s', err?.message || err);
    return res.error(500, 'Error fetching candidates', 1001, { error: err?.message });
  }
};

exports.vote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.error(400, 'Validation failed', 2101, { errors: errors.array() });

    const { candidateId, electionId } = req.body;
    if (!candidateId || !electionId) return res.error(400, 'candidateId and electionId are required', 2001);

    // Determine voter identifier: prefer authenticated user id, else address or IP
    const voterId = req.user?.id || req.body.voterAddress || (req.headers['x-forwarded-for'] || req.ip || '').toString();
    if (!voterId) return res.error(401, 'Authentication required to cast vote.', 2002);

    // If BLOCKCHAIN_MOCK or using DB elections, update Election document atomically
    if (process.env.BLOCKCHAIN_MOCK === 'true' || electionId) {
      const election = await Election.findById(electionId);
      if (!election) return res.error(404, 'Election not found', 2003);

      // Find the candidate to get the seat name
      const candidate = election.candidates.id ? election.candidates.id(candidateId) : election.candidates.find(c => String(c._id) === String(candidateId) || String(c.id) === String(candidateId));
      if (!candidate) return res.error(404, 'Candidate not found', 2004);

      const seatId = candidate.seat;
      const votedKey = `${voterId}:${seatId}`; // e.g., "65c342d:President"

      // Use atomic update: only increment votes and push voter if votedKey not present
      const filter = { _id: electionId, voters: { $ne: votedKey }, 'candidates._id': candidate._id };
      const update = { $inc: { 'candidates.$.votes': 1 }, $push: { voters: votedKey } };
      const result = await Election.updateOne(filter, update);
      if (result.matchedCount === 0 || result.modifiedCount === 0) {
        // Could be already voted or race
        // Check if voter already recorded
        const refreshed = await Election.findById(electionId).select('voters');
        if (refreshed && refreshed.voters.includes(votedKey)) return res.error(400, `You have already voted for the seat: ${seatId}`, 2005);
        return res.error(500, 'Failed to record vote due to concurrent update', 2006);
      }

      return res.success({ electionId }, 'Vote cast successfully (db)');
    }

    // Otherwise, attempt to call the blockchain contract (non-DB path)
    const ip = (req.headers['x-forwarded-for'] || req.ip || '').toString();
    let tx;
    try {
      // Assuming votingContract.vote requires electionId and candidateId
      tx = await votingContract.vote(electionId, candidateId, { _voterId: ip });
    } catch (err) {
      // Explicitly check for an already voted error if the contract supports it
      if (err.code === 'ALREADY_VOTED') return res.error(400, 'You have already voted', 2007);
      logger.error('Blockchain vote error: %s', err?.message || err);
      throw err;
    }

    if (tx && typeof tx.wait === 'function') {
      await tx.wait();
    }

    return res.success({ txHash: tx?.hash || null }, 'Vote cast successfully (on-chain)');
  } catch (err) {
    logger.error('Error voting: %s', err?.message || err);
    return res.error(500, 'Error voting', 2000, { error: err?.message });
  }
};

exports.hasVoted = async (req, res) => {
  try {
    const { electionId } = req.query;
    if (!electionId) return res.status(400).json({ message: 'electionId is required' });
    const voterId = req.user?.id || req.query.address || (req.headers['x-forwarded-for'] || req.ip || '').toString();
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    // Extract all seat names the user has voted for based on the new key format
    const votedSeats = election.voters
        // Filter entries that start with the voter's ID followed by a colon
        .filter(entry => entry.startsWith(voterId + ':')) 
        // Map the entries to extract just the seat name (the part after the colon)
        .map(entry => entry.split(':')[1]);
        
    // Return the list of seats the user has voted for
    res.json({ hasVoted: votedSeats.length > 0, votedSeats: votedSeats });
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