import { searchIssues } from '@/api/issues'
import type { IssuePickerIssue } from '@/api/types'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export function useIssueSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300)

  const result = useQuery({
    queryKey: ['issueSearch', debouncedQuery],
    queryFn: () => searchIssues(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  })

  const issues: IssuePickerIssue[] = useMemo(() => {
    if (!result.data) return []
    return result.data.sections.flatMap((section) => section.issues)
  }, [result.data])

  return { ...result, issues }
}
