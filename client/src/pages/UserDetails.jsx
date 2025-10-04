import React, { useEffect, useState } from 'react';
import {DashboardLayout} from '../layouts/DashboardLayout';
import API from '../services/api';

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validateHash, setValidateHash] = useState('');
  const [validateResult, setValidateResult] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      setError('Failed to fetch users.');
      setUsers([]);
    }
    setLoading(false);
  };

  const handleSelect = (user) => {
    setSelected(user);
    setForm(user);
    setSuccess(null);
    setError(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await API.put(`/users/${form._id}`, form);
      setSuccess('User updated successfully.');
      fetchUsers();
    } catch (err) {
      setError('Failed to update user.');
    }
    setSaving(false);
  };

  const handleValidate = async () => {
    setValidateResult(null);
    try {
      const res = await API.post('/validate', { receiptHash: validateHash });
      setValidateResult(res.data.valid ? 'Valid receipt hash.' : 'Invalid receipt hash.');
    } catch (err) {
      setValidateResult('Validation failed.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-sky-400 mb-8 tracking-wide flex items-center gap-2">
          🧑‍💼 User Details & Update
        </h2>
        {loading && <div className="text-sky-400 animate-pulse">Loading users...</div>}
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg mb-8">
          <h3 className="text-lg font-bold text-sky-300 mb-4">Select User</h3>
          <select
            className="bg-gray-700 text-white px-4 py-2 rounded-xl w-full mb-4"
            value={selected?._id || ''}
            onChange={e => handleSelect(users.find(u => u._id === e.target.value))}
          >
            <option value="">-- Select a user --</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.fullName || u.name} ({u.email})</option>
            ))}
          </select>
          {selected && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">Full Name</label>
                  <input name="fullName" value={form.fullName || ''} onChange={handleChange} className="bg-gray-700 text-white px-3 py-2 rounded w-full" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Email</label>
                  <input name="email" value={form.email || ''} onChange={handleChange} className="bg-gray-700 text-white px-3 py-2 rounded w-full" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Region</label>
                  <input name="region" value={form.region || ''} onChange={handleChange} className="bg-gray-700 text-white px-3 py-2 rounded w-full" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Eligibility</label>
                  <input name="eligibility" value={form.eligibility || ''} onChange={handleChange} className="bg-gray-700 text-white px-3 py-2 rounded w-full" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Vote Receipt</label>
                  <input name="voteReceipt" value={form.voteReceipt || ''} onChange={handleChange} className="bg-gray-700 text-white px-3 py-2 rounded w-full" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">QR Code URL</label>
                  <input name="qrCode" value={form.qrCode || ''} onChange={handleChange} className="bg-gray-700 text-white px-3 py-2 rounded w-full" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Receipt Hash</label>
                  <input name="receiptHash" value={form.receiptHash || ''} onChange={handleChange} className="bg-gray-700 text-white px-3 py-2 rounded w-full" />
                </div>
              </div>
              <button type="submit" className="bg-sky-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-sky-500 transition" disabled={saving}>{saving ? 'Saving...' : 'Update User'}</button>
              {success && <div className="text-green-400 mt-2">{success}</div>}
            </form>
          )}
        </div>
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg mb-8">
          <h3 className="text-lg font-bold text-sky-300 mb-4">Validate Receipt Hash</h3>
          <div className="flex gap-2 items-center">
            <input
              className="bg-gray-700 text-white px-3 py-2 rounded w-full"
              placeholder="Enter receipt hash..."
              value={validateHash}
              onChange={e => setValidateHash(e.target.value)}
            />
            <button onClick={handleValidate} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-emerald-500 transition">Validate</button>
          </div>
          {validateResult && <div className="mt-2 text-sky-400">{validateResult}</div>}
        </div>
        {selected && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
            <h3 className="text-lg font-bold text-sky-300 mb-4">User QR Code & History</h3>
            <div className="flex gap-6 items-center">
              <img src={selected.qrCode || '/default-qr.png'} alt="QR Code" className="w-32 h-32 border border-sky-400 rounded" />
              <div>
                <div className="mb-2">Voting History: <span className="text-xs text-gray-400">{(selected.history || []).join(', ') || '(none)'}</span></div>
                <div>Receipt Hash: <span className="font-mono text-xs text-emerald-400">{selected.receiptHash}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;
