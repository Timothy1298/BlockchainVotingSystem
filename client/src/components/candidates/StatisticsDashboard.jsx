import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, CheckCircle, Vote, Calendar, Activity 
} from 'lucide-react';

const StatisticsDashboard = memo(({ statistics }) => {
  const stats = [
    {
      icon: Users,
      label: 'Total Candidates',
      value: statistics.totalCandidates,
      color: 'text-blue-400',
      delay: 0
    },
    {
      icon: CheckCircle,
      label: 'Active',
      value: statistics.activeCandidates,
      color: 'text-green-400',
      delay: 0.1
    },
    {
      icon: Vote,
      label: 'Total Votes',
      value: statistics.totalVotes,
      color: 'text-purple-400',
      delay: 0.2
    },
    {
      icon: Calendar,
      label: 'Elections',
      value: statistics.totalElections,
      color: 'text-orange-400',
      delay: 0.3
    },
    {
      icon: Activity,
      label: 'Active Elections',
      value: statistics.activeElections,
      color: 'text-red-400',
      delay: 0.4
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: stat.delay }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          role="region"
          aria-label={`${stat.label} statistic`}
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} aria-hidden="true" />
            <span className="text-gray-300 text-sm">{stat.label}</span>
          </div>
          <div className="text-2xl font-bold text-white" aria-live="polite">
            {stat.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
});

StatisticsDashboard.displayName = 'StatisticsDashboard';

export default StatisticsDashboard;
