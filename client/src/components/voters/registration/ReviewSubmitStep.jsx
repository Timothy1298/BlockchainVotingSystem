import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Wallet, 
  FileText, 
  Camera,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  Flag,
  Calendar
} from 'lucide-react';
import { useVoterRegistration } from '../../../contexts/voters/VoterRegistrationContext';

const ReviewSubmitStep = ({ onPrevious }) => {
  const { 
    registrationData, 
    submitRegistration, 
    setError, 
    setSuccess, 
    clearMessages,
    loading,
    resetRegistration
  } = useVoterRegistration();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!hasAgreed) {
      setError('Please agree to the terms and conditions');
      return;
    }

    try {
      setIsSubmitting(true);
      clearMessages();

      await submitRegistration(registrationData);
      setSuccess('Registration submitted successfully! You will receive a confirmation email shortly.');
      
      // Reset form after successful submission
      setTimeout(() => {
        resetRegistration();
      }, 3000);
    } catch (error) {
      setError('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
        <p className="text-gray-600">Please review your information before submitting your registration</p>
      </div>

      {/* Review Sections */}
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900">
                {registrationData.personalInfo.firstName} {registrationData.personalInfo.lastName}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {registrationData.personalInfo.email}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {registrationData.personalInfo.phone}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Date of Birth</label>
              <p className="text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(registrationData.personalInfo.dateOfBirth)}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Nationality</label>
              <p className="text-gray-900 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                {registrationData.personalInfo.nationality}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500">Address</label>
            <p className="text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {registrationData.personalInfo.address.street}, {registrationData.personalInfo.address.city}, {registrationData.personalInfo.address.state} {registrationData.personalInfo.address.zipCode}, {registrationData.personalInfo.address.country}
            </p>
          </div>
        </div>

        {/* Blockchain Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Blockchain Information</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Wallet Type</label>
              <p className="text-gray-900">{registrationData.blockchainInfo.walletType}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Wallet Address</label>
              <p className="text-gray-900 font-mono text-sm bg-gray-100 p-2 rounded">
                {registrationData.blockchainInfo.walletAddress}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Connection Status</label>
              <p className="text-gray-900 flex items-center gap-2">
                {registrationData.blockchainInfo.isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Not Connected
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
          </div>
          
          <div className="space-y-3">
            {registrationData.documents.governmentId && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Government ID</p>
                    <p className="text-sm text-green-700">
                      {registrationData.documents.governmentId.filename} ({formatFileSize(registrationData.documents.governmentId.size)})
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            )}
            
            {registrationData.documents.proofOfAddress && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Proof of Address</p>
                    <p className="text-sm text-green-700">
                      {registrationData.documents.proofOfAddress.filename} ({formatFileSize(registrationData.documents.proofOfAddress.size)})
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            )}
            
            {registrationData.documents.selfie && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Selfie Photo</p>
                    <p className="text-sm text-green-700">
                      {registrationData.documents.selfie.filename} ({formatFileSize(registrationData.documents.selfie.size)})
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            )}
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Verification Status</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Biometric Verification</span>
              <span className={`flex items-center gap-2 text-sm ${
                registrationData.verification.biometricStatus === 'verified' 
                  ? 'text-green-600' 
                  : 'text-yellow-600'
              }`}>
                {registrationData.verification.biometricStatus === 'verified' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Pending
                  </>
                )}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Status</span>
              <span className="flex items-center gap-2 text-sm text-yellow-600">
                <Clock className="w-4 h-4" />
                Pending Review
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
        
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium mb-2">Voter Registration Agreement</h4>
            <p>
              By submitting this registration, you agree to the following terms:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>You are providing accurate and truthful information</li>
              <li>You are eligible to vote according to applicable laws</li>
              <li>You understand that false information may result in legal consequences</li>
              <li>You consent to identity verification processes</li>
              <li>You agree to the storage and processing of your personal data</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Data Protection</h4>
            <p>
              Your personal information will be processed in accordance with applicable data protection laws. 
              We will use your information solely for voter registration and verification purposes.
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I have read and agree to the terms and conditions, and I confirm that all information provided is accurate and truthful.
            </span>
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!hasAgreed || isSubmitting || loading}
          className={`px-8 py-3 rounded-lg text-white transition-colors flex items-center gap-2 ${
            hasAgreed && !isSubmitting && !loading
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting || loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Submit Registration
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ReviewSubmitStep;
