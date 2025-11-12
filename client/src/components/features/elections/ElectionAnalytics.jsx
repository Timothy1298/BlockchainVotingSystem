import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  RefreshCw,
  Eye,
  Target,
  Award,
  Calendar,
  MapPin,
  Smartphone,
  Monitor
} from 'lucide-react';

const ElectionAnalytics = ({ electionId, election }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('turnout');

  // We'll fetch analytics data from the API
  const mockAnalytics = null;

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Turnout and election-level analytics
        const api = await import('../../../services/api/api');
        const turnoutRes = await api.analyticsAPI.getTurnoutReports({ electionId });
        const geoRes = await api.analyticsAPI.getGeographicBreakdown(electionId);
        const chainRes = await api.analyticsAPI.getBlockchainPerformance();

        // In dev, log raw responses so we can adapt to server shapes
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug('Analytics raw responses:', { turnoutRes, geoRes, chainRes });
        }

        const combined = {
          overview: turnoutRes?.statistics || turnoutRes?.overview || {},
          // votingPatterns expected shape: { byHour: [], byDay: [], byDevice: [], byLocation: [] }
          votingPatterns: turnoutRes?.votingPatterns || turnoutRes?.voting_patterns || { byHour: [], byDay: [], byDevice: [], byLocation: [] },
          demographics: turnoutRes?.demographics || turnoutRes?.demographic || { byAge: [], byFaculty: [], byGender: [] },
          candidatePerformance: turnoutRes?.candidatePerformance || turnoutRes?.candidates || turnoutRes?.candidate_performance || [],
          realTimeMetrics: chainRes?.metrics || chainRes || { currentVotes: 0, votesPerMinute: 0, estimatedCompletion: '', activeVoters: 0, queueLength: 0 }
        };

        setAnalytics(combined);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [electionId, timeRange]);

  const exportAnalytics = (format) => {
    // In real implementation, this would generate and download the file
    console.log(`Exporting analytics as ${format}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Election Analytics</h2>
          <p className="text-gray-400">Comprehensive insights and statistics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={() => exportAnalytics('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => exportAnalytics('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Voters</p>
              <p className="text-2xl font-bold text-white">{(analytics.overview?.totalVoters ?? 0).toLocaleString()}</p>
              {!analytics.overview?.totalVoters && (
                <p className="text-xs text-gray-500 mt-1">No voter data available</p>
              )}
            </div>
            <Users className="w-8 h-8 text-sky-400" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">+12.5%</span>
            <span className="text-gray-400 ml-2">vs last election</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Turnout Rate</p>
              <p className="text-2xl font-bold text-white">{(analytics.overview?.turnout ?? '—')}{typeof analytics.overview?.turnout === 'number' ? '%' : ''}</p>
              {analytics.overview?.turnout == null && (
                <p className="text-xs text-gray-500 mt-1">Turnout not available</p>
              )}
            </div>
            <Target className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">+8.2%</span>
            <span className="text-gray-400 ml-2">vs last election</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Valid Votes</p>
              <p className="text-2xl font-bold text-white">{(analytics.overview?.validVotes ?? 0).toLocaleString()}</p>
              {!analytics.overview?.validVotes && (
                <p className="text-xs text-gray-500 mt-1">No vote counts</p>
              )}
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-gray-400">98.9% valid</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Voters</p>
              <p className="text-2xl font-bold text-white">{analytics.realTimeMetrics?.activeVoters ?? 0}</p>
              {!analytics.realTimeMetrics?.activeVoters && (
                <p className="text-xs text-gray-500 mt-1">No real-time activity</p>
              )}
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-gray-400">{analytics.realTimeMetrics?.votesPerMinute ?? 0} votes/min</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voting Patterns by Hour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Voting Patterns by Hour</h3>
            <BarChart3 className="w-5 h-5 text-sky-400" />
          </div>
          <div className="space-y-3">
            {(analytics.votingPatterns?.byHour || []).length === 0 ? (
              <div className="text-center text-gray-500 py-6">No hourly voting data</div>
            ) : (
              (analytics.votingPatterns?.byHour || []).map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-16 text-sm text-gray-400">{item.hour}</div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-sky-400 h-2 rounded-full"
                        style={{ width: `${(item.votes / 180) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm text-white text-right">{item.votes}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Demographics by Faculty */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Voters by Faculty</h3>
            <PieChart className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-3">
            {(analytics.demographics?.byFaculty || []).length === 0 ? (
              <div className="text-center text-gray-500 py-6">No demographic data</div>
            ) : (
              (analytics.demographics?.byFaculty || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{
                        backgroundColor: [
                          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
                        ][index % 6]
                      }}
                    ></div>
                    <span className="text-gray-300 text-sm">{item.faculty}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{item.count}</div>
                    <div className="text-gray-400 text-xs">{item.percentage}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Candidate Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-6 rounded-xl border border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Candidate Performance</h3>
          <Award className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="space-y-4">
          {(analytics.candidatePerformance || []).length === 0 ? (
            <div className="text-center text-gray-500 py-6">No candidate performance data</div>
          ) : (
            (analytics.candidatePerformance || []).map((candidate, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{candidate.name}</div>
                    <div className="text-gray-400 text-sm">{candidate.position}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-white font-medium">{candidate.votes} votes</div>
                    <div className="text-gray-400 text-sm">{candidate.percentage}%</div>
                  </div>
                  <div className={`flex items-center text-sm ${
                    candidate.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${
                      candidate.trend === 'down' ? 'rotate-180' : 'rotate-0'
                    }`} />
                    {candidate.change}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Device and Location Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Voting by Device</h3>
            <div className="flex gap-2">
              <Monitor className="w-4 h-4 text-blue-400" />
              <Smartphone className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div className="space-y-4">
            {(analytics.votingPatterns?.byDevice || []).length === 0 ? (
              <div className="text-center text-gray-500 py-6">No device data</div>
            ) : (
              (analytics.votingPatterns?.byDevice || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                      {item.device === 'Desktop' ? (
                        <Monitor className="w-4 h-4 text-blue-400" />
                      ) : item.device === 'Mobile' ? (
                        <Smartphone className="w-4 h-4 text-green-400" />
                      ) : (
                        <Monitor className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <span className="text-gray-300">{item.device}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{item.count}</div>
                    <div className="text-gray-400 text-sm">{item.percentage}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Voting by Location</h3>
            <MapPin className="w-5 h-5 text-red-400" />
          </div>
          <div className="space-y-4">
            {(analytics.votingPatterns?.byLocation || []).length === 0 ? (
              <div className="text-center text-gray-500 py-6">No location data</div>
            ) : (
              (analytics.votingPatterns?.byLocation || []).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                      <MapPin className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-gray-300">{item.location}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{item.count}</div>
                    <div className="text-gray-400 text-sm">{item.percentage}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ElectionAnalytics;
