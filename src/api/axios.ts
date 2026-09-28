import { useAuthStore } from '@/store/authStore'
import axios, { AxiosInstance } from 'axios'

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getProxyBase(): string {
  const proxyUrl = import.meta.env.VITE_PROXY_URL as string | undefined
  if (proxyUrl) return proxyUrl.replace(/\/$/, '')
  // Dev: relative path, handled by Vite configureServer middleware
  return ''
}

/** Calls the proxy's /auth/refresh endpoint to get a new access token */
async function refreshAccessToken(): Promise<string> {
  const session = useAuthStore.getState().session
  if (!session?.refreshToken) throw new ApiError(401, 'Unauthorized', 'No refresh token')

  const base = getProxyBase()
  const res = await fetch(`${base}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  })

  if (!res.ok) {
    useAuthStore.getState().clearSession()
    throw new ApiError(401, 'Unauthorized', 'Token refresh failed — please reconnect')
  }

  const data = await res.json()
  useAuthStore.getState().updateTokens(data.access_token, data.refresh_token, data.expires_in)
  return data.access_token
}

export function createAxiosInstance(
  accessToken: string,
  cloudId: string
): AxiosInstance {
  const instance = axios.create({
    // All Jira REST calls go through /rest/... → proxied to api.atlassian.com
    baseURL: `${getProxyBase()}/rest/api/3`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // Proxy reads this to build the Atlassian API URL
      'x-cloud-id': cloudId,
    },
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status ?? 0
      const originalRequest = error.config

      // On 401, try refreshing the token once before giving up
      if (status === 401 && !originalRequest._retried) {
        originalRequest._retried = true
        try {
          const newToken = await refreshAccessToken()
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          originalRequest.headers['x-cloud-id'] = cloudId
          return instance(originalRequest)
        } catch {
          useAuthStore.getState().clearSession()
        }
      }

      const statusText = error.response?.statusText ?? 'Unknown'
      const message =
        error.response?.data?.errorMessages?.[0] ??
        error.response?.data?.message ??
        error.message ??
        'Request failed'
      return Promise.reject(new ApiError(status, statusText, message))
    }
  )

  return instance
}

export function getAxios(): AxiosInstance {
  const { session } = useAuthStore.getState()

  if (!session) {
    throw new ApiError(401, 'Unauthorized', 'Not authenticated')
  }

  // If token is about to expire, the interceptor will refresh on the first 401.
  // We could also proactively refresh here but the interceptor handles it lazily.
  return createAxiosInstance(session.accessToken, session.cloudId)
}
