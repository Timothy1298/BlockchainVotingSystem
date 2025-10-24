import React, { useState, useEffect, memo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Database, 
  Server, 
  Eye, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { 
  useSystemLogs, 
  useSecurityNotifications, 
  useBlockchainHealth, 
  useSystemHealthReport,
  useFailedLogins,
  useAuditTrail
} from '../../hooks/system';

import { useGlobalUI } from '../../components/common';

const SystemMonitoring = memo(() => {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { showToast } = useGlobalUI();

  // Data hooks
  const { data: systemLogs, isLoading: logsLoading, refetch: refetchLogs } = useSystemLogs({ limit: 50 });
  const { data: securityNotifications, isLoading: securityLoading, refetch: refetchSecurity } = useSecurityNotifications({ limit: 20 });
  const { data: blockchainHealth, isLoading: blockchainLoading, refetch: refetchBlockchain } = useBlockchainHealth();
  const { data: healthReport, isLoading: healthLoading, refetch: refetchHealth } = useSystemHealthReport();
  const { data: failedLogins, isLoading: failedLoginsLoading, refetch: refetchFailedLogins } = useFailedLogins({ limit: 20 });
  const { data: auditTrail, isLoading: auditLoading, refetch: refetchAudit } = useAuditTrail({ limit: 30 });

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetchLogs();
      refetchSecurity();
      refetchBlockchain();
      refetchHealth();
      refetchFailedLogins();
      refetchAudit();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetchLogs, refetchSecurity, refetchBlockchain, refetchHealth, refetchFailedLogins, refetchAudit]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'logs', label: 'System Logs', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'blockchain', label: 'Blockchain', icon: Zap },
    { id: 'audit', label: 'Audit Trail', icon: Eye }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'unhealthy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'unhealthy': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleRefresh = () => {
    refetchLogs();
    refetchSecurity();
    refetchBlockchain();
    refetchHealth();
    refetchFailedLogins();
    refetchAudit();
    showToast('System data refreshed', 'success');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-wide flex items-center gap-3">
              <Shield className="w-8 h-8 text-sky-400" />
              System Monitoring
            </h2>
            <p className="text-gray-400 mt-2">Real-time system health and security monitoring</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-sky-400 bg-gray-700 border-gray-600 rounded focus:ring-sky-400"
              />
              Auto-refresh
            </label>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-sky-600 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">System Overview</h3>
              
              {healthLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto"></div>
                  <p className="text-gray-400 mt-4">Loading system health...</p>
                </div>
              ) : healthReport ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Overall Status */}
                  <div className="bg-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Overall Status</h4>
                      {getStatusIcon(healthReport.overallStatus)}
                    </div>
                    <p className={`text-2xl font-bold ${getStatusColor(healthReport.overallStatus)}`}>
                      {healthReport.overallStatus?.toUpperCase()}
                    </p>
                  </div>

                  {/* Database Status */}
                  <div className="bg-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Database</h4>
                      {healthReport.database?.isConnected ? 
                        <CheckCircle className="w-5 h-5 text-green-400" /> : 
                        <XCircle className="w-5 h-5 text-red-400" />
                      }
                    </div>
                    <p className={`text-lg font-semibold ${
                      healthReport.database?.isConnected ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {healthReport.database?.isConnected ? 'Connected' : 'Disconnected'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {healthReport.database?.message}
                    </p>
                  </div>

                  {/* Blockchain Status */}
                  <div className="bg-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Blockchain</h4>
                      {blockchainHealth?.isConnected ? 
                        <CheckCircle className="w-5 h-5 text-green-400" /> : 
                        <XCircle className="w-5 h-5 text-red-400" />
                      }
                    </div>
                    <p className={`text-lg font-semibold ${
                      blockchainHealth?.isConnected ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {blockchainHealth?.isConnected ? 'Connected' : 'Disconnected'}
                    </p>
                    {blockchainHealth?.latency && (
                      <p className="text-sm text-gray-400 mt-1">
                        Latency: {blockchainHealth.latency}ms
                      </p>
                    )}
                  </div>

                  {/* Server Status */}
                  <div className="bg-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Server</h4>
                      <Server className="w-5 h-5 text-sky-400" />
                    </div>
                    <p className="text-lg font-semibold text-green-400">
                      {healthReport.server?.status?.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Uptime: {Math.floor(healthReport.server?.uptime / 3600)}h
                    </p>
                  </div>

                  {/* Security Status */}
                  <div className="bg-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Security</h4>
                      <Shield className="w-5 h-5 text-sky-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Admin Key:</span>
                        <span className={`text-sm ${healthReport.security?.adminRegistrationKeySet ? 'text-green-400' : 'text-red-400'}`}>
                          {healthReport.security?.adminRegistrationKeySet ? 'Set' : 'Not Set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">JWT Secret:</span>
                        <span className={`text-sm ${healthReport.security?.jwtSecretSet ? 'text-green-400' : 'text-red-400'}`}>
                          {healthReport.security?.jwtSecretSet ? 'Set' : 'Not Set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Environment */}
                  <div className="bg-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-white">Environment</h4>
                      <Activity className="w-5 h-5 text-sky-400" />
                    </div>
                    <p className="text-lg font-semibold text-sky-400">
                      {healthReport.server?.environment?.toUpperCase()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400">Failed to load system health data</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">System Logs</h3>
              
              {logsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto"></div>
                  <p className="text-gray-400 mt-4">Loading system logs...</p>
                </div>
              ) : systemLogs?.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {systemLogs.map((log, index) => (
                    <div key={log._id || index} className="bg-gray-700 rounded-lg p-4 border-l-4 border-sky-400">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-white">{log.action}</span>
                            <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                              {log.level || 'INFO'}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{log.message}</p>
                          {log.details && (
                            <pre className="text-xs text-gray-400 bg-gray-800 p-2 rounded overflow-x-auto">
                              {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-400 ml-4">
                          <div>{formatTimestamp(log.timestamp)}</div>
                          {log.user && <div>User: {log.user}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No system logs found</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Security Monitoring</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Security Notifications */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Security Alerts
                  </h4>
                  
                  {securityLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                    </div>
                  ) : securityNotifications?.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {securityNotifications.map((notification, index) => (
                        <div key={notification._id || index} className="bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-400">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-white font-medium">{notification.message}</p>
                              {notification.details && (
                                <p className="text-gray-400 text-sm mt-1">
                                  {typeof notification.details === 'string' ? 
                                    notification.details : 
                                    JSON.stringify(notification.details)
                                  }
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 ml-4">
                              {formatTimestamp(notification.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-700 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-gray-400">No security alerts</p>
                    </div>
                  )}
                </div>

                {/* Failed Login Attempts */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    Failed Login Attempts
                  </h4>
                  
                  {failedLoginsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400 mx-auto"></div>
                    </div>
                  ) : failedLogins?.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {failedLogins.map((login, index) => (
                        <div key={login._id || index} className="bg-gray-700 rounded-lg p-4 border-l-4 border-red-400">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                Failed login attempt from {login.ip || 'Unknown IP'}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Email: {login.email || 'Unknown'}
                              </p>
                              {login.userAgent && (
                                <p className="text-gray-400 text-xs mt-1">
                                  {typeof login.userAgent === 'string' ? login.userAgent : JSON.stringify(login.userAgent)}
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 ml-4">
                              {formatTimestamp(login.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-700 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-gray-400">No failed login attempts</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'blockchain' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Blockchain Health</h3>
              
              {blockchainLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto"></div>
                  <p className="text-gray-400 mt-4">Checking blockchain health...</p>
                </div>
              ) : blockchainHealth ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-sky-400" />
                      Connection Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Status:</span>
                        <span className={`font-semibold ${
                          blockchainHealth.isConnected ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {blockchainHealth.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Node:</span>
                        <span className="text-gray-300 font-mono text-sm">
                          {blockchainHealth.nodeName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Last Block:</span>
                        <span className="text-gray-300">
                          {blockchainHealth.lastBlockNumber?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Latency:</span>
                        <span className="text-gray-300">
                          {blockchainHealth.latency ? `${blockchainHealth.latency}ms` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Last Sync:</span>
                        <span className="text-gray-300 text-sm">
                          {blockchainHealth.lastSyncTime ? 
                            formatTimestamp(blockchainHealth.lastSyncTime) : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      Errors & Issues
                    </h4>
                    {blockchainHealth.errors?.length > 0 ? (
                      <div className="space-y-2">
                        {blockchainHealth.errors.map((error, index) => (
                          <div key={index} className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                            <p className="text-red-400 text-sm">{error}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-gray-400">No errors detected</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400">Failed to check blockchain health</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-6">Audit Trail</h3>
              
              {auditLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto"></div>
                  <p className="text-gray-400 mt-4">Loading audit trail...</p>
                </div>
              ) : auditTrail?.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {auditTrail.map((audit, index) => (
                    <div key={audit._id || index} className="bg-gray-700 rounded-lg p-4 border-l-4 border-sky-400">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-white">{audit.action}</span>
                            <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                              {audit.performedBy || 'System'}
                            </span>
                          </div>
                          {audit.details && (
                            <div className="text-gray-300 text-sm">
                              {typeof audit.details === 'string' ? 
                                audit.details : 
                                JSON.stringify(audit.details, null, 2)
                              }
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-400 ml-4">
                          <div>{formatTimestamp(audit.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No audit trail entries found</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
});

SystemMonitoring.displayName = 'SystemMonitoring';

export default SystemMonitoring;
