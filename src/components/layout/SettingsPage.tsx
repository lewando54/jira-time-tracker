import { useAuthStore } from '@/store/authStore'
import { Globe, KeyRound, Mail } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SettingsFormProps {
  onSave?: () => void
  onCancel?: () => void
  isDialog?: boolean
}

function InputField({
  icon,
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  icon: React.ReactNode
  type: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  required?: boolean
}) {
  return (
    <div className="flex items-center h-10 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] focus-within:border-[var(--color-accent)] transition-colors">
      <span className="pl-3 pr-2 flex items-center shrink-0 text-[var(--color-text-muted)]">
        {icon}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 h-full pr-3 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none min-w-0"
      />
    </div>
  )
}

export function SettingsForm({ onSave, onCancel, isDialog = false }: SettingsFormProps) {
  const { t } = useTranslation()
  const { credentials, setCredentials, clearCredentials } = useAuthStore()

  const [spaceUrl, setSpaceUrl] = useState(
    credentials?.spaceUrl ?? (import.meta.env.VITE_JIRA_URL as string) ?? ''
  )
  const [email, setEmail] = useState(
    credentials?.email ?? (import.meta.env.VITE_JIRA_EMAIL as string) ?? ''
  )
  const [apiToken, setApiToken] = useState(
    credentials?.apiToken ?? (import.meta.env.VITE_JIRA_API_TOKEN as string) ?? ''
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!spaceUrl.trim() || !email.trim() || !apiToken.trim()) return
    setSaving(true)
    const normalizedUrl = spaceUrl.trim().replace(/\/$/, '')
    setCredentials({ spaceUrl: normalizedUrl, email: email.trim(), apiToken: apiToken.trim() })
    setSaving(false)
    onSave?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
          {t('settings.spaceUrl')}
        </label>
        <InputField
          icon={<Globe className="w-4 h-4" />}
          type="url"
          required
          value={spaceUrl}
          onChange={setSpaceUrl}
          placeholder={t('settings.spaceUrlPlaceholder')}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
          {t('settings.email')}
        </label>
        <InputField
          icon={<Mail className="w-4 h-4" />}
          type="email"
          required
          value={email}
          onChange={setEmail}
          placeholder={t('settings.emailPlaceholder')}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
          {t('settings.apiToken')}
        </label>
        <InputField
          icon={<KeyRound className="w-4 h-4" />}
          type="password"
          required
          value={apiToken}
          onChange={setApiToken}
          placeholder={t('settings.apiTokenPlaceholder')}
        />
      </div>

      {/* Primary action */}
      <div className="pt-2 space-y-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full h-10 px-4 rounded-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? t('settings.saving') : t('settings.save')}
        </button>

        {isDialog && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 h-9 px-4 rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
            >
              {t('settings.cancel')}
            </button>
            {credentials && (
              <button
                type="button"
                onClick={() => { clearCredentials(); onCancel?.() }}
                className="flex-1 h-9 px-4 rounded-md border border-[var(--color-destructive)] text-[var(--color-destructive)] text-sm hover:bg-[var(--color-destructive)] hover:text-white transition-colors"
              >
                {t('settings.clearCredentials')}
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  )
}

export function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2">
            {t('settings.loginRequired')}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('settings.loginDescription')}
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
          <SettingsForm />
        </div>
      </div>
    </div>
  )
}
