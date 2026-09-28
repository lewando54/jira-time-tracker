import { hoursToSeconds, secondsToHours } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface WorklogEntryFormProps {
  initialHours?: number
  initialComment?: string
  onSubmit: (timeSpentSeconds: number, comment: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function WorklogEntryForm({
  initialHours = 1,
  initialComment = '',
  onSubmit,
  onCancel,
  isLoading,
}: WorklogEntryFormProps) {
  const { t } = useTranslation()
  const [hours, setHours] = useState(
    initialHours > 0 ? secondsToHours(initialHours) : 1
  )
  const [comment, setComment] = useState(initialComment)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const h = parseFloat(String(hours))
    if (!h || h <= 0) return
    onSubmit(hoursToSeconds(h), comment)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="space-y-3 p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]"
    >
      {/* Hours */}
      <div className="flex items-center gap-3">
        <div className="flex-none w-28">
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
            {t('worklog.hours')}
          </label>
          <input
            type="number"
            min="0.25"
            step="0.25"
            required
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value))}
            placeholder={t('worklog.hoursPlaceholder')}
            className="w-full px-2.5 py-1.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1">
            {t('worklog.comment')}
          </label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('worklog.commentPlaceholder')}
            className="w-full px-2.5 py-1.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
        <div className="flex items-end gap-1 pb-0.5 mt-5">
          <button
            type="submit"
            disabled={isLoading}
            className="p-1.5 rounded bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-colors disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </form>
  )
}
