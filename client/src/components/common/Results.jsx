import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  TrendingUp,
  FileText,
  Hash,
  Calendar,
  Award,
  Eye,
  Copy,
  ExternalLink,
  RefreshCw,
  PieChart as LucidePie
} from 'lucide-react';
import { electionsAPI } from '../../services/api';
import { useElections } from '../../hooks/elections';
import { useGlobalUI } from '../../components/common';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import useResultsSocket from '../../hooks/useResultsSocket';

// Register Chart.js components including Filler for area/line fills
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler);

const SmallPieChart = ({ data }) => {
  const labels = (data || []).map(d => d.label || d.name);
  const values = (data || []).map(d => Number(d.value ?? d.votes ?? 0));
  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: ['#38bdf8','#34d399','#a78bfa','#f97316','#ef4444','#f59e0b','#60a5fa'],
      hoverOffset: 6
    }]
  };
  const options = { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#9CA3AF' } }, title: { display: false } } };
  return <div className="h-56"><Pie data={chartData} options={options} /></div>;
};

const SmallBarChart = ({ data }) => {
  const labels = (data || []).map(d => d.label || d.name);
  const values = (data || []).map(d => Number(d.value ?? d.votes ?? 0));
  const chartData = { labels, datasets: [{ label: 'Votes', data: values, backgroundColor: '#06b6d4' }] };
  const options = { responsive: true, scales: { x: { ticks: { color: '#9CA3AF' } }, y: { ticks: { color: '#9CA3AF' } } }, plugins: { legend: { display: false } } };
  return <div className="h-56"><Bar data={chartData} options={options} /></div>;
};

const SmallTrendChart = ({ data }) => {
  const labels = (data || []).map(p => p.time || p.label || '');
  const values = (data || []).map(p => Number(p.votes || p.value || 0));
  const chartData = { labels, datasets: [{ label: 'Tally', data: values, borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.15)', fill: true }] };
  const options = { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9CA3AF' } }, y: { ticks: { color: '#9CA3AF' } } } };
  return <div className="h-40"><Line data={chartData} options={options} /></div>;
};

const Results = () => {
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nowTicks, setNowTicks] = useState(Date.now());
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('votes');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filters, setFilters] = useState({});
  const [highContrast, setHighContrast] = useState(false);
  const [lastFetchError, setLastFetchError] = useState(null);
  // useElections returns a react-query result; pull the `data` property which holds the elections list
  const { data: electionsData } = useElections();
  const { showToast } = useGlobalUI();

  // Filter elections that have results available (normalize status)
  const electionsWithResults = (Array.isArray(electionsData) ? electionsData : []).filter(election => {
    const s = String(election.status || '').toLowerCase();
    return ['open', 'closed', 'finalized', 'completed'].includes(s);
  });

  useEffect(() => {
    if (selectedElection) {
      fetchResults();
    }
  }, [selectedElection]);

  // Tick for relative time display
  useEffect(() => {
    const iv = setInterval(() => setNowTicks(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Polling for real-time updates when enabled (5s)
  useEffect(() => {
    if (!autoRefresh || !selectedElection) return;
    const iv = setInterval(() => {
      fetchResults();
    }, 5 * 1000);
    return () => clearInterval(iv);
  }, [autoRefresh, selectedElection]);

  // WebSocket: subscribe to server-sent result updates if available
  const handleSocketMessage = useCallback((data) => {
    if (!data) return;
    // If the server sends a full results payload
    if (data.type === 'resultsUpdate' && data.results) {
      setResults(prev => ({ ...prev, ...data }));
      setLastUpdated(Date.now());
      showToast('Results updated (live)');
    }
    // If the server signals a minimal refresh
    if (data.type === 'refresh') {
      fetchResults();
    }
  }, [showToast]);

  const { connected: wsConnected } = useResultsSocket(selectedElection?._id, handleSocketMessage);

  // build filtered/sorted/paginated candidate list
  const candidatesList = useMemo(() => {
    if (!results?.results) return [];
    let list = (results.results || []).slice();
    // search filter
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c => (c.name || '').toLowerCase().includes(s) || (c.party || '').toLowerCase().includes(s));
    }
    // apply simple filters if available (faculty/region/seat)
    if (filters.faculty) list = list.filter(c => (c.faculty || c.region || '').toLowerCase() === (filters.faculty||'').toLowerCase());
    // sorting
    list.sort((a,b)=>{
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'name') return dir * ((a.name||'').localeCompare(b.name||''));
      if (sortField === 'percentage') return dir * ((Number(a.percentage||0)) - (Number(b.percentage||0)));
      // default votes
      return dir * ((Number(a.votes||0)) - (Number(b.votes||0)));
    });
    return list;
  }, [results, search, sortField, sortDir, filters]);

  const totalCandidates = candidatesList.length;
  const totalPages = Math.max(1, Math.ceil(totalCandidates / pageSize));
  const pageItems = candidatesList.slice((page-1)*pageSize, (page-1)*pageSize + pageSize);

  const fetchResults = async () => {
    if (!selectedElection) return;
    
    setLoading(true);
    try {
      // Ensure we have an auth token; server endpoints under /api/elections require auth
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Not authenticated. Please log in to view results.', 'error');
        setLoading(false);
        // redirect to login could be considered but keep UI in control
        return;
      }

      const resultsData = await electionsAPI.getFinalResults(selectedElection._id);
      setResults(resultsData);
      setLastUpdated(Date.now());
    } catch (error) {
      // Surface useful diagnostic info for server/client errors
      const serverMessage = error?.response?.data?.message;
      const status = error?.response?.status;
      const errMsg = serverMessage || error?.message || 'Unknown error';
      console.error('Error fetching results:', { status, message: errMsg, error });
      setLastFetchError({ status, message: errMsg });
      showToast(`Failed to fetch results${status ? ` (HTTP ${status})` : ''}: ${errMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!selectedElection) return;
    
    setExporting(true);
    try {
      const data = await electionsAPI.exportResults(selectedElection._id, format);
      
      if (format === 'json') {
        // Download JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `election-${selectedElection._id}-results.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Download CSV file
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `election-${selectedElection._id}-results.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // Download PDF file
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `election-${selectedElection._id}-results.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      showToast(`Results exported successfully as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      showToast('Failed to export results', 'error');
      console.error('Error exporting results:', error);
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Finalized': return 'text-green-400 bg-green-400/20';
      case 'Closed': return 'text-yellow-400 bg-yellow-400/20';
      case 'Open': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Finalized': return <CheckCircle className="w-4 h-4" />;
      case 'Closed': return <Clock className="w-4 h-4" />;
      case 'Open': return <TrendingUp className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`p-6 space-y-6 ${highContrast ? 'high-contrast' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Election Results</h1>
          <p className="text-gray-400">View and export official election results</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)} /> Auto-refresh 5s
            </label>
            <button
              onClick={() => setShowVerification(!showVerification)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-300 rounded-xl hover:bg-blue-600/30 transition-all duration-200"
              aria-pressed={showVerification}
            >
              <Shield className="w-4 h-4" />
              Verification Data
            </button>
            <button
              onClick={() => { if (selectedElection) fetchResults(); else showToast('Select an election first'); }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded text-gray-200 border border-gray-700"
              title="Manual refresh"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs text-gray-400">{lastUpdated ? `${Math.floor((nowTicks - lastUpdated)/1000)}s ago` : 'Never'}</span>
            </button>
            <div className="flex items-center gap-3 ml-2">
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-500'}`} title={wsConnected ? 'WebSocket connected' : 'WebSocket not connected'} />
                <span className="text-gray-400">WS: {wsConnected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
            <button
              onClick={() => setHighContrast(h => !h)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded text-gray-200 border border-gray-700"
              title="Toggle high contrast"
            >
              HC
            </button>
          </div>
        </div>
      </div>
      {lastFetchError && (
        <div className="bg-red-900/70 text-white p-3 rounded-md">
          <div className="flex items-center justify-between">
            <div className="text-sm">Failed to fetch results: {lastFetchError.message} {lastFetchError.status ? `(HTTP ${lastFetchError.status})` : ''}</div>
            <button onClick={() => setLastFetchError(null)} className="text-xs text-red-200 hover:text-white">Dismiss</button>
          </div>
        </div>
      )}

      {/* Election Selection */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Select Election</h2>
        <div className="flex items-center gap-3 mb-4">
          <select
            value={selectedElection?._id || ''}
            onChange={e => {
              const id = e.target.value;
              const found = (electionsWithResults || []).find(ev => String(ev._id) === String(id));
              setSelectedElection(found || null);
            }}
            className="bg-gray-700 text-white p-2 rounded border border-gray-600"
            aria-label="Select election"
          >
            <option value="">-- Choose an election --</option>
            {electionsWithResults.map(ev => (
              <option key={ev._id} value={ev._id}>{ev.title} ({String(ev.status).toUpperCase()})</option>
            ))}
          </select>

          <button
            onClick={() => { if (selectedElection) fetchResults(); else showToast('Select an election first'); }}
            className="px-3 py-2 bg-gray-700 rounded border border-gray-600 text-sm text-gray-200"
          >
            Load
          </button>
        </div>

        {/* Fallback grid of quick-select cards (click to select) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {electionsWithResults.map((election) => (
            <motion.button
              key={election._id}
              onClick={() => setSelectedElection(election)}
              className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                selectedElection?._id === election._id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{election.title}</h3>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getStatusColor(election.status)}`}>
                  {getStatusIcon(election.status)}
                  {election.status}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{election.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {election.startsAt ? new Date(election.startsAt).toLocaleDateString() : '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {election.registeredVoters?.length || 0} voters
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      {selectedElection && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Election Info */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{results?.title}</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 ${getStatusColor(results?.status)}`}>
                    {getStatusIcon(results?.status)}
                    {results?.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExport('json')}
                      disabled={exporting}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 disabled:opacity-50 transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                      JSON
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      disabled={exporting}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      disabled={exporting}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 disabled:opacity-50 transition-all duration-200"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-400">Total Voters</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{results?.totalRegisteredVoters || 0}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Total Votes</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{results?.totalVotes || 0}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-gray-400">Turnout</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{results?.turnoutPercentage || 0}%</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-400">Candidates</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{results?.results?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Winner Spotlight & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                {/* Winner Spotlight */}
                {results?.results && results.results.length > 0 && (
                  (() => {
                    const sorted = (results.results || []).slice().sort((a,b)=>b.votes - a.votes);
                    const leader = sorted[0];
                    const second = sorted[1];
                    const diff = leader && second ? (leader.votes - (second.votes||0)) : 0;
                    return (
                      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                        <h4 className="text-sm text-gray-400">Leading Candidate</h4>
                        <div className="mt-4 flex items-center gap-4">
                          <div className="w-28 h-28 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-white text-2xl font-bold">
                            {leader?.photo ? <img src={leader.photo} alt={leader.name} className="w-full h-full object-cover" /> : (leader?.name||'?').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-white">{leader?.name}</div>
                            <div className="text-sm text-gray-400">{leader?.party || 'Independent'}</div>
                            <div className="mt-2 text-white font-mono text-xl">{leader?.votes || 0} votes</div>
                            <div className="text-sm text-gray-400">{leader?.percentage || 0}% • +{diff} vs 2nd</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <SmallPieChart data={results?.results} />
                <SmallBarChart data={results?.results} />
                <div className="md:col-span-2">
                  <SmallTrendChart data={results?.trend || []} />
                </div>
              </div>
            </div>

            {/* Results Table */}
            {loading ? (
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">Loading results...</span>
                </div>
              </div>
            ) : results?.results?.length > 0 ? (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="p-6 border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Final Results</h3>
                      <p className="text-sm text-gray-400">Official results after final tally</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} placeholder="Search candidate..." className="bg-gray-700 text-white rounded px-3 py-2 text-sm" aria-label="Search candidates" />
                      <select value={filters.faculty || ''} onChange={e=>setFilters(f=>({ ...f, faculty: e.target.value }))} className="bg-gray-700 text-white rounded px-3 py-2 text-sm">
                        <option value="">All Faculties</option>
                        {/* placeholder options when data absent */}
                        <option value="Engineering">Engineering</option>
                      </select>
                      <select value={sortField} onChange={e=>setSortField(e.target.value)} className="bg-gray-700 text-white rounded px-3 py-2 text-sm">
                        <option value="votes">Sort: Votes</option>
                        <option value="name">Sort: Name</option>
                        <option value="percentage">Sort: %</option>
                      </select>
                      <button onClick={()=>setSortDir(d=> d==='asc'?'desc':'asc')} className="px-3 py-1 bg-gray-700 rounded text-sm">{sortDir==='asc'?'Asc':'Desc'}</button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky top-0 z-10">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky top-0 z-10">Candidate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky top-0 z-10">Party</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky top-0 z-10">Seat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky top-0 z-10">Votes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky top-0 z-10">Percentage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky top-0 z-10">Blockchain ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {pageItems.map((result, idx) => {
                        const index = (page-1)*pageSize + idx;
                        const status = index === 0 ? 'Leading' : index === 1 ? 'Second' : (result.votes === 0 ? 'Eliminated' : '');
                        const explorerBase = results?.blockchainData?.explorerUrl || '/admin/blockchain-health';
                        const txLink = result.transactionHash ? `${explorerBase}?tx=${result.transactionHash}` : explorerBase;
                        return (
                          <tr key={result.id || result._id || index} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {index === 0 && <Award className="w-4 h-4 text-yellow-400 mr-2" />}
                                <span className="text-sm font-medium text-white">#{index + 1}</span>
                                {status && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-200">{status}</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold overflow-hidden">
                                  {result.photo ? <img src={result.photo} alt={result.name} className="w-full h-full object-cover" /> : (result.name||'?').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">{result.name}</div>
                                  <div className="text-xs text-gray-400">{result.email ? 'Voter-linked' : ''}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-300">{result.party || 'Independent'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-300">{result.seat}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-white">{result.votes}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${result.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-300">{result.percentage}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <a href={txLink} target="_blank" rel="noreferrer" className="text-xs font-mono text-gray-400 hover:text-white">{result.chainCandidateId || result.transactionHash || '—'}</a>
                                <button
                                  onClick={() => copyToClipboard(result.chainCandidateId || result.transactionHash || '')}
                                  className="text-gray-400 hover:text-white transition-colors"
                                  aria-label="Copy blockchain id"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* pagination controls */}
                <div className="p-4 flex items-center justify-between bg-gray-900 border-t border-gray-700">
                  <div className="text-sm text-gray-400">Showing {(page-1)*pageSize + 1}–{Math.min(page*pageSize, totalCandidates)} of {totalCandidates}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 bg-gray-700 rounded text-sm">Prev</button>
                    <div className="text-sm text-gray-300">Page {page} / {totalPages}</div>
                    <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 bg-gray-700 rounded text-sm">Next</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 text-center">
                <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Results Available</h3>
                <p className="text-gray-400">Results will be available once voting begins or the election is finalized.</p>
              </div>
            )}

            {/* Verification Data */}
            {showVerification && results?.blockchainData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Blockchain Verification Data
                  </h3>
                  <p className="text-sm text-gray-400">Use this data to verify results on the blockchain</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-300">Results Hash</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400 break-all">{results.blockchainData.resultsHash}</span>
                        <button
                          onClick={() => copyToClipboard(results.blockchainData.resultsHash)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-gray-300">Election ID</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">{results.blockchainData.chainElectionId}</span>
                        <button
                          onClick={() => copyToClipboard(results.blockchainData.chainElectionId)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-300">Finalized At</span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(results.blockchainData.finalizedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-gray-300">Last Synced Block</span>
                      </div>
                      <span className="text-sm text-gray-400">#{results.blockchainData.lastSyncedBlock}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Eye className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-300 mb-1">How to Verify Results</h4>
                        <p className="text-xs text-gray-400 mb-2">
                          Use the blockchain explorer to verify these results by searching for the transaction hash or election ID.
                        </p>
                        <button className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          <ExternalLink className="w-3 h-3" />
                          Open Blockchain Explorer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Audit Trail */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Audit Trail</h3>
                <div className="flex items-center gap-2">
                  <button onClick={()=>handleExport('json')} disabled={exporting} className="px-3 py-1 bg-gray-700 rounded text-sm">Export JSON</button>
                  <button onClick={()=>handleExport('csv')} disabled={exporting} className="px-3 py-1 bg-gray-700 rounded text-sm">Export CSV</button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto text-sm text-gray-300 border border-gray-700 rounded p-3">
                { (results?.audit || results?.auditTrail || results?.logs || []).length === 0 && (
                  <div className="text-gray-500">No audit entries available.</div>
                )}
                {(results?.audit || results?.auditTrail || results?.logs || []).map((a,i)=> (
                  <div key={a._id || i} className="py-2 border-b border-gray-700/40">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">{new Date(a.timestamp || a.time || Date.now()).toLocaleString()}</div>
                      <div className="text-xs font-mono text-gray-500">{a.tx || a.transactionHash || a.chainId || '—'}</div>
                    </div>
                    <div className="text-sm text-gray-300">{a.message || a.action || JSON.stringify(a)}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Results;
