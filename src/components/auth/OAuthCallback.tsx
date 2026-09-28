import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Rendered at the /callback route (when Atlassian redirects back after login).
 * Extracts the ?code= param, sends it to the proxy to exchange for tokens,
 * stores the session, then replaces the URL so the callback params disappear.
 */
export function OAuthCallback() {
  const { t } = useTranslation()
  const setSession = useAuthStore((s) => s.setSession)
  const [error, setError] = useState<string | null>(null)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const errorParam = params.get('error')

    if (errorParam) {
      setError(t('auth.oauthError', { error: errorParam }))
      return
    }

    if (!code) {
      setError(t('auth.missingCode'))
      return
    }

    const proxyUrl = import.meta.env.VITE_PROXY_URL as string | undefined
    const base = proxyUrl ? proxyUrl.replace(/\/$/, '') : ''

    // The redirect URI must match exactly what was registered in the Atlassian app
    const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}callback`

    fetch(`${base}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)

        setSession({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          cloudId: data.cloud_id,
          spaceUrl: data.space_url,
          expiresAt: Date.now() + data.expires_in * 1000,
        })

        // Clean up the URL — remove ?code=... and replace state
        const cleanUrl = window.location.origin + window.location.pathname.replace(/callback\/?$/, '')
        window.history.replaceState({}, '', cleanUrl)
      })
      .catch((err: Error) => {
        setError(err.message ?? t('auth.tokenError'))
      })
  }, [setSession, t])

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-[var(--color-destructive)] font-medium mb-2">
            {t('auth.loginFailed')}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">{error}</p>
          <button
            onClick={() => window.location.replace(
              window.location.origin + (import.meta.env.BASE_URL ?? '/')
            )}
            className="h-9 px-4 rounded-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors"
          >
            {t('auth.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
      <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">{t('auth.completing')}</span>
      </div>
    </div>
  )
}
