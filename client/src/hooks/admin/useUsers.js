import { useQuery } from '@tanstack/react-query';

const fetchUsers = async () => {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export default function useUsers() {
  return useQuery(['users'], fetchUsers, { staleTime: 1000 * 30 });
}
