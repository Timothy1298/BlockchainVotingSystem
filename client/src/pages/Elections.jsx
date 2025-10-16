import React, { useContext, useEffect, useState } from 'react';
import {DashboardLayout} from '../layouts/DashboardLayout';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import ElectionWizard from '../components/ElectionWizard';
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


  // Admin election creation form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const ELECTION_TYPES = [
    'Student Government (Union) Elections',
    'Faculty/Departmental Representative Elections',
    'Club/Society Elections',
    'Hostel/Accommodation Committee Elections',
    'Special Referendums (e.g., constitutional amendments, policy votes)'
  ];
  const SEATS = [
    'Student President',
    'Vice President',
    'Secretary General',
    'Treasurer/Finance Secretary',
    'Academic Affairs Secretary',
    'Sports/Games Secretary',
    'Gender/Equity Representative',
    'Faculty/School Representatives',
    'Hostel/Accommodation Representative',
    'Clubs/Societies Leaders'
  ];
  const [form, setForm] = useState({
    title: '',
    electionType: '',
    seats: [],
    description: '',
    startsAt: '',
    endsAt: '',
    venue: ''
  });
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'seats') {
      let newSeats = [...form.seats];
      if (checked) {
        newSeats.push(value);
      } else {
        newSeats = newSeats.filter(s => s !== value);
      }
      setForm({ ...form, seats: newSeats });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
  const resetForm = () => setForm({ title: '', electionType: '', seats: [], description: '', startsAt: '', endsAt: '', venue: '' });
  const createElection = async (e) => {
    e.preventDefault();
    if (!user || user.role?.toLowerCase() !== 'admin') return showToast('Admin only', 'error');
    if (!form.title || !form.electionType || form.seats.some(s => !s.trim())) {
      showToast('Title, type, and all seats are required', 'error');
      return;
    }
    try {
      showLoader('Creating election...');
      await API.post('/elections', {
        title: form.title,
        electionType: form.electionType,
        seats: form.seats.filter(s => s.trim()),
        description: form.description,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined
      });
      await fetchElections();
      showToast('Election created successfully!', 'success');
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      console.error(err);
      showToast('Failed to create election', 'error');
    } finally { setLoading(false); hideLoader(); }
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
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-extrabold text-white tracking-wide">
          🗳️ Elections Management
        </h2>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {user?.role?.toLowerCase() === 'admin' && (
            <button
              onClick={() => setShowCreateForm((v) => !v)}
              disabled={loading}
              className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-emerald-500 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {showCreateForm ? 'Cancel' : '+ Create Election'}
            </button>
          )}
          <button 
            onClick={fetchElections} 
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 transition disabled:bg-gray-600"
          >
            🔄 Refresh
          </button>
        </div>
      </div>


      {/* Admin Create Election Wizard (replaces inline create form) */}
      {showCreateForm && user?.role?.toLowerCase() === 'admin' && (
        <div className="mb-8 mt-2">
          <ElectionWizard onCreated={(res)=>{ fetchElections(); setShowCreateForm(false); showToast('Election created', 'success'); }} />
        </div>
      )}

      {/* Loading Indicator */}
      {loading && <p className="text-sky-400 font-semibold mb-4">Loading elections...</p>}
      {!loading && elections.length === 0 && <p className="text-gray-400 text-lg py-8 text-center bg-gray-800/50 rounded-xl">No elections found.</p>}

      {/* Elections List */}
      <ul className="space-y-4">
        {elections.map((ev, index) => (
          <li 
            key={ev._id || ev.id} 
            className="p-5 bg-gray-800 border border-gray-700 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center transition duration-200 hover:shadow-sky-900/40"
          >
            <div className="mb-3 md:mb-0">
              <div className="text-xl font-bold text-sky-400">{ev.title || ev.name || `Election ${ev._id || ev.id}`}</div>
              <div className="text-sm text-gray-400 mt-1 italic">{ev.description || 'Blockchain-secured vote.'}</div>
              <div className="text-xs text-gray-500 mt-1 font-mono">ID: {String(ev._id || ev.id).substring(0, 10)}...</div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/dashboard', { state: { electionId: ev._id || ev.id }})} 
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition shadow-md"
              >
                View Candidates
              </button>
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
    </DashboardLayout>
  );
}