// src/controllers/voterAuthController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const config = require('../config');
const logger = require('../utils/logger');
const RefreshToken = require('../models/RefreshToken');
const { getPublicFileUrl } = require('../middleware/upload');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper: ensure all kycInfo sub-objects exist with sane defaults matching the User schema
function ensureKycInitialized(user) {
  const kyc = user.kycInfo || {};
  
  // Initialize address object with proper structure
  if (!kyc.address || Object.keys(kyc.address).length === 0) {
    kyc.address = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    };
  }
  
  // Initialize blockchainInfo object with proper structure
  if (!kyc.blockchainInfo || Object.keys(kyc.blockchainInfo).length === 0) {
    kyc.blockchainInfo = {
      walletAddress: '',
      walletType: 'MetaMask',
      isConnected: false,
      connectedAt: null
    };
  }
  
  // Initialize documents object with proper structure
  if (!kyc.documents || Object.keys(kyc.documents).length === 0) {
    kyc.documents = {
      governmentId: {
        documentType: null,
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
        documentType: null,
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
    };
  }
  
  // Initialize biometricInfo object with proper structure
  if (!kyc.biometricInfo || Object.keys(kyc.biometricInfo).length === 0) {
    kyc.biometricInfo = {
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
    };
  }
  
  // Initialize verification object with proper structure
  if (!kyc.verification || Object.keys(kyc.verification).length === 0) {
    kyc.verification = {
      kycStatus: 'pending',
      biometricStatus: 'pending',
      overallStatus: 'pending',
      verifiedAt: null,
      verifiedBy: null
    };
  }
  
  // Initialize privacyConsent object with proper structure
  if (!kyc.privacyConsent || Object.keys(kyc.privacyConsent).length === 0) {
    kyc.privacyConsent = {
      dataProcessing: false,
      biometricProcessing: false,
      blockchainStorage: false,
      marketingCommunications: false,
      consentDate: null
    };
  }
  
  // Initialize registrationSteps object with proper structure
  if (!kyc.registrationSteps || Object.keys(kyc.registrationSteps).length === 0) {
    kyc.registrationSteps = {
      personalInfo: false,
      blockchainConnection: false,
      documentUpload: false,
      biometricVerification: false,
      reviewSubmit: false
    };
  }
  
  user.kycInfo = kyc;
  try { user.markModified && user.markModified('kycInfo'); } catch (e) {}
}

// Voter Registration with KYC Integration
exports.registerVoter = async (req, res) => {
  if (config.skipDb) {
    // Mock mode for development
    if (!req.body.email || !req.body.password) {
      return res.error(400, 'Email and password are required (mock mode)', 4001);
    }
    const mockUser = { 
      id: 'mock-voter-id', 
      fullName: req.body.fullName || 'Mock Voter', 
      email: req.body.email, 
      role: 'voter',
      kycInfo: {
        verification: {
          overallStatus: 'pending'
        }
      }
    };
    const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, config.jwtSecret || 'dev-secret', { expiresIn: JWT_EXPIRES_IN });
    return res.success({ accessToken: token, refreshToken: null, user: mockUser });
  }

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, 'Validation failed', 4002, { errors: errors.array() });
    }

    const { 
      fullName, 
      email: rawEmail, 
      password, 
      kycInfo 
    } = req.body;
    
    const email = String(rawEmail || '').toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.error(400, 'Email already registered', 4005);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with KYC information
    user = new User({
      fullName,
      email,
      password: hashedPassword,
      role: 'voter',
      isRegistered: true,
      registrationDate: new Date(),
      kycInfo: {
        ...kycInfo,
        verification: {
          kycStatus: 'pending',
          biometricStatus: 'pending',
          overallStatus: 'pending',
          ...kycInfo?.verification
        },
        registrationSteps: {
          personalInfo: true,
          blockchainConnection: false,
          documentUpload: false,
          biometricVerification: false,
          reviewSubmit: false,
          ...kycInfo?.registrationSteps
        },
        privacyConsent: {
          dataProcessing: true,
          biometricProcessing: false,
          blockchainStorage: false,
          marketingCommunications: false,
          consentDate: new Date(),
          ...kycInfo?.privacyConsent
        }
      }
    });

    await user.save();

    // Generate tokens
    const accessToken = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    await RefreshToken.create({ token: refreshToken, user: user._id, expiresAt: expires });

    // Log registration
    logger.info('Voter registered: %s (%s)', user.email, user._id);

    return res.success({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        kycInfo: user.kycInfo
      }
    }, 'Voter registered successfully');

  } catch (err) {
    logger.error('Voter registration error: %s', err?.message || err);
    return res.error(500, 'Server error', 4000, { error: err?.message });
  }
};

// Voter Login with KYC Status Check
exports.loginVoter = async (req, res) => {
  if (config.skipDb) {
    const mockUser = { 
      id: 'mock-voter-id', 
      fullName: 'Mock Voter', 
      email: req.body.email || 'voter@example.com', 
      role: 'voter',
      kycInfo: {
        verification: {
          overallStatus: 'verified'
        }
      }
    };
    const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, config.jwtSecret || 'dev-secret', { expiresIn: JWT_EXPIRES_IN });
    return res.success({ accessToken: token, refreshToken: null, user: mockUser });
  }

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.error(400, 'Validation failed', 4101, { errors: errors.array() });
    }

    const { email: rawEmail, password } = req.body;
    const email = String(rawEmail || '').toLowerCase().trim();
    
    const user = await User.findOne({ email, role: 'voter' });
    if (!user) {
      logger.info('Voter login attempt: user not found for email %s', email);
      return res.error(400, 'Invalid credentials', 4102);
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.error(423, 'Account is temporarily locked due to too many failed login attempts', 4104);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // Lock for 2 hours
      }
      await user.save();
      
      logger.info('Voter login attempt: invalid password for %s', email);
      return res.error(400, 'Invalid credentials', 4103);
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    await RefreshToken.create({ token: refreshToken, user: user._id, expiresAt: expires });

    logger.info('Voter login successful: %s (%s)', user.email, user._id);

    return res.success({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        kycInfo: user.kycInfo,
        isRegistered: user.isRegistered,
        eligibility: user.eligibility
      }
    }, 'Login successful');

  } catch (err) {
    logger.error('Voter login error: %s', err?.message || err);
    return res.error(500, 'Server error', 4100, { error: err?.message });
  }
};

// Update KYC Information
exports.updateKycInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kycInfo } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.error(404, 'User not found', 5001);
    }

    if (user.role !== 'voter') {
      return res.error(403, 'Only voters can update KYC information', 5002);
    }

    // Ensure kycInfo initialized with proper structure
    if (!user.kycInfo) {
      user.kycInfo = {};
    }
    
    // Initialize all required nested objects
    user.kycInfo.address = user.kycInfo.address || { street: '', city: '', state: '', zipCode: '', country: '' };
    user.kycInfo.blockchainInfo = user.kycInfo.blockchainInfo || { walletAddress: '', walletType: 'MetaMask', isConnected: false, connectedAt: null };
    user.kycInfo.documents = user.kycInfo.documents || {
      governmentId: { documentType: null, documentNumber: '', issuingCountry: '', expiryDate: null, fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null },
      proofOfAddress: { documentType: null, fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null },
      selfie: { fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null }
    };
    user.kycInfo.biometricInfo = user.kycInfo.biometricInfo || {
      facialRecognition: { biometricTemplate: '', confidence: 0, verified: false, verifiedAt: null, verifiedBy: null },
      livenessCheck: { passed: false, confidence: 0, verifiedAt: null }
    };
    user.kycInfo.verification = user.kycInfo.verification || { kycStatus: 'pending', biometricStatus: 'pending', overallStatus: 'pending', verifiedAt: null, verifiedBy: null };
    user.kycInfo.privacyConsent = user.kycInfo.privacyConsent || { dataProcessing: false, biometricProcessing: false, blockchainStorage: false, marketingCommunications: false, consentDate: null };
    user.kycInfo.registrationSteps = user.kycInfo.registrationSteps || { personalInfo: false, blockchainConnection: false, documentUpload: false, biometricVerification: false, reviewSubmit: false };

    // Merge the new KYC info
    if (kycInfo?.address) {
      user.kycInfo.address = { ...user.kycInfo.address, ...kycInfo.address };
    }
    if (kycInfo?.documents) {
      user.kycInfo.documents = { ...user.kycInfo.documents, ...kycInfo.documents };
    }
    if (kycInfo?.biometricInfo) {
      user.kycInfo.biometricInfo = { ...user.kycInfo.biometricInfo, ...kycInfo.biometricInfo };
    }
    if (kycInfo?.verification) {
      user.kycInfo.verification = { ...user.kycInfo.verification, ...kycInfo.verification };
    }
    if (kycInfo?.privacyConsent) {
      user.kycInfo.privacyConsent = { ...user.kycInfo.privacyConsent, ...kycInfo.privacyConsent };
    }
    if (kycInfo?.registrationSteps) {
      user.kycInfo.registrationSteps = { ...user.kycInfo.registrationSteps, ...kycInfo.registrationSteps };
    }
    if (kycInfo?.blockchainInfo) {
      user.kycInfo.blockchainInfo = { ...user.kycInfo.blockchainInfo, ...kycInfo.blockchainInfo };
    }
    try { user.markModified('kycInfo'); } catch (e) {}

    await user.save();

    logger.info('KYC information updated for user: %s', user.email);

    return res.success({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        kycInfo: user.kycInfo
      }
    }, 'KYC information updated successfully');

  } catch (err) {
    logger.error('KYC update error: %s', err?.message || err);
    return res.error(500, 'Server error', 5000, { error: err?.message });
  }
};

// Get KYC Status
exports.getKycStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('kycInfo fullName email role');
    if (!user) {
      return res.error(404, 'User not found', 6001);
    }

    if (user.role !== 'voter') {
      return res.error(403, 'Only voters can access KYC status', 6002);
    }

    return res.success({
      kycInfo: user.kycInfo,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    }, 'KYC status retrieved successfully');

  } catch (err) {
    logger.error('KYC status error: %s', err?.message || err);
    return res.error(500, 'Server error', 6000, { error: err?.message });
  }
};

// Connect Blockchain Wallet
exports.connectWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { walletAddress, walletType = 'MetaMask' } = req.body;

    if (!walletAddress) {
      return res.error(400, 'Wallet address is required', 7001);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.error(404, 'User not found', 7002);
    }

    if (user.role !== 'voter') {
      return res.error(403, 'Only voters can connect wallets', 7003);
    }

    // Check if wallet address is already in use
    const existingUser = await User.findOne({
      'kycInfo.blockchainInfo.walletAddress': walletAddress.toLowerCase(),
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.error(400, 'Wallet address is already connected to another account', 7004);
    }

    // Ensure kycInfo initialized with proper structure
    if (!user.kycInfo) {
      user.kycInfo = {};
    }
    
    // Initialize all required nested objects
    user.kycInfo.address = user.kycInfo.address || { street: '', city: '', state: '', zipCode: '', country: '' };
    user.kycInfo.blockchainInfo = user.kycInfo.blockchainInfo || { walletAddress: '', walletType: 'MetaMask', isConnected: false, connectedAt: null };
    user.kycInfo.documents = user.kycInfo.documents || {
      governmentId: { documentType: null, documentNumber: '', issuingCountry: '', expiryDate: null, fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null },
      proofOfAddress: { documentType: null, fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null },
      selfie: { fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null }
    };
    user.kycInfo.biometricInfo = user.kycInfo.biometricInfo || {
      facialRecognition: { biometricTemplate: '', confidence: 0, verified: false, verifiedAt: null, verifiedBy: null },
      livenessCheck: { passed: false, confidence: 0, verifiedAt: null }
    };
    user.kycInfo.verification = user.kycInfo.verification || { kycStatus: 'pending', biometricStatus: 'pending', overallStatus: 'pending', verifiedAt: null, verifiedBy: null };
    user.kycInfo.privacyConsent = user.kycInfo.privacyConsent || { dataProcessing: false, biometricProcessing: false, blockchainStorage: false, marketingCommunications: false, consentDate: null };
    user.kycInfo.registrationSteps = user.kycInfo.registrationSteps || { personalInfo: false, blockchainConnection: false, documentUpload: false, biometricVerification: false, reviewSubmit: false };
    
    // Update blockchain info
    user.kycInfo.blockchainInfo.walletAddress = walletAddress.toLowerCase();
    user.kycInfo.blockchainInfo.walletType = walletType;
    user.kycInfo.blockchainInfo.isConnected = true;
    user.kycInfo.blockchainInfo.connectedAt = new Date();
    user.kycInfo.registrationSteps.blockchainConnection = true;
    try { user.markModified('kycInfo'); } catch (e) {}

    // Also update the legacy walletAddress field for backward compatibility
    user.walletAddress = walletAddress.toLowerCase();

    await user.save();

    logger.info('Wallet connected for user: %s, address: %s', user.email, walletAddress);

    return res.success({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        kycInfo: user.kycInfo
      }
    }, 'Wallet connected successfully');

  } catch (err) {
    logger.error('Wallet connection error: %s', err?.message || err);
    return res.error(500, 'Server error', 7000, { error: err?.message });
  }
};

// Upload Document
exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, fileUrl, documentData } = req.body;

    // Support multipart file uploads via multer
    let finalUrl = fileUrl;
    if (req.file && !finalUrl) {
      finalUrl = getPublicFileUrl(req, req.file.filename);
    }

    if (!documentType || !finalUrl) {
      return res.error(400, 'Document type and file is required', 8001);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.error(404, 'User not found', 8002);
    }

    if (user.role !== 'voter') {
      return res.error(403, 'Only voters can upload documents', 8003);
    }

    // Ensure kycInfo initialized with proper structure
    if (!user.kycInfo) {
      user.kycInfo = {};
    }
    
    // Initialize all required nested objects
    user.kycInfo.address = user.kycInfo.address || { street: '', city: '', state: '', zipCode: '', country: '' };
    user.kycInfo.blockchainInfo = user.kycInfo.blockchainInfo || { walletAddress: '', walletType: 'MetaMask', isConnected: false, connectedAt: null };
    user.kycInfo.documents = user.kycInfo.documents || {
      governmentId: { documentType: null, documentNumber: '', issuingCountry: '', expiryDate: null, fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null },
      proofOfAddress: { documentType: null, fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null },
      selfie: { fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null }
    };
    user.kycInfo.biometricInfo = user.kycInfo.biometricInfo || {
      facialRecognition: { biometricTemplate: '', confidence: 0, verified: false, verifiedAt: null, verifiedBy: null },
      livenessCheck: { passed: false, confidence: 0, verifiedAt: null }
    };
    user.kycInfo.verification = user.kycInfo.verification || { kycStatus: 'pending', biometricStatus: 'pending', overallStatus: 'pending', verifiedAt: null, verifiedBy: null };
    user.kycInfo.privacyConsent = user.kycInfo.privacyConsent || { dataProcessing: false, biometricProcessing: false, blockchainStorage: false, marketingCommunications: false, consentDate: null };
    user.kycInfo.registrationSteps = user.kycInfo.registrationSteps || { personalInfo: false, blockchainConnection: false, documentUpload: false, biometricVerification: false, reviewSubmit: false };

    // Update document information
    const documentInfo = {
      fileUrl: finalUrl,
      uploadedAt: new Date(),
      verified: false,
      ...documentData
    };

    // Update the specific document
    user.kycInfo.documents[documentType] = { ...user.kycInfo.documents[documentType], ...documentInfo };
    user.kycInfo.registrationSteps.documentUpload = true;
    try { user.markModified('kycInfo'); } catch (e) {}

    await user.save();

    logger.info('Document uploaded for user: %s, type: %s', user.email, documentType);

    return res.success({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        kycInfo: user.kycInfo
      }
    }, 'Document uploaded successfully');

  } catch (err) {
    logger.error('Document upload error: %s', err?.message || err);
    return res.error(500, 'Server error', 8000, { error: err?.message });
  }
};

// Submit Biometric Data
exports.submitBiometric = async (req, res) => {
  try {
    const userId = req.user.id;
    const { biometricTemplate, confidence, livenessCheck } = req.body;

    if (!biometricTemplate) {
      return res.error(400, 'Biometric template is required', 9001);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.error(404, 'User not found', 9002);
    }

    if (user.role !== 'voter') {
      return res.error(403, 'Only voters can submit biometric data', 9003);
    }

    // Ensure kycInfo initialized with proper structure
    if (!user.kycInfo) {
      user.kycInfo = {};
    }
    
    // Initialize all required nested objects
    user.kycInfo.address = user.kycInfo.address || { street: '', city: '', state: '', zipCode: '', country: '' };
    user.kycInfo.blockchainInfo = user.kycInfo.blockchainInfo || { walletAddress: '', walletType: 'MetaMask', isConnected: false, connectedAt: null };
    user.kycInfo.documents = user.kycInfo.documents || {
      governmentId: { documentType: null, documentNumber: '', issuingCountry: '', expiryDate: null, fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null },
      proofOfAddress: { documentType: null, fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null },
      selfie: { fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null }
    };
    user.kycInfo.biometricInfo = user.kycInfo.biometricInfo || {
      facialRecognition: { biometricTemplate: '', confidence: 0, verified: false, verifiedAt: null, verifiedBy: null },
      livenessCheck: { passed: false, confidence: 0, verifiedAt: null }
    };
    user.kycInfo.verification = user.kycInfo.verification || { kycStatus: 'pending', biometricStatus: 'pending', overallStatus: 'pending', verifiedAt: null, verifiedBy: null };
    user.kycInfo.privacyConsent = user.kycInfo.privacyConsent || { dataProcessing: false, biometricProcessing: false, blockchainStorage: false, marketingCommunications: false, consentDate: null };
    user.kycInfo.registrationSteps = user.kycInfo.registrationSteps || { personalInfo: false, blockchainConnection: false, documentUpload: false, biometricVerification: false, reviewSubmit: false };

    // Update biometric information
    user.kycInfo.biometricInfo.facialRecognition.biometricTemplate = biometricTemplate;
    user.kycInfo.biometricInfo.facialRecognition.confidence = confidence || 0;
    user.kycInfo.biometricInfo.facialRecognition.verified = false;
    user.kycInfo.biometricInfo.livenessCheck.passed = livenessCheck?.passed || false;
    user.kycInfo.biometricInfo.livenessCheck.confidence = livenessCheck?.confidence || 0;
    user.kycInfo.biometricInfo.livenessCheck.verifiedAt = new Date();
    user.kycInfo.registrationSteps.biometricVerification = true;

    await user.save();

    logger.info('Biometric data submitted for user: %s', user.email);

    return res.success({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        kycInfo: user.kycInfo
      }
    }, 'Biometric data submitted successfully');

  } catch (err) {
    logger.error('Biometric submission error: %s', err?.message || err);
    return res.error(500, 'Server error', 9000, { error: err?.message });
  }
};

// Submit Final Registration
exports.submitRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { privacyConsent } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.error(404, 'User not found', 10001);
    }

    if (user.role !== 'voter') {
      return res.error(403, 'Only voters can submit registration', 10002);
    }

    // Ensure kycInfo initialized with proper structure
    if (!user.kycInfo) {
      user.kycInfo = {};
    }
    
    // Initialize all required nested objects
    user.kycInfo.address = user.kycInfo.address || { street: '', city: '', state: '', zipCode: '', country: '' };
    user.kycInfo.blockchainInfo = user.kycInfo.blockchainInfo || { walletAddress: '', walletType: 'MetaMask', isConnected: false, connectedAt: null };
    user.kycInfo.documents = user.kycInfo.documents || {
      governmentId: { documentType: null, documentNumber: '', issuingCountry: '', expiryDate: null, fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null },
      proofOfAddress: { documentType: null, fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null },
      selfie: { fileUrl: '', uploadedAt: null, verified: false, verifiedAt: null, verifiedBy: null }
    };
    user.kycInfo.biometricInfo = user.kycInfo.biometricInfo || {
      facialRecognition: { biometricTemplate: '', confidence: 0, verified: false, verifiedAt: null, verifiedBy: null },
      livenessCheck: { passed: false, confidence: 0, verifiedAt: null }
    };
    user.kycInfo.verification = user.kycInfo.verification || { kycStatus: 'pending', biometricStatus: 'pending', overallStatus: 'pending', verifiedAt: null, verifiedBy: null };
    user.kycInfo.privacyConsent = user.kycInfo.privacyConsent || { dataProcessing: false, biometricProcessing: false, blockchainStorage: false, marketingCommunications: false, consentDate: null };
    user.kycInfo.registrationSteps = user.kycInfo.registrationSteps || { personalInfo: false, blockchainConnection: false, documentUpload: false, biometricVerification: false, reviewSubmit: false };

    // Check if all required steps are completed
    const steps = user.kycInfo.registrationSteps;
    if (!steps.personalInfo || !steps.blockchainConnection || !steps.documentUpload || !steps.biometricVerification) {
      return res.error(400, 'All registration steps must be completed before submission', 10003);
    }

    // Update final registration status - mark as verified since all steps are complete
    user.kycInfo.verification.kycStatus = 'verified';
    user.kycInfo.verification.biometricStatus = 'verified';
    user.kycInfo.verification.overallStatus = 'verified';
    user.kycInfo.verification.verifiedAt = new Date();
    user.kycInfo.verification.verifiedBy = user._id;
    
    user.kycInfo.registrationSteps.reviewSubmit = true;
    
    if (privacyConsent) {
      user.kycInfo.privacyConsent = { ...user.kycInfo.privacyConsent, ...privacyConsent };
    }
    user.kycInfo.privacyConsent.consentDate = new Date();

    await user.save();

    logger.info('Registration submitted for review: %s', user.email);

    return res.success({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        kycInfo: user.kycInfo
      }
    }, 'Registration submitted successfully. Awaiting admin review.');

  } catch (err) {
    logger.error('Registration submission error: %s', err?.message || err);
    return res.error(500, 'Server error', 10000, { error: err?.message });
  }
};

// Get Voter Profile
exports.getVoterProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.error(404, 'User not found', 11001);
    }

    if (user.role !== 'voter') {
      return res.error(403, 'Only voters can access this profile', 11002);
    }

    return res.success({ user }, 'Profile retrieved successfully');

  } catch (err) {
    logger.error('Profile retrieval error: %s', err?.message || err);
    return res.error(500, 'Server error', 11000, { error: err?.message });
  }
};

// Update Voter Profile
exports.updateVoterProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, contact, region } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.error(404, 'User not found', 12001);
    }

    if (user.role !== 'voter') {
      return res.error(403, 'Only voters can update this profile', 12002);
    }

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (contact) user.contact = contact;
    if (region) user.region = region;

    user.updatedAt = new Date();
    await user.save();

    logger.info('Profile updated for user: %s', user.email);

    return res.success({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        contact: user.contact,
        region: user.region,
        kycInfo: user.kycInfo
      }
    }, 'Profile updated successfully');

  } catch (err) {
    logger.error('Profile update error: %s', err?.message || err);
    return res.error(500, 'Server error', 12000, { error: err?.message });
  }
};

// Check if wallet address is already registered
exports.checkWalletRegistration = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.error(400, 'Wallet address is required', 13001);
    }

    const user = await User.findOne({
      'kycInfo.blockchainInfo.walletAddress': walletAddress.toLowerCase()
    });

    return res.success({
      isRegistered: !!user,
      user: user ? {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        kycStatus: user.kycInfo?.verification?.overallStatus || 'pending'
      } : null
    }, 'Wallet registration check completed');

  } catch (err) {
    logger.error('Wallet registration check error: %s', err?.message || err);
    return res.error(500, 'Server error', 13000, { error: err?.message });
  }
};

// Get registration progress
exports.getRegistrationProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('kycInfo');
    if (!user) {
      return res.error(404, 'User not found', 14001);
    }

    if (user.role !== 'voter') {
      return res.error(403, 'Only voters can access registration progress', 14002);
    }

    const steps = user.kycInfo?.registrationSteps || {};
    const verification = user.kycInfo?.verification || {};

    return res.success({
      steps,
      verification,
      progress: {
        completed: Object.values(steps).filter(Boolean).length,
        total: 5,
        percentage: Math.round((Object.values(steps).filter(Boolean).length / 5) * 100)
      }
    }, 'Registration progress retrieved successfully');

  } catch (err) {
    logger.error('Registration progress error: %s', err?.message || err);
    return res.error(500, 'Server error', 14000, { error: err?.message });
  }
};

// Reset registration (start over)
exports.resetRegistration = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.error(404, 'User not found', 15001);
    }

    if (user.role !== 'voter') {
      return res.error(403, 'Only voters can reset registration', 15002);
    }

    // Reset KYC information but keep basic user data
    user.kycInfo = {
      verification: {
        kycStatus: 'pending',
        biometricStatus: 'pending',
        overallStatus: 'pending'
      },
      registrationSteps: {
        personalInfo: false,
        blockchainConnection: false,
        documentUpload: false,
        biometricVerification: false,
        reviewSubmit: false
      },
      privacyConsent: {
        dataProcessing: false,
        biometricProcessing: false,
        blockchainStorage: false,
        marketingCommunications: false
      }
    };

    await user.save();

    logger.info('Registration reset for user: %s', user.email);

    return res.success({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        kycInfo: user.kycInfo
      }
    }, 'Registration reset successfully');

  } catch (err) {
    logger.error('Registration reset error: %s', err?.message || err);
    return res.error(500, 'Server error', 15000, { error: err?.message });
  }
};

// Get registration status for display
exports.getRegistrationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('kycInfo fullName email role');
    if (!user) {
      return res.error(404, 'User not found', 16001);
    }

    if (user.role !== 'voter') {
      return res.error(403, 'Only voters can access registration status', 16002);
    }

    const verification = user.kycInfo?.verification || {};
    const steps = user.kycInfo?.registrationSteps || {};

    return res.success({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      verification,
      steps,
      overallStatus: verification.overallStatus || 'pending',
      isComplete: verification.overallStatus === 'verified',
      canVote: verification.overallStatus === 'verified'
    }, 'Registration status retrieved successfully');

  } catch (err) {
    logger.error('Registration status error: %s', err?.message || err);
    return res.error(500, 'Server error', 16000, { error: err?.message });
  }
};

// Forgot Password - Direct DB manipulation (no email/token system yet)
exports.forgotPassword = async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    const email = String(rawEmail || '').toLowerCase().trim();
    
    if (!email) {
      return res.error(400, 'Email is required', 4901);
    }

    if (config.skipDb) {
      return res.success(null, 'If that email exists, a reset link has been sent (mock mode)');
    }

    const user = await User.findOne({ email, role: 'voter' });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.success(null, 'If that email exists, a reset link has been sent');
    }

    // For now, we'll implement direct password reset without email
    // Generate a simple reset token (in production, this would be sent via email)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    logger.info('Password reset token generated for voter: %s', email);

    // For development: return the token directly (remove this in production)
    return res.success({ 
      resetToken, 
      message: 'Password reset token generated. Use this token to reset your password.',
      expiresIn: '1 hour'
    }, 'Reset token generated successfully');

  } catch (err) {
    logger.error('Error in forgot password: %s', err?.message || err);
    return res.error(500, 'Server error', 4900, { error: err?.message });
  }
};

// Reset Password - Direct DB manipulation
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token) {
      return res.error(400, 'Invalid or missing token', 5001);
    }
    
    if (!password || password.length < 6) {
      return res.error(400, 'Password must be at least 6 characters', 5002);
    }

    if (config.skipDb) {
      return res.success(null, 'Password has been reset (mock mode)');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ 
      resetPasswordToken: tokenHash, 
      resetPasswordExpires: { $gt: Date.now() },
      role: 'voter'
    });
    
    if (!user) {
      return res.error(400, 'Token is invalid or has expired', 5003);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0; // Reset login attempts
    user.lockUntil = undefined; // Unlock account
    await user.save();

    logger.info('Password reset successful for voter: %s', user.email);

    return res.success(null, 'Password has been reset successfully');

  } catch (err) {
    logger.error('Error in reset password: %s', err?.message || err);
    return res.error(500, 'Server error', 5000, { error: err?.message });
  }
};
