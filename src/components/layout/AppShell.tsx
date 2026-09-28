import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useAuthStore } from '@/store/authStore'
import { LogOut, Timer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation()
  const { data: currentUser } = useCurrentUser()
  const clearSession = useAuthStore((s) => s.clearSession)

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      {/* Header */}
      <header className="h-12 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-5 gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-auto">
          <Timer className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            {t('app.title')}
          </span>
        </div>

        <LanguageSwitcher />

        <div className="w-px h-5 bg-[var(--color-border)]" />

        {/* User info + sign out */}
        {currentUser ? (
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser.avatarUrls['24x24']}
              alt={currentUser.displayName}
              className="w-7 h-7 rounded-full ring-1 ring-[var(--color-border)]"
            />
            <span className="text-xs text-[var(--color-text-secondary)] hidden sm:block max-w-36 truncate">
              {currentUser.displayName}
            </span>
            <button
              onClick={clearSession}
              className="h-8 w-8 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-surface-elevated)] transition-colors"
              title={t('nav.signOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Skeleton while user loads */
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[var(--color-border)] animate-pulse" />
            <div className="w-24 h-3 rounded bg-[var(--color-border)] animate-pulse hidden sm:block" />
          </div>
        )}
      </header>

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
