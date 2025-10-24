import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle,
  User,
  Phone,
  Calendar,
  MapPin,
  Flag,
  ExternalLink,
  ArrowRight,
  FileText,
  Camera,
  Key,
  Info,
  Clock,
  Globe,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useGlobalUI } from '../../components/common';

const VoterRegister = () => {
  const { showToast } = useGlobalUI();
  const navigate = useNavigate();

  const [registrationType, setRegistrationType] = useState('full'); // 'basic' or 'full'

  // Handle registration type selection
  const handleRegistrationType = (type) => {
    setRegistrationType(type);
    if (type === 'full') {
      navigate('/voter/registration-integrated');
    } else {
      navigate('/voter/registration-basic');
    }
  };

  // Registration steps for full KYC process
  const fullRegistrationSteps = [
    {
      id: 1,
      title: 'Personal Information',
      description: 'Basic details and contact information',
      icon: User,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Blockchain Connection',
      description: 'Connect your MetaMask wallet',
      icon: Key,
      color: 'purple'
    },
    {
      id: 3,
      title: 'Document Upload',
      description: 'Upload KYC documents for verification',
      icon: FileText,
      color: 'green'
    },
    {
      id: 4,
      title: 'Biometric Verification',
      description: 'Complete facial recognition verification',
      icon: Camera,
      color: 'yellow'
    },
    {
      id: 5,
      title: 'Review & Submit',
      description: 'Review all information and submit',
      icon: CheckCircle,
      color: 'red'
    }
  ];

  // Requirements for full registration
  const fullRequirements = [
    'Must be 18 years or older',
    'Valid government-issued ID (passport, driver\'s license, or national ID)',
    'Proof of address (utility bill, bank statement, or official document)',
    'MetaMask wallet for blockchain voting',
    'Webcam for biometric verification',
    'All documents must be clear and readable',
    'Documents will be verified by admin team'
  ];

  // Benefits of full registration
  const fullBenefits = [
    'Complete voter eligibility verification',
    'Secure blockchain-based voting',
    'Full audit trail and verifiability',
    'One-Person-One-Vote compliance',
    'Access to all election features',
    'Enhanced security and fraud prevention'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Voter Registration</h1>
          <p className="text-green-200">Choose your registration method to participate in secure blockchain voting</p>
        </div>

        {/* Registration Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Full KYC Registration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Full KYC Registration</h2>
              <p className="text-gray-300">Complete identity verification for full voting access</p>
            </div>

            {/* Registration Steps */}
            <div className="space-y-4 mb-6">
              {fullRegistrationSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${step.color}-600`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{step.title}</h4>
                      <p className="text-gray-400 text-sm">{step.description}</p>
                    </div>
                    {index < fullRegistrationSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Benefits
              </h3>
              <ul className="space-y-2">
                {fullBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                Requirements
              </h3>
              <ul className="space-y-2">
                {fullRequirements.map((requirement, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleRegistrationType('full')}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Shield className="w-5 h-5" />
              Start Full KYC Registration
            </button>
          </motion.div>

          {/* Basic Registration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Basic Registration</h2>
              <p className="text-gray-300">Quick account creation (KYC required later)</p>
            </div>

            {/* Basic Features */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Account Creation</h4>
                  <p className="text-gray-400 text-sm">Basic personal information</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-600">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Limited Access</h4>
                  <p className="text-gray-400 text-sm">View elections only</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-600">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium">KYC Required Later</h4>
                  <p className="text-gray-400 text-sm">Must complete for voting</p>
                </div>
              </div>
            </div>

            {/* Limitations */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Limitations
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  Cannot vote in elections
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  Limited dashboard access
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  Must complete KYC later
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  No blockchain integration
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleRegistrationType('basic')}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <User className="w-5 h-5" />
              Start Basic Registration
            </button>
          </motion.div>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-green-200 font-semibold mb-2">Secure Registration Process</h3>
              <p className="text-green-100 text-sm mb-3">
                All registration information is encrypted and stored securely. We use industry-standard 
                security measures to protect your personal data and ensure the integrity of the voting process.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-200">End-to-End Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-200">GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-200">Blockchain Security</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            System Requirements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Browser Requirements
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Modern browser (Chrome, Firefox, Safari, Edge)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  JavaScript enabled
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  HTTPS connection
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Device Requirements
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Webcam for biometric verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  MetaMask extension (for full registration)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Stable internet connection
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/voter/login"
            className="text-green-300 hover:text-green-200 transition-colors flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Already have an account? Sign in
          </Link>
          
          <div className="flex items-center gap-4">
            <Link
              to="/admin/login"
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <Shield className="w-4 h-4" />
              Admin Login
            </Link>
            
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Back to main site
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VoterRegister;