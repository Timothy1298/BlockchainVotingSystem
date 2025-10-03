import React, { useContext, useState, useEffect } from "react"; // Added useEffect for potential cleanup/initial load
import { NavLink } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import { ethers } from 'ethers';

// Small inline wallet connect component used in the dashboard topbar
function WalletConnectInline() {
  const [addr, setAddr] = useState(null);
  const [err, setErr] = useState(null);

  // Check local storage on mount to see if a wallet was previously connected
  useEffect(() => {
    const storedAddr = localStorage.getItem('connected_wallet');
    if (storedAddr) {
        setAddr(storedAddr);
    }
  }, []);

  const connect = async () => {
    setErr(null);
    try {
      // lazy import initWeb3 to avoid circular deps and to use requestAccounts
      const { initWeb3 } = await import('../services/web3');
      // Requesting accounts should handle the connection dialog
      const { provider, signer } = await initWeb3({ requestAccounts: true }); 
      
      // Check if MetaMask is available but connection was denied/failed
      if (!provider) return setErr('MetaMask/Wallet extension not found');
      
      // signer may be null if user denied access
      if (!signer) return setErr('Connection denied by user or failed to obtain signer.');
      
      const address = await signer.getAddress();
      setAddr(address);
      
      // store globally for other components
      try { localStorage.setItem('connected_wallet', address); } catch (e) {}
      window.dispatchEvent(new CustomEvent('walletConnected', { detail: { address } }));
      
    } catch (e) {
      // Handle known errors (e.g., user rejected request)
      const errorMessage = e?.code === 4001 ? "Connection rejected." : e?.message || 'Failed to connect';
      setErr(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-end justify-center">
      {addr ? (
        <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Wallet Connected
            </span>
            <span className="text-sm text-sky-300 font-mono">
                {addr.slice(0,6)}...{addr.slice(-4)}
            </span>
        </div>
      ) : (
        <button 
          onClick={connect} 
          // Styled for theme: high contrast, sky blue/indigo for blockchain connection
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition shadow-md shadow-indigo-900/50"
        >
          Connect Wallet
        </button>
      )}
      {/* Error message styling */}
      {err && (
        <div className={`mt-1 text-xs text-red-400 max-w-[150px] text-right ${addr ? 'hidden' : ''}`}>
          {err.split(':')[0]}
        </div>
      )}
    </div>
  );
}

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    // Main container changed to dark background
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar - Dark, high-contrast design */}
      <aside className="w-64 bg-gray-800 shadow-2xl shadow-black/50 flex flex-col border-r border-sky-500/30">
        <div className="p-6 border-b border-gray-700">
          {/* Logo/Title - Sky blue highlight */}
          <h2 className="text-xl font-extrabold text-sky-500 tracking-wider">
            BLOCK VOTE
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* Navigation Links - use NavLink so active state and SPA routing work */}
          <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium ${isActive ? 'bg-sky-500/20 text-sky-400' : 'text-gray-300 hover:bg-sky-500/20 hover:text-sky-400'}`}>
            <span className="text-xl">🏠</span> Dashboard
          </NavLink>
          <NavLink to="/candidates" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium ${isActive ? 'bg-sky-500/20 text-sky-400' : 'text-gray-300 hover:bg-sky-500/20 hover:text-sky-400'}`}>
            <span className="text-xl">👥</span> Candidates
          </NavLink>
          <NavLink to="/results" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium ${isActive ? 'bg-sky-500/20 text-sky-400' : 'text-gray-300 hover:bg-sky-500/20 hover:text-sky-400'}`}>
            <span className="text-xl">📊</span> Results
          </NavLink>
          <NavLink to="/profile" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium ${isActive ? 'bg-sky-500/20 text-sky-400' : 'text-gray-300 hover:bg-sky-500/20 hover:text-sky-400'}`}>
            <span className="text-xl">⚙</span> Profile
          </NavLink>
        </nav>
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            // Logout button with strong, clear contrast
            className="w-full bg-red-600 text-white font-semibold px-4 py-3 rounded-xl transition hover:bg-red-500 shadow-md shadow-red-900/50"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Section */}
      <div className="flex flex-col flex-1">
        {/* Topbar - Highlighting the primary application color */}
        <header className="bg-gray-800 text-white flex justify-between items-center px-8 py-4 shadow-lg shadow-black/30 border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-tight text-sky-400">
            Blockchain Voting Dashboard
          </h1>
          <div className="flex items-center gap-6"> {/* Increased gap for better spacing */}
            <div className="hidden sm:block">
              {/* Compact wallet connect */}
              <WalletConnectInline />
            </div>
            {/* User Info */}
            <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-300">
                    {user?.fullName || user?.name || "Guest"}
                </span>
                {/* User role pill with a status-like color */}
                <span className="bg-sky-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    {user?.role || "User"}
                </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 bg-gray-900">{children}</main>

        {/* Footer - Subtle and professional */}
        <footer className="bg-gray-800 text-center py-4 text-xs text-gray-500 border-t border-gray-700">
          © {new Date().getFullYear()} Blockchain Voting System. All rights
          reserved.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;