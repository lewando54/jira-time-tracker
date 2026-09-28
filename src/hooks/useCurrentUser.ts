import { getCurrentUser } from '@/api/user'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}
