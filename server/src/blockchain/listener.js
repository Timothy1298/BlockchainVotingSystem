const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const Election = require('../models/Election');
const SystemLog = require('../models/SystemLog');
const SyncState = require('../models/SyncState');
const ProcessedEvent = require('../models/ProcessedEvent');
const logger = require('../utils/logger');
const config = require('../config');
const metrics = require('../utils/metrics');

let provider = null;
let contract = null;

// Simple in-memory FIFO queue for sequential processing (keeps implementation dependency-free)
const eventQueue = [];
let queueRunning = false;

function enqueueEvent(task) {
  eventQueue.push({ task, attempts: 0, nextDelay: 100 });
  if (!queueRunning) runQueueWorker();
}

async function runQueueWorker() {
  queueRunning = true;
  while (eventQueue.length > 0) {
    const item = eventQueue.shift();
    try {
      await handleEventTask(item.task);
      metrics.inc('events_processed_total');
    } catch (err) {
      item.attempts += 1;
      metrics.inc('events_failed_total');
      logger.warn('Event task failed (attempt %d): %s', item.attempts, err?.message || err);
      if (item.attempts < 5) {
        // exponential backoff
        await new Promise(r => setTimeout(r, item.nextDelay));
        item.nextDelay = Math.min(5000, item.nextDelay * 2);
        eventQueue.push(item);
      } else {
        // persist failure to SystemLog
        await SystemLog.create({ component: 'blockchain-listener', level: 'error', details: { error: err?.message || String(err), task: item.task } });
      }
    }
  }
  queueRunning = false;
}

async function handleEventTask(event) {
  // idempotency: check ProcessedEvent by txHash+logIndex
  const { txHash, logIndex } = event;
  if (!txHash) {
    // if no txHash, fall back to blockNumber+election+candidate
  } else {
    const exists = await ProcessedEvent.findOne({ txHash, logIndex });
    if (exists) {
      logger.debug('Skipping already-processed event %s:%s', txHash, logIndex);
      return;
    }
  }

  // process
  await processVoteEvent(event);

  // mark processed
  try {
    await ProcessedEvent.create({ txHash: txHash || '', logIndex: logIndex || 0, processedAt: new Date(), meta: { electionId: event.electionId, candidateId: event.candidateId } });
  } catch (e) {
    // duplicate key or write error are non-fatal
    logger.debug('ProcessedEvent create: %s', e?.message || e);
  }
}

async function init() {
  if (config.blockchainMock) {
    logger.info('Blockchain listener not started in mock mode');
    return;
  }

  try {
    const rpc = config.blockchainRpc || 'http://127.0.0.1:8545';
    provider = new ethers.JsonRpcProvider(rpc);

    // locate artifact
    const candidatePaths = [
      path.join(__dirname, '..', '..', 'artifacts', 'contracts', 'Voting.sol', 'Voting.json'),
      path.join(__dirname, '..', '..', 'artifacts', 'Voting.json'),
      path.join(__dirname, '..', '..', 'artifacts', 'contracts', 'SimpleVoting.sol', 'SimpleVoting.json'),
      path.join(__dirname, '..', '..', 'blockchain', 'build', 'contracts', 'Voting.json'),
      path.join(__dirname, '..', '..', 'blockchain', 'build', 'Voting.json'),
    ];
    const found = candidatePaths.find(p => fs.existsSync(p));
    if (!found) {
      logger.warn('Voting artifact not found; listener disabled');
      return;
    }
    const Artifact = require(found);
    const addr = config.votingContractAddress;
    if (!addr) {
      logger.warn('VOTING_CONTRACT_ADDRESS not set; listener disabled');
      return;
    }

    contract = new ethers.Contract(addr, Artifact.abi || Artifact.abi, provider);
    logger.info('Blockchain listener connected to %s', addr);

    // Determine vote event fragment in a safe way (some ethers.Interface shapes differ)
    let eventFragment = null;
    try {
      // Prefer explicit VoteCast name present in our contracts
      eventFragment = contract.interface.getEvent('VoteCast');
    } catch (err) {
      try {
        // Fallback to older/alternate name 'Vote'
        eventFragment = contract.interface.getEvent('Vote');
      } catch (err2) {
        eventFragment = null;
      }
    }

    if (!eventFragment) {
      logger.warn('Contract has no Vote/VoteCast event; listener not started');
      return;
    }

    // load last processed block
    const stateName = `voting:${addr}`;
    let state = await SyncState.findOne({ name: stateName });
    let fromBlock = (state && state.lastProcessedBlock) ? state.lastProcessedBlock + 1 : 0;

    const latest = await provider.getBlockNumber();
    logger.info('Rescanning chain events from %d to %d', fromBlock, latest);

    // Build topic for event (ethers v6 compatible)
    const topic = eventFragment.topicHash || ethers.id(eventFragment.format());

    if (fromBlock <= latest) {
      try {
        const logs = await provider.getLogs({ address: addr, topics: [topic], fromBlock, toBlock: latest });
        logger.info('Found %d past Vote logs to process', logs.length);
        for (const log of logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            const electionId = Number(parsed.args[0]?.toString?.() || parsed.args[0]);
            const candidateId = Number(parsed.args[1]?.toString?.() || parsed.args[1]);
            const voter = parsed.args[2] || null;
            const blockNumber = log.blockNumber;
            enqueueEvent({ electionId, candidateId, voter, txHash: log.transactionHash, blockNumber, logIndex: log.logIndex });
            // update state optimistically - will be updated after processing worker ensures progress
            state = state || new SyncState({ name: stateName });
            state.lastProcessedBlock = blockNumber;
            state.updatedAt = new Date();
            await state.save();
          } catch (errInner) {
            logger.error('Failed to queue historical log: %s', errInner?.message || errInner);
            await SystemLog.create({ component: 'blockchain-listener', level: 'error', details: { error: errInner?.message } });
          }
        }
      } catch (errLogs) {
        logger.error('Error fetching logs for rescan: %s', errLogs?.message || errLogs);
      }
    }

    // subscribe to new events
    provider.on({ address: addr, topics: [topic] }, async (log) => {
      try {
        const parsed = contract.interface.parseLog(log);
        const electionId = Number(parsed.args[0]?.toString?.() || parsed.args[0]);
        const candidateId = Number(parsed.args[1]?.toString?.() || parsed.args[1]);
        const voter = parsed.args[2] || null;
        const blockNumber = log.blockNumber;
        enqueueEvent({ electionId, candidateId, voter, txHash: log.transactionHash, blockNumber, logIndex: log.logIndex });
        // update state optimistically
        state = state || new SyncState({ name: stateName });
        state.lastProcessedBlock = blockNumber;
        state.updatedAt = new Date();
        await state.save();
      } catch (err) {
        logger.error('Error queuing live log: %s', err?.message || err);
        await SystemLog.create({ component: 'blockchain-listener', level: 'error', details: { error: err?.message } });
      }
    });
  } catch (err) {
    logger.error('Failed to start blockchain listener: %s', err?.message || err);
  }
}

module.exports = { init, processVoteEvent };

async function processVoteEvent({ electionId, candidateId, voter, txHash, blockNumber }) {
  try {
    // Find DB election by chainElectionId or chainId
    const election = await Election.findOne({ $or: [{ chainElectionId: electionId }, { chainId: electionId }] });
    if (!election) return;

    const cand = election.candidates.find(c => c.chainCandidateId === candidateId || Number(c._id) === candidateId || String(c._id) === String(candidateId));
    if (!cand) return;

    const voterKey = String(voter || txHash || `${blockNumber}`);
    // atomic update
    const filterQ = { _id: election._id, voters: { $ne: voterKey }, 'candidates._id': cand._id };
    const updateQ = { $inc: { 'candidates.$.votes': 1 }, $push: { voters: voterKey }, $set: { lastSyncedBlock: blockNumber } };
    const result = await Election.updateOne(filterQ, updateQ);
    if (result.modifiedCount > 0) {
      await SystemLog.create({ component: 'blockchain-listener', level: 'info', details: { electionId: election._id, candidateId: cand._id, voter: voterKey, tx: txHash } });
    }
  } catch (err) {
    logger.error('processVoteEvent error: %s', err?.message || err);
    await SystemLog.create({ component: 'blockchain-listener', level: 'error', details: { error: err?.message } });
    throw err;
  }
}
