import React, { useContext, useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout'; // Assuming you renamed the layout component back to DashboardLayout
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import CandidateCard from '../components/CandidateCard';
import { sendVoteOnChain, postTxReceipt } from '../services/web3';
import { useGlobalUI } from '../components/GloabalUI.jsx';

export default function Candidates() {
  const { token, user, logout } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCandidate, setLoadingCandidate] = useState(null); // candidate id that's loading

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selected) fetchCandidates(selected._id || selected.id || selected);
  }, [selected]);

  useEffect(() => {
    if (selected) checkHasVoted(selected._id || selected.id || selected);
  }, [selected]);

  const [hasVoted, setHasVoted] = useState(false);
  const [txStatus, setTxStatus] = useState(null);

  const { showLoader, hideLoader, showToast } = useGlobalUI();
  const checkHasVoted = async (electionId) => {
    try {
      const res = await API.get('/votes/hasVoted', { params: { electionId } });
      setHasVoted(!!res.data?.hasVoted);
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error('hasVoted check failed', err);
    }
  };

  const fetchElections = async () => {
    try {
      const res = await API.get('/elections');
      const data = res.data;
      setElections(Array.isArray(data) ? data : []);
      if ((data || []).length > 0) setSelected(data[0]);
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error(err);
      setElections([]);
    }
  };

  const fetchCandidates = async (electionId) => {
    try {
      const res = await API.get(`/elections/${electionId}/candidates`);
      setCandidates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error(err);
      setCandidates([]);
    }
  };

  const addCandidate = async () => {
    if (!selected) return alert('Pick an election');
    if (user?.role?.toLowerCase() !== 'admin') return alert('Admin only');
    const name = window.prompt('Candidate full name');
    if (!name) return;
    try {
      setLoading(true);
      await API.post(`/elections/${selected._id || selected.id}/candidates`, { name });
      await fetchCandidates(selected._id || selected.id);
      alert('Candidate added successfully!');
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error(err);
      alert('Failed to add candidate');
    } finally { setLoading(false); }
  };

  const handleVote = async (candidate, electionId) => {
    if (!selected) return alert('Select election');
    if (hasVoted) return alert('You have already voted in this election');
    if (!window.confirm('Cast vote? This action is irreversible on the blockchain.')) return;
    try {
      setLoading(true);
      setLoadingCandidate(candidate._id || candidate.id || candidate);
      // Try on-chain (user-signed) first
      try {
        setTxStatus('Sending transaction...');
        const tx = await sendVoteOnChain(selected._id || selected.id, candidate._id || candidate.id || candidate);
        setTxStatus('Transaction sent, waiting for confirmation...');
        await tx.wait?.();
        setTxStatus(`✅ Transaction confirmed (${tx.hash || 'confirmed'})`);
        // notify server to sync DB (best-effort)
        try {
          await fetch('/api/tx/receipt', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txHash: tx.hash, electionId: selected._id || selected.id, candidateId: candidate._id || candidate.id || candidate })
          });
        } catch (err) {
          console.warn('Failed to post tx receipt to server', err);
        }
        setTimeout(() => setTxStatus(null), 4000);
      } catch (onChainErr) {
        // Fallback to server API
        console.warn('On-chain vote failed, falling back to server:', onChainErr?.message || onChainErr);
        setTxStatus('⚠️ On-chain failed, falling back to server vote...');
        const res = await fetch('/api/votes/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ electionId: selected._id || selected.id, candidateId: candidate._id || candidate.id || candidate }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Server vote failed');
        }
        setTxStatus('✅ Voted via server fallback');
        setTimeout(() => setTxStatus(null), 3000);
      }
      await fetchCandidates(selected._id || selected.id);
      await checkHasVoted(selected._id || selected.id);
    } catch (err) {
      console.error(err);
      setTxStatus(`❌ Vote failed: ${err?.message || 'error'}`);
      setTimeout(() => setTxStatus(null), 5000);
    } finally { setLoading(false); setLoadingCandidate(null); }
  };

  return (
    <DashboardLayout title="Candidates">
      <div className="max-w-7xl mx-auto text-white p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-wide">
            🗳️ Current Candidates
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Election Selector - Styled for the dark theme */}
            <select
              value={selected?._id || selected?.id || ''}
              onChange={(e) => {
                const id = e.target.value;
                const found = elections.find(ev => (ev._id || ev.id) === id);
                setSelected(found || id);
              }}
              className="bg-gray-800 border border-gray-700 text-gray-200 px-4 py-2 rounded-xl shadow-md focus:ring-sky-500 focus:border-sky-500 appearance-none transition duration-150 cursor-pointer w-full sm:w-auto"
            >
              <option value="" disabled className="text-gray-500">
                Select an Election
              </option>
              {(elections || []).map(ev => (
                <option key={ev._id || ev.id} value={ev._id || ev.id} className="bg-gray-800 text-white">
                  {ev.title || ev.name}
                </option>
              ))}
            </select>
            
            {/* Admin Button - Highlighted and prominent */}
            {user?.role?.toLowerCase() === 'admin' && (
              <button 
                onClick={addCandidate} 
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition duration-150"
              >
                + Add Candidate
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map(c => (
            <CandidateCard key={c._id || c.id} candidate={c} electionId={selected?._id || selected?.id} onVote={handleVote} loading={loading && String(loadingCandidate) === String(c._id || c.id || c)} disabled={hasVoted} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}