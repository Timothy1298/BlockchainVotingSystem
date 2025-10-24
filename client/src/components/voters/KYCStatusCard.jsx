import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Download
} from 'lucide-react';
import { useGlobalUI } from '../common';
import { useAuth } from '../../contexts/auth/AuthContext';
import { voterRegistrationAPI } from '../../services/api/voterRegistrationAPI';

const KYCStatusCard = ({ voterId, onStatusUpdate }) => {
  const { showLoader, hideLoader, showToast } = useGlobalUI();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState({
    status: 'pending',
    documents: {
      governmentId: { status: 'pending', uploaded: false },
      proofOfAddress: { status: 'pending', uploaded: false },
      selfie: { status: 'pending', uploaded: false }
    },
    biometricVerification: { status: 'pending', completed: false },
    overallStatus: 'pending',
    lastUpdated: null,
    adminNotes: null
  });
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const lastLoadTimeRef = useRef(0);

  // Ensure component is marked as mounted on every render
  useEffect(() => {
    isMountedRef.current = true;
  });

  const loadKYCStatus = useCallback(async () => {
    // Debounce: prevent rapid successive calls (minimum 1 second between calls)
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 1000) {
      console.log('KYC Status: Debounced, skipping API call');
      return;
    }
    lastLoadTimeRef.current = now;
    
    console.log('KYC Status: Starting API call...');
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        console.log('KYC Status: Timeout reached, hiding loader...');
        setLoading(false);
        // Don't use global loader to avoid conflicts
        // hideLoader();
        showToast('KYC status loading timed out', 'error');
      }
    }, 10000); // 10 second timeout
    
    try {
      console.log('KYC Status: Setting loading to true...');
      setLoading(true);
      // Don't use global loader to avoid conflicts
      // showLoader('Loading KYC status...');

      // Check if user is authenticated and has voter role before making API call
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('KYC Status: No token found');
        throw new Error('User not authenticated');
      }
      
      if (!user || user.role !== 'voter') {
        console.error('KYC Status: User not valid', { user: user?.role });
        throw new Error('User does not have voter role');
      }

      console.log('KYC Status: Making API call...');
      const response = await voterRegistrationAPI.getKycStatus();
      const responseData = response.data?.data || response.data;
      
      console.log('KYC Status Response:', response);
      console.log('KYC Response Data:', responseData);
      
      // Map server response to component state
      const mappedStatus = {
        status: responseData?.kycInfo?.verification?.kycStatus || 'pending',
        documents: {
          governmentId: { 
            status: responseData?.kycInfo?.documents?.governmentId?.verified ? 'verified' : 'pending',
            uploaded: !!responseData?.kycInfo?.documents?.governmentId?.fileUrl
          },
          proofOfAddress: { 
            status: responseData?.kycInfo?.documents?.proofOfAddress?.verified ? 'verified' : 'pending',
            uploaded: !!responseData?.kycInfo?.documents?.proofOfAddress?.fileUrl
          },
          selfie: { 
            status: responseData?.kycInfo?.documents?.selfie?.verified ? 'verified' : 'pending',
            uploaded: !!responseData?.kycInfo?.documents?.selfie?.fileUrl
          }
        },
        biometricVerification: { 
          status: responseData?.kycInfo?.verification?.biometricStatus || 'pending',
          completed: responseData?.kycInfo?.verification?.biometricStatus === 'verified'
        },
        overallStatus: responseData?.kycInfo?.verification?.overallStatus || 'pending',
        lastUpdated: responseData?.kycInfo?.updatedAt || responseData?.kycInfo?.verification?.updatedAt,
        adminNotes: responseData?.kycInfo?.verification?.adminNotes
      };
      
      if (isMountedRef.current) {
        console.log('KYC Status: Setting status data...', mappedStatus);
        setKycStatus(prevStatus => {
          console.log('KYC Status: Previous status:', prevStatus);
          console.log('KYC Status: New status:', mappedStatus);
          // Only call onStatusUpdate if the overall status actually changed
          if (onStatusUpdate && prevStatus.overallStatus !== mappedStatus.overallStatus) {
            console.log('KYC Status: Status changed, calling onStatusUpdate');
            onStatusUpdate(mappedStatus);
          }
          return mappedStatus;
        });
        console.log('KYC Status: Status data set successfully');
      } else {
        console.log('KYC Status: Component not mounted, cannot set status data');
      }
    } catch (error) {
      console.error('KYC status error:', error);
      showToast(`Failed to load KYC status: ${error.message}`, 'error');
      
      // Set a default status so the component can still render
      if (isMountedRef.current) {
        setKycStatus({
          status: 'pending',
          documents: {
            governmentId: { status: 'pending', uploaded: false },
            proofOfAddress: { status: 'pending', uploaded: false },
            selfie: { status: 'pending', uploaded: false }
          },
          biometricVerification: { status: 'pending', completed: false },
          overallStatus: 'pending',
          lastUpdated: null,
          adminNotes: null
        });
      }
    } finally {
      console.log('KYC Status: API call completed, hiding loader...');
      clearTimeout(timeoutId);
      if (isMountedRef.current) {
        console.log('KYC Status: Setting loading to false...');
        setLoading(false);
        // Don't use global loader to avoid conflicts
        // hideLoader();
      } else {
        console.log('KYC Status: Component not mounted, skipping state update');
      }
    }
  }, [user, showToast, onStatusUpdate]);

  // Load KYC status on mount and when user changes
  useEffect(() => {
    console.log('KYC Status: useEffect triggered', { user: user?.role, hasUser: !!user });
    if (user && user.role === 'voter') {
      console.log('KYC Status: User is voter, calling loadKYCStatus...');
      loadKYCStatus();
    } else {
      console.log('KYC Status: User is not voter or not loaded yet');
    }
  }, [user, loadKYCStatus]); // Depend on user object and loadKYCStatus function

  // Separate cleanup effect
  useEffect(() => {
    return () => {
      console.log('KYC Status: Component unmounting...');
      isMountedRef.current = false;
    };
  }, []);

  // Debug loading state changes
  useEffect(() => {
    console.log('KYC Status: Loading state changed to:', loading);
  }, [loading]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200';
      case 'under_review': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      case 'under_review': return Eye;
      default: return Clock;
    }
  };

  // Get overall status message
  const getOverallStatusMessage = () => {
    switch (kycStatus.overallStatus) {
      case 'verified':
        return {
          message: 'Your KYC verification is complete and approved',
          color: 'text-green-400',
          bgColor: 'bg-green-600/20 border-green-600/50'
        };
      case 'under_review':
        return {
          message: 'Your documents are under review by our admin team',
          color: 'text-blue-400',
          bgColor: 'bg-blue-600/20 border-blue-600/50'
        };
      case 'rejected':
        return {
          message: 'Your KYC verification was rejected. Please check the notes and resubmit',
          color: 'text-red-400',
          bgColor: 'bg-red-600/20 border-red-600/50'
        };
      case 'pending':
      default:
        return {
          message: 'Please complete your KYC verification to participate in elections',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-600/20 border-yellow-600/50'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading KYC status...</p>
            <button
              onClick={() => {
                console.log('KYC Status: Manual retry triggered');
                loadKYCStatus();
              }}
              className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getOverallStatusMessage();

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          KYC Verification Status
        </h3>
        <button
          onClick={loadKYCStatus}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Overall Status */}
      <div className={`${statusInfo.bgColor} rounded-lg p-4 mb-6`}>
        <div className="flex items-center gap-3">
          {kycStatus.overallStatus === 'verified' ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : kycStatus.overallStatus === 'rejected' ? (
            <XCircle className="w-6 h-6 text-red-400" />
          ) : (
            <Clock className="w-6 h-6 text-yellow-400" />
          )}
          <div>
            <h4 className={`font-medium ${statusInfo.color}`}>
              {kycStatus.overallStatus === 'verified' ? 'Verified' :
               kycStatus.overallStatus === 'under_review' ? 'Under Review' :
               kycStatus.overallStatus === 'rejected' ? 'Rejected' : 'Pending'}
            </h4>
            <p className="text-gray-300 text-sm mt-1">{statusInfo.message}</p>
          </div>
        </div>
      </div>

      {/* Document Status */}
      <div className="space-y-4">
        <h4 className="text-white font-medium mb-3">Document Verification</h4>
        
        {/* Government ID */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <h5 className="text-white font-medium">Government ID</h5>
                <p className="text-gray-400 text-sm">Passport, Driver's License, or National ID</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(kycStatus.documents.governmentId.status)}`}>
                {React.createElement(getStatusIcon(kycStatus.documents.governmentId.status), { className: "w-3 h-3" })}
                {kycStatus.documents.governmentId.status}
              </span>
            </div>
          </div>
        </div>

        {/* Proof of Address */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <h5 className="text-white font-medium">Proof of Address</h5>
                <p className="text-gray-400 text-sm">Utility bill, bank statement, or official document</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(kycStatus.documents.proofOfAddress.status)}`}>
                {React.createElement(getStatusIcon(kycStatus.documents.proofOfAddress.status), { className: "w-3 h-3" })}
                {kycStatus.documents.proofOfAddress.status}
              </span>
            </div>
          </div>
        </div>

        {/* Selfie */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-gray-400" />
              <div>
                <h5 className="text-white font-medium">Selfie Photo</h5>
                <p className="text-gray-400 text-sm">Clear photo for biometric verification</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(kycStatus.documents.selfie.status)}`}>
                {React.createElement(getStatusIcon(kycStatus.documents.selfie.status), { className: "w-3 h-3" })}
                {kycStatus.documents.selfie.status}
              </span>
            </div>
          </div>
        </div>

        {/* Biometric Verification */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <h5 className="text-white font-medium">Biometric Verification</h5>
                <p className="text-gray-400 text-sm">Facial recognition and liveness detection</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(kycStatus.biometricVerification.status)}`}>
                {React.createElement(getStatusIcon(kycStatus.biometricVerification.status), { className: "w-3 h-3" })}
                {kycStatus.biometricVerification.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      {kycStatus.adminNotes && (
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Admin Notes
          </h4>
          <p className="text-gray-300 text-sm">{kycStatus.adminNotes}</p>
        </div>
      )}

      {/* Last Updated */}
      {kycStatus.lastUpdated && (
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs">
            Last updated: {new Date(kycStatus.lastUpdated).toLocaleString()}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        {kycStatus.overallStatus === 'rejected' && (
          <button 
            onClick={() => navigate('/voter/kyc')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Resubmit Documents
          </button>
        )}
        
        {kycStatus.overallStatus === 'pending' && (
          <button 
            onClick={() => navigate('/voter/kyc')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Complete KYC
          </button>
        )}

        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>
    </div>
  );
};

export default KYCStatusCard;
