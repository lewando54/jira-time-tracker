import { getIssueWorklogs } from '@/api/issues'
import { useAuthStore } from '@/store/authStore'
import { usePeriodStore } from '@/store/periodStore'
import { useQuery } from '@tanstack/react-query'

export function useIssueWorklogs(issueKey: string) {
  const hasCredentials = useAuthStore((s) => s.hasCredentials())
  const { periodRange } = usePeriodStore()
  const startMs = periodRange.start.getTime()
  const endMs = periodRange.end.getTime()

  return useQuery({
    queryKey: ['worklogs', issueKey, startMs, endMs],
    queryFn: () => getIssueWorklogs(issueKey, startMs, endMs),
    enabled: !!issueKey && hasCredentials,
    staleTime: 2 * 60 * 1000,
  })
}
