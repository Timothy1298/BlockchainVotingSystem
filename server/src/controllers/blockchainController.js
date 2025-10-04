const { exec } = require('child_process');

exports.getConfig = async (req, res) => {
  // Return blockchain config (mocked for now)
  res.json({ blockSize: 1, miningDifficulty: 2, consensus: 'PoA', encryption: 'AES256' });
};

exports.updateConfig = async (req, res) => {
  // Update blockchain config (mocked)
  res.json({ success: true });
};

exports.listNodes = async (req, res) => {
  // Return list of nodes (mocked)
  res.json([{ id: 'node1', status: 'active' }, { id: 'node2', status: 'active' }]);
};

exports.addNode = async (req, res) => {
  // Add node (mocked)
  res.json({ success: true });
};

exports.removeNode = async (req, res) => {
  // Remove node (mocked)
  res.json({ success: true });
};

exports.txPool = async (req, res) => {
  // Return pending transactions (mocked)
  res.json([{ tx: '0xabc', status: 'pending' }]);
};

exports.setEncryption = async (req, res) => {
  // Enable/disable encryption (mocked)
  res.json({ success: true });
};

exports.fraudAlerts = async (req, res) => {
  // Return fraud alerts (mocked)
  res.json([{ id: 1, type: 'double-vote', resolved: false }]);
};

exports.backup = async (req, res) => {
  // Data backup (mocked)
  res.json({ success: true });
};

exports.restore = async (req, res) => {
  // Data restore (mocked)
  res.json({ success: true });
};
const BlockchainStatus = require('../models/BlockchainStatus');

exports.getStatus = async (req, res) => {
  const latest = await BlockchainStatus.findOne().sort({ updatedAt: -1 });
  res.json(latest || {});
};

exports.updateStatus = async (req, res) => {
  const status = new BlockchainStatus(req.body);
  await status.save();
  res.status(201).json(status);
};
