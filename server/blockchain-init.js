#!/usr/bin/env node
/*
 * server/blockchain-init.js
 *
 * Connects to a local Ganache RPC, looks for a Truffle compiled artifact for
 * `Voting` (several candidate paths), and ensures a deployed contract exists.
 * If not deployed, deploys the contract using the first account, then writes
 * the deployed address and ABI to `server/deployed/contract-info.json`.
 *
 * Returns a Web3 Contract instance when used programmatically.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

const RPC = process.env.BLOCKCHAIN_RPC || 'http://127.0.0.1:8545';
const OUT_DIR = path.join(__dirname, 'deployed');
const OUT_PATH = path.join(OUT_DIR, 'contract-info.json');

const ARTIFACT_CANDIDATES = [
  path.join(__dirname, '..', 'blockchain', 'build', 'contracts', 'Voting.json'),
  path.join(__dirname, '..', 'blockchain', 'build', 'Voting.json'),
  path.join(__dirname, '..', 'artifacts', 'contracts', 'Voting.sol', 'Voting.json'),
  path.join(__dirname, '..', 'artifacts', 'Voting.json'),
  path.join(__dirname, '..', '..', 'blockchain', 'build', 'contracts', 'Voting.json'),
  path.join(__dirname, '..', '..', 'blockchain', 'build', 'Voting.json'),
];

function findArtifact() {
  for (const p of ARTIFACT_CANDIDATES) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        console.log('Found contract artifact at', p);
        return { data, path: p };
      } catch (err) {
        console.warn('Could not parse artifact at', p, err.message || err);
      }
    }
  }
  return null;
}

async function ensureDeployed() {
  const web3 = new Web3(RPC);
  const networkId = await web3.eth.net.getId();

  // If we already have a saved deployed file, and the contract code exists at that address, use it
  if (fs.existsSync(OUT_PATH)) {
    try {
      const saved = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
      if (saved && saved.address) {
        const code = await web3.eth.getCode(saved.address);
        if (code && code !== '0x') {
          console.log('Using previously deployed contract at', saved.address);
          const contract = new web3.eth.Contract(saved.abi, saved.address);
          return { web3, contract, address: saved.address, fromSaved: true };
        }
        console.log('Saved contract address has no code on chain, will attempt redeploy.');
      }
    } catch (err) {
      console.warn('Failed to read saved deployed info:', err.message || err);
    }
  }

  // Find a compiled artifact
  const found = findArtifact();
  if (!found) {
    throw new Error('No compiled contract artifact found (looked for Voting.json in several locations)');
  }

  const artifact = found.data;
  const abi = artifact.abi || artifact._json?.abi || null;
  const bytecode = artifact.bytecode || artifact.deployedBytecode || artifact._json?.bytecode || null;

  // If artifact contains a networks mapping for current network, reuse that address if code exists
  if (artifact.networks && artifact.networks[networkId] && artifact.networks[networkId].address) {
    const addr = artifact.networks[networkId].address;
    const code = await web3.eth.getCode(addr);
    if (code && code !== '0x') {
      console.log(`Found deployed contract in artifact.networks for network ${networkId}: ${addr}`);
      const contract = new web3.eth.Contract(abi, addr);
      // Persist to OUT_PATH for convenience
      await persistDeployment(addr, abi, networkId);
      return { web3, contract, address: addr, fromSaved: false };
    }
    console.log('Artifact contained an address but chain has no code there; will deploy anew.');
  }

  if (!abi) {
    throw new Error('No ABI found in artifact');
  }

  if (!bytecode || bytecode === '0x' || bytecode.length === 0) {
    throw new Error('No bytecode found in artifact — cannot deploy');
  }

  // Deploy the contract using the first account
  const accounts = await web3.eth.getAccounts();
  if (!accounts || accounts.length === 0) throw new Error('No accounts available from RPC');
  const deployer = accounts[0];

  console.log('Deploying contract from', deployer, 'to network', networkId);
  const Contract = new web3.eth.Contract(abi);
  const deployTx = Contract.deploy({ data: bytecode.startsWith('0x') ? bytecode : `0x${bytecode}` });

  const estimatedGas = await deployTx.estimateGas({ from: deployer }).catch(() => null);
  const gas = estimatedGas ? Math.min(8_000_000, Math.max(300_000, estimatedGas)) : 3_000_000;

  const instance = await deployTx.send({ from: deployer, gas });
  const address = instance.options.address;
  console.log('Contract deployed at', address);

  await persistDeployment(address, abi, networkId, instance.transactionHash);

  return { web3, contract: instance, address, fromSaved: false };
}

async function persistDeployment(address, abi, networkId, txHash) {
  try {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    const payload = {
      address,
      abi,
      networkId,
      txHash: txHash || null,
      deployedAt: new Date().toISOString(),
      rpc: RPC,
    };
    fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), 'utf8');
    console.log('Saved deployed contract info to', OUT_PATH);
  } catch (err) {
    console.warn('Failed to persist deployment info:', err.message || err);
  }
}

// Export the initializer for programmatic use
module.exports = async function initBlockchain() {
  return ensureDeployed();
};

// If run directly, initialize and print summary
if (require.main === module) {
  ensureDeployed()
    .then(({ address }) => {
      console.log('Initialization complete. Contract address:', address);
      process.exit(0);
    })
    .catch(err => {
      console.error('Blockchain init failed:', err.message || err);
      process.exit(1);
    });
}
