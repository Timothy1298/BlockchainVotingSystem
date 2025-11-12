#!/usr/bin/env node
// server/scripts/inspect_users.js
// Inspect users in the configured MongoDB and print summary
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const User = require(path.join(__dirname, '..', 'src', 'models', 'User'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'voting_system';

async function listUsers() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME, family: 4 });
    console.log('Connected to MongoDB', `${MONGO_URI}/${DB_NAME}`);
    const users = await User.find().lean();
    if (!users || users.length === 0) {
      console.log('No users found in', DB_NAME);
    } else {
      console.log(`Found ${users.length} user(s):`);
      users.forEach(u => {
        console.log(`- ${u.email} | role=${u.role} | _id=${u._id} | registered=${u.isRegistered || false} | wallet=${u.walletAddress || 'N/A'}`);
      });
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error listing users:', err);
    process.exit(1);
  }
}

if (require.main === module) listUsers();
