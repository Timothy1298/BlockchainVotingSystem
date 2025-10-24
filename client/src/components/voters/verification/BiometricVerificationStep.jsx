import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Shield,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { useVoterRegistration } from '../../../contexts/voters/VoterRegistrationContext';

const BiometricVerificationStep = ({ onNext, onPrevious }) => {
  const { 
    registrationData, 
    updateVerificationStatus, 
    setError, 
    setSuccess, 
    clearMessages,
    api,
    loading
  } = useVoterRegistration();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Camera constraints
  const cameraConstraints = {
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: 'user'
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      clearMessages();
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia(cameraConstraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setShowInstructions(false);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage({
          blob,
          url: imageUrl,
          timestamp: new Date().toISOString()
        });
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  // Verify biometric
  const verifyBiometric = async () => {
    if (!capturedImage) return;

    try {
      setIsVerifying(true);
      clearMessages();

      // Create form data
      const formData = new FormData();
      formData.append('biometricImage', capturedImage.blob, 'biometric.jpg');
      formData.append('voterId', registrationData.blockchainInfo.walletAddress);

      // Call verification API
      const result = await api.verifyBiometric(registrationData.blockchainInfo.walletAddress, formData);
      
      setVerificationResult(result);
      
      if (result.isVerified) {
        setSuccess('Biometric verification successful!');
        updateVerificationStatus({
          biometricStatus: 'verified',
          verificationDate: new Date().toISOString()
        });
      } else {
        setError(result.reason || 'Biometric verification failed. Please try again.');
        updateVerificationStatus({
          biometricStatus: 'rejected'
        });
      }
    } catch (error) {
      setError('Biometric verification failed. Please try again.');
      setVerificationResult({
        isVerified: false,
        reason: 'Verification service unavailable'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    setShowInstructions(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
          <Camera className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Biometric Verification</h2>
        <p className="text-gray-600">Take a selfie for facial recognition verification</p>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Photo Requirements:</p>
              <ul className="space-y-1 text-xs">
                <li>• Look directly at the camera</li>
                <li>• Ensure good lighting on your face</li>
                <li>• Remove glasses, hats, or face coverings</li>
                <li>• Keep a neutral expression</li>
                <li>• Make sure your entire face is visible</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Camera Section */}
      <div className="space-y-4">
        {!capturedImage ? (
          /* Camera View */
          <div className="relative">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              {isCameraActive ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none">
                    <div className="absolute top-4 left-4 right-4 h-8 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Position your face in the frame</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Camera not active</p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Camera className="w-4 h-4" />
                      Start Camera
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            {isCameraActive && (
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Stop Camera
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Captured Photo */
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={capturedImage.url}
                alt="Captured biometric photo"
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Photo Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={retakePhoto}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retake Photo
              </button>
              <button
                onClick={verifyBiometric}
                disabled={isVerifying}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Verify Photo
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div className={`border rounded-lg p-4 ${
            verificationResult.isVerified 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {verificationResult.isVerified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className={`font-medium ${
                  verificationResult.isVerified ? 'text-green-900' : 'text-red-900'
                }`}>
                  {verificationResult.isVerified 
                    ? 'Biometric Verification Successful' 
                    : 'Biometric Verification Failed'
                  }
                </p>
                {verificationResult.reason && (
                  <p className={`text-sm ${
                    verificationResult.isVerified ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {verificationResult.reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Biometric Data Security</p>
            <ul className="space-y-1 text-xs">
              <li>• Your biometric data is encrypted and stored securely</li>
              <li>• Facial recognition is used only for identity verification</li>
              <li>• Biometric templates are created, not raw images stored</li>
              <li>• Data is processed locally when possible</li>
              <li>• You can request deletion of your biometric data</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        
        <button
          onClick={onNext}
          disabled={!verificationResult?.isVerified || loading}
          className={`px-6 py-3 rounded-lg text-white transition-colors flex items-center gap-2 ${
            verificationResult?.isVerified && !loading
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default BiometricVerificationStep;
