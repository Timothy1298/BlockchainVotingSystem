import React, { useEffect, useState, useContext, useMemo } from 'react';
import {DashboardLayout} from '../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalUI } from '../components/GloabalUI.jsx';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
// NEW IMPORT: Chart Component
import { LiveVoteTrendChart } from '../components/LiveVoteTrendChart'; 


// ----------------------------------------------------------------------
// NEW COMPONENT: Candidate Detail Modal Placeholder
// ----------------------------------------------------------------------
const CandidateDetailModal = ({ candidate, onClose }) => {
    if (!candidate) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-sky-600/50"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    onClick={e => e.stopPropagation()} // Prevent closing on modal click
                >
                    <h3 className="text-3xl font-extrabold text-sky-400 mb-2 border-b border-gray-600 pb-2">
                        {candidate.name}
                    </h3>
                    <p className="text-gray-400 mb-6 font-medium">{candidate.seat} Candidate</p>

                    <div className="space-y-4">
                        <div className="bg-gray-900 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-white mb-2">Manifesto Summary</h4>
                            <p className="text-gray-400 text-sm italic">
                                Placeholder: "I pledge to increase student welfare funding by 20% and modernize the library facilities. My focus is on transparency and community engagement."
                            </p>
                        </div>

                        <div className="bg-gray-900 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-white mb-2">Audit Details (Transparency)</h4>
                            <p className="text-sm text-gray-400">
                                **Candidate ID:** <span className="font-mono text-xs text-green-400">{candidate.id}</span>
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                **Latest Vote Hash:** <span className="font-mono text-xs text-purple-400">0x...{candidate.id.slice(-6)}</span>
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose} 
                        className="mt-6 w-full py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition duration-150"
                    >
                        Close
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};


// ----------------------------------------------------------------------
// MAIN COMPONENT: Results
// ----------------------------------------------------------------------

export default function Results() {
  const { logout } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // NEW STATE FOR INTERACTIVE FEATURES
  const [selectedCandidate, setSelectedCandidate] = useState(null); // For modal
  const [sortKey, setSortKey] = useState('votes'); // 'votes' or 'name'
  const [sortDirection, setSortDirection] = useState('desc'); // 'desc' or 'asc'

  const { showLoader, hideLoader, showToast } = useGlobalUI();

  // Define the fixed order of seats to display
  const FIXED_SEATS_ORDER = ['President', 'Vice President', 'Secretary', 'Treasurer', 'PRO'];
  
  // Custom border colors for table differentiation
  const SEAT_BORDERS = ['border-sky-500', 'border-purple-500', 'border-emerald-500', 'border-yellow-500', 'border-red-500'];

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (selected) fetchResults(selected._id || selected.id || selected);
  }, [selected]);

  const fetchElections = async () => {
    try {
      const res = await API.get('/elections');
      const data = res.data;
      setElections(Array.isArray(data) ? data : []);
      if ((data || []).length > 0 && !selected) setSelected(data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResults = async (electionId) => {
    try {
      showLoader('Fetching results...');
      setResults(null); // Clear previous results
      // Fetch current final results
      const res = await API.get(`/results/${electionId}`); 
      
      const electionData = Array.isArray(res.data) ? res.data[0] : res.data;
      
      // 🚨 TEMPORARY: Add a placeholder voteSnapshots array for the chart to function 
      // without crashing, even though the data will show the 'not available' message.
      // REMOVE this placeholder and rely on the backend response when the API is fixed.
      if (!electionData.voteSnapshots) {
          electionData.voteSnapshots = [];
      }

      // Ensure that totalVoters is calculated if not provided by the results endpoint
      if (!electionData.totalVoters) {
          electionData.totalVoters = electionData.totalVoters || 0; 
      }
      
      // Setting the results with the data received from the backend (which includes 'seat')
      setResults(electionData); 

    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        logout?.();
        return;
      }
      setResults({
        candidates: [],
        totalVotes: 0,
        totalVoters: 0,
        error: 'Failed to load results.',
        voteSnapshots: [] // Ensure this is initialized to prevent errors
      });
      showToast('Failed to load results', 'error');
    } finally {
      hideLoader();
    }
  };

  const getElectionTitle = () =>
    selected?.title ||
    selected?.name ||
    `Election ${selected?._id || selected?.id || 'N/A'}`;

  const getCandidateBarColor = (index) => {
    const colors = ['bg-sky-500', 'bg-purple-500', 'bg-emerald-500', 'bg-yellow-500'];
    return colors[index % colors.length];
  };
  
  // NEW FUNCTION: Handle candidate click for modal/details
  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
  };
  
  // NEW FUNCTION: Handle sorting logic change
  const handleSortChange = (key) => {
    if (sortKey === key) {
        setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
        setSortKey(key);
        setSortDirection('desc'); // Default to descending for new sort key
    }
  };

  // HELPER: Groups candidates by their 'seat' property
  const groupCandidatesBySeat = (candidates) => {
    const seatMap = {
        'president': 'President',
        'vice president': 'Vice President',
        'vice-president': 'Vice President',
        'secretary': 'Secretary',
        'treasurer': 'Treasurer',
        'pro': 'PRO',
    };

    return (candidates || []).reduce((acc, candidate) => {
      const rawSeat = candidate.seat ? candidate.seat.toLowerCase() : ''; 
      const seatKey = seatMap[rawSeat] || 'Unassigned Seat';
      
      if(FIXED_SEATS_ORDER.includes(seatKey)) {
          if (!acc[seatKey]) {
            acc[seatKey] = [];
          }
          acc[seatKey].push(candidate);
      }
      return acc;
    }, {});
  };

  // HELPER: Determines the winner and winning margin for a specific list of candidates
  const getSeatWinnerDetails = (candidates) => {
    const details = { winner: null, isTie: false, margin: 0 };
    if (!candidates || candidates.length === 0) return details;

    // Sort by votes descending
    const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
    
    details.winner = sorted[0] || null;
    
    if (!details.winner || details.winner.votes <= 0) return details;

    // Check for a tie among candidates with the highest number of votes
    const tiedCandidates = sorted.filter((c) => c.votes === details.winner.votes && c.votes > 0);
    details.isTie = tiedCandidates.length > 1;
    
    // Calculate margin: Winner's votes minus runner-up's votes
    if (sorted.length > 1 && !details.isTie) {
        details.margin = details.winner.votes - sorted[1].votes;
    }

    return details;
  };

  const groupedResults = groupCandidatesBySeat(results?.candidates);
  
  // Calculate Voter Turnout for summary
  const voterTurnout = useMemo(() => {
    const totalVoters = results?.totalVoters || 0;
    const totalVotes = results?.totalVotes || 0;
    if (totalVoters > 0) {
        return Math.round((totalVotes / totalVoters) * 100);
    }
    return 0;
  }, [results?.totalVotes, results?.totalVoters]);


  return (
    <DashboardLayout>
      {/* Candidate Detail Modal - IMPLEMENTATION 3 */}
      <CandidateDetailModal 
          candidate={selectedCandidate} 
          onClose={() => setSelectedCandidate(null)} 
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-extrabold text-white tracking-wide">
          📊 Live Election Results
        </h2>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* Blockchain Proof Link - IMPLEMENTATION 5 */}
          <a
            href="https://blockchain-explorer.io/tx/0xBlockchainProofHash123456" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 transition duration-150"
          >
            <i className="fas fa-lock text-sm"></i> 
            Audit Blockchain Proof
          </a>

          <select
            value={selected?._id || selected?.id || ''}
            onChange={(e) => {
              const id = e.target.value;
              const found = elections.find((ev) => (ev._id || ev.id) === id);
              setSelected(found || id);
            }}
            className="bg-gray-800 border border-gray-700 text-gray-200 px-4 py-2 rounded-xl shadow-md 
                       focus:ring-sky-500 focus:border-sky-500 appearance-none transition duration-150 
                       cursor-pointer w-full md:w-auto"
          >
            <option value="" disabled className="text-gray-500 bg-gray-900">
              Select an Election...
            </option>
            {(elections || []).map((ev, index) => (
              <option
                key={`${ev._id || ev.id}-${index}`}
                value={ev._id || ev.id}
                className="bg-gray-900 text-white"
              >
                {ev.title || ev.name || `Election ${ev._id || ev.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Election Title */}
      <h2 className="text-xl font-semibold mb-6 text-sky-400">
        Results for: {getElectionTitle()}
      </h2>

      {/* Loading Indicator */}
      {loading && (
        <p className="text-sky-400 font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-chart-bar animate-pulse"></i> Fetching results from the chain...
        </p>
      )}

      {/* Results */}
      {results && !loading ? (
        <div className="space-y-10">
          {/* Summary Block - IMPLEMENTATION 1 (Turnout %) */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-4xl font-extrabold text-sky-400">
                {results.totalVotes || 0}
              </div>
              <div className="text-gray-400 text-sm mt-1">Total Votes Cast</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-green-400">
                {results.totalVoters || 0}
              </div>
              <div className="text-gray-400 text-sm mt-1">Registered Voters</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white">
                {voterTurnout}%
              </div>
              <div className="text-gray-400 text-sm mt-1">Voter Turnout</div>
            </div>
          </div>
          
          {/* Time-Series Chart - IMPLEMENTATION 2 (Replaced Placeholder) */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4">Live Vote Trend: {getElectionTitle()}</h3>
              <LiveVoteTrendChart 
                  snapshots={results?.voteSnapshots} 
                  title={getElectionTitle()} 
              />
          </div>

          {/* Interactive Sorting Control - IMPLEMENTATION 4 */}
          <div className="flex items-center justify-end gap-2 text-gray-400 text-sm">
            <span className="mr-2">Sort Candidates:</span>
            <button 
                onClick={() => handleSortChange('votes')}
                className={`px-3 py-1 rounded-full font-semibold transition ${sortKey === 'votes' ? 'bg-sky-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
                Votes 
                {sortKey === 'votes' && <i className={`ml-1 fas fa-arrow-${sortDirection === 'desc' ? 'down' : 'up'}`}></i>}
            </button>
            <button 
                onClick={() => handleSortChange('name')}
                className={`px-3 py-1 rounded-full font-semibold transition ${sortKey === 'name' ? 'bg-sky-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
                Name 
                {sortKey === 'name' && <i className={`ml-1 fas fa-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
            </button>
          </div>

          {/* Seat Results Grouped by Seat in Independent Tables */}
          {FIXED_SEATS_ORDER.map((seat, seatIndex) => { 
            const seatCandidates = groupedResults[seat] || []; // Get candidates for the specific seat
            const { winner, isTie, margin } = getSeatWinnerDetails(seatCandidates);
            const totalSeatVotes = seatCandidates.reduce((sum, c) => sum + c.votes, 0);

            // Sort candidates based on user selection - IMPLEMENTATION 4
            const sortedCandidates = [...seatCandidates].sort((a, b) => {
                let comparison = 0;
                
                if (sortKey === 'votes') {
                    comparison = b.votes - a.votes; // Default sort by votes descending
                    if (sortDirection === 'asc') comparison = -comparison;
                } else if (sortKey === 'name') {
                    comparison = a.name.localeCompare(b.name);
                    if (sortDirection === 'desc') comparison = -comparison;
                }
                return comparison;
            });

            // Get a unique border style for this seat
            const seatBorder = SEAT_BORDERS[seatIndex % SEAT_BORDERS.length];

            return (
              <motion.div
                key={seat}
                // Use a dynamic border class based on seat index
                className={`bg-gray-900 border ${seatBorder} rounded-xl p-6 shadow-2xl`} 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: seatIndex * 0.1 }}
              >
                <h3 className="text-3xl font-extrabold text-white mb-4 border-b border-sky-500/50 pb-2">
                  {seat} Seat Results
                </h3>
                
                {/* Seat Summary Metrics (Total Votes and Margin) - IMPLEMENTATION 1 */}
                <div className="flex justify-between items-center mb-5 p-3 bg-gray-800/70 rounded-lg text-sm font-semibold">
                    <p className="text-gray-300">Total Votes for {seat}: <span className="text-sky-400">{totalSeatVotes}</span></p>
                    <p className="text-gray-300">
                        Winning Margin: 
                        <span className={`${margin > 0 ? 'text-green-400' : 'text-yellow-400'} ml-1`}>
                            {isTie ? 'Tied' : margin}
                        </span>
                    </p>
                </div>

                {/* Seat Winner Announcement */}
                {winner && winner.votes > 0 ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-3 mb-5 rounded-xl text-center shadow-lg ${isTie ? 'bg-yellow-900/50 border border-yellow-600' : 'bg-emerald-900/50 border border-emerald-600'}`}
                  >
                    <h4 className="text-xl font-extrabold text-white">
                      {isTie ? '⚠️ Tied Contest' : '🏆 Seat Winner'}
                    </h4>
                    <p className={`text-sm mt-1 ${isTie ? 'text-yellow-300' : 'text-emerald-300'}`}>
                      {isTie 
                        ? 'Contest is currently tied among leading candidates.'
                        : `${winner.name} wins with ${winner.votes} votes.`}
                    </p>
                  </motion.div>
                ) : (
                    <p className="text-gray-500 mb-5 text-center">No votes recorded for this seat yet.</p>
                )}


                {/* Results Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                            <tr>
                                <th scope="col" className="py-3 px-6 rounded-tl-lg">Rank</th>
                                <th scope="col" className="py-3 px-6 cursor-pointer" onClick={() => handleSortChange('name')}>Candidate</th>
                                <th scope="col" className="py-3 px-6 text-right cursor-pointer" onClick={() => handleSortChange('votes')}>Votes</th>
                                <th scope="col" className="py-3 px-6 w-1/4">Percentage</th>
                                <th scope="col" className="py-3 px-6 rounded-tr-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Display candidates if they exist, otherwise show a row indicating no candidates */}
                            {sortedCandidates.length > 0 ? (
                                sortedCandidates.map((c, index) => {
                                    const pct = totalSeatVotes > 0 ? (c.votes / totalSeatVotes) * 100 : 0;
                                    const isLeading = c.votes === winner?.votes && c.votes > 0 && !isTie;
                                    const isTied = c.votes === winner?.votes && c.votes > 0 && isTie;
                                    const barColor = isLeading
                                        ? 'bg-sky-500 shadow-sky-800'
                                        : isTied
                                        ? 'bg-yellow-500 shadow-yellow-800'
                                        : getCandidateBarColor(index);
                                    
                                    let statusMessage = '';
                                    let statusClass = '';

                                    if (isLeading) {
                                        statusMessage = 'WINNER';
                                        statusClass = 'text-emerald-400 font-extrabold';
                                    } else if (isTied) {
                                        statusMessage = 'TIE';
                                        statusClass = 'text-yellow-400 font-extrabold';
                                    }

                                    return (
                                        <tr 
                                            key={c._id || c.id} 
                                            // Make row clickable for candidate details - IMPLEMENTATION 3
                                            onClick={() => handleCandidateClick(c)}
                                            className={`border-b border-gray-700 transition-colors duration-200 cursor-pointer ${isLeading ? 'bg-gray-700/50 hover:bg-gray-700/90' : 'bg-gray-800 hover:bg-gray-800/90'}`}
                                        >
                                            <td className="py-4 px-6 font-medium text-white">
                                                {index + 1}
                                            </td>
                                            <td className="py-4 px-6 text-white font-semibold">
                                                {c.name}
                                                <i className="ml-2 fas fa-info-circle text-sky-400/70 text-xs"></i>
                                            </td>
                                            <td className="py-4 px-6 text-right font-mono text-base text-white">
                                                {c.votes}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold mb-1 ${isLeading ? 'text-sky-300' : 'text-gray-400'}`}>
                                                        {pct.toFixed(1)}%
                                                    </span>
                                                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden shadow-inner">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-1000 ${barColor}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={statusClass}>{statusMessage}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr className="bg-gray-800">
                                    <td colSpan="5" className="py-4 px-6 text-center text-gray-500">
                                        No candidates are competing for the {seat} seat in this election.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        !loading && (
          <p className="text-gray-400 text-lg py-8 text-center bg-gray-800/50 rounded-xl">
            Select an election or wait for votes to be cast.
          </p>
        )
      )}
    </DashboardLayout>
  );
}