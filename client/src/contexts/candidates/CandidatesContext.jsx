import React, { createContext, useContext } from 'react';
import { useCandidates } from '../../hooks/candidates';

const CandidatesContext = createContext();

export const useCandidatesContext = () => {
  const context = useContext(CandidatesContext);
  if (!context) {
    throw new Error('useCandidatesContext must be used within a CandidatesProvider');
  }
  return context;
};

export const CandidatesProvider = ({ children }) => {
  const candidatesData = useCandidates();

  return (
    <CandidatesContext.Provider value={candidatesData}>
      {children}
    </CandidatesContext.Provider>
  );
};
