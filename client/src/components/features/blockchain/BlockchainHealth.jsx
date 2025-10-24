import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Server, 
  Wifi, 
  WifiOff, 
  Clock, 
  Hash, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Settings,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { blockchainAPI } from '../../../services/api';
import { useGlobalUI } from '../../../components/common';

const BlockchainHealth = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [nodeStatus, setNodeStatus] = useState(null);
  const [networkConfig, setNetworkConfig] = useState(null);
  const [gasData, setGasData] = useState(null);
  const [blockExplorerData, setBlockExplorerData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('block');
  const { showToast } = useGlobalUI();

  useEffect(() => {
    fetchHealthData();
    fetchNodeStatus();
    fetchNetworkConfig();
    fetchGasData();
    fetchBlockExplorerData();
  }, []);

  const fetchHealthData = async () => {
    try {
      const data = await blockchainAPI.checkBlockchainHealth();
      setHealthData(data);
    } catch (error) {
      showToast('Failed to fetch blockchain health data', 'error');
      console.error('Error fetching health data:', error);
    }
  };

  const fetchNodeStatus = async () => {
    try {
      const data = await blockchainAPI.getNodeStatus();
      setNodeStatus(data);
    } catch (error) {
      showToast('Failed to fetch node status', 'error');
      console.error('Error fetching node status:', error);
    }
  };

  const fetchNetworkConfig = async () => {
    try {
      const data = await blockchainAPI.getNetworkConfiguration();
      setNetworkConfig(data);
    } catch (error) {
      showToast('Failed to fetch network configuration', 'error');
      console.error('Error fetching network config:', error);
    }
  };

  const fetchGasData = async () => {
    try {
      const data = await blockchainAPI.getGasTracker();
      setGasData(data);
    } catch (error) {
      showToast('Failed to fetch gas tracker data', 'error');
      console.error('Error fetching gas data:', error);
    }
  };

  const fetchBlockExplorerData = async () => {
    try {
      const data = await blockchainAPI.getBlockExplorer();
      setBlockExplorerData(data);
    } catch (error) {
      showToast('Failed to fetch block explorer data', 'error');
      console.error('Error fetching block explorer data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const params = searchType === 'block' 
        ? { blockNumber: searchQuery }
        : { transactionHash: searchQuery };
      
      const data = await blockchainAPI.getBlockExplorer(params);
      setBlockExplorerData(data);
      showToast(`Found ${searchType}: ${searchQuery}`, 'success');
    } catch (error) {
      showToast(`Failed to find ${searchType}: ${searchQuery}`, 'error');
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-400/20';
      case 'offline': return 'text-red-400 bg-red-400/20';
      case 'syncing': return 'text-yellow-400 bg-yellow-400/20';
      case 'synced': return 'text-green-400 bg-green-400/20';
      case 'out_of_sync': return 'text-red-400 bg-red-400/20';
      case 'healthy': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'error': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <Wifi className="w-4 h-4" />;
      case 'offline': return <WifiOff className="w-4 h-4" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'synced': return <CheckCircle className="w-4 h-4" />;
      case 'out_of_sync': return <AlertTriangle className="w-4 h-4" />;
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'nodes', label: 'Node Status', icon: <Server className="w-4 h-4" /> },
    { id: 'network', label: 'Network Config', icon: <Network className="w-4 h-4" /> },
    { id: 'gas', label: 'Gas Tracker', icon: <Zap className="w-4 h-4" /> },
    { id: 'explorer', label: 'Block Explorer', icon: <Search className="w-4 h-4" /> }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blockchain Health</h1>
          <p className="text-gray-400">Monitor the underlying distributed ledger infrastructure</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchHealthData();
              fetchNodeStatus();
              fetchNetworkConfig();
              fetchGasData();
              fetchBlockExplorerData();
            }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50">
        <div className="flex border-b border-gray-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white">Blockchain Health Overview</h3>

                {healthData ? (
                  <>
                    {/* Network Status */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white">Network Status</h4>
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 ${getStatusColor(healthData.data.status)}`}>
                          {getStatusIcon(healthData.data.status)}
                          {healthData.data.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Server className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-gray-400">Total Nodes</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{healthData.data.metrics.totalNodes}</p>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-sm text-gray-400">Online Nodes</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{healthData.data.metrics.onlineNodes}</p>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm text-gray-400">Avg Latency</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{healthData.data.metrics.averageLatency}ms</p>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Hash className="w-5 h-5 text-purple-400" />
                            <span className="text-sm text-gray-400">Last Block</span>
                          </div>
                          <p className="text-2xl font-bold text-white">#{healthData.data.metrics.lastBlockNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Network Information */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Network Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Network Name:</span>
                            <span className="text-sm text-white">{healthData.data.network.networkName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Chain ID:</span>
                            <span className="text-sm text-white">{healthData.data.network.chainId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Consensus:</span>
                            <span className="text-sm text-white">{healthData.data.network.consensusProtocol}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Block Time:</span>
                            <span className="text-sm text-white">{healthData.data.network.blockTime}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Gas Price:</span>
                            <span className="text-sm text-white">{healthData.data.network.gasPrice} gwei</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Peer Count:</span>
                            <span className="text-sm text-white">{healthData.data.network.peerCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alerts */}
                    {healthData.data.alerts && healthData.data.alerts.length > 0 && (
                      <div className="bg-gray-700/30 rounded-lg p-6">
                        <h4 className="font-semibold text-white mb-4">Active Alerts</h4>
                        <div className="space-y-3">
                          {healthData.data.alerts.map((alert) => (
                            <div key={alert.id} className="flex items-center gap-3 p-3 bg-gray-600/50 rounded-lg">
                              <div className={`p-2 rounded-lg ${getStatusColor(alert.type)}`}>
                                {getStatusIcon(alert.type)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-white">{alert.message}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(alert.timestamp).toLocaleString()} - {alert.severity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Loading Health Data</h3>
                    <p className="text-gray-400">Fetching blockchain health information...</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'nodes' && (
              <motion.div
                key="nodes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white">Node Status List</h3>

                {nodeStatus ? (
                  <div className="bg-gray-700/30 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-600/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Node</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Latency</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Last Block</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Sync Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Uptime</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Resources</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600/50">
                          {nodeStatus.data.map((node) => (
                            <tr key={node.id} className="hover:bg-gray-600/30">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-sm font-medium text-white">{node.name}</div>
                                  <div className="text-xs text-gray-400">{node.ipAddress}:{node.port}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(node.status)}`}>
                                  {getStatusIcon(node.status)}
                                  {node.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-300">
                                  {node.latency ? `${node.latency}ms` : 'N/A'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-300">#{node.lastBlock}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(node.syncStatus)}`}>
                                  {getStatusIcon(node.syncStatus)}
                                  {node.syncStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-300">{node.uptime}%</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Cpu className="w-3 h-3 text-blue-400" />
                                    <span className="text-gray-300">{node.cpuUsage}%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MemoryStick className="w-3 h-3 text-green-400" />
                                    <span className="text-gray-300">{node.memoryUsage}%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <HardDrive className="w-3 h-3 text-yellow-400" />
                                    <span className="text-gray-300">{node.diskUsage}%</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Server className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Loading Node Status</h3>
                    <p className="text-gray-400">Fetching node information...</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'network' && (
              <motion.div
                key="network"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white">Network Configuration</h3>

                {networkConfig ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Basic Configuration</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Network Name:</span>
                          <span className="text-sm text-white">{networkConfig.data.networkName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Chain ID:</span>
                          <span className="text-sm text-white">{networkConfig.data.chainId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Network ID:</span>
                          <span className="text-sm text-white">{networkConfig.data.networkId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Consensus Protocol:</span>
                          <span className="text-sm text-white">{networkConfig.data.consensusProtocol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Block Time:</span>
                          <span className="text-sm text-white">{networkConfig.data.blockTime}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Gas Price:</span>
                          <span className="text-sm text-white">{networkConfig.data.gasPrice} gwei</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Connection Settings</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">RPC Endpoint:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">{networkConfig.data.rpcEndpoint}</span>
                            <button
                              onClick={() => copyToClipboard(networkConfig.data.rpcEndpoint)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">WebSocket Endpoint:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">{networkConfig.data.wsEndpoint}</span>
                            <button
                              onClick={() => copyToClipboard(networkConfig.data.wsEndpoint)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Max Peers:</span>
                          <span className="text-sm text-white">{networkConfig.data.maxPeers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Min Peers:</span>
                          <span className="text-sm text-white">{networkConfig.data.minPeers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Max Connections:</span>
                          <span className="text-sm text-white">{networkConfig.data.maxConnections}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Network Discovery:</span>
                          <span className="text-sm text-white">{networkConfig.data.networkDiscovery ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Version Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Client Version:</span>
                          <span className="text-sm text-white">{networkConfig.data.clientVersion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Node Version:</span>
                          <span className="text-sm text-white">{networkConfig.data.nodeVersion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Network Version:</span>
                          <span className="text-sm text-white">{networkConfig.data.networkVersion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Protocol Version:</span>
                          <span className="text-sm text-white">{networkConfig.data.protocolVersion}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Blockchain Data</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Genesis Block:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-white">{networkConfig.data.genesisBlock}</span>
                            <button
                              onClick={() => copyToClipboard(networkConfig.data.genesisBlock)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Total Difficulty:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-white">{networkConfig.data.totalDifficulty}</span>
                            <button
                              onClick={() => copyToClipboard(networkConfig.data.totalDifficulty)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Data Directory:</span>
                          <span className="text-sm text-white">{networkConfig.data.dataDir}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Keystore Directory:</span>
                          <span className="text-sm text-white">{networkConfig.data.keystoreDir}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Loading Network Configuration</h3>
                    <p className="text-gray-400">Fetching network settings...</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'gas' && (
              <motion.div
                key="gas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white">Gas/Fee Tracker</h3>

                {gasData ? (
                  <>
                    {/* Current Gas Prices */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Current Gas Prices</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-gray-400">Gas Price</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{gasData.data.current.gasPrice} gwei</p>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <span className="text-sm text-gray-400">Base Fee</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{gasData.data.current.baseFee} gwei</p>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm text-gray-400">Priority Fee</span>
                          </div>
                          <p className="text-2xl font-bold text-white">{gasData.data.current.priorityFee} gwei</p>
                        </div>
                      </div>
                    </div>

                    {/* Gas Statistics */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Gas Statistics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-gray-600/50 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-400 mb-1">Average</div>
                          <div className="text-lg font-bold text-white">{gasData.data.statistics.average} gwei</div>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-400 mb-1">Median</div>
                          <div className="text-lg font-bold text-white">{gasData.data.statistics.median} gwei</div>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-400 mb-1">Minimum</div>
                          <div className="text-lg font-bold text-white">{gasData.data.statistics.min} gwei</div>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-400 mb-1">Maximum</div>
                          <div className="text-lg font-bold text-white">{gasData.data.statistics.max} gwei</div>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-400 mb-1">Std Dev</div>
                          <div className="text-lg font-bold text-white">{gasData.data.statistics.standardDeviation}</div>
                        </div>
                      </div>
                    </div>

                    {/* Predictions */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Gas Price Predictions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-600/50 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-400 mb-1">Next Hour</div>
                          <div className="text-lg font-bold text-white">{gasData.data.predictions.nextHour} gwei</div>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-400 mb-1">Next Day</div>
                          <div className="text-lg font-bold text-white">{gasData.data.predictions.nextDay} gwei</div>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4 text-center">
                          <div className="text-sm text-gray-400 mb-1">Next Week</div>
                          <div className="text-lg font-bold text-white">{gasData.data.predictions.nextWeek} gwei</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Loading Gas Data</h3>
                    <p className="text-gray-400">Fetching gas price information...</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'explorer' && (
              <motion.div
                key="explorer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Block Explorer</h3>
                  <div className="flex items-center gap-3">
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    >
                      <option value="block">Block Number</option>
                      <option value="transaction">Transaction Hash</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Enter ${searchType === 'block' ? 'block number' : 'transaction hash'}`}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm w-64"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <button
                        onClick={handleSearch}
                        disabled={loading || !searchQuery.trim()}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 transition-all duration-200"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                {blockExplorerData ? (
                  <div className="bg-gray-700/30 rounded-lg p-6">
                    <h4 className="font-semibold text-white mb-4">Recent Blocks</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-600/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Block</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Hash</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Timestamp</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Transactions</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Gas Used</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Miner</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600/50">
                          {blockExplorerData.data.map((block) => (
                            <tr key={block.number} className="hover:bg-gray-600/30">
                              <td className="px-4 py-3">
                                <span className="text-sm font-medium text-white">#{block.number}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-gray-300">{block.hash.slice(0, 16)}...</span>
                                  <button
                                    onClick={() => copyToClipboard(block.hash)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-300">
                                  {new Date(block.timestamp).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-300">{block.transactionCount}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-300">{block.gasUsed.toLocaleString()}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-gray-300">{block.miner.slice(0, 10)}...</span>
                                  <button
                                    onClick={() => copyToClipboard(block.miner)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Block Explorer</h3>
                    <p className="text-gray-400">Search for specific blocks or transactions using the search bar above.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BlockchainHealth;
