import React, { useContext, useEffect, useState } from 'react';
import { DashboardLayout } from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useGlobalUI } from '../components/GloabalUI.jsx';

export default function Elections() {
  const { token, user, logout } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchElections();
  }, []);

  const { showLoader, hideLoader, showToast } = useGlobalUI();

  const fetchElections = async () => {
    try {
      showLoader('Loading elections...');
      const res = await API.get('/elections');
      setElections(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error('Failed to fetch elections', err);
      showToast('Failed to load elections', 'error');
    } finally { hideLoader(); }
  };

  const createElection = async () => {
  if (!user || user.role?.toLowerCase() !== 'admin') return showToast('Admin only', 'error');
    const title = window.prompt('Enter election title');
    if (!title) return;
    try {
  showLoader('Creating election...');
      await API.post('/elections', { title });
      await fetchElections();
      showToast('Election created successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to create election', 'error');
    } finally { setLoading(false); }
  };

  const deleteElection = async (id) => {
  if (!user || user.role?.toLowerCase() !== 'admin') return showToast('Admin only', 'error');
    if (!window.confirm('Are you sure you want to delete this election? This action is irreversible.')) return;
    try {
      showLoader('Deleting election...');
  await API.delete(`/elections/${id}`);
  await fetchElections();
  showToast('Election deleted successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete', 'error');
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Elections">
      <div className="max-w-4xl mx-auto text-white p-4">
        {/* Header and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-700/50 pb-4">
          <h1 className="text-3xl font-extrabold tracking-wider">
            Elections Management
          </h1>
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            {/* Create Election Button - Highlighted for Admin */}
            {user?.role?.toLowerCase() === 'admin' && (
              <button 
                onClick={createElection} 
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition shadow-md disabled:bg-gray-600"
              >
                + Create Election
              </button>
            )}
            {/* Refresh Button - Subtle background for utility */}
            <button 
              onClick={fetchElections} 
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 transition disabled:bg-gray-600"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && <p className="text-sky-400 font-semibold mb-4">Loading elections...</p>}
        {!loading && elections.length === 0 && <p className="text-gray-400 text-lg py-8 text-center bg-gray-800/50 rounded-xl">No elections found.</p>}

        {/* Elections List */}
        <ul className="space-y-4">
          {elections.map((ev) => (
            <li 
              key={ev._id || ev.id} 
              // List Item Styling: Dark card, subtle shadow, border, hover effect
              className="p-5 bg-gray-800 border border-gray-700 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center transition duration-200 hover:shadow-sky-900/40"
            >
              <div className="mb-3 md:mb-0">
                {/* Title */}
                <div className="text-xl font-bold text-sky-400">{ev.title || ev.name || `Election ${ev._id || ev.id}`}</div>
                {/* Description/Details */}
                <div className="text-sm text-gray-400 mt-1 italic">{ev.description || 'Blockchain-secured vote.'}</div>
                {/* ID (Subtle) */}
                <div className="text-xs text-gray-500 mt-1 font-mono">ID: {String(ev._id || ev.id).substring(0, 10)}...</div>
              </div>
              <div className="flex items-center gap-3">
                {/* Open Button (Primary action for all users) */}
                <button 
                  onClick={() => navigate('/dashboard', { state: { electionId: ev._id || ev.id }})} 
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition shadow-md"
                >
                  View Candidates
                </button>
                {/* Admin Delete Button (High contrast for danger) */}
                {user?.role?.toLowerCase() === 'admin' && (
                  <button 
                    onClick={() => deleteElection(ev._id || ev.id)} 
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition shadow-md"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
}