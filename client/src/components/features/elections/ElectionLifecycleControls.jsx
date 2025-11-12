// Election Lifecycle Controls (F.1.2) - Secure Admin Interface

import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Square, RotateCcw, Shield, AlertTriangle, 
  CheckCircle, Clock, Lock, Unlock, Eye, EyeOff, 
  Key, Hash, FileText, Zap, Database, AlertCircle
} from 'lucide-react';
import { electionsAPI } from '../../../services/api';
import { AuthContext } from '../../../contexts/auth';
import { useGlobalUI } from '../../../components/common';
const ElectionLifecycleControls = ({ election, onElectionUpdate }) => {
  const { user } = useContext(AuthContext);
  const { showToast } = useGlobalUI();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  // Admin modal / auth state
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [confirmReset, setConfirmReset] = useState('');
  const [modalAction, setModalAction] = useState(null); // 'start' | 'stop' | 'reset' | 'finalize'
  // Admin authentication & reset form state (handled above)

  // Check if user is admin
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  if (!isAdmin) {
    return (
      <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-400">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Admin Access Required</span>
        </div>
        <p className="text-red-300 text-sm mt-2">
          Only administrators can control election lifecycle.
        </p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Setup': return 'text-yellow-400 bg-yellow-600/20';
      case 'Open': return 'text-green-400 bg-green-600/20';
      case 'Closed': return 'text-orange-400 bg-orange-600/20';
      case 'Finalized': return 'text-blue-400 bg-blue-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Setup': return <Clock className="w-4 h-4" />;
      case 'Open': return <Play className="w-4 h-4" />;
      case 'Closed': return <Pause className="w-4 h-4" />;
      case 'Finalized': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getValidTransitions = (currentStatus) => {
    const transitions = {
      'Setup': ['Open'],
      'Open': ['Closed'],
      'Closed': ['Finalized'],
      'Finalized': []
    };
    return transitions[currentStatus] || [];
  };

  const handleStatusChange = async (newStatus) => {
    if (!election) return;
    
    setLoading(true);

    try {
      const result = await electionsAPI.changeStatus(election._id, newStatus, adminPassword);
      showToast(`Election status changed to ${newStatus}`, 'success');
      onElectionUpdate?.(result.election);
      setShowPasswordModal(false);
      setAdminPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change election status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeTally = async () => {
    if (!election) return;
    
    setLoading(true);

    try {
      const result = await electionsAPI.finalizeTally(election._id, adminPassword);
      showToast('Election tally finalized and locked on blockchain', 'success');
      onElectionUpdate?.(result.election);
      setShowFinalizeModal(false);
      setAdminPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to finalize tally', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetElection = async () => {
    if (!election) return;
    
    setLoading(true);

    try {
      const resetData = {
        adminPassword,
        confirmationCode,
        reason: resetReason,
        confirmReset
      };
      
      const result = await electionsAPI.resetElection(election._id, resetData);
      showToast('Election reset successfully. All data has been cleared.', 'success');
      onElectionUpdate?.(result.election);
      setShowResetModal(false);
      setAdminPassword('');
      setConfirmationCode('');
      setResetReason('');
      setConfirmReset('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset election', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openPasswordModal = (action) => {
    setAdminPassword('');
    setModalAction(action);
    if (action === 'reset') {
      setShowResetModal(true);
    } else if (action === 'finalize') {
      setShowFinalizeModal(true);
    } else {
      setShowPasswordModal(true);
    }
  };

  const closeModals = () => {
    setShowPasswordModal(false);
    setShowResetModal(false);
    setShowFinalizeModal(false);
    setAdminPassword('');
    setConfirmationCode('');
    setResetReason('');
    setConfirmReset('');
  };

  const validTransitions = getValidTransitions(election?.status);

  return (
    <div className="space-y-6">
      {/* Current Status Display */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Election Lifecycle Controls
          </h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(election?.status)}`}>
            {getStatusIcon(election?.status)}
            {election?.status || 'Unknown'}
          </div>
        </div>

        {/* Status History */}
        {election?.statusHistory && election.statusHistory.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Status History</h4>
            <div className="space-y-2">
              {election.statusHistory.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs text-gray-400">
                  <span>{entry.status}</span>
                  <span>{new Date(entry.at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Election Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">Candidates:</span>
            <span className="text-white font-medium">{election?.candidates?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Total Votes:</span>
            <span className="text-white font-medium">{election?.totalVotes || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            {election?.candidateListLocked ? (
              <Lock className="w-4 h-4 text-red-400" />
            ) : (
              <Unlock className="w-4 h-4 text-yellow-400" />
            )}
            <span className="text-gray-300">Candidate List:</span>
            <span className="text-white font-medium">
              {election?.candidateListLocked ? 'Locked' : 'Unlocked'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Start Voting */}
        {validTransitions.includes('Open') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openPasswordModal('start')}
            className="flex flex-col items-center gap-3 p-4 bg-green-600/20 border border-green-600/50 rounded-lg hover:bg-green-600/30 transition-all duration-200"
          >
            <Play className="w-6 h-6 text-green-400" />
            <div className="text-center">
              <div className="text-sm font-semibold text-green-300">Start Voting</div>
              <div className="text-xs text-green-400">Open Election</div>
            </div>
          </motion.button>
        )}

        {/* Stop Voting */}
        {validTransitions.includes('Closed') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openPasswordModal('stop')}
            className="flex flex-col items-center gap-3 p-4 bg-orange-600/20 border border-orange-600/50 rounded-lg hover:bg-orange-600/30 transition-all duration-200"
          >
            <Pause className="w-6 h-6 text-orange-400" />
            <div className="text-center">
              <div className="text-sm font-semibold text-orange-300">Stop Voting</div>
              <div className="text-xs text-orange-400">Close Election</div>
            </div>
          </motion.button>
        )}

        {/* Finalize Results */}
        {election?.status === 'Closed' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openPasswordModal('finalize')}
            className="flex flex-col items-center gap-3 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
          >
            <CheckCircle className="w-6 h-6 text-blue-400" />
            <div className="text-center">
              <div className="text-sm font-semibold text-blue-300">Finalize Tally</div>
              <div className="text-xs text-blue-400">Lock Results</div>
            </div>
          </motion.button>
        )}

        {/* Reset Election (DANGER) */}
        {election?.status !== 'Finalized' && election?.totalVotes === 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openPasswordModal('reset')}
            className="flex flex-col items-center gap-3 p-4 bg-red-600/20 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition-all duration-200"
          >
            <RotateCcw className="w-6 h-6 text-red-400" />
            <div className="text-center">
              <div className="text-sm font-semibold text-red-300">Reset Election</div>
              <div className="text-xs text-red-400">DANGER ZONE</div>
            </div>
          </motion.button>
        )}
      </div>

      {/* Status Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
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
                <Key className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Admin Authentication</h3>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">
                Enter admin password to change election status.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter admin password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (modalAction === 'start') handleStatusChange('Open');
                      else if (modalAction === 'stop') handleStatusChange('Closed');
                    }}
                    disabled={loading || !adminPassword}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finalize Tally Modal */}
      <AnimatePresence>
        {showFinalizeModal && (
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
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Finalize Tally</h3>
              </div>
              
              <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-yellow-300 text-sm font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Warning
                </div>
                <p className="text-yellow-200 text-sm">
                  This action will permanently lock the election results on the blockchain. 
                  This cannot be undone.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter admin password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinalizeTally}
                    disabled={loading || !adminPassword}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Finalizing...' : 'Finalize Tally'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Election Modal */}
      <AnimatePresence>
        {showResetModal && (
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
              className="bg-gray-800 rounded-xl p-6 w-full max-w-lg border border-gray-700"
            >
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Reset Election</h3>
              </div>
              
              <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-red-300 text-sm font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  DANGER ZONE
                </div>
                <p className="text-red-200 text-sm">
                  This action will completely reset the election, clearing all candidates, 
                  votes, and data. This is irreversible and should only be used for testing 
                  or in extreme pre-voting errors.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter admin password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmation Code
                  </label>
                  <div className="relative">
                    <input
                      type={showCode ? 'text' : 'password'}
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter confirmation code"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for Reset
                  </label>
                  <textarea
                    value={resetReason}
                    onChange={(e) => setResetReason(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Explain why this election needs to be reset..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type "RESET_ELECTION_CONFIRMED" to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmReset}
                    onChange={(e) => setConfirmReset(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="RESET_ELECTION_CONFIRMED"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetElection}
                    disabled={loading || !adminPassword || !confirmationCode || !resetReason || confirmReset !== 'RESET_ELECTION_CONFIRMED'}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Resetting...' : 'Reset Election'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElectionLifecycleControls;
