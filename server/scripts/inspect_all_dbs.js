#!/usr/bin/env node
// server/scripts/inspect_all_dbs.js
// Connect to MongoDB server, list databases, and check for users in each DB
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_HOST = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017');

async function inspect() {
  try {
    // Connect to admin (no specific dbName) using mongoose
    await mongoose.connect(MONGO_HOST, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to Mongo host:', MONGO_HOST);

    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Databases on server:');
    for (const dbInfo of dbs.databases) {
      const dbName = dbInfo.name;
      try {
        // Create a separate connection to the DB to query users collection
        const conn = await mongoose.createConnection(MONGO_HOST, { dbName, useNewUrlParser: true, useUnifiedTopology: true });
        const users = await conn.db.collection('users').find().project({ email: 1, role: 1 }).limit(50).toArray();
        console.log(`- ${dbName}: users=${users.length}`);
        users.forEach(u => console.log(`   • ${u.email} | role=${u.role} | db=${dbName}`));
        await conn.close();
      } catch (err) {
        console.warn(`  Could not inspect ${dbName}:`, err.message || err);
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error inspecting DBs:', err);
    process.exit(1);
  }
}

if (require.main === module) inspect();
