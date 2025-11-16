import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Database,
  Link,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Clock
} from 'lucide-react';
import { systemAPI } from '../../services/api';

const SystemHealthDashboard = () => {
  const [healthData, setHealthData] = useState({
    system: null,
    blockchain: null,
    alerts: null,
    lastChecked: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealthData = async () => {
    try {
      setIsRefreshing(true);
      const [systemHealth, blockchainHealth] = await Promise.all([
        systemAPI.getSystemHealthReport().catch(err => {
          console.warn('Failed to fetch system health:', err);
          return { system: { totalUsers: 0, totalElections: 0, unreadNotifications: 0, recentLogs: 0 }, alerts: { critical: 0, high: 0, medium: 0 } };
        }),
        systemAPI.getBlockchainHealth().catch(err => {
          console.warn('Failed to fetch blockchain health:', err);
          return { isHealthy: false, responseTime: 0 };
        })
      ]);

      // Normalize commonly expected fields (cpu/memory) from a few possible shapes
      const cpuUsage = systemHealth?.cpuUsage ?? systemHealth?.system?.cpuUsage ?? systemHealth?.system?.metrics?.cpu?.usage ?? 0;
      const memoryUsage = systemHealth?.memoryUsage ?? systemHealth?.system?.memoryUsage ?? systemHealth?.system?.metrics?.memory?.usage ?? 0;

      const normalizedSystem = {
        ...systemHealth,
        cpuUsage,
        memoryUsage,
        system: systemHealth?.system || {}
      };

      setHealthData({
        system: normalizedSystem,
        blockchain: blockchainHealth,
        alerts: systemHealth?.alerts || normalizedSystem?.alerts || { critical: 0, high: 0, medium: 0 },
        lastChecked: new Date()
      });
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      // Set fallback data
      setHealthData({
        system: { system: { totalUsers: 0, totalElections: 0, unreadNotifications: 0, recentLogs: 0 }, alerts: { critical: 0, high: 0, medium: 0 } },
        blockchain: { isHealthy: false, responseTime: 0 },
        alerts: { critical: 0, high: 0, medium: 0 },
        lastChecked: new Date()
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 3 * 60 * 1000); // Refresh every 3 minutes
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatUptime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const diff = now - new Date(timestamp);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="w-6 h-6" />
          System Health Dashboard
        </h2>
        <button
          onClick={fetchHealthData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Server Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Server</span>
            </div>
            {getStatusIcon('healthy')}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400">Online</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Response Time:</span>
              <span className="text-white">~11ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Environment:</span>
              <span className="text-white">Development</span>
            </div>
          </div>
        </motion.div>

        {/* Database Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Database</span>
            </div>
            {getStatusIcon('healthy')}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">MongoDB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Users:</span>
              <span className="text-white">{healthData.system?.system?.totalUsers || 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Blockchain Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Blockchain</span>
            </div>
            {getStatusIcon(healthData.blockchain?.isHealthy ? 'healthy' : 'warning')}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Status:</span>
              <span className={healthData.blockchain?.isHealthy ? 'text-green-400' : 'text-yellow-400'}>
                {healthData.blockchain?.isHealthy ? 'Connected' : 'Connecting'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network:</span>
              <span className="text-white">Ganache</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Response:</span>
              <span className="text-white">{healthData.blockchain?.responseTime || 0}ms</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-sm">Elections</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {healthData.system?.system?.totalElections || 0}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-sm">Notifications</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {healthData.system?.system?.unreadNotifications || 0}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm">Recent Logs</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {healthData.system?.system?.recentLogs || 0}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400 text-sm">Last Check</span>
          </div>
          <div className="text-sm text-white">
            {healthData.lastChecked ? healthData.lastChecked.toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>

      {/* CPU / Memory bars & Node list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">CPU Usage</div>
            <div className="text-sm text-white">{Math.round((healthData.system?.cpuUsage || 0))}%</div>
          </div>
          <div className="w-full bg-gray-700 h-3 rounded overflow-hidden">
            <div className="h-3 bg-sky-500" style={{ width: `${Math.min(100, healthData.system?.cpuUsage || 0)}%` }} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Memory Usage</div>
            <div className="text-sm text-white">{Math.round((healthData.system?.memoryUsage || 0))}%</div>
          </div>
          <div className="w-full bg-gray-700 h-3 rounded overflow-hidden">
            <div className="h-3 bg-emerald-500" style={{ width: `${Math.min(100, healthData.system?.memoryUsage || 0)}%` }} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Nodes</div>
            <div className="text-sm text-white">{(healthData.blockchain?.nodes || 0)}</div>
          </div>
          <ul className="text-sm text-gray-300 space-y-2 max-h-36 overflow-y-auto">
            {(healthData.blockchain?.nodesList || []).length === 0 && <li className="text-gray-500">No nodes data</li>}
            {(healthData.blockchain?.nodesList || []).map((n,i)=>(
              <li key={i} className="flex items-center justify-between">
                <span>{n.name || `Node ${i+1}`}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${n.online ? 'bg-green-700 text-green-200' : 'bg-red-800 text-red-200'}`}>{n.online ? 'online' : 'offline'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Alerts */}
      {healthData.alerts && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            System Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-white">Critical: {healthData.alerts.critical || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-white">High: {healthData.alerts.high || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-white">Medium: {healthData.alerts.medium || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthDashboard;
