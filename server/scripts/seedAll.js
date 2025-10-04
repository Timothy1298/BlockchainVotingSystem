// server/scripts/seedAll.js
// Run with: node server/scripts/seedAll.js
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const User = require('../src/models/User');
const Voter = require('../src/models/Voter');
const Election = require('../src/models/Election');
const CandidateDocument = require('../src/models/CandidateDocument');
const Notification = require('../src/models/Notification');
const SystemLog = require('../src/models/SystemLog');
const BlockchainStatus = require('../src/models/BlockchainStatus');
const Ballot = require('../src/models/Ballot');
const Session = require('../src/models/Session');
const ApiKey = require('../src/models/ApiKey');
const AuditLog = require('../src/models/AuditLog');
const TwoFA = require('../src/models/TwoFA');


const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Error: Please set the MONGO_URI environment variable to your MongoDB Atlas connection string.');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Clear relevant collections to avoid duplicates
  await Promise.all([
    User.deleteMany({}),
    Voter.deleteMany({}),
    Election.deleteMany({}),
    CandidateDocument.deleteMany({}),
    Notification.deleteMany({}),
    SystemLog.deleteMany({}),
    BlockchainStatus.deleteMany({}),
    Ballot.deleteMany({}),
    Session.deleteMany({}),
    ApiKey.deleteMany({}),
    AuditLog.deleteMany({}),
    TwoFA.deleteMany({})
  ]);
  // 1. Add 30 random voters (User and Voter)
  const voters = [];
  for (let i = 0; i < 30; i++) {
    const user = new User({
  fullName: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: 'voter',
      isActive: true,
    });
    await user.save();
    const voter = new Voter({
      user: user._id,
  studentId: faker.string.uuid(),
      faculty: faker.commerce.department(),
  year: faker.number.int({ min: 1, max: 4 }),
      eligible: true,
    });
    await voter.save();
    voters.push({ user, voter });
  }

  // 2. Create a general election with all seats and 4 candidates per seat
  const seats = ['President', 'Vice President', 'Secretary', 'Treasurer', 'PRO'];
  const election = new Election({
    title: 'General Election',
    electionType: 'Student Union',
    description: 'University-wide general election for all major seats.',
    seats,
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    status: 'active',
    results: {},
  });
  await election.save();

  // 3. Add 4 candidates for each seat
  for (const seat of seats) {
    for (let i = 0; i < 4; i++) {
      const candidateUser = new User({
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'voter',
        isActive: true,
      });
      await candidateUser.save();
      await CandidateDocument.create({
        candidateId: candidateUser._id,
        electionId: election._id,
        url: faker.internet.url(),
        type: 'manifesto',
      });
    }
  }

  // 4. Add 15 notifications
  for (let i = 0; i < 15; i++) {
    await Notification.create({
      title: faker.lorem.sentence(),
      message: faker.lorem.sentences(2),
  type: faker.helpers.arrayElement(['info', 'alert', 'warning', 'success']),
      read: false,
      createdAt: faker.date.recent(10),
    });
  }

  // 5. Add sample data to other models
  await SystemLog.create({
    action: 'System initialized',
    user: voters[0].user._id,
    timestamp: new Date(),
    details: 'Initial system setup.'
  });
  await BlockchainStatus.create({
    status: 'healthy',
    lastBlock: 123456,
    nodeCount: 5,
    lastChecked: new Date(),
  });
  await Ballot.create({
    voter: voters[1].voter._id,
    election: election._id,
    choices: seats.map(seat => ({ seat, candidate: null })),
    submitted: false,
  });
  await Session.create({
    user: voters[2].user._id,
  token: faker.string.uuid(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  });
  await ApiKey.create({
    user: voters[3].user._id,
  key: faker.string.uuid(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  });
  await AuditLog.create({
    action: 'Seed data created',
    user: voters[0].user._id,
    timestamp: new Date(),
    details: 'Database seeded with test data.'
  });
  await TwoFA.create({
    user: voters[4].user._id,
    secret: faker.internet.password(),
    enabled: true,
  });

  console.log('Database seeded successfully!');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
