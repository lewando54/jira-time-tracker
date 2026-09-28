import { addWorklog, deleteWorklog, updateWorklog } from '@/api/worklogs'
import { queryClient } from '@/lib/queryClient'
import { usePeriodStore } from '@/store/periodStore'
import { useMutation } from '@tanstack/react-query'

function useWorklogQueryKey(issueKey: string) {
  const { periodRange } = usePeriodStore()
  return ['worklogs', issueKey, periodRange.start.getTime(), periodRange.end.getTime()]
}

export function useAddWorklog(issueKey: string) {
  const queryKey = useWorklogQueryKey(issueKey)

  return useMutation({
    mutationFn: ({
      started,
      timeSpentSeconds,
      comment,
    }: {
      started: Date
      timeSpentSeconds: number
      comment?: string
    }) => addWorklog(issueKey, started, timeSpentSeconds, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

export function useUpdateWorklog(issueKey: string) {
  const queryKey = useWorklogQueryKey(issueKey)

  return useMutation({
    mutationFn: ({
      worklogId,
      timeSpentSeconds,
      comment,
    }: {
      worklogId: string
      timeSpentSeconds: number
      comment?: string
    }) => updateWorklog(issueKey, worklogId, timeSpentSeconds, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

export function useDeleteWorklog(issueKey: string) {
  const queryKey = useWorklogQueryKey(issueKey)

  return useMutation({
    mutationFn: (worklogId: string) => deleteWorklog(issueKey, worklogId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}
