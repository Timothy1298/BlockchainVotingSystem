import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Globe
} from 'lucide-react';

const ElectionNotifications = ({ electionId, election }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    channels: ['email', 'sms', 'push'],
    recipients: 'all',
    scheduledFor: '',
    isRecurring: false,
    recurringPattern: 'once'
  });

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      title: 'Election Registration Open',
      message: 'Registration for the Student Union Election is now open. Please register to participate.',
      type: 'info',
      status: 'sent',
      channels: ['email', 'push'],
      recipients: 'all',
      sentAt: '2024-01-15T10:00:00Z',
      scheduledFor: null,
      deliveryStats: {
        email: { sent: 1250, delivered: 1200, opened: 950 },
        sms: { sent: 0, delivered: 0, opened: 0 },
        push: { sent: 800, delivered: 780, opened: 650 }
      }
    },
    {
      id: 2,
      title: 'Voting Period Starting Soon',
      message: 'The voting period for the Student Union Election will begin in 2 hours. Get ready to cast your vote!',
      type: 'warning',
      status: 'scheduled',
      channels: ['email', 'sms', 'push'],
      recipients: 'registered',
      sentAt: null,
      scheduledFor: '2024-01-20T08:00:00Z',
      deliveryStats: null
    },
    {
      id: 3,
      title: 'Voting Reminder',
      message: 'Don\'t forget to vote! The election closes in 24 hours. Your vote matters!',
      type: 'reminder',
      status: 'scheduled',
      channels: ['email', 'push'],
      recipients: 'not_voted',
      sentAt: null,
      scheduledFor: '2024-01-21T10:00:00Z',
      deliveryStats: null
    },
    {
      id: 4,
      title: 'Election Results Available',
      message: 'The results of the Student Union Election are now available. Check the results page to see the winners.',
      type: 'success',
      status: 'draft',
      channels: ['email', 'push'],
      recipients: 'all',
      sentAt: null,
      scheduledFor: null,
      deliveryStats: null
    }
  ];

  const notificationTypes = [
    { value: 'info', label: 'Information', color: 'blue', icon: Bell },
    { value: 'warning', label: 'Warning', color: 'yellow', icon: AlertTriangle },
    { value: 'reminder', label: 'Reminder', color: 'orange', icon: Clock },
    { value: 'success', label: 'Success', color: 'green', icon: CheckCircle },
    { value: 'urgent', label: 'Urgent', color: 'red', icon: AlertTriangle }
  ];

  const recipientGroups = [
    { value: 'all', label: 'All Users' },
    { value: 'registered', label: 'Registered Voters' },
    { value: 'not_voted', label: 'Haven\'t Voted Yet' },
    { value: 'voted', label: 'Already Voted' },
    { value: 'candidates', label: 'Candidates Only' },
    { value: 'admins', label: 'Administrators Only' }
  ];

  const channels = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'sms', label: 'SMS', icon: MessageSquare },
    { value: 'push', label: 'Push Notification', icon: Bell },
    { value: 'in_app', label: 'In-App', icon: Monitor }
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(mockNotifications);
      setLoading(false);
    };

    fetchNotifications();
  }, [electionId]);

  const handleCreateNotification = () => {
    const notification = {
      ...newNotification,
      id: Date.now(),
      status: 'draft',
      sentAt: null,
      deliveryStats: null
    };
    
    setNotifications(prev => [notification, ...prev]);
    setShowCreateModal(false);
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      channels: ['email', 'sms', 'push'],
      recipients: 'all',
      scheduledFor: '',
      isRecurring: false,
      recurringPattern: 'once'
    });
  };

  const handleSendNotification = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id 
        ? { ...notif, status: 'sent', sentAt: new Date().toISOString() }
        : notif
    ));
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'text-green-400 bg-green-900/20';
      case 'scheduled': return 'text-yellow-400 bg-yellow-900/20';
      case 'draft': return 'text-gray-400 bg-gray-900/20';
      case 'failed': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeIcon = (type) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Bell;
  };

  const getTypeColor = (type) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'blue';
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (activeTab) {
      case 'sent': return notif.status === 'sent';
      case 'scheduled': return notif.status === 'scheduled';
      case 'draft': return notif.status === 'draft';
      default: return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Election Notifications</h2>
          <p className="text-gray-400">Manage notifications and communications</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Notification
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'sent', label: 'Sent', count: notifications.filter(n => n.status === 'sent').length },
          { id: 'scheduled', label: 'Scheduled', count: notifications.filter(n => n.status === 'scheduled').length },
          { id: 'draft', label: 'Drafts', count: notifications.filter(n => n.status === 'draft').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-1 text-xs rounded-full ${
              activeTab === tab.id
                ? 'bg-sky-500 text-white'
                : 'bg-gray-600 text-gray-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredNotifications.map((notification) => {
            const TypeIcon = getTypeIcon(notification.type);
            const typeColor = getTypeColor(notification.type);
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-${typeColor}-900/20`}>
                      <TypeIcon className={`w-5 h-5 text-${typeColor}-400`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{notification.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{notification.message}</p>
                      
                      {/* Notification Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Channels:</span>
                          <div className="flex gap-2 mt-1">
                            {notification.channels.map((channel) => {
                              const channelConfig = channels.find(c => c.value === channel);
                              const ChannelIcon = channelConfig?.icon || Bell;
                              return (
                                <div key={channel} className="flex items-center gap-1 text-gray-300">
                                  <ChannelIcon className="w-3 h-3" />
                                  <span className="capitalize">{channel}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-400">Recipients:</span>
                          <p className="text-gray-300 capitalize">
                            {recipientGroups.find(r => r.value === notification.recipients)?.label}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-gray-400">
                            {notification.status === 'sent' ? 'Sent:' : 'Scheduled:'}
                          </span>
                          <p className="text-gray-300">
                            {notification.sentAt 
                              ? new Date(notification.sentAt).toLocaleString()
                              : notification.scheduledFor 
                                ? new Date(notification.scheduledFor).toLocaleString()
                                : 'Not scheduled'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Delivery Stats */}
                      {notification.deliveryStats && (
                        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Delivery Statistics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(notification.deliveryStats).map(([channel, stats]) => (
                              <div key={channel} className="text-sm">
                                <div className="text-gray-400 capitalize mb-1">{channel}</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Sent:</span>
                                    <span className="text-white">{stats.sent}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Delivered:</span>
                                    <span className="text-green-400">{stats.delivered}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Opened:</span>
                                    <span className="text-blue-400">{stats.opened}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {notification.status === 'draft' && (
                      <button
                        onClick={() => handleSendNotification(notification.id)}
                        className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                        title="Send Now"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create Notification Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create Notification</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                    placeholder="Notification title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                    placeholder="Notification message"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                    >
                      {notificationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Recipients
                    </label>
                    <select
                      value={newNotification.recipients}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, recipients: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                    >
                      {recipientGroups.map((group) => (
                        <option key={group.value} value={group.value}>
                          {group.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Channels
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {channels.map((channel) => (
                      <label key={channel.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newNotification.channels.includes(channel.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewNotification(prev => ({
                                ...prev,
                                channels: [...prev.channels, channel.value]
                              }));
                            } else {
                              setNewNotification(prev => ({
                                ...prev,
                                channels: prev.channels.filter(c => c !== channel.value)
                              }));
                            }
                          }}
                          className="mr-2 w-4 h-4 text-sky-400 bg-gray-700 border-gray-600 rounded focus:ring-sky-400"
                        />
                        <channel.icon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-300">{channel.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Schedule (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={newNotification.scheduledFor}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNotification}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
                  >
                    Create Notification
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElectionNotifications;
