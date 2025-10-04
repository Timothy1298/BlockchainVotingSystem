import React, { useEffect, useState, useContext } from 'react';
import  {DashboardLayout} from '../layouts/DashboardLayout';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { VotePieChart, VoteBarChart } from '../components/VoteCharts';

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get('/analytics');
        setAnalytics(res.data);
      } catch (err) {
        setError('Failed to fetch analytics data.');
        setAnalytics(null);
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold text-sky-400 mb-8 tracking-wide flex items-center gap-2">
          📈 Analytics & Reports
        </h2>
        {loading && <div className="text-sky-400 animate-pulse">Loading analytics...</div>}
        {error && <div className="text-red-400 mb-4">{error}</div>}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
              <h3 className="text-lg font-bold text-sky-300 mb-4">Votes by Candidate</h3>
              <VoteBarChart data={analytics.candidates || []} />
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
              <h3 className="text-lg font-bold text-sky-300 mb-4">Vote Share</h3>
              <VotePieChart data={analytics.candidates || []} />
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg col-span-1 md:col-span-2">
              <h3 className="text-lg font-bold text-sky-300 mb-4">Turnout Over Time</h3>
              {/* Placeholder for line graph */}
              <div className="bg-gray-700 rounded h-40 flex items-center justify-center text-gray-400">Line Graph</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg col-span-1 md:col-span-2">
              <h3 className="text-lg font-bold text-sky-300 mb-4">Regional Breakdown</h3>
              {/* Placeholder for heatmap/geo chart */}
              <div className="bg-gray-700 rounded h-40 flex items-center justify-center text-gray-400">Heatmap</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg col-span-1 md:col-span-2">
              <h3 className="text-lg font-bold text-sky-300 mb-4">Votes Per Minute</h3>
              {/* Placeholder for time-series graph */}
              <div className="bg-gray-700 rounded h-40 flex items-center justify-center text-gray-400">Time-Series Graph</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg col-span-1 md:col-span-2">
              <h3 className="text-lg font-bold text-sky-300 mb-4">Predictive Trends</h3>
              {/* Placeholder for AI analysis */}
              <div className="bg-gray-700 rounded h-40 flex items-center justify-center text-gray-400">AI Trend Analysis</div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
