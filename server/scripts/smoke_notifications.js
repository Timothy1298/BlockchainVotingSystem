// smoke_notifications.js
// Simple smoke test to login as admin, create a notification, list notifications, delete it, and verify deletion.

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@voting.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

async function run() {
  try {
    console.log('Logging in as', adminEmail);
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed', loginRes.status, loginJson);
      process.exit(1);
    }
    const token = loginJson?.data?.accessToken;
    if (!token) {
      console.error('No token in login response', loginJson);
      process.exit(1);
    }
    console.log('Received token (truncated):', token.slice(0,20) + '...');

    // Create notification
    const createPayload = {
      title: 'Smoke test notif',
      message: 'Created by smoke test script',
      // Notification.type enum (server): ['security','fraud','system','election','voter']
      type: 'system',
      severity: 'low'
    };

    console.log('Creating notification...');
    const createRes = await fetch(`${API_BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(createPayload)
    });
    const createJson = await createRes.json();
    if (createRes.status !== 201) {
      console.error('Create failed', createRes.status, createJson);
      process.exit(1);
    }
    const created = createJson; // controller returns raw notification
    const id = created._id || (created.data && created.data._id) || created.id;
    console.log('Created notification id:', id);

    console.log('Listing notifications...');
    const listRes = await fetch(`${API_BASE}/notifications`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const listJson = await listRes.json();
    console.log('List response keys:', Object.keys(listJson));
    console.log('First 3 notifications (if any):', JSON.stringify((listJson.notifications || []).slice(0,3), null, 2));

    // Delete
    console.log('Deleting notification id', id);
    const delRes = await fetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const delJson = await delRes.json();
    if (!delRes.ok) {
      console.error('Delete failed', delRes.status, delJson);
      process.exit(1);
    }
    console.log('Delete response:', delJson);

    // Verify
    const verifyRes = await fetch(`${API_BASE}/notifications`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const verifyJson = await verifyRes.json();
    const matches = (verifyJson.notifications || []).filter(n => (n._id || n.id) === id || n.title === createPayload.title);
    console.log('Matches after delete:', matches.length);
    if (matches.length === 0) {
      console.log('Smoke test succeeded: notification created and deleted successfully');
      process.exit(0);
    } else {
      console.error('Smoke test failed: notification still present', matches);
      process.exit(2);
    }
  } catch (err) {
    console.error('Smoke test error', err);
    process.exit(1);
  }
}

run();
