const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// Normalize status helpers
const norm = (s) => String(s || '').toLowerCase();

// Attempt to transition elections based on startsAt/endsAt timestamps.
const checkAndTransition = async () => {
  try {
    const now = new Date();
    // Fetch elections that have startsAt or endsAt defined
    const elections = await Election.find({ $or: [ { startsAt: { $exists: true } }, { endsAt: { $exists: true } } ] });
    if (!elections || elections.length === 0) return;

    for (const election of elections) {
      try {
        const current = norm(election.status);
        const startsAt = election.startsAt ? new Date(election.startsAt) : null;
        const endsAt = election.endsAt ? new Date(election.endsAt) : null;

        // If election should open
        if (startsAt && now >= startsAt && !['open'].includes(current)) {
          // Only open if candidate list locked and there is at least one candidate
          if (election.candidateListLocked && (Array.isArray(election.candidates) && election.candidates.length > 0)) {
            const old = election.status;
            election.status = 'Open';
            election.votingEnabled = true;
            election.statusHistory = election.statusHistory || [];
            election.statusHistory.push({ status: 'Open', at: new Date(), changedBy: null });
            await election.save();
            logger.info(`Auto-opened election ${election._id} (${election.title})`);
            await AuditLog.create({ action: 'election_auto_open', performedBy: null, details: { electionId: election._id, oldStatus: old, newStatus: 'Open' }, timestamp: new Date() });
          } else {
            logger.debug(`Election ${election._id} ready to open but candidate list not locked or no candidates`);
          }
        }

        // If election should close
        if (endsAt && now >= endsAt && ['open'].includes(current)) {
          const old = election.status;
          election.status = 'Closed';
          election.votingEnabled = false;
          election.statusHistory = election.statusHistory || [];
          election.statusHistory.push({ status: 'Closed', at: new Date(), changedBy: null });
          await election.save();
          logger.info(`Auto-closed election ${election._id} (${election.title})`);
          await AuditLog.create({ action: 'election_auto_close', performedBy: null, details: { electionId: election._id, oldStatus: old, newStatus: 'Closed' }, timestamp: new Date() });
        }

      } catch (err) {
        logger.error('Error processing election in scheduler:', err);
      }
    }

  } catch (err) {
    logger.error('Error running status scheduler:', err);
  }
};

const startStatusScheduler = () => {
  logger.info('Starting election status scheduler (runs every 60s)');
  // Run once immediately
  checkAndTransition();
  // Schedule
  setInterval(checkAndTransition, 60 * 1000);
};

module.exports = { startStatusScheduler, checkAndTransition };
