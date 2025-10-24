import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { AuthContext } from '../../contexts/auth';
import { useElection } from '../../hooks/elections';
import { useGlobalUI } from '../../components/common';
import { 
  Calendar, 
  Users, 
  Settings, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Vote,
  User,
  FileText,
  BarChart3
} from 'lucide-react';

const ElectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { showToast } = useGlobalUI();
  
  const { data: election, isLoading, error } = useElection(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
          <span className="ml-3 text-sky-400 font-semibold">Loading election details...</span>
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const isElectionActive = () => {
    const now = new Date();
    const start = new Date(election.startsAt);
    const end = new Date(election.endsAt);
    return now >= start && now <= end && election.status === 'Open';
  };

  const canVote = () => {
    return isElectionActive() && user?.role?.toLowerCase() !== 'admin';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/elections')}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white">{election.title}</h1>
              <p className="text-gray-400 mt-1">{election.electionType}</p>
            </div>
          </div>
          <span className={`text-sm font-medium px-4 py-2 rounded-full border ${statusConfig}`}>
            {election.status}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {canVote() && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/candidates', { state: { electionId: election._id }})}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Vote className="w-5 h-5" />
              Cast Vote
            </motion.button>
          )}
          
          {user?.role?.toLowerCase() === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/elections/${election._id}/manage`)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Manage Election
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/results', { state: { electionId: election._id }})}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            View Results
          </motion.button>
        </div>

        {/* Election Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              Election Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Description</label>
                <p className="text-white mt-1">{election.description || 'No description provided'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Election Type</label>
                <p className="text-white mt-1">{election.electionType}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Ballot Structure</label>
                <p className="text-white mt-1 capitalize">{election.ballotStructure}</p>
              </div>
            </div>
          </motion.div>

          {/* Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              Schedule
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Start Date & Time</label>
                <p className="text-white mt-1">{formatDate(election.startsAt)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">End Date & Time</label>
                <p className="text-white mt-1">{formatDate(election.endsAt)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Duration</label>
                <p className="text-white mt-1">
                  {election.startsAt && election.endsAt ? 
                    `${Math.ceil((new Date(election.endsAt) - new Date(election.startsAt)) / (1000 * 60 * 60 * 24))} days` : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
          </motion.div>

          {/* Positions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              Available Positions
            </h3>
            <div className="space-y-2">
              {election.seats && election.seats.length > 0 ? (
                election.seats.map((seat, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white">{seat}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No positions defined</p>
              )}
            </div>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
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
                <div className="text-sm text-gray-400">Registered Voters</div>
              </div>
              <div className="text-center p-3 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {election.turnoutPercentage ? `${election.turnoutPercentage}%` : '0%'}
                </div>
                <div className="text-sm text-gray-400">Turnout</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Election Rules */}
        {election.rules && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-sky-400" />
              Election Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${election.rules.oneVotePerId ? 'text-green-400' : 'text-gray-400'}`} />
                <span className="text-white">One Vote Per ID</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${election.rules.anonymous ? 'text-green-400' : 'text-gray-400'}`} />
                <span className="text-white">Anonymous Voting</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-sky-400" />
                <span className="text-white">Eligibility: {election.rules.eligibility}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ElectionDetails;
