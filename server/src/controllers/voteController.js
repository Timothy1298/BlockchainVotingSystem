const votingContract = require("../blockchain/voting");
const Election = require('../models/Election');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const VoteReceipt = require('../models/VoteReceipt');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

exports.getCandidates = async (req, res) => {
  // If electionId provided, fetch candidates for that election (DB) else fall back to global contract
  const { electionId, page = 1, limit = 50, seat, party, search, sortBy = 'name', sortOrder = 'asc' } = req.query;
  try {
    if (process.env.BLOCKCHAIN_MOCK === 'true' || electionId) {
      // DB-backed: use aggregation to support server-side filtering and pagination
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const perPage = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));

      const matchStage = { $match: { _id: Election.Types ? Election.Types.ObjectId ? Election.Types.ObjectId(electionId) : electionId : electionId } };
      // The above is defensive; prefer ObjectId conversion if available
      try {
        const mongoose = require('mongoose');
        matchStage.$match._id = mongoose.Types.ObjectId(electionId);
      } catch (e) {
        matchStage.$match._id = electionId;
      }

      const pipeline = [
        matchStage,
        { $unwind: '$candidates' },
      ];

      // Filters
      const candidateMatch = {};
      if (seat) candidateMatch['candidates.seat'] = seat;
      if (party) candidateMatch['candidates.party'] = party;
      if (search) candidateMatch['$or'] = [
        { 'candidates.name': { $regex: search, $options: 'i' } },
        { 'candidates.party': { $regex: search, $options: 'i' } },
        { 'candidates.seat': { $regex: search, $options: 'i' } }
      ];
      if (Object.keys(candidateMatch).length > 0) pipeline.push({ $match: candidateMatch });

      // Projection and prepare sortable fields on root
      pipeline.push({
        $replaceRoot: { newRoot: { $mergeObjects: [ '$candidates', { electionId: '$_id', electionTitle: '$title' } ] } }
      });

      // Sorting
      const sortField = sortBy || 'name';
      const sortDirection = sortOrder === 'desc' ? -1 : 1;
      const sortStage = { $sort: { [sortField]: sortDirection } };

      // Facet for pagination
      pipeline.push({
        $facet: {
          metadata: [ { $count: 'total' } ],
          data: [ sortStage, { $skip: (pageNum - 1) * perPage }, { $limit: perPage } ]
        }
      });

      const agg = await Election.aggregate(pipeline).allowDiskUse(true).exec();
      const metadata = (agg[0] && agg[0].metadata[0]) || { total: 0 };
      const data = (agg[0] && agg[0].data) || [];

      return res.json({
        candidates: data.map(c => ({ id: c._id || c.id, name: c.name, votes: c.votes || 0, seat: c.seat, party: c.party, isActive: c.isActive, verified: c.verified, chainCandidateId: c.chainCandidateId })),
        pagination: {
          page: pageNum,
          limit: perPage,
          total: metadata.total || 0,
          pages: Math.ceil((metadata.total || 0) / perPage)
        }
      });
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

// F.4.1: Cast Vote (Enhanced)
exports.vote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.error(400, 'Validation failed', 2101, { errors: errors.array() });

    const { candidateId, electionId } = req.body;
    if (!candidateId || !electionId) return res.error(400, 'candidateId and electionId are required', 2001);

    // Determine voter identifier: prefer authenticated user id, else address or IP
    const voterId = req.user?.id || req.body.voterAddress || (req.headers['x-forwarded-for'] || req.ip || '').toString();
    if (!voterId) return res.error(401, 'Authentication required to cast vote.', 2002);

    // Get election and validate
    const election = await Election.findById(electionId);
    if (!election) return res.error(404, 'Election not found', 2003);

    // Check if voting is enabled
    if (!election.votingEnabled) {
      return res.error(400, 'Voting is not currently enabled for this election', 2008);
    }

    // Check election status and timing
    const now = new Date();
    if (election.startsAt && now < election.startsAt) {
      return res.error(400, 'Election has not started yet', 2009);
    }
    if (election.endsAt && now > election.endsAt) {
      return res.error(400, 'Election has ended', 2010);
    }

    // Check if voter is registered for this election
    if (!election.registeredVoters.includes(voterId)) {
      return res.error(403, 'Voter not registered for this election', 2011);
    }

    // Find the candidate
    const candidate = election.candidates.id ? election.candidates.id(candidateId) : 
      election.candidates.find(c => String(c._id) === String(candidateId) || String(c.id) === String(candidateId));
    if (!candidate) return res.error(404, 'Candidate not found', 2004);

    if (!candidate.isActive) {
      return res.error(400, 'Candidate is not active', 2012);
    }

    const seatId = candidate.seat;
    const votedKey = `${voterId}:${seatId}`; // e.g., "65c342d:President"

    // Check if already voted for this seat
    if (election.voters.includes(votedKey)) {
      return res.error(400, `You have already voted for the seat: ${seatId}`, 2005);
    }

    // If BLOCKCHAIN_MOCK or using DB elections, update Election document atomically
    if (process.env.BLOCKCHAIN_MOCK === 'true' || electionId) {
      // Use atomic update: only increment votes and push voter if votedKey not present
      const filter = { _id: electionId, voters: { $ne: votedKey }, 'candidates._id': candidate._id };
      const update = { 
        $inc: { 'candidates.$.votes': 1, totalVotes: 1 }, 
        $push: { voters: votedKey } 
      };
      const result = await Election.updateOne(filter, update);
      
      if (result.matchedCount === 0 || result.modifiedCount === 0) {
        return res.error(500, 'Failed to record vote due to concurrent update', 2006);
      }

      // Generate vote receipt
      const receiptHash = crypto.createHash('sha256')
        .update(`${electionId}:${candidateId}:${voterId}:${Date.now()}`)
        .digest('hex');

      // Store vote receipt in dedicated collection
      await VoteReceipt.createFromVote({
        electionId,
        candidateId,
        voterId,
        receiptHash,
        candidateName: candidate.name,
        seat: seatId,
        electionTitle: election.title
      });

      // Update user's voting history
      if (req.user?.id) {
        await User.findByIdAndUpdate(req.user.id, {
          $push: {
            votingHistory: {
              election: electionId,
              seats: [seatId],
              votedAt: new Date(),
              receiptHash: receiptHash
            }
          }
        });
      }

      // Log the vote
      await AuditLog.create({
        action: 'vote_cast',
        performedBy: voterId,
        details: { 
          electionId: election._id,
          candidateId: candidate._id,
          candidateName: candidate.name,
          seat: seatId,
          receiptHash: receiptHash
        },
        timestamp: new Date()
      });

      return res.success({ 
        electionId, 
        receiptHash,
        candidateName: candidate.name,
        seat: seatId
      }, 'Vote cast successfully');
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

    // F.4.2: Generate Receipt
    const receiptHash = crypto.createHash('sha256')
      .update(`${electionId}:${candidateId}:${voterId}:${tx?.hash || Date.now()}`)
      .digest('hex');

    // Store vote receipt with blockchain transaction details
    await VoteReceipt.createFromVote({
      electionId,
      candidateId,
      voterId,
      receiptHash,
      transactionHash: tx?.hash,
      candidateName: candidate.name,
      seat: seatId,
      electionTitle: election.title,
      blockNumber: tx?.blockNumber,
      blockHash: tx?.blockHash,
      gasUsed: tx?.gasUsed
    });

    // Log the vote
    await AuditLog.create({
      action: 'vote_cast_onchain',
      performedBy: voterId,
      details: { 
        electionId: election._id,
        candidateId: candidate._id,
        candidateName: candidate.name,
        seat: seatId,
        transactionHash: tx?.hash,
        receiptHash: receiptHash
      },
      timestamp: new Date()
    });

    return res.success({ 
      txHash: tx?.hash || null, 
      receiptHash,
      candidateName: candidate.name,
      seat: seatId
    }, 'Vote cast successfully (on-chain)');
  } catch (err) {
    logger.error('Error voting: %s', err?.message || err);
    return res.error(500, 'Error voting', 2000, { error: err?.message });
  }
};

// F.4.X: Get vote history for authenticated user
exports.getVoteHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.error(401, 'Unauthorized');

    // Get vote history from VoteReceipt collection
    const history = await VoteReceipt.getVoterHistory(userId, 50);
    
    const formattedHistory = history.map(receipt => ({
      electionId: receipt.electionId,
      candidateId: receipt.candidateId,
      candidateName: receipt.candidateName,
      seat: receipt.seat,
      electionTitle: receipt.electionTitle,
      receiptHash: receipt.receiptHash,
      transactionHash: receipt.transactionHash,
      votedAt: receipt.votedAt,
      isVerified: receipt.isVerified,
      blockNumber: receipt.blockNumber
    }));

    return res.success(formattedHistory);
  } catch (err) {
    logger.error('Error fetching vote history: %s', err?.message || err);
    return res.error(500, 'Error fetching vote history', 1201, { error: err?.message });
  }
};

// F.4.X: Get audit trail for authenticated user
exports.getAuditTrail = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.error(401, 'Unauthorized');

    const logs = await AuditLog.find({ performedBy: userId }).sort({ timestamp: -1 }).lean();
    return res.success(logs);
  } catch (err) {
    logger.error('Error fetching audit trail: %s', err?.message || err);
    return res.error(500, 'Error fetching audit trail', 1202, { error: err?.message });
  }
};

// F.4.X: Verify vote receipt
exports.verifyReceipt = async (req, res) => {
  try {
    const { receiptHash } = req.params;
    if (!receiptHash) return res.error(400, 'Receipt hash is required');

    const receipt = await VoteReceipt.verifyReceipt(receiptHash);
    return res.success(receipt.formattedReceipt);
  } catch (err) {
    logger.error('Error verifying receipt: %s', err?.message || err);
    return res.error(500, 'Error verifying receipt', 1203, { error: err?.message });
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


// F.4.2: Verify Vote Receipt
exports.verifyReceipt = async (req, res) => {
  try {
    const { receiptHash, electionId } = req.query;
    
    if (!receiptHash) {
      return res.status(400).json({ message: 'Receipt hash is required' });
    }
    
    // Search for the vote in audit logs
    const auditLog = await AuditLog.findOne({
      'details.receiptHash': receiptHash,
      action: { $in: ['vote_cast', 'vote_cast_onchain'] }
    });
    
    if (!auditLog) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Receipt not found or invalid' 
      });
    }
    
    // If electionId provided, verify it matches
    if (electionId && auditLog.details.electionId !== electionId) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Receipt does not match the specified election' 
      });
    }
    
    res.json({
      valid: true,
      receipt: {
        receiptHash: auditLog.details.receiptHash,
        electionId: auditLog.details.electionId,
        candidateName: auditLog.details.candidateName,
        seat: auditLog.details.seat,
        votedAt: auditLog.timestamp,
        transactionHash: auditLog.details.transactionHash
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying receipt', error: err.message });
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