// server/scripts/create_users.js
// Create 'voting_system' database and add an admin and a voter user per User schema

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const User = require(path.join(__dirname, '..', 'src', 'models', 'User'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'voting_system';

async function ensureConnected() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME, family: 4 });
  console.log('Connected to MongoDB', `${MONGO_URI}/${DB_NAME}`);
}

async function createIfMissing(userData) {
  const existing = await User.findOne({ email: userData.email });
  if (existing) {
    console.log('User already exists:', userData.email);
    return existing;
  }
  const hashed = await bcrypt.hash(userData.password, 10);
  const toCreate = Object.assign({}, userData, { password: hashed });
  const created = await User.create(toCreate);
  console.log('Created user:', created.email, 'role=', created.role);
  return created;
}

async function run() {
  try {
    await ensureConnected();

    console.log('Creating admin user...');
    await createIfMissing({
      fullName: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@voting.local',
      password: process.env.ADMIN_PASSWORD || 'adminpass123',
      role: 'admin'
    });

    console.log('Creating voter user...');
    await createIfMissing({
      fullName: 'Voter User',
      email: process.env.VOTER_EMAIL || 'voter@voting.local',
      password: process.env.VOTER_PASSWORD || 'voterpass123',
      role: 'voter',
      isRegistered: true,
      studentId: process.env.VOTER_STUDENT_ID || 'S12345678',
      walletAddress: (process.env.VOTER_WALLET || '').toLowerCase() || null
    });

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create users:', err);
    process.exit(1);
  }
}

if (require.main === module) run();
