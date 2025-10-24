const mongoose = require('mongoose');
const BlockchainStatus = require('../src/models/BlockchainStatus');
const config = require('../src/config');

async function seedBlockchainStatus() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing blockchain status
    await BlockchainStatus.deleteMany({});
    console.log('Cleared existing blockchain status');

    // Create sample blockchain status records
    const sampleStatuses = [
      {
        nodeUrl: 'http://127.0.0.1:8545',
        isHealthy: false,
        lastChecked: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        blockNumber: 0,
        networkId: 1337,
        gasPrice: '20000000000',
        peerCount: 0,
        syncStatus: 'disconnected',
        responseTime: 0,
        errorMessage: 'ECONNREFUSED - Ganache not running',
        createdAt: new Date(Date.now() - 1000 * 60 * 5)
      },
      {
        nodeUrl: 'http://127.0.0.1:8545',
        isHealthy: true,
        lastChecked: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        blockNumber: 15,
        networkId: 1337,
        gasPrice: '20000000000',
        peerCount: 0,
        syncStatus: 'synced',
        responseTime: 45,
        errorMessage: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        nodeUrl: 'http://127.0.0.1:8545',
        isHealthy: true,
        lastChecked: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        blockNumber: 12,
        networkId: 1337,
        gasPrice: '20000000000',
        peerCount: 0,
        syncStatus: 'synced',
        responseTime: 38,
        errorMessage: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60)
      }
    ];

    // Insert blockchain status records
    await BlockchainStatus.insertMany(sampleStatuses);
    console.log(`Created ${sampleStatuses.length} blockchain status records`);

    console.log('✅ Blockchain status seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding blockchain status:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedBlockchainStatus();
