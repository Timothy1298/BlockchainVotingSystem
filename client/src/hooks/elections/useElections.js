import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { electionsAPI } from '../../services/api';

// Manual cache invalidation function
export const useInvalidateElections = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    },
    invalidateElection: (id) => {
      queryClient.invalidateQueries({ queryKey: ['elections', id] });
    },
    clearAll: () => {
      queryClient.removeQueries({ queryKey: ['elections'] });
    }
  };
};

// ===== ELECTIONS HOOKS =====
export const useElections = () => {
  return useQuery({
    queryKey: ['elections'],
    queryFn: electionsAPI.list,
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useElection = (id) => {
  return useQuery({
    queryKey: ['elections', id],
    queryFn: async () => {
      console.log('🔍 useElection: Fetching election with ID:', id);
      const result = await electionsAPI.get(id);
      console.log('🔍 useElection: API response:', {
        title: result?.title,
        candidatesCount: result?.candidates?.length,
        candidates: result?.candidates?.map(c => ({ name: c.name, seat: c.seat }))
      });
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data) => {
      console.log('🔍 useElection: Query success:', {
        title: data?.title,
        candidatesCount: data?.candidates?.length
      });
    },
    onError: (error) => {
      console.error('🔍 useElection: Query error:', error);
    }
  });
};

export const useElectionOverview = () => {
  return useQuery({
    queryKey: ['elections', 'overview'],
    queryFn: electionsAPI.getOverview,
    staleTime: 1000 * 30,
  });
};

export const useCreateElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: electionsAPI.create,
    onSuccess: () => {
      // Clear cache and invalidate queries
      queryClient.removeQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['elections', 'overview'] });
    },
  });
};

export const useUpdateElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => electionsAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['elections', id] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    },
  });
};

export const useDeleteElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: electionsAPI.delete,
    onSuccess: () => {
      // Clear cache and invalidate queries
      queryClient.removeQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['elections', 'overview'] });
    },
  });
};

export const useChangeElectionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminPassword }) => electionsAPI.changeStatus(id, status, adminPassword),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['elections', id] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    },
  });
};

export const useToggleVoting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }) => electionsAPI.toggleVoting(id, enabled),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['elections', id] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    },
  });
};

export const useAddCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ electionId, candidateData }) => {
      console.log('useAddCandidate mutation called with:', { electionId, candidateData });
      return electionsAPI.addCandidate(electionId, candidateData);
    },
    onSuccess: (data, { electionId }) => {
      console.log('useAddCandidate success:', data);
      // More aggressive cache invalidation
      queryClient.removeQueries({ queryKey: ['elections', electionId] });
      queryClient.removeQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['elections', electionId] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['elections', 'overview'] });
    },
    onError: (error) => {
      console.error('useAddCandidate error:', error);
    },
  });
};

export const useLockCandidateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      console.log('Lock candidate list mutation called with:', { id });
      return electionsAPI.lockCandidateList(id);
    },
    onSuccess: (data, id) => {
      console.log('Lock candidate list success:', data);
      queryClient.invalidateQueries({ queryKey: ['elections', id] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    },
    onError: (error) => {
      console.error('Lock candidate list error:', error);
    },
  });
};

export const useFinalizeTally = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resultsHash }) => electionsAPI.finalizeTally(id, resultsHash),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['elections', id] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    },
  });
};

export const useTurnoutAnalytics = (electionId) => {
  return useQuery({
    queryKey: ['elections', electionId, 'turnout'],
    queryFn: () => electionsAPI.getTurnoutAnalytics(electionId),
    enabled: !!electionId,
  });
};

export const useFinalResults = (electionId) => {
  return useQuery({
    queryKey: ['elections', electionId, 'results'],
    queryFn: () => electionsAPI.getFinalResults(electionId),
    enabled: !!electionId,
  });
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ electionId, candidateId }) => electionsAPI.deleteCandidate(electionId, candidateId),
    onSuccess: (_, { electionId }) => {
      queryClient.invalidateQueries({ queryKey: ['elections', electionId] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    },
  });
};

export const useClearVotes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminPassword }) => {
      console.log('Clear votes mutation called with:', { id, adminPassword });
      return electionsAPI.clearVotes(id, adminPassword);
    },
    onSuccess: (data, { id }) => {
      console.log('Clear votes success:', data);
      queryClient.invalidateQueries({ queryKey: ['elections', id] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    },
    onError: (error) => {
      console.error('Clear votes error:', error);
    },
  });
};

// Legacy export for backward compatibility
export default useElections;
