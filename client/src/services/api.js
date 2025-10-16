import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

// ---- Convenience API helpers used by new frontend components ----
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
