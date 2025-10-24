import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Shield,
  FileText,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useVoterRegistration } from '../../contexts/voters/VoterRegistrationContext';
import { useGlobalUI } from '../../components/common';

const VoterManagement = () => {
  const { 
    voters,
    votersLoading,
    votersError,
    statistics,
    verificationQueue,
    queueLoading,
    api,
    setVotersError,
    setVotersLoading
  } = useVoterRegistration();

  const { showLoader, hideLoader, showToast } = useGlobalUI();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [showVoterDetails, setShowVoterDetails] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadVoters();
    loadVerificationQueue();
  }, []);

  // Load voters
  const loadVoters = async () => {
    try {
      setVotersLoading(true);
      await api.getVoters({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
    } catch (error) {
      setVotersError('Failed to load voters');
    }
  };

  // Load verification queue
  const loadVerificationQueue = async () => {
    try {
      await api.getVerificationQueue();
    } catch (error) {
      console.error('Failed to load verification queue:', error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle refresh
  const handleRefresh = async () => {
    showLoader('Refreshing data...');
    try {
      await Promise.all([loadVoters(), loadVerificationQueue()]);
      showToast('Data refreshed successfully', 'success');
    } catch (error) {
      showToast('Failed to refresh data', 'error');
    } finally {
      hideLoader();
    }
  };

  // Handle voter verification
  const handleVerifyVoter = async (voterId, verificationData) => {
    try {
      showLoader('Verifying voter...');
      await api.verifyVoter(voterId, verificationData);
      await loadVoters();
      await loadVerificationQueue();
      showToast('Voter verification completed', 'success');
      setShowVerificationModal(false);
    } catch (error) {
      showToast('Failed to verify voter', 'error');
    } finally {
      hideLoader();
    }
  };

  // Handle voter status update
  const handleUpdateStatus = async (voterId, status, notes = '') => {
    try {
      showLoader('Updating voter status...');
      await api.updateVoterStatus(voterId, status, notes);
      await loadVoters();
      showToast('Voter status updated', 'success');
    } catch (error) {
      showToast('Failed to update voter status', 'error');
    } finally {
      hideLoader();
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      showLoader('Exporting voters...');
      const response = await api.exportVoters({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        format: 'csv'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `voters-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('Voters exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export voters', 'error');
    } finally {
      hideLoader();
    }
  };

  // Filter voters
  const filteredVoters = voters.filter(voter => {
    const matchesSearch = !searchTerm || 
      voter.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.blockchainInfo.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || voter.verification.overallStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return UserX;
      case 'expired': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-400" />
              Voter Management
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage voter registrations and verifications
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={votersLoading}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${votersLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics.totalVoters}</p>
                <p className="text-gray-400 text-sm">Total Voters</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics.verifiedVoters}</p>
                <p className="text-gray-400 text-sm">Verified</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics.pendingVoters}</p>
                <p className="text-gray-400 text-sm">Pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <UserX className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics.rejectedVoters}</p>
                <p className="text-gray-400 text-sm">Rejected</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold text-white">{statistics.expiredVoters}</p>
                <p className="text-gray-400 text-sm">Expired</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Queue */}
        {verificationQueue && verificationQueue.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Verification Queue
              </h2>
              <span className="text-sm text-gray-400">
                {verificationQueue.length} pending verification
              </span>
            </div>
            
            <div className="space-y-3">
              {verificationQueue.slice(0, 5).map((voter) => (
                <div key={voter.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {voter.personalInfo.firstName[0]}{voter.personalInfo.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {voter.personalInfo.firstName} {voter.personalInfo.lastName}
                      </p>
                      <p className="text-gray-400 text-sm">{voter.personalInfo.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedVoter(voter);
                        setShowVoterDetails(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search voters..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={handleFilterChange}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Voters Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Voter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredVoters.map((voter) => {
                  const StatusIcon = getStatusIcon(voter.verification.overallStatus);
                  
                  return (
                    <tr key={voter.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {voter.personalInfo.firstName[0]}{voter.personalInfo.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {voter.personalInfo.firstName} {voter.personalInfo.lastName}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {voter.personalInfo.nationality}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <p className="text-gray-300 text-sm flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {voter.personalInfo.email}
                          </p>
                          <p className="text-gray-400 text-sm flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {voter.personalInfo.phone}
                          </p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-gray-300 text-sm bg-gray-700 px-2 py-1 rounded">
                          {voter.blockchainInfo.walletAddress.slice(0, 6)}...{voter.blockchainInfo.walletAddress.slice(-4)}
                        </code>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(voter.verification.overallStatus)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {voter.verification.overallStatus}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {voter.documents.governmentId && (
                            <FileText className="w-4 h-4 text-green-400" title="Government ID" />
                          )}
                          {voter.documents.proofOfAddress && (
                            <FileText className="w-4 h-4 text-green-400" title="Proof of Address" />
                          )}
                          {voter.documents.selfie && (
                            <Camera className="w-4 h-4 text-green-400" title="Selfie" />
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(voter.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedVoter(voter);
                              setShowVoterDetails(true);
                            }}
                            className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {voter.verification.overallStatus === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedVoter(voter);
                                setShowVerificationModal(true);
                              }}
                              className="p-2 text-green-400 hover:bg-green-400/20 rounded-lg transition-colors"
                              title="Verify voter"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredVoters.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No voters found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No voters have registered yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VoterManagement;
