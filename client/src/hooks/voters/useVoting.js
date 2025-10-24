import { useState, useCallback } from 'react';
import { electionsAPI } from '../../services/api';

export const useVoting = () => {
  const [voterVotes, setVoterVotes] = useState({}); // Track which seats each voter has voted for
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const castVote = useCallback(async (voteData, candidates, elections) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if voter has already voted for a candidate in the same seat
      const selectedCandidate = candidates.find(c => c.id === voteData.candidateId);
      if (selectedCandidate) {
        const election = elections.find(e => e._id === voteData.electionId);
        if (election && election.voters && election.voters.includes(voteData.voterId)) {
          // Check if voter has voted for any candidate in the same seat
          const seatCandidates = candidates.filter(c => 
            c.electionId === voteData.electionId && 
            c.seat === selectedCandidate.seat
          );
          
          // Check if any candidate in this seat has been voted for by this voter
          const hasVotedInSeat = voterVotes[voteData.voterId] && voterVotes[voteData.voterId][selectedCandidate.seat];
          
          if (hasVotedInSeat) {
            throw new Error(`You have already voted for a candidate in the ${selectedCandidate.seat} position. You can only vote for one candidate per seat.`);
          }
        }
      }
      
      const voteResult = await electionsAPI.vote(voteData.electionId, {
        candidateId: voteData.candidateId,
        voterId: voteData.voterId,
        voteWeight: 1, // Always 1 vote per candidate
        seat: selectedCandidate?.seat // Include seat information for backend validation
      });
      
      // Update voter votes tracking
      if (selectedCandidate) {
        setVoterVotes(prev => ({
          ...prev,
          [voteData.voterId]: {
            ...prev[voteData.voterId],
            [selectedCandidate.seat]: {
              candidateId: voteData.candidateId,
              candidateName: selectedCandidate.name,
              timestamp: new Date().toISOString()
            }
          }
        }));
      }
      
      return voteResult;
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to cast vote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const hasVotedInSeat = useCallback((voterId, seat) => {
    return voterVotes[voterId] && voterVotes[voterId][seat];
  }, [voterVotes]);

  const getVotedCandidateInSeat = useCallback((voterId, seat) => {
    return voterVotes[voterId] && voterVotes[voterId][seat] ? voterVotes[voterId][seat] : null;
  }, [voterVotes]);

  const getVoterVotingStatus = useCallback((voterId) => {
    return voterVotes[voterId] || {};
  }, [voterVotes]);

  const clearVoterVotes = useCallback((voterId) => {
    setVoterVotes(prev => {
      const newVotes = { ...prev };
      delete newVotes[voterId];
      return newVotes;
    });
  }, []);

  return {
    voterVotes,
    loading,
    error,
    castVote,
    hasVotedInSeat,
    getVotedCandidateInSeat,
    getVoterVotingStatus,
    clearVoterVotes,
    setError
  };
};