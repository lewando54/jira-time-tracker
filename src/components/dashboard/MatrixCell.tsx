import type { Worklog } from '@/api/types'
import { useIssueWorklogs } from '@/hooks/useIssueWorklogs'
import { cn, formatSeconds, isSameDay } from '@/lib/utils'
import { useState } from 'react'
import { WorklogModal } from '../worklog/WorklogModal'

interface MatrixCellProps {
  issueKey: string
  issueSummary: string
  date: Date
  isWeekend: boolean
}

export function MatrixCell({ issueKey, issueSummary, date, isWeekend }: MatrixCellProps) {
  const { data: worklogs, isLoading } = useIssueWorklogs(issueKey)
  const [modalOpen, setModalOpen] = useState(false)

  const dayWorklogs: Worklog[] = (worklogs ?? []).filter((wl) =>
    isSameDay(new Date(wl.started), date)
  )

  const totalSeconds = dayWorklogs.reduce((sum, wl) => sum + wl.timeSpentSeconds, 0)
  const timeLabel = totalSeconds > 0 ? formatSeconds(totalSeconds) : ''

  if (isLoading) {
    return (
      <td
        className={cn(
          'h-10 w-20 border-r border-b border-[var(--color-border)] px-2',
          isWeekend && 'opacity-40'
        )}
      >
        <div className="h-3 w-10 rounded bg-[var(--color-border)] animate-pulse mx-auto" />
      </td>
    )
  }

  return (
    <>
      <td
        onClick={() => setModalOpen(true)}
        className={cn(
          'h-10 w-20 border-r border-b border-[var(--color-border)] px-2 text-center align-middle cursor-pointer transition-colors select-none text-sm',
          isWeekend && 'opacity-40',
          totalSeconds > 0
            ? 'font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/15'
            : 'text-transparent hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-muted)]'
        )}
      >
        {timeLabel || '+'}
      </td>

      <WorklogModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        issueKey={issueKey}
        issueSummary={issueSummary}
        date={date}
        worklogs={worklogs ?? []}
      />
    </>
  )
}
