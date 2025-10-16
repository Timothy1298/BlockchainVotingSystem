import { useQuery } from '@tanstack/react-query';

const fetchVoters = async () => {
  const res = await fetch('/api/voters');
  if (!res.ok) throw new Error('Failed to fetch voters');
  return res.json();
};

export default function useVoters() {
  return useQuery(['voters'], fetchVoters, { staleTime: 1000 * 30 });
}
