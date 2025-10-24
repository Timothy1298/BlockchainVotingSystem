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

// Fix KYC structure for existing users
const fixKycStructure = async () => {
  try {
    const users = await User.find({ role: 'voter' });
    console.log(`Found ${users.length} voters to migrate`);
    
    for (const user of users) {
      console.log(`Migrating user: ${user.email}`);
      
      // Create proper KYC structure
      const properKycInfo = {
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        blockchainInfo: {
          walletAddress: '',
          walletType: 'MetaMask',
          isConnected: false,
          connectedAt: null
        },
        documents: {
          governmentId: {
            documentType: '',
            documentNumber: '',
            issuingCountry: '',
            expiryDate: null,
            fileUrl: '',
            uploadedAt: null,
            verified: false,
            verifiedAt: null,
            verifiedBy: null
          },
          proofOfAddress: {
            documentType: '',
            fileUrl: '',
            uploadedAt: null,
            verified: false,
            verifiedAt: null,
            verifiedBy: null
          },
          selfie: {
            fileUrl: '',
            uploadedAt: null,
            verified: false,
            verifiedAt: null,
            verifiedBy: null
          }
        },
        biometricInfo: {
          facialRecognition: {
            biometricTemplate: '',
            confidence: 0,
            verified: false,
            verifiedAt: null,
            verifiedBy: null
          },
          livenessCheck: {
            passed: false,
            confidence: 0,
            verifiedAt: null
          }
        },
        verification: {
          kycStatus: 'pending',
          biometricStatus: 'pending',
          overallStatus: 'pending',
          verifiedAt: null,
          verifiedBy: null
        },
        privacyConsent: {
          dataProcessing: false,
          biometricProcessing: false,
          blockchainStorage: false,
          marketingCommunications: false,
          consentDate: null
        },
        registrationSteps: {
          personalInfo: false,
          blockchainConnection: false,
          documentUpload: false,
          biometricVerification: false,
          reviewSubmit: false
        }
      };
      
      // Merge with existing data if it exists
      if (user.kycInfo) {
        // Preserve existing data where possible
        if (user.kycInfo.address && typeof user.kycInfo.address === 'object') {
          properKycInfo.address = { ...properKycInfo.address, ...user.kycInfo.address };
        }
        if (user.kycInfo.blockchainInfo && typeof user.kycInfo.blockchainInfo === 'object') {
          properKycInfo.blockchainInfo = { ...properKycInfo.blockchainInfo, ...user.kycInfo.blockchainInfo };
        }
        if (user.kycInfo.documents && typeof user.kycInfo.documents === 'object') {
          properKycInfo.documents = { ...properKycInfo.documents, ...user.kycInfo.documents };
        }
        if (user.kycInfo.biometricInfo && typeof user.kycInfo.biometricInfo === 'object') {
          properKycInfo.biometricInfo = { ...properKycInfo.biometricInfo, ...user.kycInfo.biometricInfo };
        }
        if (user.kycInfo.verification && typeof user.kycInfo.verification === 'object') {
          properKycInfo.verification = { ...properKycInfo.verification, ...user.kycInfo.verification };
        }
        if (user.kycInfo.privacyConsent && typeof user.kycInfo.privacyConsent === 'object') {
          properKycInfo.privacyConsent = { ...properKycInfo.privacyConsent, ...user.kycInfo.privacyConsent };
        }
        if (user.kycInfo.registrationSteps && typeof user.kycInfo.registrationSteps === 'object') {
          properKycInfo.registrationSteps = { ...properKycInfo.registrationSteps, ...user.kycInfo.registrationSteps };
        }
      }
      
      // Update the user
      user.kycInfo = properKycInfo;
      await user.save();
      console.log(`✅ Migrated user: ${user.email}`);
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  await fixKycStructure();
  process.exit(0);
};

runMigration();
