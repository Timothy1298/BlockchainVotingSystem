import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  Filter, 
  Search, 
  Settings, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Plus,
  Shield,
  Server,
  Clock,
  User,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { notificationsAPI } from '../../../services/api';
import { useGlobalUI } from '../../../components/common';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    type: 'security',
    severity: 'medium',
    source: ''
    
  });
  const { showToast } = useGlobalUI();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    fetchNotificationSettings();
  }, [filters, pagination.page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const data = await notificationsAPI.list(params);
      setNotifications(data.notifications || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      showToast('Failed to fetch notifications', 'error');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationsAPI.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const data = await notificationsAPI.getSettings();
      setNotificationSettings(data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      fetchNotifications();
      fetchUnreadCount();
      showToast('Notification marked as read', 'success');
    } catch (error) {
      showToast('Failed to mark notification as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      showToast('Failed to mark all notifications as read', 'error');
    }
  };

  const handleAcknowledge = async (id, reason) => {
    try {
      await notificationsAPI.acknowledge(id, reason);
      fetchNotifications();
      showToast('Notification acknowledged', 'success');
    } catch (error) {
      showToast('Failed to acknowledge notification', 'error');
    }
  };

  const handleDismiss = async (id, reason) => {
    try {
      await notificationsAPI.dismiss(id, reason);
      fetchNotifications();
      showToast('Notification dismissed', 'success');
    } catch (error) {
      showToast('Failed to dismiss notification', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      fetchNotifications();
      fetchUnreadCount();
      showToast('Notification deleted', 'success');
    } catch (error) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const handleCreateAlert = async () => {
    try {
      if (newAlert.type === 'security') {
        await notificationsAPI.createSecurityAlert(newAlert);
      } else {
        await notificationsAPI.createOperationalAlert(newAlert);
      }
      
      setShowCreateAlert(false);
      setNewAlert({ title: '', message: '', type: 'security', severity: 'medium', source: '' });
      fetchNotifications();
      showToast('Alert created successfully', 'success');
    } catch (error) {
      showToast('Failed to create alert', 'error');
    }
  };

  const handleUpdateSettings = async (settings) => {
    try {
      await notificationsAPI.updateSettings(settings);
      setNotificationSettings(settings);
      showToast('Notification settings updated', 'success');
    } catch (error) {
      showToast('Failed to update notification settings', 'error');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'high': return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'low': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'info': return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'operational': return <Server className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      case 'election': return <CheckCircle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'text-blue-400 bg-blue-400/20';
      case 'read': return 'text-gray-400 bg-gray-400/20';
      case 'acknowledged': return 'text-green-400 bg-green-400/20';
      case 'dismissed': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const tabs = [
    { id: 'alerts', label: 'Alert List', icon: <Bell className="w-4 h-4" /> },
    { id: 'settings', label: 'Notification Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400">Manage and display actionable alerts and warnings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">{unreadCount} unread</span>
          </div>
          <button
            onClick={() => setShowCreateAlert(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Create Alert
          </button>
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
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
            {activeTab === 'alerts' && (
              <motion.div
                key="alerts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Filters */}
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm w-64"
                      />
                    </div>
                    
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="security">Security</option>
                      <option value="operational">Operational</option>
                      <option value="system">System</option>
                      <option value="election">Election</option>
                    </select>
                    
                    <select
                      value={filters.severity}
                      onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    >
                      <option value="">All Severities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="info">Info</option>
                    </select>
                    
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                    
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark All Read
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-400">Loading notifications...</span>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-700/30 rounded-lg border border-gray-600/50 overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${getSeverityColor(notification.severity)}`}>
                                {getSeverityIcon(notification.severity)}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-white">{notification.title}</h3>
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getSeverityColor(notification.severity)}`}>
                                    {notification.severity}
                                  </span>
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(notification.status)}`}>
                                    {notification.status}
                                  </span>
                                </div>
                                
                                <p className="text-gray-300 mb-3">{notification.message}</p>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                  <div className="flex items-center gap-1">
                                    {getTypeIcon(notification.type)}
                                    <span>{notification.type}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                  </div>
                                  {notification.source && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      <span>{notification.source}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {notification.status === 'unread' && (
                                <button
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all duration-200"
                                  title="Mark as read"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              
                              {notification.status === 'read' && (
                                <button
                                  onClick={() => handleAcknowledge(notification._id, 'Acknowledged by admin')}
                                  className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded-lg transition-all duration-200"
                                  title="Acknowledge"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDismiss(notification._id, 'Dismissed by admin')}
                                className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition-all duration-200"
                                title="Dismiss"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDelete(notification._id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Pagination */}
                    {pagination.pages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                          onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                          disabled={pagination.page === 1}
                          className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all duration-200"
                        >
                          Previous
                        </button>
                        
                        <span className="px-4 py-2 text-gray-300">
                          Page {pagination.page} of {pagination.pages}
                        </span>
                        
                        <button
                          onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                          disabled={pagination.page === pagination.pages}
                          className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all duration-200"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Notifications Found</h3>
                    <p className="text-gray-400">No notifications match your current filters.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white">Notification Settings</h3>

                {notificationSettings ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Email Settings */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <h4 className="font-semibold text-white">Email Notifications</h4>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(notificationSettings.email || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300 capitalize">{key}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => {
                                  const newSettings = {
                                    ...notificationSettings,
                                    email: {
                                      ...notificationSettings.email,
                                      [key]: e.target.checked
                                    }
                                  };
                                  handleUpdateSettings(newSettings);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SMS Settings */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-green-400" />
                        <h4 className="font-semibold text-white">SMS Notifications</h4>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(notificationSettings.sms || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300 capitalize">{key}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => {
                                  const newSettings = {
                                    ...notificationSettings,
                                    sms: {
                                      ...notificationSettings.sms,
                                      [key]: e.target.checked
                                    }
                                  };
                                  handleUpdateSettings(newSettings);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Push Settings */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Smartphone className="w-5 h-5 text-purple-400" />
                        <h4 className="font-semibold text-white">Push Notifications</h4>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(notificationSettings.push || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300 capitalize">{key}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => {
                                  const newSettings = {
                                    ...notificationSettings,
                                    push: {
                                      ...notificationSettings.push,
                                      [key]: e.target.checked
                                    }
                                  };
                                  handleUpdateSettings(newSettings);
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Loading Settings</h3>
                    <p className="text-gray-400">Fetching notification settings...</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create Alert</h3>
              <button
                onClick={() => setShowCreateAlert(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Alert title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-20 resize-none"
                  placeholder="Alert message"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="security">Security</option>
                    <option value="operational">Operational</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                <input
                  type="text"
                  value={newAlert.source}
                  onChange={(e) => setNewAlert({ ...newAlert, source: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Alert source"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleCreateAlert}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Create Alert
              </button>
              <button
                onClick={() => setShowCreateAlert(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
  