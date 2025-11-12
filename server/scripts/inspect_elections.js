#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const Election = require(path.join(__dirname, '..', 'src', 'models', 'Election'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'voting_system';

async function listElections() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME, family: 4 });
    console.log('Connected to MongoDB', `${MONGO_URI}/${DB_NAME}`);
    const elections = await Election.find().lean();
    if (!elections || elections.length === 0) {
      console.log('No elections found in', DB_NAME);
    } else {
      console.log(`Found ${elections.length} election(s):`);
      elections.forEach(e => {
        console.log(`- ${e.title} | status=${e.status} | id=${e._id} | startsAt=${e.startsAt || 'n/a'} | endsAt=${e.endsAt || 'n/a'}`);
      });
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error listing elections:', err);
    process.exit(1);
  }
}

if (require.main === module) listElections();
