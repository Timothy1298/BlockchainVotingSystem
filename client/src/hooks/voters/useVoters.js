import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { votersAPI } from '../../services/api';

// ===== VOTERS HOOKS =====
export const useVoters = () => {
  return useQuery({
    queryKey: ['voters'],
    queryFn: votersAPI.list,
    staleTime: 1000 * 30,
  });
};

export const useVoter = (id) => {
  return useQuery({
    queryKey: ['voters', id],
    queryFn: () => votersAPI.getStatus(id),
    enabled: !!id,
  });
};

export const useSearchVoters = (query) => {
  return useQuery({
    queryKey: ['voters', 'search', query],
    queryFn: () => votersAPI.search(query),
    enabled: !!query && query.length > 2,
  });
};

export const useRegisterVoter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: votersAPI.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
};

export const useRegisterVotersCSV = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: votersAPI.registerCSV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
};

export const useApproveVoter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: votersAPI.approve,
    onSuccess: (_, voterId) => {
      queryClient.invalidateQueries({ queryKey: ['voters', voterId] });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
};

export const useRejectVoter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: votersAPI.reject,
    onSuccess: (_, voterId) => {
      queryClient.invalidateQueries({ queryKey: ['voters', voterId] });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
};

export const useResetVoterAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: votersAPI.resetAccess,
    onSuccess: (_, voterId) => {
      queryClient.invalidateQueries({ queryKey: ['voters', voterId] });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
};

export const useBlacklistVoter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: votersAPI.blacklist,
    onSuccess: (_, voterId) => {
      queryClient.invalidateQueries({ queryKey: ['voters', voterId] });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
};

export const useGenerateVoterToken = () => {
  return useMutation({
    mutationFn: votersAPI.generateToken,
  });
};

export const useRegisterVoterForElection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ voterId, electionId }) => votersAPI.registerForElection(voterId, electionId),
    onSuccess: (_, { voterId, electionId }) => {
      queryClient.invalidateQueries({ queryKey: ['voters', voterId] });
      queryClient.invalidateQueries({ queryKey: ['elections', electionId] });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
};

export const useUpdateVoter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => votersAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['voters', id] });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
};

export const useDeleteVoter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: votersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
};

// Legacy export for backward compatibility
export default useVoters;
