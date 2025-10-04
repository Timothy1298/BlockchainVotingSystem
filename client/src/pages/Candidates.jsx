import React, { useContext, useEffect, useState } from 'react';
import {DashboardLayout} from '../layouts/DashboardLayout';
import { motion } from 'framer-motion';
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

  // Batch candidate creation state
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchSeatIdx, setBatchSeatIdx] = useState(0);
  const [batchCandidates, setBatchCandidates] = useState(['']);
  const [batchLoading, setBatchLoading] = useState(false);

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


  // Batch candidate creation logic
  const startBatchAdd = () => {
    if (!selected) return alert('Pick an election');
    if (user?.role?.toLowerCase() !== 'admin') return alert('Admin only');
    if (!selected.seats || selected.seats.length === 0) return alert('No seats defined for this election.');
    setShowBatchForm(true);
    setBatchSeatIdx(0);
    setBatchCandidates(['']);
  };

  const handleBatchCandidateChange = (idx, value) => {
    const arr = [...batchCandidates];
    arr[idx] = value;
    setBatchCandidates(arr);
  };
  const addBatchCandidateField = () => setBatchCandidates([...batchCandidates, '']);
  const removeBatchCandidateField = (idx) => setBatchCandidates(batchCandidates.filter((_, i) => i !== idx));

  const submitBatchCandidates = async (e) => {
    e.preventDefault();
    const seat = selected.seats[batchSeatIdx];
    const names = batchCandidates.map(n => n.trim()).filter(Boolean);
    if (!seat || names.length === 0) {
      alert('Enter at least one candidate for this seat.');
      return;
    }
    setBatchLoading(true);
    try {
      for (const name of names) {
        await API.post(`/elections/${selected._id || selected.id}/candidates`, { name, seat });
      }
      await fetchCandidates(selected._id || selected.id);
      // Move to next seat or finish
      if (batchSeatIdx < selected.seats.length - 1) {
        setBatchSeatIdx(batchSeatIdx + 1);
        setBatchCandidates(['']);
      } else {
        setShowBatchForm(false);
        setBatchSeatIdx(0);
        setBatchCandidates(['']);
        alert('All candidates added for all seats!');
      }
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error(err);
      alert('Failed to add candidate(s)');
    } finally {
      setBatchLoading(false);
    }
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

  // Helper to extract election title
  const getElectionTitle = () => selected?.title || selected?.name || `Election ${selected?._id || selected?.id || 'N/A'}`;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-extrabold text-white tracking-wide">
          🗳️ Candidates for <span className="text-sky-400">{getElectionTitle()}</span>
        </h2>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* Election Selector - Styled for the dark theme */}
          <select
            value={selected?._id || selected?.id || ''}
            onChange={(e) => {
              const id = e.target.value;
              const found = elections.find((ev) => (ev._id || ev.id) === id);
              setSelected(found || id);
            }}
            className="bg-gray-800 border border-gray-700 text-gray-200 px-4 py-2 rounded-xl shadow-md focus:ring-sky-500 focus:border-sky-500 appearance-none transition duration-150 cursor-pointer w-full md:w-auto"
          >
             <option value="" disabled className="text-gray-500 bg-gray-900">
                Select an Election...
            </option>
            {(elections || []).map((ev, index) => (
              <option key={`${ev._id || ev.id}-${index}`} value={ev._id || ev.id} className="bg-gray-900 text-white">
                {ev.title || ev.name || `Election ${ev._id || ev.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Batch candidate creation stepper form */}
      {showBatchForm && selected?.seats && selected.seats.length > 0 && (
        <form onSubmit={submitBatchCandidates} className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8 mt-2 space-y-4 shadow-lg">
          <h2 className="text-xl font-bold text-sky-400 mb-2">Add Candidates for: <span className="text-emerald-400">{selected.seats[batchSeatIdx]}</span></h2>
          {batchCandidates.map((name, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={name}
                onChange={e => handleBatchCandidateChange(idx, e.target.value)}
                className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white"
                placeholder="Candidate full name"
                required
              />
              {batchCandidates.length > 1 && (
                <button type="button" onClick={() => removeBatchCandidateField(idx)} className="px-2 py-1 bg-red-700 text-white rounded">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addBatchCandidateField} className="mt-1 px-3 py-1 bg-sky-700 text-white rounded">+ Add Another Candidate</button>
          <div className="pt-2 flex gap-4">
            <button type="submit" disabled={batchLoading} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md">{batchSeatIdx < (selected.seats.length - 1) ? 'Save & Next Seat' : 'Finish'}</button>
            <button type="button" onClick={() => { setShowBatchForm(false); setBatchSeatIdx(0); setBatchCandidates(['']); }} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl shadow-md">Cancel</button>
          </div>
        </form>
      )}

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {candidates.map((c, index) => (
          <motion.div
            key={`${c._id || c.id}-${index}`}
            className="bg-gray-800 border border-gray-700 shadow-xl shadow-black/50 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300"
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -2, boxShadow: "0 8px 10px rgba(0, 0, 0, 0.3)" }}
          >
            <CandidateCard
              candidate={c}
              electionId={selected?._id || selected?.id}
              onVote={handleVote}
              loading={loading && String(loadingCandidate) === String(c._id || c.id || c)}
              disabled={hasVoted}
              onDelete={user?.role?.toLowerCase() === 'admin' ? async () => {
                if (!window.confirm('Delete this candidate?')) return;
                try {
                  setLoading(true);
                  await API.delete(`/elections/${selected._id || selected.id}/candidates/${c._id || c.id}`);
                  await fetchCandidates(selected._id || selected.id);
                  alert('Candidate deleted.');
                } catch (err) {
                  alert('Failed to delete candidate.');
                } finally {
                  setLoading(false);
                }
              } : undefined}
            />
          </motion.div>
        ))}
      </div>

      {/* Admin/Action Bar at the bottom */}
      <div className="mt-10 p-4 border-t border-gray-700/50 flex flex-wrap items-center gap-4 bg-gray-800/50 rounded-xl">
        {user?.role?.toLowerCase() === 'admin' && (
            <button 
                onClick={startBatchAdd} 
                disabled={loading}
                className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-emerald-500 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                + Add Candidates (by Seat)
            </button>
        )}
        {!selected && <span className="text-sm text-yellow-400">Please select an election from the dropdown.</span>}
      </div>
    </DashboardLayout>
  );
}