import React from 'react';
import { useAuditLogs } from '../../hooks/system';

export default function AuditLogs() {
  const { data, isLoading, error } = useAuditLogs();

  if (isLoading) return <div className="text-gray-300">Loading audit logs...</div>;
  if (error) return <div className="text-red-400">Failed to load audit logs: {error.message}</div>;

  if (!data || data.length === 0) return <div className="text-gray-400">No audit logs available.</div>;

  return (
    <div className="space-y-2">
      {data.map(log => (
        <div key={log._id || log.id} className="p-3 bg-gray-800/60 border border-gray-700 rounded-lg">
          <div className="text-sm text-gray-300">{new Date(log.createdAt).toLocaleString()}</div>
          <div className="text-sm text-sky-300 font-semibold">{log.action}</div>
          <div className="text-xs text-gray-400 mt-1">{JSON.stringify(log.details || {})}</div>
        </div>
      ))}
    </div>
  );
}
