import React, { useContext, useEffect, useState } from 'react';
import { DashboardLayout } from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useGlobalUI } from '../components/GloabalUI.jsx';

export default function Voters() {
  const { token } = useContext(AuthContext);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchVoters(); }, []);

  const { showLoader, hideLoader, showToast } = useGlobalUI();

  const fetchVoters = async () => {
    try {
      showLoader('Loading voters...');
      const res = await fetch('/api/voters', { 
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      });
      const data = await res.json();
      setVoters(data || []);
    } catch (err) { 
      console.error(err); 
      showToast('Failed to fetch voter list.', 'error');
    } finally { hideLoader(); }
  };

  const toggleEligible = async (id, current) => {
    const action = current ? 'Disable' : 'Enable';
    if (!window.confirm(`${action} voting eligibility for this user?`)) return;
    try {
      showLoader('Updating voter...');
      const res = await fetch(`/api/voters/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, 
        body: JSON.stringify({ eligible: !current }) 
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchVoters();
      showToast('Voter updated', 'success');
    } catch (err) { 
      console.error(err); 
      showToast('Failed to update voter eligibility.', 'error'); 
    } finally { hideLoader(); }
  };

  const deleteVoter = async (id) => {
    if (!window.confirm('WARNING: Permanently delete this voter record?')) return;
    try {
      showLoader('Deleting voter...');
      const res = await fetch(`/api/voters/${id}`, { 
        method: 'DELETE', 
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } 
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchVoters();
      showToast('Voter deleted', 'success');
    } catch (err) { 
      console.error(err); 
      showToast('Voter deletion failed.', 'error'); 
    } finally { hideLoader(); }
  };

  return (
    <DashboardLayout title="Voters">
      <div className="max-w-5xl mx-auto text-white p-4">
        {/* Header and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-700/50 pb-4">
          <h1 className="text-3xl font-extrabold tracking-wider">
            👥 Registered Voters
          </h1>
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            {/* Refresh Button */}
            <button 
              onClick={fetchVoters} 
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold transition disabled:bg-gray-600"
            >
              🔄 Refresh List
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && <p className="text-sky-400 font-semibold mb-4">Loading voters...</p>}
        {!loading && voters.length === 0 && <p className="text-gray-400 text-lg py-8 text-center bg-gray-800/50 rounded-xl">No voter records found.</p>}
        
        {/* Voters List */}
        <div className="overflow-x-auto">
          <ul className="space-y-4 min-w-full">
            {voters.map((v, index) => (
              <motion.li 
                key={v._id || v.id} 
                className="p-5 bg-gray-800 border border-gray-700 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center transition duration-200 hover:border-sky-500/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Voter Info */}
                <div className="flex-1 mb-3 md:mb-0 min-w-[200px]">
                  <div className="text-lg font-bold text-white">{v.user?.fullName || 'Unknown User'}</div>
                  <div className="text-sm text-gray-400 font-mono">
                    {v.user?.email || 'No Email'}
                    {v.studentId && ` · ID: ${v.studentId}`}
                  </div>
                </div>
                
                {/* Eligibility Status Badge */}
                <div className="flex-shrink-0 mr-4">
                    <span 
                        className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                            v.eligible 
                                ? 'bg-emerald-600 text-emerald-100' 
                                : 'bg-red-600 text-red-100'
                        }`}
                    >
                        {v.eligible ? 'Eligible' : 'Ineligible'}
                    </span>
                </div>
                
                {/* Admin Actions */}
                <div className="flex items-center gap-3 mt-3 md:mt-0">
                  {/* Eligibility Toggle Button */}
                  <button 
                    onClick={() => toggleEligible(v._id || v.id, v.eligible)} 
                    disabled={loading}
                    className={`px-4 py-2 rounded-xl font-semibold transition shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed text-white ${
                        v.eligible 
                            ? 'bg-yellow-600 hover:bg-yellow-500' // Disable (Yellow/Warning color)
                            : 'bg-emerald-600 hover:bg-emerald-500' // Enable (Green/Success color)
                    }`}
                  >
                    {v.eligible ? 'Disable Voting' : 'Enable Voting'}
                  </button>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={() => deleteVoter(v._id || v.id)} 
                    disabled={loading}
                    className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-xl transition shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}