import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OAuthSession {
  accessToken: string
  refreshToken: string
  cloudId: string
  spaceUrl: string    // e.g. https://your-domain.atlassian.net (for links)
  expiresAt: number  // unix ms
}

interface AuthState {
  session: OAuthSession | null
  setSession: (session: OAuthSession) => void
  updateTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void
  clearSession: () => void
  isAuthenticated: () => boolean
  isTokenExpired: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,

      setSession: (session) => set({ session }),

      updateTokens: (accessToken, refreshToken, expiresIn) =>
        set((state) => ({
          session: state.session
            ? {
                ...state.session,
                accessToken,
                refreshToken,
                expiresAt: Date.now() + expiresIn * 1000,
              }
            : null,
        })),

      clearSession: () => set({ session: null }),

      isAuthenticated: () => !!get().session,

      isTokenExpired: () => {
        const { session } = get()
        if (!session) return true
        // Consider expired 60 seconds before actual expiry
        return Date.now() > session.expiresAt - 60_000
      },
    }),
    { name: 'jira-oauth-session' }
  )
)
