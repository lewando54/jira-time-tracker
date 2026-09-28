import type { Worklog } from '@/api/types'
import { useAddWorklog } from '@/hooks/useWorklogMutations'
import { formatDate, isSameDay } from '@/lib/utils'
import * as Dialog from '@radix-ui/react-dialog'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { WorklogEntryForm } from './WorklogEntryForm'
import { WorklogEntryList } from './WorklogEntryList'

interface WorklogModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issueKey: string
  issueSummary: string
  date: Date
  worklogs: Worklog[]
}

export function WorklogModal({
  open,
  onOpenChange,
  issueKey,
  issueSummary,
  date,
  worklogs,
}: WorklogModalProps) {
  const { t, i18n } = useTranslation()
  const [addingEntry, setAddingEntry] = useState(false)
  const addMutation = useAddWorklog(issueKey)

  // Filter worklogs to only those on the selected day
  const dayWorklogs = worklogs.filter((wl) => isSameDay(new Date(wl.started), date))

  const dateLabel = formatDate(date, 'EEE d MMM yyyy', i18n.language)

  const handleAdd = (timeSpentSeconds: number, comment: string) => {
    // Use noon of the selected day as the start time
    const started = new Date(date)
    started.setHours(12, 0, 0, 0)

    addMutation.mutate(
      { started, timeSpentSeconds, comment },
      {
        onSuccess: () => {
          toast.success(t('success.addWorklog'))
          setAddingEntry(false)
        },
        onError: () => toast.error(t('errors.addWorklog')),
      }
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl"
          onKeyDown={(e) => {
            if (e.key === 'Escape') onOpenChange(false)
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-[var(--color-border)]">
            <div className="min-w-0 pr-4">
              <Dialog.Title className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                <span className="font-mono text-[var(--color-accent)]">{issueKey}</span>
                <span className="text-[var(--color-text-muted)]">—</span>
                <span className="truncate">{issueSummary}</span>
              </Dialog.Title>
              <Dialog.Description className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {dateLabel}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
            <WorklogEntryList issueKey={issueKey} worklogs={dayWorklogs} />

            {addingEntry ? (
              <WorklogEntryForm
                onSubmit={handleAdd}
                onCancel={() => setAddingEntry(false)}
                isLoading={addMutation.isPending}
              />
            ) : (
              <button
                onClick={() => setAddingEntry(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md border border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('worklog.addEntry')}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
