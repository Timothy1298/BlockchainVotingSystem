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
  Activity
} from 'lucide-react';
import { systemAPI } from '../../services/api';

const SystemStatus = () => {
  const [status, setStatus] = useState({
    server: 'checking',
    database: 'checking',
    blockchain: 'checking',
    lastChecked: null
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkSystemStatus = async () => {
    setIsChecking(true);
    const newStatus = {
      server: 'checking',
      database: 'checking',
      blockchain: 'checking',
      lastChecked: new Date()
    };

    try {
      // Check server health
      const serverResponse = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        timeout: 5000
      });
      newStatus.server = serverResponse.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      newStatus.server = 'unhealthy';
    }

    try {
      // Check database and system health
      const healthData = await systemAPI.getSystemHealthReport();
      newStatus.database = healthData.dbConnected ? 'healthy' : 'unhealthy';
    } catch (error) {
      newStatus.database = 'unhealthy';
    }

    try {
      // Check blockchain
      const blockchainData = await systemAPI.getBlockchainHealth();
      newStatus.blockchain = blockchainData.isHealthy ? 'healthy' : 'unhealthy';
    } catch (error) {
      newStatus.blockchain = 'unhealthy';
    }

    setStatus(newStatus);
    setIsChecking(false);
  };

  useEffect(() => {
    checkSystemStatus();
    // Check every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400';
      case 'unhealthy':
        return 'text-red-400';
      case 'checking':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'unhealthy':
        return 'Unhealthy';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          System Status
        </h3>
        <button
          onClick={checkSystemStatus}
          disabled={isChecking}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">Server</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.server)}
            <span className={`text-sm font-medium ${getStatusColor(status.server)}`}>
              {getStatusText(status.server)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Database</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.database)}
            <span className={`text-sm font-medium ${getStatusColor(status.database)}`}>
              {getStatusText(status.database)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">Blockchain</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.blockchain)}
            <span className={`text-sm font-medium ${getStatusColor(status.blockchain)}`}>
              {getStatusText(status.blockchain)}
            </span>
          </div>
        </div>
      </div>

      {status.lastChecked && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default SystemStatus;
