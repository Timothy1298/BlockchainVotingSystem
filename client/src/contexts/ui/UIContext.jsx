import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext();

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [modals, setModals] = useState({
    showAddModal: false,
    showEditModal: false,
    showBulkModal: false,
    showPreviewModal: false,
    showVoteModal: false,
    showVoterIdPrompt: false
  });

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const openModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({
      showAddModal: false,
      showEditModal: false,
      showBulkModal: false,
      showPreviewModal: false,
      showVoteModal: false,
      showVoterIdPrompt: false
    });
    setSelectedCandidate(null);
    setSelectedElection(null);
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  }, []);

  const showError = useCallback((message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  const clearMessages = useCallback(() => {
    setSuccess(null);
    setError(null);
  }, []);

  return (
    <UIContext.Provider value={{
      modals,
      selectedCandidate,
      selectedElection,
      success,
      error,
      openModal,
      closeModal,
      closeAllModals,
      setSelectedCandidate,
      setSelectedElection,
      showSuccess,
      showError,
      clearMessages
    }}>
      {children}
    </UIContext.Provider>
  );
};
