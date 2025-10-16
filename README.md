# Hybrid Voting DApp

This repository contains a reference implementation for a hybrid on-chain/off-chain voting system with end-to-end (E2E) encryption and a placeholder Liquid Democracy delegation token.

Phases included:

Quick start (local dev):


## Blockchain Voting System

This repository is a hybrid on-chain/off-chain voting reference implementation. It includes:
- Smart contracts (Solidity)
- Backend API (Express + MongoDB)
- Frontend DApp (React + Vite)
- Developer tooling (docker-compose, Swagger)

Quick start (local dev):

1. Copy the `.env.example` into `server/.env` and edit values (MONGO_URI, JWT_SECRET, etc.).

Note: The `server/.env` file included in this repo has been sanitized and contains placeholder values (no real Atlas credentials). For production, set `MONGO_URI` to your MongoDB Atlas connection string and never commit secrets to the repository.

2. From repository root, bring up services (requires Docker):

```bash
docker-compose up --build
```

This starts a local MongoDB, Ganache (local blockchain), the server (port 5000) and client (port 5173).

3. Install dependencies if running locally without Docker:

```bash
# server
cd server
npm install

# client
cd ../client
npm install

# back to repo root
cd ..
```

4. Run the full dev stack (root):

```bash
npm run dev
```

API docs / Swagger UI: http://localhost:5000/api/docs

Health endpoint: http://localhost:5000/api/health

Docker networking note: when running with `docker-compose` the frontend container is configured to talk to the backend at `http://server:5000/api` (see `docker-compose.prod.yml`). That URL is accessible from inside the client container; for local development (running Vite on your host) use `VITE_API_BASE_URL=http://localhost:5000/api` in `client/.env`.

.env example: See `.env.example` at repository root for recommended variables.

Notes and safety:
- This project contains development-mode mocks (`BLOCKCHAIN_MOCK`, `SKIP_DB`). Do not enable these in production.
- Store secrets (JWT_SECRET, ADMIN_REGISTRATION_KEY) securely in production (vaults/environment variables), do not commit to git.
