const Election = require('../models/Election');
const logger = require('../utils/logger');

// Mock blockchain interaction - replace with actual Web3 calls
const mockBlockchainSync = async (electionId) => {
  // In a real implementation, this would:
  // 1. Connect to the blockchain
  // 2. Read the smart contract state
  // 3. Get candidate vote counts
  // 4. Compare with database values
  
  logger.info(`Syncing election ${electionId} with blockchain...`);
  
  // Mock blockchain data
  const blockchainData = {
    totalVotes: 150,
    candidates: [
      { id: 1, name: 'Candidate A', votes: 75 },
      { id: 2, name: 'Candidate B', votes: 60 },
      { id: 3, name: 'Candidate C', votes: 15 }
    ]
  };
  
  return blockchainData;
};

const syncElectionTally = async (electionId) => {
  try {
    const election = await Election.findById(electionId);
    if (!election) {
      logger.error(`Election ${electionId} not found for sync`);
      return;
    }

    // Get blockchain data
    const blockchainData = await mockBlockchainSync(electionId);
    
    // Update database with blockchain data
    const updatePromises = election.candidates.map(async (candidate) => {
      const blockchainCandidate = blockchainData.candidates.find(
        bc => bc.name === candidate.name
      );
      
      if (blockchainCandidate && blockchainCandidate.votes !== candidate.votes) {
        logger.info(`Updating ${candidate.name}: ${candidate.votes} -> ${blockchainCandidate.votes}`);
        candidate.votes = blockchainCandidate.votes;
      }
    });

    await Promise.all(updatePromises);
    
    // Update total votes
    if (election.totalVotes !== blockchainData.totalVotes) {
      logger.info(`Updating total votes: ${election.totalVotes} -> ${blockchainData.totalVotes}`);
      election.totalVotes = blockchainData.totalVotes;
    }

    await election.save();
    logger.info(`Successfully synced election ${electionId}`);
    
  } catch (error) {
    logger.error(`Error syncing election ${electionId}:`, error);
  }
};

const syncAllElections = async () => {
  try {
    const elections = await Election.find({ votingEnabled: true });
    logger.info(`Starting sync for ${elections.length} active elections`);
    
    const syncPromises = elections.map(election => syncElectionTally(election._id));
    await Promise.all(syncPromises);
    
    logger.info('Completed sync for all elections');
  } catch (error) {
    logger.error('Error in sync all elections:', error);
  }
};

// Schedule sync job (runs every 5 minutes)
const startTallySyncJob = () => {
  logger.info('Starting tally sync job - running every 5 minutes');
  
  // Run immediately on startup
  syncAllElections();
  
  // Schedule recurring sync
  setInterval(syncAllElections, 5 * 60 * 1000); // 5 minutes
};

module.exports = {
  syncElectionTally,
  syncAllElections,
  startTallySyncJob
};
