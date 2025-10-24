import React, { createContext, useContext, useReducer, useCallback, useState, useEffect } from 'react';
import { voterRegistrationAPI } from '../../services/api/voterRegistrationAPI';

// Initial state
const initialState = {
  // Voter registration data
  registrationData: {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    },
    blockchainInfo: {
      walletAddress: '',
      walletType: 'MetaMask',
      isConnected: false
    },
    documents: {
      governmentId: null,
      proofOfAddress: null,
      selfie: null
    },
    verification: {
      kycStatus: 'pending', // pending, verified, rejected, expired
      biometricStatus: 'pending', // pending, verified, rejected
      overallStatus: 'pending', // pending, verified, rejected, expired
      verificationDate: null,
      expiryDate: null,
      verificationNotes: ''
    }
  },
  
  // UI state
  currentStep: 1,
  totalSteps: 4,
  loading: false,
  error: null,
  success: null,
  
  // Voter list for admin
  voters: [],
  votersLoading: false,
  votersError: null,
  
  // Verification queue for admin
  verificationQueue: [],
  queueLoading: false,
  queueError: null,
  
  // Statistics
  statistics: {
    totalVoters: 0,
    verifiedVoters: 0,
    pendingVoters: 0,
    rejectedVoters: 0,
    expiredVoters: 0
  }
};

// Action types
const VOTER_REGISTRATION_ACTIONS = {
  // Registration flow
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  UPDATE_PERSONAL_INFO: 'UPDATE_PERSONAL_INFO',
  UPDATE_BLOCKCHAIN_INFO: 'UPDATE_BLOCKCHAIN_INFO',
  UPDATE_DOCUMENTS: 'UPDATE_DOCUMENTS',
  UPDATE_VERIFICATION_STATUS: 'UPDATE_VERIFICATION_STATUS',
  
  // API states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  
  // Voter management
  SET_VOTERS: 'SET_VOTERS',
  SET_VOTERS_LOADING: 'SET_VOTERS_LOADING',
  SET_VOTERS_ERROR: 'SET_VOTERS_ERROR',
  UPDATE_VOTER: 'UPDATE_VOTER',
  REMOVE_VOTER: 'REMOVE_VOTER',
  
  // Verification queue
  SET_VERIFICATION_QUEUE: 'SET_VERIFICATION_QUEUE',
  SET_QUEUE_LOADING: 'SET_QUEUE_LOADING',
  SET_QUEUE_ERROR: 'SET_QUEUE_ERROR',
  
  // Statistics
  SET_STATISTICS: 'SET_STATISTICS',
  
  // Reset
  RESET_REGISTRATION: 'RESET_REGISTRATION',
  RESET_ALL: 'RESET_ALL'
};

// Reducer
const voterRegistrationReducer = (state, action) => {
  switch (action.type) {
    case VOTER_REGISTRATION_ACTIONS.SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: action.payload
      };
      
    case VOTER_REGISTRATION_ACTIONS.UPDATE_PERSONAL_INFO:
      return {
        ...state,
        registrationData: {
          ...state.registrationData,
          personalInfo: {
            ...(state.registrationData?.personalInfo || {}),
            ...action.payload
          }
        }
      };
      
    case VOTER_REGISTRATION_ACTIONS.UPDATE_BLOCKCHAIN_INFO:
      return {
        ...state,
        registrationData: {
          ...state.registrationData,
          blockchainInfo: {
            ...(state.registrationData?.blockchainInfo || {}),
            ...action.payload
          }
        }
      };
      
    case VOTER_REGISTRATION_ACTIONS.UPDATE_DOCUMENTS:
      return {
        ...state,
        registrationData: {
          ...state.registrationData,
          documents: {
            ...(state.registrationData?.documents || {}),
            ...action.payload
          }
        }
      };
      
    case VOTER_REGISTRATION_ACTIONS.UPDATE_VERIFICATION_STATUS:
      return {
        ...state,
        registrationData: {
          ...state.registrationData,
          verification: {
            ...(state.registrationData?.verification || {}),
            ...action.payload
          }
        }
      };
      
    case VOTER_REGISTRATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case VOTER_REGISTRATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
      
    case VOTER_REGISTRATION_ACTIONS.SET_SUCCESS:
      return {
        ...state,
        success: action.payload,
        loading: false
      };
      
    case VOTER_REGISTRATION_ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        error: null,
        success: null
      };
      
    case VOTER_REGISTRATION_ACTIONS.SET_VOTERS:
      return {
        ...state,
        voters: action.payload,
        votersLoading: false
      };
      
    case VOTER_REGISTRATION_ACTIONS.SET_VOTERS_LOADING:
      return {
        ...state,
        votersLoading: action.payload
      };
      
    case VOTER_REGISTRATION_ACTIONS.SET_VOTERS_ERROR:
      return {
        ...state,
        votersError: action.payload,
        votersLoading: false
      };
      
    case VOTER_REGISTRATION_ACTIONS.UPDATE_VOTER:
      return {
        ...state,
        voters: state.voters.map(voter => 
          voter.id === action.payload.id ? { ...voter, ...action.payload } : voter
        )
      };
      
    case VOTER_REGISTRATION_ACTIONS.REMOVE_VOTER:
      return {
        ...state,
        voters: state.voters.filter(voter => voter.id !== action.payload)
      };
      
    case VOTER_REGISTRATION_ACTIONS.SET_VERIFICATION_QUEUE:
      return {
        ...state,
        verificationQueue: action.payload,
        queueLoading: false
      };
      
    case VOTER_REGISTRATION_ACTIONS.SET_QUEUE_LOADING:
      return {
        ...state,
        queueLoading: action.payload
      };
      
    case VOTER_REGISTRATION_ACTIONS.SET_QUEUE_ERROR:
      return {
        ...state,
        queueError: action.payload,
        queueLoading: false
      };
      
    case VOTER_REGISTRATION_ACTIONS.SET_STATISTICS:
      return {
        ...state,
        statistics: action.payload
      };
      
    case VOTER_REGISTRATION_ACTIONS.RESET_REGISTRATION:
      return {
        ...state,
        registrationData: initialState.registrationData,
        currentStep: 1,
        loading: false,
        error: null,
        success: null
      };
      
    case VOTER_REGISTRATION_ACTIONS.RESET_ALL:
      return initialState;
      
    default:
      return state;
  }
};

// Context
const VoterRegistrationContext = createContext();

// Provider component
export const VoterRegistrationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(voterRegistrationReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ensure the context is properly initialized
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Action creators
  const actions = {
    // Registration flow
    setCurrentStep: useCallback((step) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.SET_CURRENT_STEP, payload: step });
    }, []),
    
    updatePersonalInfo: useCallback((data) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.UPDATE_PERSONAL_INFO, payload: data });
    }, []),
    
    updateBlockchainInfo: useCallback((data) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.UPDATE_BLOCKCHAIN_INFO, payload: data });
    }, []),
    
    updateDocuments: useCallback((data) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.UPDATE_DOCUMENTS, payload: data });
    }, []),
    
    updateVerificationStatus: useCallback((data) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.UPDATE_VERIFICATION_STATUS, payload: data });
    }, []),
    
    // API actions
    setLoading: useCallback((loading) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.SET_LOADING, payload: loading });
    }, []),
    
    setError: useCallback((error) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.SET_ERROR, payload: error });
    }, []),
    
    setSuccess: useCallback((success) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.SET_SUCCESS, payload: success });
    }, []),
    
    clearMessages: useCallback(() => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.CLEAR_MESSAGES });
    }, []),
    
    // Voter management
    setVoters: useCallback((voters) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.SET_VOTERS, payload: voters });
    }, []),
    
    setVotersLoading: useCallback((loading) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.SET_VOTERS_LOADING, payload: loading });
    }, []),
    
    setVotersError: useCallback((error) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.SET_VOTERS_ERROR, payload: error });
    }, []),
    
    updateVoter: useCallback((voter) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.UPDATE_VOTER, payload: voter });
    }, []),
    
    removeVoter: useCallback((voterId) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.REMOVE_VOTER, payload: voterId });
    }, []),
    
    // Verification queue
    setVerificationQueue: useCallback((queue) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.SET_VERIFICATION_QUEUE, payload: queue });
    }, []),
    
    setQueueLoading: useCallback((loading) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.SET_QUEUE_LOADING, payload: loading });
    }, []),
    
    setQueueError: useCallback((error) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.SET_QUEUE_ERROR, payload: error });
    }, []),
    
    // Statistics
    setStatistics: useCallback((stats) => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.SET_STATISTICS, payload: stats });
    }, []),
    
    // Reset
    resetRegistration: useCallback(() => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.RESET_REGISTRATION });
    }, []),
    
    resetAll: useCallback(() => {
      dispatch({ type: VOTER_REGISTRATION_ACTIONS.RESET_ALL });
    }, [])
  };

  // API functions
  const api = {
    // Submit registration
    submitRegistration: useCallback(async (registrationData) => {
      try {
        actions.setLoading(true);
        actions.clearMessages();
        
        const response = await voterRegistrationAPI.submitRegistration(registrationData);
        
        actions.setSuccess('Registration submitted successfully!');
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to submit registration';
        actions.setError(errorMessage);
        throw error;
      }
    }, [actions]),
    
    // Upload documents
    uploadDocument: useCallback(async (documentType, file) => {
      try {
        actions.setLoading(true);
        actions.clearMessages();
        
        const response = await voterRegistrationAPI.uploadDocument(documentType, file);
        
        actions.setSuccess('Document uploaded successfully!');
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to upload document';
        actions.setError(errorMessage);
        throw error;
      }
    }, [actions]),
    
    // Verify voter (admin only)
    verifyVoter: useCallback(async (voterId, verificationData) => {
      try {
        actions.setLoading(true);
        actions.clearMessages();
        
        const response = await voterRegistrationAPI.verifyVoter(voterId, verificationData);
        
        actions.setSuccess('Voter verification completed!');
        actions.updateVoter(response.data);
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to verify voter';
        actions.setError(errorMessage);
        throw error;
      }
    }, [actions]),
    
    // Get voters list (admin only)
    getVoters: useCallback(async (filters = {}) => {
      try {
        actions.setVotersLoading(true);
        
        const response = await voterRegistrationAPI.getVoters(filters);
        
        actions.setVoters(response.data.voters);
        actions.setStatistics(response.data.statistics);
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch voters';
        actions.setVotersError(errorMessage);
        throw error;
      }
    }, [actions]),
    
    // Get verification queue (admin only)
    getVerificationQueue: useCallback(async () => {
      try {
        actions.setQueueLoading(true);
        
        const response = await voterRegistrationAPI.getVerificationQueue();
        
        actions.setVerificationQueue(response.data);
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch verification queue';
        actions.setQueueError(errorMessage);
        throw error;
      }
    }, [actions]),
    
    // Check voter eligibility
    checkEligibility: useCallback(async (walletAddress) => {
      try {
        actions.setLoading(true);
        actions.clearMessages();
        
        const response = await voterRegistrationAPI.checkEligibility(walletAddress);
        
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to check eligibility';
        actions.setError(errorMessage);
        throw error;
      }
    }, [actions])
  };

  const value = {
    // State
    ...state,
    isInitialized,
    
    // Actions
    ...actions,
    
    // API
    api
  };

  return (
    <VoterRegistrationContext.Provider value={value}>
      {children}
    </VoterRegistrationContext.Provider>
  );
};

// Custom hook
export const useVoterRegistration = () => {
  const context = useContext(VoterRegistrationContext);
  if (!context) {
    throw new Error('useVoterRegistration must be used within a VoterRegistrationProvider');
  }
  return context;
};

export default VoterRegistrationContext;
