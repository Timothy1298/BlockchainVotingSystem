// Election Management Page - Showcasing Lifecycle Controls

import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Shield, Activity, Clock, Users, 
  TrendingUp, AlertTriangle, CheckCircle, 
  Database, Zap, Lock, Unlock
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { ElectionLifecycleControls } from '../../components/features/elections';
import { electionsAPI } from '../../services/api';
import { AuthContext } from '../../contexts/auth';
import { useGlobalUI } from '../../components/common';

const ElectionManagement = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useGlobalUI();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const data = await electionsAPI.list();
      setElections(data);
      if (data.length > 0 && !selectedElection) {
        setSelectedElection(data[0]);
      }
    } catch (err) {
      setError('Failed to fetch elections');
      console.error('Error fetching elections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleElectionUpdate = (updatedElection) => {
    setElections(prev => 
      prev.map(election => 
        election._id === updatedElection._id ? updatedElection : election
      )
    );
    setSelectedElection(updatedElection);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Setup': return 'text-yellow-400 bg-yellow-600/20 border-yellow-600/50';
      case 'Open': return 'text-green-400 bg-green-600/20 border-green-600/50';
      case 'Closed': return 'text-orange-400 bg-orange-600/20 border-orange-600/50';
      case 'Finalized': return 'text-blue-400 bg-blue-600/20 border-blue-600/50';
      default: return 'text-gray-400 bg-gray-600/20 border-gray-600/50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Setup': return <Clock className="w-4 h-4" />;
      case 'Open': return <Activity className="w-4 h-4" />;
      case 'Closed': return <CheckCircle className="w-4 h-4" />;
      case 'Finalized': return <Shield className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading election management...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchElections}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-sky-400" />
              Election Management
            </h1>
            <p className="text-gray-400 mt-1">
              Secure lifecycle controls for blockchain voting system
            </p>
          </div>
          
          {user?.role === 'admin' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-600/50 rounded-full">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Admin Access</span>
            </div>
          )}
        </div>

        {/* Election Selection */}
        {elections.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Select Election</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elections.map((election) => (
                <motion.button
                  key={election._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedElection(election)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedElection?._id === election._id
                      ? 'border-sky-500 bg-sky-600/20'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white truncate">{election.title}</h3>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                      {getStatusIcon(election.status)}
                      {election.status}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{election.candidates?.length || 0} candidates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>{election.totalVotes || 0} votes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {election.candidateListLocked ? (
                        <Lock className="w-4 h-4 text-red-400" />
                      ) : (
                        <Unlock className="w-4 h-4 text-yellow-400" />
                      )}
                      <span>{election.candidateListLocked ? 'Locked' : 'Unlocked'}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Election Details */}
        {selectedElection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Election Overview */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">{selectedElection.title}</h2>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedElection.status)}`}>
                  {getStatusIcon(selectedElection.status)}
                  {selectedElection.status}
                </div>
              </div>
              
              {selectedElection.description && (
                <p className="text-gray-300 mb-4">{selectedElection.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300 text-sm">Candidates</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedElection.candidates?.length || 0}</div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300 text-sm">Total Votes</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedElection.totalVotes || 0}</div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300 text-sm">Turnout</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {selectedElection.turnoutPercentage ? `${selectedElection.turnoutPercentage}%` : 'N/A'}
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300 text-sm">Registered Voters</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{selectedElection.registeredVoters?.length || 0}</div>
                </div>
              </div>
            </div>

            {/* Lifecycle Controls */}
            <ElectionLifecycleControls 
              election={selectedElection} 
              onElectionUpdate={handleElectionUpdate}
            />

            {/* Status History */}
            {selectedElection.statusHistory && selectedElection.statusHistory.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Status History</h3>
                <div className="space-y-3">
                  {selectedElection.statusHistory.slice().reverse().map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(entry.status)}`}>
                          {getStatusIcon(entry.status)}
                        </div>
                        <div>
                          <div className="text-white font-medium">{entry.status}</div>
                          <div className="text-gray-400 text-sm">
                            {new Date(entry.at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* No Elections Message */}
        {elections.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No Elections Found</h3>
            <p className="text-gray-400">
              Create an election to start managing the voting lifecycle.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ElectionManagement;
