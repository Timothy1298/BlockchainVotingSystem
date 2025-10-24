// CandidateCard.jsx
// =====================================
// Card component for displaying candidate info in the voting system
// Includes:
// - Candidate photo/avatar
// - Name, Party, Description
// - Animated hover effects
// - Vote button (action)
// =====================================

import React from 'react';
import { motion } from 'framer-motion';

const CandidateCard = ({ candidate, onVote, electionId, disabled = false, loading = false, onDelete }) => {
  // Determine if the candidate is missing an image
  const hasImage = candidate.image && candidate.image.length > 0;
  
  return (
    <motion.div
      // Card Styling: Dark background, strong border, and prominent shadow
      whileHover={{ scale: 1.05, y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.5), 0 0 5px rgba(59, 130, 246, 0.5)" }} // Scale, lift, and add a blue glow on hover
      whileTap={{ scale: 1.0 }} // Prevent excessive scale down on tap
      className="bg-gray-800 border border-gray-700 shadow-xl shadow-black/50 rounded-2xl p-6 flex flex-col items-center text-center gap-4 transition-all duration-300"
    >
      {/* Candidate Photo/Avatar */}
      {hasImage ? (
        <img
          src={candidate.image}
          alt={candidate.name}
          // Avatar Styling: Circular, prominent border color (sky-500 for theme)
          className="w-28 h-28 rounded-full object-cover border-4 border-sky-500 shadow-2xl shadow-sky-900/50"
          onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} // Fallback if image fails
        />
      ) : (
        // Placeholder Avatar
        <div className="w-28 h-28 rounded-full flex items-center justify-center border-4 border-gray-600 bg-gray-700 text-gray-400 text-4xl font-light">
            {candidate.name ? candidate.name[0] : 'U'}
        </div>
      )}
      

      {/* Name and Seat/Position */}
      <h3 className="text-2xl font-extrabold text-white tracking-wide mt-2">{candidate.name}</h3>
      {candidate.seat && (
        <div className="text-sm text-emerald-400 font-semibold bg-gray-700/50 px-3 py-1 rounded-full border border-emerald-600/50 mb-1">
          Seat: {candidate.seat}
        </div>
      )}
      
      {/* Party */}
      {candidate.party && (
        <p className="text-sm text-sky-400 font-medium bg-gray-700/50 px-3 py-1 rounded-full border border-sky-600/50">
            {candidate.party}
        </p>
      )}

      {/* Description - Subtle text */}
      {candidate.description && (
        <p className="text-sm text-gray-400 italic mb-2 max-h-16 overflow-hidden">
            {candidate.description}
        </p>
      )}
      
      {/* Votes (Display votes subtly if available) */}
      {candidate.votes !== undefined && (
          <p className="text-sm text-gray-500 mt-1">
              Current Votes: <span className="font-mono text-gray-400">{candidate.votes}</span>
          </p>
      )}

      <div className="flex flex-col gap-2 w-full mt-3">
        <motion.button
          whileHover={{ scale: (disabled || loading) ? 1 : 1.05 }}
          whileTap={{ scale: (disabled || loading) ? 1 : 0.95 }}
          onClick={() => !disabled && !loading && onVote?.(candidate, electionId)}
          disabled={disabled || loading}
          className={`w-full font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-200 shadow-lg ${
            disabled 
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed shadow-none' 
              : loading 
                  ? 'bg-sky-700 text-white cursor-wait shadow-sky-900/50' 
                  : 'bg-sky-500 text-white hover:bg-sky-400 shadow-sky-500/50 hover:shadow-sky-400/50'
          }`}
        >
          {loading ? (
              <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Casting Vote...
              </span>
          ) : disabled ? (
              'Already Voted'
          ) : (
              'Cast Your Vote'
          )}
        </motion.button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-full font-bold uppercase tracking-wider px-5 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white mt-1 transition-all duration-200 shadow-md"
          >
            Delete Candidate
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CandidateCard;

// Example usage:
// <CandidateCard candidate={{
//   name: ''John Doe',
//   party: 'Democratic Alliance',
//   description: 'Focused on education and innovation.',
//   image: '/avatars/john.jpg'
// }} onVote={(cand) => console.log('Voted for', cand)} />