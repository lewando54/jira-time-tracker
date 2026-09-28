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

/**
 * In development, requests go to /rest/api/3/... and the Vite dev server
 * proxies them to Jira (see vite.config.ts configureServer middleware).
 *
 * In production (GitHub Pages), requests go to the Cloudflare Worker URL
 * set via VITE_PROXY_URL at build time, e.g.:
 *   https://jira-time-tracker-proxy.\<subdomain\>.workers.dev/rest/api/3/...
 *
 * Both paths send x-jira-url and Authorization headers — the dev proxy and
 * the Worker both read these to know where to forward the request.
 */
function getBaseUrl(): string {
  const proxyUrl = import.meta.env.VITE_PROXY_URL as string | undefined
  if (proxyUrl) {
    // Strip trailing slash, append the Jira REST path
    return proxyUrl.replace(/\/$/, '') + '/rest/api/3'
  }
  // Dev: relative path handled by Vite configureServer middleware
  return '/rest/api/3'
}

export function createAxiosInstance(
  spaceUrl: string,
  email: string,
  apiToken: string
): AxiosInstance {
  const token = btoa(`${email}:${apiToken}`)

  const instance = axios.create({
    baseURL: getBaseUrl(),
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // Read by both the Vite dev proxy and the Cloudflare Worker to know
      // which Jira instance to forward the request to.
      'x-jira-url': spaceUrl,
    },
  })

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status ?? 0
      const url: string = error.config?.url ?? ''

      // Only force logout when the auth endpoint itself rejects credentials
      if (status === 401 && url.includes('/myself')) {
        useAuthStore.getState().clearCredentials()
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
  const { credentials } = useAuthStore.getState()
  if (!credentials) {
    throw new ApiError(401, 'Unauthorized', 'No credentials configured')
  }
  return createAxiosInstance(
    credentials.spaceUrl,
    credentials.email,
    credentials.apiToken
  )
}
