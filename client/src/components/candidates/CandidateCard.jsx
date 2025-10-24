import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Calendar, Vote, Mail, Phone, Edit, Trash2, 
  CheckCircle, XCircle, Lock, AlertTriangle
} from 'lucide-react';
import { useVotingContext } from '../../contexts/voters/VotingContext';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';

const CandidateCard = memo(({ candidate, index, onEdit, onDelete, onVote }) => {
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
      className={`bg-gray-800 rounded-lg p-4 border transition-colors ${
        isCandidateListLocked 
          ? 'border-red-600/50 bg-red-900/10' 
          : 'border-gray-700 hover:border-gray-600'
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
          <h3 className="text-white font-semibold truncate">{candidate.name}</h3>
          <p className="text-gray-400 text-sm truncate">{candidate.party || 'Independent'}</p>
          <p className="text-blue-400 text-xs truncate">{candidate.seat}</p>
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

      <div className="space-y-3">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          candidate.isActive 
            ? 'bg-green-600/20 text-green-300' 
            : 'bg-red-600/20 text-red-300'
        }`}>
          {candidate.isActive ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          {candidate.isActive ? 'Active' : 'Inactive'}
        </div>
        
        {/* Vote Button - Different states based on voting status and lock status */}
        {!canAddCandidates ? (
          <motion.div
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-gray-400 rounded-lg font-medium cursor-not-allowed opacity-60"
            title="Voting is disabled - candidate list is locked"
          >
            <Lock className="w-5 h-5" />
            Voting Disabled
          </motion.div>
        ) : isVotedCandidate ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium"
          >
            <CheckCircle className="w-5 h-5" />
            Voted for {candidate.name.split(' ')[0]}
          </motion.div>
        ) : hasVotedInThisSeat ? (
          <motion.button
            disabled
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-gray-400 rounded-lg font-medium cursor-not-allowed opacity-60"
            aria-label={`Already voted in ${candidate.seat} position`}
          >
            <XCircle className="w-5 h-5" />
            Already voted in {candidate.seat}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVote}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
            aria-label={`Vote for ${candidate.name} for ${candidate.seat}`}
          >
            <Vote className="w-5 h-5" />
            Vote for {candidate.name.split(' ')[0]}
          </motion.button>
        )}
        
        {/* Voting Status Notice */}
        {!canAddCandidates ? (
          <div className="text-xs text-red-400 text-center">
            🔒 Candidate list is locked - voting disabled
          </div>
        ) : isVotedCandidate ? (
          <div className="text-xs text-green-400 text-center">
            ✅ You voted for this candidate
          </div>
        ) : hasVotedInThisSeat ? (
          <div className="text-xs text-red-400 text-center">
            ❌ You already voted for {votedCandidate?.candidateName} in this seat
          </div>
        ) : (
          <div className="text-xs text-gray-400 text-center">
            💡 You can only vote for one candidate per seat
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEdit}
            disabled={!canAddCandidates}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${
              canAddCandidates
                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-600/20'
                : 'text-gray-500 cursor-not-allowed opacity-50'
            }`}
            title={canAddCandidates ? "Edit candidate" : "Cannot edit - candidate list is locked"}
            aria-label={`Edit ${candidate.name}`}
          >
            <Edit className="w-4 h-4" />
            Edit
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            disabled={!canAddCandidates || candidate.votes > 0}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm ${
              canAddCandidates && candidate.votes === 0
                ? 'text-red-400 hover:text-red-300 hover:bg-red-600/20'
                : 'text-gray-500 cursor-not-allowed opacity-50'
            }`}
            title={
              !canAddCandidates 
                ? "Cannot delete - candidate list is locked"
                : candidate.votes > 0 
                  ? "Cannot delete candidate with votes"
                  : "Delete candidate"
            }
            aria-label={`Delete ${candidate.name}`}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

CandidateCard.displayName = 'CandidateCard';

export default CandidateCard;
