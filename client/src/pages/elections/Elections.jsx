import React, { useContext, useEffect, useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Eye, Play, Settings, Pause, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { AuthContext } from '../../contexts/auth';
import { useElections, useCreateElection, useDeleteElection, useChangeElectionStatus, useClearVotes, useLockCandidateList } from '../../hooks/elections';
import { ElectionWizard } from '../../components/features/elections';
import { ElectionCard } from '../../components/common';
import { useNavigate } from 'react-router-dom';
import { useGlobalUI } from '../../components/common';
import { clearElectionsCache } from '../../services/api';
import { AdminPasswordPrompt } from '../../components/features/admin';

const ElectionsPage = memo(() => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useGlobalUI();

  // Use React Query hooks for data fetching
  const { data: electionsData, isLoading: electionsLoading, refetch: refetchElections } = useElections();
  const createElectionMutation = useCreateElection();
  const deleteElectionMutation = useDeleteElection();
  const changeStatusMutation = useChangeElectionStatus();
  const clearVotesMutation = useClearVotes();
  const lockCandidateListMutation = useLockCandidateList();

  const elections = useMemo(() => Array.isArray(electionsData) ? electionsData : [], [electionsData]);
  const loading = useMemo(() => electionsLoading || createElectionMutation.isPending || deleteElectionMutation.isPending, [electionsLoading, createElectionMutation.isPending, deleteElectionMutation.isPending]);


  // Admin election creation form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handleCreateElection = async (electionData) => {
    try {
      showToast('Creating election...', 'info');
      await createElectionMutation.mutateAsync(electionData);
      setShowCreateForm(false);
      // Clear cache and force refresh the elections list
      clearElectionsCache();
      await refetchElections();
    } catch (err) {
      console.error('Create election error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create election';
      showToast(errorMessage, 'error');
    }
  };

  const handleDeleteElection = (id) => {
    if (!user || user.role?.toLowerCase() !== 'admin') return showToast('Admin only', 'error');
    setPendingAction({ type: 'delete', electionId: id });
    setShowPasswordPrompt(true);
  };

  const handleClearVotes = (id) => {
    if (!user || user.role?.toLowerCase() !== 'admin') return showToast('Admin only', 'error');
    setPendingAction({ type: 'clearVotes', electionId: id });
    setShowPasswordPrompt(true);
  };

  const handlePasswordConfirm = async (password) => {
    if (!pendingAction) return;

    try {
      if (pendingAction.type === 'delete') {
        showToast('Deleting election...', 'info');
        await deleteElectionMutation.mutateAsync(pendingAction.electionId);
        showToast('Election deleted successfully.', 'success');
      } else if (pendingAction.type === 'clearVotes') {
        showToast('Clearing all votes...', 'info');
        const result = await clearVotesMutation.mutateAsync({ id: pendingAction.electionId, adminPassword: password });
        console.log('Clear votes result:', result);
        showToast('All votes cleared successfully. Election can now be deleted.', 'success');
      } else if (pendingAction.type === 'changeStatus') {
        showToast(`Changing election status to ${pendingAction.status}...`, 'info');
        const result = await changeStatusMutation.mutateAsync({ id: pendingAction.electionId, status: pendingAction.status, adminPassword: password });
        console.log('Status change result:', result);
        showToast(`Election status changed to ${pendingAction.status}`, 'success');
      }
      // Clear cache and force refresh the elections list
      clearElectionsCache();
      await refetchElections();
    } catch (err) {
      console.error('Action error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to perform action';
      showToast(errorMessage, 'error');
    }
  };

  const handleChangeStatus = async (id, status) => {
    // Check if we're trying to open an election
    if (status === 'Open') {
      // Find the election to check if candidate list is locked
      const election = elections.find(e => e._id === id);
      if (election && !election.candidateListLocked) {
        // Show a confirmation dialog to lock candidate list first
        const shouldLock = window.confirm(
          'To open this election, the candidate list must be locked first. This will prevent adding or removing candidates. Do you want to lock the candidate list now?'
        );
        
        if (shouldLock) {
          try {
            showToast('Locking candidate list...', 'info');
            await lockCandidateListMutation.mutateAsync(id);
            showToast('Candidate list locked successfully. You can now open the election.', 'success');
            await refetchElections();
            showToast('Elections list refreshed.', 'success');
          } catch (err) {
            console.error('Error locking candidate list:', err);
            showToast('Failed to lock candidate list', 'error');
            return;
          }
        } else {
          return; // User cancelled
        }
      }
    }
    
    setPendingAction({ type: 'changeStatus', electionId: id, status });
    setShowPasswordPrompt(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <Play className="w-4 h-4" />;
      case 'Setup': return <Settings className="w-4 h-4" />;
      case 'Closed': return <Pause className="w-4 h-4" />;
      case 'Finalized': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'Setup': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'Closed': return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
      case 'Finalized': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-extrabold text-white tracking-wide">
          🗳️ Elections Management
        </h2>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {user?.role?.toLowerCase() === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm((v) => !v)}
              disabled={loading}
              className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-emerald-500 transition disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {showCreateForm ? 'Cancel' : '+ Create Election'}
            </motion.button>
          )}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              clearElectionsCache();
              refetchElections();
            }} 
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-200 transition disabled:bg-gray-600 flex items-center gap-2"
          >
            🔄 Refresh
          </motion.button>
        </div>
      </div>

      {/* Admin Create Election Wizard */}
      {showCreateForm && user?.role?.toLowerCase() === 'admin' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 mt-2"
        >
          <ElectionWizard 
            onCreated={handleCreateElection} 
            onCancel={() => setShowCreateForm(false)} 
          />
        </motion.div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
          <span className="ml-3 text-sky-400 font-semibold">Loading elections...</span>
        </div>
      )}

      {/* No Elections Message */}
      {!loading && elections.length === 0 && (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No elections found.</p>
          <p className="text-gray-500 text-sm mt-2">Create your first election to get started.</p>
        </div>
      )}

      {/* Elections Grid */}
      {!loading && elections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {elections.map((election, index) => (
            <motion.div
              key={election._id || election.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col"
            >
              <ElectionCard
                election={election}
                onVote={() => navigate('/candidates', { state: { electionId: election._id }})}
                onView={() => navigate(`/elections/${election._id}`)}
                onManage={() => navigate(`/elections/${election._id}/manage`)}
                className="flex-1"
              />
              
              {/* Admin Actions */}
              {user?.role?.toLowerCase() === 'admin' && (
                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/elections/${election._id}`)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm rounded-lg transition flex items-center gap-2 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </motion.button>
                  
                  {election.status === 'Setup' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChangeStatus(election._id, 'Open')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition flex items-center gap-2 font-medium"
                    >
                      <Play className="w-4 h-4" />
                      Open
                    </motion.button>
                  )}
                  
                  {election.status === 'Open' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChangeStatus(election._id, 'Closed')}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition flex items-center gap-2 font-medium"
                    >
                      <Pause className="w-4 h-4" />
                      Close
                    </motion.button>
                  )}
                  
                  {election.totalVotes > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleClearVotes(election._id)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded-lg transition flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Votes ({election.totalVotes})
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteElection(election._id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition flex items-center gap-2 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
      {/* Admin Password Prompt */}
      <AdminPasswordPrompt
        isOpen={showPasswordPrompt}
        onClose={() => {
          setShowPasswordPrompt(false);
          setPendingAction(null);
        }}
        onConfirm={handlePasswordConfirm}
        title="Admin Authorization Required"
        message={
          pendingAction?.type === 'clearVotes' 
            ? 'Please enter your admin password to clear all votes from this election. This action is irreversible and will allow you to delete the election.'
            : pendingAction?.type === 'changeStatus'
            ? `Please enter your admin password to change the election status to ${pendingAction.status}.`
            : 'Please enter your admin password to delete this election. This action is irreversible.'
        }
        action={
          pendingAction?.type === 'clearVotes' 
            ? 'Clear All Votes' 
            : pendingAction?.type === 'changeStatus'
            ? `Change to ${pendingAction.status}`
            : 'Delete Election'
        }
      />
    </DashboardLayout>
  );
});

ElectionsPage.displayName = 'ElectionsPage';

export default ElectionsPage;