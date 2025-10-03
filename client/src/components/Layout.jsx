// Layout.jsx
// =====================================
// Contains Sidebar (fixed) + Topbar components for dashboard
// Sidebar: Always visible, left side
// Topbar: Top navigation with page title, search, notifications, user profile
// =====================================

import React, { useState, Fragment, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Home, Users, BarChart2, Settings, Shield, Menu, X, Bell, LogOut, Search, User, Zap } from 'lucide-react';
import { initWeb3 } from '../services/web3';
import { AuthContext } from '../context/AuthContext';


// Sidebar
export const Sidebar = ({ activeTab, onTabChange, mobileOpen = false, onClose }) => {
  const { user } = useContext(AuthContext);

  // Use Shield icon for Admin/Voters section for a security theme
  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN' || false;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, to: '/dashboard' },
    { id: 'elections', label: 'Elections', icon: Zap, to: '/elections' },
    { id: 'candidates', label: 'Candidates', icon: Users, to: '/candidates' },
    { id: 'results', label: 'Results', icon: BarChart2, to: '/results' },
  ];

  // Admin-only tab(s)
  if (isAdmin) {
    tabs.push({ id: 'voters', label: 'Voters/Verify', icon: Shield, to: '/voters' });
    tabs.push({ id: 'settings', label: 'Admin Settings', icon: Settings, to: '/settings' });
  }

  // Common NavLink styling logic
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
      isActive 
        ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/50' 
        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
    }`;

  // Desktop sidebar
  const desktop = (
    <aside
      role="navigation"
      aria-label="Main navigation"
      // Stronger dark background and border color
      className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-gray-900/90 backdrop-blur-xl border-r border-gray-700 flex-col p-6 z-50"
    >
      {/* Logo: Prominent sky blue accent */}
      <h1 className="text-2xl font-extrabold text-sky-400 mb-12 tracking-wider">
        ChainVote <span className="text-xs align-top font-light text-sky-600">DApp</span>
      </h1>
      <nav className="flex flex-col gap-3" aria-label="Sidebar links">
        {tabs.map(({ id, label, icon: Icon, to }) => (
          <NavLink
            key={id}
            to={to}
            onClick={() => onTabChange?.(id)}
            className={linkClass}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );

  // Mobile sidebar (overlay)
  const mobile = (
    <AnimatePresence>
      {mobileOpen && (
        <Fragment>
          {/* Mobile Menu Panel */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'tween', duration: 0.18 }}
            // Mobile styling matches desktop
            className="fixed inset-y-0 left-0 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700 flex flex-col p-6 z-60 md:hidden"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-xl font-extrabold text-sky-400">ChainVote</h1>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 rounded-lg text-white/90 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-3">
              {tabs.map(({ id, label, icon: Icon, to }) => (
                <NavLink
                  key={id}
                  to={to}
                  onClick={() => {
                    onTabChange?.(id);
                    onClose?.();
                  }}
                  className={linkClass}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </motion.div>

          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50 md:hidden"
            aria-hidden="true"
          />
        </Fragment>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {desktop}
      {mobile}
    </>
  );
};

// Topbar
export const Topbar = ({ title, onSearch, onHamburgerClick, showHamburger = false, user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletError, setWalletError] = useState(null);

  // Check local storage for existing connection on mount (mocked)
  useState(() => {
    try {
      const stored = localStorage.getItem('connected_wallet');
      if (stored) setWalletAddress(stored);
    } catch(e) {}
  }, []);

  const connectTopWallet = async () => {
    setWalletError(null);
    if (typeof window.ethereum === 'undefined') {
      setWalletError('MetaMask or equivalent wallet not detected.');
      return;
    }
    try {
      // Mocked web3 connection
      const { provider, signer } = await initWeb3({ requestAccounts: true });
      if (!provider || !signer) throw new Error('Failed to connect to wallet');
      const addr = await signer.getAddress();
      setWalletAddress(addr);
      try { localStorage.setItem('connected_wallet', addr); } catch(e) {}
      window.dispatchEvent(new CustomEvent('walletConnected', { detail: { address: addr } }));
    } catch (e) {
      setWalletError(e?.message || 'Failed to connect');
    }
  };

  const disconnectTopWallet = () => {
    setWalletAddress(null);
    setWalletError(null);
    try { localStorage.removeItem('connected_wallet'); } catch(e) {}
    window.dispatchEvent(new CustomEvent('walletConnected', { detail: { address: null } }));
  };

  const initials = (() => {
    const name = user?.name || user?.fullName || '';
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  })();

  const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div 
      // Topbar styling: Dark, blurred, strong bottom border
      className="fixed left-0 md:left-64 top-0 right-0 h-16 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700 flex items-center justify-between px-6 z-40 transition-all duration-300"
    >
      {/* Title/Hamburger Section */}
      <div className="flex items-center gap-3">
        {showHamburger && (
          <button
            onClick={onHamburgerClick}
            aria-label="Open menu"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-sky-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        {/* Page Title: Strong white text */}
        <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search by ID or title..."
              onChange={(e) => onSearch?.(e.target.value)}
              aria-label="Search"
              // Dark, clean input with sky blue focus ring
              className="px-4 pl-10 py-2 rounded-xl bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 border border-gray-700 placeholder-gray-400 transition"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Notifications */}
        <button aria-label="Notifications" className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-sky-500">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-gray-900" />
        </button>

        {/* Wallet Connect/Status (Emerald for financial/secure status) */}
        <div className="hidden sm:flex items-center gap-3 border-l border-gray-700 pl-4">
          {walletAddress ? (
            <div 
                className="flex items-center gap-2 bg-emerald-600/20 text-emerald-300 px-3 py-1.5 rounded-xl text-sm font-mono border border-emerald-600 cursor-pointer hover:bg-emerald-600/30 transition"
                onClick={disconnectTopWallet}
                title="Click to disconnect wallet"
            >
                <Zap className="w-4 h-4 fill-emerald-300" />
                {formatAddress(walletAddress)}
            </div>
          ) : (
            <button 
                onClick={connectTopWallet} 
                className="px-4 py-1.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-500 transition shadow-md shadow-sky-900/50"
            >
                Connect Wallet
            </button>
          )}
        </div>
        {walletError && <span className="text-xs text-red-400 absolute bottom-0 right-0 mr-4 mt-1">{walletError}</span>}


        {/* Avatar / Profile menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="Open user menu"
            // The user avatar uses a deep, rich color (indigo)
            className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-sky-500/50 hover:ring-sky-500 transition focus:outline-none"
          >
            {initials}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                // Menu styling: Dark, blurred, subtle border
                className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 py-1 z-50 origin-top-right"
              >
                <div className="px-4 py-2 border-b border-gray-700 mb-1">
                    <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-sky-400 font-mono italic">{user?.role || 'Voter'}</p>
                </div>
                
                <button
                  onClick={() => { setMenuOpen(false); /* Profile action */ }}
                  className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/70 transition rounded-md"
                >
                  <User className="w-4 h-4 text-sky-400" />
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Layout wrapper (Sidebar + Topbar + Content)
export const DashboardLayout = ({
  children,
  activeTab,
  onTabChange,
  title,
  onSearch,
  user,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Note: Using the provided props as fallback in case context is not fully mocked/implemented
  const auth = useContext(AuthContext);
  const loggedUser = auth?.user || user;
  const logoutFn = auth?.logout || onLogout;

  return (
    // Set global dark background
    <div className="min-h-screen bg-gray-900 text-white">
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="md:ml-64 flex-1">
        <Topbar
          title={title}
          onSearch={onSearch}
          onHamburgerClick={() => setMobileOpen(true)}
          showHamburger={true}
          user={loggedUser}
          onLogout={logoutFn}
        />
        {/* Main content area, starts below the fixed Topbar */}
        <main className="pt-20 px-6 pb-10 min-h-[calc(100vh-80px)]">
            {children}
        </main>
      </div>
    </div>
  );
};