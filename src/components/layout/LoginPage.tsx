import { Timer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'

function buildOAuthUrl(redirectUri: string): string {
  const clientId = import.meta.env.VITE_CLIENT_ID as string
  const scopes = [
    'read:jira-work',
    'write:jira-work',
    'read:jira-user',
    'offline_access',
  ].join(' ')

  const params = new URLSearchParams({
    audience: 'api.atlassian.com',
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state: crypto.randomUUID(),
    response_type: 'code',
    prompt: 'consent',
  })

  return `https://auth.atlassian.com/authorize?${params.toString()}`
}

export function LoginPage() {
  const { t } = useTranslation()

  const handleConnect = () => {
    const base = import.meta.env.BASE_URL ?? '/'
    const redirectUri = `${window.location.origin}${base}callback`
    window.location.href = buildOAuthUrl(redirectUri)
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      {/* Minimal header */}
      <header className="h-12 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center px-5 justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            {t('app.title')}
          </span>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
              <Timer className="w-8 h-8 text-[var(--color-accent)]" />
            </div>
          </div>

          {/* Title + description */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              {t('auth.title')}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {t('auth.description')}
            </p>
          </div>

          {/* Connect button */}
          <button
            onClick={handleConnect}
            className="w-full h-11 px-6 rounded-lg bg-[#0052CC] hover:bg-[#0747A6] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-3"
          >
            {/* Atlassian logo mark (inline SVG, no external dependency) */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M6.26 8.22C6.08 8 5.79 8 5.59 8.2L1.08 12.87C0.88 13.07 0.95 13.4 1.22 13.5L5.06 14.97C5.2 15.02 5.35 14.99 5.45 14.88L9.63 10.3C9.81 10.1 9.79 9.79 9.57 9.62L6.26 8.22Z"
                fill="white"
              />
              <path
                d="M9 0.5C7.07 0.5 5.5 2.07 5.5 4C5.5 5.93 7.07 7.5 9 7.5C10.93 7.5 12.5 5.93 12.5 4C12.5 2.07 10.93 0.5 9 0.5Z"
                fill="white"
              />
              <path
                d="M16.78 12.87L12.27 8.2C12.07 8 11.78 8 11.6 8.22L8.29 9.62C8.07 9.79 8.05 10.1 8.23 10.3L12.41 14.88C12.51 14.99 12.66 15.02 12.8 14.97L16.64 13.5C16.91 13.4 16.98 13.07 16.78 12.87Z"
                fill="white"
              />
            </svg>
            {t('auth.connectButton')}
          </button>

          <p className="text-xs text-[var(--color-text-muted)]">
            {t('auth.privacyNote')}
          </p>
        </div>
      </div>
    </div>
  )
}
