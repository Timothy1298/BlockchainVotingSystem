// Voter Management Component (F.2.1) - Comprehensive Admin Interface

import React, { useState, useEffect, useContext, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, User, UserCheck, UserX, Search, Filter, CheckCircle, XCircle,
  AlertTriangle, Shield, Key, RotateCcw, Ban, LogOut, Upload,
  Download, Eye, Copy, ExternalLink, RefreshCw, Settings,
  Clock, Hash, Mail, Phone, MapPin, GraduationCap, IdCard,
  Activity, Lock, Unlock, AlertCircle, Plus, Edit, Trash2
} from 'lucide-react';
import { votersAPI, clearCacheForUrl } from '../../../services/api';
import { AuthContext } from '../../../contexts/auth';

const VoterManagement = memo(() => {
  const { user } = useContext(AuthContext);
  const [voters, setVoters] = useState([]);
  const [pendingVoters, setPendingVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [selectedVoters, setSelectedVoters] = useState([]);
  
  // Form states
  const [reason, setReason] = useState('');
  const [bulkAction, setBulkAction] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVoters, setTotalVoters] = useState(0);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('all');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchVoters();
      fetchPendingVoters();
    }
  }, [isAdmin, currentPage, searchTerm, filterStatus, filterFaculty]);


  const fetchVoters = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: filterStatus })
      };
      
      const data = await votersAPI.getAllVoters(params);
      setVoters(data.voters);
      setTotalPages(data.totalPages);
      setTotalVoters(data.total);
    } catch (err) {
      setError('Failed to fetch voters');
      console.error('Error fetching voters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingVoters = async () => {
    try {
      const data = await votersAPI.getPendingVerification();
      setPendingVoters(data);
    } catch (err) {
      console.error('Error fetching pending voters:', err);
    }
  };

  const filteredVoters = useMemo(() => {
    let filtered = voters;

    if (searchTerm) {
      filtered = filtered.filter(voter =>
        voter.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.nationalId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(voter => voter.eligibility === filterStatus);
    }

    if (filterFaculty) {
      filtered = filtered.filter(voter => voter.faculty === filterFaculty);
    }

    return filtered;
  }, [voters, searchTerm, filterStatus, filterFaculty]);

  const handleApproveVoter = async () => {
    try {
      setLoading(true);
      setError(null);
      await votersAPI.approve(selectedVoter.id, reason);
      setSuccess('Voter approved successfully');
      setShowApproveModal(false);
      setSelectedVoter(null);
      setReason('');
      clearCacheForUrl('/voters');
      fetchVoters();
      fetchPendingVoters();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve voter');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectVoter = async () => {
    try {
      setLoading(true);
      setError(null);
      await votersAPI.reject(selectedVoter.id, reason);
      setSuccess('Voter rejected successfully');
      setShowRejectModal(false);
      setSelectedVoter(null);
      setReason('');
      fetchVoters();
      fetchPendingVoters();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject voter');
    } finally {
      setLoading(false);
    }
  };

  const handleBlacklistVoter = async () => {
    try {
      setLoading(true);
      setError(null);
      await votersAPI.blacklist(selectedVoter.id, reason);
      setSuccess('Voter blacklisted successfully');
      setShowBlacklistModal(false);
      setSelectedVoter(null);
      setReason('');
      fetchVoters();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to blacklist voter');
    } finally {
      setLoading(false);
    }
  };

  const handleResetVoterAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      await votersAPI.resetAccess(selectedVoter.id, reason);
      setSuccess('Voter access reset successfully');
      setShowResetModal(false);
      setSelectedVoter(null);
      setReason('');
      fetchVoters();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset voter access');
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      await votersAPI.forceLogout(selectedVoter.id, reason);
      setSuccess('Voter session terminated successfully');
      setShowLogoutModal(false);
      setSelectedVoter(null);
      setReason('');
      fetchVoters();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to force logout');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await votersAPI.bulkManagement(bulkAction, selectedVoters, bulkReason);
      setSuccess(result.message);
      setShowBulkModal(false);
      setSelectedVoters([]);
      setBulkAction('');
      setBulkReason('');
      fetchVoters();
      fetchPendingVoters();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToken = async (voterId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await votersAPI.generateToken(voterId);
      setSuccess(`Token generated for ${result.voter.fullName}: ${result.token}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Eligible': return 'text-green-400 bg-green-600/20';
      case 'Already Voted': return 'text-blue-400 bg-blue-600/20';
      case 'Not Eligible': return 'text-red-400 bg-red-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Eligible': return <CheckCircle className="w-4 h-4" />;
      case 'Already Voted': return <Activity className="w-4 h-4" />;
      case 'Not Eligible': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getUniqueFaculties = () => [...new Set(voters.map(v => v.faculty).filter(Boolean))];

  const openModal = (modalType, voter) => {
    setSelectedVoter(voter);
    setReason('');
    setError(null);
    setSuccess(null);
    
    switch (modalType) {
      case 'approve':
        setShowApproveModal(true);
        break;
      case 'reject':
        setShowRejectModal(true);
        break;
      case 'blacklist':
        setShowBlacklistModal(true);
        break;
      case 'reset':
        setShowResetModal(true);
        break;
      case 'logout':
        setShowLogoutModal(true);
        break;
    }
  };

  const closeModals = () => {
    setShowApproveModal(false);
    setShowRejectModal(false);
    setShowBlacklistModal(false);
    setShowResetModal(false);
    setShowLogoutModal(false);
    setShowBulkModal(false);
    setSelectedVoter(null);
    setReason('');
    setBulkAction('');
    setBulkReason('');
    setError(null);
    setSuccess(null);
  };

  const toggleVoterSelection = (voterId) => {
    setSelectedVoters(prev => 
      prev.includes(voterId) 
        ? prev.filter(id => id !== voterId)
        : [...prev, voterId]
    );
  };

  const selectAllVoters = () => {
    const currentVoters = activeTab === 'pending' ? pendingVoters : filteredVoters;
    setSelectedVoters(currentVoters.map(v => v.id));
  };

  const clearSelection = () => {
    setSelectedVoters([]);
  };

  if (!isAdmin) {
    return (
      <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-400">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Admin Access Required</span>
        </div>
        <p className="text-red-300 text-sm mt-2">
          Only administrators can manage voters.
        </p>
      </div>
    );
  }

  const currentVoters = activeTab === 'pending' ? pendingVoters : filteredVoters;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Voter Management
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage voter registration, verification, and authentication
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-600/50 rounded-full">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Admin Access</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300 text-sm">Total Voters</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalVoters}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300 text-sm">Pending</span>
          </div>
          <div className="text-2xl font-bold text-white">{pendingVoters.length}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm">Eligible</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {voters.filter(v => v.eligibility === 'Eligible').length}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300 text-sm">Voted</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {voters.filter(v => v.eligibility === 'Already Voted').length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          All Voters ({totalVoters})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Pending Verification ({pendingVoters.length})
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search and Filters */}
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search voters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Eligible">Eligible</option>
              <option value="Already Voted">Already Voted</option>
              <option value="Not Eligible">Not Eligible</option>
            </select>
            
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Faculties</option>
              {getUniqueFaculties().map(faculty => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {selectedVoters.length > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Bulk Actions ({selectedVoters.length})
            </button>
          )}
          
          <button
            onClick={fetchVoters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Voters Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedVoters.length === currentVoters.length && currentVoters.length > 0}
                    onChange={selectedVoters.length === currentVoters.length ? clearSelection : selectAllVoters}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Voter</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">ID Numbers</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Registration</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentVoters.map((voter) => (
                <tr key={voter.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedVoters.includes(voter.id)}
                      onChange={() => toggleVoterSelection(voter.id)}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{voter.fullName}</div>
                        <div className="text-gray-400 text-sm">{voter.faculty || 'No faculty'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300">{voter.email}</span>
                      </div>
                      {voter.contact && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-300">{voter.contact}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {voter.studentId && (
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-300">{voter.studentId}</span>
                        </div>
                      )}
                      {voter.nationalId && (
                        <div className="flex items-center gap-2 text-sm">
                          <IdCard className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-300">{voter.nationalId}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(voter.eligibility)}`}>
                      {getStatusIcon(voter.eligibility)}
                      {voter.eligibility}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-300">
                      {voter.registrationDate ? new Date(voter.registrationDate).toLocaleDateString() : 'N/A'}
                    </div>
                    {voter.approvedBy && (
                      <div className="text-xs text-gray-400">
                        Approved by admin
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {activeTab === 'pending' && (
                        <>
                          <button
                            onClick={() => openModal('approve', voter)}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-600/20 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal('reject', voter)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleGenerateToken(voter.id)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-colors"
                        title="Generate Token"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => openModal('reset', voter)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/20 rounded-lg transition-colors"
                        title="Reset Access"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => openModal('blacklist', voter)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                        title="Blacklist"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => openModal('logout', voter)}
                        className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-600/20 rounded-lg transition-colors"
                        title="Force Logout"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {activeTab === 'all' && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalVoters)} of {totalVoters} voters
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-lg">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && selectedVoter && (
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
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Approve Voter</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-2">
                  Approve voter registration for:
                </p>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-white font-medium">{selectedVoter.fullName}</div>
                  <div className="text-gray-400 text-sm">{selectedVoter.email}</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Reason for approval..."
                  rows={3}
                />
              </div>

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
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveVoter}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedVoter && (
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
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex items-center gap-2 mb-4">
                <UserX className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Reject Voter</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-2">
                  Reject voter registration for:
                </p>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="text-white font-medium">{selectedVoter.fullName}</div>
                  <div className="text-gray-400 text-sm">{selectedVoter.email}</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Reason for rejection..."
                  rows={3}
                  required
                />
              </div>

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
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectVoter}
                  disabled={loading || !reason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Modal */}
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
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Bulk Actions</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 text-sm mb-2">
                  Perform action on {selectedVoters.length} selected voters:
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Action *
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select action</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="blacklist">Blacklist</option>
                  <option value="reset">Reset Access</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason
                </label>
                <textarea
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Reason for bulk action..."
                  rows={3}
                />
              </div>

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
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAction}
                  disabled={loading || !bulkAction}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Execute'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

VoterManagement.displayName = 'VoterManagement';

export default VoterManagement;
