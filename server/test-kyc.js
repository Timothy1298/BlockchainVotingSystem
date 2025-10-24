const mongoose = require('mongoose');
const User = require('./src/models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/voting-system');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test KYC structure
const testKycStructure = async () => {
  try {
    // Find the user we just created
    const user = await User.findOne({ email: 'newuser@example.com' });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Current user KYC structure:', JSON.stringify(user.kycInfo, null, 2));
    
    // Try to update the blockchain info directly
    user.kycInfo.blockchainInfo.walletAddress = '0x1234567890123456789012345678901234567890';
    user.kycInfo.blockchainInfo.isConnected = true;
    user.kycInfo.blockchainInfo.connectedAt = new Date();
    user.kycInfo.registrationSteps.blockchainConnection = true;
    
    await user.save();
    console.log('✅ User updated successfully');
    
    // Check the updated structure
    const updatedUser = await User.findOne({ email: 'newuser@example.com' });
    console.log('Updated user KYC structure:', JSON.stringify(updatedUser.kycInfo, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Run test
const runTest = async () => {
  await connectDB();
  await testKycStructure();
  process.exit(0);
};

runTest();
