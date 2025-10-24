// GlobalUI.jsx
// =====================================
// This file provides:
// - GlobalLoader (fullscreen overlay with animated spinner + message)
// - Toast system (stackable notifications with auto-dismiss, framer-motion animations)
// - GlobalUIProvider (React Context) to manage loader & toasts from anywhere
// - Hooks: useGlobalUI() for controlling loader/toasts
//
// Usage:
// 1. Wrap your <App /> with <GlobalUIProvider>
// 2. Use useGlobalUI() in any component:
//    const { showLoader, hideLoader, showToast } = useGlobalUI();
//    showLoader('Processing vote...'); hideLoader();
//    showToast('Vote submitted!', 'success');
//
// Toast types: 'success' | 'error' | 'info'
// =====================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icon for the Loader (custom spinner)
const LoaderSpinner = () => (
    <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        {/* Sky-500 accent color for the moving arc */}
        <motion.path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            initial={{ pathLength: 0.5 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        />
    </svg>
);

// Loader Component
const LoaderOverlay = ({ message }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    // Dark, blurred background for high contrast
    className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white"
  >
    <div className="text-sky-500 mb-6">
        <LoaderSpinner />
    </div>
    {/* Message: Prominent and pulsing */}
    <p className="text-lg font-extrabold text-sky-300 tracking-wider animate-pulse">
        {message || 'Processing Transaction...'}
    </p>
    <p className="text-sm text-gray-400 mt-2">
        Awaiting blockchain confirmation...
    </p>
  </motion.div>
);

// Toast Component
const Toast = ({ id, message, type, onClose }) => {
  const typeStyles = {
    // Theme colors: Success (Emerald), Error (Red), Info (Sky Blue)
    success: { bg: 'bg-emerald-600', icon: '✅' },
    error: { bg: 'bg-red-600', icon: '🚨' },
    info: { bg: 'bg-sky-600', icon: 'ℹ️' },
  };
  
  const { bg, icon } = typeStyles[type] || typeStyles.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }} // Slide in from the right
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      // Sleek, strong card design
      className={`text-white px-5 py-3 rounded-xl shadow-2xl ${bg} border border-white/10`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-semibold flex-1">{message}</span>
        {/* Close button with better focus styling */}
        <button
          onClick={() => onClose(id)}
          className="ml-2 p-1 rounded-full text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
        >
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </motion.div>
  );
};

// Context
const GlobalUIContext = createContext(null);

export function GlobalUIProvider({ children }) {
  const [loader, setLoader] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showLoader = useCallback((message) => setLoader(message || 'Loading...'), []);
  const hideLoader = useCallback(() => setLoader(null), []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => { // Increased duration slightly
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <GlobalUIContext.Provider value={{ showLoader, hideLoader, showToast }}>
      {children}
      {/* Loader always rendered inside AnimatePresence */}
      <AnimatePresence>{loader && <LoaderOverlay message={loader} />}</AnimatePresence>

      {/* Toast Container: Fixed position, stacked from bottom */}
      <div className="fixed bottom-4 right-4 z-[101] space-y-3 w-80"> 
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </GlobalUIContext.Provider>
  );
}

export function useGlobalUI() {
  const ctx = useContext(GlobalUIContext);
  if (!ctx) throw new Error('useGlobalUI must be used within GlobalUIProvider');
  return ctx;
}