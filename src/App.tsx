import { Dashboard } from '@/components/dashboard/Dashboard'
import { OAuthCallback } from '@/components/auth/OAuthCallback'
import { LoginPage } from '@/components/layout/LoginPage'
import { AppShell } from '@/components/layout/AppShell'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  // Handle the OAuth callback route (/callback or /jira-time-tracker/callback)
  const path = window.location.pathname
  if (path.endsWith('/callback') || path.includes('/callback?')) {
    return <OAuthCallback />
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  )
}
