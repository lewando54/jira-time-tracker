import { cn, formatDate } from '@/lib/utils'
import { usePeriodStore } from '@/store/periodStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PeriodSelector() {
  const { t, i18n } = useTranslation()
  const { view, periodRange, weekNumber, setView, goNext, goPrev } = usePeriodStore()
  const { start, end } = periodRange
  const lang = i18n.language

  const label =
    view === 'week'
      ? t('period.weekLabel', {
          week: weekNumber,
          start: formatDate(start, 'd MMM', lang),
          end: formatDate(end, 'd MMM', lang),
        })
      : t('period.monthLabel', {
          month: formatDate(start, 'LLLL', lang),
          year: formatDate(start, 'yyyy', lang),
        })

  return (
    <div className="flex items-center gap-4">
      {/* Week / Month toggle */}
      <div className="flex items-center rounded-md overflow-hidden border border-[var(--color-border)]">
        {(['week', 'month'] as const).map((v, i) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              'h-8 px-4 text-xs font-semibold tracking-wide transition-colors',
              i > 0 && 'border-l border-[var(--color-border)]',
              view === v
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
            )}
          >
            {v === 'week' ? t('period.week') : t('period.month')}
          </button>
        ))}
      </div>

      {/* Period navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={goPrev}
          className="h-8 w-8 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="w-52 text-center text-sm font-medium text-[var(--color-text-primary)] select-none">
          {label}
        </span>

        <button
          onClick={goNext}
          className="h-8 w-8 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
