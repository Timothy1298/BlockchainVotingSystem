import React, { useEffect, useState, useContext } from 'react';
import {DashboardLayout} from '../layouts/DashboardLayout';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      setError('Failed to fetch notifications.');
      setNotifications([]);
    }
    setLoading(false);
  };

  const deleteNotification = async (id) => {
    setDeleting(id);
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      setError('Failed to delete notification.');
    }
    setDeleting(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-sky-400 mb-8 tracking-wide flex items-center gap-2">
          🔔 Notifications
        </h2>
        {loading && <div className="text-sky-400 animate-pulse">Loading notifications...</div>}
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <ul className="divide-y divide-gray-700 max-h-[500px] overflow-y-auto text-sm">
            {notifications.length === 0 && !loading && (
              <li className="text-gray-400 py-4 text-center">No notifications found.</li>
            )}
            {notifications.map((n) => (
              <li key={n._id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="font-semibold text-white">{n.title}</span>
                  <span className="ml-2 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <span className="text-xs text-gray-400">{n.message}</span>
                  <button
                    onClick={() => deleteNotification(n._id)}
                    disabled={deleting === n._id}
                    className="ml-2 px-3 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition disabled:opacity-50"
                  >
                    {deleting === n._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
