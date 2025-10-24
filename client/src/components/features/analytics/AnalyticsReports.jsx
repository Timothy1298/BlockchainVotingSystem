import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Download, 
  FileText, 
  Globe, 
  Monitor, 
  Smartphone, 
  Laptop,
  Activity,
  Zap,
  Hash,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { analyticsAPI } from '../../../services/api';
import { useElections } from '../../../hooks/elections';
import { useGlobalUI } from '../../../components/common';

const AnalyticsReports = () => {
  const [activeTab, setActiveTab] = useState('turnout');
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blockchainMetrics, setBlockchainMetrics] = useState(null);
  const [turnoutData, setTurnoutData] = useState(null);
  const [geographicData, setGeographicData] = useState(null);
  const [auditReport, setAuditReport] = useState(null);
  const { elections } = useElections();
  const { showToast } = useGlobalUI();

  useEffect(() => {
    fetchBlockchainPerformance();
    fetchTurnoutReports();
  }, [timeRange, selectedElection]);

  useEffect(() => {
    if (selectedElection) {
      fetchGeographicBreakdown();
    }
  }, [selectedElection]);

  const fetchBlockchainPerformance = async () => {
    try {
      const data = await analyticsAPI.getBlockchainPerformance();
      setBlockchainMetrics(data);
    } catch (error) {
      showToast('Failed to fetch blockchain performance', 'error');
      console.error('Error fetching blockchain performance:', error);
    }
  };

  const fetchTurnoutReports = async () => {
    setLoading(true);
    try {
      const params = {
        timeRange,
        ...(selectedElection && { electionId: selectedElection._id })
      };
      const data = await analyticsAPI.getTurnoutReports(params);
      setTurnoutData(data);
    } catch (error) {
      showToast('Failed to fetch turnout reports', 'error');
      console.error('Error fetching turnout reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeographicBreakdown = async () => {
    try {
      const data = await analyticsAPI.getGeographicBreakdown(selectedElection?._id);
      setGeographicData(data);
    } catch (error) {
      showToast('Failed to fetch geographic breakdown', 'error');
      console.error('Error fetching geographic breakdown:', error);
    }
  };

  const generateAuditReport = async (format = 'json') => {
    if (!selectedElection) {
      showToast('Please select an election first', 'warning');
      return;
    }

    try {
      const data = await analyticsAPI.generateAuditReport(selectedElection._id, format);
      
      if (format === 'json') {
        setAuditReport(data);
      } else {
        // Handle file download for CSV/PDF
        const blob = new Blob([data], { 
          type: format === 'csv' ? 'text/csv' : 'application/pdf' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-report-${selectedElection._id}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Audit report downloaded as ${format.toUpperCase()}`, 'success');
      }
    } catch (error) {
      showToast('Failed to generate audit report', 'error');
      console.error('Error generating audit report:', error);
    }
  };

  const tabs = [
    { id: 'turnout', label: 'Turnout Reports', icon: <Users className="w-4 h-4" /> },
    { id: 'blockchain', label: 'Blockchain Performance', icon: <Activity className="w-4 h-4" /> },
    { id: 'geographic', label: 'Geographic/Browser', icon: <Globe className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Reports', icon: <FileText className="w-4 h-4" /> }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'error': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
          <p className="text-gray-400">Comprehensive data insights and system performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchTurnoutReports}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Election Selection */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Select Election (Optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedElection(null)}
            className={`p-4 rounded-xl border transition-all duration-200 text-left ${
              !selectedElection
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <h3 className="font-semibold text-white">All Elections</h3>
            <p className="text-sm text-gray-400">View analytics across all elections</p>
          </button>
          {(elections || []).map((election) => (
            <button
              key={election._id}
              onClick={() => setSelectedElection(election)}
              className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                selectedElection?._id === election._id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <h3 className="font-semibold text-white">{election.title}</h3>
              <p className="text-sm text-gray-400">{election.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(election.status)}`}>
                  {election.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(election.startsAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50">
        <div className="flex border-b border-gray-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'turnout' && (
              <motion.div
                key="turnout"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Turnout Reports</h3>
                  <button
                    onClick={() => generateAuditReport('csv')}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-400">Loading turnout data...</span>
                  </div>
                ) : turnoutData ? (
                  <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-blue-400" />
                          <span className="text-sm text-gray-400">Total Elections</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{turnoutData.statistics.totalElections}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <span className="text-sm text-gray-400">Average Turnout</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{turnoutData.statistics.averageTurnout}%</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm text-gray-400">Total Voters</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{turnoutData.statistics.totalVoters.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-purple-400" />
                          <span className="text-sm text-gray-400">Total Votes</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{turnoutData.statistics.totalVotes.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Elections List */}
                    <div className="bg-gray-700/30 rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-600/50">
                        <h4 className="font-semibold text-white">Election Turnout Details</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-700/50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Election</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Voters</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Votes</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Turnout</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-600/50">
                            {(turnoutData.elections || []).map((election) => (
                              <tr key={election.electionId} className="hover:bg-gray-700/30">
                                <td className="px-4 py-3">
                                  <div className="text-sm font-medium text-white">{election.title}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-300">
                                    {new Date(election.date).toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-300">{election.totalVoters}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-300">{election.totalVotes}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                                      <div 
                                        className="bg-blue-500 h-2 rounded-full" 
                                        style={{ width: `${election.turnoutPercentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-300">{election.turnoutPercentage}%</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(election.status)}`}>
                                    {election.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Turnout Data Available</h3>
                    <p className="text-gray-400">Turnout data will be available once elections are completed.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'blockchain' && (
              <motion.div
                key="blockchain"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Blockchain Performance Metrics</h3>
                  <button
                    onClick={fetchBlockchainPerformance}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>

                {blockchainMetrics ? (
                  <>
                    {/* Performance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-5 h-5 text-green-400" />
                          <span className="text-sm text-gray-400">Transaction Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{blockchainMetrics.metrics.transactionProcessingRate.current} TPS</p>
                        <p className="text-xs text-gray-500">Peak: {blockchainMetrics.metrics.transactionProcessingRate.peak} TPS</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-blue-400" />
                          <span className="text-sm text-gray-400">Confirmation Time</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{blockchainMetrics.metrics.averageConfirmationTime.current}s</p>
                        <p className="text-xs text-gray-500">Average: {blockchainMetrics.metrics.averageConfirmationTime.average}s</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm text-gray-400">Network Latency</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{blockchainMetrics.metrics.networkLatency.current}ms</p>
                        <p className="text-xs text-gray-500">Peak: {blockchainMetrics.metrics.networkLatency.peak}ms</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-5 h-5 text-purple-400" />
                          <span className="text-sm text-gray-400">Gas Price</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{blockchainMetrics.metrics.gasPrice.current} gwei</p>
                        <p className="text-xs text-gray-500">Average: {blockchainMetrics.metrics.gasPrice.average} gwei</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-red-400" />
                          <span className="text-sm text-gray-400">Block Time</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{blockchainMetrics.metrics.blockTime.current}s</p>
                        <p className="text-xs text-gray-500">Average: {blockchainMetrics.metrics.blockTime.average}s</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-indigo-400" />
                          <span className="text-sm text-gray-400">Hash Rate</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{blockchainMetrics.metrics.networkHashRate.current} TH/s</p>
                        <p className="text-xs text-gray-500">Peak: {blockchainMetrics.metrics.networkHashRate.peak} TH/s</p>
                      </div>
                    </div>

                    {/* Network Status */}
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${blockchainMetrics.networkStatus === 'healthy' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-sm font-medium text-white">Network Status: {blockchainMetrics.networkStatus}</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Last updated: {new Date(blockchainMetrics.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Loading Blockchain Metrics</h3>
                    <p className="text-gray-400">Fetching real-time blockchain performance data...</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'geographic' && (
              <motion.div
                key="geographic"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white">Geographic & Browser Breakdown</h3>

                {geographicData ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Geographic Data */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">Geographic Distribution</h4>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-300 mb-3">Countries</h5>
                        <div className="space-y-2">
                          {(geographicData.breakdown?.geographic?.countries || []).map((country, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-300">{country.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${country.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-400 w-12 text-right">{country.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Browser Data */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">Browser & Device Usage</h4>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-300 mb-3">Browsers</h5>
                        <div className="space-y-2">
                          {(geographicData.breakdown?.browsers || []).map((browser, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-300">{browser.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${browser.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-400 w-12 text-right">{browser.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-300 mb-3">Devices</h5>
                        <div className="space-y-2">
                          {(geographicData.breakdown?.devices || []).map((device, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-300 flex items-center gap-2">
                                {device.type === 'Desktop' && <Laptop className="w-4 h-4" />}
                                {device.type === 'Mobile' && <Smartphone className="w-4 h-4" />}
                                {device.type === 'Tablet' && <Monitor className="w-4 h-4" />}
                                {device.type}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full" 
                                    style={{ width: `${device.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-400 w-12 text-right">{device.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Geographic Data Available</h3>
                    <p className="text-gray-400">Geographic breakdown will be available once elections have voter data.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Post-Election Audit Reports</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateAuditReport('json')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
                    >
                      <FileText className="w-4 h-4" />
                      Generate JSON
                    </button>
                    <button
                      onClick={() => generateAuditReport('csv')}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => generateAuditReport('pdf')}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-all duration-200"
                    >
                      <FileText className="w-4 h-4" />
                      Export PDF
                    </button>
                  </div>
                </div>

                {!selectedElection ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Select an Election</h3>
                    <p className="text-gray-400">Please select an election to generate audit reports.</p>
                  </div>
                ) : auditReport ? (
                  <div className="space-y-6">
                    {/* Audit Report Summary */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Audit Report Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-1">Report ID</div>
                          <div className="text-sm font-mono text-white">{auditReport.reportId}</div>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-1">Generated At</div>
                          <div className="text-sm text-white">{new Date(auditReport.generatedAt).toLocaleString()}</div>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-1">Election</div>
                          <div className="text-sm text-white">{auditReport.election.title}</div>
                        </div>
                      </div>
                    </div>

                    {/* Integrity Check */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Integrity Check Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {auditReport.integrity.voterUniqueness.uniqueStudentIds ? 
                              <CheckCircle className="w-5 h-5 text-green-400" /> : 
                              <AlertTriangle className="w-5 h-5 text-red-400" />
                            }
                            <span className="text-sm font-medium text-white">Voter Uniqueness</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {auditReport.integrity.voterUniqueness.uniqueStudentIds ? 'PASS' : 'FAIL'}
                          </div>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-sm font-medium text-white">Vote Integrity</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Score: {auditReport.integrity.voteIntegrity.integrityScore}%
                          </div>
                        </div>
                        <div className="bg-gray-600/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {auditReport.integrity.blockchainConsistency.consistency ? 
                              <CheckCircle className="w-5 h-5 text-green-400" /> : 
                              <AlertTriangle className="w-5 h-5 text-red-400" />
                            }
                            <span className="text-sm font-medium text-white">Blockchain Consistency</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {auditReport.integrity.blockchainConsistency.consistency ? 'PASS' : 'FAIL'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Statistics */}
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">Detailed Statistics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-medium text-gray-300 mb-3">Voter Summary</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">Total Eligible Voters:</span>
                              <span className="text-sm text-white">{auditReport.voters.totalEligible}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">Total Registered Voters:</span>
                              <span className="text-sm text-white">{auditReport.voters.totalRegistered}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-300 mb-3">Vote Summary</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">Total Votes Cast:</span>
                              <span className="text-sm text-white">{auditReport.votes.totalCast}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">Valid Votes:</span>
                              <span className="text-sm text-white">{auditReport.integrity.voteIntegrity.validVotes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Generate Audit Report</h3>
                    <p className="text-gray-400">Click the buttons above to generate comprehensive audit reports for the selected election.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;
