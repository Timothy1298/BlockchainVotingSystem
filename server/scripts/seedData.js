const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../src/config');

// Import models
const User = require('../src/models/User');
const Election = require('../src/models/Election');
const Voter = require('../src/models/Voter');

// Sample data
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
  }
];

const sampleElections = [
  {
    title: 'Student Union Presidential Election 2024',
    description: 'Annual election for Student Union President and Vice President positions',
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
    phases: [],
    ballotStructure: 'single',
    candidates: [
      {
        name: 'Alex Thompson',
        seat: 'President',
        bio: 'Experienced student leader with 2 years in student government',
        manifesto: 'Focus on student welfare, campus improvements, and academic support',
        party: 'Progressive Students',
        position: 'President',
        isActive: true,
        votes: 0
      },
      {
        name: 'Maria Garcia',
        seat: 'President',
        bio: 'Passionate advocate for student rights and campus diversity',
        manifesto: 'Promote inclusivity, sustainability, and student engagement',
        party: 'Unity Coalition',
        position: 'President',
        isActive: true,
        votes: 0
      },
      {
        name: 'James Lee',
        seat: 'Vice President',
        bio: 'Tech-savvy student with experience in event organization',
        manifesto: 'Digital transformation of student services and events',
        party: 'Progressive Students',
        position: 'Vice President',
        isActive: true,
        votes: 0
      },
      {
        name: 'Sophie Chen',
        seat: 'Vice President',
        bio: 'Active in community service and student clubs',
        manifesto: 'Strengthen community ties and support student initiatives',
        party: 'Unity Coalition',
        position: 'Vice President',
        isActive: true,
        votes: 0
      }
    ]
  },
  {
    title: 'Faculty Representative Election 2024',
    description: 'Election for faculty representatives to the Academic Senate',
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
    phases: [],
    ballotStructure: 'multiple',
    candidates: [
      {
        name: 'Dr. Sarah Williams',
        seat: 'Computer Science Rep',
        bio: 'Professor of Computer Science with 10 years experience',
        manifesto: 'Advance computer science curriculum and research opportunities',
        party: 'Academic Excellence',
        position: 'Computer Science Rep',
        isActive: true,
        votes: 0
      },
      {
        name: 'Dr. Michael Johnson',
        seat: 'Computer Science Rep',
        bio: 'Associate Professor specializing in AI and Machine Learning',
        manifesto: 'Promote cutting-edge research and industry partnerships',
        party: 'Innovation Forward',
        position: 'Computer Science Rep',
        isActive: true,
        votes: 0
      },
      {
        name: 'Dr. Emily Rodriguez',
        seat: 'Engineering Rep',
        bio: 'Professor of Mechanical Engineering',
        manifesto: 'Enhance engineering programs and student support',
        party: 'Academic Excellence',
        position: 'Engineering Rep',
        isActive: true,
        votes: 0
      },
      {
        name: 'Dr. David Kim',
        seat: 'Engineering Rep',
        bio: 'Associate Professor of Civil Engineering',
        manifesto: 'Focus on sustainable engineering and practical applications',
        party: 'Innovation Forward',
        position: 'Engineering Rep',
        isActive: true,
        votes: 0
      },
      {
        name: 'Dr. Lisa Thompson',
        seat: 'Business Rep',
        bio: 'Professor of Business Administration',
        manifesto: 'Strengthen business curriculum and career preparation',
        party: 'Academic Excellence',
        position: 'Business Rep',
        isActive: true,
        votes: 0
      },
      {
        name: 'Dr. Robert Davis',
        seat: 'Business Rep',
        bio: 'Associate Professor of Marketing',
        manifesto: 'Modernize business education and entrepreneurship programs',
        party: 'Innovation Forward',
        position: 'Business Rep',
        isActive: true,
        votes: 0
      }
    ]
  },
  {
    title: 'Campus Sustainability Committee Election',
    description: 'Election for student representatives to the Campus Sustainability Committee',
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
    phases: [],
    ballotStructure: 'single',
    candidates: [
      {
        name: 'Green Earth Coalition',
        seat: 'Sustainability Coordinator',
        bio: 'Student group focused on environmental sustainability',
        manifesto: 'Implement comprehensive campus sustainability initiatives',
        party: 'Green Earth Coalition',
        position: 'Sustainability Coordinator',
        isActive: true,
        votes: 0
      },
      {
        name: 'Eco Warriors',
        seat: 'Environmental Advocate',
        bio: 'Active environmental advocacy group',
        manifesto: 'Promote environmental awareness and sustainable practices',
        party: 'Eco Warriors',
        position: 'Environmental Advocate',
        isActive: true,
        votes: 0
      }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Election.deleteMany({});
    if (Voter && Voter.deleteMany) {
      await Voter.deleteMany({});
    }
    console.log('✅ Cleared existing data');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.fullName} (${user.email})`);
    }

    // Create elections with candidates
    console.log('🗳️ Creating elections...');
    const createdElections = [];
    for (const electionData of sampleElections) {
      const election = new Election({
        ...electionData,
        createdBy: createdUsers[0]._id, // Assign to first user as creator
        registeredVoters: createdUsers.map(user => user._id.toString()),
        voters: createdUsers.map(user => user._id.toString())
      });
      await election.save();
      createdElections.push(election);
      console.log(`✅ Created election: ${election.title}`);
    }

    // Create some sample voting history
    console.log('📊 Creating sample voting data...');
    const activeElection = createdElections.find(e => e.status === 'Open');
    if (activeElection) {
      // Simulate some votes
      const voters = createdUsers.slice(0, 3); // First 3 users vote
      for (const voter of voters) {
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
      await activeElection.save();
      console.log(`✅ Simulated ${voters.length} votes for ${activeElection.title}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Created ${createdUsers.length} users`);
    console.log(`- Created ${createdElections.length} elections`);
    console.log(`- Added ${createdElections.reduce((total, e) => total + e.candidates.length, 0)} candidates`);
    console.log(`- Registered ${createdUsers.length} voters`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@voting.com / admin123');
    console.log('Sample Voters:');
    createdUsers.slice(0, 3).forEach(user => {
      console.log(`- ${user.fullName}: ${user.email} / password123`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
