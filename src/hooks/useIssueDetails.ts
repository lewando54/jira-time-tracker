import { getIssueDetails } from '@/api/issues'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'

export function useIssueDetails(issueKey: string | null) {
  const hasCredentials = useAuthStore((s) => s.hasCredentials())

  return useQuery({
    queryKey: ['issueDetails', issueKey],
    queryFn: () => getIssueDetails(issueKey!),
    enabled: !!issueKey && hasCredentials,
    staleTime: 10 * 60 * 1000,
  })
}
