// Script to create an admin user in MongoDB for Blockchain Voting System

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uri = process.env.MONGO_URI;
const User = require('./src/models/User');

async function createAdmin() {
  await mongoose.connect(uri);
  const email = 'tkuria30@gmail.com';
  const password = '41181671';
  const fullName = 'Admin User';
  const role = 'admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('User already exists:', existing.email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ fullName, email, password: hashed, role });
  await user.save();
  console.log('Admin user created:', email);
  process.exit(0);
}

createAdmin().catch(e => { console.error(e); process.exit(1); });
