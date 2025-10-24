import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Vote, 
  Eye,
  ExternalLink,
  Bell,
  Shield,
  Info,
  TrendingUp,
  BarChart3,
  FileText,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import VoterDashboardLayout from './VoteDashboardLayout';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';
import { useGlobalUI } from '../../components/common';
import { electionsAPI } from '../../services/api';
import KYCStatusCard from '../../components/voters/KYCStatusCard';
import { voterRegistrationAPI } from '../../services/api/voterRegistrationAPI';
import { notificationsAPI, votingAPI } from '../../services/api/api';

const VoterDashboard = () => {
  const { user } = useAuth();
  const { selectedAccount, isConnected } = useMetaMaskContext();
  const { showLoader, hideLoader, showToast } = useGlobalUI();
  const navigate = useNavigate();

  // State management
  const [elections, setElections] = useState([]);
  const [voterStatus, setVoterStatus] = useState({
    isEligible: false,
    hasVoted: false,
    registrationStatus: 'pending'
  });
  const [kycStatus, setKycStatus] = useState({
    overallStatus: 'pending',
    isComplete: false
  });
  const [notifications, setNotifications] = useState([]);
  const [statistics, setStatistics] = useState({
    totalElections: 0,
    activeElections: 0,
    upcomingElections: 0,
    completedElections: 0,
    totalVotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastLoadTimeRef = useRef(0);

  const loadDashboardData = useCallback(async () => {
    // Debounce: prevent rapid successive calls (minimum 3 seconds between calls)
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 3000) {
      return;
    }
    lastLoadTimeRef.current = now;
    
    try {
      setLoading(true);
      setError(null);
      showLoader('Loading dashboard...');

      // 1) Load elections list from server
      const electionsRes = await electionsAPI.list();
      const electionsData = (electionsRes && electionsRes.data) ? electionsRes.data : electionsRes;

      // 2) Load voter registration/eligibility status for current user
      const regStatusRes = await voterRegistrationAPI.getRegistrationStatus();
      const regPayload = (regStatusRes && regStatusRes.data) ? regStatusRes.data : regStatusRes;

      // 3) Load user notifications (auth-required; server uses req.user)
      const notifsRes = await notificationsAPI.list();
      const notificationsData = (notifsRes && notifsRes.data) ? notifsRes.data : notifsRes;

      // Process elections data
      const now = new Date();
      const processedElections = (Array.isArray(electionsData) ? electionsData : []).map(election => {
        // Normalize date fields from server (startsAt/endsAt) to local startDate/endDate
        const startDateVal = election.startsAt || election.startDate || election.start || election.beginAt;
        const endDateVal = election.endsAt || election.endDate || election.end || election.finishAt;
        const startDate = startDateVal ? new Date(startDateVal) : new Date();
        const endDate = endDateVal ? new Date(endDateVal) : new Date();
        const isActive = now >= startDate && now <= endDate;
        const isUpcoming = now < startDate;
        const isCompleted = now > endDate;
        const timeRemaining = isActive ? endDate - now : 0;

        return {
          ...election,
          startDate,
          endDate,
          isActive,
          isUpcoming,
          isCompleted,
          timeRemaining,
          status: isActive ? 'active' : isUpcoming ? 'upcoming' : 'completed'
        };
      });

      // 4) For active elections, check if current user has already voted (optional best-effort)
      // Note: requires election._id mapped to contract election or DB election
      try {
        const active = processedElections.filter(e => e.isActive);
        const votedMap = {};
        for (const e of active) {
          try {
            const hv = await votingAPI.hasVoted(e._id);
            const hvData = (hv && hv.data) ? hv.data : hv;
            votedMap[e._id] = !!(hvData?.hasVoted);
          } catch (_) {}
        }
        // Merge hasVoted flag per-election if needed
        // (kept for future UI indicators)
      } catch (_) {}

      setElections(processedElections);
      setVoterStatus({
        isEligible: regPayload?.data?.isComplete || regPayload?.data?.canVote || regPayload?.isComplete || regPayload?.canVote || false,
        hasVoted: false,
        registrationStatus: regPayload?.data?.overallStatus || regPayload?.overallStatus || 'pending'
      });

      // Update KYC status
      setKycStatus({
        overallStatus: regPayload?.data?.kycInfo?.verification?.overallStatus || regPayload?.kycInfo?.verification?.overallStatus || 'pending',
        isComplete: (regPayload?.data?.kycInfo?.verification?.overallStatus || regPayload?.kycInfo?.verification?.overallStatus) === 'verified'
      });
      setNotifications(Array.isArray(notificationsData?.data) ? notificationsData.data : (Array.isArray(notificationsData) ? notificationsData : []));

      // Calculate statistics
      const stats = {
        totalElections: (Array.isArray(electionsData) ? electionsData.length : 0),
        activeElections: processedElections.filter(e => e.isActive).length,
        upcomingElections: processedElections.filter(e => e.isUpcoming).length,
        completedElections: processedElections.filter(e => e.isCompleted).length,
        totalVotes: 0
      };
      setStatistics(stats);

    } catch (error) {
      setError(error?.response?.data?.message || error?.message || 'Failed to load dashboard data');
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
      hideLoader();
    }
  }, [showLoader, hideLoader, showToast]); // Dependencies for the callback

  // Handle KYC status updates
  const handleKycStatusUpdate = useCallback((newKycStatus) => {
    setKycStatus(prevKycStatus => {
      // Only show toast and reload if status actually changed to verified
      if (newKycStatus.overallStatus === 'verified' && prevKycStatus.overallStatus !== 'verified') {
        showToast('KYC verification completed successfully!', 'success');
        // Use setTimeout to avoid immediate re-render loop
        setTimeout(() => {
          loadDashboardData();
        }, 1000);
      }
      
      return {
        overallStatus: newKycStatus.overallStatus,
        isComplete: newKycStatus.overallStatus === 'verified'
      };
    });
  }, [showToast, loadDashboardData]);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]); // Depend on loadDashboardData function

  // Format time remaining
  const formatTimeRemaining = (timeRemaining) => {
    if (timeRemaining <= 0) return 'Ended';
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 border-green-200';
      case 'upcoming': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'completed': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return Clock;
      case 'upcoming': return Calendar;
      case 'completed': return CheckCircle;
      default: return Calendar;
    }
  };

  if (loading) {
    return (
      <VoterDashboardLayout currentTab="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </VoterDashboardLayout>
    );
  }

  if (error) {
    return (
      <VoterDashboardLayout currentTab="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Dashboard</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </VoterDashboardLayout>
    );
  }

  return (
    <VoterDashboardLayout currentTab="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Voter'}!</h2>
              <p className="text-blue-100">
                {voterStatus.isEligible 
                  ? 'You are eligible to vote in active elections' 
                  : 'Complete your registration to participate in elections'
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {voterStatus.isEligible ? (
                <CheckCircle className="w-8 h-8 text-green-300" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-yellow-300" />
              )}
            </div>
          </div>
        </div>

        {/* Voter Status Card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Your Voting Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  voterStatus.registrationStatus === 'verified' ? 'bg-green-400' : 
                  voterStatus.registrationStatus === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <div>
                  <p className="text-sm text-gray-400">Registration</p>
                  <p className="text-white font-medium capitalize">{voterStatus.registrationStatus}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  voterStatus.isEligible ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <div>
                  <p className="text-sm text-gray-400">Eligibility</p>
                  <p className="text-white font-medium">
                    {voterStatus.isEligible ? 'Eligible' : 'Not Eligible'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  voterStatus.hasVoted ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <div>
                  <p className="text-sm text-gray-400">Voting Activity</p>
                  <p className="text-white font-medium">
                    {voterStatus.hasVoted ? 'Voted' : 'Not Voted'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Verification Status - Only show if not verified and user is authenticated */}
        {!kycStatus.isComplete && user && user.role === 'voter' && (
          <KYCStatusCard 
            voterId={selectedAccount} 
            onStatusUpdate={handleKycStatusUpdate}
          />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics.totalElections}</p>
                <p className="text-gray-400 text-sm">Total Elections</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics.activeElections}</p>
                <p className="text-gray-400 text-sm">Active Elections</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics.upcomingElections}</p>
                <p className="text-gray-400 text-sm">Upcoming</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics.completedElections}</p>
                <p className="text-gray-400 text-sm">Completed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <Vote className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics.totalVotes}</p>
                <p className="text-gray-400 text-sm">Your Votes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Elections */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                Active Elections
              </h3>
              <button
                onClick={loadDashboardData}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          
          {elections.filter(e => e.isActive).length > 0 ? (
            
            <div className="space-y-4">
              {elections.filter(e => e.isActive).map((election) => {
                const StatusIcon = getStatusIcon(election.status);
                
                return (
                  <motion.div
                    key={election._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-green-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">{election.title}</h4>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(election.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {election.status}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{election.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Ends: {new Date(election.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Time left: {formatTimeRemaining(election.timeRemaining)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{election.candidates?.length || 0} candidates</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button 
                          onClick={() => navigate('/voter/ballot')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Vote className="w-4 h-4" />
                          Go to Ballot
                        </button>
                        <button 
                          onClick={() => navigate('/voter/verifiability')}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                          title="View Vote Verification"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">No Active Elections</h4>
              <p className="text-gray-400 mb-4">There are currently no active elections available for voting.</p>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
          </div>
        )}
        </div>

        {/* Upcoming Elections */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Upcoming Elections
            </h3>
          
          {elections.filter(e => e.isUpcoming).length > 0 ? (
            
            <div className="space-y-4">
              {elections.filter(e => e.isUpcoming).map((election) => (
                <motion.div
                  key={election._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">{election.title}</h4>
                        <span className="text-blue-400 text-sm">
                          Starts: {new Date(election.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{election.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Ends: {new Date(election.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{election.candidates?.length || 0} candidates</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button 
                        onClick={() => navigate('/voter/ballot', { state: { electionId: election._id } })}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">No Upcoming Elections</h4>
              <p className="text-gray-400">There are no upcoming elections scheduled at this time.</p>
          </div>
        )}
        </div>

        {/* System Notifications */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              System Notifications
            </h3>
          
          {notifications.length > 0 ? (
            
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.type === 'urgent' ? 'bg-red-500/10 border-red-500/50' :
                    notification.type === 'success' ? 'bg-green-500/10 border-green-500/50' :
                    'bg-blue-500/10 border-blue-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'urgent' ? 'bg-red-400' :
                      notification.type === 'success' ? 'bg-green-400' :
                      'bg-blue-400'
                    }`}></div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                      <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">No Notifications</h4>
              <p className="text-gray-400">You have no system notifications at this time.</p>
          </div>
        )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-blue-400" />
              <h4 className="font-semibold text-white">Eligibility Check</h4>
            </div>
            <p className="text-gray-400 text-sm">Verify your voting eligibility</p>
          </button>
          
          <button className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-green-500 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-green-400" />
              <h4 className="font-semibold text-white">Candidate Info</h4>
            </div>
            <p className="text-gray-400 text-sm">View candidate profiles</p>
          </button>
          
          <button className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <HelpCircle className="w-6 h-6 text-purple-400" />
              <h4 className="font-semibold text-white">FAQ/Help Center</h4>
            </div>
            <p className="text-gray-400 text-sm">Get help with voting process</p>
          </button>
          
          <button className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-yellow-500 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <h4 className="font-semibold text-white">Election Results</h4>
            </div>
            <p className="text-gray-400 text-sm">View past election results</p>
          </button>
        </div>

        {/* Past Elections */}
        {elections.filter(e => e.isCompleted).length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-400" />
              Past Elections
            </h3>
            
            <div className="space-y-4">
              {elections.filter(e => e.isCompleted).map((election) => (
                <motion.div
                  key={election._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">{election.title}</h4>
                        <span className="text-gray-400 text-sm">
                          Ended: {new Date(election.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{election.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{election.candidates?.length || 0} candidates</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Vote className="w-4 h-4" />
                          <span>{election.totalVotes || 0} total votes</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Results
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Audit Trail
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility Check Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Eligibility Check
          </h3>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-white font-medium">Current Eligibility Status</h4>
                <p className="text-gray-400 text-sm">Based on your registration and verification status</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                voterStatus.isEligible 
                  ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                  : 'bg-red-600/20 text-red-400 border border-red-600/50'
              }`}>
                {voterStatus.isEligible ? 'Eligible to Vote' : 'Not Eligible'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    voterStatus.registrationStatus === 'verified' ? 'bg-green-400' : 
                    voterStatus.registrationStatus === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-gray-300 text-sm">Registration Status</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-gray-300 text-sm">MetaMask Connection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    voterStatus.isEligible ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-gray-300 text-sm">Age Requirement (18+)</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    voterStatus.registrationStatus === 'verified' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-gray-300 text-sm">KYC Verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    voterStatus.registrationStatus === 'verified' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-gray-300 text-sm">Biometric Verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    voterStatus.registrationStatus === 'verified' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-gray-300 text-sm">Document Verification</span>
                </div>
              </div>
            </div>
            
            {!voterStatus.isEligible && (
              <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-600/50 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-300 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Action Required</span>
                </div>
                <p className="text-yellow-200 text-sm mt-1">
                  Complete your voter registration and verification process to become eligible for voting.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Information Access */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            Candidate Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {elections.filter(e => e.isActive || e.isUpcoming).slice(0, 3).map((election) => (
              <div key={election._id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h4 className="text-white font-medium mb-2">{election.title}</h4>
                <p className="text-gray-400 text-sm mb-3">{election.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">
                    {election.candidates?.length || 0} candidates
                  </span>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                    View Candidates
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Requirements Check */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            System Requirements Check
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Browser Compatibility</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Modern Browser (Chrome, Firefox, Safari, Edge)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">JavaScript Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">HTTPS Connection</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Device Requirements</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Webcam for Biometric Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">MetaMask Extension</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Stable Internet Connection</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <h4 className="text-red-200 font-medium">Error Loading Dashboard</h4>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <button
                  onClick={loadDashboardData}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VoterDashboardLayout>
  );
};

export default VoterDashboard;