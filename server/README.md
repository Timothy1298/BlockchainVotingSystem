Local development (server)
==========================

Quick start (docker-compose)

1. Copy the example env and edit values as needed:

   cp .env.example .env

2. Bring up the local dev stack (MongoDB + Ganache + server):

   # from repo root
   ./start-system.sh

This will build and start the server bound to port 5000 and a local MongoDB on 27017.

If you prefer not to use Docker, start MongoDB locally and then run:

   cd server
   npm install
   npm run dev

Notes
-----
- The health endpoint is available at /api/health and now reports DB readyState and the configured voting contract address.
- To avoid WalletConnect warnings on the client, set VITE_WALLETCONNECT_PROJECT_ID in the client environment.
