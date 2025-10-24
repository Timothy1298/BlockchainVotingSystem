import React from 'react';
import { useElections } from '../../../hooks/elections';

export default function ElectionsList() {
  const { data, isLoading, error } = useElections();
  if (isLoading) return <div className="text-gray-300">Loading elections...</div>;
  if (error) return <div className="text-red-400">Failed to load elections: {error.message}</div>;
  if (!data || data.length === 0) return <div className="text-gray-400">No elections found.</div>;

  return (
    <div className="space-y-3">
      {data.map(e => (
        <div key={e._id || e.id} className="p-4 bg-gray-800/60 border border-gray-700 rounded-lg">
          <div className="text-lg font-semibold text-white">{e.title}</div>
          <div className="text-sm text-gray-400">{e.description}</div>
          <div className="text-xs text-gray-500 mt-2">Seats: {Array.isArray(e.seats) ? e.seats.join(', ') : e.seats}</div>
        </div>
      ))}
    </div>
  );
}
