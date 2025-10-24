import API from './api';

// Voter Registration API endpoints
export const voterRegistrationAPI = {
  // Register new voter with KYC
  registerVoter: async (registrationData) => {
    return await API.post('/voter-auth/register', registrationData);
  },

  // Login voter
  loginVoter: async (credentials) => {
    return await API.post('/voter-auth/login', credentials);
  },

  // Update KYC information
  updateKycInfo: async (kycInfo) => {
    return await API.put('/voter-auth/kyc', kycInfo);
  },

  // Get KYC status
  getKycStatus: async (voterId) => {
    return await API.get('/voter-auth/kyc-status');
  },

  // Connect blockchain wallet
  connectWallet: async (walletData) => {
    return await API.post('/voter-auth/connect-wallet', walletData);
  },

  // Upload document
  uploadDocument: async (documentData) => {
    return await API.post('/voter-auth/upload-document', documentData);
  },

  // Submit biometric data
  submitBiometric: async (biometricData) => {
    return await API.post('/voter-auth/submit-biometric', biometricData);
  },

  // Submit final registration
  submitRegistration: async (privacyConsent) => {
    return await API.post('/voter-auth/submit-registration', privacyConsent);
  },

  // Get voter profile
  getVoterProfile: async () => {
    return await API.get('/voter-auth/profile');
  },

  // Update voter profile
  updateVoterProfile: async (profileData) => {
    return await API.put('/voter-auth/profile', profileData);
  },

  // Verify voter (admin only)
  verifyVoter: async (voterId, verificationData) => {
    return await API.post(`/voters/${voterId}/verify`, verificationData);
  },

  // Get voters list (admin only)
  getVoters: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    return await API.get(`/voters?${params.toString()}`);
  },

  // Get verification queue (admin only)
  getVerificationQueue: async () => {
    return await API.get('/voters/verification-queue');
  },

  // Check voter eligibility
  checkEligibility: async (walletAddress) => {
    return await API.get(`/voters/eligibility/${walletAddress}`);
  },

  // Get voter by ID
  getVoterById: async (voterId) => {
    return await API.get(`/voters/${voterId}`);
  },

  // Update voter (admin only)
  updateVoter: async (voterId, updateData) => {
    return await API.put(`/voters/${voterId}`, updateData);
  },

  // Delete voter (admin only)
  deleteVoter: async (voterId) => {
    return await API.delete(`/voters/${voterId}`);
  },

  // Bulk verify voters (admin only)
  bulkVerifyVoters: async (voterIds, verificationData) => {
    return await API.post('/voters/bulk-verify', {
      voterIds,
      verificationData
    });
  },

  // Get voter statistics (admin only)
  getVoterStatistics: async () => {
    return await API.get('/voters/statistics');
  },

  // Export voters (admin only)
  exportVoters: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.format) params.append('format', filters.format || 'csv');
    
    return await API.get(`/voters/export?${params.toString()}`, {
      responseType: 'blob'
    });
  },

  // Resend verification email
  resendVerificationEmail: async (voterId) => {
    return await API.post(`/voters/${voterId}/resend-verification`);
  },

  // Update voter status
  updateVoterStatus: async (voterId, status, notes = '') => {
    return await API.patch(`/voters/${voterId}/status`, {
      status,
      notes
    });
  },

  // Get voter documents
  getVoterDocuments: async (voterId) => {
    return await API.get(`/voters/${voterId}/documents`);
  },

  // Download voter document
  downloadVoterDocument: async (voterId, documentType) => {
    return await API.get(`/voters/${voterId}/documents/${documentType}`, {
      responseType: 'blob'
    });
  },

  // Verify biometric data
  verifyBiometric: async (voterId, biometricData) => {
    return await API.post(`/voters/${voterId}/verify-biometric`, biometricData);
  },

  // Get voter audit trail
  getVoterAuditTrail: async (voterId) => {
    return await API.get(`/voters/${voterId}/audit-trail`);
  },

  // Check duplicate registration
  checkDuplicateRegistration: async (email, phone, walletAddress) => {
    return await API.post('/voters/check-duplicate', {
      email,
      phone,
      walletAddress
    });
  },

  // Get voter registration status
  getRegistrationStatus: async (walletAddress) => {
    return await API.get(`/voters/registration-status/${walletAddress}`);
  },

  // Update voter profile
  updateVoterProfile: async (voterId, profileData) => {
    return await API.put(`/voters/${voterId}/profile`, profileData);
  },

  // Get voter verification history
  getVerificationHistory: async (voterId) => {
    return await API.get(`/voters/${voterId}/verification-history`);
  },

  // Submit voter feedback
  submitVoterFeedback: async (voterId, feedback) => {
    return await API.post(`/voters/${voterId}/feedback`, feedback);
  },

  // Get voter notifications
  getVoterNotifications: async (voterId) => {
    return await API.get(`/voters/${voterId}/notifications`);
  },

  // Mark notification as read
  markNotificationAsRead: async (voterId, notificationId) => {
    return await API.patch(`/voters/${voterId}/notifications/${notificationId}/read`);
  },

  // Get voter dashboard data
  getVoterDashboard: async (voterId) => {
    return await API.get(`/voters/${voterId}/dashboard`);
  },

  // Check if wallet address is already registered
  checkWalletRegistration: async (walletAddress) => {
    return await API.get(`/voter-auth/check-wallet/${walletAddress}`);
  },

  // Get registration progress
  getRegistrationProgress: async () => {
    return await API.get('/voter-auth/registration-progress');
  },

  // Reset registration (start over)
  resetRegistration: async () => {
    return await API.post('/voter-auth/reset-registration');
  },

  // Get registration status for display
  getRegistrationStatus: async () => {
    return await API.get('/voter-auth/registration-status');
  }
};

export default voterRegistrationAPI;
