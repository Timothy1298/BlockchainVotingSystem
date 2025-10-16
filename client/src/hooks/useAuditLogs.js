import { useQuery } from '@tanstack/react-query';

const fetchLogs = async ({ pageParam = 1 }) => {
  const res = await fetch(`/api/audit-logs?page=${pageParam}&limit=100`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
};

export default function useAuditLogs() {
  return useQuery(['auditLogs'], () => fetchLogs({ pageParam: 1 }), { staleTime: 1000 * 30 });
}
