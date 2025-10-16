import React, { useContext, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthContext } from '../context/AuthContext';
import { useGlobalUI } from '../components/GloabalUI.jsx';
import useWallet from '../context/useWallet';
// NEW IMPORTS
 
import { FaUserShield, FaWallet, FaCopy, FaExternalLinkAlt, FaCheckCircle, FaExclamationTriangle, FaChartLine, FaPlug } from 'react-icons/fa';

export default function Profile() {
  const { user, token, logout } = useContext(AuthContext);
  const { walletAddress, isConnected, isConnecting, ethBalance, connectWallet, disconnectWallet } = useWallet(); // 🌟 Use Wallet Context
  const [refreshing, setRefreshing] = useState(false);
  const { showLoader, hideLoader, showToast } = useGlobalUI();

  // --- DERIVED PROFILE DATA ---
  // If MetaMask is connected, use that address. Otherwise, use the server-provided address.
  const finalWalletAddress = isConnected ? walletAddress : user?.walletAddress;
  const isAdmin = String(user?.role).toLowerCase() === 'admin';
  const adminPermissions = isAdmin ? ['CREATE_ELECTION', 'FINALIZE_ELECTION', 'MANAGE_VOTERS', 'UPGRADE_CONTRACT'] : [];
  
  const refresh = async () => {
    try {
      setRefreshing(true);
      showLoader('Refreshing profile...');
      const res = await fetch('/api/auth/me', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Failed to fetch profile data.');
      
      // Assume AuthContext has an 'updateUser' function that uses the fetched data:
      // const data = await res.json();
      // updateUser(data.user); // Uncomment if implemented in AuthContext
      
      hideLoader();
      showToast('Profile refreshed.', 'success');
    } catch (err) {
      console.error(err);
      hideLoader();
      showToast('Failed to refresh profile data.', 'error');
    } finally { setRefreshing(false); }
  };

  const getRoleColor = (role) => {
    switch (String(role).toLowerCase()) {
      case 'admin': return 'text-red-400 font-bold';
      case 'voter': return 'text-sky-400 font-bold';
      default: return 'text-gray-400';
    }
  };

  const truncateWalletAddress = (address) => {
    if (!address) return 'N/A';
    const str = String(address);
    return `${str.substring(0, 6)}...${str.slice(-4)}`;
  };

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-xl mx-auto text-white p-4">
        <h1 className="text-3xl font-extrabold mb-6 tracking-wide border-b border-gray-700 pb-3">
          Your Secure Profile
        </h1>

        <div className="bg-gray-800 border border-gray-700 shadow-xl shadow-black/50 p-8 rounded-xl space-y-8">
          
          {/* 1. ACCOUNT DETAILS SECTION */}
          <div>
            <h2 className="text-xl font-semibold text-sky-400 mb-4 flex items-center gap-2">
              <FaUserShield className="text-2xl" /> Account Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <strong className="text-gray-400">Full Name:</strong> 
                <span className="text-white font-medium">{user?.fullName || user?.name || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <strong className="text-gray-400">Email Address:</strong> 
                <span className="text-white font-medium">{user?.email || '—'}</span>
              </div>
              <div className="flex justify-between pb-2">
                <strong className="text-gray-400">Role:</strong> 
                <span className={`font-semibold uppercase tracking-wider ${getRoleColor(user?.role)}`}>
                  {user?.role || 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. BLOCKCHAIN DETAILS SECTION */}
          <div className="pt-6 border-t border-gray-700/50">
            <h2 className="text-xl font-semibold text-indigo-400 mb-4 flex items-center gap-2">
              <FaWallet className="text-xl" /> Blockchain Identity
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                <strong className="text-gray-400">Wallet Address:</strong> 
                {finalWalletAddress ? (
                    <div className="flex items-center gap-2">
                        <span 
                            className={`text-sm font-mono transition duration-200 ${isConnected ? 'text-green-400' : 'text-gray-400'}`}
                            title={finalWalletAddress} 
                        >
                            {truncateWalletAddress(finalWalletAddress)}
                            {isConnected && ' (Active)'}
                        </span>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(finalWalletAddress);
                                showToast('Address copied!', 'info');
                            }}
                            className="text-sky-500 hover:text-sky-300 transition"
                            title="Copy Address"
                        >
                            <FaCopy className="w-3 h-3" />
                        </button>
                        <a 
                            href={`https://etherscan.io/address/${finalWalletAddress}`} // Link to the appropriate explorer
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-red-500 hover:text-red-300 transition"
                            title="View on Explorer"
                        >
                            <FaExternalLinkAlt className="w-3 h-3" />
                        </a>
                    </div>
                ) : (
                    <span className="text-red-500">Not Linked</span>
                )}
              </div>
              
              <div className="flex justify-between border-b border-gray-700/50 pb-2">
                <strong className="text-gray-400">Connection Status:</strong>
                {isConnecting ? (
                    <span className="text-yellow-500">Connecting...</span>
                ) : isConnected ? (
                    <span className="text-green-400 flex items-center gap-2">
                        <FaCheckCircle /> Connected (MetaMask)
                    </span>
                ) : (
                    <span className="text-red-400 flex items-center gap-2">
                        <FaExclamationTriangle /> Disconnected
                    </span>
                )}
              </div>

              {isConnected && (
                  <div className="flex justify-between">
                    <strong className="text-gray-400">Wallet Balance (Gas):</strong>
                    <span className="text-white font-mono">{ethBalance || 'Loading...'}</span>
                  </div>
              )}
            </div>
          </div>
          
          {/* 3. ADMIN PANEL (CONDITIONAL) */}
          {/* ... (Keep the existing Admin panel logic from the previous perfect response) ... */}
          {isAdmin && (
            <div className="pt-8 space-y-6 border-t border-gray-700">
                <h2 className="text-xl font-semibold text-red-400 flex items-center gap-2">
                    <FaChartLine className="text-xl" /> System Admin Panel
                </h2>

                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <strong className="text-gray-300 block mb-3 text-lg">Current Permissions:</strong>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {adminPermissions.map(p => (
                            <span key={p} className="bg-red-900/70 text-red-300 px-3 py-1 rounded-full font-semibold">
                                {p.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4 border-t border-gray-700/50">
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-xl transition shadow-md"
                        onClick={() => showToast('Navigating to Admin Control...', 'info')}
                    >
                        Admin Controls
                    </button>
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition shadow-md"
                        onClick={() => showToast('Initiating contract upgrade...', 'warning')}
                    >
                        Contract Upgrade
                    </button>
                </div>
            </div>
          )}
          
          {/* 4. GENERAL ACTIONS */}
          <div className="pt-6 flex gap-4 border-t border-gray-700/50">
            {/* Wallet Connect/Disconnect Button (Highest priority for dApp) */}
            {!isConnected ? (
                <button 
                    onClick={connectWallet} 
                    disabled={isConnecting} 
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md"
                >
                    <FaPlug /> {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
            ) : (
                <button 
                    onClick={disconnectWallet} 
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl transition shadow-md"
                >
                    Disconnect Wallet
                </button>
            )}

            {/* Refresh Button */}
            <button 
              onClick={refresh} 
              disabled={refreshing} 
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Profile'}
            </button>
            
            {/* Logout Button */}
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition shadow-md"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-400 italic">
          <p>
            **Note:** The Wallet Address displayed above will automatically switch to your **Active MetaMask account** when connected, overriding the server-provided address to ensure transaction signing is possible.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}