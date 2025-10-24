import { useCallback } from 'react';
import { useVoterRegistration as useVoterRegistrationContext } from '../../contexts/voters/VoterRegistrationContext';

/**
 * Custom hook for voter registration functionality
 * Provides a simplified interface to the voter registration context
 */
export const useVoterRegistration = () => {
  const context = useVoterRegistrationContext();

  // Simplified API methods
  const registerVoter = useCallback(async (registrationData) => {
    try {
      context.setLoading(true);
      context.clearMessages();
      
      const result = await context.api.submitRegistration(registrationData);
      
      context.setSuccess('Voter registration submitted successfully!');
      return result;
    } catch (error) {
      context.setError(error.message || 'Failed to submit registration');
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  const uploadDocument = useCallback(async (documentType, file) => {
    try {
      context.setLoading(true);
      context.clearMessages();
      
      const result = await context.api.uploadDocument(documentType, file);
      
      context.setSuccess('Document uploaded successfully!');
      return result;
    } catch (error) {
      context.setError(error.message || 'Failed to upload document');
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  const verifyBiometric = useCallback(async (voterId, biometricData) => {
    try {
      context.setLoading(true);
      context.clearMessages();
      
      const result = await context.api.verifyBiometric(voterId, biometricData);
      
      if (result.isVerified) {
        context.setSuccess('Biometric verification successful!');
        context.updateVerificationStatus({
          biometricStatus: 'verified',
          verificationDate: new Date().toISOString()
        });
      } else {
        context.setError(result.reason || 'Biometric verification failed');
        context.updateVerificationStatus({
          biometricStatus: 'rejected'
        });
      }
      
      return result;
    } catch (error) {
      context.setError(error.message || 'Failed to verify biometric');
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  const checkEligibility = useCallback(async (walletAddress) => {
    try {
      context.setLoading(true);
      context.clearMessages();
      
      const result = await context.api.checkEligibility(walletAddress);
      
      if (result.isEligible) {
        context.setSuccess('Wallet address is eligible for registration!');
      } else {
        context.setError(result.reason || 'Wallet address is not eligible');
      }
      
      return result;
    } catch (error) {
      context.setError(error.message || 'Failed to check eligibility');
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  const getRegistrationStatus = useCallback(async (walletAddress) => {
    try {
      context.setLoading(true);
      context.clearMessages();
      
      const result = await context.api.getRegistrationStatus(walletAddress);
      return result;
    } catch (error) {
      context.setError(error.message || 'Failed to get registration status');
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  // Admin methods
  const verifyVoter = useCallback(async (voterId, verificationData) => {
    try {
      context.setLoading(true);
      context.clearMessages();
      
      const result = await context.api.verifyVoter(voterId, verificationData);
      
      context.setSuccess('Voter verification completed!');
      context.updateVoter(result);
      return result;
    } catch (error) {
      context.setError(error.message || 'Failed to verify voter');
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  const updateVoterStatus = useCallback(async (voterId, status, notes = '') => {
    try {
      context.setLoading(true);
      context.clearMessages();
      
      const result = await context.api.updateVoterStatus(voterId, status, notes);
      
      context.setSuccess('Voter status updated successfully!');
      context.updateVoter(result);
      return result;
    } catch (error) {
      context.setError(error.message || 'Failed to update voter status');
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  const getVoters = useCallback(async (filters = {}) => {
    try {
      context.setVotersLoading(true);
      
      const result = await context.api.getVoters(filters);
      
      context.setVoters(result.voters);
      context.setStatistics(result.statistics);
      return result;
    } catch (error) {
      context.setVotersError(error.message || 'Failed to fetch voters');
      throw error;
    } finally {
      context.setVotersLoading(false);
    }
  }, [context]);

  const getVerificationQueue = useCallback(async () => {
    try {
      context.setQueueLoading(true);
      
      const result = await context.api.getVerificationQueue();
      
      context.setVerificationQueue(result);
      return result;
    } catch (error) {
      context.setQueueError(error.message || 'Failed to fetch verification queue');
      throw error;
    } finally {
      context.setQueueLoading(false);
    }
  }, [context]);

  const exportVoters = useCallback(async (filters = {}) => {
    try {
      context.setLoading(true);
      context.clearMessages();
      
      const result = await context.api.exportVoters(filters);
      
      context.setSuccess('Voters exported successfully!');
      return result;
    } catch (error) {
      context.setError(error.message || 'Failed to export voters');
      throw error;
    } finally {
      context.setLoading(false);
    }
  }, [context]);

  // Utility methods
  const resetRegistration = useCallback(() => {
    context.resetRegistration();
  }, [context]);

  const clearMessages = useCallback(() => {
    context.clearMessages();
  }, [context]);

  const goToStep = useCallback((step) => {
    context.setCurrentStep(step);
  }, [context]);

  const nextStep = useCallback(() => {
    if (context.currentStep < context.totalSteps) {
      context.setCurrentStep(context.currentStep + 1);
    }
  }, [context]);

  const previousStep = useCallback(() => {
    if (context.currentStep > 1) {
      context.setCurrentStep(context.currentStep - 1);
    }
  }, [context]);

  // Validation helpers
  const validatePersonalInfo = useCallback((personalInfo) => {
    const errors = {};
    
    if (!personalInfo.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!personalInfo.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!personalInfo.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!personalInfo.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!personalInfo.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(personalInfo.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        errors.dateOfBirth = 'You must be at least 18 years old';
      }
    }
    
    if (!personalInfo.nationality) {
      errors.nationality = 'Nationality is required';
    }
    
    // Address validation
    if (!personalInfo.address?.street?.trim()) {
      errors['address.street'] = 'Street address is required';
    }
    
    if (!personalInfo.address?.city?.trim()) {
      errors['address.city'] = 'City is required';
    }
    
    if (!personalInfo.address?.state?.trim()) {
      errors['address.state'] = 'State/Province is required';
    }
    
    if (!personalInfo.address?.zipCode?.trim()) {
      errors['address.zipCode'] = 'ZIP/Postal code is required';
    }
    
    if (!personalInfo.address?.country) {
      errors['address.country'] = 'Country is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  const validateBlockchainInfo = useCallback((blockchainInfo) => {
    const errors = {};
    
    if (!blockchainInfo.walletAddress?.trim()) {
      errors.walletAddress = 'Wallet address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(blockchainInfo.walletAddress.trim())) {
      errors.walletAddress = 'Please enter a valid Ethereum wallet address';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  const validateDocuments = useCallback((documents) => {
    const errors = {};
    
    if (!documents.governmentId) {
      errors.governmentId = 'Government ID is required';
    }
    
    if (!documents.proofOfAddress) {
      errors.proofOfAddress = 'Proof of address is required';
    }
    
    if (!documents.selfie) {
      errors.selfie = 'Selfie photo is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  // Return simplified interface
  return {
    // State
    ...context,
    
    // Simplified API methods
    registerVoter,
    uploadDocument,
    verifyBiometric,
    checkEligibility,
    getRegistrationStatus,
    
    // Admin methods
    verifyVoter,
    updateVoterStatus,
    getVoters,
    getVerificationQueue,
    exportVoters,
    
    // Utility methods
    resetRegistration,
    clearMessages,
    goToStep,
    nextStep,
    previousStep,
    
    // Validation helpers
    validatePersonalInfo,
    validateBlockchainInfo,
    validateDocuments
  };
};

export default useVoterRegistration;
