import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Flag, 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Edit, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Smartphone, 
  Globe, 
  Moon, 
  Sun, 
  Bell, 
  Trash2, 
  Download, 
  Upload,
  Camera,
  Settings,
  HelpCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import VoterDashboardLayout from './VoteDashboardLayout';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';
import { useGlobalUI } from '../../components/common';
import { usersAPI } from '../../services/api';
import SecurityMonitor from '../../components/voters/SecurityMonitor';
import { voterRegistrationAPI } from '../../services/api/voterRegistrationAPI';

const VoterProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { selectedAccount, isConnected, connectMetaMask, disconnectMetaMask } = useMetaMaskContext();
  const { showLoader, hideLoader, showToast } = useGlobalUI();

  // State management
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    language: 'en',
    theme: 'dark',
    timezone: 'UTC'
  });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [activeTab, setActiveTab] = useState('profile');

  // Load user data
  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoader('Loading profile...');

      // Load profile data from server (auth-based)
      const res = await voterRegistrationAPI.getVoterProfile();
      const data = res?.data?.data || res?.data || {};
      const profile = data?.user || data;

      setProfileData({
        firstName: profile?.kycInfo?.firstName || profile?.firstName || '',
        lastName: profile?.kycInfo?.lastName || profile?.lastName || '',
        email: profile?.email || user?.email || '',
        phone: profile?.kycInfo?.phone || profile?.phone || '',
        dateOfBirth: profile?.kycInfo?.dateOfBirth || profile?.dateOfBirth || '',
        nationality: profile?.kycInfo?.nationality || profile?.nationality || '',
        address: profile?.kycInfo?.address || profile?.address || {
          street: '', city: '', state: '', zipCode: '', country: ''
        }
      });

      // Optional: load settings/sessions if endpoints exist; otherwise skip gracefully
      try {
        const settingsResponse = await usersAPI.getUserSettings?.(user?.id);
        if (settingsResponse?.data) setSettings(settingsResponse.data);
      } catch (_) {}
      try {
        const sessionsResponse = await usersAPI.getActiveSessions?.(user?.id);
        if (sessionsResponse?.data) setSessions(sessionsResponse.data);
      } catch (_) {}

    } catch (error) {
      setError('Failed to load profile data');
      showToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      showLoader('Updating profile...');

      await voterRegistrationAPI.updateVoterProfile(profileData);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      setError(error.message || 'Failed to update profile');
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
      hideLoader();
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      setSaving(true);
      showLoader('Changing password...');

      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      showToast('Password changed successfully', 'success');
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.message || 'Failed to change password');
      showToast('Failed to change password', 'error');
    } finally {
      setSaving(false);
      hideLoader();
    }
  };

  // Handle settings update
  const handleSettingsUpdate = async () => {
    try {
      setSaving(true);
      showLoader('Updating settings...');

      await usersAPI.updateUserSettings(user?.id, settings);
      showToast('Settings updated successfully', 'success');
    } catch (error) {
      setError(error.message || 'Failed to update settings');
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
      hideLoader();
    }
  };

  // Handle session termination
  const handleTerminateSession = async (sessionId) => {
    try {
      showLoader('Terminating session...');
      await usersAPI.terminateSession(sessionId);
      await loadUserData(); // Reload sessions
      showToast('Session terminated successfully', 'success');
    } catch (error) {
      showToast('Failed to terminate session', 'error');
    } finally {
      hideLoader();
    }
  };

  // Handle 2FA toggle
  const handle2FAToggle = async () => {
    try {
      setSaving(true);
      showLoader(settings.twoFactorEnabled ? 'Disabling 2FA...' : 'Enabling 2FA...');

      const newSettings = { ...settings, twoFactorEnabled: !settings.twoFactorEnabled };
      await usersAPI.updateUserSettings(user?.id, newSettings);
      setSettings(newSettings);
      showToast(`2FA ${newSettings.twoFactorEnabled ? 'enabled' : 'disabled'} successfully`, 'success');
    } catch (error) {
      setError(error.message || 'Failed to update 2FA settings');
      showToast('Failed to update 2FA settings', 'error');
    } finally {
      setSaving(false);
      hideLoader();
    }
  };

  // Handle input change
  const handleInputChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading) {
    return (
      <VoterDashboardLayout currentTab="profile">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </VoterDashboardLayout>
    );
  }

  return (
    <VoterDashboardLayout currentTab="profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Profile & Settings</h2>
              <p className="text-blue-100">
                Manage your account information and preferences
              </p>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-8 h-8 text-blue-300" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 rounded-lg p-1 border border-gray-700">
          <div className="flex space-x-1">
            {[
              { id: 'profile', name: 'Profile', icon: User },
              { id: 'security', name: 'Security', icon: Shield },
              { id: 'settings', name: 'Settings', icon: Settings },
              { id: 'sessions', name: 'Sessions', icon: Lock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Voter Registration Details */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Voter Registration Details
              </h3>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Date of Birth and Nationality */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={profileData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your nationality"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Information
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={profileData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your street address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={profileData.address.city}
                          onChange={(e) => handleInputChange('address.city', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your city"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={profileData.address.state}
                          onChange={(e) => handleInputChange('address.state', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your state/province"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          ZIP/Postal Code
                        </label>
                        <input
                          type="text"
                          value={profileData.address.zipCode}
                          onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your ZIP/postal code"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={profileData.address.country}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your country"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-3 rounded-lg text-white transition-colors flex items-center gap-2 ${
                      saving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information Update */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-400" />
                Contact Information Update
              </h3>
              
              <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-1">Re-verification Required</p>
                    <p>
                      Changing your email address or phone number will require re-verification 
                      to maintain account security and voting eligibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Password Change */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-red-400" />
                Change Password
              </h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-3 rounded-lg text-white transition-colors flex items-center gap-2 ${
                      saving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Changing...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Two-Factor Authentication (2FA)
              </h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">SMS Authentication</h4>
                  <p className="text-gray-400 text-sm">
                    {settings.twoFactorEnabled 
                      ? '2FA is currently enabled for your account'
                      : 'Add an extra layer of security to your account'
                    }
                  </p>
                </div>
                <button
                  onClick={handle2FAToggle}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg text-white transition-colors ${
                    settings.twoFactorEnabled
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {settings.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                </button>
              </div>
            </div>

            {/* Digital Wallet Management */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-purple-400" />
                Digital Wallet Management
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isConnected ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <h4 className="text-white font-medium">MetaMask Wallet</h4>
                      <p className="text-gray-400 text-sm">
                        {isConnected 
                          ? `Connected: ${selectedAccount?.slice(0, 6)}...${selectedAccount?.slice(-4)}`
                          : 'Not connected'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={isConnected ? disconnectMetaMask : connectMetaMask}
                    className={`px-4 py-2 rounded-lg text-white transition-colors ${
                      isConnected
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Privacy & Consent Settings */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Privacy & Consent Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Email Notifications</h4>
                    <p className="text-gray-400 text-sm">Receive notifications about elections and account updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">SMS Notifications</h4>
                    <p className="text-gray-400 text-sm">Receive SMS alerts for important updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Language Selection */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-400" />
                Language & Display Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">Greenwich Mean Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Settings */}
            <div className="flex justify-end">
              <button
                onClick={handleSettingsUpdate}
                disabled={saving}
                className={`px-6 py-3 rounded-lg text-white transition-colors flex items-center gap-2 ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Security Monitor */}
            <SecurityMonitor userId={user?.id} />

            {/* Help & Support Contact */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                Help & Support
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Account Support</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Need help with your account or voting process?
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Contact Support
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Security Issues</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Report security concerns or suspicious activity
                  </p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <h4 className="text-red-200 font-medium">Error</h4>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VoterDashboardLayout>
  );
};

export default VoterProfile;
