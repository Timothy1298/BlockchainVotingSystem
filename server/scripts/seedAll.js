const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../src/config');

// Import all models
const User = require('../src/models/User');
const Election = require('../src/models/Election');
const Voter = require('../src/models/Voter');
const Notification = require('../src/models/Notification');
const SystemLog = require('../src/models/SystemLog');
const BlockchainStatus = require('../src/models/BlockchainStatus');

// Enhanced sample data
const adminUser = {
  fullName: 'System Administrator',
  email: 'admin@voting.com',
  password: 'admin123',
  role: 'admin',
  studentId: 'ADMIN001',
  faculty: 'Administration',
  nationalId: 'ADMIN_NID',
  contact: '+1234567899',
  eligibility: 'Eligible'
};

const sampleUsers = [
  {
    fullName: 'John Smith',
    email: 'john.smith@university.edu',
    password: 'password123',
    role: 'voter',
    studentId: 'STU001',
    faculty: 'Computer Science',
    nationalId: 'NID001',
    contact: '+1234567890',
    eligibility: 'Eligible'
  },
  {
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    password: 'password123',
    role: 'voter',
    studentId: 'STU002',
    faculty: 'Engineering',
    nationalId: 'NID002',
    contact: '+1234567891',
    eligibility: 'Eligible'
  },
  {
    fullName: 'Michael Brown',
    email: 'michael.brown@university.edu',
    password: 'password123',
    role: 'voter',
    studentId: 'STU003',
    faculty: 'Business',
    nationalId: 'NID003',
    contact: '+1234567892',
    eligibility: 'Eligible'
  },
  {
    fullName: 'Emily Davis',
    email: 'emily.davis@university.edu',
    password: 'password123',
    role: 'voter',
    studentId: 'STU004',
    faculty: 'Medicine',
    nationalId: 'NID004',
    contact: '+1234567893',
    eligibility: 'Eligible'
  },
  {
    fullName: 'David Wilson',
    email: 'david.wilson@university.edu',
    password: 'password123',
    role: 'voter',
    studentId: 'STU005',
    faculty: 'Law',
    nationalId: 'NID005',
    contact: '+1234567894',
    eligibility: 'Eligible'
  },
  {
    fullName: 'Lisa Anderson',
    email: 'lisa.anderson@university.edu',
    password: 'password123',
    role: 'voter',
    studentId: 'STU006',
    faculty: 'Arts',
    nationalId: 'NID006',
    contact: '+1234567895',
    eligibility: 'Eligible'
  },
  {
    fullName: 'Robert Taylor',
    email: 'robert.taylor@university.edu',
    password: 'password123',
    role: 'voter',
    studentId: 'STU007',
    faculty: 'Science',
    nationalId: 'NID007',
    contact: '+1234567896',
    eligibility: 'Eligible'
  },
  {
    fullName: 'Jennifer Martinez',
    email: 'jennifer.martinez@university.edu',
    password: 'password123',
    role: 'voter',
    studentId: 'STU008',
    faculty: 'Education',
    nationalId: 'NID008',
    contact: '+1234567897',
    eligibility: 'Eligible'
  },
  {
    fullName: 'Christopher Lee',
    email: 'chris.lee@university.edu',
    password: 'password123',
    role: 'voter',
    studentId: 'STU009',
    faculty: 'Computer Science',
    nationalId: 'NID009',
    contact: '+1234567898',
    eligibility: 'Eligible'
  },
  {
    fullName: 'Amanda White',
    email: 'amanda.white@university.edu',
    password: 'password123',
    role: 'voter',
    studentId: 'STU010',
    faculty: 'Engineering',
    nationalId: 'NID010',
    contact: '+1234567899',
    eligibility: 'Eligible'
  }
];

const sampleElections = [
  {
    title: 'Student Union Presidential Election 2024',
    description: 'Annual election for Student Union President and Vice President positions. This election will determine the leadership for the upcoming academic year.',
    electionType: 'Student Union',
    seats: ['President', 'Vice President'],
    startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    status: 'Setup',
    votingEnabled: false,
    candidateListLocked: false,
    totalVotes: 0,
    rules: {
      oneVotePerId: true,
      anonymous: true,
      eligibility: 'registered'
    },
    phases: [
      { name: 'Registration', startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { name: 'Campaigning', startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { name: 'Voting', startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    ],
    ballotStructure: 'single',
    candidates: [
      {
        name: 'Alex Thompson',
        seat: 'President',
        bio: 'Experienced student leader with 2 years in student government. Majoring in Political Science with a focus on student advocacy.',
        manifesto: 'Focus on student welfare, campus improvements, and academic support. I will work to reduce tuition costs and improve campus facilities.',
        party: 'Progressive Students',
        position: 'President',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/007bff/ffffff?text=AT'
      },
      {
        name: 'Maria Garcia',
        seat: 'President',
        bio: 'Passionate advocate for student rights and campus diversity. International student from Spain, majoring in International Relations.',
        manifesto: 'Promote inclusivity, sustainability, and student engagement. I will ensure all voices are heard and represented.',
        party: 'Unity Coalition',
        position: 'President',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/28a745/ffffff?text=MG'
      },
      {
        name: 'James Lee',
        seat: 'Vice President',
        bio: 'Tech-savvy student with experience in event organization. Computer Science major with a passion for student activities.',
        manifesto: 'Digital transformation of student services and events. I will modernize our approach to student engagement.',
        party: 'Progressive Students',
        position: 'Vice President',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/17a2b8/ffffff?text=JL'
      },
      {
        name: 'Sophie Chen',
        seat: 'Vice President',
        bio: 'Active in community service and student clubs. Psychology major with strong leadership experience.',
        manifesto: 'Strengthen community ties and support student initiatives. I will focus on mental health and student support services.',
        party: 'Unity Coalition',
        position: 'Vice President',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/ffc107/ffffff?text=SC'
      }
    ]
  },
  {
    title: 'Faculty Representative Election 2024',
    description: 'Election for faculty representatives to the Academic Senate. These representatives will voice student concerns in academic matters.',
    electionType: 'Faculty Representative',
    seats: ['Computer Science Rep', 'Engineering Rep', 'Business Rep'],
    startsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    status: 'Open',
    votingEnabled: true,
    candidateListLocked: true,
    totalVotes: 0,
    rules: {
      oneVotePerId: true,
      anonymous: true,
      eligibility: 'registered'
    },
    phases: [
      { name: 'Registration', startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { name: 'Campaigning', startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { name: 'Voting', startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }
    ],
    ballotStructure: 'multiple',
    candidates: [
      {
        name: 'Dr. Sarah Williams',
        seat: 'Computer Science Rep',
        bio: 'Professor of Computer Science with 10 years experience. Specializes in AI and Machine Learning.',
        manifesto: 'Advance computer science curriculum and research opportunities. Focus on industry partnerships and practical skills.',
        party: 'Academic Excellence',
        position: 'Computer Science Rep',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/6f42c1/ffffff?text=SW'
      },
      {
        name: 'Dr. Michael Johnson',
        seat: 'Computer Science Rep',
        bio: 'Associate Professor specializing in AI and Machine Learning. Published researcher with industry connections.',
        manifesto: 'Promote cutting-edge research and industry partnerships. Modernize curriculum with latest technologies.',
        party: 'Innovation Forward',
        position: 'Computer Science Rep',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/dc3545/ffffff?text=MJ'
      },
      {
        name: 'Dr. Emily Rodriguez',
        seat: 'Engineering Rep',
        bio: 'Professor of Mechanical Engineering with expertise in sustainable design and renewable energy.',
        manifesto: 'Enhance engineering programs and student support. Focus on sustainability and practical applications.',
        party: 'Academic Excellence',
        position: 'Engineering Rep',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/20c997/ffffff?text=ER'
      },
      {
        name: 'Dr. David Kim',
        seat: 'Engineering Rep',
        bio: 'Associate Professor of Civil Engineering with focus on smart cities and infrastructure.',
        manifesto: 'Focus on sustainable engineering and practical applications. Bridge gap between academia and industry.',
        party: 'Innovation Forward',
        position: 'Engineering Rep',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/fd7e14/ffffff?text=DK'
      },
      {
        name: 'Dr. Lisa Thompson',
        seat: 'Business Rep',
        bio: 'Professor of Business Administration with expertise in entrepreneurship and management.',
        manifesto: 'Strengthen business curriculum and career preparation. Focus on practical business skills and networking.',
        party: 'Academic Excellence',
        position: 'Business Rep',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/6c757d/ffffff?text=LT'
      },
      {
        name: 'Dr. Robert Davis',
        seat: 'Business Rep',
        bio: 'Associate Professor of Marketing with focus on digital marketing and consumer behavior.',
        manifesto: 'Modernize business education and entrepreneurship programs. Prepare students for digital economy.',
        party: 'Innovation Forward',
        position: 'Business Rep',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/0d6efd/ffffff?text=RD'
      }
    ]
  },
  {
    title: 'Campus Sustainability Committee Election',
    description: 'Election for student representatives to the Campus Sustainability Committee. These representatives will work on environmental initiatives.',
    electionType: 'Committee Representative',
    seats: ['Sustainability Coordinator', 'Environmental Advocate'],
    startsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    endsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    status: 'Closed',
    votingEnabled: false,
    candidateListLocked: true,
    totalVotes: 0,
    rules: {
      oneVotePerId: true,
      anonymous: true,
      eligibility: 'registered'
    },
    phases: [
      { name: 'Registration', startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { name: 'Campaigning', startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { name: 'Voting', startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
    ],
    ballotStructure: 'single',
    candidates: [
      {
        name: 'Green Earth Coalition',
        seat: 'Sustainability Coordinator',
        bio: 'Student group focused on environmental sustainability with 50+ active members.',
        manifesto: 'Implement comprehensive campus sustainability initiatives including recycling programs and renewable energy.',
        party: 'Green Earth Coalition',
        position: 'Sustainability Coordinator',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/28a745/ffffff?text=GEC'
      },
      {
        name: 'Eco Warriors',
        seat: 'Environmental Advocate',
        bio: 'Active environmental advocacy group promoting sustainable practices on campus.',
        manifesto: 'Promote environmental awareness and sustainable practices. Focus on student education and engagement.',
        party: 'Eco Warriors',
        position: 'Environmental Advocate',
        isActive: true,
        votes: 0,
        photoUrl: 'https://via.placeholder.com/150/20c997/ffffff?text=EW'
      }
    ]
  }
];

const sampleNotifications = [
  {
    type: 'election',
    title: 'New Election Created',
    message: 'New election created: Student Union Presidential Election 2024',
    severity: 'medium',
    isRead: false,
    metadata: { electionId: 'election_1', action: 'created' }
  },
  {
    type: 'election',
    title: 'Voting Period Ending Soon',
    message: 'Voting period ending soon for Faculty Representative Election',
    severity: 'high',
    isRead: false,
    metadata: { electionId: 'election_2', action: 'ending_soon' }
  },
  {
    type: 'election',
    title: 'Election Completed',
    message: 'Campus Sustainability Committee Election completed successfully',
    severity: 'low',
    isRead: true,
    metadata: { electionId: 'election_3', action: 'completed' }
  }
];

const sampleSystemLogs = [
  {
    level: 'info',
    message: 'System startup completed',
    service: 'voting-backend',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    level: 'info',
    message: 'Database connection established',
    service: 'database',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    level: 'warn',
    message: 'High number of failed login attempts detected',
    service: 'auth',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  },
  {
    level: 'info',
    message: 'Election created successfully',
    service: 'elections',
    timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
  }
];

const sampleBlockchainStatus = [
  {
    nodeName: 'Ganache Local',
    isConnected: true,
    lastBlockNumber: 12345,
    lastSyncTime: new Date(),
    latency: 15,
    errors: [],
    lastChecked: new Date()
  }
];

async function seedAll() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    const clearData = process.argv.includes('--clear');
    if (clearData) {
      console.log('🧹 Clearing existing data...');
      await User.deleteMany({});
      await Election.deleteMany({});
      if (Voter && Voter.deleteMany) {
        await Voter.deleteMany({});
      }
      if (Notification && Notification.deleteMany) {
        await Notification.deleteMany({});
      }
      if (SystemLog && SystemLog.deleteMany) {
        await SystemLog.deleteMany({});
      }
      if (BlockchainStatus && BlockchainStatus.deleteMany) {
        await BlockchainStatus.deleteMany({});
      }
      console.log('✅ Cleared existing data');
    }

    // Create admin user
    console.log('👑 Creating admin user...');
    const existingAdmin = await User.findOne({ email: adminUser.email });
    let admin;
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      admin = new User({
        ...adminUser,
        password: hashedPassword
      });
      await admin.save();
      console.log(`✅ Created admin: ${admin.fullName} (${admin.email})`);
    } else {
      admin = existingAdmin;
      console.log(`✅ Admin already exists: ${admin.fullName} (${admin.email})`);
    }

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        await user.save();
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.fullName} (${user.email})`);
      } else {
        createdUsers.push(existingUser);
        console.log(`✅ User already exists: ${existingUser.fullName} (${existingUser.email})`);
      }
    }

    // Create elections with candidates
    console.log('🗳️ Creating elections...');
    const createdElections = [];
    for (const electionData of sampleElections) {
      const existingElection = await Election.findOne({ title: electionData.title });
      if (!existingElection) {
        const election = new Election({
          ...electionData,
          createdBy: admin._id,
          registeredVoters: [...createdUsers.map(user => user._id.toString()), admin._id.toString()],
          voters: [...createdUsers.map(user => user._id.toString()), admin._id.toString()]
        });
        await election.save();
        createdElections.push(election);
        console.log(`✅ Created election: ${election.title}`);
      } else {
        createdElections.push(existingElection);
        console.log(`✅ Election already exists: ${existingElection.title}`);
      }
    }

    // Create sample voting history
    console.log('📊 Creating sample voting data...');
    const activeElection = createdElections.find(e => e.status === 'Open');
    if (activeElection) {
      // Simulate some votes
      const voters = createdUsers.slice(0, 5); // First 5 users vote
      for (const voter of voters) {
        if (voter.eligibility === 'Eligible') {
          const randomCandidate = activeElection.candidates[Math.floor(Math.random() * activeElection.candidates.length)];
          voter.votingHistory.push({
            election: activeElection._id,
            seats: [randomCandidate.seat],
            votedAt: new Date(),
            transactionHash: crypto.randomBytes(32).toString('hex'),
            receiptHash: crypto.randomBytes(32).toString('hex')
          });
          voter.eligibility = 'Already Voted';
          await voter.save();
          
          // Update candidate vote count
          const candidateIndex = activeElection.candidates.findIndex(c => c._id.toString() === randomCandidate._id.toString());
          if (candidateIndex !== -1) {
            activeElection.candidates[candidateIndex].votes += 1;
          }
          activeElection.totalVotes += 1;
        }
      }
      await activeElection.save();
      console.log(`✅ Simulated votes for ${activeElection.title}`);
    }

    // Create notifications
    if (Notification) {
      console.log('🔔 Creating notifications...');
      for (const notificationData of sampleNotifications) {
        const notification = new Notification(notificationData);
        await notification.save();
      }
      console.log(`✅ Created ${sampleNotifications.length} notifications`);
    }

    // Create system logs
    if (SystemLog) {
      console.log('📝 Creating system logs...');
      for (const logData of sampleSystemLogs) {
        const log = new SystemLog(logData);
        await log.save();
      }
      console.log(`✅ Created ${sampleSystemLogs.length} system logs`);
    }

    // Create blockchain status
    if (BlockchainStatus) {
      console.log('⛓️ Creating blockchain status...');
      for (const statusData of sampleBlockchainStatus) {
        const status = new BlockchainStatus(statusData);
        await status.save();
      }
      console.log(`✅ Created ${sampleBlockchainStatus.length} blockchain status records`);
    }

    console.log('🎉 Comprehensive database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Admin user: ${admin.fullName} (${admin.email})`);
    console.log(`- Created ${createdUsers.length} users`);
    console.log(`- Created ${createdElections.length} elections`);
    console.log(`- Added ${createdElections.reduce((total, e) => total + e.candidates.length, 0)} candidates`);
    console.log(`- Registered ${createdUsers.length + 1} voters (including admin)`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@voting.com / admin123');
    console.log('Sample Voters:');
    createdUsers.slice(0, 5).forEach(user => {
      console.log(`- ${user.fullName}: ${user.email} / password123`);
    });

    console.log('\n💡 Usage:');
    console.log('- Run with --clear flag to clear existing data first');
    console.log('- Run without --clear to add to existing data');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
if (require.main === module) {
  seedAll();
}

module.exports = seedAll;