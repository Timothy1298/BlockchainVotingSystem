import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { AuthContext } from '../../../contexts/auth';
import { useElection, useUpdateElection, useChangeElectionStatus, useAddCandidate, useDeleteCandidate, useClearVotes, useLockCandidateList, useInvalidateElections } from '../../../hooks/elections';
import { useQueryClient } from '@tanstack/react-query';
import { useGlobalUI } from '../../../components/common';
import { clearAllCache, electionsAPI } from '../../../services/api';
import AdminPasswordPrompt from '../admin/AdminPasswordPrompt.jsx';
import { 
  ArrowLeft,
  Settings,
  Users,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Calendar,
  BarChart3,
  Lock,
  Globe,
  Bell,
  Database,
  Activity,
  RefreshCw
} from 'lucide-react';
import ElectionLanguageSupport from './ElectionLanguageSupport';
import ElectionNotifications from './ElectionNotifications';
import ElectionAnalytics from './ElectionAnalytics';
import ElectionBackup from './ElectionBackup';
import ElectionLifecycleControls from './ElectionLifecycleControls';

const ElectionManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showLoader, hideLoader, showToast } = useGlobalUI();
  
  const { data: election, isLoading, error, refetch } = useElection(id);
  
  // Debug: Log the election data whenever it changes
  useEffect(() => {
    console.log('🔍 ElectionManage: Election data changed:', {
      id: election?._id,
      title: election?.title,
      candidatesCount: election?.candidates?.length,
      candidates: election?.candidates?.map(c => ({ name: c.name, seat: c.seat }))
    });
  }, [election]);
  const queryClient = useQueryClient();
  const { invalidateElection, clearAll } = useInvalidateElections();
  const updateElectionMutation = useUpdateElection();
  const changeStatusMutation = useChangeElectionStatus();
  const addCandidateMutation = useAddCandidate();
  const deleteCandidateMutation = useDeleteCandidate();
  const clearVotesMutation = useClearVotes();
  const lockCandidateListMutation = useLockCandidateList();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    seat: '',
    bio: '',
    manifesto: '',
    party: '',
    email: '',
    phone: '',
    age: '',
    photoUrl: ''
  });
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    if (election) {
      setEditData({
        title: election.title,
        description: election.description,
        startsAt: election.startsAt ? new Date(election.startsAt).toISOString().slice(0, 16) : '',
        endsAt: election.endsAt ? new Date(election.endsAt).toISOString().slice(0, 16) : '',
        electionType: election.electionType,
        ballotStructure: election.ballotStructure
      });
    }
  }, [election]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
          <span className="ml-3 text-sky-400 font-semibold">Loading election...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !election) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 text-lg">Election not found</p>
          <button
            onClick={() => navigate('/elections')}
            className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
          >
            Back to Elections
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (user?.role?.toLowerCase() !== 'admin') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 text-lg">Access denied. Admin privileges required.</p>
          <button
            onClick={() => navigate('/elections')}
            className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
          >
            Back to Elections
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const handleStatusChange = async (newStatus) => {
    // Check if we're trying to open an election
    if (newStatus === 'Open') {
      if (election && !election.candidateListLocked) {
        // Show a confirmation dialog to lock candidate list first
        const shouldLock = window.confirm(
          'To open this election, the candidate list must be locked first. This will prevent adding or removing candidates. Do you want to lock the candidate list now?'
        );
        
        if (shouldLock) {
          try {
            showLoader('Locking candidate list...');
            await lockCandidateListMutation.mutateAsync(id);
            showToast('Candidate list locked successfully. You can now open the election.', 'success');
            refetch();
          } catch (err) {
            console.error('Error locking candidate list:', err);
            showToast('Failed to lock candidate list', 'error');
            return;
          } finally {
            hideLoader();
          }
        } else {
          return; // User cancelled
        }
      }
    }
    
    setPendingAction({ type: 'statusChange', status: newStatus });
    setShowPasswordPrompt(true);
  };

  const handleClearVotes = () => {
    setPendingAction({ type: 'clearVotes' });
    setShowPasswordPrompt(true);
  };

  const handlePasswordConfirm = async (password) => {
    if (!pendingAction) return;

    try {
      if (pendingAction.type === 'statusChange') {
        showLoader(`Changing status to ${pendingAction.status}...`);
        await changeStatusMutation.mutateAsync({ 
          id, 
          status: pendingAction.status,
          adminPassword: password 
        });
        showToast(`Election status changed to ${pendingAction.status}`, 'success');
      } else if (pendingAction.type === 'clearVotes') {
        showLoader('Clearing all votes...');
        await clearVotesMutation.mutateAsync({ 
          id, 
          adminPassword: password 
        });
        showToast('All votes cleared successfully. Election can now be deleted.', 'success');
      }
      refetch();
    } catch (err) {
      console.error('Action error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to perform action';
      throw new Error(errorMessage);
    } finally {
      hideLoader();
    }
  };

  const handleSaveChanges = async () => {
    try {
      showLoader('Saving changes...');
      await updateElectionMutation.mutateAsync({ id, data: editData });
      showToast('Election updated successfully', 'success');
      setIsEditing(false);
      refetch();
    } catch (err) {
      console.error('Update error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update election';
      showToast(errorMessage, 'error');
    } finally {
      hideLoader();
    }
  };

  const handleAddCandidate = async () => {
    if (!newCandidate.name.trim() || !newCandidate.seat.trim()) {
      showToast('Name and seat are required', 'error');
      return;
    }

    try {
      showLoader('Adding candidate...');
      console.log('Adding candidate:', { electionId: id, candidateData: newCandidate });
      
      const result = await addCandidateMutation.mutateAsync({ electionId: id, candidateData: newCandidate });
      console.log('✅ Add candidate result:', result);
      
      showToast('Candidate added successfully', 'success');
      setNewCandidate({ 
        name: '', 
        seat: '', 
        bio: '', 
        manifesto: '', 
        party: '', 
        email: '', 
        phone: '', 
        age: '', 
        photoUrl: '' 
      });
      
      // Invalidate cache and refresh
      console.log('Invalidating cache and refreshing election data...');
      invalidateElection(id);
      await refetch();
      console.log('Election data refreshed');
      
    } catch (err) {
      console.error('Add candidate error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add candidate';
      showToast(errorMessage, 'error');
    } finally {
      hideLoader();
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;

    try {
      showLoader('Deleting candidate...');
      await deleteCandidateMutation.mutateAsync({ electionId: id, candidateId });
      showToast('Candidate deleted successfully', 'success');
      refetch();
    } catch (err) {
      console.error('Delete candidate error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete candidate';
      showToast(errorMessage, 'error');
    } finally {
      hideLoader();
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

  const statusConfig = getStatusColor(election.status);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'lifecycle', label: 'Lifecycle', icon: Calendar },
    { id: 'languages', label: 'Languages', icon: Globe }
  ];

  return (
    <DashboardLayout>
  <div className="space-y-6 w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
    <div className="flex items-center gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/elections/${id}`)}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white">Manage Election</h1>
              <p className="text-gray-400 mt-1">{election.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-sm font-medium px-4 py-2 rounded-full border ${statusConfig}`}>
              {election.status}
            </span>
            {election.candidateListLocked && (
              <span className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Lock className="w-3 h-3" />
                Candidates Locked
              </span>
            )}
            {election.status === 'Setup' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange('Open')}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Open Election
              </motion.button>
            )}
            {election.status === 'Open' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange('Closed')}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Close Election
              </motion.button>
            )}
            {election.totalVotes > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearVotes}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Votes ({election.totalVotes})
              </motion.button>
            )}
          </div>
        </div>

        {/* Tabs */}
  <div className="flex flex-wrap space-x-1 bg-gray-800 p-1 rounded-lg overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-sky-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-full overflow-x-auto"
          >
            {/* Basic Information */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                Election Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Title</label>
                  <p className="text-white mt-1">{election.title}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Description</label>
                  <p className="text-white mt-1">{election.description || 'No description'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Type</label>
                  <p className="text-white mt-1">{election.electionType}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-400" />
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-white">{election.candidates?.length || 0}</div>
                  <div className="text-sm text-gray-400">Candidates</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-white">{election.totalVotes || 0}</div>
                  <div className="text-sm text-gray-400">Total Votes</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-white">{election.voters?.length || 0}</div>
                  <div className="text-sm text-gray-400">Voters</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-white">
                    {election.turnoutPercentage ? `${election.turnoutPercentage}%` : '0%'}
                  </div>
                  <div className="text-sm text-gray-400">Turnout</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'candidates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-full overflow-x-auto"
          >



            {/* Candidate Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Candidates</p>
                    <p className="text-2xl font-bold text-white">{election.candidates?.length || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-sky-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Positions Filled</p>
                    <p className="text-2xl font-bold text-white">
                      {election.seats?.filter(seat => 
                        election.candidates?.some(candidate => candidate.seat === seat)
                      ).length || 0}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Votes</p>
                    <p className="text-2xl font-bold text-white">
                      {election.candidates?.reduce((total, candidate) => total + (candidate.votes || 0), 0) || 0}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">List Status</p>
                    <p className={`text-lg font-bold ${election.candidateListLocked ? 'text-red-400' : 'text-yellow-400'}`}>
                      {election.candidateListLocked ? 'Locked' : 'Open'}
                    </p>
                  </div>
                  {election.candidateListLocked ? (
                    <Lock className="w-8 h-8 text-red-400" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Add Candidate Form */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-400" />
                Add New Candidate
              </h3>
                {election.candidateListLocked && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-red-900/20 text-red-400 rounded-full border border-red-500/30">
                    <Lock className="w-4 h-4" />
                    Candidate list is locked
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                    disabled={election.candidateListLocked}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter candidate's full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position/Seat *</label>
                  <select
                    value={newCandidate.seat}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, seat: e.target.value }))}
                    disabled={election.candidateListLocked}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select position</option>
                    {election.seats?.map((seat, index) => (
                      <option key={index} value={seat}>{seat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Party/Affiliation</label>
                  <input
                    type="text"
                    value={newCandidate.party}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, party: e.target.value }))}
                    disabled={election.candidateListLocked}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Political party or affiliation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={newCandidate.email || ''}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                    disabled={election.candidateListLocked}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="candidate@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newCandidate.phone || ''}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={election.candidateListLocked}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                  <input
                    type="number"
                    value={newCandidate.age || ''}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    disabled={election.candidateListLocked}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="25"
                    min="18"
                    max="100"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Biography</label>
                  <textarea
                    value={newCandidate.bio || ''}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={election.candidateListLocked}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Brief biography and background information"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Manifesto/Platform</label>
                  <textarea
                    value={newCandidate.manifesto}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, manifesto: e.target.value }))}
                    disabled={election.candidateListLocked}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Candidate's manifesto, platform, and key promises"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Photo URL</label>
                  <input
                    type="url"
                    value={newCandidate.photoUrl || ''}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, photoUrl: e.target.value }))}
                    disabled={election.candidateListLocked}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {election.candidateListLocked ? (
                    <span className="text-red-400">Cannot add candidates - list is locked</span>
                  ) : (
                    <span>Multiple candidates can run for the same position</span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddCandidate}
                  disabled={election.candidateListLocked || !newCandidate.name || !newCandidate.seat}
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Candidate
                </motion.button>
              </div>
            </div>

            {/* Candidates by Position */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                  Candidates by Position
              </h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    Total: {election.candidates?.length || 0} candidates
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      console.log('🔍 FORCE REFRESH TRIGGERED');
                      console.log('Current election data before refresh:', {
                        candidatesCount: election?.candidates?.length,
                        candidates: election?.candidates?.map(c => c.name)
                      });
                      
                      // Clear all caches (both React Query and API cache)
                      clearAllCache();
                      clearAll();
                      
                      // Force refetch
                      console.log('🔍 Refetching election data...');
                      const result = await refetch();
                      console.log('🔍 Refetch result:', {
                        candidatesCount: result.data?.candidates?.length,
                        candidates: result.data?.candidates?.map(c => c.name)
                      });
                      
                      console.log('🔍 Force refresh completed');
                      showToast('All caches cleared and data refreshed', 'success');
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Force Refresh
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      console.log('🔍 DIRECT API TEST TRIGGERED');
                      try {
                        const directResult = await electionsAPI.get(id);
                        console.log('🔍 Direct API result:', {
                          title: directResult?.title,
                          candidatesCount: directResult?.candidates?.length,
                          candidates: directResult?.candidates?.map(c => ({ name: c.name, seat: c.seat }))
                        });
                        showToast(`Direct API returned ${directResult?.candidates?.length || 0} candidates`, 'info');
                      } catch (err) {
                        console.error('🔍 Direct API error:', err);
                        showToast('Direct API call failed', 'error');
                      }
                    }}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Test API
                  </motion.button>
                  {!election.candidateListLocked && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to lock the candidate list? This will prevent adding or removing candidates.')) {
                          lockCandidateListMutation.mutate(id);
                        }
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Lock List
                    </motion.button>
                  )}
                          </div>
                          </div>

              <div className="space-y-6">
                {election.seats?.map((seat, seatIndex) => {
                  const seatCandidates = election.candidates?.filter(candidate => candidate.seat === seat) || [];
                  return (
                    <div key={seatIndex} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">{seat}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {seatCandidates.length} candidate{seatCandidates.length !== 1 ? 's' : ''}
                          </span>
                          {seatCandidates.length === 0 && (
                            <span className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded-full">
                              No candidates
                            </span>
                          )}
                        </div>
                      </div>

                      {seatCandidates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {seatCandidates.map((candidate, candidateIndex) => (
                            <motion.div
                              key={candidate._id || candidateIndex}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: candidateIndex * 0.1 }}
                              className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                                  <h5 className="text-white font-semibold truncate">{candidate.name}</h5>
                                  {candidate.party && (
                                    <p className="text-gray-400 text-sm truncate">{candidate.party}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">Votes:</span>
                                    <span className="text-sm font-medium text-sky-400">{candidate.votes || 0}</span>
                                  </div>
                                </div>
                              </div>

                              {candidate.bio && (
                                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{candidate.bio}</p>
                              )}

                              <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                                  {candidate.email && (
                                    <span className="text-xs text-gray-500">📧</span>
                                  )}
                                  {candidate.phone && (
                                    <span className="text-xs text-gray-500">📱</span>
                                  )}
                                  {candidate.age && (
                                    <span className="text-xs text-gray-500">Age: {candidate.age}</span>
                                  )}
                                </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteCandidate(candidate._id)}
                                  disabled={election.candidateListLocked}
                                  className="p-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                  title="Delete candidate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>

                              {candidate.manifesto && (
                                <div className="mt-3 pt-3 border-t border-gray-600">
                                  <p className="text-xs text-gray-400 line-clamp-2">{candidate.manifesto}</p>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No candidates for this position yet</p>
                          {!election.candidateListLocked && (
                            <p className="text-sm">Add candidates using the form above</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Candidate Management Actions */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-400" />
                Candidate Management
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to clear all candidates? This action cannot be undone.')) return;
                    try {
                      showLoader('Deleting all candidates...');
                      // delete candidates sequentially to avoid overwhelming API
                      for (const c of election.candidates || []) {
                        await deleteCandidateMutation.mutateAsync({ electionId: id, candidateId: c._id || c.id });
                      }
                      showToast('All candidates deleted', 'success');
                      await refetch();
                    } catch (err) {
                      console.error('Clear all candidates error:', err);
                      showToast('Failed to clear all candidates', 'error');
                    } finally {
                      hideLoader();
                    }
                  }}
                  disabled={election.candidateListLocked}
                  className="p-4 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Clear All</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    try {
                      showLoader('Exporting candidates...');
                      const candidates = await electionsAPI.getCandidates(id);
                      // build CSV
                      const headers = ['name','seat','party','email','phone','age'];
                      const rows = (Array.isArray(candidates) ? candidates : (candidates.data || candidates)).map(c => [
                        c.name || '', c.seat || '', c.party || '', c.email || '', c.phone || '', c.age || ''
                      ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
                      const csv = [headers.join(','), ...rows].join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${election.title || 'candidates'}-candidates.csv`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                      showToast('Candidates exported', 'success');
                    } catch (err) {
                      console.error('Export candidates error:', err);
                      showToast('Failed to export candidates', 'error');
                    } finally {
                      hideLoader();
                    }
                  }}
                  className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  <span>Export List</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // open file picker to import CSV
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.csv,text/csv';
                    input.onchange = async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      try {
                        showLoader('Importing candidates...');
                        const text = await file.text();
                        const lines = text.split(/\r?\n/).filter(Boolean);
                        const headers = lines.shift().split(',').map(h => h.replace(/"/g,'').trim().toLowerCase());
                        const candidates = lines.map(line => {
                          const cols = line.split(',').map(c => c.replace(/^"|"$/g,'').trim());
                          const obj = {};
                          headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
                          return { name: obj.name || obj.fullname || '', seat: obj.seat || '', party: obj.party || '', email: obj.email || '' };
                        });
                        await electionsAPI.bulkImportCandidates(id, candidates);
                        showToast('Candidates imported', 'success');
                        await refetch();
                      } catch (err) {
                        console.error('Import candidates error:', err);
                        showToast('Failed to import candidates', 'error');
                      } finally {
                        hideLoader();
                      }
                    };
                    input.click();
                  }}
                  className="p-4 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Import List</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Generate candidate report
                    showToast('Feature coming soon: Generate report', 'info');
                  }}
                  className="p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Generate Report</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-full overflow-x-auto"
          >
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-sky-400" />
                  Election Settings
                </h3>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveChanges}
                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={editData.title || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Election Type</label>
                  <select
                    value={editData.electionType || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, electionType: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50"
                  >
                    <option value="Student Union">Student Union</option>
                    <option value="Student General ELection">General Election</option>
                    <option value="Faculty Representative">Faculty Representative</option>
                    <option value="Class Representative">Class Representative</option>
                    <option value="Sports Committee">Sports Committee</option>
                    <option value="Cultural Committee">Cultural Committee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={editData.startsAt || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, startsAt: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={editData.endsAt || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, endsAt: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ballot Structure</label>
                  <select
                    value={editData.ballotStructure || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, ballotStructure: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50"
                  >
                    <option value="single">Single Choice</option>
                    <option value="multiple">Multiple Choice</option>
                    <option value="ranked">Ranked Choice</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Description</label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400 disabled:opacity-50"
                    placeholder="Election description"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-full overflow-x-auto"
          >
            <ElectionAnalytics electionId={id} election={election} />
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-full overflow-x-auto"
          >
            <ElectionNotifications electionId={id} election={election} />
          </motion.div>
        )}

        {activeTab === 'backup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-full overflow-x-auto"
          >
            <ElectionBackup electionId={id} election={election} />
          </motion.div>
        )}

        {activeTab === 'lifecycle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-full overflow-x-auto"
          >
            <ElectionLifecycleControls electionId={id} election={election} />
          </motion.div>
        )}

        {activeTab === 'languages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full max-w-full overflow-x-auto"
          >
            <ElectionLanguageSupport electionId={id} election={election} />
          </motion.div>
        )}
      </div>

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
            : `Please enter your admin password to ${pendingAction?.status === 'Open' ? 'open' : 'close'} this election.`
        }
        action={
          pendingAction?.type === 'clearVotes' 
            ? 'Clear All Votes' 
            : pendingAction?.status === 'Open' 
              ? 'Open Election' 
              : 'Close Election'
        }
      />
    </DashboardLayout>
  );
};

export default ElectionManage;