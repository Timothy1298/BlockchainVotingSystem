// Navbar.jsx
// =====================================
// Features implemented:
// - Responsive Navbar with brand logo/title
// - WalletConnectCard integration (shows wallet state inline)
// - Mobile hamburger menu with framer-motion slide-in
// - Smooth entrance animation for navbar
// - Tailwind glassmorphism styling + subtle shadows (now dark theme focused)
// - Hover and active states for nav links
// - Animated underline effect for active page
//
// Dependencies: framer-motion, ethers (simulated)
// =====================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import WalletBanner from './WalletBanner';
import DebugAuth from './DebugAuth';

// --- MOCK WalletConnectCard for component completeness ---
// In a real project, this would be imported from './WalletConnectCard'
const WalletConnectCard = () => {
    // Mocked state for simplicity
    const [isConnected, setIsConnected] = useState(false);
    const address = "0x4A6f...932E";

    const handleClick = () => {
        setIsConnected(prev => !prev);
        // Simulate potential wallet error on connect attempt
        if (isConnected) {
            console.log('Wallet disconnected');
        } else {
            console.log('Attempting wallet connection...');
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                isConnected 
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-600 hover:bg-emerald-600/30 ring-emerald-500/50'
                    : 'bg-sky-600 text-white hover:bg-sky-500 ring-sky-500/50'
            }`}
        >
            {isConnected ? `Connected: ${address.slice(0, 6)}...` : 'Connect Wallet'}
        </button>
    );
};
// ---------------------------------------------------------


const navLinks = [
  { name: 'Home', href: '#home', isActive: true }, // Set Home as active for visual demonstration
  { name: 'Elections', href: '#elections', isActive: false },
  { name: 'Results', href: '#results', isActive: false },
  { name: 'Admin', href: '#admin', isActive: false },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <WalletBanner />
      <motion.nav
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      // Dark glassmorphism styling
      className="fixed top-0 inset-x-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700 shadow-2xl shadow-black/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20"> {/* Increased height slightly for bolder feel */}
          {/* Left: Brand */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {/* Logo: Sky blue circle accent */}
            <span className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-sky-900/50">V</span>
            <span className="font-extrabold text-xl tracking-wider text-white">Chain<span className="text-sky-400">Vote</span></span>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`relative text-base font-semibold transition-colors duration-200 group py-1 ${
                  link.isActive ? 'text-sky-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
                {/* Animated underline */}
                <motion.span 
                  className={`absolute left-0 bottom-0.5 h-0.5 bg-sky-500 rounded-full ${link.isActive ? 'w-full' : 'w-0'}`}
                  initial={false}
                  animate={{ width: link.isActive ? '100%' : '0%', opacity: link.isActive ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                {!link.isActive && (
                  <span className="absolute left-0 bottom-0.5 w-0 h-0.5 bg-sky-500 transition-all duration-300 group-hover:w-full rounded-full opacity-50"></span>
                )}
              </a>
            ))}
          </div>

          {/* Right: Wallet + Hamburger */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <WalletConnectCard />
            </div>

            <div className="hidden lg:block">
              <DebugAuth />
            </div>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-sky-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            // Mobile menu styling
            className="md:hidden bg-gray-800/95 backdrop-blur-xl border-t border-gray-700 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-lg px-2 py-2 rounded-lg font-medium transition ${
                    link.isActive ? 'bg-sky-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-700/50">
                <WalletConnectCard />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
}
