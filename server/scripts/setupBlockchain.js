const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function setupBlockchain() {
  try {
    console.log('🚀 Setting up blockchain...');
    
    // Check if we're in the right directory
    const blockchainDir = path.join(__dirname, '../../blockchain');
    if (!fs.existsSync(blockchainDir)) {
      console.error('❌ Blockchain directory not found');
      return;
    }

    // Start Ganache in the background
    console.log('📡 Starting Ganache blockchain...');
    try {
      // Kill any existing Ganache processes
      execSync('pkill -f ganache-cli || true', { stdio: 'ignore' });
      
      // Start Ganache
      const ganacheProcess = execSync('npx ganache-cli --port 8545 --deterministic --accounts 10 --defaultBalanceEther 100', {
        cwd: blockchainDir,
        stdio: 'pipe',
        detached: true
      });
      
      console.log('✅ Ganache started successfully');
    } catch (error) {
      console.log('⚠️  Ganache might already be running or failed to start:', error.message);
    }

    // Wait a moment for Ganache to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Deploy the smart contract
    console.log('📝 Deploying smart contract...');
    try {
      execSync('npx truffle migrate --network development --reset', {
        cwd: blockchainDir,
        stdio: 'inherit'
      });
      
      console.log('✅ Smart contract deployed successfully');
      
      // Get the contract address
      const buildDir = path.join(blockchainDir, 'build', 'contracts');
      if (fs.existsSync(path.join(buildDir, 'Voting.json'))) {
        const contractData = JSON.parse(fs.readFileSync(path.join(buildDir, 'Voting.json'), 'utf8'));
        const contractAddress = contractData.networks['1760625242142']?.address; // This is the network ID from Ganache
        
        if (contractAddress) {
          console.log('📋 Contract Address:', contractAddress);
          
          // Update the .env file
          const envPath = path.join(__dirname, '../.env');
          let envContent = '';
          
          if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
          }
          
          // Update or add the contract address
          if (envContent.includes('VOTING_CONTRACT_ADDRESS=')) {
            envContent = envContent.replace(
              /VOTING_CONTRACT_ADDRESS=.*/,
              `VOTING_CONTRACT_ADDRESS=${contractAddress}`
            );
          } else {
            envContent += `\nVOTING_CONTRACT_ADDRESS=${contractAddress}\n`;
          }
          
          // Set blockchain mock to false
          if (envContent.includes('BLOCKCHAIN_MOCK=')) {
            envContent = envContent.replace(
              /BLOCKCHAIN_MOCK=.*/,
              'BLOCKCHAIN_MOCK=false'
            );
          } else {
            envContent += '\nBLOCKCHAIN_MOCK=false\n';
          }
          
          fs.writeFileSync(envPath, envContent);
          console.log('✅ Environment file updated with contract address');
          console.log('🔄 Please restart the server to use the real blockchain');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to deploy smart contract:', error.message);
      console.log('💡 Using mock blockchain instead...');
    }

  } catch (error) {
    console.error('❌ Error setting up blockchain:', error.message);
  }
}

// Run the script
setupBlockchain().then(() => {
  console.log('🎉 Blockchain setup completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
