import React, { useEffect, useState, useRef } from 'react';
import { getMetrics, getBlockchainStatus } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const parsePrometheusText = (text) => {
  // Parse exposition format lines like: my_metric 123
  const lines = (text || '').split('\n');
  const metrics = {};
  for (const l of lines) {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parseFloat(parts[1]);
      if (!Number.isNaN(val)) metrics[key] = val;
    }
  }
  return metrics;
};

const metricCandidates = [
  'events_processed_total',
  'events_processed',
  'events_total'
];

const LiveSyncStatus = () => {
  const [metricsRaw, setMetricsRaw] = useState({});
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const mounted = useRef(true);

  const extractEventsCount = (parsed) => {
    for (const k of metricCandidates) if (parsed[k] !== undefined) return parsed[k];
    // fallback: find first metric with 'events' in the name
    const matchKey = Object.keys(parsed).find(x => x.toLowerCase().includes('event'));
    return matchKey ? parsed[matchKey] : null;
  };

  const load = async () => {
    try {
      const mTxt = await getMetrics();
      const parsed = parsePrometheusText(mTxt || '');
      if (!mounted.current) return;
      setMetricsRaw(parsed);
      const events = extractEventsCount(parsed) || 0;
      setHistory(h => [...(h.slice(-19)), events]);
    } catch (err) {
      if (!mounted.current) return;
      setMetricsRaw({});
    }

    try {
      const st = await getBlockchainStatus();
      if (!mounted.current) return;
      setChain(st || null);
    } catch (err) {
      if (!mounted.current) return;
      setChain(null);
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    load();
    const iv = setInterval(load, 15000);
    return () => { mounted.current = false; clearInterval(iv); };
  }, []);

  const latestEvents = history.length ? history[history.length - 1] : null;
  const latestBlock = chain?.blockNumber ?? null;

  // build chart data: events and last processed block (scaled to same chart or separate axis)
  const chartData = {
    labels: history.map((_, i) => `${(history.length - i - 1) * 15}s`), // relative age in seconds (approx)
    datasets: [
      {
        label: 'Events processed',
        data: history,
        yAxisID: 'y',
        borderColor: 'rgba(56,189,248,0.95)',
        backgroundColor: 'rgba(56,189,248,0.18)',
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      {
        label: 'Last processed block',
        data: history.map(() => latestBlock || null),
        yAxisID: 'y1',
        borderColor: 'rgba(34,197,94,0.95)',
        backgroundColor: 'rgba(34,197,94,0.12)',
        borderDash: [4,4],
        tension: 0.2,
        pointRadius: 1,
      }
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: true, labels: { color: '#9ca3af' } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { display: true, title: { display: true, text: 'Samples (older → newer)', color: '#9ca3af' }, ticks: { color: '#9ca3af' } },
      y: { display: true, position: 'left', title: { display: true, text: 'Events processed', color: '#9ca3af' }, ticks: { color: '#9ca3af' } },
      y1: { display: true, position: 'right', title: { display: true, text: 'Block number', color: '#9ca3af' }, ticks: { color: '#9ca3af' }, grid: { drawOnChartArea: false } }
    },
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
      <h4 className="text-sky-400 font-bold mb-2">Live Blockchain Sync</h4>
      {loading ? (
        <div className="text-gray-400">Loading sync status...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-300">
          <div>
            <div className="text-xs text-gray-400">Last Processed Block</div>
            <div className="font-mono text-lg">{chain?.blockNumber ?? chain?.blocks ?? 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Events Processed (total)</div>
            <div className="font-mono text-lg">{latestEvents ?? extractEventsCount(metricsRaw) ?? 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Listener Health</div>
            <div className={`font-bold ${chain?.nodes > 0 ? 'text-emerald-400' : 'text-yellow-300'}`}>{chain ? (chain.nodes > 0 ? 'OK' : 'Degraded') : 'Unknown'}</div>
          </div>
          <div className="sm:col-span-3 mt-3 h-28">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSyncStatus;
