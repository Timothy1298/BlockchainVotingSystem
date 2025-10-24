// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	fullName: { type: String, required: true },
	email: { type: String, required: true, unique: true, lowercase: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
	region: { type: String },
	eligibility: { type: String, enum: ['Eligible', 'Already Voted', 'Not Eligible'], default: 'Eligible' },
	voteReceipt: { type: String },
	qrCode: { type: String },
	history: [{ type: String }],
	// Enhanced fields for voter management
	studentId: { type: String, unique: true, sparse: true },
	faculty: { type: String },
	nationalId: { type: String, unique: true, sparse: true }, // For voter uniqueness
	contact: { type: String },
	votingHistory: [{ 
		election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' }, 
		seats: [String], 
		votedAt: Date,
		transactionHash: String,
		receiptHash: String
	}],
	walletAddress: { type: String, lowercase: true, unique: true, sparse: true },
	receiptHash: { type: String },
	// Security and authentication
	twoFactorEnabled: { type: Boolean, default: false },
	twoFactorSecret: { type: String },
	loginAttempts: { type: Number, default: 0 },
	lockUntil: { type: Date },
	lastLogin: { type: Date },
	// Voter registration status
	isRegistered: { type: Boolean, default: false },
	registrationDate: { type: Date },
	approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	
	// KYC Information - Personal Details
	kycInfo: {
		// Personal Information
		firstName: { type: String },
		lastName: { type: String },
		dateOfBirth: { type: Date },
		nationality: { type: String },
		phone: { type: String },
		
		// Address Information
		address: {
			street: { type: String },
			city: { type: String },
			state: { type: String },
			zipCode: { type: String },
			country: { type: String }
		},
		
		// Blockchain Information
		blockchainInfo: {
			walletAddress: { type: String, lowercase: true },
			walletType: { type: String, enum: ['MetaMask', 'WalletConnect', 'Other'], default: 'MetaMask' },
			isConnected: { type: Boolean, default: false },
			connectedAt: { type: Date }
		},
		
		// Document Information
		documents: {
			governmentId: {
				documentType: { type: String, enum: ['passport', 'driver_license', 'national_id', 'other'] },
				documentNumber: { type: String },
				issuingCountry: { type: String },
				expiryDate: { type: Date },
				fileUrl: { type: String },
				uploadedAt: { type: Date },
				verified: { type: Boolean, default: false },
				verifiedAt: { type: Date },
				verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
			},
			proofOfAddress: {
				documentType: { type: String, enum: ['utility_bill', 'bank_statement', 'government_letter', 'other'] },
				fileUrl: { type: String },
				uploadedAt: { type: Date },
				verified: { type: Boolean, default: false },
				verifiedAt: { type: Date },
				verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
			},
			selfie: {
				fileUrl: { type: String },
				uploadedAt: { type: Date },
				verified: { type: Boolean, default: false },
				verifiedAt: { type: Date },
				verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
			}
		},
		
		// Biometric Information
		biometricInfo: {
			facialRecognition: {
				biometricTemplate: { type: String }, // Encrypted biometric data
				confidence: { type: Number, min: 0, max: 100 },
				verified: { type: Boolean, default: false },
				verifiedAt: { type: Date },
				verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
			},
			livenessCheck: {
				passed: { type: Boolean, default: false },
				confidence: { type: Number, min: 0, max: 100 },
				checkedAt: { type: Date }
			}
		},
		
		// Verification Status
		verification: {
			kycStatus: { 
				type: String, 
				enum: ['pending', 'in_progress', 'verified', 'rejected', 'expired'], 
				default: 'pending' 
			},
			biometricStatus: { 
				type: String, 
				enum: ['pending', 'verified', 'rejected'], 
				default: 'pending' 
			},
			overallStatus: { 
				type: String, 
				enum: ['pending', 'in_progress', 'verified', 'rejected', 'expired'], 
				default: 'pending' 
			},
			verificationDate: { type: Date },
			expiryDate: { type: Date },
			verificationNotes: { type: String },
			rejectionReason: { type: String },
			verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
		},
		
		// Registration Steps
		registrationSteps: {
			personalInfo: { type: Boolean, default: false },
			blockchainConnection: { type: Boolean, default: false },
			documentUpload: { type: Boolean, default: false },
			biometricVerification: { type: Boolean, default: false },
			reviewSubmit: { type: Boolean, default: false }
		},
		
		// Privacy and Consent
		privacyConsent: {
			dataProcessing: { type: Boolean, default: false },
			biometricProcessing: { type: Boolean, default: false },
			blockchainStorage: { type: Boolean, default: false },
			marketingCommunications: { type: Boolean, default: false },
			consentDate: { type: Date }
		}
	},
	
	// Audit fields
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	resetPasswordToken: String,
	resetPasswordExpires: Date,
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ nationalId: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ 'kycInfo.blockchainInfo.walletAddress': 1 });
userSchema.index({ 'kycInfo.verification.overallStatus': 1 });
userSchema.index({ 'kycInfo.verification.kycStatus': 1 });
userSchema.index({ 'kycInfo.verification.biometricStatus': 1 });
userSchema.index({ 'kycInfo.documents.governmentId.documentNumber': 1 });
userSchema.index({ 'kycInfo.phone': 1 });
userSchema.index({ role: 1, 'kycInfo.verification.overallStatus': 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
	return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware
userSchema.pre('save', function(next) {
	this.updatedAt = new Date();
	next();
});

module.exports = mongoose.model('User', userSchema);