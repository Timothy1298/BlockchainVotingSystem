const express = require('express');
const router = express.Router();
const { 
  getPendingKycApplications, 
  getKycApplicationDetails, 
  approveKycApplication, 
  rejectKycApplication,
  getKycStatistics 
} = require('../controllers/adminKycController');
const { mandatory } = require('../middleware/auth');
const { body } = require('express-validator');

// All routes require authentication
router.use(mandatory);

// Get KYC statistics
router.get('/statistics', getKycStatistics);

// Get all pending KYC applications
router.get('/pending', getPendingKycApplications);

// Get specific KYC application details
router.get('/application/:userId', getKycApplicationDetails);

// Approve KYC application
router.post('/approve/:userId', 
  [
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  approveKycApplication
);

// Reject KYC application
router.post('/reject/:userId',
  [
    body('reason').notEmpty().withMessage('Rejection reason is required'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  rejectKycApplication
);

module.exports = router;
