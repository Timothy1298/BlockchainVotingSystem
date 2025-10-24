import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  ArrowRight,
  Lock,
  Eye,
  FileText,
  Camera,
  Wallet
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useVoterRegistration } from '../../hooks/voters/useVoterRegistration';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';
import { useGlobalUI } from '../../components/common';
import VoterRegistration from '../../components/voters/registration/VoterRegistration';

const VoterRegistrationPage = () => {
  const { 
    getRegistrationStatus,
    checkEligibility,
    loading,
    error,
    success,
    clearMessages
  } = useVoterRegistration();

  const { selectedAccount, isConnected } = useMetaMaskContext();
  const { showToast } = useGlobalUI();

  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [eligibilityStatus, setEligibilityStatus] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Check registration status when wallet connects
  useEffect(() => {
    if (isConnected && selectedAccount) {
      checkRegistrationStatus();
    }
  }, [isConnected, selectedAccount]);

  // Check registration status
  const checkRegistrationStatus = async () => {
    if (!selectedAccount) return;

    try {
      setIsCheckingStatus(true);
      clearMessages();

      const [status, eligibility] = await Promise.all([
        getRegistrationStatus(selectedAccount),
        checkEligibility(selectedAccount)
      ]);

      setRegistrationStatus(status);
      setEligibilityStatus(eligibility);
    } catch (error) {
      console.error('Failed to check registration status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Handle registration success
  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
    showToast('Registration submitted successfully!', 'success');
    checkRegistrationStatus(); // Refresh status
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      case 'expired': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return CheckCircle;
      case 'pending': return AlertTriangle;
      case 'rejected': return AlertTriangle;
      case 'expired': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6">
            <Users className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Voter Registration</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Register to participate in blockchain-based voting. Complete the verification process to ensure secure and transparent elections.
          </p>
        </div>

        {/* Wallet Connection Status */}
        {!isConnected ? (
          <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-yellow-300">Wallet Not Connected</h2>
            </div>
            <p className="text-yellow-200 mb-4">
              Please connect your MetaMask wallet to check your voter registration status and proceed with registration.
            </p>
            <div className="flex items-center gap-2 text-yellow-300">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Connect your wallet using the MetaMask button in the top navigation</span>
            </div>
          </div>
        ) : (
          /* Registration Status */
          <div className="space-y-6">
            {/* Current Status */}
            {isCheckingStatus ? (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-300">Checking registration status...</span>
                </div>
              </div>
            ) : registrationStatus ? (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Registration Status</h2>
                  <button
                    onClick={checkRegistrationStatus}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Card */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-white">Verification Status</h3>
                    </div>
                    
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(registrationStatus.overallStatus)}`}>
                      {React.createElement(getStatusIcon(registrationStatus.overallStatus), { className: "w-4 h-4" })}
                      <span className="font-medium capitalize">{registrationStatus.overallStatus}</span>
                    </div>
                    
                    {registrationStatus.verificationDate && (
                      <p className="text-gray-400 text-sm mt-2">
                        Verified on: {new Date(registrationStatus.verificationDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Eligibility Card */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-white">Eligibility Status</h3>
                    </div>
                    
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      eligibilityStatus?.isEligible 
                        ? 'text-green-600 bg-green-100 border-green-200' 
                        : 'text-red-600 bg-red-100 border-red-200'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">
                        {eligibilityStatus?.isEligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </div>
                    
                    {eligibilityStatus?.reason && (
                      <p className="text-gray-400 text-sm mt-2">
                        {eligibilityStatus.reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Registration Details */}
                {registrationStatus.overallStatus !== 'not_registered' && (
                  <div className="mt-6 bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">Registration Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Registration ID</p>
                        <p className="text-white font-mono">{registrationStatus.registrationId}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Registered Date</p>
                        <p className="text-white">{new Date(registrationStatus.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Wallet Address</p>
                        <p className="text-white font-mono text-xs">
                          {registrationStatus.walletAddress.slice(0, 6)}...{registrationStatus.walletAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Register New Voter */}
              {(!registrationStatus || registrationStatus.overallStatus === 'not_registered') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">Register to Vote</h3>
                  </div>
                  <p className="text-blue-100 mb-4">
                    Complete the voter registration process to participate in elections.
                  </p>
                  <button
                    onClick={() => setShowRegistrationModal(true)}
                    className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    Start Registration
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* View Registration */}
              {registrationStatus && registrationStatus.overallStatus !== 'not_registered' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-green-600 to-blue-600 rounded-lg p-6 text-white"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">View Registration</h3>
                  </div>
                  <p className="text-green-100 mb-4">
                    View your registration details and verification status.
                  </p>
                  <button
                    onClick={() => setShowRegistrationModal(true)}
                    className="w-full px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    View Details
                    <Eye className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Security Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Security & Privacy</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>End-to-end encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>KYC verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Biometric verification</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* How It Works */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">How It Works</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    <div>
                      <p className="font-medium">Connect Wallet</p>
                      <p className="text-gray-400">Connect your MetaMask wallet</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    <div>
                      <p className="font-medium">Provide Information</p>
                      <p className="text-gray-400">Submit personal details and documents</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                    <div>
                      <p className="font-medium">Biometric Verification</p>
                      <p className="text-gray-400">Complete facial recognition</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                    <div>
                      <p className="font-medium">Admin Review</p>
                      <p className="text-gray-400">Wait for verification approval</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Requirements</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Must be 18 years or older</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Valid government-issued ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Proof of address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>MetaMask wallet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Webcam for biometric verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Modal */}
        {showRegistrationModal && (
          <VoterRegistration
            onClose={() => setShowRegistrationModal(false)}
            onSuccess={handleRegistrationSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default VoterRegistrationPage;
