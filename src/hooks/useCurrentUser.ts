import { getCurrentUser } from '@/api/user'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'

export function useCurrentUser() {
  const hasCredentials = useAuthStore((s) => s.hasCredentials())

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: hasCredentials,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}
