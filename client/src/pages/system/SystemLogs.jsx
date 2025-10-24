import React, { useEffect, useState, useContext, useRef } from 'react';
import {DashboardLayout} from '../../layouts/DashboardLayout';
import { systemAPI } from '../../services/api';
import { AuthContext } from '../../contexts/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Filter, RefreshCw, Download, Trash2, Eye, EyeOff,
  AlertTriangle, Info, CheckCircle, XCircle, Clock, User, Server, Database,
  Activity, Zap, Shield, Bug, Settings, Bell, TrendingUp, Calendar,
  ChevronDown, ChevronUp, Play, Pause, Volume2, VolumeX, Maximize2
} from 'lucide-react';

const SystemLogs = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [selectedLogs, setSelectedLogs] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const [logComponent, setLogComponent] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [logType, setLogType] = useState('system'); // system, audit, both
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    critical: 0,
    last24h: 0
  });

  const refreshIntervalRef = useRef(null);
  const audioRef = useRef(null);

  // Fetch logs with pagination and filters
  const fetchLogs = async (pageNum = 1, reset = false) => {
    if (reset) setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: pageNum,
        limit,
        ...(logLevel !== 'all' && { level: logLevel }),
        ...(logComponent !== 'all' && { component: logComponent })
      };

      let systemLogsData = { logs: [], pagination: {} };
      let auditLogsData = { auditLogs: [], pagination: {} };

      if (logType === 'system' || logType === 'both') {
        systemLogsData = await systemAPI.getLogs(params);
      }
      
      if (logType === 'audit' || logType === 'both') {
        auditLogsData = await systemAPI.getAuditTrail(params);
      }

      const allLogs = [
        ...(systemLogsData.logs || []).map(log => ({ ...log, type: 'system', uniqueId: `system-${log._id}` })),
        ...(auditLogsData.auditLogs || []).map(log => ({ ...log, type: 'audit', uniqueId: `audit-${log._id}` }))
      ].sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

      if (reset) {
        setLogs(allLogs);
        setAuditLogs(auditLogsData.auditLogs || []);
      } else {
        setLogs(prev => [...allLogs, ...prev]);
      }

      calculateStats(allLogs);
    } catch (err) {
      setError('Failed to fetch system logs.');
      console.error('Error fetching logs:', err);
    }
    setLoading(false);
  };

  // Calculate statistics
  const calculateStats = (logsData) => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const stats = {
      total: logsData.length,
      errors: logsData.filter(log => log.level === 'error').length,
      warnings: logsData.filter(log => log.level === 'warn').length,
      info: logsData.filter(log => log.level === 'info').length,
      critical: logsData.filter(log => log.level === 'critical').length,
      last24h: logsData.filter(log => 
        new Date(log.timestamp || log.createdAt) >= last24h
      ).length
    };
    setStats(stats);
  };

  // Filter logs based on search and filters
  const filterLogs = () => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (log.message && log.message.toLowerCase().includes(searchLower)) ||
          (log.action && log.action.toLowerCase().includes(searchLower)) ||
          (log.component && log.component.toLowerCase().includes(searchLower)) ||
          (log.details && JSON.stringify(log.details).toLowerCase().includes(searchLower))
        );
      });
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      switch (dateRange) {
        case '1h':
          cutoffDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = null;
      }
      
      if (cutoffDate) {
        filtered = filtered.filter(log => 
          new Date(log.timestamp || log.createdAt) >= cutoffDate
        );
      }
    }

    setFilteredLogs(filtered);
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        fetchLogs(1, false);
      }, 5000); // Refresh every 5 seconds
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, logType, logLevel, logComponent]);

  // Filter effect
  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, logLevel, logComponent, dateRange, logType]);

  // Initial fetch
  useEffect(() => {
    fetchLogs(1, true);
  }, [logType, logLevel, logComponent, limit]);

  // Get log level icon and color
  const getLogLevelIcon = (level) => {
    switch (level) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'debug': return <Bug className="w-4 h-4 text-gray-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'critical': return 'border-red-500 bg-red-900/20';
      case 'error': return 'border-red-400 bg-red-900/10';
      case 'warn': return 'border-yellow-400 bg-yellow-900/10';
      case 'info': return 'border-blue-400 bg-blue-900/10';
      case 'debug': return 'border-gray-400 bg-gray-900/10';
      default: return 'border-gray-600 bg-gray-800/50';
    }
  };

  // Toggle log expansion
  const toggleLogExpansion = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  // Toggle log selection
  const toggleLogSelection = (logId) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(logId)) {
      newSelected.delete(logId);
    } else {
      newSelected.add(logId);
    }
    setSelectedLogs(newSelected);
  };

  // Select all logs
  const selectAllLogs = () => {
    if (selectedLogs.size === filteredLogs.length) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(filteredLogs.map(log => log.uniqueId || log._id)));
    }
  };

  // Export logs
  const exportLogs = () => {
    const logsToExport = selectedLogs.size > 0 
      ? filteredLogs.filter(log => selectedLogs.has(log.uniqueId || log._id))
      : filteredLogs;
    
    const csvContent = [
      ['Timestamp', 'Type', 'Level', 'Component', 'Action', 'Message', 'Details'].join(','),
      ...logsToExport.map(log => [
        new Date(log.timestamp || log.createdAt).toISOString(),
        log.type || 'system',
        log.level || 'info',
        log.component || '',
        log.action || ''  || '',
        (log.message || '').replace(/,/g, ';'),
        JSON.stringify(log.details || {}).replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Clear logs (admin only)
  const clearLogs = async () => {
    if (user?.role !== 'admin') return;
    
    if (confirm('Are you sure you want to clear all system logs? This action cannot be undone.')) {
      try {
        // This would need to be implemented in the backend
        await systemAPI.clearLogs();
        setLogs([]);
        setFilteredLogs([]);
        setStats({ total: 0, errors: 0, warnings: 0, info: 0, critical: 0, last24h: 0 });
      } catch (err) {
        setError('Failed to clear logs.');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className={`max-w-7xl mx-auto ${fullscreen ? 'fixed inset-0 z-50 bg-gray-900 p-4' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold text-sky-400 tracking-wide flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Advanced System Logs
            {realTimeMode && (
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setRealTimeMode(!realTimeMode)}
              className={`p-2 rounded-lg transition-colors ${
                realTimeMode ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {realTimeMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => fetchLogs(1, true)}
              disabled={loading}
              className="p-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-300">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 p-4 rounded-lg border border-red-700"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-gray-300">Critical</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.critical}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 p-4 rounded-lg border border-red-600"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-gray-300">Errors</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.errors}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 p-4 rounded-lg border border-yellow-600"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-300">Warnings</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.warnings}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 p-4 rounded-lg border border-blue-600"
          >
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-300">Info</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.info}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800 p-4 rounded-lg border border-green-600"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300">Last 24h</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.last24h}</div>
          </motion.div>
        </div>

        {/* Controls and Filters */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-300">
                  Auto Refresh (5s)
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedLogs.size > 0 && (
                <span className="text-sm text-gray-300">
                  {selectedLogs.size} selected
                </span>
              )}
              <button
                onClick={selectAllLogs}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
              >
                {selectedLogs.size === filteredLogs.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={exportLogs}
                disabled={filteredLogs.length === 0}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4 inline mr-1" />
                Export
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={clearLogs}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs by message, action, component, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-4"
              >
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="system">System Logs</option>
                  <option value="audit">Audit Logs</option>
                  <option value="both">Both</option>
                </select>

                <select
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Levels</option>
                  <option value="critical">Critical</option>
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>

                <select
                  value={logComponent}
                  onChange={(e) => setLogComponent(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Components</option>
                  <option value="auth">Authentication</option>
                  <option value="database">Database</option>
                  <option value="blockchain">Blockchain</option>
                  <option value="api">API</option>
                  <option value="security">Security</option>
                  <option value="system">System</option>
                </select>

                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Time</option>
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>

                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={200}>200 per page</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-4" />
            <p className="text-sky-400">Loading system logs...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-semibold">Error</span>
            </div>
            <p className="text-red-300 mt-2">{error}</p>
          </div>
        )}

        {/* Logs Display */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                System Logs ({filteredLogs.length})
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Real-time: {realTimeMode ? 'ON' : 'OFF'}</span>
                <span>•</span>
                <span>Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
                <span>•</span>
                <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 && !loading ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No logs found matching your criteria.</p>
                <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredLogs.map((log, index) => (
                  <motion.div
                    key={log.uniqueId || log._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`p-4 hover:bg-gray-750 transition-colors ${
                      selectedLogs.has(log.uniqueId || log._id) ? 'bg-blue-900/20' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedLogs.has(log.uniqueId || log._id)}
                        onChange={() => toggleLogSelection(log.uniqueId || log._id)}
                        className="mt-1 rounded"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getLogLevelIcon(log.level)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.type === 'audit' ? 'bg-purple-900 text-purple-300' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {log.type || 'system'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(log.timestamp || log.createdAt).toLocaleString()}
                          </span>
                          {log.component && (
                            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
                              {log.component}
                            </span>
                          )}
                        </div>

                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">
                              {log.action || log.message || 'System Event'}
                            </h4>
                            {log.message && log.message !== log.action && (
                              <p className="text-gray-300 text-sm mb-2">{log.message}</p>
                            )}
                            
                            {log.details && Object.keys(log.details).length > 0 && (
                              <div className="mt-2">
                                <button
                                  onClick={() => toggleLogExpansion(log.uniqueId || log._id)}
                                  className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                                >
                                  {expandedLogs.has(log.uniqueId || log._id) ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                  {expandedLogs.has(log.uniqueId || log._id) ? 'Hide Details' : 'Show Details'}
                                </button>
                                
                                <AnimatePresence>
                                  {expandedLogs.has(log.uniqueId || log._id) && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-2 p-3 bg-gray-900 rounded-lg border border-gray-600"
                                    >
                                      <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
                                        {JSON.stringify(log.details, null, 2)}
                                      </pre>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            {log.user && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <User className="w-3 h-3" />
                                <span>{log.user.fullName || log.user.email || 'Unknown User'}</span>
                              </div>
                            )}
                            
                            {log.ip && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Server className="w-3 h-3" />
                                <span>{log.ip}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filteredLogs.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-400">
              Showing {filteredLogs.length} of {stats.total} logs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-gray-800 text-white rounded">
                Page {page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={filteredLogs.length < limit}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Real-time Status Indicator */}
        {realTimeMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <motion.div
              className="w-2 h-2 bg-white rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm font-medium">Live Logs</span>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SystemLogs;