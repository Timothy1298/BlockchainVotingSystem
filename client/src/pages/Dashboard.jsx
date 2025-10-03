import React, { useEffect, useState, useContext } from "react";
import { DashboardLayout } from "../components/Layout";
import { motion } from "framer-motion";
import { sendVoteOnChain, postTxReceipt } from '../services/web3';
import { useGlobalUI } from '../components/GloabalUI.jsx';
import { AuthContext } from "../context/AuthContext";
import API from '../services/api';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const { token, user, logout } = useContext(AuthContext); // Added 'user' and logout
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCandidate, setLoadingCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const { showLoader, hideLoader, showToast } = useGlobalUI();

  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchElections();
      setLoading(false);
    };
    init();
    // if navigation provided an electionId (from Elections page), preselect it
    const stateElectionId = location?.state?.electionId;
    if (stateElectionId) {
      setSelectedElection(stateElectionId);
    }
  }, []);

  useEffect(() => {
    if (selectedElection) {
      // Ensure selectedElection is an object for ID extraction if it was set via route state
      const id = selectedElection._id || selectedElection.id || selectedElection;
      if (id) {
          fetchCandidates(id);
          checkHasVoted(id);
      }
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      const res = await API.get('/elections');
      const data = res.data;
      if (!Array.isArray(data)) {
        console.warn('Unexpected elections response', data);
        setElections([]);
      } else {
        setElections(data || []);
        // Auto-select the first one if none is preselected
        if (!selectedElection && (data || []).length > 0) setSelectedElection(data[0]);
      }
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error('Failed to load elections', err);
      setElections([]);
    }
  };

  const fetchCandidates = async (electionId) => {
    try {
      const res = await API.get(`/elections/${electionId}/candidates`);
      const data = res.data;
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error('Failed to load candidates', err);
      setCandidates([]);
    }
  };

  const checkHasVoted = async (electionId) => {
    try {
      const res = await API.get('/votes/hasVoted', { params: { electionId } });
      const data = res.data;
      setHasVoted(!!data?.hasVoted);
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error('hasVoted check failed', err);
    }
  };

  const addCandidate = async () => {
    if (user?.role?.toLowerCase() !== 'admin') return alert('Admin access required.');
    if (!selectedElection) return alert('Select an election first');
    const name = window.prompt('Enter the full name of the new candidate');
    if (!name || String(name).trim().length === 0) return;
    try {
      setLoading(true);
      await API.post(`/elections/${selectedElection._id || selectedElection.id}/candidates`, { name });
      alert('✅ Candidate added');
      await fetchCandidates(selectedElection._id || selectedElection.id);
    } catch (err) {
      if (err?.response?.status === 401) { logout?.(); return; }
      console.error(err);
      alert('❌ Failed to add candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateId) => {
    if (hasVoted) return alert('You have already cast your vote in this election.');
    if (!selectedElection) return alert('Select an election first');
    if (!window.confirm('Are you sure you want to cast your vote for this candidate? This action is permanent.')) return;
    
    try {
      setLoading(true);
      setLoadingCandidate(candidateId);
      try {
        showLoader('Sending transaction...');
        const tx = await sendVoteOnChain(selectedElection._id || selectedElection.id, candidateId);
        showToast('Transaction sent — awaiting confirmation', 'info');
        await tx.wait?.();
        showToast('✅ Transaction confirmed', 'success');
        // Best-effort: notify server to sync DB
        try { await postTxReceipt({ txHash: tx.hash, electionId: selectedElection._id || selectedElection.id, candidateId }); } catch (e) { /* ignore */ }
        hideLoader();
      } catch (onChainErr) {
        hideLoader();
        console.warn('On-chain vote failed, falling back to server:', onChainErr?.message || onChainErr);
        showToast('On-chain failed — falling back to server', 'error');
        await API.post('/votes/vote', { electionId: selectedElection._id || selectedElection.id, candidateId });
        showToast('✅ Vote cast successfully (server)', 'success');
      }
      setHasVoted(true);
      await fetchCandidates(selectedElection._id || selectedElection.id);
    } catch (err) {
      console.error(err);
      setTxStatus(`❌ Voting failed: ${err.message || 'Unknown error'}`);
      setTimeout(() => setTxStatus(null), 5000);
    } finally {
      setLoading(false);
      setLoadingCandidate(null);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  
  // Helper to extract election title
  const getElectionTitle = () => selectedElection?.title || selectedElection?.name || `Election ${selectedElection?._id || selectedElection?.id || 'N/A'}`;


  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-extrabold text-white tracking-wide">
          🗳️ Candidates for <span className="text-sky-400">{getElectionTitle()}</span>
        </h2>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* Election Selector - Styled for the dark theme */}
          <select
            value={selectedElection?._id || selectedElection?.id || ''}
            onChange={(e) => {
              const id = e.target.value;
              const found = elections.find((ev) => (ev._id || ev.id) === id);
              setSelectedElection(found || id);
            }}
            className="bg-gray-800 border border-gray-700 text-gray-200 px-4 py-2 rounded-xl shadow-md focus:ring-sky-500 focus:border-sky-500 appearance-none transition duration-150 cursor-pointer w-full md:w-auto"
          >
             <option value="" disabled className="text-gray-500 bg-gray-900">
                Select an Election...
            </option>
            {(elections || []).map((ev) => (
              <option key={ev._id || ev.id} value={ev._id || ev.id} className="bg-gray-900 text-white">
                {ev.title || ev.name || `Election ${ev._id || ev.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Bar */}
      {loading && (
        <p className="text-sky-400 font-semibold mb-4 flex items-center gap-2">
           <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 
           Processing... please wait.
        </p>
      )}

      {txStatus && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium border ${txStatus.startsWith('❌') ? 'bg-red-900/40 border-red-600 text-red-300' : 'bg-sky-900/40 border-sky-600 text-sky-300'}`}>
          {txStatus}
        </div>
      )}
      
      {/* Voted Banner */}
      {hasVoted && (
          <div className="mb-6 p-4 rounded-xl bg-green-900/40 border border-green-600 text-green-300 font-semibold shadow-inner flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span>You have already cast your irreversible vote in this election.</span>
          </div>
      )}


      {/* Candidate Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {candidates.map((c, index) => (
          <motion.div
            key={c._id || c.id}
            className="bg-gray-800 border border-gray-700 shadow-xl shadow-black/50 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -2, boxShadow: "0 8px 10px rgba(0, 0, 0, 0.3)" }}
          >
            {/* Candidate Name */}
            <h3 className="text-2xl font-bold mb-3 text-sky-400 tracking-wide">{c.name}</h3>
            {/* Votes (Subtle) */}
            <p className="text-gray-500 text-sm mb-4 italic">Votes: <span className="font-mono">{c.votes}</span></p>
            {/* Vote Button */}
            <button
              onClick={() => handleVote(c._id || c.id)}
              disabled={(loading && String(loadingCandidate) === String(c._id || c.id)) || !!hasVoted}
              className={`w-full mt-2 font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-200 shadow-lg ${
                ((loading && String(loadingCandidate) === String(c._id || c.id)) || hasVoted) 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed shadow-none' 
                : 'bg-sky-500 text-white hover:bg-sky-400 shadow-sky-500/50'
              }`}
            >
              {(loading && String(loadingCandidate) === String(c._id || c.id)) ? 'Casting...' : hasVoted ? 'Voted' : 'Cast Your Vote'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Admin/Action Bar at the bottom */}
      <div className="mt-10 p-4 border-t border-gray-700/50 flex flex-wrap items-center gap-4 bg-gray-800/50 rounded-xl">
        {user?.role?.toLowerCase() === 'admin' && (
            <button 
                onClick={addCandidate} 
                disabled={loading}
                className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-emerald-500 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                + Add Candidate (Admin)
            </button>
        )}
        {!selectedElection && <span className="text-sm text-yellow-400">Please select an election from the dropdown.</span>}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;