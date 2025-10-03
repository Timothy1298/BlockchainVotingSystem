# Server README

This README explains how to run the server with either a deployed Voting contract (Truffle/Hardhat) or a mocked in-memory contract for UI development.

## Option A — Deploy with Truffle (recommended for full E2E)
1. Install truffle globally if needed:
   ```powershell
   npm install -g truffle
   ```
2. From the `blockchain/` folder, run a Truffle development node or migrate to a local network:
   ```powershell
   cd ../blockchain
   truffle develop
   # In the truffle console
   migrate --reset
   ```
   The migration will print the deployed address. Alternatively, use `truffle migrate --network development`.
3. Copy the deployed Voting contract address and set the environment variable in the `server/` folder (create a `.env` file):
   ```text
   VOTING_CONTRACT_ADDRESS=0xYourDeployedAddress
   BLOCKCHAIN_RPC=http://127.0.0.1:8545
   BLOCKCHAIN_MOCK=false
   MONGO_URI=your_mongo_uri
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the server:
   ```powershell
   cd ../server
   npm run dev
   ```

## Option B — Mock mode (fast UI development without blockchain)
1. Enable mock mode by setting `BLOCKCHAIN_MOCK=true` in `server/.env` (or set the env var in PowerShell):
   ```powershell
   $env:BLOCKCHAIN_MOCK = 'true'
   npm run dev
   ```
2. Mock behavior:
   - Three sample candidates are returned: Alice, Bob, Charlie.
   - Votes are stored in-memory. Double-vote prevention is enforced per requester IP (derived from `x-forwarded-for` or `req.ip`).
   - This is intended for local UI development only and is not persistent.

## Notes
- The server will prefer a real deployed contract when `BLOCKCHAIN_MOCK` is not `true`. If `VOTING_CONTRACT_ADDRESS` is missing, the server will log a helpful error explaining how to deploy and set the address.
- For E2E testing, use Truffle or Hardhat to deploy and point the server to a running RPC with the deployed address.

## SKIP_DB (dev)
If you're developing without a reachable MongoDB (for example, when offline or using mock mode), set `SKIP_DB=true` in `server/.env` to skip attempting to connect to the database. When enabled, auth endpoints will return HTTP 503 and the server will continue running so you can test other features.
