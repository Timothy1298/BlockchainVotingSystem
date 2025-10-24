import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, User, Mail, Phone, FileText, Image } from 'lucide-react';
import { candidateValidationSchema, validateForm } from '../../utils/validation';

const CandidateForm = ({ 
  candidate = null, 
  elections = [], 
  selectedElection = null,
  onSave, 
  onCancel, 
  loading = false,
  title = "Add New Candidate"
}) => {
  const [formData, setFormData] = useState({
    name: '',
    seat: '',
    party: '',
    position: '',
    bio: '',
    manifesto: '',
    photoUrl: '',
    email: '',
    phone: '',
    age: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form data when candidate or selectedElection changes
  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || '',
        seat: candidate.seat || '',
        party: candidate.party || '',
        position: candidate.position || '',
        bio: candidate.bio || '',
        manifesto: candidate.manifesto || '',
        photoUrl: candidate.photoUrl || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        age: candidate.age || '',
        isActive: candidate.isActive !== undefined ? candidate.isActive : true
      });
    } else {
      setFormData({
        name: '',
        seat: '',
        party: '',
        position: '',
        bio: '',
        manifesto: '',
        photoUrl: '',
        email: '',
        phone: '',
        age: '',
        isActive: true
      });
    }
  }, [candidate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate form
    const validation = await validateForm(candidateValidationSchema, formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Check if election is selected (for new candidates)
    if (!candidate && !selectedElection) {
      setErrors({ election: 'Please select an election' });
      return;
    }

    // Check if election settings allow adding candidates
    if (selectedElection?.settings?.lockCandidateList) {
      setErrors({ election: 'This election is not accepting new candidates' });
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving candidate:', error);
    }
  };

  const getFieldError = (field) => {
    return touched[field] && errors[field] ? errors[field] : '';
  };

  const getFieldClasses = (field) => {
    const baseClasses = "w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
    const errorClasses = "border-red-500 focus:ring-red-500";
    const normalClasses = "border-gray-600";
    
    return `${baseClasses} ${getFieldError(field) ? errorClasses : normalClasses}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Election Selection (only for new candidates) */}
      {!candidate && (
        <div>
          <label htmlFor="election" className="block text-sm font-medium text-gray-300 mb-2">
            Select Election *
          </label>
          <select
            id="election"
            value={formData.election || ''}
            onChange={(e) => {
              const election = elections.find(el => el._id === e.target.value);
              // This would be handled by parent component
            }}
            className={getFieldClasses('election')}
            aria-describedby={getFieldError('election') ? 'election-error' : undefined}
            aria-invalid={!!getFieldError('election')}
          >
            <option value="">Choose an election</option>
            {elections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title}
                {election.settings?.lockCandidateList ? ' (Locked)' : ''}
              </option>
            ))}
          </select>
          {getFieldError('election') && (
            <p id="election-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {getFieldError('election')}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={getFieldClasses('name')}
            placeholder="Candidate name"
            aria-describedby={getFieldError('name') ? 'name-error' : undefined}
            aria-invalid={!!getFieldError('name')}
            required
          />
          {getFieldError('name') && (
            <p id="name-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {getFieldError('name')}
            </p>
          )}
        </div>

        {/* Seat */}
        <div>
          <label htmlFor="seat" className="block text-sm font-medium text-gray-300 mb-2">
            Seat/Position *
          </label>
          <select
            id="seat"
            value={formData.seat}
            onChange={(e) => handleInputChange('seat', e.target.value)}
            onBlur={() => handleBlur('seat')}
            className={getFieldClasses('seat')}
            aria-describedby={getFieldError('seat') ? 'seat-error' : undefined}
            aria-invalid={!!getFieldError('seat')}
            required
          >
            <option value="">Select seat</option>
            {selectedElection?.seats?.map(seat => (
              <option key={seat} value={seat}>{seat}</option>
            ))}
          </select>
          {getFieldError('seat') && (
            <p id="seat-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {getFieldError('seat')}
            </p>
          )}
        </div>

        {/* Party */}
        <div>
          <label htmlFor="party" className="block text-sm font-medium text-gray-300 mb-2">
            Party
          </label>
          <input
            type="text"
            id="party"
            value={formData.party}
            onChange={(e) => handleInputChange('party', e.target.value)}
            onBlur={() => handleBlur('party')}
            className={getFieldClasses('party')}
            placeholder="Political party"
            aria-describedby={getFieldError('party') ? 'party-error' : undefined}
            aria-invalid={!!getFieldError('party')}
          />
          {getFieldError('party') && (
            <p id="party-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {getFieldError('party')}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={getFieldClasses('email')}
            placeholder="candidate@example.com"
            aria-describedby={getFieldError('email') ? 'email-error' : undefined}
            aria-invalid={!!getFieldError('email')}
          />
          {getFieldError('email') && (
            <p id="email-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {getFieldError('email')}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={getFieldClasses('phone')}
            placeholder="+1 (555) 123-4567"
            aria-describedby={getFieldError('phone') ? 'phone-error' : undefined}
            aria-invalid={!!getFieldError('phone')}
          />
          {getFieldError('phone') && (
            <p id="phone-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {getFieldError('phone')}
            </p>
          )}
        </div>

        {/* Age */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">
            Age
          </label>
          <input
            type="number"
            id="age"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            onBlur={() => handleBlur('age')}
            className={getFieldClasses('age')}
            placeholder="25"
            min="18"
            max="100"
            aria-describedby={getFieldError('age') ? 'age-error' : undefined}
            aria-invalid={!!getFieldError('age')}
          />
          {getFieldError('age') && (
            <p id="age-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {getFieldError('age')}
            </p>
          )}
        </div>
      </div>

      {/* Biography */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          Biography
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          onBlur={() => handleBlur('bio')}
          className={getFieldClasses('bio')}
          placeholder="Candidate biography..."
          rows={3}
          aria-describedby={getFieldError('bio') ? 'bio-error' : undefined}
          aria-invalid={!!getFieldError('bio')}
        />
        {getFieldError('bio') && (
          <p id="bio-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {getFieldError('bio')}
          </p>
        )}
      </div>

      {/* Manifesto */}
      <div>
        <label htmlFor="manifesto" className="block text-sm font-medium text-gray-300 mb-2">
          Manifesto
        </label>
        <textarea
          id="manifesto"
          value={formData.manifesto}
          onChange={(e) => handleInputChange('manifesto', e.target.value)}
          onBlur={() => handleBlur('manifesto')}
          className={getFieldClasses('manifesto')}
          placeholder="Candidate manifesto..."
          rows={4}
          aria-describedby={getFieldError('manifesto') ? 'manifesto-error' : undefined}
          aria-invalid={!!getFieldError('manifesto')}
        />
        {getFieldError('manifesto') && (
          <p id="manifesto-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {getFieldError('manifesto')}
          </p>
        )}
      </div>

      {/* Photo URL */}
      <div>
        <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-300 mb-2">
          <Image className="w-4 h-4 inline mr-1" />
          Photo URL
        </label>
        <input
          type="url"
          id="photoUrl"
          value={formData.photoUrl}
          onChange={(e) => handleInputChange('photoUrl', e.target.value)}
          onBlur={() => handleBlur('photoUrl')}
          className={getFieldClasses('photoUrl')}
          placeholder="https://example.com/photo.jpg"
          aria-describedby={getFieldError('photoUrl') ? 'photoUrl-error' : undefined}
          aria-invalid={!!getFieldError('photoUrl')}
        />
        {getFieldError('photoUrl') && (
          <p id="photoUrl-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            {getFieldError('photoUrl')}
          </p>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => handleInputChange('isActive', e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
          Active candidate
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !formData.name || !formData.seat}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              {candidate ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              {candidate ? 'Update Candidate' : 'Add Candidate'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CandidateForm;
