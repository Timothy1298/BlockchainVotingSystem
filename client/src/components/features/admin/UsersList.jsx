import React from 'react';
import { useUsers } from '../../../hooks/admin';

export default function UsersList() {
  const { data, isLoading, error } = useUsers();
  if (isLoading) return <div className="text-gray-300">Loading users...</div>;
  if (error) return <div className="text-red-400">Failed to load users: {error.message}</div>;
  if (!data || !data.users || data.users.length === 0) return <div className="text-gray-400">No users found.</div>;

  return (
    <div className="space-y-2">
      {data.users.map(u => (
        <div key={u._id || u.id} className="p-3 bg-gray-800/60 border border-gray-700 rounded-lg flex justify-between items-center">
          <div>
            <div className="text-sm text-white font-semibold">{u.fullName}</div>
            <div className="text-xs text-gray-400">{u.email} • {u.role}</div>
          </div>
          <div className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
}
