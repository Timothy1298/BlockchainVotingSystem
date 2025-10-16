export const getMetrics = async () => {
  // simple prometheus text
  return `events_processed_total 42\nprocessed_blocks 128`;
};
export const getBlockchainStatus = async () => ({ blockNumber: 128, txCount: 200, latestHash: '0xabc', nodes: 2 });
export const createElection = async (payload) => ({ id: 'mock-eid', ...payload });
export const previewElectionOnChain = async (id) => ({ onChain: true, id });
export const checkVoterEligibility = async (voterId) => ({ eligible: voterId === 'allowed', reason: voterId === 'allowed' ? null : 'Not found' });
export const uploadEligibilityFile = async (file) => ({ message: 'uploaded' });
export default {
  getMetrics,
  getBlockchainStatus,
  createElection,
  previewElectionOnChain,
  checkVoterEligibility,
  uploadEligibilityFile,
};
