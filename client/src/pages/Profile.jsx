import React, { useContext, useState } from 'react';
import {DashboardLayout} from '../layouts/DashboardLayout';
import { AuthContext } from '../context/AuthContext';
import { useGlobalUI } from '../components/GloabalUI.jsx';

export default function Profile() {
  const { user, token, logout } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);

  const { showLoader, hideLoader, showToast } = useGlobalUI();

  const refresh = async () => {
    try {
      setRefreshing(true);
      showLoader('Refreshing profile...');
      // Fetches latest profile data from the backend
      const res = await fetch('/api/auth/me', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Failed');
      hideLoader();
      showToast('Profile refreshed. Please re-login to see updates.', 'success');
    } catch (err) {
      console.error(err);
      hideLoader();
      showToast('Failed to refresh profile data.', 'error');
    } finally { setRefreshing(false); }
  };

  const getRoleColor = (role) => {
    switch (String(role).toLowerCase()) {
      case 'admin':
        return 'text-red-400 font-bold';
      case 'voter':
        return 'text-sky-400 font-bold';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-xl mx-auto text-white p-4">
        {/* Header */}
        <h1 className="text-3xl font-extrabold mb-6 tracking-wide border-b border-gray-700 pb-3">
          Your Secure Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-gray-800 border border-gray-700 shadow-xl shadow-black/50 p-8 rounded-xl space-y-5">
          {/* Section Title */}
          <h2 className="text-xl font-semibold text-sky-400 mb-4 flex items-center gap-2">
            <span className="text-2xl">👤</span> Account Details
          </h2>

          {/* Details List */}
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-700/50 pb-2">
              <strong className="text-gray-400">Full Name:</strong> 
              <span className="text-white font-medium">{user?.fullName || user?.name || '—'}</span>
            </div>
            
            <div className="flex justify-between border-b border-gray-700/50 pb-2">
              <strong className="text-gray-400">Email Address:</strong> 
              <span className="text-white font-medium">{user?.email || '—'}</span>
            </div>
            
            <div className="flex justify-between border-b border-gray-700/50 pb-2">
              <strong className="text-gray-400">Role:</strong> 
              <span className={`font-semibold uppercase tracking-wider ${getRoleColor(user?.role)}`}>
                {user?.role || 'User'}
              </span>
            </div>

            {/* Wallet Address (Example of adding blockchain detail) */}
            <div className="flex justify-between pt-2">
              <strong className="text-gray-400">Wallet ID (partial):</strong> 
              <span className="text-sm font-mono text-gray-500">
                {user?.walletAddress ? `${String(user.walletAddress).substring(0, 8)}...` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 flex gap-4 border-t border-gray-700/50">
            {/* Refresh Button - Theme accent color */}
            <button 
              onClick={refresh} 
              disabled={refreshing} 
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition disabled:bg-gray-600 disabled:cursor-not-allowed shadow-md"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Profile'}
            </button>
            
            {/* Logout Button - Danger/exit color */}
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition shadow-md"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Note/Disclaimer */}
        <div className="mt-8 p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-400 italic">
          <p>
            **Note:** Profile editing is currently handled directly via the server API. For changes to your name or email, please contact a system administrator.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}