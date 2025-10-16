/* Minimal seed script: creates an admin user and a sample election */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { MONGO_URI, ADMIN_REGISTRATION_KEY, JWT_SECRET } = process.env;

if (!MONGO_URI) {
  console.error('MONGO_URI is not set');
  process.exit(1);
}

// Use app models so seeded documents match runtime expectations
const User = require('../src/models/User');
const Election = require('../src/models/Election');

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding');

  // create admin in the real users collection
  const adminEmail = 'admin@example.com';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const hashed = await bcrypt.hash('password123', 10);
    const admin = new User({ fullName: 'Admin', email: adminEmail, password: hashed, role: 'admin' });
    await admin.save();
    console.log('Created admin user:', adminEmail);
  } else {
    console.log('Admin user already exists');
  }

  // create sample election
  const sampleTitle = 'Sample Election';
  const ee = await Election.findOne({ title: sampleTitle });
  if (!ee) {
    const electionDoc = new Election({
      title: sampleTitle,
      description: 'Seeded sample election',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 86400000),
      electionType: 'single-seat',
      seats: 1,
      candidates: [
        { name: 'Alice', label: 'A', seat: 'President' },
        { name: 'Bob', label: 'B', seat: 'President' }
      ]
    });
    await electionDoc.save();
    console.log('Created sample election');
  } else {
    console.log('Sample election already exists');
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

run().catch(err => { console.error('Seed error', err); process.exit(1); });
