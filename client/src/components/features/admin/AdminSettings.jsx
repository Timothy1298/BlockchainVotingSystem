import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Server, 
  Globe, 
  Key, 
  Clock, 
  Save, 
  RefreshCw, 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Trash2, 
  Download, 
  Upload,
  Wrench,
  Eye,
  EyeOff,
  Plus,
  X,
  Edit,
  Lock,
  Unlock
} from 'lucide-react';
import { adminSettingsAPI } from '../../../services/api';
import { useGlobalUI } from '../../common';
  
const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [externalIntegrations, setExternalIntegrations] = useState(null);
  const [securityPolicies, setSecurityPolicies] = useState(null);
  const [systemMaintenance, setSystemMaintenance] = useState(null);
  const [systemConfiguration, setSystemConfiguration] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const { showToast } = useGlobalUI();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchUserRoles(),
      fetchExternalIntegrations(),
      fetchSecurityPolicies(),
      fetchSystemMaintenance(),
      fetchSystemConfiguration()
    ]);
  };

  const fetchUserRoles = async () => {
    try {
      const data = await adminSettingsAPI.getUserRoles();
      setUserRoles(data.roles || []);
    } catch (error) {
      showToast('Failed to fetch user roles', 'error');
      console.error('Error fetching user roles:', error);
    }
  };

  const fetchExternalIntegrations = async () => {
    try {
      const data = await adminSettingsAPI.getExternalIntegrations();
      setExternalIntegrations(data.integrations);
    } catch (error) {
      showToast('Failed to fetch external integrations', 'error');
      console.error('Error fetching external integrations:', error);
    }
  };

  const fetchSecurityPolicies = async () => {
    try {
      const data = await adminSettingsAPI.getSecurityPolicies();
      setSecurityPolicies(data.policies);
    } catch (error) {
      showToast('Failed to fetch security policies', 'error');
      console.error('Error fetching security policies:', error);
    }
  };

  const fetchSystemMaintenance = async () => {
    try {
      const data = await adminSettingsAPI.getSystemMaintenance();
      setSystemMaintenance(data.maintenance);
    } catch (error) {
      showToast('Failed to fetch system maintenance info', 'error');
      console.error('Error fetching system maintenance:', error);
    }
  };

  const fetchSystemConfiguration = async () => {
    try {
      const data = await adminSettingsAPI.getSystemConfiguration();
      setSystemConfiguration(data.config);
    } catch (error) {
      showToast('Failed to fetch system configuration', 'error');
      console.error('Error fetching system configuration:', error);
    }
  };

  const handleUpdateSecurityPolicies = async () => {
    setLoading(true);
    try {
      await adminSettingsAPI.updateSecurityPolicies(securityPolicies);
      showToast('Security policies updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update security policies', 'error');
      console.error('Error updating security policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExternalIntegrations = async () => {
    setLoading(true);
    try {
      await adminSettingsAPI.updateExternalIntegrations(externalIntegrations);
      showToast('External integrations updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update external integrations', 'error');
      console.error('Error updating external integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSystemConfiguration = async () => {
    setLoading(true);
    try {
      await adminSettingsAPI.updateSystemConfiguration(systemConfiguration);
      showToast('System configuration updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update system configuration', 'error');
      console.error('Error updating system configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestIntegration = async (type) => {
    setLoading(true);
    try {
      const result = await adminSettingsAPI.testIntegration(type, externalIntegrations[type]);
      showToast(result.message, 'success');
    } catch (error) {
      showToast('Integration test failed', 'error');
      console.error('Error testing integration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceAction = async (action) => {
    setLoading(true);
    try {
      const result = await adminSettingsAPI.performMaintenance(action);
      showToast(result.message, 'success');
      await fetchSystemMaintenance();
    } catch (error) {
      showToast('Maintenance action failed', 'error');
      console.error('Error performing maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const tabs = [
    { id: 'roles', label: 'User Role Management', icon: <Users className="w-4 h-4" /> },
    { id: 'integrations', label: 'External Integrations', icon: <Globe className="w-4 h-4" /> },
    { id: 'security', label: 'Security Policies', icon: <Shield className="w-4 h-4" /> },
    { id: 'maintenance', label: 'System Maintenance', icon: <Wrench className="w-4 h-4" /> },
    { id: 'configuration', label: 'System Configuration', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
          <p className="text-gray-400">Control panel for high-level, global system configuration</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50">
        <div className="flex border-b border-gray-700/50 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
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
            {activeTab === 'roles' && (
              <motion.div
                key="roles"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white">User Role Management</h3>
                <p className="text-gray-400">Define and manage global user roles and their granular permissions</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userRoles.map((role) => (
                    <div key={role.id} className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white">{role.name}</h4>
                        <span className="px-2 py-1 bg-blue-400/20 text-blue-300 rounded-lg text-xs">
                          {role.id}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4">{role.description}</p>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Permissions:</h5>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="px-2 py-1 bg-gray-600/50 text-gray-300 rounded-lg text-xs"
                            >
                              {permission.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div
                key="integrations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">External Integrations</h3>
                    <p className="text-gray-400">Configure connections to external identity providers and services</p>
                  </div>
                  <button
                    onClick={handleUpdateExternalIntegrations}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                {externalIntegrations && (
                  <div className="space-y-6">
                    {/* Active Directory */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white">Active Directory</h4>
                        <div className="flex items-center gap-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={externalIntegrations.activeDirectory?.enabled || false}
                              onChange={(e) => setExternalIntegrations({
                                ...externalIntegrations,
                                activeDirectory: {
                                  ...externalIntegrations.activeDirectory,
                                  enabled: e.target.checked
                                }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <button
                            onClick={() => handleTestIntegration('activeDirectory')}
                            disabled={loading}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 disabled:opacity-50 transition-all duration-200"
                          >
                            <TestTube className="w-3 h-3" />
                            Test
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Server</label>
                          <input
                            type="text"
                            value={externalIntegrations.activeDirectory?.server || ''}
                            onChange={(e) => setExternalIntegrations({
                              ...externalIntegrations,
                              activeDirectory: {
                                ...externalIntegrations.activeDirectory,
                                server: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                            placeholder="ldap://server.domain.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Domain</label>
                          <input
                            type="text"
                            value={externalIntegrations.activeDirectory?.domain || ''}
                            onChange={(e) => setExternalIntegrations({
                              ...externalIntegrations,
                              activeDirectory: {
                                ...externalIntegrations.activeDirectory,
                                domain: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                            placeholder="domain.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email Configuration */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white">Email Service</h4>
                        <div className="flex items-center gap-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={externalIntegrations.email?.enabled || false}
                              onChange={(e) => setExternalIntegrations({
                                ...externalIntegrations,
                                email: {
                                  ...externalIntegrations.email,
                                  enabled: e.target.checked
                                }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <button
                            onClick={() => handleTestIntegration('email')}
                            disabled={loading}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 disabled:opacity-50 transition-all duration-200"
                          >
                            <TestTube className="w-3 h-3" />
                            Test
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
                          <input
                            type="text"
                            value={externalIntegrations.email?.smtpHost || ''} 
                            onChange={(e) => setExternalIntegrations({
                              ...externalIntegrations,
                              email: {
                                ...externalIntegrations.email,
                                smtpHost: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                            placeholder="smtp.gmail.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
                          <input
                            type="number"
                            value={externalIntegrations.email?.smtpPort || 0}
                            onChange={(e) => setExternalIntegrations({
                              ...externalIntegrations,
                              email: {
                                ...externalIntegrations.email,
                                smtpPort: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                            placeholder="587"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Security Policies</h3>
                    <p className="text-gray-400">Set global password complexity rules and security configurations</p>
                  </div>
                  <button
                    onClick={handleUpdateSecurityPolicies}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                {securityPolicies && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Password Policies */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Password Policies</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Length</label>
                          <input
                            type="number"
                            value={securityPolicies.password?.minLength || 8}
                            onChange={(e) => setSecurityPolicies({
                              ...securityPolicies,
                              password: {
                                ...securityPolicies.password,
                                minLength: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={securityPolicies.password?.requireUppercase || false}
                              onChange={(e) => setSecurityPolicies({
                                ...securityPolicies,
                                password: {
                                  ...securityPolicies.password,
                                  requireUppercase: e.target.checked
                                }
                              })}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">Require uppercase letters</span>
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={securityPolicies.password?.requireNumbers || false}
                              onChange={(e) => setSecurityPolicies({
                                ...securityPolicies,
                                password: {
                                  ...securityPolicies.password,
                                  requireNumbers: e.target.checked
                                }
                              })}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">Require numbers</span>
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={securityPolicies.password?.requireSpecialChars || false}
                              onChange={(e) => setSecurityPolicies({
                                ...securityPolicies,
                                password: {
                                  ...securityPolicies.password,
                                  requireSpecialChars: e.target.checked
                                }
                              })}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">Require special characters</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Session Policies */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Session Policies</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
                          <input
                            type="number"
                            value={securityPolicies.session?.timeout || 30}
                            onChange={(e) => setSecurityPolicies({
                              ...securityPolicies,
                              session: {
                                ...securityPolicies.session,
                                timeout: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Max Concurrent Sessions</label>
                          <input
                            type="number"
                            value={securityPolicies.session?.maxConcurrent || 3}
                            onChange={(e) => setSecurityPolicies({
                              ...securityPolicies,
                              session: {
                                ...securityPolicies.session,
                                maxConcurrent: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* IP Whitelist */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">IP Whitelist</h4>
                      <div className="space-y-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={securityPolicies.ipWhitelist?.enabled || false}
                            onChange={(e) => setSecurityPolicies({
                              ...securityPolicies,
                              ipWhitelist: {
                                ...securityPolicies.ipWhitelist,
                                enabled: e.target.checked
                              }
                            })}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-300">Enable IP whitelist for admin access</span>
                        </label>
                      </div>
                    </div>

                    {/* Login Policies */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Login Policies</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Max Login Attempts</label>
                          <input
                            type="number"
                            value={securityPolicies.login?.maxAttempts || 5}
                            onChange={(e) => setSecurityPolicies({
                              ...securityPolicies,
                              login: {
                                ...securityPolicies.login,
                                maxAttempts: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Lockout Duration (minutes)</label>
                          <input
                            type="number"
                            value={securityPolicies.login?.lockoutDuration || 15}
                            onChange={(e) => setSecurityPolicies({
                              ...securityPolicies,
                              login: {
                                ...securityPolicies.login,
                                lockoutDuration: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'maintenance' && (
              <motion.div
                key="maintenance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white">System Maintenance</h3>
                <p className="text-gray-400">Tools to schedule database backups, clear temporary caches, and update non-blockchain application modules</p>

                {systemMaintenance && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Database Backup */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white">Database Backup</h4>
                        <button
                          onClick={() => handleMaintenanceAction('backup_database')}
                          disabled={loading}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 transition-all duration-200"
                        >
                          <Download className="w-4 h-4" />
                          Backup Now
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Backup:</span>
                          <span className="text-white">
                            {new Date(systemMaintenance.database?.lastBackup).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Frequency:</span>
                          <span className="text-white">{systemMaintenance.database?.backupFrequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Next Backup:</span>
                          <span className="text-white">
                            {new Date(systemMaintenance.database?.nextBackup).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cache Management */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white">Cache Management</h4>
                        <button
                          onClick={() => handleMaintenanceAction('clear_cache')}
                          disabled={loading}
                          className="flex items-center gap-2 px-3 py-2 bg-yellow-600/20 text-yellow-300 rounded-lg hover:bg-yellow-600/30 disabled:opacity-50 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear Cache
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current Size:</span>
                          <span className="text-white">{systemMaintenance.cache?.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Size:</span>
                          <span className="text-white">{systemMaintenance.cache?.maxSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Cleared:</span>
                          <span className="text-white">
                            {new Date(systemMaintenance.cache?.lastCleared).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Log Management */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white">Log Management</h4>
                        <button
                          onClick={() => handleMaintenanceAction('rotate_logs')}
                          disabled={loading}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 disabled:opacity-50 transition-all duration-200"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Rotate Logs
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Size:</span>
                          <span className="text-white">{systemMaintenance.logs?.totalSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Retention:</span>
                          <span className="text-white">{systemMaintenance.logs?.retentionDays} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Rotation:</span>
                          <span className="text-white">
                            {new Date(systemMaintenance.logs?.lastRotation).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* System Updates */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white">System Updates</h4>
                        <button
                          onClick={() => handleMaintenanceAction('check_updates')}
                          disabled={loading}
                          className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 disabled:opacity-50 transition-all duration-200"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Check Updates
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Available Updates:</span>
                          <span className="text-white">{systemMaintenance.updates?.availableUpdates}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Auto Update:</span>
                          <span className="text-white">
                            {systemMaintenance.updates?.autoUpdate ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Check:</span>
                          <span className="text-white">
                            {new Date(systemMaintenance.updates?.lastCheck).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'configuration' && (
              <motion.div
                key="configuration"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">System Configuration</h3>
                    <p className="text-gray-400">Configure global system settings and parameters</p>
                  </div>
                  <button
                    onClick={handleUpdateSystemConfiguration}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                {systemConfiguration && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Settings */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">General Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">System Name</label>
                          <input
                            type="text"
                            value={systemConfiguration.general?.systemName || ''}
                            onChange={(e) => setSystemConfiguration({
                              ...systemConfiguration,
                              general: {
                                ...systemConfiguration.general,
                                systemName: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                          <select
                            value={systemConfiguration.general?.timezone || 'UTC'}
                            onChange={(e) => setSystemConfiguration({
                              ...systemConfiguration,
                              general: {
                                ...systemConfiguration.general,
                                timezone: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Voting Settings */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Voting Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Default Election Duration (hours)</label>
                          <input
                            type="number"
                            value={systemConfiguration.voting?.defaultElectionDuration || 24}
                            onChange={(e) => setSystemConfiguration({
                              ...systemConfiguration,
                              voting: {
                                ...systemConfiguration.voting,
                                defaultElectionDuration: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={systemConfiguration.voting?.allowEarlyVoting || false}
                              onChange={(e) => setSystemConfiguration({
                                ...systemConfiguration,
                                voting: {
                                  ...systemConfiguration.voting,
                                  allowEarlyVoting: e.target.checked
                                }
                              })}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">Allow early voting</span>
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={systemConfiguration.voting?.requireVoterVerification || false}
                              onChange={(e) => setSystemConfiguration({
                                ...systemConfiguration,
                                voting: {
                                  ...systemConfiguration.voting,
                                  requireVoterVerification: e.target.checked
                                }
                              })}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">Require voter verification</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Settings */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Blockchain Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
                          <input
                            type="text"
                            value={systemConfiguration.blockchain?.network || ''}
                            onChange={(e) => setSystemConfiguration({
                              ...systemConfiguration,
                              blockchain: {
                                ...systemConfiguration.blockchain,
                                network: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Gas Price (gwei)</label>
                          <input
                            type="number"
                            value={systemConfiguration.blockchain?.gasPrice || 20}
                            onChange={(e) => setSystemConfiguration({
                              ...systemConfiguration,
                              blockchain: {
                                ...systemConfiguration.blockchain,
                                gasPrice: parseInt(e.target.value)
                              }
                            })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Notification Settings</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={systemConfiguration.notifications?.emailEnabled || false}
                              onChange={(e) => setSystemConfiguration({
                                ...systemConfiguration,
                                notifications: {
                                  ...systemConfiguration.notifications,
                                  emailEnabled: e.target.checked
                                }
                              })}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">Email notifications enabled</span>
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={systemConfiguration.notifications?.smsEnabled || false}
                              onChange={(e) => setSystemConfiguration({
                                ...systemConfiguration,
                                notifications: {
                                  ...systemConfiguration.notifications,
                                  smsEnabled: e.target.checked
                                }
                              })}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">SMS notifications enabled</span>
                          </label>
                          
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={systemConfiguration.notifications?.pushEnabled || false}
                              onChange={(e) => setSystemConfiguration({
                                ...systemConfiguration,
                                notifications: {
                                  ...systemConfiguration.notifications,
                                  pushEnabled: e.target.checked
                                }
                              })}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">Push notifications enabled</span>
                          </label>
                        </div>
                      </div>
                    </div>
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

export default AdminSettings;
