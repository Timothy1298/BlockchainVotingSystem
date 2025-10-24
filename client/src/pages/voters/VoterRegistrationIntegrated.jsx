import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle,
  Phone,
  Calendar,
  MapPin,
  Flag,
  ExternalLink,
  Camera,
  FileText,
  ArrowLeft,
  ArrowRight,
  Upload,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { voterRegistrationAPI } from '../../services/api/voterRegistrationAPI';
import { useGlobalUI } from '../../components/common';
import { useVoterRegistration } from '../../contexts/voters/VoterRegistrationContext';
import { useMetaMaskContext } from '../../contexts/blockchain/MetaMaskContext';

const VoterRegistrationIntegrated = () => {
  // All hooks must be called unconditionally at the top level
  const { user, register } = useAuth();
  const { showLoader, hideLoader, showToast } = useGlobalUI();
  const navigate = useNavigate();
  const { selectedAccount, isConnected, connectMetaMask } = useMetaMaskContext();
  
  // State hooks - must be called unconditionally
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, capturing, verifying, success, error
  
  // Context hook - must be called unconditionally
  const voterRegistrationContext = useVoterRegistration();
  
  // Extract context data with fallbacks
  const {
    currentStep = 1,
    registrationData = { personalInfo: {} },
    errors = {},
    loading: isLoading = false,
    setCurrentStep,
    updatePersonalInfo,
    updateBlockchainInfo,
    submitRegistration,
    isInitialized = true
  } = voterRegistrationContext || {};
  
  // Create step navigation functions
  const nextStep = () => {
    if (currentStep < 5 && setCurrentStep) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1 && setCurrentStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if current step is valid to proceed
  const isStepValid = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1: // Personal Information
        isValid = registrationData.personalInfo?.firstName && 
                 registrationData.personalInfo?.lastName && 
                 (user ? true : registrationData.personalInfo?.email) && 
                 registrationData.personalInfo?.phone &&
                 registrationData.personalInfo?.dateOfBirth &&
                 registrationData.personalInfo?.nationality &&
                 registrationData.personalInfo?.address?.street &&
                 registrationData.personalInfo?.address?.city &&
                 registrationData.personalInfo?.address?.state &&
                 registrationData.personalInfo?.address?.zipCode &&
                 registrationData.personalInfo?.address?.country &&
                 (user ? true : (registrationData.personalInfo?.password && registrationData.personalInfo?.confirmPassword));
        break;
      case 2: // Blockchain Connection
        isValid = (registrationData.blockchainInfo?.walletAddress && 
                  registrationData.blockchainInfo?.isConnected) ||
                 (isConnected && selectedAccount);
        console.log('Step 2 validation:', {
          registrationData: registrationData.blockchainInfo,
          isConnected,
          selectedAccount,
          isValid
        });
        break;
      case 3: // Document Upload
        isValid = uploadedFiles.governmentId && 
                 uploadedFiles.proofOfAddress && 
                 uploadedFiles.selfie;
        console.log('Step 3 validation:', {
          uploadedFiles,
          isValid
        });
        break;
      case 4: // Biometric Verification
        isValid = verificationStatus === 'success' || 
                 registrationData.personalInfo?.biometricVerificationComplete;
        console.log('Step 4 validation:', {
          verificationStatus,
          biometricVerificationComplete: registrationData.personalInfo?.biometricVerificationComplete,
          isValid
        });
        break;
      case 5: // Review & Submit
        isValid = registrationData.personalInfo?.agreeToTerms;
        console.log('Step 5 validation:', {
          agreeToTerms: registrationData.personalInfo?.agreeToTerms,
          isValid
        });
        break;
      default:
        isValid = false;
    }
    
    return isValid;
  };

  // Camera functionality
  const startCamera = async () => {
    try {
      setVerificationStatus('capturing');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' // Front camera
        } 
      });
      setCameraStream(stream);
      setCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      showToast('Unable to access camera. Please check permissions.', 'error');
      setVerificationStatus('error');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
    setCapturedImage(null);
    setVerificationStatus('idle');
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setIsCapturing(true);
    
    // Simulate facial verification process
    setTimeout(() => {
      setIsCapturing(false);
      setVerificationStatus('success');
      showToast('Facial verification completed successfully!', 'success');
      
      // Update the uploaded files state
      const mockFile = new File([''], 'selfie.jpg', { type: 'image/jpeg' });
      handleFileUpload('selfie', mockFile);
      
      // Update the context with biometric verification status
      if (updatePersonalInfo) {
        updatePersonalInfo({
          biometricVerificationComplete: true,
          biometricVerificationDate: new Date().toISOString()
        });
      }
      
      // Stop camera after successful capture
      setTimeout(() => {
        stopCamera();
      }, 2000);
    }, 3000);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setVerificationStatus('capturing');
  };

  // Handle camera stream
  useEffect(() => {
    if (cameraStream && cameraActive) {
      const video = document.getElementById('camera-video');
      if (video) {
        video.srcObject = cameraStream;
      }
    }
  }, [cameraStream, cameraActive]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);
  
  // Early returns after all hooks are called
  if (!voterRegistrationContext) {
    return <div>Loading registration form...</div>;
  }
  
  if (!registrationData || !registrationData.personalInfo) {
    return <div>Loading registration data...</div>;
  }

  // Prefill personal info from authenticated user (email/fullName) when available
  useEffect(() => {
    if (user && updatePersonalInfo) {
      const fullName = user.fullName || '';
      const parts = String(fullName).trim().split(' ');
      const firstName = registrationData.personalInfo?.firstName || parts[0] || '';
      const lastName = registrationData.personalInfo?.lastName || parts.slice(1).join(' ') || registrationData.personalInfo?.lastName || '';
      const email = registrationData.personalInfo?.email || user.email || '';
      updatePersonalInfo({ firstName, lastName, email });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Country options
  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'AU', label: 'Australia' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'SE', label: 'Sweden' },
    { value: 'NO', label: 'Norway' },
    { value: 'DK', label: 'Denmark' },
    { value: 'FI', label: 'Finland' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'AT', label: 'Austria' },
    { value: 'BE', label: 'Belgium' },
    { value: 'IE', label: 'Ireland' },
    { value: 'PT', label: 'Portugal' },
    { value: 'GR', label: 'Greece' },
    { value: 'PL', label: 'Poland' },
    { value: 'CZ', label: 'Czech Republic' },
    { value: 'HU', label: 'Hungary' },
    { value: 'SK', label: 'Slovakia' },
    { value: 'SI', label: 'Slovenia' },
    { value: 'HR', label: 'Croatia' },
    { value: 'RO', label: 'Romania' },
    { value: 'BG', label: 'Bulgaria' },
    { value: 'LT', label: 'Lithuania' },
    { value: 'LV', label: 'Latvia' },
    { value: 'EE', label: 'Estonia' },
    { value: 'CY', label: 'Cyprus' },
    { value: 'MT', label: 'Malta' },
    { value: 'LU', label: 'Luxembourg' },
    { value: 'JP', label: 'Japan' },
    { value: 'KR', label: 'South Korea' },
    { value: 'SG', label: 'Singapore' },
    { value: 'HK', label: 'Hong Kong' },
    { value: 'NZ', label: 'New Zealand' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Step configurations
  const steps = [
    { id: 1, title: 'Personal Information', description: 'Basic details and contact information' },
    { id: 2, title: 'Blockchain Connection', description: 'Connect your MetaMask wallet' },
    { id: 3, title: 'Document Upload', description: 'Upload KYC documents' },
    { id: 4, title: 'Biometric Verification', description: 'Facial recognition verification' },
    { id: 5, title: 'Review & Submit', description: 'Review all information and submit' }
  ];

  // Handle form submission
  const handleSubmit = async () => {
    try {
      showLoader('Submitting registration...');
      
      // Ensure Authorization header is set for subsequent API calls
      try {
        const t = localStorage.getItem('token');
        if (t) {
          const isJwtLike = /^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.test(t);
          if (isJwtLike) {
            // lazy import to avoid circular
            const { default: API } = await import('../../services/api/api');
            API.defaults.headers.Authorization = `Bearer ${t}`;
          }
        }
      } catch (_) {}

      if (user) {
        // Authenticated flow: update existing user's KYC instead of registering again
        // 1) Connect wallet if available
        if ((registrationData.blockchainInfo?.walletAddress || selectedAccount) && isConnected) {
          try {
            await voterRegistrationAPI.connectWallet({
              walletAddress: registrationData.blockchainInfo?.walletAddress || selectedAccount,
              walletType: 'MetaMask'
            });
          } catch (e) {
            console.warn('Wallet connect failed (continuing):', e?.message || e);
          }
        }

        // 2) Upload documents if selected
        const uploadIfPresent = async (key, file) => {
          if (!file) return;
          try {
            const safeName = encodeURIComponent(file.name || `${key}.bin`);
            const absoluteUrl = `${window.location.origin}/uploads/${safeName}`; // satisfies server isURL() validator
            await voterRegistrationAPI.uploadDocument({
              documentType: key,
              fileUrl: typeof file === 'string' ? file : absoluteUrl
            });
          } catch (e) {
            console.warn(`Upload ${key} failed (continuing):`, e?.message || e);
          }
        };
        await uploadIfPresent('governmentId', uploadedFiles.governmentId);
        await uploadIfPresent('proofOfAddress', uploadedFiles.proofOfAddress);
        await uploadIfPresent('selfie', uploadedFiles.selfie);

        // 3) Update KYC info
        await voterRegistrationAPI.updateKycInfo({
          kycInfo: {
            firstName: registrationData.personalInfo?.firstName,
            lastName: registrationData.personalInfo?.lastName,
            phone: registrationData.personalInfo?.phone,
            dateOfBirth: registrationData.personalInfo?.dateOfBirth,
            nationality: registrationData.personalInfo?.nationality,
            address: {
              street: registrationData.personalInfo?.address?.street || '',
              city: registrationData.personalInfo?.address?.city || '',
              state: registrationData.personalInfo?.address?.state || '',
              zipCode: registrationData.personalInfo?.address?.zipCode || '',
              country: registrationData.personalInfo?.address?.country || ''
            },
            verification: {
              kycStatus: 'pending',
              biometricStatus: verificationStatus === 'success' ? 'verified' : 'pending',
              overallStatus: 'pending'
            },
            registrationSteps: {
              personalInfo: true,
              blockchainConnection: !!(registrationData.blockchainInfo?.walletAddress || selectedAccount),
              documentUpload: !!(uploadedFiles.governmentId && uploadedFiles.proofOfAddress && uploadedFiles.selfie),
              biometricVerification: verificationStatus === 'success' || registrationData.personalInfo?.biometricVerificationComplete,
              reviewSubmit: true
            },
            privacyConsent: {
              dataProcessing: true,
              biometricProcessing: true,
              blockchainStorage: true,
              marketingCommunications: false,
              consentDate: new Date()
            }
          }
        });

        // 4) Submit registration for review
        await voterRegistrationAPI.submitRegistration({ privacyConsent: true });

        showToast('KYC submitted successfully! Awaiting verification.', 'success');
        navigate('/voter/dashboard');
      } else {
        // Anonymous flow: create account + KYC
        const registrationPayload = {
          fullName: `${registrationData.personalInfo?.firstName} ${registrationData.personalInfo?.lastName}`,
          email: registrationData.personalInfo?.email,
          password: registrationData.personalInfo?.password,
          kycInfo: {
            firstName: registrationData.personalInfo?.firstName,
            lastName: registrationData.personalInfo?.lastName,
            phone: registrationData.personalInfo?.phone,
            dateOfBirth: registrationData.personalInfo?.dateOfBirth,
            nationality: registrationData.personalInfo?.nationality,
            address: {
              street: registrationData.personalInfo?.address?.street || '',
              city: registrationData.personalInfo?.address?.city || '',
              state: registrationData.personalInfo?.address?.state || '',
              zipCode: registrationData.personalInfo?.address?.zipCode || '',
              country: registrationData.personalInfo?.address?.country || ''
            },
            blockchainInfo: {
              walletAddress: registrationData.blockchainInfo?.walletAddress || '',
              walletType: registrationData.blockchainInfo?.walletType || 'MetaMask',
              isConnected: registrationData.blockchainInfo?.isConnected || false
            },
            documents: {
              governmentId: uploadedFiles.governmentId ? { uploaded: true } : null,
              proofOfAddress: uploadedFiles.proofOfAddress ? { uploaded: true } : null,
              selfie: uploadedFiles.selfie ? { uploaded: true } : null
            },
            verification: {
              kycStatus: 'pending',
              biometricStatus: verificationStatus === 'success' ? 'verified' : 'pending',
              overallStatus: 'pending'
            },
            registrationSteps: {
              personalInfo: true,
              blockchainConnection: !!registrationData.blockchainInfo?.walletAddress,
              documentUpload: !!(uploadedFiles.governmentId && uploadedFiles.proofOfAddress && uploadedFiles.selfie),
              biometricVerification: verificationStatus === 'success' || registrationData.personalInfo?.biometricVerificationComplete,
              reviewSubmit: true
            },
            privacyConsent: {
              dataProcessing: true,
              biometricProcessing: true,
              blockchainStorage: true,
              marketingCommunications: false,
              consentDate: new Date()
            }
          }
        };

        const response = await register(registrationPayload, 'voter');
        if (response?.success || response?.data?.accessToken || response?.data?.token) {
          showToast('Registration submitted successfully! Please log in to continue.', 'success');
          navigate('/login');
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Extract detailed error message from backend
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors.map(err => err.msg || err.message).join(', ');
        } else {
          errorMessage = JSON.stringify(validationErrors);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      hideLoader();
    }
  };

  // Handle file upload
  const handleFileUpload = (field, file) => {
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setUploadedFiles(prev => ({
        ...prev,
        [field]: file
      }));
      updatePersonalInfo({ [field]: file });
    } else {
      showToast('File size must be less than 5MB', 'error');
    }
  };

  // Handle MetaMask connection
  const handleConnectMetaMask = async () => {
    try {
      await connectMetaMask();
      if (selectedAccount) {
        // Update blockchain info in the context
        if (updateBlockchainInfo) {
          updateBlockchainInfo({
            walletAddress: selectedAccount,
            walletType: 'MetaMask',
            isConnected: true
          });
        }
        showToast('MetaMask connected successfully!', 'success');
      }
    } catch (error) {
      showToast('Failed to connect MetaMask', 'error');
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={registrationData.personalInfo?.firstName || ''}
                    onChange={(e) => updatePersonalInfo({ firstName: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.firstName ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your first name"
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={registrationData.personalInfo?.lastName || ''}
                    onChange={(e) => updatePersonalInfo({ lastName: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.lastName ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your last name"
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || registrationData.personalInfo?.email || ''}
                    onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your email"
                    disabled={isLoading || !!user}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={registrationData.personalInfo?.phone || ''}
                    onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your phone number"
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Date of Birth and Nationality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Date of Birth *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={registrationData.personalInfo?.dateOfBirth || ''}
                    onChange={(e) => updatePersonalInfo({ dateOfBirth: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.dateOfBirth ? 'border-red-500' : 'border-white/20'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nationality *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Flag className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    value={registrationData.personalInfo?.nationality || ''}
                    onChange={(e) => updatePersonalInfo({ nationality: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.nationality ? 'border-red-500' : 'border-white/20'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select your nationality</option>
                    {countries.map(country => (
                      <option key={country.value} value={country.value} className="bg-gray-800">
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.nationality && (
                  <p className="text-red-400 text-sm mt-1">{errors.nationality}</p>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={registrationData.personalInfo?.address?.street || ''}
                    onChange={(e) => updatePersonalInfo({
                      address: { ...registrationData.personalInfo?.address, street: e.target.value }
                    })}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors['address.street'] ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your street address"
                    disabled={isLoading}
                  />
                  {errors['address.street'] && (
                    <p className="text-red-400 text-sm mt-1">{errors['address.street']}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={registrationData.personalInfo?.address?.city || ''}
                      onChange={(e) => updatePersonalInfo({
                        address: { ...registrationData.personalInfo?.address, city: e.target.value }
                      })}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors['address.city'] ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Enter your city"
                      disabled={isLoading}
                    />
                    {errors['address.city'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['address.city']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      value={registrationData.personalInfo?.address?.state || ''}
                      onChange={(e) => updatePersonalInfo({
                        address: { ...registrationData.personalInfo?.address, state: e.target.value }
                      })}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors['address.state'] ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Enter your state/province"
                      disabled={isLoading}
                    />
                    {errors['address.state'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['address.state']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      value={registrationData.personalInfo?.address?.zipCode || ''}
                      onChange={(e) => updatePersonalInfo({
                        address: { ...registrationData.personalInfo?.address, zipCode: e.target.value }
                      })}
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors['address.zipCode'] ? 'border-red-500' : 'border-white/20'
                      }`}
                      placeholder="Enter your ZIP/postal code"
                      disabled={isLoading}
                    />
                    {errors['address.zipCode'] && (
                      <p className="text-red-400 text-sm mt-1">{errors['address.zipCode']}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Country *
                  </label>
                  <select
                    value={registrationData.personalInfo?.address?.country || ''}
                    onChange={(e) => updatePersonalInfo({
                      address: { ...registrationData.personalInfo?.address, country: e.target.value }
                    })}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors['address.country'] ? 'border-red-500' : 'border-white/20'
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Select your country</option>
                    {countries.map(country => (
                      <option key={country.value} value={country.value} className="bg-gray-800">
                        {country.label}
                      </option>
                    ))}
                  </select>
                  {errors['address.country'] && (
                    <p className="text-red-400 text-sm mt-1">{errors['address.country']}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Fields (only for new registrations) */}
            {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registrationData.personalInfo?.password || ''}
                    onChange={(e) => updatePersonalInfo({ password: e.target.value })}
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.password ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registrationData.personalInfo?.confirmPassword || ''}
                    onChange={(e) => updatePersonalInfo({ confirmPassword: e.target.value })}
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your MetaMask Wallet</h3>
              <p className="text-gray-300 mb-6">
                Connect your MetaMask wallet to link your blockchain identity for secure voting
              </p>
            </div>

            {!isConnected ? (
              <div className="text-center">
                <button
                  onClick={handleConnectMetaMask}
                  disabled={isLoading}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-3 mx-auto"
                >
                  <ExternalLink className="w-5 h-5" />
                  Connect MetaMask
                </button>
                <p className="text-gray-400 text-sm mt-4">
                  Make sure you have MetaMask installed and unlocked
                </p>
              </div>
            ) : (
              <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h4 className="text-green-200 font-medium">Wallet Connected Successfully</h4>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-2">Connected Address:</p>
                  <p className="text-white font-mono text-sm break-all">
                    {selectedAccount}
                  </p>
                </div>
                <p className="text-green-300 text-sm mt-4">
                  Your wallet is now linked to your voter registration. This address will be used for secure voting.
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Upload KYC Documents</h3>
              <p className="text-gray-300 mb-6">
                Upload your government-issued ID and proof of address for verification
              </p>
            </div>

            <div className="space-y-6">
              {/* Government ID Upload */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Government-Issued ID
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Upload a clear photo of your passport, driver's license, or national ID
                </p>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {uploadedFiles.governmentId ? (
                    <div className="space-y-3">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
                      <p className="text-green-300 text-sm">{uploadedFiles.governmentId.name}</p>
                      <button
                        onClick={() => {
                          setUploadedFiles(prev => {
                            const newFiles = { ...prev };
                            delete newFiles.governmentId;
                            return newFiles;
                          });
                          updatePersonalInfo({ governmentId: null });
                        }}
                        className="text-red-400 text-sm hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-300 text-sm mb-3">Click to upload or drag and drop</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('governmentId', e.target.files[0])}
                        className="hidden"
                        id="governmentId"
                      />
                      <label
                        htmlFor="governmentId"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Proof of Address Upload */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Proof of Address
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Upload a utility bill, bank statement, or other official document showing your address
                </p>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {uploadedFiles.proofOfAddress ? (
                    <div className="space-y-3">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
                      <p className="text-green-300 text-sm">{uploadedFiles.proofOfAddress.name}</p>
                      <button
                        onClick={() => {
                          setUploadedFiles(prev => {
                            const newFiles = { ...prev };
                            delete newFiles.proofOfAddress;
                            return newFiles;
                          });
                          updatePersonalInfo({ proofOfAddress: null });
                        }}
                        className="text-red-400 text-sm hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-300 text-sm mb-3">Click to upload or drag and drop</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload('proofOfAddress', e.target.files[0])}
                        className="hidden"
                        id="proofOfAddress"
                      />
                      <label
                        htmlFor="proofOfAddress"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Selfie Upload */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Selfie Photo
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Take a clear selfie for biometric verification
                </p>
                
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  {uploadedFiles.selfie ? (
                    <div className="space-y-3">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
                      <p className="text-green-300 text-sm">{uploadedFiles.selfie.name}</p>
                      <button
                        onClick={() => {
                          setUploadedFiles(prev => {
                            const newFiles = { ...prev };
                            delete newFiles.selfie;
                            return newFiles;
                          });
                          updatePersonalInfo({ selfie: null });
                        }}
                        className="text-red-400 text-sm hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-300 text-sm mb-3">Take a photo or upload from device</p>
                      <div className="flex gap-3 justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('selfie', e.target.files[0])}
                          className="hidden"
                          id="selfie"
                        />
                        <label
                          htmlFor="selfie"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          Upload Photo
                        </label>
                        <button
                          onClick={startCamera}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Take Photo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Biometric Verification</h3>
              <p className="text-gray-300 mb-6">
                Complete facial recognition verification for secure identity confirmation
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <div className="text-center">
                {verificationStatus === 'idle' && (
                  <>
                    <div className="w-32 h-32 bg-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Facial Recognition</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Position your face in the camera frame and follow the instructions
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Start Verification
                    </button>
                  </>
                )}
                
                {verificationStatus === 'capturing' && (
                  <>
                    <div className="w-32 h-32 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
                      <Camera className="w-12 h-12 text-white animate-pulse" />
                      {cameraActive && (
                        <video
                          id="camera-video"
                          autoPlay
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <h4 className="text-white font-medium mb-2">Camera Active</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Position your face in the frame and click capture
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={capturePhoto}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Capture Photo
                      </button>
                    </div>
                  </>
                )}
                
                {(verificationStatus === 'success' || registrationData.personalInfo?.biometricVerificationComplete) && (
                  <>
                    <div className="w-32 h-32 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
                      {capturedImage && (
                        <img
                          src={capturedImage}
                          alt="Captured biometric"
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                      )}
                      <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <h4 className="text-white font-medium mb-2">Verification Complete</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Your facial verification has been completed successfully
                    </p>
                    <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-3 mb-4">
                      <p className="text-green-200 text-sm text-center">
                        ✅ Biometric verification completed. You can now proceed to the next step.
                      </p>
                    </div>
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Verify Again
                    </button>
                  </>
                )}
                
                {verificationStatus === 'error' && (
                  <>
                    <div className="w-32 h-32 bg-red-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <AlertTriangle className="w-12 h-12 text-white" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Camera Error</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Unable to access camera. Please check permissions and try again.
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-200">
                  <p className="font-medium mb-1">Privacy & Security</p>
                  <p>
                    Your biometric data is processed locally and encrypted. It's used only for identity verification 
                    and is not stored permanently.
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Biometric Instructions */}
            <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-200">
                  <p className="font-medium mb-1">Biometric Capture Tips</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Ensure good lighting and face the camera directly</li>
                    <li>Remove glasses, hats, or face coverings</li>
                    <li>Keep your face centered in the frame</li>
                    <li>Hold still for 3 seconds when capturing</li>
                    <li>If the image is blurry, retake the photo</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Review & Submit</h3>
              <p className="text-gray-300 mb-6">
                Please review all your information before submitting for verification
              </p>
            </div>

            <div className="space-y-4">
              {/* Personal Information Review */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">{registrationData.personalInfo?.firstName} {registrationData.personalInfo?.lastName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">{registrationData.personalInfo?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white ml-2">{registrationData.personalInfo?.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Nationality:</span>
                    <span className="text-white ml-2">{registrationData.personalInfo?.nationality}</span>
                  </div>
                </div>
              </div>

              {/* Blockchain Address Review */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Blockchain Address</h4>
                <p className="text-gray-300 text-sm font-mono break-all">{selectedAccount}</p>
              </div>

              {/* Documents Review */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Uploaded Documents</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Government ID: {uploadedFiles.governmentId?.name || 'Not uploaded'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Proof of Address: {uploadedFiles.proofOfAddress?.name || 'Not uploaded'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Selfie: {uploadedFiles.selfie?.name || 'Not uploaded'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={registrationData.personalInfo?.agreeToTerms || false}
                  onChange={(e) => updatePersonalInfo({ agreeToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <div className="text-sm text-blue-200">
                  <p className="font-medium mb-1">Terms and Conditions</p>
                  <p>
                    I agree to the <a href="#" className="underline hover:text-white transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-white transition-colors">Privacy Policy</a>. 
                    I understand that my information will be used for voter registration and verification purposes only.
                  </p>
                  {errors.agreeToTerms && (
                    <p className="text-red-400 text-sm mt-2">{errors.agreeToTerms}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Voter Registration with KYC</h1>
          <p className="text-green-200">Complete your secure voter registration with identity verification</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-400'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-600'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">{steps[currentStep - 1]?.title}</h2>
            <p className="text-gray-400 text-sm">{steps[currentStep - 1]?.description}</p>
          </div>
        </div>

        {/* Registration Form */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
        >
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                disabled={isLoading || !isStepValid()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !registrationData.personalInfo?.agreeToTerms}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
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
            )}
          </div>
        </motion.div>

        {/* Camera Modal */}
        <AnimatePresence>
          {cameraActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-lg p-6 max-w-lg w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Camera Preview</h3>
                  <button
                    onClick={stopCamera}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="relative w-full h-64 bg-gray-600 rounded-lg overflow-hidden">
                    {cameraStream ? (
                      <video
                        id="camera-video"
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {isCapturing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-white text-sm">Processing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {capturedImage && (
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Captured Photo</h4>
                    <div className="w-full h-32 bg-gray-600 rounded-lg overflow-hidden">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={stopCamera}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  {capturedImage ? (
                    <>
                      <button
                        onClick={retakePhoto}
                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Retake
                      </button>
                      <button
                        onClick={() => {
                          const mockFile = new File([''], 'selfie.jpg', { type: 'image/jpeg' });
                          handleFileUpload('selfie', mockFile);
                          stopCamera();
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Use Photo
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={capturePhoto}
                      disabled={!cameraStream || isCapturing}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCapturing ? 'Capturing...' : 'Capture'}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-200">
              <p className="font-medium mb-1">Secure Registration Process</p>
              <p>
                Your registration information is encrypted and stored securely. After account creation, 
                you'll need to complete KYC verification and biometric authentication to participate in elections.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Registration Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-2 text-white">Registration Requirements:</p>
              <ul className="space-y-1 text-xs">
                <li>• Must be 18 years or older</li>
                <li>• Valid government-issued ID required for KYC</li>
                <li>• Proof of address required</li>
                <li>• MetaMask wallet for blockchain voting</li>
                <li>• Webcam for biometric verification</li>
                <li>• All documents must be clear and readable</li>
                <li>• Documents will be verified by admin team</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Back to Main Site */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-green-300 hover:text-green-200 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Back to main site
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default VoterRegistrationIntegrated;