import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useGlobalUI } from '../../../components/common';  
const ElectionWizard = ({ onCreated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useGlobalUI();

  const [electionData, setElectionData] = useState({
    title: '',
    description: '',
    startsAt: '',
    endsAt: '',
    electionType: '',
    seats: ['President', 'Vice President', 'Secretary', 'Treasurer', 'Academic Representative', 'Sports Representative', 'Cultural Representative'  , 'Faculty Representative', 'Class Representative', 'Department Head', 'Committee Chair', 'Board Member', 'Trustee', 'Dean', 'Registrar', 'Librarian', 'IT Representative', 'Environmental Representative', 'Diversity Representative', 'International Student Representative', 'Graduate Student Representative', 'Undergraduate Student Representative', 'Student Union President', 'Student Union Vice President', 'Student Union Secretary', 'Student Union Treasurer', 'Student Union Academic Representative', 'Student Union Sports Representative', 'Student Union Cultural Representative', 'Student Union Welfare Representative', 'Student Union Class Representative', 'Student Union Faculty Representative', 'Student Union Student Union President', 'Student Union Student Union Vice President', 'Student Union Student Union Secretary', 'Student Union Student Union Treasurer'  ],
    subSeats: {},
    rules: {
      oneVotePerId: true,
      anonymous: true,
      eligibility: 'registered',
      allowWriteIn: false,
      requirePhotoId: false,
      minimumAge: 18,
      maximumVotes: 1,
      allowAbstain: true,
      requireConfirmation: true,
      allowEarlyVoting: false,
      allowProxyVoting: false,
      requireBiometric: false,
      allowOnlineVoting: true,
      allowOfflineVoting: false,
      votingTimeLimit: 0, // 0 = no limit
      allowVoteChange: false,
      requireWitness: false
    },
    phases: [
      { name: 'Registration', start: '', end: '' },
      { name: 'Campaigning', start: '', end: '' },
      { name: 'Voting', start: '', end: '' },
      { name: 'Results Announcement', start: '', end: '' }
    ],
    ballotStructure: 'single'
  });

  // Predefined positions for universities and institutions
  const predefinedPositions = [
    'President',
    'Vice President',
    'Secretary',
    'Treasurer',
    'Academic Representative',
    'Sports Representative',
    'Cultural Representative',
    'Welfare Representative',
    'Class Representative',
    'Faculty Representative',
    'Student Union President',
    'Student Union Vice President',
    'Student Union Secretary',
    'Student Union Treasurer',
    'Department Head',
    'Committee Chair',
    'Board Member',
    'Trustee',
    'Dean',
    'Registrar',
    'Librarian',
    'IT Representative',
    'Environmental Representative',
    'Diversity Representative',
    'International Student Representative',
    'Graduate Student Representative',
    'Undergraduate Student Representative'
  ];

  // Predefined faculties for Faculty Representative sub-seats
  const predefinedFaculties = [
    'Faculty of Science',
    'Faculty of Engineering',
    'Faculty of Technology',
    'Faculty of Medicine',
    'Faculty of Law',
    'Faculty of Business',
    'Faculty of Arts',
    'Faculty of Education',
    'Faculty of Social Sciences',
    'Faculty of Agriculture',
    'Faculty of Architecture',
    'Faculty of Pharmacy',
    'Faculty of Veterinary Medicine',
    'Faculty of Computer Science',
    'Faculty of Information Technology',
    'Faculty of Environmental Studies',
    'Faculty of Economics',
    'Faculty of Psychology',
    'Faculty of Communication',
    'Faculty of Fine Arts'
  ];

  // Predefined election templates for quick setup
  const electionTemplates = {
    'Student Union Election': {
      title: 'Student Union Election',
      description: 'Annual election for Student Union leadership positions',
      electionType: 'Student Union Election',
      seats: ['President', 'Vice President', 'Secretary', 'Treasurer', 'Academic Representative', 'Sports Representative', 'Cultural Representative'],
      subSeats: {},
      rules: {
        oneVotePerId: true,
        anonymous: true,
        eligibility: 'registered'
      },
      phases: [
        { name: 'Campaign Period', start: '', end: '' },
        { name: 'Voting Period', start: '', end: '' },
        { name: 'Results Announcement', start: '', end: '' }
      ],
      ballotStructure: 'single'
    },
    'Faculty Representative Election': {
      title: 'Faculty Representative Election',
      description: 'Election for faculty representatives across all departments',
      electionType: 'Faculty Representative Election',
      seats: ['Faculty Representative'],
      subSeats: {
        'Faculty Representative': ['Faculty of Science', 'Faculty of Engineering', 'Faculty of Technology', 'Faculty of Medicine', 'Faculty of Business']
      },
      rules: {
        oneVotePerId: true,
        anonymous: true,
        eligibility: 'registered'
      },
      phases: [
        { name: 'Nomination Period', start: '', end: '' },
        { name: 'Campaign Period', start: '', end: '' },
        { name: 'Voting Period', start: '', end: '' }
      ],
      ballotStructure: 'single'
    },
    'Class Representative Election': {
      title: 'Class Representative Election',
      description: 'Election for class representatives in each academic year',
      electionType: 'Class Representative Election',
      seats: ['Class Representative (Year 1)', 'Class Representative (Year 2)', 'Class Representative (Year 3)', 'Class Representative (Year 4)'],
      subSeats: {},
      rules: {
        oneVotePerId: true,
        anonymous: true,
        eligibility: 'registered'
      },
      phases: [
        { name: 'Nomination Period', start: '', end: '' },
        { name: 'Voting Period', start: '', end: '' }
      ],
      ballotStructure: 'single'
    },
    'Department Election': {
      title: 'Department Election',
      description: 'Election for department-specific positions',
      electionType: 'Department Election',
      seats: ['Department Head', 'Academic Coordinator', 'Research Coordinator', 'Student Affairs Coordinator'],
      subSeats: {},
      rules: {
        oneVotePerId: true,
        anonymous: true,
        eligibility: 'registered'
      },
      phases: [
        { name: 'Nomination Period', start: '', end: '' },
        { name: 'Campaign Period', start: '', end: '' },
        { name: 'Voting Period', start: '', end: '' }
      ],
      ballotStructure: 'single'
    },
    'Committee Election': {
      title: 'Committee Election',
      description: 'Election for various committee positions',
      electionType: 'Committee Election',
      seats: ['Committee Chair', 'Committee Vice Chair', 'Committee Secretary', 'Committee Member (3 positions)'],
      subSeats: {},
      rules: {
        oneVotePerId: true,
        anonymous: true,
        eligibility: 'registered'
      },
      phases: [
          { name: 'Nomination Period', start: '', end: '' },
        { name: 'Campaign Period', start: '', end: '' },
        { name: 'Voting Period', start: '', end: '' }
      ],
      ballotStructure: 'multiple'
    }
  };

  const steps = [
    { id: 1, title: 'Basic Info', icon: Settings },
    { id: 2, title: 'Schedule', icon: Calendar },
    { id: 3, title: 'Positions', icon: Users },
    { id: 4, title: 'Review', icon: CheckCircle }
  ];

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!electionData.title.trim()) newErrors.title = 'Title is required';
      if (!electionData.electionType) newErrors.electionType = 'Election type is required';
    }
    
    if (step === 2) {
      if (!electionData.startsAt) newErrors.startsAt = 'Start date is required';
      if (!electionData.endsAt) newErrors.endsAt = 'End date is required';
      if (electionData.startsAt && electionData.endsAt && new Date(electionData.startsAt) >= new Date(electionData.endsAt)) {
        newErrors.endsAt = 'End date must be after start date';
      }
    }
    
    if (step === 3) {
      if (electionData.seats.length === 0) newErrors.seats = 'At least one position is required';
      if (electionData.seats.some(seat => !seat.trim())) newErrors.seats = 'All positions must have names';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsCreating(true);
    try {
      await onCreated(electionData);
    } catch (error) {
      showToast('Failed to create election: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const updateElectionData = (field, value) => {
    setElectionData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const updateNestedData = (parent, field, value) => {
    setElectionData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addSeat = () => {
    setElectionData(prev => ({
      ...prev,
      seats: [...prev.seats, 'New Position']
    }));
  };

  const addPredefinedPosition = (position) => {
    if (position && !electionData.seats.includes(position)) {
      setElectionData(prev => ({
        ...prev,
        seats: [...prev.seats, position],
        // Initialize sub-seats for Faculty Representative
        subSeats: position === 'Faculty Representative' 
          ? { ...prev.subSeats, 'Faculty Representative': [] }
          : prev.subSeats
      }));
      // Clear seats error when user adds a position
      if (errors.seats) {
        setErrors(prev => ({ ...prev, seats: null }));
      }
    }
  };

  const updateSeat = (index, value) => {
    setElectionData(prev => ({
      ...prev,
      seats: prev.seats.map((seat, i) => i === index ? value : seat)
    }));
    // Clear seats error when user starts typing
    if (errors.seats) {
      setErrors(prev => ({ ...prev, seats: null }));
    }
  };

  const removeSeat = (index) => {
    const seatToRemove = electionData.seats[index];
    setElectionData(prev => ({
      ...prev,
      seats: prev.seats.filter((_, i) => i !== index),
      // Remove sub-seats if removing Faculty Representative
      subSeats: seatToRemove === 'Faculty Representative' 
        ? { ...prev.subSeats, 'Faculty Representative': undefined }
        : prev.subSeats
    }));
  };

  const addFacultySubSeat = (faculty) => {
    if (faculty && !electionData.subSeats['Faculty Representative']?.includes(faculty)) {
      setElectionData(prev => ({
        ...prev,
        subSeats: {
          ...prev.subSeats,
          'Faculty Representative': [
            ...(prev.subSeats['Faculty Representative'] || []),
            faculty
          ]
        }
      }));
    }
  };

  const removeFacultySubSeat = (faculty) => {
    setElectionData(prev => ({
      ...prev,
      subSeats: {
        ...prev.subSeats,
        'Faculty Representative': (prev.subSeats['Faculty Representative'] || [])
          .filter(f => f !== faculty)
      }
    }));
  };

  const loadTemplate = (templateName) => {
    const template = electionTemplates[templateName];
    if (template) {
      setElectionData(prev => ({
        ...prev,
        ...template,
        startsAt: prev.startsAt, // Keep user's schedule
        endsAt: prev.endsAt
      }));
      showToast(`Template "${templateName}" loaded successfully!`, 'success');
    }
  };

  const addPhase = () => {
    setElectionData(prev => ({
      ...prev,
      phases: [...prev.phases, { name: '', start: '', end: '', description: '', type: 'custom' }]
    }));
  };

  const addPredefinedPhase = (phaseTemplate) => {
    setElectionData(prev => ({
      ...prev,
      phases: [...prev.phases, { ...phaseTemplate }]
    }));
  };

  // Predefined phase templates
  const phaseTemplates = [
    {
      name: 'Nomination Period',
      description: 'Time for candidates to submit their nominations',
      type: 'nomination',
      start: '',
      end: ''
    },
    {
      name: 'Campaign Period',
      description: 'Time for candidates to campaign and present their platforms',
      type: 'campaign',
      start: '',
      end: ''
    },
    {
      name: 'Voting Period',
      description: 'Time when eligible voters can cast their votes',
      type: 'voting',
      start: '',
      end: ''
    },
    {
      name: 'Results Announcement',
      description: 'Time when election results are announced',
      type: 'results',
      start: '',
      end: ''
    },
    {
      name: 'Appeal Period',
      description: 'Time for candidates to appeal results if needed',
      type: 'appeal',
      start: '',
      end: ''
    },
    {
      name: 'Runoff Election',
      description: 'Additional voting round if no candidate gets majority',
      type: 'runoff',
      start: '',
      end: ''       
    }
  ];

  const updatePhase = (index, field, value) => {
    setElectionData(prev => ({
      ...prev,
      phases: prev.phases.map((phase, i) => 
        i === index ? { ...phase, [field]: value } : phase
      )
    }));
  };

  const removePhase = (index) => {
    setElectionData(prev => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Create New Election</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  isActive ? 'border-sky-400 bg-sky-400 text-white' :
                  isCompleted ? 'border-green-400 bg-green-400 text-white' :
                  'border-gray-600 text-gray-400'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-sky-400' : 
                  isCompleted ? 'text-green-400' : 
                  'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-400' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
              
              {/* Election Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quick Start Templates (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {Object.keys(electionTemplates).map((templateName) => (
                    <button
                      key={templateName}
                      onClick={() => loadTemplate(templateName)}
                      className="p-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-sky-400 rounded-lg text-left transition-colors"
                    >
                      <div className="text-sm font-medium text-white mb-1">{templateName}</div>
                      <div className="text-xs text-gray-400">
                        {electionTemplates[templateName].seats.length} positions
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Select a template to quickly populate your election with predefined positions and settings. You can modify everything after loading.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Election Title *
                </label>
                <input
                  type="text"
                  value={electionData.title}
                  onChange={(e) => updateElectionData('title', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-xl text-white placeholder-gray-400 focus:ring-1 ${
                    errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-sky-400 focus:ring-sky-400'
                  }`}
                  placeholder="e.g., Student Union Elections 2024"
                />
                {errors.title && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.title}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={electionData.description}
                  onChange={(e) => updateElectionData('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  placeholder="Describe the purpose and scope of this election..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Election Type *
                </label>
                <select
                  value={electionData.electionType}
                  onChange={(e) => updateElectionData('electionType', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-xl text-white focus:ring-1 ${
                    errors.electionType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-sky-400 focus:ring-sky-400'
                  }`}
                >
                  <option value="">Select election type</option>
                  <option value="Student Union">Student Union</option>
                  <option value="Student General ELection">General Election</option>
                  <option value="Faculty Representative">Faculty Representative</option>
                  <option value="Class Representative">Class Representative</option>
                  <option value="Sports Committee">Sports Committee</option>
                  <option value="Cultural Committee">Cultural Committee</option>
                  <option value="Other">Other</option>
                </select>
                {errors.electionType && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.electionType}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ballot Structure
                </label>
                <select
                  value={electionData.ballotStructure}
                  onChange={(e) => updateElectionData('ballotStructure', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                >
                  <option value="single">Single Choice</option>
                  <option value="multiple">Multiple Choice</option>
                  <option value="ranked">Ranked Choice</option>
                </select>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Schedule & Timeline</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={electionData.startsAt}
                    onChange={(e) => updateElectionData('startsAt', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-xl text-white focus:ring-1 ${
                      errors.startsAt ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-sky-400 focus:ring-sky-400'
                    }`}
                  />
                  {errors.startsAt && (
                    <div className="flex items-center mt-2 text-red-400 text-sm">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.startsAt}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={electionData.endsAt}
                    onChange={(e) => updateElectionData('endsAt', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-xl text-white focus:ring-1 ${
                      errors.endsAt ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-sky-400 focus:ring-sky-400'
                    }`}
                  />
                  {errors.endsAt && (
                    <div className="flex items-center mt-2 text-red-400 text-sm">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.endsAt}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Election Timeline & Phases (Optional)
                </label>
                
                {/* Phase Templates */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Quick Add Common Phases</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {phaseTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => addPredefinedPhase(template)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-sky-400 rounded-lg text-left transition-colors"
                      >
                        <div className="text-xs font-medium text-white">{template.name}</div>
                        <div className="text-xs text-gray-400 truncate">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {electionData.phases.map((phase, index) => (
                    <div key={index} className="p-4 bg-gray-700 rounded-xl">
                      <div className="flex items-center gap-4 mb-3">
                        <input
                          type="text"
                          value={phase.name}
                          onChange={(e) => updatePhase(index, 'name', e.target.value)}
                          placeholder="Phase name"
                          className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:border-sky-400"
                        />
                        <select
                          value={phase.type || 'custom'}
                          onChange={(e) => updatePhase(index, 'type', e.target.value)}
                          className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:border-sky-400"
                        >
                          <option value="custom">Custom</option>
                          <option value="nomination">Nomination</option>
                          <option value="campaign">Campaign</option>
                          <option value="voting">Voting</option>
                          <option value="results">Results</option>
                          <option value="appeal">Appeal</option>
                          <option value="runoff">Runoff</option>
                        </select>
                        <button
                          onClick={() => removePhase(index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <input
                          type="datetime-local"
                          value={phase.start}
                          onChange={(e) => updatePhase(index, 'start', e.target.value)}
                          placeholder="Start date & time"
                          className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:border-sky-400"
                        />
                        <input
                          type="datetime-local"
                          value={phase.end}
                          onChange={(e) => updatePhase(index, 'end', e.target.value)}
                          placeholder="End date & time"
                          className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:border-sky-400"
                        />
                      </div>
                      
                      <textarea
                        value={phase.description || ''}
                        onChange={(e) => updatePhase(index, 'description', e.target.value)}
                        placeholder="Phase description (optional)"
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:border-sky-400"
                      />
                    </div>
                  ))}
                  
                  <button
                    onClick={addPhase}
                    className="w-full py-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-sky-400 hover:text-sky-400 transition-colors"
                  >
                    + Add Custom Phase
                  </button>
                </div>
                
                <p className="text-xs text-gray-400 mt-2">
                  Define the timeline for your election. Phases help organize the election process and keep participants informed.
                </p>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Positions & Seats</h3>
              
              {/* Predefined Positions Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quick Add Common Positions
                </label>
                <div className="flex gap-2 mb-4">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addPredefinedPosition(e.target.value);
                        e.target.value = ''; // Reset dropdown
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  >
                    <option value="">Select a common position to add...</option>
                    {predefinedPositions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const select = document.querySelector('select');
                      if (select && select.value) {
                        addPredefinedPosition(select.value);
                        select.value = '';
                      }
                    }}
                    className="px-4 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Available Positions *
                </label>
                <div className="space-y-4">
                  {electionData.seats.map((seat, index) => (
                    <div key={index} className="p-4 bg-gray-700 rounded-xl">
                      <div className="flex items-center gap-4 mb-3">
                        <input
                          type="text"
                          value={seat}
                          onChange={(e) => updateSeat(index, e.target.value)}
                          placeholder="Position name (e.g., President, Vice President)"
                          className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:border-sky-400"
                        />
                        <button
                          onClick={() => removeSeat(index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      
                      {/* Faculty Representative Sub-seats */}
                      {seat === 'Faculty Representative' && (
                        <div className="mt-4 p-3 bg-gray-600 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-300 mb-3">
                            Faculty Sub-Representatives
                          </h5>
                          
                          {/* Add Faculty Dropdown */}
                          <div className="flex gap-2 mb-3">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  addFacultySubSeat(e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="flex-1 px-3 py-2 bg-gray-500 border border-gray-400 rounded-lg text-white text-sm focus:border-sky-400"
                            >
                              <option value="">Select a faculty to add...</option>
                              {predefinedFaculties
                                .filter(faculty => !electionData.subSeats['Faculty Representative']?.includes(faculty))
                                .map((faculty) => (
                                  <option key={faculty} value={faculty}>
                                    {faculty}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => {
                                const select = document.querySelector(`select[data-faculty-select="${index}"]`);
                                if (select && select.value) {
                                  addFacultySubSeat(select.value);
                                  select.value = '';
                                }
                              }}
                              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm transition-colors"
                            >
                              Add Faculty
                            </button>
                          </div>
                          
                          {/* Display Selected Faculties */}
                          <div className="space-y-2">
                            {electionData.subSeats['Faculty Representative']?.map((faculty, facultyIndex) => (
                              <div key={facultyIndex} className="flex items-center justify-between p-2 bg-gray-500 rounded">
                                <span className="text-sm text-white">{faculty}</span>
                                <button
                                  onClick={() => removeFacultySubSeat(faculty)}
                                  className="px-2 py-1 bg-red-500 hover:bg-red-400 text-white rounded text-xs transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          {electionData.subSeats['Faculty Representative']?.length === 0 && (
                            <p className="text-xs text-gray-400 italic">
                              No faculties selected. Add faculties to create sub-representative positions.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addSeat}
                    className="w-full py-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-sky-400 hover:text-sky-400 transition-colors"
                  >
                    + Add Custom Position
                  </button>
                </div>
                {errors.seats && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <AlertCircle size={16} className="mr-1" />
                    {errors.seats}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-4">Election Rules & Security</h4>
                
                {/* Basic Rules */}
                <div className="mb-6">
                  <h5 className="text-md font-medium text-gray-300 mb-3">Basic Voting Rules</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.oneVotePerId}
                        onChange={(e) => updateNestedData('rules', 'oneVotePerId', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">One vote per voter ID</span>
                        <p className="text-xs text-gray-400">Prevent duplicate voting</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.anonymous}
                        onChange={(e) => updateNestedData('rules', 'anonymous', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Anonymous voting</span>
                        <p className="text-xs text-gray-400">Keep voter identity secret</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.allowWriteIn}
                        onChange={(e) => updateNestedData('rules', 'allowWriteIn', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Allow write-in candidates</span>
                        <p className="text-xs text-gray-400">Voters can add custom candidates</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.allowAbstain}
                        onChange={(e) => updateNestedData('rules', 'allowAbstain', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Allow abstention</span>
                        <p className="text-xs text-gray-400">Voters can choose not to vote</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Security & Verification */}
                <div className="mb-6">
                  <h5 className="text-md font-medium text-gray-300 mb-3">Security & Verification</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.requirePhotoId}
                        onChange={(e) => updateNestedData('rules', 'requirePhotoId', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Require photo ID</span>
                        <p className="text-xs text-gray-400">Verify voter identity</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.requireConfirmation}
                        onChange={(e) => updateNestedData('rules', 'requireConfirmation', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Require vote confirmation</span>
                        <p className="text-xs text-gray-400">Double-check before submission</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.requireBiometric}
                        onChange={(e) => updateNestedData('rules', 'requireBiometric', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Biometric verification</span>
                        <p className="text-xs text-gray-400">Fingerprint/face recognition</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.requireWitness}
                        onChange={(e) => updateNestedData('rules', 'requireWitness', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Require witness</span>
                        <p className="text-xs text-gray-400">Independent observer required</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Voting Options */}
                <div className="mb-6">
                  <h5 className="text-md font-medium text-gray-300 mb-3">Voting Options</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.allowEarlyVoting}
                        onChange={(e) => updateNestedData('rules', 'allowEarlyVoting', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Allow early voting</span>
                        <p className="text-xs text-gray-400">Vote before official period</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.allowProxyVoting}
                        onChange={(e) => updateNestedData('rules', 'allowProxyVoting', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Allow proxy voting</span>
                        <p className="text-xs text-gray-400">Vote on behalf of others</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.allowOnlineVoting}
                        onChange={(e) => updateNestedData('rules', 'allowOnlineVoting', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Online voting</span>
                        <p className="text-xs text-gray-400">Vote through web interface</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={electionData.rules.allowOfflineVoting}
                        onChange={(e) => updateNestedData('rules', 'allowOfflineVoting', e.target.checked)}
                        className="mr-3 w-4 h-4 text-sky-400 bg-gray-600 border-gray-500 rounded focus:ring-sky-400"
                      />
                      <div>
                        <span className="text-gray-300 font-medium">Offline voting</span>
                        <p className="text-xs text-gray-400">Physical polling stations</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="mb-6">
                  <h5 className="text-md font-medium text-gray-300 mb-3">Advanced Settings</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Minimum Age
                      </label>
                      <input
                        type="number"
                        value={electionData.rules.minimumAge}
                        onChange={(e) => updateNestedData('rules', 'minimumAge', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:border-sky-400"
                        min="16"
                        max="100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Maximum Votes per Voter
                      </label>
                      <input
                        type="number"
                        value={electionData.rules.maximumVotes}
                        onChange={(e) => updateNestedData('rules', 'maximumVotes', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:border-sky-400"
                        min="1"
                        max="10"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Voting Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        value={electionData.rules.votingTimeLimit}
                        onChange={(e) => updateNestedData('rules', 'votingTimeLimit', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:border-sky-400"
                        min="0"
                        placeholder="0 = no limit"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Eligibility Criteria
                      </label>
                      <select
                        value={electionData.rules.eligibility}
                        onChange={(e) => updateNestedData('rules', 'eligibility', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:border-sky-400"
                      >
                        <option value="registered">Registered voters only</option>
                        <option value="all">All users</option>
                        <option value="verified">Verified users only</option>
                        <option value="faculty">Faculty members only</option>
                        <option value="students">Students only</option>
                        <option value="staff">Staff only</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Review & Confirm</h3>
              
              <div className="bg-gray-700 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-sky-400">Election Details</h4>
                  <p className="text-gray-300"><strong>Title:</strong> {electionData.title}</p>
                  <p className="text-gray-300"><strong>Type:</strong> {electionData.electionType}</p>
                  <p className="text-gray-300"><strong>Description:</strong> {electionData.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sky-400">Schedule</h4>
                  <p className="text-gray-300"><strong>Starts:</strong> {new Date(electionData.startsAt).toLocaleString()}</p>
                  <p className="text-gray-300"><strong>Ends:</strong> {new Date(electionData.endsAt).toLocaleString()}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sky-400">Positions</h4>
                  <ul className="text-gray-300">
                    {electionData.seats.map((seat, index) => (
                      <li key={index}>• {seat}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sky-400">Rules</h4>
                  <ul className="text-gray-300">
                    <li>• One vote per ID: {electionData.rules.oneVotePerId ? 'Yes' : 'No'}</li>
                    <li>• Anonymous: {electionData.rules.anonymous ? 'Yes' : 'No'}</li>
                    <li>• Eligibility: {electionData.rules.eligibility}</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-400">
            Step {currentStep} of {steps.length}
          </div>
          
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Election'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ElectionWizard;