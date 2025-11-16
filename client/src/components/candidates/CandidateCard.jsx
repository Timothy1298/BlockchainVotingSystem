import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Vote, Mail, Phone, Edit, Trash2, Lock, Info } from 'lucide-react';
import { useVotingContext } from '../../contexts/voters/VotingContext';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';

const CandidateCard = memo(({ candidate, index, onEdit, onDelete, onVote, onView }) => {
  const { hasVotedInSeat, getVotedCandidateInSeat } = useVotingContext();
  const { selectedAccount } = useMetaMaskContext();

  // Check if the selected voter has voted in this seat
  const currentVoterId = selectedAccount;
  const hasVotedInThisSeat = hasVotedInSeat(currentVoterId, candidate.seat);
  const votedCandidate = getVotedCandidateInSeat(currentVoterId, candidate.seat);
  const isVotedCandidate = votedCandidate && votedCandidate.candidateId === candidate.id;
  
  // Check if election settings lock candidate list
  const isCandidateListLocked = candidate.electionSettings?.lockCandidateList || false;
  const canAddCandidates = !isCandidateListLocked;

  const handleVote = () => {
    if (!canAddCandidates || hasVotedInThisSeat) {
      return; // Don't allow voting if candidate list is locked or already voted in this seat
    }
    onVote(candidate);
  };

  const handleEdit = () => {
    if (!canAddCandidates) {
      return; // Don't allow editing if candidate list is locked
    }
    onEdit(candidate);
  };

  const handleDelete = () => {
    if (!canAddCandidates) {
      return; // Don't allow deleting if candidate list is locked
    }
    onDelete(candidate);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-gray-900 rounded-lg p-4 border transition-colors flex flex-col h-full shadow-sm ${
        isCandidateListLocked 
          ? 'border-gray-700/40' 
          : 'border-gray-800 hover:border-gray-700'
      }`}
      role="article"
      aria-label={`Candidate ${candidate.name} for ${candidate.seat}`}
    >
      {/* Lock indicator */}
      {isCandidateListLocked && (
        <div className="flex items-center gap-1 mb-2 text-red-400 text-xs">
          <Lock className="w-3 h-3" />
          <span>Candidate list locked</span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          {candidate.photoUrl ? (
            <img
              src={candidate.photoUrl}
              alt={candidate.name}
              loading="lazy"
              decoding="async"
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <User className="w-6 h-6 text-white" style={{ display: candidate.photoUrl ? 'none' : 'flex' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate text-lg">{candidate.name}</h3>
          <p className="text-gray-300 text-sm truncate">{candidate.position || candidate.party || 'Independent'}</p>
          <p className="text-blue-300 text-xs truncate">{candidate.seat}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          <span className="truncate">{candidate.electionTitle}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Vote className="w-3 h-3" />
          <span>{candidate.votes || 0} votes</span>
        </div>
        
        {candidate.email && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Mail className="w-3 h-3" />
            <span className="truncate">{candidate.email}</span>
          </div>
        )}
        
        {candidate.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Phone className="w-3 h-3" />
            <span>{candidate.phone}</span>
          </div>
        )}
      </div>

      {candidate.bio && (
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{candidate.bio}</p>
      )}

      <div className="mt-auto space-y-3">
        {/* Neutral status */}
        <div className="text-xs text-gray-400">
          Status: <span className="text-white font-medium">{candidate.isActive ? 'Active' : 'Inactive'}</span>
          {candidate.verified ? <span className="ml-2 text-xs text-gray-300">• Verified</span> : null}
        </div>

        {/* Action Buttons: equal emphasis */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onView && onView(candidate)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm hover:bg-gray-800/90 transition-colors"
            aria-label={`View details for ${candidate.name}`}
          >
            <Info className="w-4 h-4 text-blue-300" />
            View Details
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onVote && onVote(candidate)}
            disabled={!canAddCandidates || hasVotedInThisSeat}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-700 bg-blue-700 text-white text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Select ${candidate.name} for ${candidate.seat}`}
          >
            <Vote className="w-4 h-4" />
            Select Candidate
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

CandidateCard.displayName = 'CandidateCard';

export default CandidateCard;
