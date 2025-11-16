import React, { useEffect, useState, useCallback } from 'react';
import { Eye, Edit3, Trash2, Check, X, FileText } from 'lucide-react';
import { votingAPI } from '../../services/api/api';
import { useGlobalUI } from '../../components/common';

const CandidateTable = ({ candidates = [], electionId = null, onView, onEdit, onDelete, onVerify, onReject, onOpenAudit }) => {
  const { showLoader, hideLoader, showToast, showError } = useGlobalUI();
  const [serverCandidates, setServerCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServerCandidates = useCallback(async () => {
    if (!electionId) return;
    try {
      setLoading(true);
      const resp = await votingAPI.getCandidates(electionId, { page, limit });
      if (resp && resp.candidates) {
        setServerCandidates(resp.candidates);
        setTotalPages(resp.pagination?.pages || 1);
      } else if (Array.isArray(resp)) {
        // backward compatibility if older endpoint returns array
        setServerCandidates(resp);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch server candidates', err);
      showError(err?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [electionId, page, limit, showError]);

  useEffect(() => {
    if (electionId) fetchServerCandidates();
  }, [electionId, page, limit, fetchServerCandidates]);

  const displayed = electionId ? serverCandidates : candidates;

  // When not in election-specific (global) mode, group candidates by seat so the table shows
  // competing candidates together (e.g., all Presidential candidates grouped under "President").
  const groupedBySeat = React.useMemo(() => {
    if (electionId) return null;
    const map = new Map();
    (displayed || []).forEach(c => {
      const seat = c.seat || 'Unspecified';
      if (!map.has(seat)) map.set(seat, []);
      map.get(seat).push(c);
    });
    // convert to array of [seat, candidates] and sort seats by name
    return Array.from(map.entries()).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  }, [displayed, electionId]);

  // Debug: log counts to help surface if grouping is working
  useEffect(() => {
    try {
      const groupCount = groupedBySeat ? groupedBySeat.length : 0;
      const total = (displayed || []).length;
      console.debug('[CandidateTable] electionId=', electionId, 'groups=', groupCount, 'totalCandidates=', total);
    } catch (e) {
      console.debug('[CandidateTable] debug error', e);
    }
  }, [groupedBySeat, displayed, electionId]);
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-x-auto">
      <table className="w-full table-auto text-sm">
        <thead>
          <tr className="text-left text-gray-400 text-xs uppercase">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Candidate Name</th>
            <th className="px-3 py-2">Position</th>
            <th className="px-3 py-2">Party</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Blockchain ID</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groupedBySeat ? (
            // Render each seat group with its own sub-rows. We'll show a header row for the seat and then its candidates.
            groupedBySeat.map(([seat, list]) => (
              <React.Fragment key={`group-${seat}`}>
                <tr className="bg-gray-900/60">
                  <td colSpan={7} className="px-3 py-2 text-sm font-semibold text-white">{seat} — {list.length} candidate{list.length !== 1 ? 's' : ''}</td>
                </tr>
                {list.map((c, idx) => (
                  <tr key={`${seat}-${c.id || c._id || idx}`} className="border-t border-gray-700 hover:bg-gray-900/50">
                    <td className="px-3 py-2 align-top">{idx + 1}</td>
                    <td className="px-3 py-2 align-top">
                      <div className="font-medium text-white">{c.name}</div>
                      <div className="text-xs text-gray-400">{c.email || ''}</div>
                    </td>
                    <td className="px-3 py-2 align-top">{c.seat || '—'}</td>
                    <td className="px-3 py-2 align-top">{c.party || '—'}</td>
                    <td className="px-3 py-2 align-top">
                      {c.verified === true || c.isActive === true ? (
                        <span className="text-green-400">✅ Verified</span>
                      ) : (c.status?.toLowerCase?.() === 'pending' || c.verification?.overallStatus === 'pending') ? (
                        <span className="text-yellow-400">⏳ Pending</span>
                      ) : (
                        <span className="text-gray-400">Inactive</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">{c.chainCandidateId ? `#${c.chainCandidateId}` : '—'}</td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-2">
                        <button title="View" onClick={() => onView(c)} className="p-1 rounded hover:bg-gray-700"><Eye className="w-4 h-4 text-sky-400"/></button>
                        <button title="Edit" onClick={() => onEdit(c)} className="p-1 rounded hover:bg-gray-700"><Edit3 className="w-4 h-4 text-green-400"/></button>
                        <button title="Delete" onClick={() => onDelete(c)} className="p-1 rounded hover:bg-gray-700"><Trash2 className="w-4 h-4 text-red-400"/></button>
                        <button title="Audit" onClick={() => onOpenAudit && onOpenAudit(c)} className="p-1 rounded hover:bg-gray-700"><FileText className="w-4 h-4 text-indigo-400"/></button>
                        {!(c.verified === true || c.isActive === true) && (
                          <>
                            <button title="Verify" onClick={() => onVerify(c)} className="p-1 rounded hover:bg-gray-700"><Check className="w-4 h-4 text-emerald-400"/></button>
                            <button title="Reject" onClick={() => onReject(c)} className="p-1 rounded hover:bg-gray-700"><X className="w-4 h-4 text-yellow-400"/></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))
          ) : (
            displayed.map((c, idx) => (
              <tr key={`${c.electionId || c.electionId}-${c.id || c._id || idx}`} className="border-t border-gray-700 hover:bg-gray-900/50">
                <td className="px-3 py-2 align-top">{idx + 1}</td>
                <td className="px-3 py-2 align-top">
                  <div className="font-medium text-white">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.email || ''}</div>
                </td>
                <td className="px-3 py-2 align-top">{c.seat || '—'}</td>
                <td className="px-3 py-2 align-top">{c.party || '—'}</td>
                <td className="px-3 py-2 align-top">
                  {c.verified === true || c.isActive === true ? (
                    <span className="text-green-400">✅ Verified</span>
                  ) : (c.status?.toLowerCase?.() === 'pending' || c.verification?.overallStatus === 'pending') ? (
                    <span className="text-yellow-400">⏳ Pending</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </td>
                <td className="px-3 py-2 align-top">{c.chainCandidateId ? `#${c.chainCandidateId}` : '—'}</td>
                <td className="px-3 py-2 align-top">
                  <div className="flex items-center gap-2">
                    <button title="View" onClick={() => onView(c)} className="p-1 rounded hover:bg-gray-700"><Eye className="w-4 h-4 text-sky-400"/></button>
                    <button title="Edit" onClick={() => onEdit(c)} className="p-1 rounded hover:bg-gray-700"><Edit3 className="w-4 h-4 text-green-400"/></button>
                    <button title="Delete" onClick={() => onDelete(c)} className="p-1 rounded hover:bg-gray-700"><Trash2 className="w-4 h-4 text-red-400"/></button>
                    {!(c.verified === true || c.isActive === true) && (
                      <>
                        <button title="Verify" onClick={() => onVerify(c)} className="p-1 rounded hover:bg-gray-700"><Check className="w-4 h-4 text-emerald-400"/></button>
                        <button title="Reject" onClick={() => onReject(c)} className="p-1 rounded hover:bg-gray-700"><X className="w-4 h-4 text-yellow-400"/></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination controls when using server-side mode */}
      {electionId && (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-400">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="bg-gray-700 text-white px-2 py-1 rounded">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50">Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-700 text-white rounded">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateTable;
