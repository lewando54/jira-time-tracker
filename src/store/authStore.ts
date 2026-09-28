import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthCredentials {
  spaceUrl: string
  email: string
  apiToken: string
}

interface AuthState {
  credentials: AuthCredentials | null
  setCredentials: (credentials: AuthCredentials) => void
  clearCredentials: () => void
  hasCredentials: () => boolean
}

const getEnvDefaults = (): AuthCredentials | null => {
  const spaceUrl = import.meta.env.VITE_JIRA_URL as string | undefined
  const email = import.meta.env.VITE_JIRA_EMAIL as string | undefined
  const apiToken = import.meta.env.VITE_JIRA_API_TOKEN as string | undefined
  if (spaceUrl && email && apiToken) {
    return { spaceUrl, email, apiToken }
  }
  return null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      credentials: getEnvDefaults(),
      setCredentials: (credentials) => set({ credentials }),
      clearCredentials: () => set({ credentials: null }),
      hasCredentials: () => {
        const { credentials } = get()
        return !!(credentials?.spaceUrl && credentials?.email && credentials?.apiToken)
      },
    }),
    {
      name: 'jira-auth',
      // Don't persist env-seeded credentials — only user-entered ones
      partialize: (state) => ({ credentials: state.credentials }),
    }
  )
)
