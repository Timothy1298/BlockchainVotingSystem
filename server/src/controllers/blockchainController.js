const { exec } = require('child_process');

exports.getConfig = async (req, res) => {
  // Return blockchain config (mocked for now)
  res.json({ blockSize: 1, miningDifficulty: 2, consensus: 'PoA', encryption: 'AES256' });
};

exports.updateConfig = async (req, res) => {
  // Update blockchain config (mocked)
  res.json({ success: true });
};

exports.listNodes = async (req, res) => {
  // Return list of nodes (mocked)
  res.json([{ id: 'node1', status: 'active' }, { id: 'node2', status: 'active' }]);
};

exports.addNode = async (req, res) => {
  // Add node (mocked)
  res.json({ success: true });
};

exports.removeNode = async (req, res) => {
  // Remove node (mocked)
  res.json({ success: true });
};

exports.txPool = async (req, res) => {
  // Return pending transactions (mocked)
  res.json([{ tx: '0xabc', status: 'pending' }]);
};

exports.setEncryption = async (req, res) => {
  // Enable/disable encryption (mocked)
  res.json({ success: true });
};

exports.fraudAlerts = async (req, res) => {
  // Return fraud alerts (mocked)
  res.json([{ id: 1, type: 'double-vote', resolved: false }]);
};

exports.backup = async (req, res) => {
  // Data backup (mocked)
  res.json({ success: true });
};

exports.restore = async (req, res) => {
  // Data restore (mocked)
  res.json({ success: true });
};
const BlockchainStatus = require('../models/BlockchainStatus');

exports.getStatus = async (req, res) => {
  const latest = await BlockchainStatus.findOne().sort({ updatedAt: -1 });
  res.json(latest || {});
};

exports.getMetrics = async (req, res) => {
  try {
    // Return blockchain performance metrics (mocked for now)
    const metrics = {
      blockHeight: 12345,
      totalTransactions: 9876,
      averageBlockTime: 15.2,
      networkHashRate: '1.5 TH/s',
      activeNodes: 8,
      pendingTransactions: 23,
      gasPrice: '20 Gwei',
      lastBlockTime: new Date().toISOString(),
      chainId: 1337,
      networkStatus: 'healthy'
    };
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blockchain metrics', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  const status = new BlockchainStatus(req.body);
  await status.save();
  res.status(201).json(status);
};

// Return a preview of how an election would be represented on-chain
exports.previewElection = async (req, res) => {
  const electionId = req.params.id;
  try {
    if (process.env.SKIP_DB === 'true') {
      // Mock preview
      return res.json({
        id: electionId,
        chainElectionId: null,
        seats: [{ name: 'Seat 1', index: 0, candidates: [{ name: 'Candidate A', chainCandidateId: 0 }] }],
        note: 'SKIP_DB mode - this is a mock preview'
      });
    }

    const Election = require('../models/Election');
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    // Map seats to candidates and (if available) chainCandidateId
    const seats = election.seats.map((s, idx) => ({
      name: s,
      index: idx,
      candidates: (election.candidates || []).filter(c => c.seat === s).map((c, i) => ({ name: c.name, chainCandidateId: c.chainCandidateId ?? i }))
    }));

    res.json({ id: election._id, chainElectionId: election.chainElectionId || null, seats, title: election.title });
  } catch (err) {
    res.status(500).json({ message: 'Error generating preview', error: err.message });
  }
};

// F.6.3: Blockchain Node Health Monitor
exports.checkBlockchainHealth = async (req, res) => {
  try {
    // Mock blockchain health data
    const healthData = {
      status: 'healthy',
      nodes: [
        {
          id: 'node-1',
          name: 'Primary Validator',
          status: 'online',
          latency: 45,
          lastBlock: 12345,
          syncStatus: 'synced',
          uptime: 99.9,
          ipAddress: '192.168.1.100',
          port: 8545,
          version: 'v1.0.0',
          memoryUsage: 65.2,
          cpuUsage: 23.1,
          diskUsage: 45.8,
          lastSeen: new Date()
        },
        {
          id: 'node-2',
          name: 'Secondary Validator',
          status: 'online',
          latency: 52,
          lastBlock: 12345,
          syncStatus: 'synced',
          uptime: 99.8,
          ipAddress: '192.168.1.101',
          port: 8545,
          version: 'v1.0.0',
          memoryUsage: 58.7,
          cpuUsage: 19.4,
          diskUsage: 42.1,
          lastSeen: new Date()
        },
        {
          id: 'node-3',
          name: 'Backup Node',
          status: 'online',
          latency: 38,
          lastBlock: 12344,
          syncStatus: 'syncing',
          uptime: 99.5,
          ipAddress: '192.168.1.102',
          port: 8545,
          version: 'v1.0.0',
          memoryUsage: 72.3,
          cpuUsage: 31.2,
          diskUsage: 38.9,
          lastSeen: new Date()
        },
        {
          id: 'node-4',
          name: 'Archive Node',
          status: 'offline',
          latency: null,
          lastBlock: 12340,
          syncStatus: 'out_of_sync',
          uptime: 95.2,
          ipAddress: '192.168.1.103',
          port: 8545,
          version: 'v0.9.8',
          memoryUsage: 89.1,
          cpuUsage: 45.6,
          diskUsage: 78.3,
          lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
        }
      ],
      network: {
        chainId: 1337,
        networkName: 'Local Development',
        consensusProtocol: 'Proof of Authority',
        blockTime: 12,
        gasPrice: 20,
        networkId: '0x539',
        genesisBlock: '0x1234567890abcdef',
        totalDifficulty: '0x1234567890abcdef',
        peerCount: 4
      },
      metrics: {
        totalNodes: 4,
        onlineNodes: 3,
        offlineNodes: 1,
        averageLatency: 45,
        networkHashRate: 125.6,
        lastBlockNumber: 12345,
        lastBlockTime: new Date(),
        totalTransactions: 45678,
        pendingTransactions: 12,
        gasUsed: 21000,
        gasLimit: 30000000
      },
      alerts: [
        {
          id: 'alert-1',
          type: 'warning',
          message: 'Node-4 is offline',
          timestamp: new Date(Date.now() - 300000),
          severity: 'medium'
        },
        {
          id: 'alert-2',
          type: 'info',
          message: 'High gas price detected',
          timestamp: new Date(Date.now() - 600000),
          severity: 'low'
        }
      ]
    };

    res.json({ success: true, data: healthData });
  } catch (error) {
    res.status(500).json({ message: 'Error checking blockchain health', error: error.message });
  }
};

// F.6.3: Get Node Status List
exports.getNodeStatus = async (req, res) => {
  try {
    const { nodeId } = req.params;
    
    if (nodeId) {
      // Get specific node status
      const nodeData = {
        id: nodeId,
        name: `Node ${nodeId}`,
        status: 'online',
        latency: Math.floor(Math.random() * 100) + 20,
        lastBlock: 12345,
        syncStatus: 'synced',
        uptime: 99.9,
        ipAddress: `192.168.1.${100 + parseInt(nodeId)}`,
        port: 8545,
        version: 'v1.0.0',
        memoryUsage: Math.floor(Math.random() * 40) + 40,
        cpuUsage: Math.floor(Math.random() * 30) + 10,
        diskUsage: Math.floor(Math.random() * 30) + 30,
        lastSeen: new Date(),
        peerConnections: Math.floor(Math.random() * 10) + 5,
        blockSyncProgress: 100,
        transactionPool: Math.floor(Math.random() * 50) + 10
      };
      
      res.json({ success: true, data: nodeData });
    } else {
      // Get all nodes status
      const nodesData = [
        {
          id: 'node-1',
          name: 'Primary Validator',
          status: 'online',
          latency: 45,
          lastBlock: 12345,
          syncStatus: 'synced',
          uptime: 99.9,
          ipAddress: '192.168.1.100',
          port: 8545,
          version: 'v1.0.0',
          memoryUsage: 65.2,
          cpuUsage: 23.1,
          diskUsage: 45.8,
          lastSeen: new Date(),
          peerConnections: 8,
          blockSyncProgress: 100,
          transactionPool: 15
        },
        {
          id: 'node-2',
          name: 'Secondary Validator',
          status: 'online',
          latency: 52,
          lastBlock: 12345,
          syncStatus: 'synced',
          uptime: 99.8,
          ipAddress: '192.168.1.101',
          port: 8545,
          version: 'v1.0.0',
          memoryUsage: 58.7,
          cpuUsage: 19.4,
          diskUsage: 42.1,
          lastSeen: new Date(),
          peerConnections: 7,
          blockSyncProgress: 100,
          transactionPool: 12
        },
        {
          id: 'node-3',
          name: 'Backup Node',
          status: 'online',
          latency: 38,
          lastBlock: 12344,
          syncStatus: 'syncing',
          uptime: 99.5,
          ipAddress: '192.168.1.102',
          port: 8545,
          version: 'v1.0.0',
          memoryUsage: 72.3,
          cpuUsage: 31.2,
          diskUsage: 38.9,
          lastSeen: new Date(),
          peerConnections: 6,
          blockSyncProgress: 98,
          transactionPool: 8
        },
        {
          id: 'node-4',
          name: 'Archive Node',
          status: 'offline',
          latency: null,
          lastBlock: 12340,
          syncStatus: 'out_of_sync',
          uptime: 95.2,
          ipAddress: '192.168.1.103',
          port: 8545,
          version: 'v0.9.8',
          memoryUsage: 89.1,
          cpuUsage: 45.6,
          diskUsage: 78.3,
          lastSeen: new Date(Date.now() - 300000),
          peerConnections: 0,
          blockSyncProgress: 85,
          transactionPool: 0
        }
      ];
      
      res.json({ success: true, data: nodesData });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching node status', error: error.message });
  }
};

// F.6.3: Get Network Configuration
exports.getNetworkConfiguration = async (req, res) => {
  try {
    const networkConfig = {
      chainId: 1337,
      networkName: 'Local Development',
      networkId: '0x539',
      consensusProtocol: 'Proof of Authority',
      blockTime: 12,
      gasPrice: 20,
      gasLimit: 30000000,
      genesisBlock: '0x1234567890abcdef',
      totalDifficulty: '0x1234567890abcdef',
      peerCount: 4,
      maxPeers: 25,
      minPeers: 2,
      networkVersion: '1.0.0',
      protocolVersion: '63',
      clientVersion: 'Geth/v1.10.0',
      nodeVersion: 'v1.0.0',
      rpcEndpoint: 'http://localhost:8545',
      wsEndpoint: 'ws://localhost:8546',
      ipcPath: '/tmp/geth.ipc',
      dataDir: '/data/blockchain',
      keystoreDir: '/data/keystore',
      networkDiscovery: true,
      nat: 'any',
      maxConnections: 50,
      connectionTimeout: 30000,
      pingTimeout: 10000,
      handshakeTimeout: 5000
    };

    res.json({ success: true, data: networkConfig });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching network configuration', error: error.message });
  }
};

// F.6.3: Gas/Fee Tracker
exports.getGasTracker = async (req, res) => {
  try {
    const gasData = {
      current: {
        gasPrice: 20,
        gasUsed: 21000,
        gasLimit: 30000000,
        baseFee: 15,
        priorityFee: 5
      },
      historical: [
        { timestamp: new Date(Date.now() - 3600000), gasPrice: 18, baseFee: 12, priorityFee: 6 },
        { timestamp: new Date(Date.now() - 7200000), gasPrice: 22, baseFee: 16, priorityFee: 6 },
        { timestamp: new Date(Date.now() - 10800000), gasPrice: 19, baseFee: 13, priorityFee: 6 },
        { timestamp: new Date(Date.now() - 14400000), gasPrice: 25, baseFee: 18, priorityFee: 7 },
        { timestamp: new Date(Date.now() - 18000000), gasPrice: 17, baseFee: 11, priorityFee: 6 }
      ],
      predictions: {
        nextHour: 21,
        nextDay: 19,
        nextWeek: 18
      },
      statistics: {
        average: 20.2,
        median: 19,
        min: 15,
        max: 35,
        standardDeviation: 4.2
      }
    };

    res.json({ success: true, data: gasData });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gas tracker data', error: error.message });
  }
};

// F.6.3: Block Explorer
exports.getBlockExplorer = async (req, res) => {
  try {
    const { blockNumber, transactionHash } = req.query;
    
    if (blockNumber) {
      // Get specific block
      const blockData = {
        number: parseInt(blockNumber),
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        parentHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        gasLimit: 30000000,
        gasUsed: 21000,
        baseFeePerGas: 15,
        size: 1024,
        transactions: [
          {
            hash: `0x${Math.random().toString(16).substr(2, 64)}`,
            from: `0x${Math.random().toString(16).substr(2, 40)}`,
            to: `0x${Math.random().toString(16).substr(2, 40)}`,
            value: '0x0',
            gas: 21000,
            gasPrice: 20,
            nonce: 1
          }
        ],
        miner: `0x${Math.random().toString(16).substr(2, 40)}`,
        difficulty: '0x0',
        totalDifficulty: '0x1234567890abcdef',
        extraData: '0x',
        mixHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        nonce: '0x0000000000000000',
        sha3Uncles: `0x${Math.random().toString(16).substr(2, 64)}`,
        logsBloom: `0x${Math.random().toString(16).substr(2, 512)}`,
        stateRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        receiptsRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        transactionsRoot: `0x${Math.random().toString(16).substr(2, 64)}`
      };
      
      res.json({ success: true, data: blockData });
    } else if (transactionHash) {
      // Get specific transaction
      const transactionData = {
        hash: transactionHash,
        blockNumber: 12345,
        blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        transactionIndex: 0,
        from: `0x${Math.random().toString(16).substr(2, 40)}`,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        value: '0x0',
        gas: 21000,
        gasPrice: 20,
        nonce: 1,
        input: '0x',
        r: `0x${Math.random().toString(16).substr(2, 64)}`,
        s: `0x${Math.random().toString(16).substr(2, 64)}`,
        v: '0x1b',
        type: '0x0',
        accessList: [],
        chainId: '0x539',
        maxFeePerGas: 25,
        maxPriorityFeePerGas: 5
      };
      
      res.json({ success: true, data: transactionData });
    } else {
      // Get recent blocks
      const recentBlocks = Array.from({ length: 10 }, (_, i) => ({
        number: 12345 - i,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: new Date(Date.now() - i * 12000),
        gasLimit: 30000000,
        gasUsed: 21000,
        size: 1024,
        transactionCount: Math.floor(Math.random() * 10) + 1,
        miner: `0x${Math.random().toString(16).substr(2, 40)}`
      }));
      
      res.json({ success: true, data: recentBlocks });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching block explorer data', error: error.message });
  }
};
