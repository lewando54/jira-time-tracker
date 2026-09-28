import { cn } from '@/lib/utils'
import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'pl', label: 'PL' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language

  const handleChange = (code: string) => {
    void i18n.changeLanguage(code)
    localStorage.setItem('language', code)
  }

  return (
    <div className="flex items-center gap-2">
      <Languages className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
      <div className="flex items-center rounded-md overflow-hidden border border-[var(--color-border)]">
        {LANGUAGES.map((lang, i) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={cn(
              'h-7 px-3 text-xs font-semibold tracking-wide transition-colors',
              i > 0 && 'border-l border-[var(--color-border)]',
              current === lang.code
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
            )}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  )
}
