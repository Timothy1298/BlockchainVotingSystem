import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Key, 
  Smartphone, 
  Monitor, 
  LogOut, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Globe,
  Bell,
  Settings,
  QrCode,
  Copy,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { usersAPI } from '../../services/api';
import { useGlobalUI } from '../../components/common';

const Profile = memo(() => {
  const [activeTab, setActiveTab] = useState('personal');
  const [user, setUser] = useState(null);
  const [securitySettings, setSecuritySettings] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    bio: ''   
  });
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const { showToast } = useGlobalUI();

  useEffect(() => {
    fetchUserData();
    fetchSecuritySettings();
    fetchActiveSessions();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await usersAPI.getMe();
      setUser(data);
      setProfileForm({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        bio: data.bio || ''
      });
    } catch (error) {
      showToast('Failed to fetch user data', 'error');
      console.error('Error fetching user data:', error);
    }
  };

  const fetchSecuritySettings = async () => {
    try {
      const data = await usersAPI.getSecuritySettings();
      setSecuritySettings(data);
    } catch (error) {
      showToast('Failed to fetch security settings', 'error');
      console.error('Error fetching security settings:', error);
    }
  };
    
  const fetchActiveSessions = async () => {
    try {
      const data = await usersAPI.getActiveSessions();
      setActiveSessions(data.sessions || []);
    } catch (error) {
      showToast('Failed to fetch active sessions', 'error');
      console.error('Error fetching active sessions:', error);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await usersAPI.updateMe(profileForm);
      await fetchUserData();
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showToast('New password must be at least 8 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      await usersAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      showToast('Password changed successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASetup = async () => {
    setLoading(true);
    try {
      const data = await usersAPI.setup2FA();
      setTwoFactorData(data);
      setShow2FASetup(true);
      showToast('2FA setup initiated', 'success');
    } catch (error) {
      showToast('Failed to setup 2FA', 'error');
      console.error('Error setting up 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async () => {
    if (!twoFactorToken) {
      showToast('Please enter the 2FA token', 'error');
      return;
    }

    setLoading(true);
    try {
      await usersAPI.verify2FA(twoFactorToken);
      setShow2FASetup(false);
      setTwoFactorToken('');
      setTwoFactorData(null);
      await fetchSecuritySettings();
      showToast('2FA verified and enabled successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to verify 2FA', 'error');
      console.error('Error verifying 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handle2FADisable = async () => {
    const password = prompt('Enter your password to disable 2FA:');
    if (!password) return;

    setLoading(true);
    try {
      await usersAPI.disable2FA(password);
      await fetchSecuritySettings();
      showToast('2FA disabled successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to disable 2FA', 'error');
      console.error('Error disabling 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutOtherDevices = async () => {
    const password = prompt('Enter your password to logout other devices:');
    if (!password) return;

    setLoading(true);
    try {
      await usersAPI.logoutOtherDevices(password);
      await fetchActiveSessions();
      setShowLogoutConfirm(false);
      showToast('Other devices logged out successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to logout other devices', 'error');
      console.error('Error logging out other devices:', error);
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
      case 'enabled': return 'text-green-400 bg-green-400/20';
      case 'disabled': return 'text-red-400 bg-red-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'enabled': return <CheckCircle className="w-4 h-4" />;
      case 'disabled': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security Settings', icon: <Shield className="w-4 h-4" /> },
    { id: 'sessions', label: 'Active Sessions', icon: <Monitor className="w-4 h-4" /> }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-gray-400">Manage your personal information and security settings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{user?.role || 'User'}</span>
          </div>
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
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white">Personal Information</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                      <textarea
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-20 resize-none"
                        placeholder="Enter your address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-20 resize-none"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
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
                <h3 className="text-lg font-semibold text-white">Security Settings</h3>

                {/* Password Section */}
                <div className="bg-gray-700/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-white">Password</h4>
                    </div>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
                    >
                      Change Password
                    </button>
                  </div>
                  
                  {showPasswordForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white pr-10"
                            placeholder="Enter current password"
                          />
                          <button
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white pr-10"
                            placeholder="Enter new password"
                          />
                          <button
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white pr-10"
                            placeholder="Confirm new password"
                          />
                          <button
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePasswordChange}
                          disabled={loading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </button>
                        <button
                          onClick={() => setShowPasswordForm(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* 2FA Section */}
                <div className="bg-gray-700/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-green-400" />
                      <h4 className="font-semibold text-white">Two-Factor Authentication</h4>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getStatusColor(securitySettings?.twoFactorEnabled ? 'enabled' : 'disabled')}`}>
                        {getStatusIcon(securitySettings?.twoFactorEnabled ? 'enabled' : 'disabled')}
                        {securitySettings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {securitySettings?.twoFactorEnabled ? (
                        <button
                          onClick={handle2FADisable}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 disabled:opacity-50 transition-all duration-200"
                        >
                          Disable 2FA
                        </button>
                      ) : (
                        <button
                          onClick={handle2FASetup}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 disabled:opacity-50 transition-all duration-200"
                        >
                          Enable 2FA
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {show2FASetup && twoFactorData && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-white mb-2">Scan QR Code</h5>
                        <p className="text-xs text-gray-400 mb-3">
                          Use your authenticator app to scan this QR code:
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                            <QrCode className="w-24 h-24 text-gray-800" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-400 mb-2">Or enter this secret key manually:</p>
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono text-gray-300 bg-gray-700 px-2 py-1 rounded">
                                {twoFactorData.secret}
                              </code>
                              <button
                                onClick={() => copyToClipboard(twoFactorData.secret)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Enter 6-digit code</label>
                        <input
                          type="text"
                          value={twoFactorToken}
                          onChange={(e) => setTwoFactorToken(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          placeholder="000000"
                          maxLength="6"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handle2FAVerify}
                          disabled={loading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
                        >
                          {loading ? 'Verifying...' : 'Verify & Enable'}
                        </button>
                        <button
                          onClick={() => {
                            setShow2FASetup(false);
                            setTwoFactorData(null);
                            setTwoFactorToken('');
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Security Information */}
                {securitySettings && (
                  <div className="bg-gray-700/30 rounded-lg p-6">
                    <h4 className="font-semibold text-white mb-4">Security Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Password Last Changed:</span>
                          <span className="text-sm text-white">
                            {securitySettings.passwordChangedAt 
                              ? new Date(securitySettings.passwordChangedAt).toLocaleDateString()
                              : 'Never'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Last Login:</span>
                          <span className="text-sm text-white">
                            {securitySettings.lastLoginAt 
                              ? new Date(securitySettings.lastLoginAt).toLocaleString()
                              : 'Never'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Email Verified:</span>
                          <span className={`text-sm ${securitySettings.emailVerified ? 'text-green-400' : 'text-red-400'}`}>
                            {securitySettings.emailVerified ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Phone Verified:</span>
                          <span className={`text-sm ${securitySettings.phoneVerified ? 'text-green-400' : 'text-red-400'}`}>
                            {securitySettings.phoneVerified ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout Other Devices
                  </button>
                </div>

                {activeSessions.length > 0 ? (
                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="bg-gray-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-blue-400" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">
                                  {session.userAgent || 'Unknown Device'}
                                </span>
                                {session.isCurrent && (
                                  <span className="px-2 py-1 bg-green-400/20 text-green-300 rounded-lg text-xs">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400">
                                {session.ipAddress} • {new Date(session.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Monitor className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Active Sessions</h3>
                    <p className="text-gray-400">No active sessions found.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logout Other Devices Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Logout Other Devices</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              This will log out all other devices except this one. You'll need to log in again on those devices.
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogoutOtherDevices}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Logging out...' : 'Logout Other Devices'}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
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
});

Profile.displayName = 'Profile';

export default Profile;
