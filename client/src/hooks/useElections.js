import { useQuery } from '@tanstack/react-query';

const fetchElections = async () => {
  const res = await fetch('/api/elections');
  if (!res.ok) throw new Error('Failed to fetch elections');
  return res.json();
};

export default function useElections() {
  return useQuery(['elections'], fetchElections, { staleTime: 1000 * 30 });
}
