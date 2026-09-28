import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useAuthStore } from '@/store/authStore'
import * as Dialog from '@radix-ui/react-dialog'
import { LogOut, Settings, Timer } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SettingsForm } from './SettingsPage'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation()
  const { data: currentUser } = useCurrentUser()
  const clearCredentials = useAuthStore((s) => s.clearCredentials)
  const [settingsOpen, setSettingsOpen] = useState(false)

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

        {/* Language */}
        <LanguageSwitcher />

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--color-border)]" />

        {/* Settings */}
        <Dialog.Root open={settingsOpen} onOpenChange={setSettingsOpen}>
          <Dialog.Trigger asChild>
            <button
              className="h-8 w-8 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
              title={t('nav.settings')}
            >
              <Settings className="w-4 h-4" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-2xl">
              <div className="px-6 pt-5 pb-2">
                <Dialog.Title className="text-base font-semibold text-[var(--color-text-primary)]">
                  {t('settings.title')}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {t('settings.description')}
                </Dialog.Description>
              </div>
              <div className="px-6 pb-6">
                <SettingsForm
                  isDialog
                  onSave={() => setSettingsOpen(false)}
                  onCancel={() => setSettingsOpen(false)}
                />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* User info + sign out */}
        {currentUser && (
          <>
            <div className="w-px h-5 bg-[var(--color-border)]" />
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatarUrls['24x24']}
                alt={currentUser.displayName}
                className="w-7 h-7 rounded-full ring-1 ring-[var(--color-border)]"
              />
              <span className="text-xs text-[var(--color-text-secondary)] hidden sm:block max-w-32 truncate">
                {currentUser.displayName}
              </span>
              <button
                onClick={clearCredentials}
                className="h-8 w-8 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                title={t('nav.signOut')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
