#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');

const API = (process.env.API_BASE || 'http://localhost:5000') + '/api';

async function run() {
  try {
    const loginRes = await axios.post(`${API}/auth/login`, { email: 'admin@voting.local', password: 'adminpass123' });
    const token = loginRes.data?.data?.accessToken;
    console.log('Got token:', !!token);
    const res = await axios.get(`${API}/elections/overview`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Overview response:');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

if (require.main === module) run();
