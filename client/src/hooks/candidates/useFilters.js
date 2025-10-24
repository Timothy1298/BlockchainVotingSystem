import { useState, useMemo, useCallback } from 'react';

export const useFilters = (candidates) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterElection, setFilterElection] = useState('');
  const [filterSeat, setFilterSeat] = useState('');
  const [filterParty, setFilterParty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.seat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.electionTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Election filter
    if (filterElection) {
      filtered = filtered.filter(candidate => candidate.electionId === filterElection);
    }

    // Seat filter
    if (filterSeat) {
      filtered = filtered.filter(candidate => candidate.seat === filterSeat);
    }

    // Party filter
    if (filterParty) {
      filtered = filtered.filter(candidate => candidate.party === filterParty);
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(candidate => 
        filterStatus === 'active' ? candidate.isActive : !candidate.isActive
      );
    }

    // Priority-based sorting (President first, then by hierarchy)
    const seatPriority = {
      'President': 1,
      'Vice President': 2,
      'Secretary': 3,
      'Treasurer': 4,
      'Academic Representative': 5,
      'Sports Representative': 6,
      'Cultural Representative': 7
    };

    // Sorting
    filtered.sort((a, b) => {
      // First sort by seat priority
      const aPriority = seatPriority[a.seat] || 999;
      const bPriority = seatPriority[b.seat] || 999;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Then by votes (descending) within the same seat
      const aVotes = a.votes || 0;
      const bVotes = b.votes || 0;
      
      if (aVotes !== bVotes) {
        return bVotes - aVotes;
      }
      
      // Finally by name alphabetically
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [candidates, searchTerm, filterElection, filterSeat, filterParty, filterStatus, sortBy, sortOrder]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterElection('');
    setFilterSeat('');
    setFilterParty('');
    setFilterStatus('');
    setSortBy('name');
    setSortOrder('asc');
  }, []);

  const setFilter = useCallback((filterType, value) => {
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'election':
        setFilterElection(value);
        break;
      case 'seat':
        setFilterSeat(value);
        break;
      case 'party':
        setFilterParty(value);
        break;
      case 'status':
        setFilterStatus(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
      case 'sortOrder':
        setSortOrder(value);
        break;
      default:
        break;
    }
  }, []);

  return {
    searchTerm,
    filterElection,
    filterSeat,
    filterParty,
    filterStatus,
    sortBy,
    sortOrder,
    filteredCandidates,
    setSearchTerm,
    setFilterElection,
    setFilterSeat,
    setFilterParty,
    setFilterStatus,
    setSortBy,
    setSortOrder,
    clearFilters,
    setFilter
  };
};
