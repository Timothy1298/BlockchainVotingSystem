import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Eye,
  Download,
  Shield,
  Info
} from 'lucide-react';
import { useVoterRegistration } from '../../../contexts/voters/VoterRegistrationContext';

const DocumentUploadStep = ({ onNext, onPrevious }) => {
  const { 
    registrationData, 
    updateDocuments, 
    setError, 
    setSuccess, 
    clearMessages,
    api,
    loading
  } = useVoterRegistration();

  const [uploadedDocuments, setUploadedDocuments] = useState({
    governmentId: registrationData.documents.governmentId,
    proofOfAddress: registrationData.documents.proofOfAddress,
    selfie: registrationData.documents.selfie
  });

  const [uploading, setUploading] = useState({
    governmentId: false,
    proofOfAddress: false,
    selfie: false
  });

  const [previews, setPreviews] = useState({
    governmentId: null,
    proofOfAddress: null,
    selfie: null
  });

  const fileInputRefs = {
    governmentId: useRef(null),
    proofOfAddress: useRef(null),
    selfie: useRef(null)
  };

  // Document requirements
  const documentRequirements = {
    governmentId: {
      title: 'Government ID',
      description: 'Upload a clear photo of your government-issued ID (passport, driver\'s license, or national ID)',
      acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
      maxSize: 5 * 1024 * 1024, // 5MB
      icon: FileText,
      required: true
    },
    proofOfAddress: {
      title: 'Proof of Address',
      description: 'Upload a utility bill, bank statement, or official document showing your current address',
      acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
      maxSize: 5 * 1024 * 1024, // 5MB
      icon: FileText,
      required: true
    },
    selfie: {
      title: 'Selfie Photo',
      description: 'Take a clear selfie photo for biometric verification',
      acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
      maxSize: 3 * 1024 * 1024, // 3MB
      icon: Camera,
      required: true
    }
  };

  // Validate file
  const validateFile = (file, type) => {
    const requirements = documentRequirements[type];
    
    if (!requirements.acceptedTypes.includes(file.type)) {
      throw new Error(`Please upload a ${requirements.acceptedTypes.join(', ')} file`);
    }
    
    if (file.size > requirements.maxSize) {
      const maxSizeMB = requirements.maxSize / (1024 * 1024);
      throw new Error(`File size must be less than ${maxSizeMB}MB`);
    }
    
    return true;
  };

  // Create preview URL
  const createPreview = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  // Handle file upload
  const handleFileUpload = async (type, file) => {
    try {
      validateFile(file, type);
      
      setUploading(prev => ({ ...prev, [type]: true }));
      clearMessages();

      // Upload file to server
      const response = await api.uploadDocument(type, file);
      
      // Update state
      setUploadedDocuments(prev => ({
        ...prev,
        [type]: {
          id: response.id,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        }
      }));

      // Create preview
      const preview = createPreview(file);
      setPreviews(prev => ({ ...prev, [type]: preview }));

      setSuccess(`${documentRequirements[type].title} uploaded successfully!`);
    } catch (error) {
      setError(error.message || `Failed to upload ${documentRequirements[type].title}`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Handle file input change
  const handleFileChange = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(type, file);
    }
  };

  // Remove uploaded document
  const removeDocument = (type) => {
    setUploadedDocuments(prev => ({ ...prev, [type]: null }));
    setPreviews(prev => ({ ...prev, [type]: null }));
    
    // Clear file input
    if (fileInputRefs[type].current) {
      fileInputRefs[type].current.value = '';
    }
  };

  // Check if all required documents are uploaded
  const isAllDocumentsUploaded = () => {
    return Object.keys(documentRequirements).every(type => 
      documentRequirements[type].required ? uploadedDocuments[type] : true
    );
  };

  // Handle next step
  const handleNext = () => {
    if (isAllDocumentsUploaded()) {
      updateDocuments(uploadedDocuments);
      clearMessages();
      onNext();
    } else {
      setError('Please upload all required documents');
    }
  };

  // Render document upload section
  const renderDocumentSection = (type) => {
    const requirements = documentRequirements[type];
    const Icon = requirements.icon;
    const isUploaded = uploadedDocuments[type];
    const isUploading = uploading[type];
    const preview = previews[type];

    return (
      <div key={type} className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {requirements.title}
              </h3>
              {requirements.required && (
                <span className="text-red-500 text-sm">*</span>
              )}
              {isUploaded && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              {requirements.description}
            </p>

            {/* File Upload Area */}
            {!isUploaded ? (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRefs[type].current?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    {requirements.acceptedTypes.join(', ')} (max {requirements.maxSize / (1024 * 1024)}MB)
                  </p>
                </div>
                
                <input
                  ref={fileInputRefs[type]}
                  type="file"
                  accept={requirements.acceptedTypes.join(',')}
                  onChange={(e) => handleFileChange(type, e)}
                  className="hidden"
                />
              </div>
            ) : (
              /* Uploaded File Display */
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">
                          {uploadedDocuments[type].filename}
                        </p>
                        <p className="text-sm text-green-700">
                          {(uploadedDocuments[type].size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {preview && (
                        <button
                          onClick={() => window.open(preview, '_blank')}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="View file"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeDocument(type)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {preview && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={preview}
                      alt="Document preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Uploading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
          <Upload className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Upload</h2>
        <p className="text-gray-600">Upload required documents for identity verification</p>
      </div>

      {/* Document Upload Sections */}
      <div className="space-y-6">
        {Object.keys(documentRequirements).map(renderDocumentSection)}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Document Security</p>
            <ul className="space-y-1 text-xs">
              <li>• All documents are encrypted and stored securely</li>
              <li>• Documents are only used for identity verification</li>
              <li>• We comply with GDPR and data protection regulations</li>
              <li>• Documents are automatically deleted after verification</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Upload Guidelines</p>
            <ul className="space-y-1 text-xs">
              <li>• Ensure documents are clear and readable</li>
              <li>• All text should be visible and not cut off</li>
              <li>• Use good lighting when taking photos</li>
              <li>• Avoid shadows or reflections on documents</li>
              <li>• Documents must be in color and high resolution</li>
            </ul>
          </div>
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
          onClick={handleNext}
          disabled={!isAllDocumentsUploaded() || loading}
          className={`px-6 py-3 rounded-lg text-white transition-colors flex items-center gap-2 ${
            isAllDocumentsUploaded() && !loading
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Continue
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default DocumentUploadStep;
