import type { JiraIssue } from '@/api/types'
import { useIssueDetails } from '@/hooks/useIssueDetails'
import { useIssueWorklogs } from '@/hooks/useIssueWorklogs'
import { useIssuesWithWorklogs } from '@/hooks/useIssuesWithWorklogs'
import { cn, formatDate, formatSeconds, isSameDay, isWeekend } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { usePeriodStore } from '@/store/periodStore'
import { useTasksStore } from '@/store/tasksStore'
import { CircleDot, ClipboardList, ExternalLink, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MatrixCell } from './MatrixCell'

// ─── Per-issue row total ──────────────────────────────────────────────────────

function IssueRowTotal({ issueKey }: { issueKey: string }) {
  const { data: worklogs } = useIssueWorklogs(issueKey)
  const total = (worklogs ?? []).reduce((sum, wl) => sum + wl.timeSpentSeconds, 0)

  return (
    <td className="h-10 w-24 px-3 text-right text-sm font-semibold text-[var(--color-text-primary)] border-b border-l border-[var(--color-border)] bg-[var(--color-surface)] sticky right-0">
      {total > 0 ? formatSeconds(total) : ''}
    </td>
  )
}

// ─── Worklog aggregator (headless) ────────────────────────────────────────────
// Reads one issue's worklogs from cache and reports seconds-per-day to parent.

interface WorklogContribProps {
  issueKey: string
  days: Date[]
  onData: (issueKey: string, secondsPerDay: number[], totalSeconds: number) => void
}

function WorklogContrib({ issueKey, days, onData }: WorklogContribProps) {
  const { data: worklogs } = useIssueWorklogs(issueKey)

  const secondsPerDay = useMemo(() => {
    if (!worklogs) return days.map(() => 0)
    return days.map((day) =>
      worklogs
        .filter((wl) => isSameDay(new Date(wl.started), day))
        .reduce((sum, wl) => sum + wl.timeSpentSeconds, 0)
    )
  }, [worklogs, days])

  const total = useMemo(() => secondsPerDay.reduce((a, b) => a + b, 0), [secondsPerDay])

  // Use a ref to avoid calling onData on every render — only when values change
  const prevRef = useRef<string>('')
  const key = secondsPerDay.join(',')
  useEffect(() => {
    if (prevRef.current !== key) {
      prevRef.current = key
      onData(issueKey, secondsPerDay, total)
    }
  }, [issueKey, key, secondsPerDay, total, onData])

  return null
}

// ─── Summary row ──────────────────────────────────────────────────────────────

interface SummaryRowProps {
  issueKeys: string[]
  days: Date[]
}

function SummaryRow({ issueKeys, days }: SummaryRowProps) {
  const { t } = useTranslation()

  // Store per-issue contributions: issueKey -> secondsPerDay[]
  const [contributions, setContributions] = useState<Record<string, number[]>>({})

  const handleData = useMemo(
    () => (issueKey: string, secondsPerDay: number[]) => {
      setContributions((prev) => {
        const existing = prev[issueKey]
        // Avoid update if nothing changed
        if (existing && existing.join(',') === secondsPerDay.join(',')) return prev
        return { ...prev, [issueKey]: secondsPerDay }
      })
    },
    []
  )

  // Sum per day across all issues
  const dayTotals = useMemo(() => {
    return days.map((_, di) =>
      Object.values(contributions).reduce((sum, perDay) => sum + (perDay[di] ?? 0), 0)
    )
  }, [contributions, days])

  const grandTotal = useMemo(() => dayTotals.reduce((a, b) => a + b, 0), [dayTotals])

  return (
    <>
      {/* Headless aggregators — one per issue, renders nothing */}
      {issueKeys.map((key) => (
        <WorklogContrib key={key} issueKey={key} days={days} onData={handleData} />
      ))}

      <tr className="bg-[var(--color-surface-elevated)]">
        <td className="sticky left-0 z-10 bg-[var(--color-surface-elevated)] border-r border-t border-[var(--color-border)] h-10 min-w-64 px-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">
          {t('matrix.total')}
        </td>
        {dayTotals.map((secs, i) => (
          <td
            key={days[i].toISOString()}
            className={cn(
              'h-10 w-20 px-2 text-center text-sm font-semibold border-r border-t border-[var(--color-border)]',
              isWeekend(days[i]) && 'opacity-50',
              secs > 0
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-muted)]'
            )}
          >
            {secs > 0 ? formatSeconds(secs) : ''}
          </td>
        ))}
        <td className="h-10 w-24 px-3 text-right text-sm font-semibold border-l border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] sticky right-0 text-[var(--color-text-primary)]">
          {grandTotal > 0 ? formatSeconds(grandTotal) : ''}
        </td>
      </tr>
    </>
  )
}

// ─── Task row ─────────────────────────────────────────────────────────────────

interface TaskRowProps {
  issue: JiraIssue
  days: Date[]
  spaceUrl: string
  isPinned: boolean
  onUnpin?: () => void
}

function TaskRow({ issue, days, spaceUrl, isPinned, onUnpin }: TaskRowProps) {
  const { t } = useTranslation()
  const iconUrl = issue.fields.issuetype?.iconUrl

  return (
    <tr className="group hover:bg-[var(--color-surface-elevated)]/40 transition-colors">
      <td className="sticky left-0 z-10 bg-[var(--color-surface)] group-hover:bg-[var(--color-surface-elevated)]/80 border-r border-b border-[var(--color-border)] h-10 min-w-64 max-w-80 px-3 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={issue.fields.issuetype?.name ?? ''}
              className="w-4 h-4 shrink-0"
              onError={(e) => {
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
              }}
            />
          ) : (
            <CircleDot className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" />
          )}

          <a
            href={`${spaceUrl}/browse/${issue.key}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-xs text-[var(--color-accent)] hover:underline shrink-0"
          >
            {issue.key}
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <span
            className="text-sm text-[var(--color-text-secondary)] truncate min-w-0"
            title={issue.fields.summary}
          >
            {issue.fields.summary}
          </span>

          {isPinned && onUnpin && (
            <button
              onClick={onUnpin}
              title={t('matrix.removeTask')}
              className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-destructive)] transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>

      {days.map((day) => (
        <MatrixCell
          key={day.toISOString()}
          issueKey={issue.key}
          issueSummary={issue.fields.summary}
          date={day}
          isWeekend={isWeekend(day)}
        />
      ))}

      <IssueRowTotal issueKey={issue.key} />
    </tr>
  )
}

// ─── Pinned row ───────────────────────────────────────────────────────────────

function PinnedIssueRow({
  issueKey,
  days,
  spaceUrl,
}: {
  issueKey: string
  days: Date[]
  spaceUrl: string
}) {
  const { data: issue, isLoading } = useIssueDetails(issueKey)
  const unpinTask = useTasksStore((s) => s.unpinTask)

  if (isLoading) {
    return (
      <tr>
        <td className="sticky left-0 z-10 bg-[var(--color-surface)] border-r border-b border-[var(--color-border)] h-10 min-w-64 px-3">
          <div className="h-3 w-40 rounded bg-[var(--color-border)] animate-pulse" />
        </td>
        {days.map((d) => (
          <td key={d.toISOString()} className="h-10 w-20 border-r border-b border-[var(--color-border)]" />
        ))}
        <td className="h-10 w-24 border-b border-l border-[var(--color-border)]" />
      </tr>
    )
  }

  if (!issue) return null

  return (
    <TaskRow
      issue={issue}
      days={days}
      spaceUrl={spaceUrl}
      isPinned
      onUnpin={() => unpinTask(issueKey)}
    />
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function TimeMatrix() {
  const { t, i18n } = useTranslation()
  const { daysInPeriod } = usePeriodStore()
  const { data: fetchedIssues, isLoading: issuesLoading } = useIssuesWithWorklogs()
  const { pinnedTaskKeys, unpinTask } = useTasksStore()
  const spaceUrl = useAuthStore((s) => s.credentials?.spaceUrl ?? '')

  const fetchedKeys = (fetchedIssues ?? []).map((i) => i.key)
  const extraPinnedKeys = pinnedTaskKeys.filter((k) => !fetchedKeys.includes(k))
  const allIssueKeys = [...fetchedKeys, ...extraPinnedKeys]
  const isEmpty = allIssueKeys.length === 0 && !issuesLoading

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24 gap-4">
        <ClipboardList className="w-12 h-12 text-[var(--color-text-muted)]" />
        <p className="text-base font-medium text-[var(--color-text-secondary)]">
          {t('matrix.noTasks')}
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          {t('matrix.noTasksDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-auto h-full">
      <table className="border-collapse text-sm" style={{ width: 'max-content', minWidth: '100%' }}>
        <thead>
          <tr>
            {/* Task column header */}
            <th className="sticky left-0 top-0 z-20 bg-[var(--color-surface)] border-r border-b border-[var(--color-border)] h-11 min-w-64 px-3 text-left" />
            {/* Day headers */}
            {daysInPeriod.map((day) => (
              <th
                key={day.toISOString()}
                className={cn(
                  'sticky top-0 z-10 bg-[var(--color-surface)] border-r border-b border-[var(--color-border)] h-11 w-20 px-2 text-center',
                  isWeekend(day) && 'opacity-40'
                )}
              >
                <div className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                  {formatDate(day, 'EEE', i18n.language)}
                </div>
                <div className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">
                  {formatDate(day, 'd', i18n.language)}
                </div>
              </th>
            ))}
            {/* Total header */}
            <th className="sticky top-0 right-0 z-20 bg-[var(--color-surface)] border-b border-l border-[var(--color-border)] h-11 w-24 px-3 text-right text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">
              {t('matrix.total')}
            </th>
          </tr>
        </thead>

        <tbody>
          {/* Loading skeletons */}
          {issuesLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                <td className="sticky left-0 z-10 bg-[var(--color-surface)] border-r border-b border-[var(--color-border)] h-10 min-w-64 px-3">
                  <div className="h-3 w-48 rounded bg-[var(--color-border)] animate-pulse" />
                </td>
                {daysInPeriod.map((d) => (
                  <td key={d.toISOString()} className="h-10 w-20 border-r border-b border-[var(--color-border)]" />
                ))}
                <td className="h-10 w-24 border-b border-l border-[var(--color-border)]" />
              </tr>
            ))}

          {/* Fetched issue rows */}
          {(fetchedIssues ?? []).map((issue) => (
            <TaskRow
              key={issue.key}
              issue={issue}
              days={daysInPeriod}
              spaceUrl={spaceUrl}
              isPinned={pinnedTaskKeys.includes(issue.key)}
              onUnpin={() => unpinTask(issue.key)}
            />
          ))}

          {/* Extra pinned rows */}
          {extraPinnedKeys.map((key) => (
            <PinnedIssueRow
              key={key}
              issueKey={key}
              days={daysInPeriod}
              spaceUrl={spaceUrl}
            />
          ))}

          {/* Summary row with actual totals */}
          {!issuesLoading && allIssueKeys.length > 0 && (
            <SummaryRow issueKeys={allIssueKeys} days={daysInPeriod} />
          )}
        </tbody>
      </table>
    </div>
  )
}
