import React, { createContext, useContext } from 'react';
import { useVoting } from '../../hooks/voters';

const VotingContext = createContext();

export const useVotingContext = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVotingContext must be used within a VotingProvider');
  }
  return context;
};

export const VotingProvider = ({ children }) => {
  const votingData = useVoting();

  return (
    <VotingContext.Provider value={votingData}>
      {children}
    </VotingContext.Provider>
  );
};
