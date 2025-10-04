import React, { useEffect, useState, useContext } from 'react';
import {DashboardLayout} from '../layouts/DashboardLayout';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const SystemLogs = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get('/system-logs');
        setLogs(res.data.logs || []);
      } catch (err) {
        setError('Failed to fetch system logs.');
        setLogs([]);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-sky-400 mb-8 tracking-wide flex items-center gap-2">
          📝 System Logs
        </h2>
        {loading && <div className="text-sky-400 animate-pulse">Loading logs...</div>}
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <ul className="divide-y divide-gray-700 max-h-[500px] overflow-y-auto text-sm">
            {logs.length === 0 && !loading && (
              <li className="text-gray-400 py-4 text-center">No system logs found.</li>
            )}
            {logs.map((log, i) => (
              <li key={log._id || i} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="font-semibold text-white">{log.action}</span>
                  <span className="ml-2 text-xs text-gray-400">{log.user || 'System'}</span>
                  <span className="ml-2 text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <span className="ml-2 text-xs text-gray-400">{log.details}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemLogs;
