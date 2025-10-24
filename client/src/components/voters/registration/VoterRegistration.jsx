import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Wallet, 
  Upload, 
  Camera, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useVoterRegistration } from '../../contexts/voters/VoterRegistrationContext';
import PersonalInfoStep from './PersonalInfoStep';
import BlockchainInfoStep from './BlockchainInfoStep';
import DocumentUploadStep from './DocumentUploadStep';
import BiometricVerificationStep from '../verification/BiometricVerificationStep';
import ReviewSubmitStep from './ReviewSubmitStep';

const VoterRegistration = ({ onClose, onSuccess }) => {
  const { 
    currentStep, 
    totalSteps, 
    setCurrentStep, 
    error, 
    success, 
    clearMessages,
    resetRegistration
  } = useVoterRegistration();

  const [isCompleted, setIsCompleted] = useState(false);

  // Step components
  const steps = [
    {
      id: 1,
      title: 'Personal Info',
      description: 'Basic information',
      icon: User,
      component: PersonalInfoStep
    },
    {
      id: 2,
      title: 'Wallet Connection',
      description: 'Blockchain wallet',
      icon: Wallet,
      component: BlockchainInfoStep
    },
    {
      id: 3,
      title: 'Documents',
      description: 'Upload documents',
      icon: Upload,
      component: DocumentUploadStep
    },
    {
      id: 4,
      title: 'Biometric',
      description: 'Face verification',
      icon: Camera,
      component: BiometricVerificationStep
    },
    {
      id: 5,
      title: 'Review',
      description: 'Submit registration',
      icon: CheckCircle,
      component: ReviewSubmitStep
    }
  ];

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      clearMessages();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      clearMessages();
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    clearMessages();
  };

  // Handle completion
  const handleCompletion = () => {
    setIsCompleted(true);
    if (onSuccess) {
      onSuccess();
    }
  };

  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    resetRegistration();
  };

  // Auto-close on success
  useEffect(() => {
    if (success && currentStep === totalSteps) {
      const timer = setTimeout(() => {
        handleCompletion();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, currentStep, totalSteps]);

  // Get current step component
  const CurrentStepComponent = steps.find(step => step.id === currentStep)?.component;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Voter Registration</h1>
              <p className="text-blue-100 mt-1">
                Step {currentStep} of {totalSteps}: {steps.find(step => step.id === currentStep)?.title}
              </p>
            </div>
            
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const isClickable = step.id <= currentStep || isCompleted;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => isClickable && goToStep(step.id)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : isClickable
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.title}</span>
                  </button>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      step.id < currentStep ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {CurrentStepComponent && (
              <CurrentStepComponent
                key={currentStep}
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                onSuccess={handleCompletion}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-6 pb-4"
            >
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-medium">Error</p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-green-800 font-medium">Success</p>
                      <p className="text-green-700 text-sm">{success}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Modal */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 flex items-center justify-center z-10"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="text-center p-8"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Registration Submitted Successfully!
                </h2>
                
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Your voter registration has been submitted and is now under review. 
                  You will receive a confirmation email with further instructions.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleClose}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                  
                  <p className="text-sm text-gray-500">
                    Registration ID: {Date.now().toString(36).toUpperCase()}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VoterRegistration;
