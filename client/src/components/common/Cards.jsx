// Cards.jsx
// =====================================
// Reusable Card Components:
// - BaseCard: Generic container with hover + shadow animations
// - InfoCard: Displays an icon, title, subtitle (good for stats, info, dashboards)
// - ActionCard: Card with CTA button (good for actions like Vote, Connect, etc.)
// - StatCard: For displaying statistics with trends
// - StatusCard: For displaying status information
// - MetricCard: For displaying key metrics
//
// All use Tailwind + Framer Motion for smooth effects.
// =====================================

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Users, Vote, Zap, Lock } from 'lucide-react';

// Base Card
export const BaseCard = memo(({ children, className = '' }) => (
  <motion.div
    // Core Styling: Dark gray background, subtle border, large shadow
    // Hover Effects: Slight scale, lift, and subtle blue shadow glow
    whileHover={{ scale: 1.03, y: -2, boxShadow: "0 8px 15px rgba(0, 0, 0, 0.4), 0 0 5px rgba(59, 130, 246, 0.3)" }}
    whileTap={{ scale: 0.99 }}
    className={`bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl shadow-black/50 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
));

BaseCard.displayName = 'BaseCard';

// Info Card
export const InfoCard = memo(({ icon: Icon, title, subtitle, className = '', highlightColor = 'text-sky-400' }) => (
  // Info Card inherits BaseCard styling
  <BaseCard className={`flex items-center gap-4 ${className}`}>
    {/* Icon: Large size, uses a theme-specific highlight color */}
    {Icon && (
      <div className={`p-3 rounded-full bg-sky-900/40 ${highlightColor}`}>
        <Icon className="w-8 h-8" />
      </div>
    )}
    <div>
      {/* Title: Strong contrast */}
      <h3 className="text-xl font-extrabold text-white tracking-wide">{title}</h3>
      {/* Subtitle: Subtle text */}
      <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
  </BaseCard>
));

InfoCard.displayName = 'InfoCard';

// Action Card
export const ActionCard = ({ title, description, buttonText, onClick, className = '', disabled = false }) => (
  // Action Card inherits BaseCard styling
  <BaseCard className={`flex flex-col gap-4 ${className}`}>
    {/* Title: Prominent, uses theme highlight color */}
    <h3 className="text-2xl font-bold text-sky-400">{title}</h3>
    {/* Description: Subtle text */}
    <p className="text-md text-gray-300">{description}</p>
    {/* Button: Styled as a strong CTA (Emerald for positive action) */}
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-5 py-3 mt-4 rounded-xl text-white font-bold uppercase tracking-wider transition-all duration-200 shadow-lg ${
        disabled 
          ? 'bg-gray-600 cursor-not-allowed shadow-none' 
          : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'
      }`}
    >
      {buttonText}
    </motion.button>
  </BaseCard>
);

// Stat Card with trend indicator
export const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  className = '', 
  highlightColor = 'text-sky-400' 
}) => {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : null;
  const trendColor = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400';

  return (
    <BaseCard className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className={`p-3 rounded-full bg-sky-900/40 ${highlightColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
        {TrendIcon && trendValue && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{trendValue}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-gray-400">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </BaseCard>
  );
};

// Status Card
export const StatusCard = ({ 
  status, 
  title, 
  description, 
  icon: Icon, 
  className = '' 
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'success':
      case 'active':
      case 'completed':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500/30',
          icon: CheckCircle
        };
      case 'warning':
      case 'pending':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500/30',
          icon: Clock
        };
      case 'error':
      case 'inactive':
      case 'failed':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/30',
          icon: AlertCircle
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-500/30',
          icon: Icon || Clock
        };
    }
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  return (
    <BaseCard className={`${config.bgColor} ${config.borderColor} border ${className}`}>
      <div className="flex items-center gap-3">
        <StatusIcon className={`w-6 h-6 ${config.color}`} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bgColor} ${config.color} border ${config.borderColor}`}>
          {status.toUpperCase()}
        </span>
      </div>
    </BaseCard>
  );
};

// Metric Card
export const MetricCard = ({ 
  title, 
  value, 
  unit, 
  description, 
  icon: Icon, 
  className = '',
  highlightColor = 'text-sky-400'
}) => (
  <BaseCard className={`text-center ${className}`}>
    {Icon && (
      <div className={`inline-flex p-3 rounded-full bg-sky-900/40 ${highlightColor} mb-4`}>
        <Icon className="w-8 h-8" />
      </div>
    )}
    <div className="mb-2">
      <span className="text-3xl font-bold text-white">{value}</span>
      {unit && <span className="text-lg text-gray-400 ml-1">{unit}</span>}
    </div>
    <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-400">{description}</p>}
  </BaseCard>
);

// Election Card
export const ElectionCard = memo(({ 
  election, 
  onVote, 
  onView, 
  onManage, 
  className = '' 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'Setup': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'Closed': return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
      case 'Finalized': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const statusConfig = getStatusColor(election.status);

  return (
    <BaseCard className={`${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{election.title}</h3>
          <p className="text-gray-400 text-sm mb-3">{election.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Type: {election.electionType}</span>
            <span>•</span>
            <span>{election.candidates?.length || 0} candidates</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusConfig}`}>
            {election.status}
          </span>
          {election.candidateListLocked && (
            <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-900/20 px-2 py-1 rounded-full border border-amber-500/30">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm text-gray-400">
          <div>Start: {election.startsAt ? new Date(election.startsAt).toLocaleDateString() : 'Not set'}</div>
          <div>End: {election.endsAt ? new Date(election.endsAt).toLocaleDateString() : 'Not set'}</div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {onView && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onView(election)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors font-medium"
            >
              View
            </motion.button>
          )}
          {onVote && election.status === 'Open' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onVote(election)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm transition-colors font-medium"
            >
              Vote
            </motion.button>
          )}
          {onManage && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onManage(election)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition-colors font-medium"
            >
              Manage
            </motion.button>
          )}
        </div>
      </div>
    </BaseCard>
  );
});

ElectionCard.displayName = 'ElectionCard';

// Example usage:
// <InfoCard icon={UserIcon} title="Total Votes" subtitle="1,245 cast" highlightColor="text-emerald-400" />
// <ActionCard title="Start Voting" description="Ready to secure your choice on the blockchain?" buttonText="Go to Dashboard" onClick={handleNavigate} />
// <StatCard icon={Users} title="Total Voters" value="1,245" trend="up" trendValue="12" />
// <StatusCard status="active" title="System Online" description="All services running normally" />
// <MetricCard icon={Vote} title="Vote Count" value="1,245" unit="votes" description="Total votes cast" />
// <ElectionCard election={electionData} onVote={handleVote} onView={handleView} onManage={handleManage} />