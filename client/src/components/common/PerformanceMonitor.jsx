import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Zap,
  Database,
  Network,
  Cpu
} from 'lucide-react';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    uptime: 0,
    memoryUsage: 0,
    cpuUsage: 0
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const updateMetrics = () => {
      // Simulate real-time metrics (in a real app, these would come from your monitoring system)
      const newMetrics = {
        responseTime: Math.random() * 50 + 10, // 10-60ms
        throughput: Math.random() * 100 + 50, // 50-150 req/s
        errorRate: Math.random() * 2, // 0-2%
        uptime: 99.9 + Math.random() * 0.1, // 99.9-100%
        memoryUsage: Math.random() * 20 + 60, // 60-80%
        cpuUsage: Math.random() * 30 + 20 // 20-50%
      };

      setMetrics(newMetrics);
      setHistory(prev => {
        const newHistory = [...prev, { ...newMetrics, timestamp: Date.now() }];
        return newHistory.slice(-20); // Keep last 20 data points
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getPerformanceColor = (value, type) => {
    switch (type) {
      case 'responseTime':
        return value < 20 ? 'text-green-400' : value < 50 ? 'text-yellow-400' : 'text-red-400';
      case 'throughput':
        return value > 100 ? 'text-green-400' : value > 50 ? 'text-yellow-400' : 'text-red-400';
      case 'errorRate':
        return value < 0.5 ? 'text-green-400' : value < 1.5 ? 'text-yellow-400' : 'text-red-400';
      case 'uptime':
        return value > 99.9 ? 'text-green-400' : value > 99.5 ? 'text-yellow-400' : 'text-red-400';
      case 'memoryUsage':
        return value < 70 ? 'text-green-400' : value < 85 ? 'text-yellow-400' : 'text-red-400';
      case 'cpuUsage':
        return value < 50 ? 'text-green-400' : value < 75 ? 'text-yellow-400' : 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const getPerformanceIcon = (type) => {
    switch (type) {
      case 'responseTime':
        return <Clock className="w-5 h-5" />;
      case 'throughput':
        return <TrendingUp className="w-5 h-5" />;
      case 'errorRate':
        return <TrendingDown className="w-5 h-5" />;
      case 'uptime':
        return <Activity className="w-5 h-5" />;
      case 'memoryUsage':
        return <Database className="w-5 h-5" />;
      case 'cpuUsage':
        return <Cpu className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'responseTime':
        return `${value.toFixed(1)}ms`;
      case 'throughput':
        return `${value.toFixed(0)}/s`;
      case 'errorRate':
        return `${value.toFixed(2)}%`;
      case 'uptime':
        return `${value.toFixed(2)}%`;
      case 'memoryUsage':
        return `${value.toFixed(1)}%`;
      case 'cpuUsage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const performanceMetrics = [
    { key: 'responseTime', label: 'Response Time', icon: getPerformanceIcon('responseTime') },
    { key: 'throughput', label: 'Throughput', icon: getPerformanceIcon('throughput') },
    { key: 'errorRate', label: 'Error Rate', icon: getPerformanceIcon('errorRate') },
    { key: 'uptime', label: 'Uptime', icon: getPerformanceIcon('uptime') },
    { key: 'memoryUsage', label: 'Memory Usage', icon: getPerformanceIcon('memoryUsage') },
    { key: 'cpuUsage', label: 'CPU Usage', icon: getPerformanceIcon('cpuUsage') }
  ];

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Network className="w-6 h-6" />
          Performance Monitor
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {performanceMetrics.map((metric, index) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-blue-400">
                  {metric.icon}
                </div>
                <span className="text-white font-medium">{metric.label}</span>
              </div>
              <div className={`text-lg font-bold ${getPerformanceColor(metrics[metric.key], metric.key)}`}>
                {formatValue(metrics[metric.key], metric.key)}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  getPerformanceColor(metrics[metric.key], metric.key).includes('green') ? 'bg-green-500' :
                  getPerformanceColor(metrics[metric.key], metric.key).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(metrics[metric.key], 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Response Time Trend</h3>
        <div className="h-32 flex items-end justify-between gap-1">
          {history.slice(-20).map((point, index) => (
            <motion.div
              key={index}
              className="bg-blue-500 rounded-t"
              style={{ height: `${(point.responseTime / 60) * 100}%` }}
              initial={{ height: 0 }}
              animate={{ height: `${(point.responseTime / 60) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>20 min ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">System Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Overall Health</span>
              <span className="text-green-400">Excellent</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Load Average</span>
              <span className="text-white">0.45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Connections</span>
              <span className="text-white">23</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">API Calls (1h)</span>
              <span className="text-white">1,247</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Votes Cast (1h)</span>
              <span className="text-white">89</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Elections Active</span>
              <span className="text-white">3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;