import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  FileText, 
  Camera, 
  ExternalLink,
  RefreshCw,
  Eye,
  Download,
  ArrowRight,
  User,
  Mail,
  Phone
} from 'lucide-react';
import VoterDashboardLayout from './VoteDashboardLayout';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';
import { useGlobalUI } from '../../components/common';
import { voterRegistrationAPI } from '../../services/api/voterRegistrationAPI';

const VoterRegistrationStatus = () => {
  const { user } = useAuth();
  const { selectedAccount, isConnected } = useMetaMaskContext();
  const { showLoader, hideLoader, showToast } = useGlobalUI();

  const [registrationData, setRegistrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load registration data
  useEffect(() => {
    if (selectedAccount) {
      loadRegistrationData();
    }
  }, [selectedAccount]);

  const loadRegistrationData = async () => {
    try {
      setLoading(true);
      setError(null);
      showLoader('Loading registration status...');

      const response = await voterRegistrationAPI.getRegistrationStatus(selectedAccount);
      setRegistrationData(response.data);
    } catch (error) {
      setError('Failed to load registration data');
      showToast('Failed to load registration data', 'error');
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  // Get step status
  const getStepStatus = (step) => {
    if (!registrationData) return 'pending';
    
    switch (step) {
      case 'personal':
        return registrationData.personalInfo ? 'completed' : 'pending';
      case 'blockchain':
        return registrationData.blockchainAddress ? 'completed' : 'pending';
      case 'documents':
        return registrationData.documents?.length > 0 ? 'completed' : 'pending';
      case 'biometric':
        return registrationData.biometricVerification ? 'completed' : 'pending';
      case 'review':
        return registrationData.submitted ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  };

  // Get overall status
  const getOverallStatus = () => {
    if (!registrationData) return 'not_started';
    
    if (registrationData.status === 'verified') return 'verified';
    if (registrationData.status === 'rejected') return 'rejected';
    if (registrationData.status === 'under_review') return 'under_review';
    if (registrationData.submitted) return 'submitted';
    
    return 'in_progress';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      case 'verified': return 'text-green-600 bg-green-100 border-green-200';
      case 'under_review': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'verified': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      case 'under_review': return Eye;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <VoterDashboardLayout currentTab="registration">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading registration status...</p>
          </div>
        </div>
      </VoterDashboardLayout>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <VoterDashboardLayout currentTab="registration">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Voter Registration Status</h2>
              <p className="text-blue-100">
                Track your voter registration progress and KYC verification
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-300" />
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className={`rounded-lg p-6 border ${
          overallStatus === 'verified' ? 'bg-green-600/20 border-green-600/50' :
          overallStatus === 'rejected' ? 'bg-red-600/20 border-red-600/50' :
          overallStatus === 'under_review' ? 'bg-blue-600/20 border-blue-600/50' :
          overallStatus === 'submitted' ? 'bg-yellow-600/20 border-yellow-600/50' :
          'bg-gray-600/20 border-gray-600/50'
        }`}>
          <div className="flex items-center gap-4">
            {overallStatus === 'verified' ? (
              <CheckCircle className="w-12 h-12 text-green-400" />
            ) : overallStatus === 'rejected' ? (
              <XCircle className="w-12 h-12 text-red-400" />
            ) : overallStatus === 'under_review' ? (
              <Eye className="w-12 h-12 text-blue-400" />
            ) : (
              <Clock className="w-12 h-12 text-yellow-400" />
            )}
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {overallStatus === 'verified' ? 'Registration Complete' :
                 overallStatus === 'rejected' ? 'Registration Rejected' :
                 overallStatus === 'under_review' ? 'Under Review' :
                 overallStatus === 'submitted' ? 'Registration Submitted' :
                 'Registration In Progress'}
              </h3>
              <p className="text-gray-300">
                {overallStatus === 'verified' ? 'Your voter registration has been approved and you can now participate in elections.' :
                 overallStatus === 'rejected' ? 'Your registration was rejected. Please review the feedback and resubmit.' :
                 overallStatus === 'under_review' ? 'Your documents are being reviewed by our admin team.' :
                 overallStatus === 'submitted' ? 'Your registration has been submitted and is awaiting review.' :
                 'Complete the registration steps below to become eligible to vote.'}
              </p>
            </div>
          </div>
        </div>

        {/* Registration Steps */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">Registration Progress</h3>
          
          <div className="space-y-4">
            {/* Step 1: Personal Information */}
            <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStepStatus('personal') === 'completed' ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                {getStepStatus('personal') === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-white text-sm font-medium">1</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">Personal Information</h4>
                <p className="text-gray-400 text-sm">Basic details and contact information</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(getStepStatus('personal'))}`}>
                {React.createElement(getStatusIcon(getStepStatus('personal')), { className: "w-3 h-3" })}
                {getStepStatus('personal')}
              </span>
            </div>

            {/* Step 2: Blockchain Connection */}
            <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStepStatus('blockchain') === 'completed' ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                {getStepStatus('blockchain') === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-white text-sm font-medium">2</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">Blockchain Connection</h4>
                <p className="text-gray-400 text-sm">Connect your MetaMask wallet</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(getStepStatus('blockchain'))}`}>
                {React.createElement(getStatusIcon(getStepStatus('blockchain')), { className: "w-3 h-3" })}
                {getStepStatus('blockchain')}
              </span>
            </div>

            {/* Step 3: Document Upload */}
            <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStepStatus('documents') === 'completed' ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                {getStepStatus('documents') === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-white text-sm font-medium">3</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">Document Upload</h4>
                <p className="text-gray-400 text-sm">Upload KYC documents for verification</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(getStepStatus('documents'))}`}>
                {React.createElement(getStatusIcon(getStepStatus('documents')), { className: "w-3 h-3" })}
                {getStepStatus('documents')}
              </span>
            </div>

            {/* Step 4: Biometric Verification */}
            <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStepStatus('biometric') === 'completed' ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                {getStepStatus('biometric') === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-white text-sm font-medium">4</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">Biometric Verification</h4>
                <p className="text-gray-400 text-sm">Complete facial recognition verification</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(getStepStatus('biometric'))}`}>
                {React.createElement(getStatusIcon(getStepStatus('biometric')), { className: "w-3 h-3" })}
                {getStepStatus('biometric')}
              </span>
            </div>

            {/* Step 5: Review & Submit */}
            <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStepStatus('review') === 'completed' ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                {getStepStatus('review') === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <span className="text-white text-sm font-medium">5</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">Review & Submit</h4>
                <p className="text-gray-400 text-sm">Review all information and submit for verification</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(getStepStatus('review'))}`}>
                {React.createElement(getStatusIcon(getStepStatus('review')), { className: "w-3 h-3" })}
                {getStepStatus('review')}
              </span>
            </div>
          </div>
        </div>

        {/* Registration Details */}
        {registrationData && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Registration Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">
                      {registrationData.personalInfo?.firstName} {registrationData.personalInfo?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{registrationData.personalInfo?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white">{registrationData.personalInfo?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nationality:</span>
                    <span className="text-white">{registrationData.personalInfo?.nationality}</span>
                  </div>
                </div>
              </div>

              {/* Blockchain Information */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Blockchain Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wallet Address:</span>
                    <span className="text-white font-mono text-xs">
                      {registrationData.blockchainAddress?.slice(0, 6)}...{registrationData.blockchainAddress?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connection Status:</span>
                    <span className={`${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Feedback */}
        {registrationData?.adminNotes && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Admin Feedback
            </h3>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300">{registrationData.adminNotes}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {overallStatus === 'rejected' && (
            <Link
              to="/voter/registration"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Resubmit Registration
            </Link>
          )}
          
          {overallStatus === 'not_started' && (
            <Link
              to="/voter/registration"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Start Registration
            </Link>
          )}

          {overallStatus === 'in_progress' && (
            <Link
              to="/voter/registration"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Continue Registration
            </Link>
          )}

          <button
            onClick={loadRegistrationData}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <h4 className="text-red-200 font-medium">Error Loading Data</h4>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <button
                  onClick={loadRegistrationData}
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

export default VoterRegistrationStatus;
