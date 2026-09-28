import { getIssueDetails } from '@/api/issues'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'

export function useIssueDetails(issueKey: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return useQuery({
    queryKey: ['issueDetails', issueKey],
    queryFn: () => getIssueDetails(issueKey!),
    enabled: !!issueKey && isAuthenticated,
    staleTime: 10 * 60 * 1000,
  })
}
