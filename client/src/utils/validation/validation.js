import * as yup from 'yup';

// Candidate form validation schema
export const candidateValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  seat: yup
    .string()
    .required('Seat/Position is required')
    .min(2, 'Seat must be at least 2 characters')
    .max(50, 'Seat must be less than 50 characters'),
  
  party: yup
    .string()
    .max(100, 'Party name must be less than 100 characters'),
  
  position: yup
    .string()
    .max(100, 'Position must be less than 100 characters'),
  
  bio: yup
    .string()
    .max(1000, 'Biography must be less than 1000 characters'),
  
  manifesto: yup
    .string()
    .max(2000, 'Manifesto must be less than 2000 characters'),
  
  photoUrl: yup
    .string()
    .url('Please enter a valid URL')
    .test('image-url', 'URL must point to an image', function(value) {
      if (!value) return true; // Optional field
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      return imageExtensions.some(ext => value.toLowerCase().includes(ext));
    }),
  
  email: yup
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  phone: yup
    .string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must be less than 20 characters'),
  
  age: yup
    .number()
    .typeError('Age must be a number')
    .min(18, 'Age must be at least 18')
    .max(100, 'Age must be less than 100')
    .integer('Age must be a whole number'),
  
  isActive: yup
    .boolean()
    .required('Active status is required')
});

// Vote form validation schema
export const voteValidationSchema = yup.object().shape({
  voterId: yup
    .string()
    .required('Voter ID is required')
    .min(1, 'Voter ID cannot be empty')
    .max(100, 'Voter ID must be less than 100 characters'),
  
  candidateId: yup
    .string()
    .required('Candidate ID is required'),
  
  electionId: yup
    .string()
    .required('Election ID is required'),
  
  voteWeight: yup
    .number()
    .typeError('Vote weight must be a number')
    .min(1, 'Vote weight must be at least 1')
    .max(1, 'Vote weight must be exactly 1')
    .integer('Vote weight must be a whole number')
});

// Bulk import validation schema
export const bulkImportValidationSchema = yup.object().shape({
  electionId: yup
    .string()
    .required('Election selection is required'),
  
  csvData: yup
    .string()
    .required('CSV data is required')
    .min(10, 'CSV data seems too short')
    .test('csv-format', 'Invalid CSV format', function(value) {
      if (!value) return false;
      const lines = value.trim().split('\n');
      if (lines.length < 2) return false;
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['name', 'seat'];
      return requiredHeaders.every(header => headers.includes(header));
    })
});

// Validation helper functions
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach(err => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};

export const validateField = async (schema, field, value) => {
  try {
    await schema.validateAt(field, { [field]: value });
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

// Custom validation rules
export const customValidators = {
  // Check if candidate name is unique within the same election and seat
  uniqueCandidateName: (existingCandidates, currentCandidateId = null) => 
    yup.string().test('unique-name', 'A candidate with this name already exists for this seat', function(value) {
      if (!value) return true;
      
      const { electionId, seat } = this.parent;
      const duplicate = existingCandidates.find(candidate => 
        candidate.name.toLowerCase() === value.toLowerCase() &&
        candidate.electionId === electionId &&
        candidate.seat === seat &&
        candidate.id !== currentCandidateId
      );
      
      return !duplicate;
    }),
  
  // Check if voter ID is valid format
  validVoterId: yup.string().test('valid-voter-id', 'Invalid voter ID format', function(value) {
    if (!value) return true;
    
    // Check if it's a valid Ethereum address
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (ethAddressRegex.test(value)) return true;
    
    // Check if it's a valid student/employee ID format
    const idRegex = /^[A-Za-z0-9\-_]{3,50}$/;
    return idRegex.test(value);
  }),
  
  // Check if election is still accepting candidates
  electionAcceptsCandidates: (elections) =>
    yup.string().test('election-accepts-candidates', 'This election is not accepting new candidates', function(value) {
      if (!value) return true;
      
      const election = elections.find(e => e._id === value);
      if (!election) return false;
      
      // Check if election settings allow adding candidates
      const settings = election.settings || {};
      return !settings.lockCandidateList;
    })
};
