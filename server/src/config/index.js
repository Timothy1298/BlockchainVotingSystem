require('dotenv').config();

const get = (key, fallback) => {
  const v = process.env[key];
  return typeof v === 'undefined' ? fallback : v;
};

module.exports = {
  port: parseInt(get('PORT', '5000'), 10),
  mongoUri: get('MONGO_URI', 'mongodb://localhost:27017/voting_system'),
  jwtSecret: get('JWT_SECRET', 'dev-secret'),
  adminRegistrationKey: get('ADMIN_REGISTRATION_KEY', null),
  blockchainRpc: get('BLOCKCHAIN_RPC', 'http://127.0.0.1:8545'),
  votingContractAddress: get('VOTING_CONTRACT_ADDRESS', '0x53a36f3419cfcADec5378ED2Ed91134b8fC9680a'),
  skipDb: get('SKIP_DB', 'false') === 'true',
  blockchainMock: get('BLOCKCHAIN_MOCK', 'false') === 'true',
  logLevel: get('LOG_LEVEL', 'info'),
};
