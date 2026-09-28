import { AppShell } from '@/components/layout/AppShell'
import { SettingsPage } from '@/components/layout/SettingsPage'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  const hasCredentials = useAuthStore((s) => s.hasCredentials())

  if (!hasCredentials) {
    return <SettingsPage />
  }

  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  )
}
