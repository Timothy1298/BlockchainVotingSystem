import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemAPI } from '../../services/api';

// ===== SYSTEM MONITORING HOOKS =====

// F.6.1: Immutable System Logs
export const useSystemLogs = (params) => {
  return useQuery({
    queryKey: ['system', 'logs', params],
    queryFn: () => systemAPI.getLogs(params),
    staleTime: 1000 * 60, // 1 minute
    retry: false, // Don't retry on failure
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

export const useCreateSystemLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: systemAPI.createLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system', 'logs'] });
    },
  });
};

// F.6.2: Security & Fraud Notifications
export const useSecurityNotifications = (params) => {
  return useQuery({
    queryKey: ['system', 'security', 'notifications', params],
    queryFn: () => systemAPI.getSecurityNotifications(params),
    staleTime: 1000 * 30, // 30 seconds
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateSecurityAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: systemAPI.createSecurityAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system', 'security', 'notifications'] });
    },
  });
};

// F.6.3: Blockchain Node Health Monitor
export const useBlockchainHealth = () => {
  return useQuery({
    queryKey: ['system', 'blockchain', 'health'],
    queryFn: systemAPI.checkBlockchainHealth,
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
    staleTime: 1000 * 15, // 15 seconds
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useBlockchainStatus = (params) => {
  return useQuery({
    queryKey: ['system', 'blockchain', 'status', params],
    queryFn: () => systemAPI.getBlockchainStatus(params),
    staleTime: 1000 * 60, // 1 minute
  });
};

// Security monitoring
export const useFailedLogins = (params) => {
  return useQuery({
    queryKey: ['system', 'security', 'failed-logins', params],
    queryFn: () => systemAPI.monitorFailedLogins(params),
    staleTime: 1000 * 60, // 1 minute
  });
};

// Audit trail
export const useAuditTrail = (params) => {
  return useQuery({
    queryKey: ['system', 'audit-trail', params],
    queryFn: () => systemAPI.getAuditTrail(params),
    staleTime: 1000 * 60, // 1 minute
  });
};

// System health report
export const useSystemHealthReport = () => {
  return useQuery({
    queryKey: ['system', 'health-report'],
    queryFn: systemAPI.getHealthReport,
    refetchInterval: 1000 * 60, // Refetch every minute
    staleTime: 1000 * 30, // 30 seconds
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// Combined system monitoring hook for Dashboard
export const useSystemMonitoring = () => {
  const logs = useSystemLogs();
  const notifications = useSecurityNotifications();
  const blockchain = useBlockchainHealth();
  const health = useSystemHealthReport();

  return {
    data: {
      logs: logs.data?.logs || [],
      alerts: notifications.data?.notifications || [],
      blockchain: blockchain.data || { blocks: 0, txCount: 0, latestHash: ', latestTime: ', nodes: 0 },
      notifications: notifications.data?.notifications || [],
      health: health.data || {}
    },
    isLoading: logs.isLoading || notifications.isLoading || blockchain.isLoading || health.isLoading,
    error: logs.error || notifications.error || blockchain.error || health.error,
  };
};
