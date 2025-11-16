// bulk_add_candidates.js
// Adds 3 generated candidates per seat for a given election.

const { faker } = require('@faker-js/faker');

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@voting.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ELECTION_ID = process.env.ELECTION_ID || '68e16aa987c25e7b75e27528';

async function login() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Login failed: ${JSON.stringify(json)}`);
  const token = json?.data?.accessToken;
  if (!token) throw new Error('No accessToken returned from login');
  return token;
}

async function getElection(token) {
  const res = await fetch(`${API_BASE}/elections/${ELECTION_ID}`, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  if (!res.ok) throw new Error(`Failed to fetch election: ${JSON.stringify(json)}`);
  return json;
}

async function addCandidate(token, payload) {
  const res = await fetch(`${API_BASE}/elections/${ELECTION_ID}/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Add candidate failed: ${JSON.stringify(json)}`);
  return json;
}

function makeCandidate(seat, idx) {
  const fullName = faker.person.firstName() + ' ' + faker.person.lastName();
  const email = `${fullName.toLowerCase().replace(/\s+/g,'')}.${idx}@example.com`;
  return {
    name: fullName,
    seat,
    bio: faker.lorem.sentence(),
    manifesto: faker.lorem.paragraph(),
    party: faker.company.name(),
    email,
    phone: faker.phone.number('07########'),
    age: Math.floor(Math.random() * 20) + 20,
    photoUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 })
  };
}

async function run() {
  try {
    console.log('Logging in as', ADMIN_EMAIL);
    const token = await login();
    console.log('Fetching election', ELECTION_ID);
    const election = await getElection(token);
    const seats = election.seats || election.data?.seats || [];
    if (!Array.isArray(seats) || seats.length === 0) {
      console.error('No seats found on election:', seats);
      process.exit(1);
    }

    console.log(`Found ${seats.length} seats. Adding 3 candidates per seat...`);
    for (const seat of seats) {
      for (let i = 1; i <= 3; i++) {
        const candidate = makeCandidate(seat, i);
        try {
          const res = await addCandidate(token, candidate);
          console.log('Added candidate for seat', seat, 'name=', candidate.name);
        } catch (err) {
          console.error('Error adding candidate for seat', seat, err?.message || err);
        }
        // small delay to avoid hammering
        await new Promise(r => setTimeout(r, 250));
      }
    }

    console.log('Done adding candidates.');
    process.exit(0);
  } catch (err) {
    console.error('Bulk add error', err?.message || err);
    process.exit(1);
  }
}

run();
