const mongoose = require('mongoose');
const SystemLog = require('../src/models/SystemLog');
const Notification = require('../src/models/Notification');
const config = require('../src/config');

async function seedSystemLogs() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing logs
    await SystemLog.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing logs and notifications');

    // Create sample system logs
    const sampleLogs = [
      {
        component: 'authentication',
        action: 'user_login',
        level: 'info',
        message: 'User admin@voting.com logged in successfully',
        details: { ip: '127.0.0.1', userAgent: 'Mozilla/5.0' },
        timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
      },
      {
        component: 'election',
        action: 'election_created',
        level: 'info',
        message: 'New election "Presidential Election 2024" created',
        details: { electionId: '68f1170943007f0d2a062631', title: 'Presidential Election 2024' },
        timestamp: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
      },
      {
        component: 'blockchain',
        action: 'contract_deployed',
        level: 'info',
        message: 'Voting contract deployed successfully',
        details: { contractAddress: '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab', network: 'ganache' },
        timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
      },
      {
        component: 'voting',
        action: 'vote_cast',
        level: 'info',
        message: 'Vote cast successfully for candidate John Doe',
        details: { electionId: '68f1170943007f0d2a062631', candidateId: 'candidate1', voterId: '68f111067d70d3a01d5c04c7' },
        timestamp: new Date(Date.now() - 1000 * 60 * 20) // 20 minutes ago
      },
      {
        component: 'system',
        action: 'server_start',
        level: 'info',
        message: 'Server started successfully on port 5000',
        details: { port: 5000, environment: 'development' },
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        component: 'database',
        action: 'connection_established',
        level: 'info',
        message: 'MongoDB connection established',
        details: { host: 'localhost', port: 27017, database: 'voting_system' },
        timestamp: new Date(Date.now() - 1000 * 60 * 35) // 35 minutes ago
      },
      {
        component: 'security',
        action: 'failed_login_attempt',
        level: 'warn',
        message: 'Failed login attempt detected',
        details: { ip: '192.168.1.100', email: 'unknown@example.com', reason: 'invalid_credentials' },
        timestamp: new Date(Date.now() - 1000 * 60 * 40) // 40 minutes ago
      },
      {
        component: 'blockchain',
        action: 'connection_error',
        level: 'error',
        message: 'Blockchain connection failed - using fallback mode',
        details: { error: 'ECONNREFUSED', endpoint: 'http://127.0.0.1:8545' },
        timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
      }
    ];

    // Create sample notifications
    const sampleNotifications = [
      {
        type: 'system',
        title: 'System Warning: Blockchain Connection',
        message: 'Blockchain connection failed - using fallback mode',
        severity: 'high',
        metadata: { component: 'blockchain', action: 'connection_error' },
        createdAt: new Date(Date.now() - 1000 * 60 * 45)
      },
      {
        type: 'security',
        title: 'Security Alert: Failed Login',
        message: 'Multiple failed login attempts detected from IP 192.168.1.100',
        severity: 'medium',
        metadata: { ip: '192.168.1.100', attempts: 3 },
        createdAt: new Date(Date.now() - 1000 * 60 * 40)
      },
      {
        type: 'election',
        title: 'Election Update',
        message: 'New election "Presidential Election 2024" has been created',
        severity: 'low',
        metadata: { electionId: '68f1170943007f0d2a062631', title: 'Presidential Election 2024' },
        createdAt: new Date(Date.now() - 1000 * 60 * 10)
      }
    ];

    // Insert logs
    await SystemLog.insertMany(sampleLogs);
    console.log(`Created ${sampleLogs.length} system logs`);

    // Insert notifications
    await Notification.insertMany(sampleNotifications);
    console.log(`Created ${sampleNotifications.length} notifications`);

    console.log('✅ System logs and notifications seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding system logs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedSystemLogs();
