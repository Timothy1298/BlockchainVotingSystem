import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, CheckCircle, Vote, Calendar, Activity, AlertTriangle
} from 'lucide-react';

const StatisticsDashboard = memo(({ statistics, onOpenAudit }) => {
  // Build a list of small stat tiles for top row
  const tiles = [
    { icon: Users, label: 'Total Candidates', value: statistics.totalCandidates, color: 'text-blue-400', delay: 0 },
    { icon: CheckCircle, label: 'Approved', value: statistics.approvedCandidates, color: 'text-green-400', delay: 0.05 },
    { icon: AlertTriangle, label: 'Pending Verifications', value: statistics.pendingCandidates, color: 'text-yellow-400', delay: 0.1 },
    { icon: Activity, label: 'Total Elections', value: statistics.totalElections, color: 'text-orange-400', delay: 0.15 },
    { icon: Vote, label: 'Total Votes', value: statistics.totalVotes, color: 'text-purple-400', delay: 0.2 }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {tiles.map(t => (
          <motion.div key={t.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: t.delay }} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <t.icon className={`${t.color} w-5 h-5`} aria-hidden="true" />
              <div className="text-gray-300 text-sm">{t.label}</div>
            </div>
            <div className="text-2xl font-bold text-white">{t.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Positions contested breakdown */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-300 font-semibold">Positions Contested</div>
          <div className="text-gray-400 text-sm">Total: {Object.values(statistics.positions || {}).reduce((s,v)=>s+v,0)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(statistics.positions || {}).map(([seat, count]) => (
            <div key={seat} className="px-3 py-1 bg-gray-900 text-sm text-white rounded-full border border-gray-700">{seat} — {count}</div>
          ))}
          {Object.keys(statistics.positions || {}).length === 0 && <div className="text-gray-500">No positions available</div>}
        </div>
      </div>

      {/* Disqualified / Inactive list (audit) */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-gray-300 font-semibold mb-2">Disqualified / Inactive Candidates</div>
        {statistics.disqualified && statistics.disqualified.length > 0 ? (
          <ul className="space-y-2 text-sm text-gray-300">
            {statistics.disqualified.map(d => (
              <li key={d.id} className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-white">{d.name}</div>
                  <div className="text-xs text-gray-400">{d.seat} {d.reason ? `— ${d.reason}` : ''}</div>
                </div>
                <div className="text-xs text-gray-500">
                  <button onClick={() => onOpenAudit && onOpenAudit(d)} className="text-sm text-blue-400 hover:underline">Audit</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500">No disqualified candidates</div>
        )}
      </div>
    </div>
  );
});

StatisticsDashboard.displayName = 'StatisticsDashboard';

export default StatisticsDashboard;
