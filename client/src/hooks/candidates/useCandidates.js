import { useState, useEffect, useCallback } from 'react';
import { electionsAPI, clearCacheForUrl } from '../../services/api';

export const useCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all elections
      const electionsData = await electionsAPI.list();
      setElections(electionsData);
      
      // Fetch candidates from all elections
      const allCandidates = [];
      for (const election of electionsData) {
        try {
          const candidatesData = await electionsAPI.getCandidates(election._id);
          // Add election info to each candidate
          const candidatesWithElection = candidatesData.map(candidate => ({
            ...candidate,
            electionId: election._id,
            electionTitle: election.title,
            electionStatus: election.status,
            electionSettings: election.settings || {}
          }));
          allCandidates.push(...candidatesWithElection);
        } catch (err) {
          console.warn(`Failed to fetch candidates for election ${election._id}:`, err);
        }
      }
      
      setCandidates(allCandidates);
      return { candidates: allCandidates, elections: electionsData };
    } catch (err) {
      setError('Failed to fetch candidates data');
      console.error('Error fetching candidates data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addCandidate = useCallback(async (electionId, candidateData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await electionsAPI.addCandidate(electionId, candidateData);
      clearCacheForUrl('/elections');
      await fetchAllData();
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAllData]);

  const updateCandidate = useCallback(async (electionId, candidateId, candidateData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await electionsAPI.updateCandidate(electionId, candidateId, candidateData);
      await fetchAllData();
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAllData]);

  const deleteCandidate = useCallback(async (electionId, candidateId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await electionsAPI.deleteCandidate(electionId, candidateId);
      await fetchAllData();
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAllData]);

  const bulkImportCandidates = useCallback(async (electionId, candidatesData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await electionsAPI.bulkImportCandidates(electionId, candidatesData);
      await fetchAllData();
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to bulk import candidates');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAllData]);

  const getStatistics = useCallback(() => {
    const totalCandidates = candidates.length;
    const activeCandidates = candidates.filter(c => c.isActive).length;
    const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    const totalElections = elections.length;
    const activeElections = elections.filter(e => e.status === 'Open').length;
    
    return {
      totalCandidates,
      activeCandidates,
      totalVotes,
      totalElections,
      activeElections
    };
  }, [candidates, elections]);

  const getUniqueElections = useCallback(() => 
    [...new Set(candidates.map(c => ({ id: c.electionId, title: c.electionTitle })))], 
    [candidates]
  );

  const getUniqueSeats = useCallback(() => 
    [...new Set(candidates.map(c => c.seat))], 
    [candidates]
  );

  const getUniqueParties = useCallback(() => 
    [...new Set(candidates.map(c => c.party).filter(Boolean))], 
    [candidates]
  );

  return {
    candidates,
    elections,
    loading,
    error,
    fetchAllData,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    bulkImportCandidates,
    getStatistics,
    getUniqueElections,
    getUniqueSeats,
    getUniqueParties,
    setError
  };
};
