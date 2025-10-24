import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  Shield,
  Vote,
  FileText,
  UserCheck,
  Home,
  Calendar,
  Eye,
  HelpCircle,
  Globe,
  Moon,
  Sun,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';
import { useGlobalUI } from '../../components/common';
import NotificationWidget from '../../components/common/NotificationWidget';
const VoterDashboardLayout = ({ children, currentTab = 'dashboard' }) => {
  const { user, logout } = useAuth();
  const { selectedAccount, isConnected, connectMetaMask } = useMetaMaskContext();
  const { showToast } = useGlobalUI();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');

  // Navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Elections Dashboard',
      icon: Home,
      path: '/voter/dashboard',
      description: 'View active elections and your voting status'
    },
    {
      id: 'ballot',
      name: 'Cast Your Vote',
      icon: Vote,
      path: '/voter/ballot',
      description: 'Vote in active elections'
    },
    {
      id: 'verifiability',
      name: 'My Vote & Audit',
      icon: Eye,
      path: '/voter/verifiability',
      description: 'Verify your votes and audit trail'
    },
    {
      id: 'profile',
      name: 'Profile & Settings',
      icon: UserCheck,
      path: '/voter/profile',
      description: 'Manage your account and preferences'
    },
    {
      id: 'registration',
      name: 'Voter Registration',
      icon: FileText,
      path: '/voter/registration',
      description: 'Complete your voter registration'
    }
  ];

  // Mock notifications
  const [notifications] = useState([
    {
      id: 1,
      title: 'Election Reminder',
      message: 'Presidential Election voting closes in 2 hours',
      type: 'urgent',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false
    },
    {
      id: 2,
      title: 'Registration Approved',
      message: 'Your voter registration has been approved',
      type: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: 3,
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday 2AM-4AM',
      type: 'info',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true
    }
  ]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  // Handle MetaMask connection
  const handleConnectMetaMask = async () => {
    try {
      await connectMetaMask();
      showToast('MetaMask connected successfully', 'success');
    } catch (error) {
      showToast('Failed to connect MetaMask', 'error');
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    localStorage.setItem('theme', newTheme);
  };

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('light', savedTheme === 'light');
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-gray-900 text-white">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex items-center ml-4 lg:ml-0">
                <div className="flex-shrink-0 flex items-center">
                  <Shield className="w-8 h-8 text-blue-400" />
                  <span className="ml-2 text-xl font-bold text-white">VoteChain</span>
                </div>
                <span className="ml-3 text-sm text-gray-400 hidden sm:block">Voter Portal</span>
              </div>
            </div>

            {/* Center - Current page indicator */}
            <div className="hidden md:block">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-gray-500">Current:</span>
                <span className="font-medium">
                  {navigationItems.find(item => item.id === currentTab)?.name || 'Dashboard'}
                </span>
              </div>
            </div>

            {/* Right side - Notifications, MetaMask, User menu */}
            <div className="flex items-center gap-4">
              {/* MetaMask Status */}
              <div className="hidden sm:flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-600/50 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-300">
                      {selectedAccount ? `${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}` : 'Connected'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectMetaMask}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-600/50 rounded-lg hover:bg-blue-600/30 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm text-blue-300">Connect Wallet</span>
                  </button>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <NotificationWidget />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user?.name || 'Voter'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50"
                    >
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-gray-700">
                          <p className="text-sm font-medium text-white">{user?.name || 'Voter'}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          Help & Support
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-600/20 rounded transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64 bg-gray-800 border-r border-gray-700 h-full overflow-y-auto">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-semibold text-white">Voter Portal</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-700">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Security Status</span>
                </div>
                <div className="text-xs text-gray-300">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Encrypted Connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Verified Identity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 lg:hidden"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <span className="text-lg font-semibold text-white">Voter Portal</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-gray-400 group-hover:text-gray-300">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-gray-700">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Security Status</span>
                  </div>
                  <div className="text-xs text-gray-300">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Encrypted Connection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Verified Identity</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Page Header */}
          <div className="bg-gray-800/50 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {navigationItems.find(item => item.id === currentTab)?.name || 'Dashboard'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {navigationItems.find(item => item.id === currentTab)?.description || 'Welcome to your voter dashboard'}
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                {currentTab === 'dashboard' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    View Elections
                  </button>
                )}
                {currentTab === 'ballot' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <Vote className="w-4 h-4" />
                    Cast Vote
                  </button>
                )}
                {currentTab === 'verifiability' && (
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Verify Vote
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-gray-800 border-t border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>© 2024 VoteChain. All rights reserved.</span>
                <span>•</span>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <span>•</span>
                <a href="#" className="hover:text-white transition-colors">Help Center</a>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Globe className="w-4 h-4" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent border-none text-gray-400 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>Secure Voting Platform</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default VoterDashboardLayout;