import axios from 'axios';

const API = axios.create({
  // Prefer explicit Vite env var; fall back to the backend default so dev client doesn't proxy to Vite's origin
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Simple cache for GET requests
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Attach token if present
API.interceptors.request.use((config) => {
  try {
    // Ensure config exists and has required properties
    if (!config) {
      config = {};
    }
    
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {};
    }
    
    // Ensure method is properly set and is a string - this is the critical fix
    if (!config.method) {
      config.method = 'GET';
    } else if (typeof config.method !== 'string') {
      config.method = String(config.method).toUpperCase();
    } else {
      config.method = config.method.toUpperCase();
    }
    
    // Add authentication token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add cache key for GET requests (but skip cache for elections)
    if (config.method === 'GET' && !config.url?.includes('/elections')) {
      const cacheKey = `${config.url || ''}?${JSON.stringify(config.params || {})}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Return a rejected promise with a special flag so axios internals don't treat it as a config object.
        // The response error handler will transform this into a resolved response.
        return Promise.reject({ __fromCache: true, data: cached.data, config: { ...config, cacheKey } });
      }
      config.cacheKey = cacheKey;
    }
    
    return config;
  } catch (error) {
    console.error('Error in request interceptor:', error);
    // Return a safe default config
    return {
      method: 'get',
      headers: {},
      ...config
    };
  }
});

// Cache successful GET responses
API.interceptors.response.use(
  (response) => {
    if (response.config && response.config.method === 'GET' && response.config.cacheKey && !response.fromCache && !response.config.url?.includes('/elections')) {
      cache.set(response.config.cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  async (error) => {
    // Transform cache short-circuit into a resolved response
    if (error && error.__fromCache) {
      return Promise.resolve({ data: error.data, fromCache: true, config: error.config });
    }

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect if we're already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Cache management functions
export const clearCache = () => {
  cache.clear();
};

export const clearCacheForUrl = (urlPattern) => {
  for (const [key] of cache) {
    if (key.includes(urlPattern)) {
      cache.delete(key);
    }
  }
};

export const clearElectionsCache = () => {
  clearCacheForUrl('/elections');
  console.log('Elections cache cleared');
};

// Clear all cache
export const clearAllCache = () => {
  cache.clear();
  console.log('All cache cleared');
};

export default API;

// ===== AUTHENTICATION API =====
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials).then(res => res.data),
  register: (userData) => API.post('/auth/register', userData).then(res => res.data),
  getMe: () => API.get('/auth/me').then(res => res.data),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }).then(res => res.data),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }).then(res => res.data),
  refreshToken: (refreshToken) => API.post('/auth/refresh', { refreshToken }).then(res => res.data),
  logout: () => API.post('/auth/logout').then(res => res.data),
};

// ===== ELECTIONS API =====
export const electionsAPI = {
  // Basic CRUD
  list: () => API.get('/elections').then(res => res.data),
  get: (id) => API.get(`/elections/${id}`).then(res => res.data),
  create: (electionData) => API.post('/elections', electionData).then(res => res.data),
  update: (id, electionData) => API.put(`/elections/${id}`, electionData).then(res => res.data),
  delete: (id) => API.delete(`/elections/${id}`).then(res => res.data),
  
  // F.1.2: Election Lifecycle Control
  changeStatus: (id, status, adminPassword) => API.patch(`/elections/${id}/status`, { status, adminPassword }).then(res => res.data),
  toggleVoting: (id, enabled) => API.patch(`/elections/${id}/voting`, { enabled }).then(res => res.data),
  resetElection: (id, resetData) => API.post(`/elections/${id}/reset`, resetData).then(res => res.data),
  clearVotes: (id, adminPassword) => API.post(`/elections/${id}/clear-votes`, { adminPassword }).then(res => res.data),
  lockCandidateList: (id) => API.patch(`/elections/${id}/candidates/lock`).then(res => res.data),
  
  // F.3.1: Candidate Management
  addCandidate: (id, candidateData) => API.post(`/elections/${id}/candidates`, candidateData).then(res => res.data),
  getCandidates: (id) => API.get(`/elections/${id}/candidates`).then(res => res.data),
  updateCandidate: (electionId, candidateId, candidateData) => API.put(`/elections/${electionId}/candidates/${candidateId}`, candidateData).then(res => res.data),
  deleteCandidate: (electionId, candidateId) => API.delete(`/elections/${electionId}/candidates/${candidateId}`).then(res => res.data),
  bulkImportCandidates: (id, candidates) => API.post(`/elections/${id}/candidates/bulk-import`, { candidates }).then(res => res.data),
  lockCandidateList: (id) => API.patch(`/elections/${id}/candidates/lock`).then(res => res.data),
  
  // Voting
  vote: (electionId, voteData) => API.post(`/elections/${electionId}/vote`, voteData).then(res => res.data),
  
  // F.5.1-F.5.3: Results & Tallying
  finalizeTally: (id, adminPassword) => API.post(`/elections/${id}/finalize`, { adminPassword }).then(res => res.data),
  getTurnoutAnalytics: (id) => API.get(`/elections/${id}/turnout`).then(res => res.data),
  getFinalResults: (id) => API.get(`/elections/${id}/results`).then(res => res.data),
  exportResults: (id, format = 'json') => API.get(`/elections/${id}/export?format=${format}`).then(res => res.data),
  
  // Overview
  getOverview: () => API.get('/elections/overview').then(res => res.data),
};

// ===== VOTERS API =====
export const votersAPI = {
  // F.2.1: Voter Registration & Verification
  register: (voterData) => API.post('/voters/register', voterData).then(res => res.data),
  registerCSV: (csvData) => API.post('/voters/register-csv', csvData).then(res => res.data),
  approve: (voterId, reason) => API.post(`/voters/${voterId}/approve`, { reason }).then(res => res.data),
  reject: (voterId, reason) => API.post(`/voters/${voterId}/reject`, { reason }).then(res => res.data),
  resetAccess: (voterId, reason) => API.post(`/voters/${voterId}/reset`, { reason }).then(res => res.data),
  blacklist: (voterId, reason) => API.post(`/voters/${voterId}/blacklist`, { reason }).then(res => res.data),
  generateToken: (voterId) => API.post(`/voters/${voterId}/token`).then(res => res.data),
  forceLogout: (voterId, reason) => API.post(`/voters/${voterId}/force-logout`, { reason }).then(res => res.data),
  
  // F.2.3: Voter Lookup & Status
  search: (query) => API.get('/voters/search', { params: { query } }).then(res => res.data),
  getStatus: (voterId) => API.get(`/voters/${voterId}/status`).then(res => res.data),
  getAllVoters: (params) => API.get('/voters/all', { params }).then(res => res.data),
  getPendingVerification: () => API.get('/voters/pending-verification').then(res => res.data),
  registerForElection: (voterId, electionId) => API.post(`/voters/${voterId}/register-election/${electionId}`).then(res => res.data),
  
  // Bulk Operations
  bulkManagement: (action, voterIds, reason) => API.post('/voters/bulk-management', { action, voterIds, reason }).then(res => res.data),
  
  // Basic CRUD
  list: () => API.get('/voters').then(res => res.data),
  update: (id, voterData) => API.put(`/voters/${id}`, voterData).then(res => res.data),
  delete: (id) => API.delete(`/voters/${id}`).then(res => res.data),
};

// ===== VOTING API =====
export const votingAPI = {
  // F.4.1: Cast Vote
  vote: (voteData) => API.post('/votes/vote', voteData).then(res => res.data),
  
  // F.4.2: Vote Receipt Verification
  verifyReceipt: (receiptHash, electionId) => API.get('/votes/verify-receipt', { 
    params: { receiptHash, electionId } 
  }).then(res => res.data),
  
  // Vote status and candidates
  hasVoted: (electionId) => API.get('/votes/hasVoted', { params: { electionId } }).then(res => res.data),
  getCandidates: (electionId) => API.get('/votes/candidates', { params: { electionId } }).then(res => res.data),
  
  // Admin only
  addCandidate: (candidateData) => API.post('/votes/candidates', candidateData).then(res => res.data),
};

// ===== SYSTEM MONITORING API =====
export const systemAPI = {
  // F.6.1: Immutable System Logs
  getLogs: (params) => API.get('/system/logs', { params }).then(res => res.data),
  createLog: (logData) => API.post('/system/logs', logData).then(res => res.data),
  
  // F.6.2: Security & Fraud Notifications
  getSecurityNotifications: (params) => API.get('/system/notifications/security', { params }).then(res => res.data),
  createSecurityAlert: (alertData) => API.post('/system/notifications/security', alertData).then(res => res.data),
  
  // F.6.3: Blockchain Node Health Monitor
  checkBlockchainHealth: () => API.get('/system/blockchain/health').then(res => res.data),
  getBlockchainStatus: (params) => API.get('/system/blockchain/status', { params }).then(res => res.data),
  
  // Security monitoring
  monitorFailedLogins: (params) => API.get('/system/security/failed-logins', { params }).then(res => res.data),
  
  // Audit trail
  getAuditTrail: (params) => API.get('/system/audit-trail', { params }).then(res => res.data),
  
  // System health report
  getHealthReport: () => API.get('/system/health-report').then(res => res.data),
  getSystemHealthReport: () => API.get('/system/health-report').then(res => res.data), // Alias for compatibility
  getBlockchainHealth: () => API.get('/system/blockchain/health').then(res => res.data),
  
  // Additional system monitoring methods
  clearLogs: () => API.delete('/system/logs').then(res => res.data),
  getLogStats: () => API.get('/system/logs/stats').then(res => res.data),
  getLogComponents: () => API.get('/system/logs/components').then(res => res.data),
};

// ===== ANALYTICS API =====
export const analyticsAPI = {
  getMetrics: () => API.get('/analytics/metrics').then(res => res.data),
  getDashboardData: () => API.get('/analytics/dashboard').then(res => res.data),
  getVoterStats: () => API.get('/analytics/voter-stats').then(res => res.data),
  getElectionStats: () => API.get('/analytics/election-stats').then(res => res.data),
  getAnalytics: () => API.get('/analytics').then(res => res.data),
  
  // F.6.3: Blockchain Performance Metrics
  getBlockchainPerformance: () => API.get('/analytics/blockchain-performance').then(res => res.data),
  
  // F.6.3: Turnout Reports
  getTurnoutReports: (params) => API.get('/analytics/turnout-reports', { params }).then(res => res.data),
  
  // F.5.2: Post-Election Audit Reports
  generateAuditReport: (electionId, format = 'json') => API.get(`/analytics/audit-report/${electionId}?format=${format}`).then(res => res.data),
  
  // F.6.3: Geographic/Browser Breakdown
  getGeographicBreakdown: (electionId) => API.get('/analytics/geographic-breakdown', { params: { electionId } }).then(res => res.data),
};

// ===== MAINTENANCE / BACKUP API =====
export const maintenanceAPI = {
  createBackup: (options) => API.post('/maintenance/backup', options).then(res => res.data),
  restoreBackup: (backupFolder) => API.post('/maintenance/restore', { backupFolder }).then(res => res.data),
  listBackups: () => API.get('/maintenance/backups').then(res => res.data),
};

// ===== NOTIFICATIONS API =====
export const notificationsAPI = {
  list: (params) => API.get('/notifications', { params }).then(res => res.data),
  getNotifications: (params) => API.get('/notifications', { params }).then(res => res.data), // Alias for compatibility
  create: (notificationData) => API.post('/notifications', notificationData).then(res => res.data),
  markAsRead: (id) => API.patch(`/notifications/${id}/read`).then(res => res.data),
  markAllAsRead: () => API.patch('/notifications/read-all').then(res => res.data),
  delete: (id) => API.delete(`/notifications/${id}`).then(res => res.data),
  getUnreadCount: () => API.get('/notifications/unread-count').then(res => res.data),
  getByType: (type) => API.get(`/notifications/type/${type}`).then(res => res.data),
  getBySeverity: (severity) => API.get(`/notifications/severity/${severity}`).then(res => res.data),
  
  // F.6.2: Enhanced notification management
  acknowledge: (id, reason) => API.patch(`/notifications/${id}/acknowledge`, { reason }).then(res => res.data),
  dismiss: (id, reason) => API.patch(`/notifications/${id}/dismiss`, { reason }).then(res => res.data),
  getSettings: () => API.get('/notifications/settings').then(res => res.data),
  updateSettings: (settings) => API.put('/notifications/settings', { settings }).then(res => res.data),
  createSecurityAlert: (alertData) => API.post('/notifications/security-alert', alertData).then(res => res.data),
  createOperationalAlert: (alertData) => API.post('/notifications/operational-alert', alertData).then(res => res.data),
};

// ===== USERS API =====
export const usersAPI = {
  list: () => API.get('/users').then(res => res.data),
  get: (id) => API.get(`/users/${id}`).then(res => res.data),
  update: (id, userData) => API.put(`/users/${id}`, userData).then(res => res.data),
  delete: (id) => API.delete(`/users/${id}`).then(res => res.data),
  search: (query) => API.get('/users/search', { params: { query } }).then(res => res.data),
  
  // Profile management
  getMe: () => API.get('/users/me').then(res => res.data),
  updateMe: (userData) => API.put('/users/me', userData).then(res => res.data),
  changePassword: (passwordData) => API.put('/users/me/password', passwordData).then(res => res.data),
  getSecuritySettings: () => API.get('/users/me/security').then(res => res.data),
  
  // 2FA management
  setup2FA: () => API.post('/users/me/2fa/setup').then(res => res.data),
  verify2FA: (token) => API.post('/users/me/2fa/verify', { token }).then(res => res.data),
  disable2FA: (password) => API.post('/users/me/2fa/disable', { password }).then(res => res.data),
  
  // Session management
  getActiveSessions: () => API.get('/users/me/sessions').then(res => res.data),
  logoutOtherDevices: (password) => API.post('/users/me/logout-other-devices', { password }).then(res => res.data),
  
  // Notification preferences
  updateNotificationPreferences: (preferences) => API.put('/users/me/notification-preferences', { preferences }).then(res => res.data),
};

// ===== RESULTS API =====
export const resultsAPI = {
  getFinalResults: (electionId) => API.get(`/elections/${electionId}/results`).then(res => res.data),
  getTurnoutAnalytics: (electionId) => API.get(`/elections/${electionId}/turnout`).then(res => res.data),
  getLiveResults: (electionId) => API.get(`/elections/${electionId}/live-results`).then(res => res.data),
  exportResults: (electionId, format = 'json') => API.get(`/elections/${electionId}/export`, { 
    params: { format },
    responseType: format === 'csv' ? 'blob' : 'json'
  }).then(res => res.data),
  verifyResults: (electionId) => API.post(`/elections/${electionId}/verify-results`).then(res => res.data),
};

// ===== CONFIG API =====
export const configAPI = {
  get: () => API.get('/config').then(res => res.data),
  update: (configData) => API.put('/config', configData).then(res => res.data),
  getElectionSettings: (electionId) => API.get(`/config/elections/${electionId}`).then(res => res.data),
  setRules: (electionId, rules) => API.post(`/config/elections/${electionId}/rules`, rules).then(res => res.data),
  setPhases: (electionId, phases) => API.post(`/config/elections/${electionId}/phases`, phases).then(res => res.data),
  setBallotStructure: (electionId, structure) => API.post(`/config/elections/${electionId}/ballot-structure`, { structure }).then(res => res.data),
  // Localization / language settings
  setLocalization: (localizationData) => API.post('/config/localization', localizationData).then(res => res.data),
};

// ===== BLOCKCHAIN API =====
export const blockchainAPI = {
  getStatus: () => API.get('/blockchain/status').then(res => res.data),
  getHealth: () => API.get('/blockchain/health').then(res => res.data),
  getMetrics: () => API.get('/blockchain/metrics').then(res => res.data),
  previewElection: (electionId) => API.get(`/blockchain/elections/${electionId}/preview`).then(res => res.data),
  
  // F.6.3: Blockchain Health Monitor
  checkBlockchainHealth: () => API.get('/blockchain/health').then(res => res.data),
  getNodeStatus: (nodeId) => API.get(`/blockchain/nodes/status${nodeId ? `/${nodeId}` : ''}`).then(res => res.data),
  getNetworkConfiguration: () => API.get('/blockchain/network-config').then(res => res.data),
  getGasTracker: () => API.get('/blockchain/gas-tracker').then(res => res.data),
  getBlockExplorer: (params) => API.get('/blockchain/block-explorer', { params }).then(res => res.data),
};

// ===== SUPPORT API =====
export const supportAPI = {
  contactSupport: (data) => API.post('/support/contact', data).then(res => res.data),
  getFAQ: () => API.get('/support/faq').then(res => res.data),
  getSystemInfo: () => API.get('/support/system-info').then(res => res.data),
  submitFeedback: (data) => API.post('/support/feedback', data).then(res => res.data),
};

// ===== ADMIN SETTINGS API =====
export const adminSettingsAPI = {
  // User Role Management
  getUserRoles: () => API.get('/admin-settings/user-roles').then(res => res.data),
  updateUserRole: (userId, role) => API.put('/admin-settings/user-roles', { userId, role }).then(res => res.data),
  
  // External Integrations
  getExternalIntegrations: () => API.get('/admin-settings/external-integrations').then(res => res.data),
  updateExternalIntegrations: (integrations) => API.put('/admin-settings/external-integrations', { integrations }).then(res => res.data),
  testIntegration: (type, config) => API.post(`/admin-settings/test-integration/${type}`, { config }).then(res => res.data),
  
  // Security Policies
  getSecurityPolicies: () => API.get('/admin-settings/security-policies').then(res => res.data),
  updateSecurityPolicies: (policies) => API.put('/admin-settings/security-policies', { policies }).then(res => res.data),
  
  // System Maintenance
  getSystemMaintenance: () => API.get('/admin-settings/system-maintenance').then(res => res.data),
  performMaintenance: (action) => API.post('/admin-settings/system-maintenance', { action }).then(res => res.data),
  
  // System Configuration
  getSystemConfiguration: () => API.get('/admin-settings/system-configuration').then(res => res.data),
  updateSystemConfiguration: (config) => API.put('/admin-settings/system-configuration', { config }).then(res => res.data),
};

// ---- Legacy convenience API helpers ----
export const getMetrics = async () => {
  // Returns raw Prometheus text (server exposes /api/metrics)
  const res = await API.get('/metrics', { responseType: 'text' });
  return res.data;
};

export const getBlockchainStatus = async () => {
  const res = await API.get('/blockchain/status');
  return res.data;
};

export const createElection = async (payload) => {
  // payload: { title, start, end, seats, candidates: [{name,label}] }
  const res = await API.post('/elections', payload);
  return res.data;
};

export const previewElectionOnChain = async (electionId) => {
  const res = await API.get(`/blockchain/elections/${electionId}/preview`);
  return res.data;
};

export const checkVoterEligibility = async (voterId) => {
  const res = await API.get(`/voters/check?voterId=${encodeURIComponent(voterId)}`);
  return res.data;
};

export const uploadEligibilityFile = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await API.post('/voters/upload-eligibility', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
