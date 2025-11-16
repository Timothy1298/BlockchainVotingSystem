import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { systemAPI } from '../../services/api/api';

const AuditViewer = ({ isOpen, onClose, candidateId, electionId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const resp = await systemAPI.getAuditTrail({ page, limit });
        const auditLogs = resp.auditLogs || [];
        // client-side filter by candidateId/electionId when provided
        const filtered = auditLogs.filter(l => {
          const d = l.details || {};
          if (candidateId && (String(d.candidateId) === String(candidateId) || String(d.candidateId) === String(candidateId))) return true;
          if (electionId && (String(d.electionId) === String(electionId) || String(d.electionId) === String(electionId))) return true;
          return !candidateId && !electionId; // if no filters, include all
        });
        setLogs(filtered);
        setTotalPages(resp.pagination?.pages || 1);
      } catch (err) {
        console.error('Failed to fetch audit trail', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isOpen, page, limit, candidateId, electionId]);

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl border border-gray-700 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Audit Trail</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-300" /></button>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-3">
            {logs.length === 0 && <div className="text-gray-400">No audit entries found for this filter.</div>}
            {logs.map(log => (
              <div key={log._id} className="bg-gray-900 p-3 rounded border border-gray-700">
                <div className="text-sm text-gray-300 font-medium">{log.action} — <span className="text-xs text-gray-500">{new Date(log.timestamp || log.createdAt).toLocaleString()}</span></div>
                <div className="text-sm text-gray-400 mt-1">Performed by: {log.performedBy?.email || log.performedBy || 'System'}</div>
                <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">{JSON.stringify(log.details || {}, null, 2)}</pre>
              </div>
            ))}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">Page {page} of {totalPages}</div>
              <div className="flex items-center gap-2">
                <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="bg-gray-700 text-white px-2 py-1 rounded">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-700 text-white rounded">Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-700 text-white rounded">Next</button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AuditViewer;
