// Cards.jsx
// =====================================
// Reusable Card Components:
// - BaseCard: Generic container with hover + shadow animations
// - InfoCard: Displays an icon, title, subtitle (good for stats, info, dashboards)
// - ActionCard: Card with CTA button (good for actions like Vote, Connect, etc.)
//
// All use Tailwind + Framer Motion for smooth effects.
// =====================================

import React from 'react';
import { motion } from 'framer-motion';

// Base Card
export const BaseCard = ({ children, className = '' }) => (
  <motion.div
    // Core Styling: Dark gray background, subtle border, large shadow
    // Hover Effects: Slight scale, lift, and subtle blue shadow glow
    whileHover={{ scale: 1.03, y: -2, boxShadow: "0 8px 15px rgba(0, 0, 0, 0.4), 0 0 5px rgba(59, 130, 246, 0.3)" }}
    whileTap={{ scale: 0.99 }}
    className={`bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl shadow-black/50 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// Info Card
export const InfoCard = ({ icon: Icon, title, subtitle, className = '', highlightColor = 'text-sky-400' }) => (
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
);

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

// Example usage:
// <InfoCard icon={UserIcon} title="Total Votes" subtitle="1,245 cast" highlightColor="text-emerald-400" />
// <ActionCard title="Start Voting" description="Ready to secure your choice on the blockchain?" buttonText="Go to Dashboard" onClick={handleNavigate} />