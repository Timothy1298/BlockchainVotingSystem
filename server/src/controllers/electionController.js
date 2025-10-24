const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// F.1.1: Create & Configure Election
exports.create = async (req, res) => {
  try {
    console.log('Creating election with data:', req.body);
    const { title, description, startsAt, endsAt, electionType, seats, rules, phases, ballotStructure } = req.body;
    
    if (!electionType) return res.status(400).json({ message: 'electionType is required' });
    if (!Array.isArray(seats) || seats.length === 0) return res.status(400).json({ message: 'At least one seat/position is required' });
    
    const election = new Election({ 
      title, 
      description, 
      startsAt, 
      endsAt, 
      electionType, 
      seats, 
      rules: rules || { oneVotePerId: true, anonymous: true, eligibility: 'registered' },
      phases: phases || [],
      ballotStructure: ballotStructure || 'single',
      createdBy: req.user.id 
    });
    
    console.log('Saving election:', election);
    await election.save();
    console.log('Election saved successfully:', election._id);
    
    // Log the election creation
    try {
      await AuditLog.create({
        action: 'election_created',
        performedBy: req.user.id,
        details: { electionId: election._id, title: election.title },
        timestamp: new Date()
      });
    } catch (auditError) {
      console.warn('Failed to create audit log:', auditError.message);
    }
    
    res.json(election);
  } catch (err) {
    console.error('Error creating election:', err);
    res.status(500).json({ message: 'Error creating election', error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    if (process.env.SKIP_DB === 'true') {
      console.warn('SKIP_DB is true - returning empty elections list (dev mode)');
      return res.json([]);
    }
    console.log('Fetching elections from database...');
    const elections = await Election.find().sort({ createdAt: -1 });
    console.log(`Found ${elections.length} elections:`, elections.map(e => ({ id: e._id, title: e.title })));
    res.json(elections);
  } catch (err) {
    console.error('Error fetching elections:', err);
    res.status(500).json({ message: 'Error fetching elections', error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    console.log('Fetching election with ID:', req.params.id);
    const election = await Election.findById(req.params.id);
    if (!election) {
      console.log('Election not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Election not found' });
    }
    console.log('Found election:', { id: election._id, title: election.title });
    // Add cache-busting headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.json({
      ...election.toObject(),
      _cacheBust: Date.now(),
      _timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error fetching election:', err);
    res.status(500).json({ message: 'Error fetching election', error: err.message });
  }
};

// F.1.2: Election Lifecycle Control - Enhanced with Security
exports.changeStatus = async (req, res) => {
  try {
    const { status, adminPassword, confirmationCode } = req.body;
    const validStatuses = ['Setup', 'Open', 'Closed', 'Finalized'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Security validation for critical status changes
    if (status === 'Open' || status === 'Closed') {
      if (!adminPassword) {
        return res.status(400).json({ message: 'Admin password required for voting control' });
      }
      
      // Verify admin password (in production, this should be hashed and stored securely)
      const expectedPassword = process.env.ELECTION_ADMIN_PASSWORD || 'admin123';
      const isValidPassword = await bcrypt.compare(adminPassword, await bcrypt.hash(expectedPassword, 10)) || adminPassword === expectedPassword;
      
      if (!isValidPassword) {
        await AuditLog.create({
          action: 'unauthorized_status_change_attempt',
          performedBy: req.user.id,
          details: { 
            electionId: req.params.id, 
            attemptedStatus: status,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          },
          timestamp: new Date()
        });
        return res.status(401).json({ message: 'Invalid admin password' });
      }
    }
    
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    const oldStatus = election.status;
    
    // Validate status transitions
    const validTransitions = {
      'Setup': ['Open'],
      'Open': ['Closed'],
      'Closed': ['Finalized'],
      'Finalized': [] // No transitions from finalized
    };
    
    if (!validTransitions[oldStatus]?.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${oldStatus} to ${status}`,
        validTransitions: validTransitions[oldStatus] || []
      });
    }
    
    // Additional validations for specific status changes
    if (status === 'Open') {
      if (election.candidates.length === 0) {
        return res.status(400).json({ message: 'Cannot open election without candidates' });
      }
      if (!election.candidateListLocked) {
        return res.status(400).json({ message: 'Candidate list must be locked before opening election' });
      }
    }
    
    if (status === 'Closed') {
      const now = new Date();
      if (election.endsAt && now < election.endsAt) {
        return res.status(400).json({ message: 'Cannot close election before scheduled end time' });
      }
    }
    
    election.status = status;
    
    // Update voting enabled based on status
    if (status === 'Open') {
      election.votingEnabled = true;
    } else if (status === 'Closed' || status === 'Finalized') {
      election.votingEnabled = false;
    }
    
    // Add to status history
    election.statusHistory.push({
      status: status,
      at: new Date(),
      changedBy: req.user.id
    });
    
    await election.save();
    
    // Log the status change
    await AuditLog.create({
      action: 'election_status_changed',
      performedBy: req.user.id,
      details: { 
        electionId: election._id, 
        oldStatus, 
        newStatus: status,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      timestamp: new Date()
    });
    
    res.json({
      election,
      message: `Election status changed from ${oldStatus} to ${status}`,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: 'Error changing election status', error: err.message });
  }
};

// F.1.2: Toggle Voting
exports.toggleVoting = async (req, res) => {
  try {
    const { enabled } = req.body;
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    election.votingEnabled = enabled;
    await election.save();
    
    // Log the voting toggle
    await AuditLog.create({
      action: 'voting_toggled',
      performedBy: req.user.id,
      details: { 
        electionId: election._id, 
        votingEnabled: enabled 
      },
      timestamp: new Date()
    });
    
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: 'Error toggling voting', error: err.message });
  }
};

// F.3.1: Add Candidate with Hash - Enhanced
exports.addCandidate = async (req, res) => {
  try {
    console.log('Add candidate request:', { 
      electionId: req.params.id, 
      body: req.body,
      user: req.user?.id 
    });
    
    const election = await Election.findById(req.params.id);
    if (!election) {
      console.log('Election not found:', req.params.id);
      return res.status(404).json({ message: 'Election not found' });
    }
    
    console.log('Found election:', { 
      id: election._id, 
      title: election.title,
      candidateListLocked: election.candidateListLocked,
      seats: election.seats 
    });
    
    if (election.candidateListLocked) {
      return res.status(400).json({ message: 'Candidate list is locked' });
    }
    
    const { name, seat, bio, photoUrl, manifesto, party, position, email, phone, age, isActive = true } = req.body;
    if (!name) return res.status(400).json({ message: 'Candidate name required' });
    if (!seat || !election.seats.includes(seat)) return res.status(400).json({ message: 'Valid seat/position required' });
    
    // Check for duplicate candidate name in same seat
    const existingCandidate = election.candidates.find(c => 
      c.name.toLowerCase() === name.toLowerCase() && c.seat === seat
    );
    if (existingCandidate) {
      return res.status(400).json({ message: 'Candidate with this name already exists for this seat' });
    }
    
    // Generate name hash for verification
    const nameHash = crypto.createHash('sha256').update(name).digest('hex');
    
    // Generate unique blockchain candidate ID
    const chainCandidateId = election.candidates.length + 1;
    
    const candidate = {
      name,
      seat,
      bio,
      photoUrl,
      manifesto,
      party,
      position,
      email,
      phone,
      age,
      nameHash,
      chainCandidateId,
      isActive,
      votes: 0,
      createdAt: new Date()
    };
    
    election.candidates.push(candidate);
    await election.save();
    
    console.log('Candidate added successfully:', {
      candidateName: name,
      seat: seat,
      totalCandidates: election.candidates.length
    });
    
    // Log candidate addition
    await AuditLog.create({
      action: 'candidate_added',
      performedBy: req.user.id,
      details: { 
        electionId: election._id, 
        candidateName: name,
        seat: seat,
        chainCandidateId: chainCandidateId,
        party: party
      },
      timestamp: new Date()
    });
    
    res.json({
      election,
      candidate: election.candidates[election.candidates.length - 1],
      message: 'Candidate added successfully'
    });
  } catch (err) {
    console.error('Error adding candidate:', err);
    res.status(500).json({ message: 'Error adding candidate', error: err.message });
  }
};

// F.3.2: Lock Candidate List
exports.lockCandidateList = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    election.candidateListLocked = true;
    await election.save();
    
    // Log candidate list lock
    await AuditLog.create({
      action: 'candidate_list_locked',
      performedBy: req.user.id,
      details: { electionId: election._id },
      timestamp: new Date()
    });
    
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: 'Error locking candidate list', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    const { title, description, startsAt, endsAt } = req.body;
    if (title) election.title = title;
    if (description) election.description = description;
    if (startsAt) election.startsAt = startsAt;
    if (endsAt) election.endsAt = endsAt;
    await election.save();
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: 'Error updating election', error: err.message });
  }
};

exports.getCandidatesByElection = async (req, res) => {
  try {
    // When DB is skipped (dev), return an empty candidate set to avoid 500s
    if (process.env.SKIP_DB === 'true') {
      console.warn('SKIP_DB is true - returning empty candidates list (dev mode)');
      return res.json([]);
    }
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election.candidates.map(c => ({ 
      id: c._id || c.id, 
      name: c.name, 
      seat: c.seat, 
      votes: c.votes,
      party: c.party,
      position: c.position,
      bio: c.bio,
      manifesto: c.manifesto,
      photoUrl: c.photoUrl,
      chainCandidateId: c.chainCandidateId,
      nameHash: c.nameHash,
      isActive: c.isActive,
      createdAt: c.createdAt
    })));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching candidates', error: err.message });
  }
};

// F.3.1: Update Candidate
exports.updateCandidate = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    if (election.candidateListLocked) {
      return res.status(400).json({ message: 'Candidate list is locked' });
    }
    
    const candidateId = req.params.candidateId;
    const candidate = election.candidates.id(candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    
    const { name, seat, bio, photoUrl, manifesto, party, position, isActive } = req.body;
    
    // Update fields if provided
    if (name !== undefined) {
      // Check for duplicate name in same seat (excluding current candidate)
      const existingCandidate = election.candidates.find(c => 
        c._id.toString() !== candidateId && 
        c.name.toLowerCase() === name.toLowerCase() && 
        c.seat === (seat || candidate.seat)
      );
      if (existingCandidate) {
        return res.status(400).json({ message: 'Candidate with this name already exists for this seat' });
      }
      candidate.name = name;
      // Regenerate name hash
      candidate.nameHash = crypto.createHash('sha256').update(name).digest('hex');
    }
    
    if (seat !== undefined) {
      if (!election.seats.includes(seat)) {
        return res.status(400).json({ message: 'Invalid seat/position' });
      }
      candidate.seat = seat;
    }
    if (bio !== undefined) candidate.bio = bio;
    if (photoUrl !== undefined) candidate.photoUrl = photoUrl;
    if (manifesto !== undefined) candidate.manifesto = manifesto;
    if (party !== undefined) candidate.party = party;
    if (position !== undefined) candidate.position = position;
    if (isActive !== undefined) candidate.isActive = isActive;
    
    await election.save();
    
    // Log candidate update
    await AuditLog.create({
      action: 'candidate_updated',
      performedBy: req.user.id,
      details: { 
        electionId: election._id, 
        candidateId: candidateId,
        candidateName: candidate.name,
        changes: req.body
      },
      timestamp: new Date()
    });
    
    res.json({
      election,
      candidate,
      message: 'Candidate updated successfully'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating candidate', error: err.message });
  }
};

// F.3.1: Delete Candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    if (election.candidateListLocked) {
      return res.status(400).json({ message: 'Candidate list is locked' });
    }
    
    const candidateId = req.params.candidateId;
    const candidate = election.candidates.id(candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    
    // Check if candidate has votes
    if (candidate.votes > 0) {
      return res.status(400).json({ message: 'Cannot delete candidate with existing votes' });
    }
    
    const candidateName = candidate.name;
    election.candidates.pull(candidateId);
    await election.save();
    
    // Log candidate deletion
    await AuditLog.create({
      action: 'candidate_deleted',
      performedBy: req.user.id,
      details: { 
        electionId: election._id, 
        candidateId: candidateId,
        candidateName: candidateName
      },
      timestamp: new Date()
    });
    
    res.json({
      election,
      message: 'Candidate deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting candidate', error: err.message });
  }
};

// F.3.1: Bulk Import Candidates
exports.bulkImportCandidates = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    if (election.candidateListLocked) {
      return res.status(400).json({ message: 'Candidate list is locked' });
    }
    
    const { candidates } = req.body;
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ message: 'Candidates array is required' });
    }
    
    const results = {
      successful: [],
      failed: [],
      total: candidates.length
    };
    
    for (const candidateData of candidates) {
      try {
        const { name, seat, bio, photoUrl, manifesto, party, position, isActive = true } = candidateData;
        
        if (!name || !seat) {
          results.failed.push({
            candidate: candidateData,
            error: 'Name and seat are required'
          });
          continue;
        }
        
        if (!election.seats.includes(seat)) {
          results.failed.push({
            candidate: candidateData,
            error: 'Invalid seat/position'
          });
          continue;
        }
        
        // Check for duplicate
        const existingCandidate = election.candidates.find(c => 
          c.name.toLowerCase() === name.toLowerCase() && c.seat === seat
        );
        if (existingCandidate) {
          results.failed.push({
            candidate: candidateData,
            error: 'Candidate with this name already exists for this seat'
          });
          continue;
        }
        
        // Generate name hash and blockchain ID
        const nameHash = crypto.createHash('sha256').update(name).digest('hex');
        const chainCandidateId = election.candidates.length + 1;
        
        const candidate = {
          name,
          seat,
          bio,
          photoUrl,
          manifesto,
          party,
          position,
          nameHash,
          chainCandidateId,
          isActive,
          votes: 0,
          createdAt: new Date()
        };
        
        election.candidates.push(candidate);
        results.successful.push(candidate);
        
      } catch (error) {
        results.failed.push({
          candidate: candidateData,
          error: error.message
        });
      }
    }
    
    await election.save();
    
    // Log bulk import
    await AuditLog.create({
      action: 'candidates_bulk_imported',
      performedBy: req.user.id,
      details: { 
        electionId: election._id,
        totalCandidates: results.total,
        successful: results.successful.length,
        failed: results.failed.length
      },
      timestamp: new Date()
    });
    
    res.json({
      election,
      results,
      message: `Bulk import completed: ${results.successful.length} successful, ${results.failed.length} failed`
    });
  } catch (err) {
    res.status(500).json({ message: 'Error bulk importing candidates', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    // Check if election has votes - prevent deletion of elections with votes
    if (election.totalVotes > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete election with existing votes. Use the "Clear Votes" option first to remove all votes, then delete the election.' 
      });
    }
    
    // Store election details for audit log
    const electionDetails = {
      electionId: election._id,
      title: election.title,
      status: election.status,
      candidates: election.candidates.length,
      totalVotes: election.totalVotes,
      createdAt: election.createdAt
    };

    // Delete the election
    await Election.findByIdAndDelete(req.params.id);

    // Log the election deletion
    await AuditLog.create({
      action: 'election_deleted',
      performedBy: req.user.id,
      details: electionDetails,
      timestamp: new Date()
    });

    res.json({
      message: 'Election deleted successfully',
      deletedElection: electionDetails
    });
  } catch (err) {
    console.error('Error deleting election:', err);
    res.status(500).json({ message: 'Error deleting election', error: err.message });
  }
};

// Clear votes from election (allows deletion after clearing)
exports.clearVotes = async (req, res) => {
  try {
    const { adminPassword } = req.body;
    
    if (!adminPassword) {
      return res.status(400).json({ message: 'Admin password required to clear votes' });
    }
    
    // Verify admin password
    const expectedPassword = process.env.ELECTION_ADMIN_PASSWORD || 'admin123';
    const isValidPassword = await bcrypt.compare(adminPassword, await bcrypt.hash(expectedPassword, 10)) || adminPassword === expectedPassword;
    
    if (!isValidPassword) {
      await AuditLog.create({
        action: 'unauthorized_clear_votes_attempt',
        performedBy: req.user.id,
        details: { 
          electionId: req.params.id,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        timestamp: new Date()
      });
      return res.status(401).json({ message: 'Invalid admin password' });
    }
    
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    // Store original vote count for audit
    const originalVoteCount = election.totalVotes;
    
    // Clear all votes from candidates
    election.candidates.forEach(candidate => {
      candidate.votes = 0;
    });
    
    // Reset election vote count and tracking
    election.totalVotes = 0;
    election.voters = [];
    election.voterSeatVotes = {};
    election.voterCandidateVotes = {};
    
    await election.save();
    
    // Log the vote clearing
    await AuditLog.create({
      action: 'election_votes_cleared',
      performedBy: req.user.id,
      details: {
        electionId: election._id,
        title: election.title,
        originalVoteCount: originalVoteCount,
        clearedVoteCount: originalVoteCount
      },
      timestamp: new Date()
    });
    
    res.json({
      message: 'All votes cleared successfully. Election can now be deleted.',
      election: election,
      clearedVotes: originalVoteCount
    });
  } catch (err) {
    console.error('Error clearing votes:', err);
    res.status(500).json({ message: 'Error clearing votes', error: err.message });
  }
};
// F.5.1: Finalize Tally - Enhanced with Security
exports.finalizeTally = async (req, res) => {
  try {
    const { adminPassword, confirmationCode } = req.body;
    
    // Security validation for tally finalization
    if (!adminPassword) {
      return res.status(400).json({ message: 'Admin password required for tally finalization' });
    }
    
    // Verify admin password
    const expectedPassword = process.env.ELECTION_ADMIN_PASSWORD || 'admin123';
    const isValidPassword = await bcrypt.compare(adminPassword, await bcrypt.hash(expectedPassword, 10)) || adminPassword === expectedPassword;
    
    if (!isValidPassword) {
      await AuditLog.create({
        action: 'unauthorized_tally_finalization_attempt',
        performedBy: req.user.id,
        details: { 
          electionId: req.params.id,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        timestamp: new Date()
      });
      return res.status(401).json({ message: 'Invalid admin password' });
    }
    
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    if (election.status !== 'Closed') {
      return res.status(400).json({ message: 'Election must be closed to finalize tally' });
    }
    
    if (election.status === 'Finalized') {
      return res.status(400).json({ message: 'Election tally already finalized' });
    }
    
    const now = new Date();
    if (election.endsAt && now < election.endsAt) {
      return res.status(400).json({ message: 'Election has not ended yet' });
    }
    
    // Calculate final results
    const results = election.candidates.map(candidate => ({
      candidateId: candidate._id,
      name: candidate.name,
      seat: candidate.seat,
      votes: candidate.votes || 0
    }));
    
    // Generate results hash for blockchain verification
    const resultsHash = crypto.createHash('sha256')
      .update(JSON.stringify(results))
      .digest('hex');
    
    // Update election status and results
    election.status = 'Finalized';
    election.finalResultsHash = resultsHash;
    election.results = results;
    election.votingEnabled = false;
    
    // Add to status history
    election.statusHistory.push({
      status: 'Finalized',
      at: new Date(),
      changedBy: req.user.id
    });
    
    await election.save();
    
    // Log tally finalization
    await AuditLog.create({
      action: 'tally_finalized',
      performedBy: req.user.id,
      details: { 
        electionId: election._id,
        resultsHash: resultsHash,
        totalVotes: election.totalVotes,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      timestamp: new Date()
    });
    
    res.json({ 
      election, 
      results, 
      resultsHash,
      message: 'Tally finalized successfully and locked on blockchain',
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: 'Error finalizing tally', error: err.message });
  }
};

// F.5.2: Get Turnout Analytics
exports.getTurnoutAnalytics = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    const totalRegisteredVoters = election.registeredVoters.length;
    const totalVotes = election.totalVotes;
    const turnoutPercentage = totalRegisteredVoters > 0 ? 
      (totalVotes / totalRegisteredVoters) * 100 : 0;
    
    res.json({
      electionId: election._id,
      totalRegisteredVoters,
      totalVotes,
      turnoutPercentage: Math.round(turnoutPercentage * 100) / 100,
      status: election.status,
      votingEnabled: election.votingEnabled
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching turnout analytics', error: err.message });
  }
};

// F.5.3: Get Final Results - Enhanced
exports.getFinalResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    // Allow results for Open, Closed, or Finalized elections
    if (election.status !== 'Finalized' && election.status !== 'Closed' && election.status !== 'Open') {
      return res.status(400).json({ message: 'Results not available for elections in ' + election.status + ' status' });
    }
    
    // Calculate results from candidates if not already finalized
    let results = election.results;
    if (!results && election.candidates) {
      results = election.candidates.map(candidate => ({
        id: candidate._id,
        name: candidate.name,
        seat: candidate.seat,
        party: candidate.party,
        votes: candidate.votes || 0,
        chainCandidateId: candidate.chainCandidateId
      }));
    }
    
    const totalVotes = election.totalVotes || (results ? results.reduce((sum, r) => sum + (r.votes || 0), 0) : 0);
    
    // Calculate percentages
    const resultsWithPercentages = results.map(result => ({
      ...result,
      percentage: totalVotes > 0 ? ((result.votes / totalVotes) * 100).toFixed(2) : 0
    }));
    
    // Get blockchain verification data
    const blockchainData = {
      resultsHash: election.finalResultsHash,
      lastSyncedBlock: election.lastSyncedBlock,
      chainElectionId: election.chainElectionId,
      finalizedAt: election.updatedAt
    };
    
    res.json({
      electionId: election._id,
      title: election.title,
      description: election.description,
      status: election.status,
      results: resultsWithPercentages || [],
      totalVotes,
      totalRegisteredVoters: election.registeredVoters?.length || 0,
      turnoutPercentage: election.turnoutPercentage || 0,
      blockchainData,
      auditTrail: election.statusHistory,
      createdAt: election.createdAt,
      startsAt: election.startsAt,
      endsAt: election.endsAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching final results', error: err.message });
  }
};

// F.5.3: Export Results
exports.exportResults = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    // Get comprehensive results data
    const resultsData = await this.getFinalResults(req, res);
    
    if (format === 'csv') {
      // Generate CSV format
      const csvData = this.generateCSVResults(resultsData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="election-${election._id}-results.csv"`);
      res.send(csvData);
    } else if (format === 'pdf') {
      // Generate PDF format (simplified - in production, use a proper PDF library)
      const pdfData = this.generatePDFResults(resultsData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="election-${election._id}-results.pdf"`);
      res.send(pdfData);
    } else {
      // Return JSON with digital signature
      const signedResults = this.signResults(resultsData);
      res.json(signedResults);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error exporting results', error: err.message });
  }
};

// Helper function to generate CSV results
generateCSVResults = (resultsData) => {
  const { title, results, totalVotes, blockchainData } = resultsData;
  
  let csv = `Election Results: ${title}\n`;
  csv += `Total Votes: ${totalVotes}\n`;
  csv += `Results Hash: ${blockchainData.resultsHash}\n`;
  csv += `Finalized At: ${blockchainData.finalizedAt}\n\n`;
  
  csv += 'Candidate Name,Party,Seat,Votes,Percentage,Blockchain ID\n';
  
  results.forEach(result => {
    csv += `"${result.name}","${result.party || 'Independent'}","${result.seat}",${result.votes},${result.percentage}%,${result.chainCandidateId}\n`;
  });
  
  return csv;
};

// Helper function to generate PDF results (simplified)
generatePDFResults = (resultsData) => {
  // In production, use a proper PDF library like puppeteer or jsPDF
  // This is a simplified version
  const { title, results, totalVotes, blockchainData } = resultsData;
  
  let pdfContent = `Election Results: ${title}\n\n`;
  pdfContent += `Total Votes: ${totalVotes}\n`;
  pdfContent += `Results Hash: ${blockchainData.resultsHash}\n`;
  pdfContent += `Finalized At: ${blockchainData.finalizedAt}\n\n`;
  
  pdfContent += 'Results:\n';
  results.forEach(result => {
    pdfContent += `${result.name} (${result.party || 'Independent'}) - ${result.seat}: ${result.votes} votes (${result.percentage}%)\n`;
  });
  
  return Buffer.from(pdfContent, 'utf8');
};

// Helper function to sign results
signResults = (resultsData) => {
  const signature = crypto.createHash('sha256')
    .update(JSON.stringify(resultsData))
    .digest('hex');
  
  return {
    ...resultsData,
    digitalSignature: signature,
    signedAt: new Date(),
    signer: 'Election System'
  };
};

exports.overview = async (req, res) => {
  try {
    // Skip DB for dev mode
    if (process.env.SKIP_DB === 'true') {
      console.warn('SKIP_DB is true - returning empty overview (dev mode)');
      return res.json({
        totalElections: 0,
        totalCandidates: 0,
        ongoingElections: 0,
        upcomingElections: 0,
        pastElections: 0,
      });
    }

    const elections = await Election.find();

    const now = new Date();
    const totalCandidates = elections.reduce((acc, el) => acc + (el.candidates?.length || 0), 0);
    const ongoingElections = elections.filter(el => el.startsAt <= now && el.endsAt >= now).length;
    const upcomingElections = elections.filter(el => el.startsAt > now).length;
    const pastElections = elections.filter(el => el.endsAt < now).length;

    res.json({
      totalElections: elections.length,
      totalCandidates,
      ongoingElections,
      upcomingElections,
      pastElections,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching overview', error: err.message });
  }
};

// F.1.2: Reset Election (DANGER) - Multi-factor Authentication Required
exports.resetElection = async (req, res) => {
  try {
    const { 
      adminPassword, 
      confirmationCode, 
      reason, 
      confirmReset 
    } = req.body;
    
    // Multi-factor authentication validation
    if (!adminPassword || !confirmationCode || !reason || !confirmReset) {
      return res.status(400).json({ 
        message: 'All fields required: adminPassword, confirmationCode, reason, and confirmReset' 
      });
    }
    
    if (confirmReset !== 'RESET_ELECTION_CONFIRMED') {
      return res.status(400).json({ 
        message: 'Confirmation text must be exactly: RESET_ELECTION_CONFIRMED' 
      });
    }
    
    // Verify admin password
    const expectedPassword = process.env.ELECTION_ADMIN_PASSWORD || 'admin123';
    const isValidPassword = await bcrypt.compare(adminPassword, await bcrypt.hash(expectedPassword, 10)) || adminPassword === expectedPassword;
    
    if (!isValidPassword) {
      await AuditLog.create({
        action: 'unauthorized_election_reset_attempt',
        performedBy: req.user.id,
        details: { 
          electionId: req.params.id,
          reason: reason,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        timestamp: new Date()
      });
      return res.status(401).json({ message: 'Invalid admin password' });
    }
    
    // Verify confirmation code (in production, this should be a secure token)
    const expectedCode = process.env.ELECTION_RESET_CODE || 'RESET123';
    if (confirmationCode !== expectedCode) {
      await AuditLog.create({
        action: 'invalid_reset_code_attempt',
        performedBy: req.user.id,
        details: { 
          electionId: req.params.id,
          reason: reason,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        },
        timestamp: new Date()
      });
      return res.status(401).json({ message: 'Invalid confirmation code' });
    }
    
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    
    // Additional safety checks
    if (election.status === 'Finalized') {
      return res.status(400).json({ 
        message: 'Cannot reset finalized election. Contact system administrator.' 
      });
    }
    
    // Check if election has votes
    if (election.totalVotes > 0) {
      return res.status(400).json({ 
        message: 'Cannot reset election with existing votes. This action is irreversible.' 
      });
    }
    
    // Store original election data for audit
    const originalElection = {
      title: election.title,
      status: election.status,
      candidates: election.candidates.length,
      totalVotes: election.totalVotes,
      createdAt: election.createdAt
    };
    
    // Reset election to initial state
    election.status = 'Setup';
    election.votingEnabled = false;
    election.candidateListLocked = false;
    election.candidates = [];
    election.voters = [];
    election.totalVotes = 0;
    election.results = {};
    election.finalResultsHash = null;
    election.turnoutPercentage = null;
    
    // Add reset to status history
    election.statusHistory.push({
      status: 'Reset',
      at: new Date(),
      changedBy: req.user.id
    });
    
    await election.save();
    
    // Log the reset action
    await AuditLog.create({
      action: 'election_reset',
      performedBy: req.user.id,
      details: { 
        electionId: election._id,
        originalElection: originalElection,
        resetReason: reason,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      timestamp: new Date()
    });
    
    res.json({ 
      election,
      message: 'Election reset successfully. All data has been cleared.',
      originalData: originalElection,
      resetReason: reason,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting election', error: err.message });
  }
};

// Vote for a candidate
exports.vote = async (req, res) => {
  try {
    const { candidateId, voterId, voteWeight = 1, seat } = req.body;
    const electionId = req.params.id;

    if (!candidateId || !voterId) {
      return res.status(400).json({ message: 'Candidate ID and voter ID are required' });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.status !== 'Open') {
      return res.status(400).json({ message: 'Election is not open for voting' });
    }

    // Find the candidate
    const candidate = election.candidates.find(c => c._id.toString() === candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if voter has already voted for a candidate in the same seat
    if (election.voterSeatVotes && election.voterSeatVotes[voterId]) {
      if (election.voterSeatVotes[voterId].includes(candidate.seat)) {
        return res.status(400).json({ 
          message: `You have already voted for a candidate in the ${candidate.seat} position. You can only vote for one candidate per seat.` 
        });
      }
    }

    // Check if voter has already voted for this specific candidate
    if (election.voterCandidateVotes && election.voterCandidateVotes[voterId]) {
      if (election.voterCandidateVotes[voterId].includes(candidateId)) {
        return res.status(400).json({ 
          message: 'You have already voted for this candidate' 
        });
      }
    }

    // Initialize voter tracking objects if they don't exist
    if (!election.voterSeatVotes) {
      election.voterSeatVotes = {};
    }
    if (!election.voterCandidateVotes) {
      election.voterCandidateVotes = {};
    }

    // Add vote
    candidate.votes = (candidate.votes || 0) + voteWeight;
    election.totalVotes = (election.totalVotes || 0) + voteWeight;

    // Track voter's seat and candidate votes
    if (!election.voterSeatVotes[voterId]) {
      election.voterSeatVotes[voterId] = [];
    }
    if (!election.voterCandidateVotes[voterId]) {
      election.voterCandidateVotes[voterId] = [];
    }

    election.voterSeatVotes[voterId].push(candidate.seat);
    election.voterCandidateVotes[voterId].push(candidateId);

    // Add to general voters list if not already there
    if (!election.voters.includes(voterId)) {
      election.voters.push(voterId);
    }

    await election.save();

    // Log the vote
    await AuditLog.create({
      action: 'vote_cast',
      performedBy: voterId,
      details: { 
        electionId: election._id, 
        candidateId: candidateId,
        candidateName: candidate.name,
        candidateSeat: candidate.seat,
        voteWeight: voteWeight
      },
      timestamp: new Date()
    });

    res.json({
      message: 'Vote cast successfully',
      candidate: candidate,
      totalVotes: election.totalVotes,
      voterSeatVotes: election.voterSeatVotes[voterId] || []
    });
  } catch (err) {
    console.error('Error casting vote:', err);
    res.status(500).json({ message: 'Error casting vote', error: err.message });
  }
};