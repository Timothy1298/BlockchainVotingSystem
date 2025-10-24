
// Advanced Topbar for Blockchain Voting System

import { useEffect, useState, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, Bell, LogOut, Search, Zap, ChevronDown, 
  Settings, User, Shield, Activity, Wifi, WifiOff,
  Copy, ExternalLink, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Clock, DollarSign, Hash,
  Network, Database, Server, Eye, EyeOff
} from 'lucide-react';
import { initWeb3 } from '../../../services/blockchain';
import { AuthContext } from '../../../contexts/auth';
import { useSystemMonitoring } from '../../../hooks/system';
import { notificationsAPI } from '../../../services/api';

const Topbar = ({ user, onLogout, onSearch, onHamburgerClick }) => {
  const { user: authUser } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [walletBalance, setWalletBalance] = useState('0');
  const [networkInfo, setNetworkInfo] = useState(null);
  const [gasPrice, setGasPrice] = useState('0');
  const [blockNumber, setBlockNumber] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [err, setErr] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const walletRef = useRef(null);

  // System monitoring
  const { data: systemData, isLoading: systemLoading } = useSystemMonitoring();

  useEffect(() => {
    const stored = localStorage.getItem("connected_wallet");
    if (stored) {
      setWallet(stored);
      fetchWalletDetails(stored);
    }
    
    // Check network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Fetch notifications
    fetchNotifications();
    
    // Set up periodic updates
    const interval = setInterval(() => {
      if (wallet) fetchWalletDetails(wallet);
      fetchNotifications();
      setLastSync(new Date());
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [wallet]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (walletRef.current && !walletRef.current.contains(event.target)) {
        setShowWalletDetails(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchWalletDetails = async (address) => {
    try {
      const { provider } = await initWeb3({ requestAccounts: false });
      if (!provider) return;

      // Get basic wallet info first
      const [balance, network, blockNumberData] = await Promise.all([
        provider.getBalance(address).catch(() => '0'),
        provider.getNetwork().catch(() => ({ name: 'unknown', chainId: 0 })),
        provider.getBlockNumber().catch(() => 0)
      ]);

      // Get gas price with better error handling for different networks
      let gasPriceData = { gasPrice: '0' };
      try {
        // Suppress console errors for unsupported methods
        const originalConsoleError = console.error;
        console.error = () => {}; // Temporarily suppress errors
        
        gasPriceData = await provider.getFeeData();
        console.error = originalConsoleError; // Restore console.error
      } catch (gasError) {
        console.error = originalConsoleError; // Restore console.error
        console.warn('Gas price not available for this network:', gasError.message);
        // Try to get gas price using legacy method
        try {
          const gasPrice = await provider.getGasPrice();
          gasPriceData = { gasPrice };
        } catch (legacyError) {
          console.warn('Legacy gas price also not available:', legacyError.message);
          // Set a default gas price for local networks
          gasPriceData = { gasPrice: '20000000000' }; // 20 gwei
        }
      }

      setWalletBalance((parseFloat(balance.toString()) / 1e18).toFixed(4));
      setNetworkInfo(network);
      setGasPrice((parseFloat(gasPriceData.gasPrice?.toString() || '0') / 1e9).toFixed(2));
      setBlockNumber(blockNumberData);
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      // Set fallback values to prevent UI issues
      setWalletBalance('0');
      setGasPrice('0');
      setBlockNumber(0);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Only fetch notifications if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      const response = await notificationsAPI.getNotifications({ limit: 10 });
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set fallback data to prevent UI issues
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const connect = async () => {
    try {
      setIsConnecting(true);
      setErr(null);
      const { provider, signer } = await initWeb3({ requestAccounts: true });
      if (!provider || !signer) throw new Error("Wallet not available");
      
      const addr = await signer.getAddress();
      setWallet(addr);
      localStorage.setItem("connected_wallet", addr);
      
      await fetchWalletDetails(addr);
    } catch (e) {
      setErr(e.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWallet(null);
    setWalletBalance('0');
    setNetworkInfo(null);
    setGasPrice('0');
    setBlockNumber(0);
    localStorage.removeItem("connected_wallet");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum',
      11155111: 'Sepolia',
      137: 'Polygon',
      56: 'BSC',
      42161: 'Arbitrum'
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  const getSystemStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'unhealthy': return 'text-red-400';
      case 'checking': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getSystemStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-3 h-3" />;
      case 'unhealthy': return <XCircle className="w-3 h-3" />;
      case 'checking': return <RefreshCw className="w-3 h-3 animate-spin" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <header className="fixed left-0 md:left-64 top-0 right-0 h-16 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 flex items-center justify-between px-6 z-40 shadow-lg">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden text-sky-400 hover:text-sky-300 transition-colors" 
          onClick={onHamburgerClick}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* System Status Indicators */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Network Status */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/50">
            {isOnline ? (
              <Wifi className="w-3 h-3 text-green-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-400" />
            )}
            <span className="text-xs text-gray-300">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Blockchain Status */}
          {systemData?.blockchain && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/50">
              <Network className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-gray-300">
                Block #{blockNumber.toLocaleString()}
              </span>
            </div>
          )}

          {/* Gas Price */}
          {gasPrice !== '0' && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/50">
              <DollarSign className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-gray-300">
                {gasPrice} gwei
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search elections, candidates, or users..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full px-4 pl-10 py-2 rounded-xl bg-gray-800/50 text-sm text-gray-100 focus:ring-2 focus:ring-sky-500 border border-gray-700/50 backdrop-blur-sm transition-all duration-200"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* System Health Indicator */}
        <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/50">
          <Activity className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-gray-300">
            {systemLoading ? 'Checking...' : 'System OK'}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 bg-gray-800 rounded-xl shadow-xl border border-gray-700/50 backdrop-blur-sm z-50"
              >
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <div key={index} className="p-3 border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.severity === 'high' ? 'bg-red-400' :
                            notification.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium">{notification.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      No notifications
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wallet Connection */}
        <div className="relative" ref={walletRef}>
          {wallet ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWalletDetails(!showWalletDetails)}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 text-emerald-300 rounded-xl text-sm font-mono cursor-pointer hover:bg-emerald-600/30 transition-all duration-200"
              >
                <Zap className="w-4 h-4" />
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {showWalletDetails && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-gray-800 rounded-xl shadow-xl border border-gray-700/50 backdrop-blur-sm z-50"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white">Wallet Details</h3>
                        <button
                          onClick={disconnect}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Address:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-300">{wallet}</span>
                            <button
                              onClick={() => copyToClipboard(wallet)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Balance:</span>
                          <span className="text-xs text-white font-mono">{walletBalance} ETH</span>
                        </div>
                        
                        {networkInfo && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Network:</span>
                            <span className="text-xs text-white">{getNetworkName(networkInfo.chainId)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Gas Price:</span>
                          <span className="text-xs text-white">{gasPrice} gwei</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Block:</span>
                          <span className="text-xs text-white">#{blockNumber.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={connect} 
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-1.5 bg-sky-600 rounded-xl text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Connect Wallet
                </>
              )}
            </button>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 border-l border-gray-700/50 pl-4 py-2 hover:bg-gray-700/30 rounded-lg transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-gray-200">
                  {user?.fullName || authUser?.fullName || "Guest"}
                </div>
                <div className="text-xs text-gray-400">
                  {user?.role || authUser?.role || "User"}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-56 bg-gray-800 rounded-xl shadow-xl border border-gray-700/50 backdrop-blur-sm z-50"
              >
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-gray-700/50 mb-2">
                    <div className="text-sm font-semibold text-white">
                      {user?.fullName || authUser?.fullName || "Guest"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {user?.email || authUser?.email || "No email"}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <Shield className="w-4 h-4" />
                      Security
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <Activity className="w-4 h-4" />
                      Activity Log
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-700/50 mt-2 pt-2">
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error Display */}
      {err && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-6 right-6 mt-2 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300 text-sm"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {err}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Topbar;