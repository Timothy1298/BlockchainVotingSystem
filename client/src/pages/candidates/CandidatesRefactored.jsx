import React, { memo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, AlertTriangle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { AuthContext } from '../../contexts/auth';
import { useGlobalUI } from '../../components/common';

// Context Providers
import { CandidatesProvider } from '../../contexts/candidates';
import { VotingProvider } from '../../contexts/voters';
import { MetaMaskProvider } from '../../contexts/blockchain';
import { UIProvider } from '../../contexts/ui';

// Components
import { ErrorBoundary } from '../../components/common';
import { 
  CandidateCardSkeleton, 
  StatisticsSkeleton, 
  BlockchainAccountsSkeleton,
  FilterControlsSkeleton,
  LoadingOverlay 
} from '../../components/ui/feedback';
import StatisticsDashboard from '../../components/candidates/StatisticsDashboard';
import FilterControls from '../../components/candidates/FilterControls';
import MetaMaskAccounts from '../../components/candidates/MetaMaskAccounts';
import CandidateCard from '../../components/candidates/CandidateCard';
import CandidateTable from '../../components/candidates/CandidateTable';
import CandidateForm from '../../components/candidates/CandidateForm';
import VotingModal from '../../components/candidates/VotingModal';    
import RejectCandidateModal from '../../components/candidates/RejectCandidateModal';
import AuditViewer from '../../components/audit/AuditViewer';

// Hooks
import { useFilters } from '../../hooks/candidates';
import { useCandidatesContext } from '../../contexts/candidates';
import { useVotingContext } from '../../contexts/voters';
import { useMetaMaskContext } from '../../contexts/blockchain';

// Inner component that uses all the contexts
const CandidatesContent = memo(() => {
  const { user } = React.useContext(AuthContext); 
  const { showLoader, hideLoader, showToast } = useGlobalUI();
  
  // Context hooks
  const {
    candidates,
    elections,
    loading: candidatesLoading,
    error: candidatesError,
    fetchAllData,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    bulkImportCandidates,
    getStatistics,
    setError: setCandidatesError
  } = useCandidatesContext();

  const {
    castVote,
    loading: votingLoading,
    error: votingError,
    setError: setVotingError
  } = useVotingContext();

  const { selectedAccount } = useMetaMaskContext();

  const {
    modals,
    selectedCandidate,
    selectedElection,
    success,
    error,
    openModal,
    closeModal,
    closeAllModals,
    setSelectedCandidate,
    setSelectedElection,
    showSuccess,
    showError,
    clearMessages
  } = useGlobalUI();

  // Local state
  const [formData, setFormData] = useState({
    name: '',
    seat: '',
    party: '',
    position: '',
    bio: '',
    manifesto: '',
    photoUrl: '',
    email: '',
    phone: '',
    age: '',
    isActive: true
  });

  const [bulkData, setBulkData] = useState('');
  const [bulkResults, setBulkResults] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingCandidate, setRejectingCandidate] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditCandidate, setAuditCandidate] = useState(null);
  const [seatOrderMode, setSeatOrderMode] = useState('alphabetical'); // 'alphabetical' | 'presidentFirst' | 'custom'
  const [customSeatOrder, setCustomSeatOrder] = useState(''); // comma-separated seat names for custom ordering
  const [collapsedSeats, setCollapsedSeats] = useState(() => ({})); // { [seatName]: true }
  const tocRef = useRef(null);
  // Filters
  const { filteredCandidates } = useFilters(candidates);

  // Group candidates by seat for card view for easier voting per-seat
  const groupedCandidates = React.useMemo(() => {
    const map = new Map();
    (filteredCandidates || []).forEach(c => {
      const seat = c.seat || 'Unspecified';
      if (!map.has(seat)) map.set(seat, []);
      map.get(seat).push(c);
    });

    // Convert map to array for sorting
    let entries = Array.from(map.entries());

    // Helper: apply ordering modes
    const normalize = (s) => String(s || '').trim();

    if (seatOrderMode === 'presidentFirst') {
      entries.sort((a, b) => {
        const aKey = normalize(a[0]).toLowerCase();
        const bKey = normalize(b[0]).toLowerCase();
        if (aKey === 'president' && bKey !== 'president') return -1;
        if (bKey === 'president' && aKey !== 'president') return 1;
        return aKey.localeCompare(bKey);
      });
    } else if (seatOrderMode === 'custom' && customSeatOrder.trim()) {
      const custom = customSeatOrder.split(',').map(s => normalize(s).toLowerCase()).filter(Boolean);
      const indexOf = (name) => {
        const i = custom.indexOf(normalize(name).toLowerCase());
        return i === -1 ? Number.MAX_SAFE_INTEGER : i;
      };
      entries.sort((a, b) => {
        const ia = indexOf(a[0]);
        const ib = indexOf(b[0]);
        if (ia !== ib) return ia - ib;
        return String(a[0]).localeCompare(String(b[0]));
      });
    } else {
      // Default alphabetical
      entries.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    }

    return entries;
  }, [filteredCandidates, seatOrderMode, customSeatOrder]);

  // Utilities for TOC and collapsing
  const scrollToSeat = (seat) => {
    const id = `seat-${encodeURIComponent(seat)}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleCollapse = (seat) => {
    setCollapsedSeats(prev => ({ ...prev, [seat]: !prev[seat] }));
  };

  const expandAll = () => {
    const next = {};
    groupedCandidates.forEach(([seat]) => { next[seat] = false; });
    setCollapsedSeats(next);
  };

  const collapseAll = () => {
    const next = {};
    groupedCandidates.forEach(([seat]) => { next[seat] = true; });
    setCollapsedSeats(next);
  };

  const isAdmin = user?.role === 'admin';

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        showLoader('Loading candidates and elections...');
        await fetchAllData();
        showToast('Data loaded successfully', 'success');
      } catch (error) {
        showError('Failed to load data');
      } finally {
        hideLoader();
      }
    };

    loadData();
  }, [fetchAllData, showLoader, hideLoader, showToast, showError]);

  // Handle candidate operations
  const handleAddCandidate = async (candidateData) => {
    if (!selectedElection) {
      showError('Please select an election first');
      return;
    }

    try {
      await addCandidate(selectedElection._id, candidateData);
      showSuccess('Candidate added successfully');
      closeModal('showAddModal');
      resetForm();
    } catch (error) {
      showError(error.message || 'Failed to add candidate');
    }
  };

  const handleUpdateCandidate = async (candidateData) => {
    try {
      await updateCandidate(
        selectedCandidate.electionId,
        selectedCandidate.id,
        candidateData
      );
      showSuccess('Candidate updated successfully');
      closeModal('showEditModal');
      setSelectedCandidate(null);
      resetForm();
    } catch (error) {
      showError(error.message || 'Failed to update candidate');
    }
  };

  const handleDeleteCandidate = async (candidate) => {
    if (!window.confirm(`Are you sure you want to delete ${candidate.name}?`)) return;

    try {
      await deleteCandidate(candidate.electionId, candidate.id);
      showSuccess('Candidate deleted successfully');
    } catch (error) {
      showError(error.message || 'Failed to delete candidate');
    }
  };

  const handleVote = async (candidate) => {
    try {
      // Use blockchain voting service for both admin and voter voting
      const blockchainVotingService = (await import('../../services/blockchain/votingService')).default;
      
      const voteResult = await blockchainVotingService.completeVotingFlow(
        candidate.electionId, 
        candidate.id
      );
      
      if (voteResult.success) {
        showSuccess('Vote successfully cast on blockchain!');
        closeModal('showVoteModal');
      } else {
        throw new Error(voteResult.error || 'Failed to cast vote on blockchain');
      }
    } catch (error) {
      showError(error.message || 'Failed to cast vote on blockchain');
    }
  };

  const handleBulkImport = async () => {
    if (!selectedElection) {
      showError('Please select an election first');
      return;
    }

    try {
      // Parse CSV data
      const lines = bulkData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const candidatesData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const candidate = {};
        headers.forEach((header, index) => {
          candidate[header.toLowerCase()] = values[index] || '';
        });
        return candidate;
      });

      const result = await bulkImportCandidates(selectedElection._id, candidatesData);
      setBulkResults(result.results);
      showSuccess(`Bulk import completed: ${result.results.successful.length} successful, ${result.results.failed.length} failed`);
      closeModal('showBulkModal');
      setBulkData('');
    } catch (error) {
      showError(error.message || 'Failed to bulk import candidates');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      seat: '',
      party: '',
      position: '',
      bio: '',
      manifesto: '',
      photoUrl: '',
      email: '',
      phone: '',
      age: '',
      isActive: true
    });
  };

  const openEditModal = (candidate) => {
    setSelectedCandidate(candidate);
    setFormData({
      name: candidate.name,
      seat: candidate.seat,
      party: candidate.party || '',
      position: candidate.position || '',
      bio: candidate.bio || '',
      manifesto: candidate.manifesto || '',
      photoUrl: candidate.photoUrl || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      age: candidate.age || '',
      isActive: candidate.isActive
    });
    openModal('showEditModal');
  };

  const openVoteModal = (candidate) => {
    setSelectedCandidate(candidate);
    openModal('showVoteModal');
  };

  const handleRefresh = async () => {
    try {
      showLoader('Refreshing data...');
      await fetchAllData();
      showToast('Data refreshed successfully', 'success');
    } catch (error) {
      showError('Failed to refresh data');
    } finally {
      hideLoader();
    }
  };

  const handleExport = (message) => {
    showToast(message, 'success');
  };

  // Access control
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Admin Access Required</span>
          </div>
          <p className="text-red-300 text-sm mt-2">
            Only administrators can access the candidates management system.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Loading state
  if (candidatesLoading && candidates.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-8 h-8 text-blue-400" />
                Global Candidates Management
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage all candidates across all elections
              </p>
            </div>
          </div>
          
          <StatisticsSkeleton />
          <BlockchainAccountsSkeleton />
          <FilterControlsSkeleton />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <CandidateCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statistics = getStatistics();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-400" />
              Global Candidates Management
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage all candidates across all elections
            </p>
          </div>
        </div>

        {/* Statistics Dashboard */}
  <StatisticsDashboard statistics={statistics} onOpenAudit={(d) => { setAuditCandidate(d); setAuditOpen(true); }} />

        {/* MetaMask Accounts */}
        <MetaMaskAccounts />

        {/* Filter Controls */}
        <FilterControls
          candidates={candidates}
          elections={elections}
          onRefresh={handleRefresh}
          onExport={handleExport}
          viewMode={viewMode}
          onToggleView={(mode) => setViewMode(mode)}
        />

        {/* Candidates (table or cards) */}
        {viewMode === 'table' ? (
          <CandidateTable
            candidates={filteredCandidates}
            onView={(c) => {
              // set selected and open view modal (reuse edit modal as quick view)
              setSelectedCandidate(c);
              openModal('showEditModal');
            }}
            onEdit={(c) => openEditModal(c)}
            onDelete={(c) => handleDeleteCandidate(c)}
            onVerify={async (c) => {
              // mark candidate as verified/active
              try {
                showLoader('Verifying candidate...');
                await updateCandidate(c.electionId, c.id, { verified: true, isActive: true });
                showToast('Candidate verified', 'success');
                await fetchAllData();
              } catch (err) {
                showError(err.message || 'Failed to verify candidate');
              } finally {
                hideLoader();
              }
            }}
            onReject={(c) => {
              setRejectingCandidate(c);
              setRejectModalOpen(true);
            }}
            onOpenAudit={(c) => { setAuditCandidate(c); setAuditOpen(true); }}
          />
        ) : (
          <div className="space-y-6">
            {/* Table of Contents (seat jump list) & Seat ordering / collapse controls */}
            <div ref={tocRef} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-300 font-medium">Seats:</span>
                <div className="flex gap-2 flex-wrap">
                  {groupedCandidates.slice(0, 20).map(([seat]) => (
                    <button
                      key={`toc-${seat}`}
                      onClick={() => scrollToSeat(seat)}
                      className="text-sm px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 border border-gray-600"
                    >
                      {seat}
                    </button>
                  ))}
                  {groupedCandidates.length > 20 && (
                    <span className="text-xs text-gray-400 px-2">... {groupedCandidates.length - 20} more</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-300">Seat order</label>
                <select
                  value={seatOrderMode}
                  onChange={(e) => setSeatOrderMode(e.target.value)}
                  className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                >
                  <option value="alphabetical">Alphabetical</option>
                  <option value="presidentFirst">President first</option>
                  <option value="custom">Custom (comma-separated)</option>
                </select>

                {seatOrderMode === 'custom' && (
                  <input
                    placeholder="e.g. President,Vice President,Treasurer"
                    value={customSeatOrder}
                    onChange={(e) => setCustomSeatOrder(e.target.value)}
                    className="ml-2 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm w-64"
                  />
                )}

                <button onClick={expandAll} className="ml-2 px-2 py-1 bg-green-600 rounded-md text-white text-sm">Expand all</button>
                <button onClick={collapseAll} className="ml-1 px-2 py-1 bg-red-600 rounded-md text-white text-sm">Collapse all</button>
              </div>
            </div>
            {groupedCandidates.length === 0 && (
              <div className="text-gray-400">No candidates to display.</div>
            )}
            {groupedCandidates.map(([seat, list]) => {
              const collapsed = !!collapsedSeats[seat];
              return (
                <div key={`seat-group-${seat}`} id={`seat-${encodeURIComponent(seat)}`} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCollapse(seat)}
                        aria-expanded={!collapsed}
                        className="p-1 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200"
                      >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <h3 className="text-lg font-semibold text-white">{seat} <span className="text-sm text-gray-400">— {list.length} candidate{list.length>1?'s':''}</span></h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollToSeat(seat)}
                        className="text-sm px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 border border-gray-600"
                      >
                        Jump
                      </button>
                    </div>
                  </div>

                  {!collapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {list.map((c, idx) => (
                        <CandidateCard
                          key={`${c.electionId}-${c.id || c._id || idx}`}
                          candidate={c}
                          index={idx}
                          onEdit={() => openEditModal(c)}
                          onView={() => { setSelectedCandidate(c); openModal('showEditModal'); }}
                          onDelete={() => handleDeleteCandidate(c)}
                          onVote={() => handleVote(c)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Reject Candidate Modal (structured) */}
        <AnimatePresence>
          {rejectModalOpen && rejectingCandidate && (
            <RejectCandidateModal
              isOpen={rejectModalOpen}
              candidate={rejectingCandidate}
              onCancel={() => {
                setRejectModalOpen(false);
                setRejectingCandidate(null);
              }}
              onSubmit={async (payload) => {
                try {
                  showLoader('Rejecting candidate...');
                  await updateCandidate(rejectingCandidate.electionId, rejectingCandidate.id, {
                    isActive: false,
                    disqualifiedReason: payload.disqualifiedReason || payload.disqualifiedReason,
                    disqualificationNotes: payload.disqualificationNotes || payload.disqualificationNotes,
                    disqualificationEvidence: payload.disqualificationEvidence || payload.disqualificationEvidence
                  });
                  await fetchAllData();
                } catch (err) {
                  showError(err.message || 'Failed to reject candidate');
                } finally {
                  hideLoader();
                  setRejectModalOpen(false);
                  setRejectingCandidate(null);
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* Audit Viewer Modal */}
        <AnimatePresence>
          {auditOpen && (
            <AuditViewer isOpen={auditOpen} onClose={() => { setAuditOpen(false); setAuditCandidate(null); }} candidateId={auditCandidate?.id} electionId={auditCandidate?.electionId} />
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredCandidates.length === 0 && candidates.length > 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No candidates found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {candidates.length === 0 && !candidatesLoading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No candidates found</h3>
            <p className="text-gray-500">
              No candidates have been added yet.
            </p>
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {/* Add Candidate Modal */}
          {modals.showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && closeModal('showAddModal')}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Add New Candidate</h3>
                </div>

                <CandidateForm
                  elections={elections}
                  selectedElection={selectedElection}
                  onSave={handleAddCandidate}
                  onCancel={() => {
                    closeModal('showAddModal');
                    setSelectedElection(null);
                    resetForm();
                    clearMessages();
                  }}
                  loading={candidatesLoading}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Edit Candidate Modal */}
          {modals.showEditModal && selectedCandidate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && closeModal('showEditModal')}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Edit Candidate</h3>
                </div>

                <CandidateForm
                  candidate={selectedCandidate}
                  elections={elections}
                  onSave={handleUpdateCandidate}
                  onCancel={() => {
                    closeModal('showEditModal');
                    setSelectedCandidate(null);
                    resetForm();
                    clearMessages();
                  }}
                  loading={candidatesLoading}
                  title="Edit Candidate"
                />
              </motion.div>
            </motion.div>
          )}

          {/* Voting Modal */}
          <VotingModal
            isOpen={modals.showVoteModal}
            onClose={() => {
              closeModal('showVoteModal');
              setSelectedCandidate(null);
              clearMessages();
            }}
          />

          {/* Bulk Import Modal */}
          {modals.showBulkModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && closeModal('showBulkModal')}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Bulk Import Candidates</h3>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Election *
                  </label>
                  <select
                    value={selectedElection?._id || ''}
                    onChange={(e) => {
                      const election = elections.find(el => el._id === e.target.value);
                      setSelectedElection(election);
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Choose an election</option>
                    {elections.map(election => (
                      <option key={election._id} value={election._id}>
                        {election.title}
                        {election.settings?.lockCandidateList ? ' (Locked)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-blue-300 text-sm font-medium mb-2">
                    <Users className="w-4 h-4" />
                    CSV Format Instructions
                  </div>
                  <p className="text-blue-200 text-sm">
                    Enter candidate data in CSV format. First row should be headers: name, seat, party, position, bio, manifesto, photoUrl, email, phone, age, isActive
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
                    placeholder="name,seat,party,position,bio,manifesto,photoUrl,email,phone,age,isActive&#10;John Doe,President,Democratic Party,President,Experienced leader,Progressive policies,https://example.com/john.jpg,john@example.com,+1234567890,25,true"
                    rows={10}
                  />
                </div>

                {error && (
                  <div className="mb-4 flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      closeModal('showBulkModal');
                      setBulkData('');
                      setSelectedElection(null);
                      clearMessages();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkImport}
                    disabled={candidatesLoading || !bulkData.trim() || !selectedElection}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {candidatesLoading ? 'Importing...' : 'Import Candidates'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {success}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {(candidatesLoading || votingLoading) && (
          <LoadingOverlay message={candidatesLoading ? 'Loading...' : 'Processing vote...'} />
        )}
      </div>
    </DashboardLayout>
  );
});

CandidatesContent.displayName = 'CandidatesContent';

// Main component with all providers
const CandidatesRefactored = memo(() => {
  return (
    <ErrorBoundary
      title="Candidates Management Error"
      message="An error occurred while loading the candidates management system. Please try refreshing the page."
    >
      <CandidatesProvider>
        <VotingProvider>
          <MetaMaskProvider>
            <UIProvider>
              <CandidatesContent />
            </UIProvider>
          </MetaMaskProvider>
        </VotingProvider>
      </CandidatesProvider>
    </ErrorBoundary>
  );
});

CandidatesRefactored.displayName = 'CandidatesRefactored';

export { CandidatesRefactored };
export default CandidatesRefactored;
