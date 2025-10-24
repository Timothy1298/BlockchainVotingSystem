import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

const OfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check server connectivity
    const checkServerConnectivity = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health', {
          method: 'GET',
          timeout: 5000
        });
        if (response.ok) {
          setIsOnline(true);
          setShowBanner(false);
        } else {
          setIsOnline(false);
          setShowBanner(true);
        }
      } catch (error) {
        setIsOnline(false);
        setShowBanner(true);
      }
    };

    // Check server connectivity every 30 seconds
    const interval = setInterval(checkServerConnectivity, 30000);
    checkServerConnectivity(); // Initial check

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (!showBanner && isOnline) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-300" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-300" />
            )}
            <div>
              <h3 className="font-semibold text-sm">
                {isOnline ? 'Connection Restored' : 'Connection Issues'}
              </h3>
              <p className="text-xs text-red-100">
                {isOnline 
                  ? 'You are back online and connected to the server.'
                  : 'Unable to connect to the server. Some features may be limited.'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isOnline && (
              <button
                onClick={handleRetry}
                className="flex items-center space-x-1 px-3 py-1 bg-red-500 hover:bg-red-400 rounded-md text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
            
            <button
              onClick={() => setShowBanner(false)}
              className="text-red-200 hover:text-white transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OfflineMode;
