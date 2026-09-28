import { getIssueWorklogs } from '@/api/issues'
import { useAuthStore } from '@/store/authStore'
import { usePeriodStore } from '@/store/periodStore'
import { useQuery } from '@tanstack/react-query'

export function useIssueWorklogs(issueKey: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const { periodRange } = usePeriodStore()
  const startMs = periodRange.start.getTime()
  const endMs = periodRange.end.getTime()

  return useQuery({
    queryKey: ['worklogs', issueKey, startMs, endMs],
    queryFn: () => getIssueWorklogs(issueKey, startMs, endMs),
    enabled: !!issueKey && isAuthenticated,
    staleTime: 2 * 60 * 1000,
  })
}
