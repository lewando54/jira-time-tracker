import { searchIssuesWithWorklogs } from '@/api/issues'
import { usePeriodStore } from '@/store/periodStore'
import { useQuery } from '@tanstack/react-query'
import { useCurrentUser } from './useCurrentUser'

export function useIssuesWithWorklogs() {
  const { data: currentUser } = useCurrentUser()
  const { periodRange } = usePeriodStore()
  const { start, end } = periodRange

  return useQuery({
    queryKey: ['issues', currentUser?.accountId, start.toISOString(), end.toISOString()],
    queryFn: () => searchIssuesWithWorklogs(currentUser!.accountId, start, end),
    enabled: !!currentUser?.accountId,
    staleTime: 2 * 60 * 1000,
  })
}
