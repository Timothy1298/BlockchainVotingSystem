import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Lock, 
  Globe, 
  Smartphone, 
  Monitor, 
  MapPin, 
  RefreshCw,
  Download,
  Trash2,
  Ban,
  Key,
  Activity
} from 'lucide-react';
import { useGlobalUI } from '../common';
import { usersAPI } from '../../services/api';

const SecurityMonitor = ({ userId }) => {
  const { showLoader, hideLoader, showToast } = useGlobalUI();
  
  const [securityData, setSecurityData] = useState({
    activeSessions: [],
    loginHistory: [],
    securityAlerts: [],
    deviceFingerprints: [],
    ipAddresses: [],
    lastSecurityCheck: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load security data
  useEffect(() => {
    if (userId) {
      loadSecurityData();
    }
  }, [userId]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoader('Loading security data...');

      const [sessionsResponse, loginHistoryResponse, alertsResponse] = await Promise.all([
        usersAPI.getActiveSessions(userId),
        usersAPI.getLoginHistory(userId),
        usersAPI.getSecurityAlerts(userId)
      ]);

      setSecurityData({
        activeSessions: sessionsResponse.data,
        loginHistory: loginHistoryResponse.data,
        securityAlerts: alertsResponse.data,
        deviceFingerprints: sessionsResponse.data.map(session => ({
          id: session.id,
          device: session.device,
          browser: session.browser,
          os: session.os,
          fingerprint: session.fingerprint
        })),
        ipAddresses: [...new Set(loginHistoryResponse.data.map(login => login.ipAddress))],
        lastSecurityCheck: new Date().toISOString()
      });
    } catch (error) {
      setError('Failed to load security data');
      showToast('Failed to load security data', 'error');
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // Terminate session
  const handleTerminateSession = async (sessionId) => {
    try {
      showLoader('Terminating session...');
      await usersAPI.terminateSession(sessionId);
      await loadSecurityData(); // Reload data
      showToast('Session terminated successfully', 'success');
    } catch (error) {
      showToast('Failed to terminate session', 'error');
    } finally {
      hideLoader();
    }
  };

  // Terminate all other sessions
  const handleTerminateAllOtherSessions = async () => {
    try {
      showLoader('Terminating all other sessions...');
      await usersAPI.terminateAllOtherSessions(userId);
      await loadSecurityData(); // Reload data
      showToast('All other sessions terminated successfully', 'success');
    } catch (error) {
      showToast('Failed to terminate sessions', 'error');
    } finally {
      hideLoader();
    }
  };

  // Get risk level
  const getRiskLevel = (login) => {
    const now = new Date();
    const loginTime = new Date(login.timestamp);
    const timeDiff = now - loginTime;
    
    // Check for suspicious patterns
    if (login.failedAttempts > 3) return 'high';
    if (timeDiff < 5 * 60 * 1000 && login.location !== 'Unknown') return 'medium';
    if (login.userAgent.includes('bot') || login.userAgent.includes('crawler')) return 'high';
    
    return 'low';
  };

  // Get risk color
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading security data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Security Overview
          </h3>
          <button
            onClick={loadSecurityData}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{securityData.activeSessions.length}</p>
                <p className="text-gray-400 text-sm">Active Sessions</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{securityData.ipAddresses.length}</p>
                <p className="text-gray-400 text-sm">IP Addresses</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{securityData.deviceFingerprints.length}</p>
                <p className="text-gray-400 text-sm">Devices</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{securityData.securityAlerts.length}</p>
                <p className="text-gray-400 text-sm">Security Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-400" />
            Active Sessions
          </h3>
          <button
            onClick={handleTerminateAllOtherSessions}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Terminate All Others
          </button>
        </div>

        <div className="space-y-3">
          {securityData.activeSessions.map((session) => (
            <div key={session.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    session.isCurrent ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <div>
                    <h4 className="text-white font-medium">
                      {session.device} - {session.browser}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {session.location} • Last active: {formatTimestamp(session.lastActive)}
                    </p>
                    <p className="text-gray-500 text-xs">
                      IP: {session.ipAddress} • OS: {session.os}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.isCurrent && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                      Current
                    </span>
                  )}
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Terminate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Recent Login History
        </h3>

        <div className="space-y-3">
          {securityData.loginHistory.slice(0, 10).map((login) => {
            const risk = getRiskLevel(login);
            return (
              <div key={login.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      login.success ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <h4 className="text-white font-medium">
                        {login.success ? 'Successful Login' : 'Failed Login Attempt'}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {login.location} • {formatTimestamp(login.timestamp)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {login.device} • {login.browser} • IP: {login.ipAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(risk)}`}>
                      {risk} risk
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Alerts */}
      {securityData.securityAlerts.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Security Alerts
          </h3>

          <div className="space-y-3">
            {securityData.securityAlerts.map((alert) => (
              <div key={alert.id} className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-red-200 font-medium">{alert.title}</h4>
                    <p className="text-red-300 text-sm mt-1">{alert.description}</p>
                    <p className="text-red-400 text-xs mt-2">
                      {formatTimestamp(alert.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.severity === 'high' ? 'bg-red-600 text-white' :
                      alert.severity === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Fingerprints */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-purple-400" />
          Device Fingerprints
        </h3>

        <div className="space-y-3">
          {securityData.deviceFingerprints.map((device) => (
            <div key={device.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{device.device}</h4>
                    <p className="text-gray-400 text-sm">
                      {device.browser} • {device.os}
                    </p>
                    <p className="text-gray-500 text-xs font-mono">
                      {device.fingerprint.slice(0, 16)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors">
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-yellow-400" />
          Security Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <Download className="w-5 h-5 text-blue-400" />
              <h4 className="text-white font-medium">Download Security Report</h4>
            </div>
            <p className="text-gray-400 text-sm">Export your security data and login history</p>
          </button>

          <button className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <h4 className="text-white font-medium">Clear Login History</h4>
            </div>
            <p className="text-gray-400 text-sm">Remove old login records (keeps last 30 days)</p>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <h4 className="text-red-200 font-medium">Error Loading Security Data</h4>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <button
                onClick={loadSecurityData}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityMonitor;
