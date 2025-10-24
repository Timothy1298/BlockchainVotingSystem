// Candidate Management Component (F.3.1) - Comprehensive Admin Interface

import React, { useState, useEffect, useContext, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Edit, Trash2, Upload, Download, Eye, 
  Lock, Unlock, Search, Filter, CheckCircle, XCircle,
  AlertTriangle, Hash, Building, User, FileText, Image,
  Copy, ExternalLink, RefreshCw, Settings, Shield
} from 'lucide-react';
import { electionsAPI, clearCacheForUrl } from '../../services/api';
import { AuthContext } from '../../../contexts/auth';

const CandidateManagement = memo(({ election, onElectionUpdate }) => {
  const { user } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Form states
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    seat: ',
    party: ',
    position: ',
    bio: ',
    manifesto: ',
    photoUrl: ',
    isActive: true
  });
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeat, setFilterSeat] = useState('');
  const [filterParty, setFilterParty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Bulk import states
  const [bulkData, setBulkData] = useState('');
  const [bulkResults, setBulkResults] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (election) {
      fetchCandidates();
    }
  }, [election]);


  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await electionsAPI.getCandidates(election._id);
      setCandidates(data);
    } catch (err) {
      setError('Failed to fetch candidates');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.seat.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSeat) {
      filtered = filtered.filter(candidate => candidate.seat === filterSeat);
    }

    if (filterParty) {
      filtered = filtered.filter(candidate => candidate.party === filterParty);
    }

    if (filterStatus) {
      filtered = filtered.filter(candidate => 
        filterStatus === 'active' ? candidate.isActive : !candidate.isActive
      );
    }

    return filtered;
  }, [candidates, searchTerm, filterSeat, filterParty, filterStatus]);

  const handleAddCandidate = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await electionsAPI.addCandidate(election._id, candidateForm);
      setSuccess('Candidate added successfully');
      onElectionUpdate?.(result.election);
      setShowAddModal(false);
      resetForm();
      clearCacheForUrl('/elections');
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCandidate = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await electionsAPI.updateCandidate(
        election._id, 
        selectedCandidate.id, 
        candidateForm
      );
      setSuccess('Candidate updated successfully');
      onElectionUpdate?.(result.election);
      setShowEditModal(false);
      setSelectedCandidate(null);
      resetForm();
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await electionsAPI.deleteCandidate(election._id, candidateId);
      setSuccess('Candidate deleted successfully');
      onElectionUpdate?.(result.election);
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Parse CSV data
      const lines = bulkData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const candidates = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const candidate = {};
        headers.forEach((header, index) => {
          candidate[header.toLowerCase()] = values[index] || ';
        });
        return candidate;
      });

      const result = await electionsAPI.bulkImportCandidates(election._id, candidates);
      setBulkResults(result.results);
      setSuccess(`Bulk import completed: ${result.results.successful.length} successful, ${result.results.failed.length} failed`);
      onElectionUpdate?.(result.election);
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to bulk import candidates');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCandidateForm({
      name: '',
      seat: ',
      party: ',
      position: ',
      bio: ',
      manifesto: ',
      photoUrl: ',
      isActive: true
    });
  };

  const openEditModal = (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateForm({
      name: candidate.name,
      seat: candidate.seat,
      party: candidate.party || ',
      position: candidate.position || ',
      bio: candidate.bio || ',
      manifesto: candidate.manifesto || ',
      photoUrl: candidate.photoUrl || ',
      isActive: candidate.isActive
    });
    setShowEditModal(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
  };

  const getUniqueSeats = () => [...new Set(candidates.map(c => c.seat))];
  const getUniqueParties = () => [...new Set(candidates.map(c => c.party).filter(Boolean))];

  if (!isAdmin) {
    return (
      <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-400">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Admin Access Required</span>
        </div>
        <p className="text-red-300 text-sm mt-2">
          Only administrators can manage candidates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Candidate Management
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage all candidates for {election?.title}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {election?.candidateListLocked ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-600/50 rounded-full">
              <Lock className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm font-medium">Locked</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-600/50 rounded-full">
              <Unlock className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Unlocked</span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300 text-sm">Total Candidates</span>
          </div>
          <div className="text-2xl font-bold text-white">{candidates.length}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm">Active</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {candidates.filter(c => c.isActive).length}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300 text-sm">Parties</span>
          </div>
          <div className="text-2xl font-bold text-white">{getUniqueParties().length}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-5 h-5 text-orange-400" />
            <span className="text-gray-300 text-sm">Seats</span>
          </div>
          <div className="text-2xl font-bold text-white">{getUniqueSeats().length}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search and Filters */}
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterSeat}
              onChange={(e) => setFilterSeat(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Seats</option>
              {getUniqueSeats().map(seat => (
                <option key={seat} value={seat}>{seat}</option>
              ))}
            </select>
            
            <select
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Parties</option>
              {getUniqueParties().map(party => (
                <option key={party} value={party}>{party}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            disabled={election?.candidateListLocked}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </button>
          
          <button
            onClick={() => setShowBulkModal(true)}
            disabled={election?.candidateListLocked}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ballot Preview
          </button>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Candidate</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Party</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Seat</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Blockchain ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Votes</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {candidate.photoUrl ? (
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">{candidate.name}</div>
                        {candidate.position && (
                          <div className="text-gray-400 text-sm">{candidate.position}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{candidate.party || 'Independent'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300">{candidate.seat}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-mono text-sm">
                        #{candidate.chainCandidateId}
                      </span>
                      <button
                        onClick={() => copyToClipboard(candidate.chainCandidateId.toString())}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
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
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{candidate.votes || 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(candidate)}
                        disabled={election?.candidateListLocked}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        disabled={election?.candidateListLocked || candidate.votes > 0}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Candidate Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Add Candidate</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm({...candidateForm, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Candidate name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Seat/Position *
                  </label>
                  <select
                    value={candidateForm.seat}
                    onChange={(e) => setCandidateForm({...candidateForm, seat: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select seat</option>
                    {election?.seats?.map(seat => (
                      <option key={seat} value={seat}>{seat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Party
                  </label>
                  <input
                    type="text"
                    value={candidateForm.party}
                    onChange={(e) => setCandidateForm({...candidateForm, party: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Political party"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    value={candidateForm.position}
                    onChange={(e) => setCandidateForm({...candidateForm, position: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Position title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    value={candidateForm.photoUrl}
                    onChange={(e) => setCandidateForm({...candidateForm, photoUrl: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={candidateForm.isActive}
                    onChange={(e) => setCandidateForm({...candidateForm, isActive: e.target.value === 'true'})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Biography
                </label>
                <textarea
                  value={candidateForm.bio}
                  onChange={(e) => setCandidateForm({...candidateForm, bio: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Candidate biography..."
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Manifesto
                </label>
                <textarea
                  value={candidateForm.manifesto}
                  onChange={(e) => setCandidateForm({...candidateForm, manifesto: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Candidate manifesto..."
                  rows={4}
                />
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-green-600/20 border border-green-600/50 rounded-lg text-green-300 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                    setError(null);
                    setSuccess(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCandidate}
                  disabled={loading || !candidateForm.name || !candidateForm.seat}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Candidate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Candidate Modal */}
      <AnimatePresence>
        {showEditModal && selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-2 mb-4">
                <Edit className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Edit Candidate</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm({...candidateForm, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Candidate name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Seat/Position *
                  </label>
                  <select
                    value={candidateForm.seat}
                    onChange={(e) => setCandidateForm({...candidateForm, seat: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select seat</option>
                    {election?.seats?.map(seat => (
                      <option key={seat} value={seat}>{seat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Party
                  </label>
                  <input
                    type="text"
                    value={candidateForm.party}
                    onChange={(e) => setCandidateForm({...candidateForm, party: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Political party"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    value={candidateForm.position}
                    onChange={(e) => setCandidateForm({...candidateForm, position: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Position title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    value={candidateForm.photoUrl}
                    onChange={(e) => setCandidateForm({...candidateForm, photoUrl: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={candidateForm.isActive}
                    onChange={(e) => setCandidateForm({...candidateForm, isActive: e.target.value === 'true'})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Biography
                </label>
                <textarea
                  value={candidateForm.bio}
                  onChange={(e) => setCandidateForm({...candidateForm, bio: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Candidate biography..."
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Manifesto
                </label>
                <textarea
                  value={candidateForm.manifesto}
                  onChange={(e) => setCandidateForm({...candidateForm, manifesto: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Candidate manifesto..."
                  rows={4}
                />
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-green-600/20 border border-green-600/50 rounded-lg text-green-300 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCandidate(null);
                    resetForm();
                    setError(null);
                    setSuccess(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCandidate}
                  disabled={loading || !candidateForm.name || !candidateForm.seat}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Candidate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Bulk Import Candidates</h3>
              </div>

              <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-300 text-sm font-medium mb-2">
                  <FileText className="w-4 h-4" />
                  CSV Format Instructions
                </div>
                <p className="text-blue-200 text-sm">
                  Enter candidate data in CSV format. First row should be headers: name, seat, party, position, bio, manifesto, photoUrl, isActive
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CSV Data
                </label>
                <textarea
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                  placeholder="name,seat,party,position,bio,manifesto,photoUrl,isActive&#10;John Doe,President,Democratic Party,President,Experienced leader,Progressive policies,https://example.com/john.jpg,true&#10;Jane Smith,President,Republican Party,President,Conservative values,Traditional approach,https://example.com/jane.jpg,true"
                  rows={10}
                />
              </div>

              {bulkResults && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Import Results</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-3">
                      <div className="text-green-300 text-sm font-medium mb-1">Successful ({bulkResults.successful.length})</div>
                      <div className="text-green-200 text-xs">
                        {bulkResults.successful.map((candidate, index) => (
                          <div key={index}>{candidate.name} - {candidate.seat}</div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3">
                      <div className="text-red-300 text-sm font-medium mb-1">Failed ({bulkResults.failed.length})</div>
                      <div className="text-red-200 text-xs">
                        {bulkResults.failed.map((item, index) => (
                          <div key={index}>{item.candidate.name}: {item.error}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-green-600/20 border border-green-600/50 rounded-lg text-green-300 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkData(');
                    setBulkResults(null);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  disabled={loading || !bulkData.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Importing...' : 'Import Candidates'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ballot Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Ballot Preview</h3>
              </div>

              <div className="space-y-6">
                {getUniqueSeats().map(seat => {
                  const seatCandidates = candidates.filter(c => c.seat === seat && c.isActive);
                  return (
                    <div key={seat} className="bg-gray-700/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-4">{seat}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {seatCandidates.map(candidate => (
                          <div key={candidate.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                            <div className="flex items-center gap-3 mb-3">
                              {candidate.photoUrl ? (
                                <img
                                  src={candidate.photoUrl}
                                  alt={candidate.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-gray-300" />
                                </div>
                              )}
                              <div>
                                <div className="text-white font-medium">{candidate.name}</div>
                                <div className="text-gray-400 text-sm">{candidate.party || 'Independent'}</div>
                              </div>
                            </div>
                            {candidate.bio && (
                              <p className="text-gray-300 text-sm mb-2">{candidate.bio}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Hash className="w-3 h-3" />
                              Blockchain ID: {candidate.chainCandidateId}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CandidateManagement.displayName = 'CandidateManagement';

export default CandidateManagement;
