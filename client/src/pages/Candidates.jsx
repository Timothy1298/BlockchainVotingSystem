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

  // UPDATED STATE: hasVoted is now an array of seat names the user has voted for
  const [hasVoted, setHasVoted] = useState([]); 
  const [txStatus, setTxStatus] = useState(null);

  const { showLoader, hideLoader, showToast } = useGlobalUI();

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    // Only fetch candidates when an election is selected
    if (selected) {
        const electionId = selected._id || selected.id || selected;
        fetchCandidates(electionId);
        checkHasVoted(electionId);
    }
  }, [selected]);


  const checkHasVoted = async (electionId) => {
    try {
      const res = await API.get('/votes/hasVoted', { params: { electionId } });
      // UPDATED: Set hasVoted state to the array of seats the user has voted for (e.g., ["President", "Secretary"])
      setHasVoted(res.data?.votedSeats || []);
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error('hasVoted check failed', err);
      // Fallback to empty array on error
      setHasVoted([]); 
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
    if (!selected) return showToast('Please select an election first.', 'warning');
    if (user?.role?.toLowerCase() !== 'admin') return showToast('Access denied: This feature is Admin only.', 'error');
    if (!selected.seats || selected.seats.length === 0) return showToast('No seats defined for this election.', 'warning');
    
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
      showToast('Enter at least one candidate for this seat.', 'warning');
      return;
    }
    setBatchLoading(true);
    try {
      for (const name of names) {
        // Ensure the seat is passed to the backend
        await API.post(`/elections/${selected._id || selected.id}/candidates`, { name, seat });
      }
      await fetchCandidates(selected._id || selected.id);
      
      // Move to next seat or finish
      if (batchSeatIdx < selected.seats.length - 1) {
        setBatchSeatIdx(batchSeatIdx + 1);
        setBatchCandidates(['']);
        showToast(`Candidates added for ${seat}. Moving to the next seat...`, 'info');
      } else {
        setShowBatchForm(false);
        setBatchSeatIdx(0);
        setBatchCandidates(['']);
        showToast('✅ All candidates added for all seats!', 'success');
      }
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error(err);
      showToast('❌ Failed to add candidate(s).', 'error');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleVote = async (candidate) => { 
    const electionId = selected?._id || selected?.id;
    const candidateSeat = candidate.seat; 

    if (!selected) return showToast('Please select an election.', 'warning');
    
    // UI CHECK: Prevent network call if state already shows a vote for this seat
    if (hasVoted.includes(candidateSeat)) {
        return showToast(`🛑 You have already voted for the '${candidateSeat}' seat.`, 'error');
    }

    if (!window.confirm(`Cast vote for ${candidate.name} (${candidate.seat})? This action is irreversible on the blockchain.`)) return;
    
    // Show a global loader and transaction status immediately
    showLoader('Processing Vote...');
    setLoadingCandidate(candidate._id || candidate.id || candidate);
    setLoading(true);

    try {
      // --- ON-CHAIN VOTE ATTEMPT (Primary) ---
      try {
        setTxStatus('Sending transaction to blockchain...');
        const tx = await sendVoteOnChain(electionId, candidate._id || candidate.id || candidate);
        setTxStatus('Transaction sent, waiting for confirmation...');
        await tx.wait?.();
        
        // --- SUCCESS ---
        // Post receipt to server (best-effort)
        try {
          await fetch('/api/tx/receipt', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txHash: tx.hash, electionId: electionId, candidateId: candidate._id || candidate.id || candidate })
          });
        } catch (err) {
          console.warn('Failed to post tx receipt to server', err);
        }

        // Final UI updates
        showToast(`✅ Vote confirmed for ${candidate.name}!`, 'success');
        setTxStatus(`✅ Transaction confirmed (${tx.hash || 'confirmed'})`);
        
      } catch (onChainErr) {
        // --- FALLBACK TO SERVER API VOTE (Secondary) ---
        console.warn('On-chain vote failed, falling back to server:', onChainErr?.message || onChainErr);
        setTxStatus('⚠️ On-chain failed, falling back to server vote...');
        
        // Use API.post which includes the token automatically
        const res = await API.post('/votes/vote', {
          electionId: electionId, 
          candidateId: candidate._id || candidate.id || candidate,
        });

        if (res.status === 200 || res.status === 201) {
            showToast(`✅ Voted for ${candidate.name} via server fallback!`, 'success');
            setTxStatus('✅ Voted via server fallback');
        } else {
             // Fallback catch for unexpected non-error failure
             throw new Error(res.data?.message || 'Server vote failed with non-error status.');
        }
      }
      
      // --- FINALIZE: Update UI after a successful vote (either path) ---
      // Crucial: These update the vote count and the 'hasVoted' status array
      await fetchCandidates(electionId);
      await checkHasVoted(electionId);

    } catch (err) {
      // --- FAILURE ---
      console.error('Vote failed:', err);
      // CAPTURE BACKEND ERROR MESSAGE for double-voting prevention
      const errorMessage = err?.response?.data?.message || err?.message || 'Unknown vote error';
      showToast(`❌ Vote failed: ${errorMessage}`, 'error');
      setTxStatus(`❌ Vote failed: ${errorMessage}`);
      
    } finally { 
      // Always run these to reset state
      hideLoader(); 
      setLoading(false); 
      setLoadingCandidate(null);
      // Keep the final status message for 5 seconds
      setTimeout(() => setTxStatus(null), 5000);
    }
  };

  // Helper to extract election title
  const getElectionTitle = () => selected?.title || selected?.name || `Election ${selected?._id || selected?.id || 'N/A'}`;

  // Check if user and token are loaded (Addresses the 401 on initial load)
  const isAuthReady = user !== null || token !== null;

  if (!isAuthReady) {
      // You might show a loading spinner or null until auth context loads
      return <DashboardLayout><div className="text-white text-center p-10">Loading authentication status...</div></DashboardLayout>;
  }

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
      
      {/* Display Voted Seats status (for user visibility) */}
      {selected && hasVoted.length > 0 && (
          <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-900/40 border border-blue-700/80 text-white p-3 mb-6 rounded-lg shadow-inner flex items-center gap-3"
          >
              <span className="text-lg font-bold">Voted Seats:</span>
              <span className="text-sm font-mono text-blue-300">{hasVoted.join(' | ')}</span>
              <span className="text-xs text-blue-300 ml-auto">You cannot vote for these seats again.</span>
          </motion.div>
      )}

      {/* Display Tx Status (below Voted Seats) */}
      {txStatus && (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 mb-6 rounded-lg font-semibold ${txStatus.startsWith('✅') ? 'bg-emerald-700/80' : txStatus.startsWith('⚠️') ? 'bg-yellow-700/80' : 'bg-red-700/80'} text-white shadow-lg`}
        >
            {txStatus}
        </motion.div>
      )}


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
              // Disable the card if the user has already voted for this specific seat
              disabled={hasVoted.includes(c.seat)} 
              onDelete={user?.role?.toLowerCase() === 'admin' ? async () => {
                if (!window.confirm('Delete this candidate?')) return;
                try {
                  setLoading(true);
                  await API.delete(`/elections/${selected._id || selected.id}/candidates/${c._id || c.id}`);
                  await fetchCandidates(selected._id || selected.id);
                  showToast('✅ Candidate deleted successfully.', 'success');
                } catch (err) {
                  showToast('❌ Failed to delete candidate.', 'error');
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