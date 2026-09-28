import { useIssueSearch } from '@/hooks/useIssueSearch'
import { useTasksStore } from '@/store/tasksStore'
import * as Dialog from '@radix-ui/react-dialog'
import { CircleDot, Plus, Search, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface IssueSearchInputProps {
  onSelect: (key: string) => void
  autoFocus?: boolean
}

function IssueSearchInput({ onSelect, autoFocus }: IssueSearchInputProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const { issues, isLoading } = useIssueSearch(query)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative">
      <div className="flex items-center h-9 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] focus-within:border-[var(--color-accent)] transition-colors">
        <span className="pl-2.5 pr-2 flex items-center shrink-0 text-[var(--color-text-muted)]">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          ref={inputRef}
          type="text"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('matrix.searchPlaceholder')}
          className="flex-1 h-full pr-3 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none min-w-0"
        />
      </div>

      {query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md shadow-2xl z-[200] max-h-72 overflow-y-auto">
          {isLoading && (
            <div className="px-3 py-3">
              <div className="h-3 w-32 rounded bg-[var(--color-border)] animate-pulse" />
            </div>
          )}
          {!isLoading && issues.length === 0 && (
            <div className="px-3 py-3 text-sm text-[var(--color-text-muted)]">
              {t('matrix.searchNoResults')}
            </div>
          )}
          {issues.map((issue) => (
            <button
              key={issue.key}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[var(--color-surface)] transition-colors text-left border-b border-[var(--color-border-subtle)] last:border-0"
              onClick={() => {
                onSelect(issue.key)
                setQuery('')
              }}
            >
              {issue.img ? (
                <img
                  src={issue.img}
                  alt=""
                  className="w-4 h-4 shrink-0"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <CircleDot className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
              )}
              <span className="text-xs font-mono text-[var(--color-accent)] shrink-0 min-w-16">
                {issue.key}
              </span>
              <span className="text-sm text-[var(--color-text-primary)] truncate">
                {issue.summary}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function TaskSearchBar() {
  const { t } = useTranslation()
  const pinTask = useTasksStore((s) => s.pinTask)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSelect = (key: string) => {
    pinTask(key)
    setDialogOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Inline search — wider screens only */}
      <div className="hidden lg:block w-60">
        <IssueSearchInput onSelect={(key) => pinTask(key)} />
      </div>

      {/* Add task button */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger asChild>
          <button className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors shrink-0">
            <Plus className="w-4 h-4" />
            <span>{t('matrix.addTask')}</span>
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          {/*
            No overflow-hidden here — the dropdown inside must be able to
            extend beyond the dialog boundary. The dialog grows to fit content.
          */}
          <Dialog.Content className="fixed left-1/2 top-[18%] -translate-x-1/2 z-50 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-2xl">
            <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--color-border)]">
              <Dialog.Title className="text-sm font-semibold text-[var(--color-text-primary)]">
                {t('matrix.addTask')}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="h-7 w-7 flex items-center justify-center rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
            {/* pb-4 gives breathing room below the hint; no overflow constraint */}
            <div className="p-4 pb-5">
              <IssueSearchInput onSelect={handleSelect} autoFocus />
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                {t('matrix.searchHint')}
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
