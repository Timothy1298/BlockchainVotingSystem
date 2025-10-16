import React from 'react';
import useVoters from '../hooks/useVoters';

export default function VotersList() {
  const { data, isLoading, error } = useVoters();
  if (isLoading) return <div className="text-gray-300">Loading voters...</div>;
  if (error) return <div className="text-red-400">Failed to load voters: {error.message}</div>;
  if (!data || data.length === 0) return <div className="text-gray-400">No voters found.</div>;

  return (
    <div className="space-y-2">
      {data.map(v => (
        <div key={v._id || v.id} className="p-3 bg-gray-800/60 border border-gray-700 rounded-lg flex justify-between items-center">
          <div>
            <div className="text-sm text-white font-semibold">{v.user?.fullName || v.user}</div>
            <div className="text-xs text-gray-400">Eligible: {v.eligible ? 'Yes' : 'No'}</div>
          </div>
          <div className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
}
