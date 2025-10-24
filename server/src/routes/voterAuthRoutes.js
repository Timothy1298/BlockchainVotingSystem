const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { optional, mandatory } = require('../middleware/auth');
const voterAuthController = require('../controllers/voterAuthController');
const { upload } = require('../middleware/upload');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

// Validation middleware
const validateVoterRegistration = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('kycInfo.firstName').optional().notEmpty().withMessage('First name is required'),
  body('kycInfo.lastName').optional().notEmpty().withMessage('Last name is required'),
  body('kycInfo.phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('kycInfo.dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('kycInfo.nationality').optional().notEmpty().withMessage('Nationality is required'),
  body('kycInfo.address.street').optional().notEmpty().withMessage('Street address is required'),
  body('kycInfo.address.city').optional().notEmpty().withMessage('City is required'),
  body('kycInfo.address.state').optional().notEmpty().withMessage('State is required'),
  body('kycInfo.address.zipCode').optional().notEmpty().withMessage('ZIP code is required'),
  body('kycInfo.address.country').optional().notEmpty().withMessage('Country is required')
];

const validateVoterLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateWalletConnection = [
  body('walletAddress').isEthereumAddress().withMessage('Valid Ethereum address is required'),
  body('walletType').optional().isIn(['MetaMask', 'WalletConnect', 'Other']).withMessage('Invalid wallet type')
];

const validateDocumentUpload = [
  body('documentType').isIn(['governmentId', 'proofOfAddress', 'selfie']).withMessage('Invalid document type'),
  body('fileUrl').isURL().withMessage('Valid file URL is required')
];

const validateBiometricSubmission = [
  body('biometricTemplate').notEmpty().withMessage('Biometric template is required'),
  body('confidence').optional().isFloat({ min: 0, max: 100 }).withMessage('Confidence must be between 0 and 100'),
  body('livenessCheck.passed').optional().isBoolean().withMessage('Liveness check result must be boolean'),
  body('livenessCheck.confidence').optional().isFloat({ min: 0, max: 100 }).withMessage('Liveness confidence must be between 0 and 100')
];

const validateProfileUpdate = [
  body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('contact').optional().isMobilePhone().withMessage('Valid contact number is required'),
  body('region').optional().notEmpty().withMessage('Region cannot be empty')
];

// Public routes (no authentication required)
router.post('/register', registerLimiter, validateVoterRegistration, voterAuthController.registerVoter);
router.post('/login', loginLimiter, validateVoterLogin, voterAuthController.loginVoter);
router.post('/forgot-password', voterAuthController.forgotPassword);
router.post('/reset-password/:token', voterAuthController.resetPassword);

// Protected routes (authentication required)
router.use(mandatory);

// KYC and registration management
router.put('/kyc', voterAuthController.updateKycInfo);
router.get('/kyc-status', voterAuthController.getKycStatus);
router.post('/connect-wallet', validateWalletConnection, voterAuthController.connectWallet);
router.post('/upload-document', upload.single('file'), validateDocumentUpload, voterAuthController.uploadDocument);
router.post('/submit-biometric', validateBiometricSubmission, voterAuthController.submitBiometric);
router.post('/submit-registration', voterAuthController.submitRegistration);

// Profile management
router.get('/profile', voterAuthController.getVoterProfile);
router.put('/profile', validateProfileUpdate, voterAuthController.updateVoterProfile);

// Additional utility routes
router.get('/check-wallet/:walletAddress', voterAuthController.checkWalletRegistration);
router.get('/registration-progress', voterAuthController.getRegistrationProgress);
router.post('/reset-registration', voterAuthController.resetRegistration);
router.get('/registration-status', voterAuthController.getRegistrationStatus);

module.exports = router;
