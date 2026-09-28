import type { Worklog } from '@/api/types'
import {
  useDeleteWorklog,
  useUpdateWorklog,
} from '@/hooks/useWorklogMutations'
import { formatSeconds, parseAdfToText } from '@/lib/utils'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { WorklogEntryForm } from './WorklogEntryForm'

interface WorklogEntryListProps {
  issueKey: string
  worklogs: Worklog[]
}

interface EntryRowProps {
  issueKey: string
  worklog: Worklog
}

function EntryRow({ issueKey, worklog }: EntryRowProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const updateMutation = useUpdateWorklog(issueKey)
  const deleteMutation = useDeleteWorklog(issueKey)

  const commentText = parseAdfToText(worklog.comment)

  const handleUpdate = (timeSpentSeconds: number, comment: string) => {
    updateMutation.mutate(
      { worklogId: worklog.id, timeSpentSeconds, comment },
      {
        onSuccess: () => {
          toast.success(t('success.updateWorklog'))
          setEditing(false)
        },
        onError: () => toast.error(t('errors.updateWorklog')),
      }
    )
  }

  const handleDelete = () => {
    deleteMutation.mutate(worklog.id, {
      onSuccess: () => {
        toast.success(t('success.deleteWorklog'))
        setDeleteOpen(false)
      },
      onError: () => toast.error(t('errors.deleteWorklog')),
    })
  }

  if (editing) {
    return (
      <WorklogEntryForm
        initialHours={worklog.timeSpentSeconds}
        initialComment={commentText}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
        isLoading={updateMutation.isPending}
      />
    )
  }

  return (
    <div className="flex items-start gap-2 py-2 px-3 rounded-lg hover:bg-[var(--color-surface-elevated)] group transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {formatSeconds(worklog.timeSpentSeconds)}
          </span>
          {commentText && (
            <span className="text-sm text-[var(--color-text-secondary)] truncate">
              — {commentText}
            </span>
          )}
        </div>
        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {worklog.author.displayName}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
          title={t('worklog.edit')}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialog.Trigger asChild>
            <button
              className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-border)] transition-colors"
              title={t('worklog.delete')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
            <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-2xl">
              <AlertDialog.Title className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
                {t('worklog.confirmDelete')}
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-[var(--color-text-secondary)] mb-5">
                {t('worklog.confirmDeleteDescription')}
              </AlertDialog.Description>
              <div className="flex gap-3 justify-end">
                <AlertDialog.Cancel asChild>
                  <button className="px-3 py-1.5 rounded border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                    {t('worklog.cancelDelete')}
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1.5 rounded bg-[var(--color-destructive)] text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {t('worklog.confirmDeleteButton')}
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
    </div>
  )
}

export function WorklogEntryList({ issueKey, worklogs }: WorklogEntryListProps) {
  const { t } = useTranslation()

  if (worklogs.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
        {t('worklog.noEntries')}
      </p>
    )
  }

  return (
    <div className="space-y-0.5">
      {worklogs.map((wl) => (
        <EntryRow key={wl.id} issueKey={issueKey} worklog={wl} />
      ))}
    </div>
  )
}
