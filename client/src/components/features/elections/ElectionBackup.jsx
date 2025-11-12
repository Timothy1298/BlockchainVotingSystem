import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  Database, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Archive,
  RefreshCw,
  Trash2,
  Eye,
  Calendar,
  HardDrive,
  Cloud,
  Lock,
  Unlock
} from 'lucide-react';

import { maintenanceAPI } from '../../../services/api/api';
import { useGlobalUI } from '../../common';

const ElectionBackup = ({ electionId, election }) => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader, showToast } = useGlobalUI();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupSettings, setBackupSettings] = useState({
    name: '',
    description: '',
    includeVotes: true,
    includeCandidates: true,
    includeVoters: true,
    includeSettings: true,
    includeAnalytics: false,
    encryption: true,
    compression: true
  });

  // Mock backups data
  const mockBackups = [
    {
      id: 1,
      name: 'Pre-Election Backup',
      description: 'Complete backup before election starts',
      type: 'full',
      size: '2.4 MB',
      createdAt: '2024-01-15T10:00:00Z',
      status: 'completed',
      includes: {
        votes: false,
        candidates: true,
        voters: true,
        settings: true,
        analytics: false
      },
      encryption: true,
      compression: true,
      downloadUrl: '/api/backups/1/download',
      checksum: 'a1b2c3d4e5f6...'
    },
    {
      id: 2,
      name: 'Mid-Election Snapshot',
      description: 'Backup during voting period',
      type: 'incremental',
      size: '1.8 MB',
      createdAt: '2024-01-18T14:30:00Z',
      status: 'completed',
      includes: {
        votes: true,
        candidates: true,
        voters: true,
        settings: true,
        analytics: true
      },
      encryption: true,
      compression: true,
      downloadUrl: '/api/backups/2/download',
      checksum: 'b2c3d4e5f6a1...'
    },
    {
      id: 3,
      name: 'Post-Election Archive',
      description: 'Final backup after election completion',
      type: 'full',
      size: '3.2 MB',
      createdAt: '2024-01-22T16:45:00Z',
      status: 'completed',
      includes: {
        votes: true,
        candidates: true,
        voters: true,
        settings: true,
        analytics: true
      },
      encryption: true,
      compression: true,
      downloadUrl: '/api/backups/3/download',
      checksum: 'c3d4e5f6a1b2...'
    },
    {
      id: 4,
      name: 'Emergency Backup',
      description: 'Quick backup before system maintenance',
      type: 'full',
      size: '2.1 MB',
      createdAt: '2024-01-25T09:15:00Z',
      status: 'in_progress',
      includes: {
        votes: true,
        candidates: true,
        voters: true,
        settings: true,
        analytics: false
      },
      encryption: true,
      compression: true,
      downloadUrl: null,
      checksum: null
    }
  ];

  const backupTypes = [
    { value: 'full', label: 'Full Backup', description: 'Complete election data' },
    { value: 'incremental', label: 'Incremental', description: 'Only changed data since last backup' },
    { value: 'differential', label: 'Differential', description: 'All changes since last full backup' }
  ];

  useEffect(() => {
    const fetchBackups = async () => {
      setLoading(true);
      try {
        const list = await maintenanceAPI.listBackups();
        // expect array
        setBackups(Array.isArray(list) ? list : (list.backups || []));
      } catch (err) {
        console.error('Failed to fetch backups, falling back to mock:', err);
        setBackups(mockBackups);
      } finally {
        setLoading(false);
      }
    };

    fetchBackups();
  }, [electionId]);

  const handleCreateBackup = async () => {
    // Call maintenance API to create a backup
    try {
      showLoader('Creating backup...');
      const payload = {
        name: backupSettings.name,
        description: backupSettings.description,
        include: {
          votes: backupSettings.includeVotes,
          candidates: backupSettings.includeCandidates,
          voters: backupSettings.includeVoters,
          settings: backupSettings.includeSettings,
          analytics: backupSettings.includeAnalytics
        },
        encryption: backupSettings.encryption,
        compression: backupSettings.compression,
        electionId
      };

      const created = await maintenanceAPI.createBackup(payload);
      // server may return created backup object
      setBackups(prev => [created, ...prev]);
      setShowCreateModal(false);
      showToast('Backup created', 'success');
    } catch (err) {
      console.error('Failed to create backup:', err);
      showToast('Failed to create backup', 'error');
    } finally {
      hideLoader();
    }
  };

  const handleDownloadBackup = (backup) => {
    if (backup.downloadUrl) {
      // open the download URL in a new tab
      window.open(backup.downloadUrl, '_blank');
    } else {
      showToast('No download available for this backup', 'info');
    }
  };

  const handleRestoreBackup = (backup) => {
    setSelectedBackup(backup);
    setShowRestoreModal(true);
  };

  const confirmRestore = () => {
    const doRestore = async () => {
      try {
        showLoader('Restoring backup...');
        await maintenanceAPI.restoreBackup(selectedBackup.folder || selectedBackup.id || selectedBackup.name);
        showToast('Restore initiated', 'success');
      } catch (err) {
        console.error('Restore failed:', err);
        showToast('Restore failed', 'error');
      } finally {
        hideLoader();
        setShowRestoreModal(false);
        setSelectedBackup(null);
      }
    };

    doRestore();
  };

  const handleDeleteBackup = (backupId) => {
    setBackups(prev => prev.filter(b => b.id !== backupId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20';
      case 'in_progress': return 'text-yellow-400 bg-yellow-900/20';
      case 'failed': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return RefreshCw;
      case 'failed': return AlertTriangle;
      default: return Clock;
    }
  };

  const formatFileSize = (size) => {
    return size;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Election Backup & Restore</h2>
          <p className="text-gray-400">Manage election data backups and restoration</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
        >
          <Database className="w-4 h-4" />
          Create Backup
        </button>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Backups</p>
              <p className="text-2xl font-bold text-white">{backups.length}</p>
            </div>
            <Archive className="w-8 h-8 text-sky-400" />
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
              <p className="text-gray-400 text-sm">Total Size</p>
              <p className="text-2xl font-bold text-white">
                {backups.reduce((total, backup) => {
                  const size = parseFloat(backup.size);
                  return total + (isNaN(size) ? 0 : size);
                }, 0).toFixed(1)} MB
              </p>
            </div>
            <HardDrive className="w-8 h-8 text-green-400" />
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
              <p className="text-gray-400 text-sm">Last Backup</p>
              <p className="text-lg font-bold text-white">
                {backups.length > 0 ? formatDate(backups[0].createdAt) : 'Never'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
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
              <p className="text-gray-400 text-sm">Encrypted</p>
              <p className="text-2xl font-bold text-white">
                {backups.filter(b => b.encryption).length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Backups List */}
      <div className="space-y-4">
        {backups.map((backup) => {
          const StatusIcon = getStatusIcon(backup.status);
          
          return (
            <motion.div
              key={backup.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-sky-900/20">
                    <Database className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{backup.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(backup.status)}`}>
                        {backup.status}
                      </span>
                      {backup.encryption && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full text-purple-400 bg-purple-900/20">
                          <Lock className="w-3 h-3" />
                          Encrypted
                        </span>
                      )}
                      {backup.compression && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full text-blue-400 bg-blue-900/20">
                          <Archive className="w-3 h-3" />
                          Compressed
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-300 mb-3">{backup.description}</p>
                    
                    {/* Backup Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <p className="text-gray-300 capitalize">{backup.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Size:</span>
                        <p className="text-gray-300">{backup.size}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Created:</span>
                        <p className="text-gray-300">{formatDate(backup.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Checksum:</span>
                        <p className="text-gray-300 font-mono text-xs">{backup.checksum || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Included Data */}
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Included Data</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(backup.includes).map(([key, included]) => (
                          <div key={key} className="flex items-center gap-2">
                            {included ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-gray-500" />
                            )}
                            <span className={`text-sm capitalize ${
                              included ? 'text-green-400' : 'text-gray-500'
                            }`}>
                              {key}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  {backup.status === 'completed' && (
                    <>
                      <button
                        onClick={() => handleDownloadBackup(backup)}
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRestoreBackup(backup)}
                        className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                        title="Restore"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBackup(backup.id)}
                    className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create Backup Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showCreateModal ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
          showCreateModal ? 'block' : 'hidden'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Create Backup</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backup Name *
              </label>
              <input
                type="text"
                value={backupSettings.name}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                placeholder="e.g., Pre-Election Backup"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={backupSettings.description}
                onChange={(e) => setBackupSettings(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-sky-400"
                placeholder="Optional description of this backup"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Include in Backup
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'includeVotes', label: 'Vote Data' },
                  { key: 'includeCandidates', label: 'Candidates' },
                  { key: 'includeVoters', label: 'Voter Lists' },
                  { key: 'includeSettings', label: 'Election Settings' },
                  { key: 'includeAnalytics', label: 'Analytics Data' }
                ].map((item) => (
                  <label key={item.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={backupSettings[item.key]}
                      onChange={(e) => setBackupSettings(prev => ({ 
                        ...prev, 
                        [item.key]: e.target.checked 
                      }))}
                      className="mr-2 w-4 h-4 text-sky-400 bg-gray-700 border-gray-600 rounded focus:ring-sky-400"
                    />
                    <span className="text-gray-300">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Security Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={backupSettings.encryption}
                    onChange={(e) => setBackupSettings(prev => ({ 
                      ...prev, 
                      encryption: e.target.checked 
                    }))}
                    className="mr-2 w-4 h-4 text-sky-400 bg-gray-700 border-gray-600 rounded focus:ring-sky-400"
                  />
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Encrypt backup</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={backupSettings.compression}
                    onChange={(e) => setBackupSettings(prev => ({ 
                      ...prev, 
                      compression: e.target.checked 
                    }))}
                    className="mr-2 w-4 h-4 text-sky-400 bg-gray-700 border-gray-600 rounded focus:ring-sky-400"
                  />
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Compress backup</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBackup}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
              >
                Create Backup
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Restore Confirmation Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showRestoreModal ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
          showRestoreModal ? 'block' : 'hidden'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Restore Backup</h3>
            <button
              onClick={() => setShowRestoreModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Warning</span>
              </div>
              <p className="text-yellow-200 text-sm">
                Restoring this backup will overwrite all current election data. This action cannot be undone.
              </p>
            </div>

            <div>
              <p className="text-gray-300 mb-2">You are about to restore:</p>
              <div className="p-3 bg-gray-700 rounded-lg">
                <p className="text-white font-medium">{selectedBackup?.name}</p>
                <p className="text-gray-400 text-sm">{selectedBackup?.description}</p>
                <p className="text-gray-400 text-sm">Created: {selectedBackup && formatDate(selectedBackup.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ElectionBackup;