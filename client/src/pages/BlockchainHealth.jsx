import React, { useEffect, useState, useContext } from 'react';
import {DashboardLayout} from '../layouts/DashboardLayout';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const BlockchainHealth = () => {
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get('/blockchain/status');
        setStatus(res.data);
      } catch (err) {
        setError('Failed to fetch blockchain status.');
        setStatus(null);
      }
      setLoading(false);
    }
    fetchStatus();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-sky-400 mb-8 tracking-wide flex items-center gap-2">
          🔗 Blockchain Health
        </h2>
        {loading && <div className="text-sky-400 animate-pulse">Loading blockchain status...</div>}
        {error && <div className="text-red-400 mb-4">{error}</div>}
        {status && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg space-y-4">
            <div>Block Number: <span className="font-semibold text-white">{status.blocks}</span></div>
            <div>Latest Block Hash: <span className="font-mono text-xs text-emerald-400">{status.latestHash?.slice(0, 16)}... <button className="ml-1 text-sky-400 underline" onClick={() => navigator.clipboard.writeText(status.latestHash)}>Copy</button></span></div>
            <div>Timestamp: <span className="text-white">{status.latestTime}</span></div>
            <div>Total Transactions: <span className="font-semibold text-white">{status.txCount}</span></div>
            <div>Nodes Connected: <span className="font-semibold text-white">{status.nodes}</span></div>
            <div>Latest Vote Confirmations: <span className="font-semibold text-white">{status.confirmations}</span></div>
            <a href={status.explorer} target="_blank" rel="noopener noreferrer" className="text-sky-400 underline mt-2 inline-block">Blockchain Explorer</a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BlockchainHealth;
