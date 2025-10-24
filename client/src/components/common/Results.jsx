import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { electionsAPI } from '../../services/api';
import { useElections } from '../../hooks/elections';
import { useGlobalUI } from '../../components/common';

const Results = () => {
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const { elections } = useElections();
  const { showToast } = useGlobalUI();

  // Filter elections that have results available
  const electionsWithResults = (elections || []).filter(election => 
    ['Open', 'Closed', 'Finalized'].includes(election.status)
  );

  useEffect(() => {
    if (selectedElection) {
      fetchResults();
    }
  }, [selectedElection]);

  const fetchResults = async () => {
    if (!selectedElection) return;
    
    setLoading(true);
    try {
      const resultsData = await electionsAPI.getFinalResults(selectedElection._id);
      setResults(resultsData);
    } catch (error) {
      showToast('Failed to fetch results', 'error');
      console.error('Error fetching results:', error);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Election Results</h1>
          <p className="text-gray-400">View and export official election results</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVerification(!showVerification)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-300 rounded-xl hover:bg-blue-600/30 transition-all duration-200"
          >
            <Shield className="w-4 h-4" />
            Verification Data
          </button>
        </div>
      </div>

      {/* Election Selection */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Select Election</h2>
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
                  {new Date(election.startsAt).toLocaleDateString()}
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
                  <h3 className="text-lg font-semibold text-white">Final Results</h3>
                  <p className="text-sm text-gray-400">Official results after final tally</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Candidate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Party</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Seat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Votes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Percentage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Blockchain ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {results.results
                        .sort((a, b) => b.votes - a.votes)
                        .map((result, index) => (
                        <tr key={result.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index === 0 && <Award className="w-4 h-4 text-yellow-400 mr-2" />}
                              <span className="text-sm font-medium text-white">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{result.name}</div>
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
                              <span className="text-xs font-mono text-gray-400">{result.chainCandidateId}</span>
                              <button
                                onClick={() => copyToClipboard(result.chainCandidateId)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Results;
