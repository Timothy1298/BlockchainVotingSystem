// ElectionCard.jsx
// =====================================
// Card component for displaying election overview
// Includes:
// - Election title, description, dates
// - Animated hover effect
// - Button to view details / candidates
// =====================================

import React from 'react';
import { motion } from 'framer-motion';

const ElectionCard = ({ election, onView }) => {
  // Helper to format date strings nicely (assuming standard JS Date format or ISO string)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateString; // Return original if parsing fails
    }
  };

  const formattedStartDate = formatDate(election.startDate);
  const formattedEndDate = formatDate(election.endDate);

  // Determine election status based on dates (basic check)
  const now = new Date();
  const start = election.startDate ? new Date(election.startDate) : null;
  const end = election.endDate ? new Date(election.endDate) : null;
  const isOngoing = start && end && now >= start && now <= end;
  const isUpcoming = start && now < start;
  const isEnded = end && now > end;

  // Status badge styling
  const statusBadge = isOngoing 
    ? { text: 'Live', color: 'bg-emerald-600' } 
    : isEnded 
        ? { text: 'Concluded', color: 'bg-red-600' } 
        : { text: 'Upcoming', color: 'bg-yellow-600' };

  return (
    <motion.div
      // Card Styling: Dark background, subtle border, strong shadow
      whileHover={{ scale: 1.03, y: -3, boxShadow: "0 8px 15px rgba(0, 0, 0, 0.5), 0 0 5px rgba(59, 130, 246, 0.3)" }}
      whileTap={{ scale: 0.99 }}
      className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl shadow-black/50 flex flex-col gap-4 transition-all duration-300"
    >
      
      <div className="flex justify-between items-start">
        {/* Title */}
        <h2 className="text-2xl font-extrabold text-sky-400 tracking-wide">
            {election.title}
        </h2>
        
        {/* Status Badge */}
        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${statusBadge.color} text-white`}>
            {statusBadge.text}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 flex-1">{election.description || 'No description provided.'}</p>
      
      {/* Dates/Timeframe */}
      <div className="border-t border-gray-700 pt-3">
        <p className="text-xs text-gray-500 font-mono flex justify-between">
            <span className="font-semibold text-gray-400">Starts:</span> {formattedStartDate}
        </p>
        <p className="text-xs text-gray-500 font-mono flex justify-between mt-1">
            <span className="font-semibold text-gray-400">Ends:</span> {formattedEndDate}
        </p>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onView(election)}
        // Button Styling: Prominent blue, high contrast
        className="self-stretch mt-3 px-5 py-3 rounded-xl bg-sky-600 text-white font-bold uppercase tracking-wider shadow-lg shadow-sky-900/50 hover:bg-sky-500 transition"
      >
        View Candidates
      </motion.button>
    </motion.div>
  );
};

export default ElectionCard;