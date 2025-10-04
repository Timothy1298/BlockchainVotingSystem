import React, { useEffect, useState, useContext } from 'react';
import {DashboardLayout} from '../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { useGlobalUI } from '../components/GloabalUI.jsx';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function Results() {
  const { logout } = useContext(AuthContext);
  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const { showLoader, hideLoader, showToast } = useGlobalUI();

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
      const res = await API.get(`/results/${electionId}`);
      setResults(res.data);
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

  const winner =
    results &&
    results.candidates.reduce(
      (prev, current) => (prev.votes > current.votes ? prev : current),
      { votes: -1 }
    );

  const isTie = results?.candidates.filter((c) => c.votes === winner?.votes).length > 1;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-extrabold text-white tracking-wide">
          📊 Live Election Results
        </h2>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
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
        <div className="space-y-8">
          {/* Summary Block */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg flex justify-around text-center">
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
                {results.totalVoters > 0
                  ? Math.round((results.totalVotes / results.totalVoters) * 100)
                  : 0}
                %
              </div>
              <div className="text-gray-400 text-sm mt-1">Voter Turnout</div>
            </div>
          </div>

          {/* Winner Announcement */}
          {winner && winner.votes > 0 && !isTie && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-900/50 border border-emerald-600 rounded-xl text-center shadow-xl"
            >
              <h3 className="text-2xl font-extrabold text-emerald-300">
                🎉 Current Winner: {winner.name}
              </h3>
              <p className="text-sm text-emerald-400 mt-1">
                Leading with {winner.votes} votes.
              </p>
            </motion.div>
          )}

          {/* Candidate Results List */}
          <div className="space-y-5">
            {(results.candidates || [])
              .sort((a, b) => b.votes - a.votes)
              .map((c, index) => {
                const pct =
                  results.totalVotes > 0
                    ? (c.votes / results.totalVotes) * 100
                    : 0;
                const isLeading = c.votes === winner?.votes && !isTie;
                const barColor = isLeading
                  ? 'bg-sky-500 shadow-sky-800'
                  : getCandidateBarColor(index);

                return (
                  <motion.div
                    key={c._id || c.id}
                    className={`bg-gray-800 p-4 rounded-xl border ${
                      isLeading ? 'border-sky-500 shadow-lg' : 'border-gray-700'
                    }`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div
                        className={`font-extrabold text-lg ${
                          isLeading ? 'text-sky-300' : 'text-white'
                        }`}
                      >
                        {isLeading && '🏆 '} {c.name}
                      </div>
                      <div className="text-sm text-gray-400 font-mono">
                        {c.votes} votes ·{' '}
                        <span className="text-white font-semibold">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
          </div>
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
