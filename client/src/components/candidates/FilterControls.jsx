import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, Upload, Eye, Download, RefreshCw, LayoutList, LayoutGrid 
} from 'lucide-react';
import { useFilters } from '../../hooks/candidates';
import { useGlobalUI } from '../../components/common';

const FilterControls = memo(({ 
  candidates, 
  elections, 
  onRefresh, 
  onExport,
  viewMode = 'table',
  onToggleView
}) => {
  const {
    searchTerm,
    filterElection,
    filterSeat,
    filterParty,
    filterStatus,
    sortBy,
    sortOrder,
    setSearchTerm,
    setFilterElection,
    setFilterSeat,
    setFilterParty,
    setFilterStatus,
    setSortBy,
    setSortOrder,
    clearFilters
  } = useFilters(candidates);

  const { openModal } = useGlobalUI();

  const getUniqueElections = () => {
    const electionMap = new Map();
    candidates.forEach(c => {
      if (!electionMap.has(c.electionId)) {
        electionMap.set(c.electionId, { id: c.electionId, title: c.electionTitle });
      }
    });
    return Array.from(electionMap.values());
  };
  const getUniqueSeats = () => [...new Set(candidates.map(c => c.seat))];
  const getUniqueParties = () => [...new Set(candidates.map(c => c.party).filter(Boolean))];

  const handleExport = () => {
    const csvData = candidates.map(c => 
      `${c.name},${c.seat},${c.party},${c.electionTitle},${c.votes || 0},${c.isActive}`
    ).join('\n');
    const headers = 'Name,Seat,Party,Election,Votes,Active\n';
    const blob = new Blob([headers + csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    onExport('Candidates exported successfully');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search and Filters */}
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search candidates, parties, elections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search candidates"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <select
              value={filterElection}
              onChange={(e) => setFilterElection(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by election"
            >
              <option value="">All Elections</option>
              {getUniqueElections().map(election => (
                <option key={election.id} value={election.id}>{election.title}</option>
              ))}
            </select>
            
            <select
              value={filterSeat}
              onChange={(e) => setFilterSeat(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by seat"
            >
              <option value="">All Seats</option>
              {getUniqueSeats().map(seat => (
                <option key={seat} value={seat}>{seat}</option>
              ))}
            </select>
            
            <select
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by party"
            >
              <option value="">All Parties</option>
              {getUniqueParties().map(party => (
                <option key={party} value={party}>{party}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              aria-label="Sort by"
            >
              <option value="name">Sort by Name</option>
              <option value="votes">Sort by Votes</option>
              <option value="seat">Sort by Seat</option>
              <option value="party">Sort by Party</option>
              <option value="electionTitle">Sort by Election</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              aria-label="Sort order"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              aria-label="Clear all filters"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 mr-2">
            <button title="Cards view" onClick={() => onToggleView && onToggleView('cards')} className={`p-2 rounded ${viewMode === 'cards' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              <LayoutGrid className="w-4 h-4 text-white" />
            </button>
            <button title="Table view" onClick={() => onToggleView && onToggleView('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              <LayoutList className="w-4 h-4 text-white" />
            </button>
          </div>

          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal('showAddModal')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Add new candidate"
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal('showBulkModal')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            aria-label="Bulk import candidates"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal('showPreviewModal')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            aria-label="Preview candidates"
          >
            <Eye className="w-4 h-4" />
            Preview
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            aria-label="Export candidates to CSV"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
        </div>
      </div>
    </div>
  );
});

FilterControls.displayName = 'FilterControls';

export default FilterControls;
