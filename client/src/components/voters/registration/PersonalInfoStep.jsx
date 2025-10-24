import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, MapPin, Flag, AlertCircle, CheckCircle } from 'lucide-react';
import { InputField, SelectField, TextAreaField } from '../../ui/forms';
import { useVoterRegistration } from '../../../contexts/voters/VoterRegistrationContext';

const PersonalInfoStep = ({ onNext, onPrevious }) => {
  const { 
    registrationData, 
    updatePersonalInfo, 
    setError, 
    setSuccess, 
    clearMessages 
  } = useVoterRegistration();

  const [formData, setFormData] = useState(registrationData.personalInfo);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

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

  // Validation rules
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          newErrors[name] = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.trim().length < 2) {
          newErrors[name] = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        } else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          newErrors[name] = `${name === 'firstName' ? 'First' : 'Last'} name can only contain letters, spaces, hyphens, and apostrophes`;
        } else {
          delete newErrors[name];
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors[name] = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          newErrors[name] = 'Please enter a valid email address';
        } else {
          delete newErrors[name];
        }
        break;

      case 'phone':
        if (!value.trim()) {
          newErrors[name] = 'Phone number is required';
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          newErrors[name] = 'Please enter a valid phone number';
        } else {
          delete newErrors[name];
        }
        break;

      case 'dateOfBirth':
        if (!value) {
          newErrors[name] = 'Date of birth is required';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          
          if (age < 18) {
            newErrors[name] = 'You must be at least 18 years old to register';
          } else if (age > 120) {
            newErrors[name] = 'Please enter a valid date of birth';
          } else {
            delete newErrors[name];
          }
        }
        break;

      case 'nationality':
        if (!value) {
          newErrors[name] = 'Nationality is required';
        } else {
          delete newErrors[name];
        }
        break;

      case 'address.street':
        if (!value.trim()) {
          newErrors['address.street'] = 'Street address is required';
        } else {
          delete newErrors['address.street'];
        }
        break;

      case 'address.city':
        if (!value.trim()) {
          newErrors['address.city'] = 'City is required';
        } else {
          delete newErrors['address.city'];
        }
        break;

      case 'address.state':
        if (!value.trim()) {
          newErrors['address.state'] = 'State/Province is required';
        } else {
          delete newErrors['address.state'];
        }
        break;

      case 'address.zipCode':
        if (!value.trim()) {
          newErrors['address.zipCode'] = 'ZIP/Postal code is required';
        } else {
          delete newErrors['address.zipCode'];
        }
        break;

      case 'address.country':
        if (!value) {
          newErrors['address.country'] = 'Country is required';
        } else {
          delete newErrors['address.country'];
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (name, value) => {
    const newFormData = { ...formData };
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      newFormData[parent] = {
        ...newFormData[parent],
        [child]: value
      };
    } else {
      newFormData[name] = value;
    }
    
    setFormData(newFormData);
    validateField(name, value);
  };

  // Check if form is valid
  useEffect(() => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'nationality',
      'address.street', 'address.city', 'address.state', 'address.zipCode', 'address.country'
    ];
    
    const isFormValid = requiredFields.every(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return formData[parent] && formData[parent][child] && formData[parent][child].trim();
      }
      return formData[field] && formData[field].trim();
    }) && Object.keys(errors).length === 0;
    
    setIsValid(isFormValid);
  }, [formData, errors]);

  // Handle next step
  const handleNext = () => {
    if (isValid) {
      updatePersonalInfo(formData);
      clearMessages();
      onNext();
    } else {
      setError('Please fill in all required fields correctly');
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
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Please provide your personal details for voter registration</p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={errors.firstName}
            icon={User}
            required
            placeholder="Enter your first name"
          />
          <InputField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={errors.lastName}
            icon={User}
            required
            placeholder="Enter your last name"
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            icon={Mail}
            required
            placeholder="Enter your email address"
          />
          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            icon={Phone}
            required
            placeholder="Enter your phone number"
          />
        </div>

        {/* Date of Birth and Nationality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
            icon={Calendar}
            required
          />
          <SelectField
            label="Nationality"
            name="nationality"
            value={formData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            error={errors.nationality}
            icon={Flag}
            required
            options={countries}
            placeholder="Select your nationality"
          />
        </div>

        {/* Address Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Address Information
          </h3>
          
          <div className="space-y-4">
            <InputField
              label="Street Address"
              name="address.street"
              value={formData.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              error={errors['address.street']}
              icon={MapPin}
              required
              placeholder="Enter your street address"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                error={errors['address.city']}
                icon={MapPin}
                required
                placeholder="Enter your city"
              />
              <InputField
                label="State/Province"
                name="address.state"
                value={formData.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                error={errors['address.state']}
                icon={MapPin}
                required
                placeholder="Enter your state/province"
              />
              <InputField
                label="ZIP/Postal Code"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                error={errors['address.zipCode']}
                icon={MapPin}
                required
                placeholder="Enter your ZIP/postal code"
              />
            </div>
            
            <SelectField
              label="Country"
              name="address.country"
              value={formData.address.country}
              onChange={(e) => handleInputChange('address.country', e.target.value)}
              error={errors['address.country']}
              icon={Flag}
              required
              options={countries}
              placeholder="Select your country"
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Privacy Notice</p>
              <p>
                Your personal information will be used solely for voter registration and verification purposes. 
                We comply with all applicable data protection regulations and will not share your information 
                with third parties without your explicit consent.
              </p>
            </div>
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
          disabled={!isValid}
          className={`px-6 py-3 rounded-lg text-white transition-colors flex items-center gap-2 ${
            isValid 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isValid ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Continue
            </>
          ) : (
            'Fill Required Fields'
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default PersonalInfoStep;
